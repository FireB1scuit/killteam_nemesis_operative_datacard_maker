import { RULES } from "./rules";

export type BehaviourId = string;

export type BehaviourDef = {
  id: BehaviourId;
  name: string;
  /** Description + order rule, verbatim. */
  text: string;
  /** Priority list, verbatim; action names are marked **bold**. */
  priorities: string[];
  flavour?: string;
};

export const BEHAVIOURS: BehaviourDef[] = RULES.behaviours.map((b) => ({
  id: b.id, name: b.name, text: b.text, priorities: b.priority, flavour: b.flavour,
}));

export const BEHAVIOUR_BY_ID: Record<string, BehaviourDef | undefined> = Object.fromEntries(BEHAVIOURS.map((b) => [b.id, b]));
export const BEHAVIOUR_IDS = BEHAVIOURS.map((b) => b.id) as [string, ...string[]];

/** Verbatim general behaviour rule (editor help). */
export const BEHAVIOUR_GENERAL = RULES.behaviourGeneral;

/** Card 2 action-bar restriction (wording from docs/rules-reference.md §11). */
export const BEHAVIOUR_RESTRICTION = "Performs the first action it can from this list. If it can do none, it's expended.";

/** "**Charge** the closest…" → text segments with a bold flag. */
export function parseBold(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((t, i) => ({ text: t, bold: i % 2 === 1 }))
    .filter((s) => s.text);
}

export function stripBold(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, "$1");
}
