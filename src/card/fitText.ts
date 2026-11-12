import { CONFIG } from "../config";

/** True if any [data-fit=body|abil] region inside the card overflows its box. */
export function cardOverflows(card: HTMLElement): boolean {
  const body = card.querySelector<HTMLElement>('[data-fit="body"]');
  const abil = card.querySelector<HTMLElement>('[data-fit="abil"]');
  if (body && body.scrollHeight > body.clientHeight + 1) return true;
  // multi-column overflow spills sideways into extra columns
  if (abil && abil.scrollWidth > abil.clientWidth + 1) return true;
  if (abil && abil.scrollHeight > abil.clientHeight + 1) return true;
  return false;
}

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
