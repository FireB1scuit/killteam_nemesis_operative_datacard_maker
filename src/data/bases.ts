import { RULES } from "./rules";

export type BaseKind = "round" | "oval" | "custom";
export type BasePreset = { kind: "round" | "oval"; label: string };

export const BASE_PRESETS: BasePreset[] = [
  ...RULES.baseSizes.round.map((label) => ({ kind: "round" as const, label })),
  ...RULES.baseSizes.oval.map((label) => ({ kind: "oval" as const, label })),
];

/** Verbatim Dossier warning for big bases. */
export const BIG_BASE_WARNING = RULES.baseSizes.warning;

/** Largest dimension in mm parsed from a base label ("105x70", "90", "40mm"), or NaN. */
export function baseLongEdge(label: string): number {
  const nums = (label.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  return nums.length ? Math.max(...nums) : NaN;
}

/** Normalise custom input: strip "mm"; "105 X 70" / "105×70" → "105x70" (oval). */
export function normaliseBaseLabel(label: string): { kind: "round" | "oval"; label: string } {
  const clean = label.trim().replace(/\s*mm\s*/gi, "").replace(/\s*[xX*×]\s*/g, "x");
  return { kind: /\dx\d/.test(clean) ? "oval" : "round", label: clean };
}

/** True for an oval label like "105x70" or "105×70". */
export function isOvalLabel(label: string): boolean {
  return /\d\s*[xX×]\s*\d/.test(label);
}

/** How the base label is printed in the footer badge ("105x70" → "105×70"). */
export function displayBaseLabel(label: string): string {
  return label.replace(/(\d)\s*[xX×]\s*(\d)/g, "$1×$2");
}
