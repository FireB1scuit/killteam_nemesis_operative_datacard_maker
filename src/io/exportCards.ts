import { CONFIG } from "../config";
import type { NemesisBuild } from "../model/schema";
import { buildPdf, type PdfLayout } from "./pdf";
import { writePngText } from "./pngText";
import { renderToPng } from "./renderCard";

export type PngWhich = "1" | "2" | "both";

/** Serialise the build for embedding (stamped with the app version that exported it). */
export function buildToJson(build: NemesisBuild): string {
  return JSON.stringify({ ...build, createdWith: typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev" });
}

/** Render a DOM node (a card, or the two-card row) to PNG bytes at CONFIG.pngPixelRatio. */
export function renderNodePng(node: HTMLElement, pixelRatio: number = CONFIG.pngPixelRatio): Promise<Uint8Array> {
  return renderToPng(node, pixelRatio);
}

/** PNG with the build JSON embedded in an iTXt chunk. */
export async function exportPng(node: HTMLElement, build: NemesisBuild): Promise<Blob> {
  const png = await renderNodePng(node);
  const withData = writePngText(png, buildToJson(build));
  return new Blob([withData as BlobPart], { type: "image/png" });
}

/** PDF with both cards (layout per CONFIG / user choice), build JSON attached. */
export async function exportPdf(cards: HTMLElement[], build: NemesisBuild, layout: PdfLayout): Promise<Blob> {
  const pngs: Uint8Array[] = [];
  for (const c of cards) pngs.push(await renderNodePng(c));
  const title = `${build.name || "Nemesis operative"} – Nemesis datacard`;
  const pdf = await buildPdf(pngs, buildToJson(build), layout, title);
  return new Blob([pdf as BlobPart], { type: "application/pdf" });
}
