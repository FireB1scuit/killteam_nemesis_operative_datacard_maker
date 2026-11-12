import {
  decodePDFRawStream,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFHexString,
  PDFName,
  PDFRawStream,
  PDFStream,
  PDFString,
  rgb,
} from "pdf-lib";
import { CONFIG } from "../config";

export const PDF_ATTACHMENT = "nemesis-build.json";
export const PDF_INFO_KEY = "NemesisBuild";

const MM = 72 / 25.4;
export type PdfLayout = "cards" | "sheet-a4" | "sheet-letter";

const SHEETS = {
  "sheet-a4": { w: 210, h: 297 },
  "sheet-letter": { w: 215.9, h: 279.4 },
} as const;

/**
 * Build a PDF from card PNGs (each rendered at 1200×700 css px) and embed the build JSON as a file
 * attachment plus a custom Info-dictionary key (fallback).
 *  - "cards": one card per page, page = card size (120×70 mm)
 *  - "sheet-*": portrait A4/Letter with the cards stacked at exact size and cut marks
 */
export async function buildPdf(cards: Uint8Array[], buildJson: string, layout: PdfLayout, title: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(title);
  doc.setCreator("Nemesis Datacard Maker");
  doc.setProducer("Nemesis Datacard Maker (pdf-lib)");
  doc.setSubject("Kill Team Nemesis operative datacards (fan-made)");

  const cw = CONFIG.cardWidthMm * MM;
  const ch = CONFIG.cardHeightMm * MM;
  const images = await Promise.all(cards.map((c) => doc.embedPng(c)));

  if (layout === "cards") {
    for (const img of images) {
      const page = doc.addPage([cw, ch]);
      page.drawImage(img, { x: 0, y: 0, width: cw, height: ch });
    }
  } else {
    const sheet = SHEETS[layout];
    const pw = sheet.w * MM;
    const ph = sheet.h * MM;
    const gap = 10 * MM;
    const perPage = Math.max(1, Math.floor((ph - 20 * MM + gap) / (ch + gap)));
    for (let i = 0; i < images.length; i += perPage) {
      const page = doc.addPage([pw, ph]);
      const group = images.slice(i, i + perPage);
      const blockH = group.length * ch + (group.length - 1) * gap;
      const x = (pw - cw) / 2;
      let y = (ph + blockH) / 2 - ch;
      for (const img of group) {
        page.drawImage(img, { x, y, width: cw, height: ch });
        drawCutMarks(page, x, y, cw, ch);
        y -= ch + gap;
      }
      page.drawText("Print at 100% (actual size). Card: " + `${CONFIG.cardWidthMm} × ${CONFIG.cardHeightMm} mm`, {
        x: 12 * MM, y: 8 * MM, size: 7, color: rgb(0.45, 0.45, 0.45),
      });
    }
  }

  const bytes = new Uint8Array(new TextEncoder().encode(buildJson)); // copy into this realm's Uint8Array
  await doc.attach(bytes, PDF_ATTACHMENT, {
    mimeType: "application/json",
    description: "Nemesis Datacard Maker build. Import this PDF in the app to keep editing.",
    creationDate: new Date(),
    modificationDate: new Date(),
  });
  const info = doc.context.lookup(doc.context.trailerInfo.Info, PDFDict);
  info.set(PDFName.of(PDF_INFO_KEY), PDFHexString.fromText(buildJson));

  return doc.save();
}

function drawCutMarks(page: import("pdf-lib").PDFPage, x: number, y: number, w: number, h: number) {
  const len = 5 * MM;
  const off = 1.5 * MM;
  const color = rgb(0, 0, 0);
  const thickness = 0.4;
  const line = (x1: number, y1: number, x2: number, y2: number) => page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
  for (const [cx, sx] of [[x, -1], [x + w, 1]] as const) {
    for (const [cy, sy] of [[y, -1], [y + h, 1]] as const) {
      line(cx + sx * off, cy, cx + sx * (off + len), cy); // horizontal
      line(cx, cy + sy * off, cx, cy + sy * (off + len)); // vertical
    }
  }
}

function decodeText(obj: unknown): string | undefined {
  if (obj instanceof PDFHexString || obj instanceof PDFString) return obj.decodeText();
  return undefined;
}

function streamBytes(stream: unknown): Uint8Array | undefined {
  if (stream instanceof PDFRawStream) return decodePDFRawStream(stream).decode();
  if (stream instanceof PDFStream) return stream.getContents();
  return undefined;
}

/** Find the embedded build JSON in a PDF: the attachment first, then the Info key. */
export async function readPdfBuildJson(data: Uint8Array): Promise<string | undefined> {
  const doc = await PDFDocument.load(data, { updateMetadata: false, ignoreEncryption: true });
  const ctx = doc.context;

  // 1. /Root /Names /EmbeddedFiles /Names [name filespec ...]
  try {
    const names = doc.catalog.lookupMaybe(PDFName.of("Names"), PDFDict);
    const ef = names?.lookupMaybe(PDFName.of("EmbeddedFiles"), PDFDict);
    const arr = ef?.lookupMaybe(PDFName.of("Names"), PDFArray);
    if (arr) {
      for (let i = 0; i + 1 < arr.size(); i += 2) {
        const name = decodeText(arr.lookup(i));
        if (name !== PDF_ATTACHMENT) continue;
        const spec = arr.lookup(i + 1, PDFDict);
        const efDict = spec.lookupMaybe(PDFName.of("EF"), PDFDict);
        const stream = efDict?.lookup(PDFName.of("F"));
        const bytes = streamBytes(stream);
        if (bytes) return new TextDecoder().decode(bytes);
      }
    }
  } catch {
    /* fall through to the Info key */
  }

  // 2. /Info /NemesisBuild
  try {
    const info = ctx.lookup(ctx.trailerInfo.Info);
    if (info instanceof PDFDict) return decodeText(info.lookup(PDFName.of(PDF_INFO_KEY)));
  } catch {
    /* none */
  }
  return undefined;
}
