import cardCss from "../card/card.css?raw";
import fontsCss from "../fonts.css?raw";

/*
 * DOM → PNG renderer. Like html-to-image it draws an SVG <foreignObject> onto a canvas, but instead of
 * copying every element's computed style inline (which html-to-image does, flooring font sizes and
 * changing line breaks), it serialises the card with the real card stylesheet and embedded fonts.
 * The export is therefore laid out by exactly the same CSS as the preview.
 */

let fontCssPromise: Promise<string> | undefined;

function toBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

/** fonts.css with every url(/fonts/x.woff2) replaced by a data: URL (fetched once). */
function embeddedFontCss(): Promise<string> {
  fontCssPromise ??= (async () => {
    const base = import.meta.env.BASE_URL ?? "/";
    const urls = [...new Set([...fontsCss.matchAll(/url\("?([^")]+)"?\)/g)].map((m) => m[1]))];
    let css = fontsCss;
    for (const u of urls) {
      const href = u.startsWith("/") ? base + u.slice(1) : u;
      const res = await fetch(href);
      if (!res.ok) throw new Error(`Font ${u} could not be loaded (${res.status}).`);
      css = css.split(u).join(`data:font/woff2;base64,${toBase64(await res.arrayBuffer())}`);
    }
    return css;
  })().catch((e) => {
    fontCssPromise = undefined;
    throw e;
  });
  return fontCssPromise;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The card could not be rendered to an image."));
    img.src = src;
  });
}

/** Render `node` (a card or the two-card row) to PNG bytes at `pixelRatio`. */
export async function renderToPng(node: HTMLElement, pixelRatio: number): Promise<Uint8Array> {
  await document.fonts?.ready;
  // Let the card flow / fitText re-run with the real font metrics before the DOM is captured.
  for (let i = 0; i < 4; i++) await new Promise((r) => requestAnimationFrame(() => r(undefined)));
  const width = node.offsetWidth;
  const height = node.offsetHeight;
  const fonts = await embeddedFontCss();

  const clone = node.cloneNode(true) as HTMLElement;
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  const markup = new XMLSerializer().serializeToString(clone);
  const html =
    `<div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;margin:0;padding:0">` +
    `<style>${fonts}\n${cardCss}</style>${markup}</div>`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<foreignObject x="0" y="0" width="100%" height="100%">${html}</foreignObject></svg>`;
  const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * pixelRatio);
  canvas.height = Math.round(height * pixelRatio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available in this browser.");

  // Draw twice: some browsers paint the first frame before embedded fonts are decoded.
  for (let pass = 0; pass < 2; pass++) {
    const img = await loadImage(src);
    await img.decode?.().catch(() => undefined);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  }
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) throw new Error("PNG encoding failed.");
  return new Uint8Array(await blob.arrayBuffer());
}
