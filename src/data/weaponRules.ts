import { RULES, type GlossaryEntry } from "./rules";

export type WeaponRuleEntry = GlossaryEntry & { regexes: RegExp[] };

/** Weapon rules glossary (Kill Team Lite Rules wording), alphabetical by term. */
export const WEAPON_RULE_GLOSSARY: WeaponRuleEntry[] = RULES.weaponRuleGlossary.entries
  .map((e) => ({ ...e, regexes: e.match.map((m) => new RegExp(m)) }))
  .sort((a, b) => a.term.localeCompare(b.term, "en"));

/** The glossary entry that explains one printed weapon rule ('Blast 2"' → Blast x), for tooltips. */
export function glossaryFor(rule: string): WeaponRuleEntry | undefined {
  return WEAPON_RULE_GLOSSARY.find((e) => e.regexes.some((r) => r.test(rule)));
}

/** "Term: text" tooltip for a printed weapon rule. */
export function ruleTooltip(rule: string): string | undefined {
  const e = glossaryFor(rule);
  return e ? `${e.term}: ${e.text}${e.source !== "Lite Rules" ? ` (${e.source})` : ""}` : undefined;
}
