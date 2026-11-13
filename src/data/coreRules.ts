import { RULES } from "./rules";

/** A rule printed as "**Name:** text" and/or followed by bullet points. */
export type RuleBlock = { name: string; text?: string; bullets?: string[] };

/** Core Nemesis rules (every nemesis operative), verbatim. */
export const CORE_RULES: RuleBlock[] = RULES.coreRules.map((r) => ({
  name: r.name,
  ...(r.text ? { text: r.text } : {}),
  ...(r.bullets ? { bullets: r.bullets } : {}),
}));

/** Card 1 reminders (wording from docs/rules-reference.md §11). */
export const REMINDER_NEMESIS = CORE_RULES.map((r) => r.name).join(", ");
export const REMINDER_CONTROL = "Use this operative's CONTROL stat instead of APL in all instances except spending action points.";

/** Card 2 block for a player operative (replaces the behaviour bar). Verbatim Dossier / mission-pack text. */
export const PLAYER_RESTRICTIONS = {
  title: "Player Nemesis",
  effect: RULES.playerOperative,
  restrictions: [RULES.playerActivationLimits],
};

export const MISSION_ACTIONS_TEXT = RULES.missionActions;
export const NPO_ACTIVATION_TEXT = RULES.npoActivationLimits;
