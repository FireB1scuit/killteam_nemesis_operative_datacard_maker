/**
 * Minimal PNG text-chunk codec: write an uncompressed iTXt chunk (UTF-8) before IEND, and read
 * iTXt / tEXt chunks back. No dependencies.
 */

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
export const PNG_KEYWORD = "nemesis-datacard";

let CRC_TABLE: Uint32Array | undefined;
function crc32(bytes: Uint8Array): number {
  if (!CRC_TABLE) {
    CRC_TABLE = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC_TABLE[n] = c >>> 0;
    }
  }
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function isPng(b: Uint8Array) {
  return b.length > 8 && SIGNATURE.every((v, i) => b[i] === v);
}

type Chunk = { type: string; start: number; dataStart: number; length: number; end: number };

function* chunks(b: Uint8Array): Generator<Chunk> {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let p = 8;
  while (p + 12 <= b.length) {
    const length = view.getUint32(p);
    const type = String.fromCharCode(b[p + 4], b[p + 5], b[p + 6], b[p + 7]);
    const end = p + 12 + length;
    if (end > b.length) return;
    yield { type, start: p, dataStart: p + 8, length, end };
    p = end;
  }
}

/** Insert (or replace) an iTXt chunk with the given keyword. */
export function writePngText(png: Uint8Array, text: string, keyword = PNG_KEYWORD): Uint8Array {
  if (!isPng(png)) throw new Error("Not a PNG file");
  const enc = new TextEncoder();
  const kw = enc.encode(keyword);
  const body = enc.encode(text);
  // keyword \0 compressionFlag(0) compressionMethod(0) languageTag \0 translatedKeyword \0 text
  const data = new Uint8Array(kw.length + 5 + body.length);
  data.set(kw, 0);
  let o = kw.length;
  data[o++] = 0; // null separator
  data[o++] = 0; // uncompressed
  data[o++] = 0; // method
  data[o++] = 0; // empty language tag
  data[o++] = 0; // empty translated keyword
  data.set(body, o);

  const typeAndData = new Uint8Array(4 + data.length);
  typeAndData.set(enc.encode("iTXt"), 0);
  typeAndData.set(data, 4);
  const chunk = new Uint8Array(12 + data.length);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, data.length);
  chunk.set(typeAndData, 4);
  dv.setUint32(8 + data.length, crc32(typeAndData));

  // Copy all chunks except an existing chunk with our keyword; insert ours before IEND.
  const parts: Uint8Array[] = [png.subarray(0, 8)];
  for (const c of chunks(png)) {
    if (c.type === "IEND") parts.push(chunk);
    if ((c.type === "iTXt" || c.type === "tEXt") && readKeyword(png, c) === keyword) continue;
    parts.push(png.subarray(c.start, c.end));
  }
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) {
    out.set(p, pos);
    pos += p.length;
  }
  return out;
}

function readKeyword(b: Uint8Array, c: Chunk): string {
  let i = c.dataStart;
  const stop = c.dataStart + Math.min(c.length, 80);
  while (i < stop && b[i] !== 0) i++;
  return new TextDecoder("latin1").decode(b.subarray(c.dataStart, i));
}

/** Read the text stored under `keyword` (uncompressed iTXt or tEXt), or undefined. */
export function readPngText(png: Uint8Array, keyword = PNG_KEYWORD): string | undefined {
  if (!isPng(png)) return undefined;
  for (const c of chunks(png)) {
    if (c.type !== "iTXt" && c.type !== "tEXt") continue;
    if (readKeyword(png, c) !== keyword) continue;
    const data = png.subarray(c.dataStart, c.dataStart + c.length);
    let p = keyword.length + 1;
    if (c.type === "tEXt") return new TextDecoder("latin1").decode(data.subarray(p));
    const compressed = data[p];
    p += 2;
    while (p < data.length && data[p] !== 0) p++; // language tag
    p++;
    while (p < data.length && data[p] !== 0) p++; // translated keyword
    p++;
    if (compressed) return undefined; // we never write compressed chunks
    return new TextDecoder("utf-8").decode(data.subarray(p));
  }
  return undefined;
}

export function isPngBytes(b: Uint8Array) {
  return isPng(b);
}
