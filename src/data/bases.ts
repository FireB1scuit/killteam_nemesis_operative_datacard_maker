export type BaseKind = "round" | "oval" | "custom";
export type BasePreset = { kind: "round" | "oval"; label: string };

const ROUND = ["25", "28.5", "32", "40", "50", "60", "80", "90", "100", "130", "160"];
const OVAL = ["60×35", "75×42", "90×52", "105×70", "120×92", "150×95", "170×105"];

export const BASE_PRESETS: BasePreset[] = [
  ...ROUND.map((label) => ({ kind: "round" as const, label })),
  ...OVAL.map((label) => ({ kind: "oval" as const, label })),
];

/** Largest dimension in mm parsed from a base label ("105×70", "90", "40mm"), or NaN. */
export function baseLongEdge(label: string): number {
  const nums = (label.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  return nums.length ? Math.max(...nums) : NaN;
}

/** A label like "105x70" / "105×70" reads as oval; normalises "x" to "×". */
export function normaliseBaseLabel(label: string): { kind: "round" | "oval"; label: string } {
  const clean = label.trim().replace(/\s*mm\s*/gi, "").replace(/\s*[xX*]\s*/g, "×");
  return { kind: clean.includes("×") ? "oval" : "round", label: clean };
}

/** Default base per size. */
export const DEFAULT_BASE: Record<"S" | "M" | "L", string> = { S: "50", M: "80", L: "90" };
