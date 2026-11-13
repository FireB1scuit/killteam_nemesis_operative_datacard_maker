import { CONFIG } from "../config";
import { deriveCard } from "../model/derive";
import type { NemesisBuild } from "../model/schema";
import { weaponRuleReference } from "../model/weaponRules";
import type { Paper, PdfFonts, PdfLayout } from "./pdf";
import { writePngText } from "./pngText";
import { renderToPng } from "./renderCard";

export type PngWhich = "1" | "2" | "both" | "stacked";

/** Serialise the build for embedding (stamped with the app version that exported it). */
export function buildToJson(build: NemesisBuild): string {
  return JSON.stringify({ ...build, createdWith: typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev" });
}

/** Render a DOM node (a card, or the two-card row) to PNG bytes at CONFIG.pngPixelRatio. */
export function renderNodePng(node: HTMLElement, pixelRatio: number = CONFIG.pngPixelRatio): Promise<Uint8Array> {
  return renderToPng(node, pixelRatio);
}

/** PNG with the build JSON embedded in an iTXt chunk. PNGs never include the weapon rules reference. */
export async function exportPng(node: HTMLElement, build: NemesisBuild): Promise<Blob> {
  const png = await renderNodePng(node);
  const withData = writePngText(png, buildToJson(build));
  return new Blob([withData as BlobPart], { type: "image/png" });
}

/** WOFF (zlib) copies of the self-hosted fonts: fontkit can't reliably subset glyphs decoded from WOFF2. */
const FONT_FILES = {
  regular: "fonts/roboto-condensed-latin-400-normal.woff",
  bold: "fonts/roboto-condensed-latin-700-normal.woff",
  heading: "fonts/oswald-latin-500-normal.woff",
} as const;

let fontsPromise: Promise<PdfFonts> | undefined;

/** The self-hosted fonts for the PDF text (fetched once from /fonts). */
export function loadPdfFonts(): Promise<PdfFonts> {
  fontsPromise ??= (async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const get = async (file: string) => {
      const res = await fetch(base + file);
      if (!res.ok) throw new Error(`Font ${file} could not be loaded (${res.status}).`);
      return new Uint8Array(await res.arrayBuffer());
    };
    const [regular, bold, heading] = await Promise.all([get(FONT_FILES.regular), get(FONT_FILES.bold), get(FONT_FILES.heading)]);
    return { regular, bold, heading };
  })().catch((e) => {
    fontsPromise = undefined;
    throw e;
  });
  return fontsPromise;
}

export function pdfFooter(build: NemesisBuild): string {
  const name = build.name.trim() || "Nemesis operative";
  return `${name}${build.moniker?.trim() ? ` ‘${build.moniker.trim()}’` : ""} · Nemesis Datacard Maker`;
}

/** PDF with both cards (layout per user choice) and, for the "rules" layouts, the weapon rules reference. Build JSON attached. */
export async function exportPdf(cards: HTMLElement[], build: NemesisBuild, layout: PdfLayout, paper: Paper): Promise<Blob> {
  const pngs: Uint8Array[] = [];
  for (const c of cards) pngs.push(await renderNodePng(c));
  const { buildPdf, usesWeaponRules } = await import("./pdf"); // pdf-lib is loaded on demand
  const withRules = usesWeaponRules(layout);
  const pdf = await buildPdf({
    cards: pngs,
    buildJson: buildToJson(build),
    layout,
    paper,
    title: `${build.name || "Nemesis operative"} – Nemesis datacard`,
    ...(withRules
      ? {
          rules: weaponRuleReference(deriveCard(build)).map(({ term, text, source }) => ({ term, text, source })),
          fonts: await loadPdfFonts(),
          footerLeft: pdfFooter(build),
        }
      : {}),
  });
  return new Blob([pdf as BlobPart], { type: "application/pdf" });
}
