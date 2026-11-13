export const MAX_IMAGE_EDGE = 1600;
export const ACCEPTED_IMAGE_TYPES = [
  "image/png", "image/jpeg", "image/webp", "image/gif", "image/avif", "image/bmp", "image/svg+xml",
  "image/x-icon", "image/vnd.microsoft.icon", "image/heic", "image/heif", "image/tiff", "image/apng",
];

/** Extensions we treat as pictures when the browser/OS doesn't report a MIME type (iOS, some Windows setups). */
const IMAGE_EXT = /\.(jpe?g|jfif|pjpeg|pjp|png|apng|webp|gif|avif|bmp|dib|svgz?|ico|heic|heif|tiff?)$/i;

/** iOS sometimes reports an empty MIME type, so fall back to the file extension. */
export function looksLikeImage(file: { type: string; name?: string }): boolean {
  if (file.type.startsWith("image/")) return true;
  return (!file.type || file.type === "application/octet-stream") && IMAGE_EXT.test(file.name ?? "");
}

/** Formats most non-Apple browsers can't decode; used to give a helpful error. */
const SAFARI_ONLY_EXT = /\.(heic|heif|tiff?)$/i;
const SAFARI_ONLY_TYPE = /^image\/(heic|heif|tiff)/i;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("This image couldn't be read."));
    img.src = src;
  });
}

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

/**
 * Downscale an uploaded picture to at most 1600 px on the long edge and re-encode it
 * (WebP at 0.85, JPEG fallback) so saved builds and exports stay small.
 */
export async function processImageFile(file: File): Promise<string> {
  if (!looksLikeImage(file)) throw new Error("Please choose an image file (JPG, PNG, WebP, HEIC, GIF, BMP, SVG…).");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url).catch((e: unknown) => {
      if (SAFARI_ONLY_EXT.test(file.name) || SAFARI_ONLY_TYPE.test(file.type)) {
        throw new Error("This browser can't open HEIC/TIFF pictures. Save or export it as JPG or PNG first (or use Safari).");
      }
      throw e;
    });
    const isVector = file.type === "image/svg+xml" || /\.svgz?$/i.test(file.name);
    // SVGs without width/height report 0×0 (or a tiny default): render them at full size instead.
    const nw = img.naturalWidth || MAX_IMAGE_EDGE;
    const nh = img.naturalHeight || MAX_IMAGE_EDGE;
    const scale = isVector ? MAX_IMAGE_EDGE / Math.max(nw, nh) : Math.min(1, MAX_IMAGE_EDGE / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return await readAsDataUrl(file);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    let out = canvas.toDataURL("image/webp", 0.85);
    if (!out.startsWith("data:image/webp")) {
      // No WebP encoder (older Safari): JPEG has no transparency, so put transparent pictures
      // (PNG, GIF, SVG, ICO) on the card's dark portrait background instead of black.
      ctx.globalCompositeOperation = "destination-over";
      ctx.fillStyle = "#1f1f1f";
      ctx.fillRect(0, 0, w, h);
      out = canvas.toDataURL("image/jpeg", 0.85);
    }
    return out;
  } finally {
    URL.revokeObjectURL(url);
  }
}
