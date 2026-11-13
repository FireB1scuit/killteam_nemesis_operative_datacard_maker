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
  type PDFFont,
  type PDFPage,
} from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { CONFIG } from "../config";

export const PDF_ATTACHMENT = "nemesis-build.json";
export const PDF_INFO_KEY = "NemesisBuild";

const MM = 72 / 25.4;

/**
 * PDF layouts (plan.md §5.2, §8.7, §8.8):
 *  - "cards":        one card per page, page = card size (120×70 mm)            [default, weapon rules off]
 *  - "sheet":        A4/Letter print sheet, both cards stacked, cut marks
 *  - "duplex":       A4/Letter, card 1 on page 1, card 2 in the mirrored position on page 2 (print double-sided)
 *  - "rules":        A4/Letter, both cards on top, cut line, WEAPON RULES below   [default, weapon rules on]
 *  - "rules-duplex": A4/Letter, card 1 + WEAPON RULES on page 1, card 2 mirrored on page 2
 */
export type PdfLayout = "cards" | "sheet" | "duplex" | "rules" | "rules-duplex";
export type Paper = "a4" | "letter";

export const PAPER: Record<Paper, { w: number; h: number; label: string }> = {
  a4: { w: 210, h: 297, label: "A4" },
  letter: { w: 215.9, h: 279.4, label: "Letter" },
};

export const usesWeaponRules = (layout: PdfLayout) => layout === "rules" || layout === "rules-duplex";

/** The fonts used to set the weapon rules as real, selectable text (self-hosted woff2 bytes). */
export type PdfFonts = { regular: Uint8Array; bold: Uint8Array; heading: Uint8Array };

export type RuleEntry = { term: string; text: string; source: string };

export type PdfInput = {
  /** Card PNGs: [card 1, card 2], each rendered from the 1200×700 px card. */
  cards: Uint8Array[];
  buildJson: string;
  layout: PdfLayout;
  paper?: Paper;
  title: string;
  /** Weapon rules reference entries (alphabetical) for the "rules" layouts. */
  rules?: RuleEntry[];
  /** Required for the "rules" layouts. */
  fonts?: PdfFonts;
  /** Page footer (left) for the "rules" layouts, e.g. the operative's name. */
  footerLeft?: string;
};

const GREY = rgb(0.45, 0.45, 0.45);
const INK = rgb(0.1, 0.1, 0.1);
const ORANGE = rgb(0xe8 / 255, 0x64 / 255, 0x1c / 255);

/** Build the PDF and embed the build JSON as a file attachment plus a custom Info-dictionary key (fallback). */
export async function buildPdf(input: PdfInput): Promise<Uint8Array> {
  const { layout, paper = "a4" } = input;
  const doc = await PDFDocument.create();
  doc.setTitle(input.title);
  doc.setCreator("Nemesis Datacard Maker");
  doc.setProducer("Nemesis Datacard Maker (pdf-lib)");
  doc.setSubject("Kill Team Nemesis operative datacards (fan-made)");

  const cw = CONFIG.cardWidthMm * MM;
  const ch = CONFIG.cardHeightMm * MM;
  const images = await Promise.all(input.cards.map((c) => doc.embedPng(c)));
  const pw = PAPER[paper].w * MM;
  const ph = PAPER[paper].h * MM;
  const cx = (pw - cw) / 2;
  /** Long-edge flip: the back page mirrors x (cards are centred, so it lands in the same place). */
  const mirrorX = (x: number) => pw - x - cw;

  if (layout === "cards") {
    for (const img of images) {
      const page = doc.addPage([cw, ch]);
      page.drawImage(img, { x: 0, y: 0, width: cw, height: ch });
    }
  } else if (layout === "sheet") {
    const page = doc.addPage([pw, ph]);
    const gap = 10 * MM;
    const blockH = images.length * ch + (images.length - 1) * gap;
    let y = (ph + blockH) / 2 - ch;
    for (const img of images) {
      page.drawImage(img, { x: cx, y, width: cw, height: ch });
      drawCutMarks(page, cx, y, cw, ch);
      y -= ch + gap;
    }
    drawPrintHint(page);
  } else if (layout === "duplex") {
    const y = ph - 20 * MM - ch;
    images.forEach((img, i) => {
      const page = doc.addPage([pw, ph]);
      const x = i % 2 === 0 ? cx : mirrorX(cx);
      page.drawImage(img, { x, y, width: cw, height: ch });
      drawCutMarks(page, x, y, cw, ch);
      if (i === 0) drawPrintHint(page, "Print double-sided (flip on long edge) at 100% (actual size).");
    });
  } else {
    if (!input.fonts) throw new Error("Fonts are required for the weapon rules reference.");
    doc.registerFontkit(fontkit);
    const fonts: Fonts = {
      regular: await doc.embedFont(input.fonts.regular, { subset: true }),
      bold: await doc.embedFont(input.fonts.bold, { subset: true }),
      heading: await doc.embedFont(input.fonts.heading, { subset: true }),
    };
    const top = 12 * MM;
    const gap = 5 * MM;
    const duplex = layout === "rules-duplex";
    const front = duplex ? images.slice(0, 1) : images;
    const footer = input.footerLeft ?? "";

    const first = doc.addPage([pw, ph]);
    let y = ph - top;
    for (const img of front) {
      y -= ch;
      first.drawImage(img, { x: cx, y, width: cw, height: ch });
      y -= gap;
    }
    y -= 2 * MM;
    drawCutLine(first, fonts.regular, y, pw);
    y -= 8 * MM;

    layoutRules(doc, first, y, input.rules ?? [], fonts, pw, ph, footer);
    if (duplex && images[1]) {
      // Card 2 goes on the back of page 1 (mirrored position); continuation pages of the reference follow it.
      const back = doc.insertPage(1, [pw, ph]);
      back.drawImage(images[1], { x: mirrorX(cx), y: ph - top - ch, width: cw, height: ch });
      drawFooter(back, fonts.regular, pw, footer);
    }
  }

  const bytes = new Uint8Array(new TextEncoder().encode(input.buildJson)); // copy into this realm's Uint8Array
  await doc.attach(bytes, PDF_ATTACHMENT, {
    mimeType: "application/json",
    description: "Nemesis Datacard Maker build. Import this PDF in the app to keep editing.",
    creationDate: new Date(),
    modificationDate: new Date(),
  });
  const info = doc.context.lookup(doc.context.trailerInfo.Info, PDFDict);
  info.set(PDFName.of(PDF_INFO_KEY), PDFHexString.fromText(input.buildJson));

  return doc.save();
}

// ---------------------------------------------------------------------------------------------
// Weapon rules reference: rich-text word wrap into two balanced columns, continued on new pages
// ---------------------------------------------------------------------------------------------

type Fonts = { regular: PDFFont; bold: PDFFont; heading: PDFFont };
type Color = ReturnType<typeof rgb>;
export type Run = { text: string; font: PDFFont; color: Color };
type Line = Run[];

const BODY = 8.5; // pt
const LEADING = 11; // pt
const PARA_GAP = 4.5; // pt
const MARGIN = 15 * MM;
const COL_GAP = 8 * MM;
const FOOTER_SPACE = 14 * MM;

/** Greedy word wrap of styled runs to `width` pt. Same-style neighbours are merged so the PDF text stays selectable as phrases. */
export function wrapRuns(runs: Run[], width: number, size: number): Line[] {
  const words: { text: string; font: PDFFont; color: Color; spaceBefore: boolean }[] = [];
  let pendingSpace = false;
  for (const r of runs) {
    for (const part of r.text.split(/(\s+)/)) {
      if (!part) continue;
      if (/^\s+$/.test(part)) {
        pendingSpace = true;
        continue;
      }
      words.push({ text: part, font: r.font, color: r.color, spaceBefore: pendingSpace });
      pendingSpace = false;
    }
  }
  const lines: Line[] = [];
  let line: Line = [];
  let x = 0;
  for (const w of words) {
    const space = line.length && w.spaceBefore ? w.font.widthOfTextAtSize(" ", size) : 0;
    const ww = w.font.widthOfTextAtSize(w.text, size);
    if (line.length && x + space + ww > width) {
      lines.push(line);
      line = [];
      x = 0;
    }
    const text = line.length && w.spaceBefore ? ` ${w.text}` : w.text;
    const last = line[line.length - 1];
    if (last && last.font === w.font && last.color === w.color) last.text += text;
    else line.push({ text, font: w.font, color: w.color });
    x += (line.length && text.startsWith(" ") ? space : 0) + ww;
  }
  if (line.length) lines.push(line);
  return lines;
}

function entryLines(e: RuleEntry, fonts: Fonts, width: number): Line[] {
  const runs: Run[] = [
    { text: `${e.term}: `, font: fonts.bold, color: INK },
    { text: e.text, font: fonts.regular, color: INK },
  ];
  if (e.source !== "Lite Rules") runs.push({ text: ` (${e.source})`, font: fonts.regular, color: GREY });
  return wrapRuns(runs, width, BODY);
}

const blockHeight = (lines: number) => lines * LEADING;
const columnHeight = (col: Line[][]) => col.reduce((a, b, k) => a + blockHeight(b.length) + (k ? PARA_GAP : 0), 0);

/**
 * Split entries into two columns of at most `avail` pt. Balanced (shortest column height that fits, entries
 * kept whole) when everything fits on this page; otherwise both columns are filled to `avail`, splitting an
 * entry between lines where needed, and the rest is returned for the next page.
 */
export function fillColumns(blocks: Line[][], avail: number): { cols: Line[][][]; rest: Line[][] } {
  const total = columnHeight(blocks);
  if (total <= 2 * avail) {
    for (let h = Math.max(LEADING, total / 2); h <= avail + 0.01; h += 1) {
      let i = 0;
      const col1: Line[][] = [];
      while (i < blocks.length && columnHeight([...col1, blocks[i]]) <= h) col1.push(blocks[i++]);
      const col2 = blocks.slice(i);
      if ((col1.length || !blocks.length) && columnHeight(col2) <= h) return { cols: [col1, col2], rest: [] };
    }
  }
  const queue = blocks.map((b) => [...b]);
  const cols: Line[][][] = [[], []];
  for (const col of cols) {
    let used = 0;
    while (queue.length) {
      const gap = col.length ? PARA_GAP : 0;
      const room = Math.floor((avail - used - gap) / LEADING);
      if (room <= 0) break;
      const block = queue[0];
      if (block.length <= room) {
        col.push(block);
        queue.shift();
        used += gap + blockHeight(block.length);
      } else {
        if (room < 2 && col.length) break; // no lone line at a column bottom
        col.push(block.slice(0, room));
        queue[0] = block.slice(room);
        break;
      }
    }
  }
  return { cols, rest: queue };
}

function drawLines(page: PDFPage, lines: Line[], x: number, yTop: number): number {
  let y = yTop;
  for (const line of lines) {
    y -= LEADING;
    let lx = x;
    for (const run of line) {
      page.drawText(run.text, { x: lx, y: y + 2.5, size: BODY, font: run.font, color: run.color });
      lx += run.font.widthOfTextAtSize(run.text, BODY);
    }
  }
  return y;
}

function layoutRules(doc: PDFDocument, firstPage: PDFPage, yStart: number, entries: RuleEntry[], fonts: Fonts, pw: number, ph: number, footer: string) {
  const colW = (pw - 2 * MARGIN - COL_GAP) / 2;
  let blocks = entries.map((e) => entryLines(e, fonts, colW));
  let page = firstPage;
  let y = yStart;
  let continued = false;
  for (;;) {
    // Heading: WEAPON RULES + right-aligned source note + orange rule.
    const headSize = 17;
    page.drawText(continued ? "WEAPON RULES (CONTINUED)" : "WEAPON RULES", { x: MARGIN, y: y - headSize * 0.8, size: headSize, font: fonts.heading, color: INK });
    const note = entries.length ? "Weapon rules used on these cards · Kill Team Lite Rules" : "No weapon rules on these cards";
    page.drawText(note, { x: pw - MARGIN - fonts.regular.widthOfTextAtSize(note, 7.5), y: y - headSize * 0.8, size: 7.5, font: fonts.regular, color: GREY });
    y -= headSize + 2;
    page.drawRectangle({ x: MARGIN, y: y - 1.2, width: pw - 2 * MARGIN, height: 1.4, color: ORANGE });
    y -= 6;

    const { cols, rest } = fillColumns(blocks, y - FOOTER_SPACE);
    cols.forEach((col, i) => {
      let cy = y;
      col.forEach((block, k) => {
        if (k) cy -= PARA_GAP;
        cy = drawLines(page, block, MARGIN + i * (colW + COL_GAP), cy);
      });
    });
    drawFooter(page, fonts.regular, pw, footer);
    if (!rest.length) break;
    blocks = rest;
    page = doc.addPage([pw, ph]);
    y = ph - 15 * MM;
    continued = true;
  }
}

function drawFooter(page: PDFPage, font: PDFFont, pw: number, left: string) {
  const size = 7;
  const y = 9 * MM;
  if (left) page.drawText(left, { x: MARGIN, y, size, font, color: GREY });
  const right = "Fan-made, not affiliated with Games Workshop. Print at 100% (actual size).";
  page.drawText(right, { x: pw - MARGIN - font.widthOfTextAtSize(right, size), y, size, font, color: GREY });
}

/** Dashed cut line with a small drawn scissors (not a font glyph) and a label. */
function drawCutLine(page: PDFPage, font: PDFFont, y: number, pw: number) {
  const x0 = MARGIN;
  page.drawCircle({ x: x0 + 1.6, y: y + 1.7, size: 1.3, borderColor: GREY, borderWidth: 0.6 });
  page.drawCircle({ x: x0 + 1.6, y: y - 1.7, size: 1.3, borderColor: GREY, borderWidth: 0.6 });
  page.drawLine({ start: { x: x0 + 2.7, y: y + 1 }, end: { x: x0 + 8, y: y - 1.9 }, thickness: 0.6, color: GREY });
  page.drawLine({ start: { x: x0 + 2.7, y: y - 1 }, end: { x: x0 + 8, y: y + 1.9 }, thickness: 0.6, color: GREY });
  const label = "cut along card edges";
  page.drawText(label, { x: x0 + 11, y: y - 2.6, size: 8, font, color: GREY });
  const start = x0 + 15 + font.widthOfTextAtSize(label, 8);
  page.drawLine({ start: { x: start, y }, end: { x: pw - MARGIN, y }, thickness: 0.5, color: rgb(0.6, 0.6, 0.6), dashArray: [2, 2] });
}

function drawPrintHint(page: PDFPage, text = `Print at 100% (actual size). Card: ${CONFIG.cardWidthMm} × ${CONFIG.cardHeightMm} mm.`) {
  page.drawText(text, { x: 12 * MM, y: 8 * MM, size: 7, color: GREY });
}

function drawCutMarks(page: PDFPage, x: number, y: number, w: number, h: number) {
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
