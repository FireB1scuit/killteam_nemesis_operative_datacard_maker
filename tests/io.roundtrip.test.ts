// @vitest-environment node
import { PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { deflateSync } from "node:zlib";
import { exampleBuild } from "../src/model/examples";
import { buildToJson } from "../src/io/exportCards";
import { importBytes } from "../src/io/importFile";
import { buildPdf, readPdfBuildJson, type PdfFonts, type PdfLayout } from "../src/io/pdf";
import { readFileSync } from "node:fs";
import { deriveCard } from "../src/model/derive";
import { weaponRuleReference } from "../src/model/weaponRules";
import { WEAPON_RULE_GLOSSARY } from "../src/data/weaponRules";
import { readPngText, writePngText } from "../src/io/pngText";

/** A valid 2×1 RGBA PNG built from scratch (signature, IHDR, IDAT, IEND). */
function tinyPng(): Uint8Array {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (b: Uint8Array) => {
    let c = 0xffffffff;
    for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Uint8Array) => {
    const out = new Uint8Array(12 + data.length);
    const dv = new DataView(out.buffer);
    dv.setUint32(0, data.length);
    out.set(new TextEncoder().encode(type), 4);
    out.set(data, 8);
    dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
    return out;
  };
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, 2);
  dv.setUint32(4, 1);
  ihdr.set([8, 6, 0, 0, 0], 8);
  const raw = new Uint8Array([0, 255, 0, 0, 255, 0, 0, 255, 255]);
  const parts = [
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", new Uint8Array(deflateSync(raw))),
    chunk("IEND", new Uint8Array()),
  ];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

const font = (f: string) => new Uint8Array(readFileSync(new URL(`../public/fonts/${f}`, import.meta.url)));
const FONTS: PdfFonts = {
  regular: font("roboto-condensed-latin-400-normal.woff"),
  bold: font("roboto-condensed-latin-700-normal.woff"),
  heading: font("oswald-latin-500-normal.woff"),
};
const strip = (b: object) => ({ ...b, createdWith: "" });

const withImage = (rulesOn = false) => {
  const b = exampleBuild("screamer-killer");
  b.options = { weaponRulesOnPdf: rulesOn }; // non-default value: proves the option round-trips
  b.image = { dataUrl: "data:image/webp;base64,UklGRhIAAABXRUJQVlA4", x: 40, y: 30, zoom: 1.5 };
  b.moniker = "Thé Deathdirge ‘of’ Varl ★"; // non-ASCII survives
  return b;
};

describe("PNG iTXt", () => {
  it("writes and reads build JSON, replacing an older chunk", () => {
    const png = tinyPng();
    const once = writePngText(png, "first");
    const twice = writePngText(once, "second ✓");
    expect(readPngText(twice)).toBe("second ✓");
    expect(twice.length - once.length).toBe(new TextEncoder().encode("second ✓").length - "first".length);
    expect(readPngText(png)).toBeUndefined();
  });

  it.each([true, false])("round-trips a build through importBytes (weaponRulesOnPdf=%s)", async (on) => {
    const b = withImage(on);
    const png = writePngText(tinyPng(), buildToJson(b));
    const back = await importBytes("card.png", png);
    expect(strip(back)).toEqual(strip(b));
    expect(back.options?.weaponRulesOnPdf).toBe(on);
  });

  it("rejects a PNG without build data", async () => {
    await expect(importBytes("photo.png", tinyPng())).rejects.toThrow(/wasn't exported by Nemesis Datacard Maker/);
  });
});

describe("PDF", () => {
  const layouts: [PdfLayout, "a4" | "letter", number][] = [
    ["cards", "a4", 2],
    ["sheet", "a4", 1],
    ["sheet", "letter", 1],
    ["duplex", "a4", 2],
    ["rules", "a4", 1],
    ["rules", "letter", 1],
    ["rules-duplex", "a4", 2],
  ];
  it.each(layouts)("embeds and reads back the build (%s, %s)", async (layout, paper, pages) => {
    const b = withImage(layout.startsWith("rules"));
    const rules = weaponRuleReference(deriveCard(b));
    const pdf = await buildPdf({ cards: [tinyPng(), tinyPng()], buildJson: buildToJson(b), layout, paper, title: "Test", rules, fonts: FONTS, footerLeft: "Test" });
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(pages);
    const { width, height } = doc.getPage(0).getSize();
    const mm = (pt: number) => pt / (72 / 25.4);
    if (layout === "cards") {
      expect(mm(width)).toBeCloseTo(120, 3);
      expect(mm(height)).toBeCloseTo(70, 3);
    } else {
      expect(mm(width)).toBeCloseTo(paper === "a4" ? 210 : 215.9, 1);
      expect(mm(height)).toBeCloseTo(paper === "a4" ? 297 : 279.4, 1);
    }
    const back = await importBytes("x.pdf", pdf);
    expect(strip(back)).toEqual(strip(b));
    expect(back.options?.weaponRulesOnPdf).toBe(layout.startsWith("rules"));
  });

  it("sets the weapon rules as real text with the embedded fonts, continuing on a new page when needed", async () => {
    const b = exampleBuild("screamer-killer");
    const all = WEAPON_RULE_GLOSSARY.map(({ term, text, source }) => ({ term, text, source }));
    const pdf = await buildPdf({ cards: [tinyPng(), tinyPng()], buildJson: buildToJson(b), layout: "rules", paper: "a4", title: "T", rules: all, fonts: FONTS });
    const doc = await PDFDocument.load(pdf);
    expect(doc.getPageCount()).toBe(2); // all 22 rules don't fit under two cards
    const baseFonts = doc.context
      .enumerateIndirectObjects()
      .map(([, obj]) => (obj instanceof PDFDict ? obj.get(PDFName.of("BaseFont")) : undefined))
      .filter(Boolean)
      .map(String);
    expect(baseFonts.some((f) => /RobotoCondensed-Regular/.test(f))).toBe(true);
    expect(baseFonts.some((f) => /RobotoCondensed-Bold/.test(f))).toBe(true);
    expect(baseFonts.some((f) => /Oswald/.test(f))).toBe(true);
    await expect(buildPdf({ cards: [tinyPng()], buildJson: "{}", layout: "rules", title: "T", rules: all })).rejects.toThrow(/Fonts/);
  });

  it("falls back to the Info key when the attachment is missing", async () => {
    const b = exampleBuild("redemptor-dreadnought");
    const pdf = await buildPdf({ cards: [tinyPng()], buildJson: buildToJson(b), layout: "cards", title: "Test" });
    // Strip the EmbeddedFiles name tree and re-save.
    const doc = await PDFDocument.load(pdf);
    doc.catalog.delete(PDFName.of("Names"));
    const stripped = await doc.save({ updateFieldAppearances: false });
    const json = await readPdfBuildJson(stripped);
    expect(json && JSON.parse(json).name).toBe("Redemptor Dreadnought");
  });

  it("rejects a PDF that wasn't made by the app", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    await expect(importBytes("other.pdf", await doc.save())).rejects.toThrow(/wasn't exported/);
  });
});

describe("JSON", () => {
  it("round-trips and reports bad files", async () => {
    const b = exampleBuild("xv8-crisis-battlesuit");
    const back = await importBytes("save.json", new TextEncoder().encode(JSON.stringify(b)));
    expect(back).toEqual(b);
    await expect(importBytes("save.json", new TextEncoder().encode("{not json"))).rejects.toThrow(/valid JSON/);
    await expect(importBytes("save.json", new TextEncoder().encode('{"a":1}'))).rejects.toThrow(/wasn't exported/);
    await expect(importBytes("notes.txt", new TextEncoder().encode("hello"))).rejects.toThrow(/Unsupported/);
  });
});
