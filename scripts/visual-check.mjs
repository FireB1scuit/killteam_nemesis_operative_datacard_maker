// Visual check helper (dev only). Needs `npm run build && npx vite preview --port 4173` running, Chrome, and
// optionally pdftoppm (Poppler/MiKTeX) to rasterise the PDFs.
//
//   node scripts/visual-check.mjs [outDir]
//
// Writes card screenshots (gallery fixtures), an editor screenshot (desktop + phone width) and exported PDFs
// (+ PNG renders of their pages) to outDir (default: docs/screenshots).
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE_URL ?? "http://localhost:4173/killteam_nemesis_operative_datacard_maker/";
const OUT = resolve(process.argv[2] ?? "docs/screenshots");
mkdirSync(OUT, { recursive: true });

const chrome = (args) =>
  execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--virtual-time-budget=8000", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "ignore"],
  });
const shot = (file, size, url) => chrome([`--screenshot=${resolve(OUT, file)}`, `--window-size=${size}`, url]);

// ONLY_PHONE=1 skips the card screenshots and PDFs (quick mobile-layout check).
const ONLY_PHONE = !!process.env.ONLY_PHONE;
if (!ONLY_PHONE) {
  for (const id of ["screamer-killer", "armoured-sentinel", "xv8-crisis-battlesuit", "redemptor-dreadnought", "worst-traits", "worst-rows", "worst-mixed", "worst-flow", "player"]) {
    shot(`card-${id}.png`, "1280,1540", `${BASE}?gallery=${id}`);
  }
  shot("app-desktop.png", "1500,1000", `${BASE}?example=screamer-killer`);
}

const pdfs = ONLY_PHONE ? [] : [
  ["screamer-killer", "rules", "a4"],
  ["screamer-killer", "cards", "a4"],
  ["screamer-killer", "rules-duplex", "a4"],
  ["xv8-crisis-battlesuit", "rules", "letter"],
  ["worst-traits", "rules", "a4"],
  ["worst-rows", "sheet", "a4"],
];
/** Open `url` in a headless Chrome over the DevTools protocol and poll `expr` until it returns a value. */
async function evalWhenReady(url, expr, timeoutMs = 60000, opts = {}) {
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, ["--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`, `--user-data-dir=${resolve(OUT, ".chrome-" + port)}`, "about:blank"], { stdio: "ignore" });
  try {
    let target;
    for (let i = 0; i < 50 && !target; i++) {
      await new Promise((r) => setTimeout(r, 200));
      target = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => undefined);
    }
    if (!target) throw new Error("Chrome did not start");
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r) => ws.addEventListener("open", r, { once: true }));
    let id = 0;
    const pending = new Map();
    ws.addEventListener("message", (e) => {
      const msg = JSON.parse(e.data);
      if (msg.id && pending.has(msg.id)) pending.get(msg.id)(msg);
    });
    const send = (method, params = {}) => new Promise((r) => { pending.set(++id, r); ws.send(JSON.stringify({ id, method, params })); });
    if (opts.mobile) {
      await send("Emulation.setDeviceMetricsOverride", { width: opts.mobile.width, height: opts.mobile.height, deviceScaleFactor: 2, mobile: true });
    }
    await send("Page.navigate", { url });
    if (opts.screenshot) {
      await new Promise((r) => setTimeout(r, 2500));
      const res = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      ws.close();
      return res.result?.data;
    }
    const end = Date.now() + timeoutMs;
    while (Date.now() < end) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
      const v = res.result?.result?.value;
      if (v) {
        ws.close();
        return v;
      }
    }
    ws.close();
    return undefined;
  } finally {
    proc.kill();
  }
}

// True phone-width viewport (headless windows can't be narrower than ~500px, so use device emulation).
const phone = await evalWhenReady(`${BASE}?example=screamer-killer`, "", 30000, { mobile: { width: 390, height: 1700 }, screenshot: true });
if (phone) writeFileSync(resolve(OUT, "app-phone.png"), Buffer.from(phone, "base64"));
const scrollW = await evalWhenReady(`${BASE}?example=screamer-killer`, "document.readyState === 'complete' && document.querySelector('.kt-card') ? String(document.documentElement.scrollWidth) : ''", 15000, { mobile: { width: 390, height: 844 } });
console.log("phone: document scrollWidth =", scrollW, "(viewport 390)");

for (const [id, layout, paper] of pdfs) {
  const name = `pdf-${id}-${layout}-${paper}`;
  const v = await evalWhenReady(
    `${BASE}?gallery=${id}&pdf=${layout}&paper=${paper}`,
    `(document.getElementById("pdf-b64")?.textContent || (document.getElementById("pdf-error") ? "ERR:" + document.getElementById("pdf-error").textContent : ""))`,
  );
  if (!v || v.startsWith("ERR:")) {
    console.error(`${name}: no PDF produced`, v ?? "(timeout)");
    continue;
  }
  const file = resolve(OUT, `${name}.pdf`);
  writeFileSync(file, Buffer.from(v, "base64"));
  try {
    execFileSync("pdftoppm", ["-png", "-r", "60", file, resolve(OUT, name)]);
  } catch {
    console.warn("pdftoppm not found: PDFs written without PNG renders");
  }
  console.log("wrote", file);
}
