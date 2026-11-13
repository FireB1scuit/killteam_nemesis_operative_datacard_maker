import { CONFIG } from "../config";

/** True if any [data-fit=body|abil] region inside the card overflows its box. */
export function cardOverflows(card: HTMLElement): boolean {
  const body = card.querySelector<HTMLElement>('[data-fit="body"]');
  const abil = card.querySelector<HTMLElement>('[data-fit="abil"]');
  if (body && body.scrollHeight > body.clientHeight + 1) return true;
  // multi-column overflow spills sideways into extra columns
  if (abil && abil.scrollWidth > abil.clientWidth + 1) return true;
  if (abil && abil.scrollHeight > abil.clientHeight + 1) return true;
  // Headroom: the PNG/PDF renderer (SVG foreignObject) can lay text out a pixel or two taller than the live
  // DOM; with balanced columns that pushes a block into a 3rd column off the card. Keep FIT_SLACK px spare.
  if (abil && abil.clientHeight > 0) {
    const box = abil.getBoundingClientRect();
    const scale = box.width / (abil.offsetWidth || box.width || 1) || 1; // the preview may be CSS-scaled
    for (const child of Array.from(abil.children)) {
      const r = child.getBoundingClientRect();
      if ((r.bottom - box.top) / scale > abil.clientHeight - FIT_SLACK) return true;
      if ((r.right - box.left) / scale > abil.clientWidth + 2) return true;
    }
  }
  return false;
}

/** Spare px (at 1x) kept below the last ability block. */
export const FIT_SLACK = 8;

/**
 * Shrink the card body font (--fs) until nothing overflows, down to CONFIG.minFontScale.
 * Returns the final scale. Works on the live DOM (call from a layout effect).
 */
export function fitCardBody(card: HTMLElement, step = 0.02): number {
  let scale = 1;
  card.style.setProperty("--fs", "1");
  while (cardOverflows(card) && scale - step >= CONFIG.minFontScale - 1e-9) {
    scale = Math.round((scale - step) * 1000) / 1000;
    card.style.setProperty("--fs", String(scale));
  }
  return scale;
}

/** Shrink a single-line element's font size until it fits its container width. */
export function fitLine(el: HTMLElement | null, maxPx: number, minPx: number) {
  if (!el) return;
  const parent = el.parentElement;
  if (!parent) return;
  el.style.fontSize = `${maxPx}px`;
  const avail = parent.clientWidth - parseFloat(getComputedStyle(parent).paddingLeft) - parseFloat(getComputedStyle(parent).paddingRight);
  let size = maxPx;
  while (el.scrollWidth > avail + 0.5 && size > minPx) {
    size -= 1;
    el.style.fontSize = `${size}px`;
  }
}

/** Fit name + moniker in the header. */
export function fitHeader(card: HTMLElement) {
  fitLine(card.querySelector<HTMLElement>('[data-fit="name"]'), 44, 24);
  fitLine(card.querySelector<HTMLElement>('[data-fit="moniker"]'), 20, 13);
}
