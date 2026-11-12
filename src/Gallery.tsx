import { useEffect, useRef, useState } from "react";
import { CardPair } from "./card/CardPair";
import { renderNodePng } from "./io/exportCards";
import { deriveCard } from "./model/derive";
import { ALL_FIXTURES } from "./model/fixtures";

/** Dev page (?gallery[=id]): renders fixtures at 1:1 for screenshot checks. */
export default function Gallery({ only }: { only?: string }) {
  const list = only ? ALL_FIXTURES.filter((f) => f.id === only) : ALL_FIXTURES;
  // Optional test picture: ?img=<data url>&x=50&y=50&zoom=1
  const q = new URLSearchParams(window.location.search);
  const img = q.get("img");
  const testImage = img?.startsWith("data:image/")
    ? { dataUrl: img, x: Number(q.get("x") ?? 50), y: Number(q.get("y") ?? 50), zoom: Number(q.get("zoom") ?? 1) }
    : undefined;
  if (q.has("export") && list[0]) return <ExportCheck build={list[0].build} image={testImage ?? list[0].build.image} />;
  return (
    <div style={{ background: "#555", padding: 40, display: "flex", flexDirection: "column", gap: 40, minHeight: "100vh" }}>
      {list.map((f) => (
        <section key={f.id}>
          <h2 style={{ color: "#eee", font: "500 18px Oswald, sans-serif", margin: "0 0 12px" }}>{f.label}</h2>
          <CardPair model={deriveCard(f.build)} image={testImage ?? f.build.image} highlight shadow />
        </section>
      ))}
    </div>
  );
}

/** ?gallery=<id>&export=1 renders both cards through the real PNG exporter and shows the result. */
function ExportCheck({ build, image }: { build: (typeof ALL_FIXTURES)[number]["build"]; image?: Parameters<typeof CardPair>[0]["image"] }) {
  const c1 = useRef<HTMLDivElement>(null);
  const c2 = useRef<HTMLDivElement>(null);
  const [urls, setUrls] = useState<string[]>([]);
  const [err, setErr] = useState<string>();
  useEffect(() => {
    const t = window.setTimeout(async () => {
      try {
        const out: string[] = [];
        for (const n of [c1.current, c2.current]) {
          const png = await renderNodePng(n!, 1);
          out.push(URL.createObjectURL(new Blob([png as BlobPart], { type: "image/png" })));
        }
        setUrls(out);
      } catch (e) {
        setErr(String(e));
      }
    }, 300);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div style={{ background: "#2a6", padding: 20, minHeight: "100vh" }}>
      <div style={{ position: "fixed", left: -20000, top: 0 }}>
        <CardPair model={deriveCard(build)} image={image} card1Ref={c1} card2Ref={c2} />
      </div>
      {err && <pre style={{ color: "#fff" }}>{err}</pre>}
      <div id="export-result" data-ready={urls.length ? "1" : "0"} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {urls.map((u) => <img key={u} src={u} alt="" style={{ width: 1200, height: 700 }} />)}
      </div>
    </div>
  );
}
