import { stripBold } from "../data/behaviours";
import { WEAPON_RULE_GLOSSARY, type WeaponRuleEntry } from "../data/weaponRules";
import { wrText, type AbilityBlock, type CardModel } from "./derive";

function blockText(b: AbilityBlock): string[] {
  if (b.kind === "action") return [b.title, b.effect, ...b.restrictions, ...(b.priorities ?? []).map(stripBold)];
  return [`${b.name}:`, b.text ?? "", ...(b.bullets ?? []), b.note ?? ""];
}

/**
 * The rules text printed on card 1 and card 2 that can name weapon rules: the WR column plus every
 * ability block (traits can name weapon rules, e.g. Fury → Ceaseless/Relentless).
 */
export function printedRulesText(card: CardModel): string {
  const parts: string[] = card.weapons.map(wrText);
  for (const b of [...card.traitBlocks, ...card.reminderBlocks, card.actionBlock, ...card.coreBlocks]) parts.push(...blockText(b));
  return parts.filter(Boolean).join("\n");
}

/**
 * Weapon rules reference for the PDF (docs/rules-reference.md §12): every glossary entry whose `match`
 * regexes hit the printed card text, once each, alphabetical by term.
 */
export function weaponRuleReference(card: CardModel): WeaponRuleEntry[] {
  const text = printedRulesText(card);
  return WEAPON_RULE_GLOSSARY.filter((e) => e.regexes.some((r) => r.test(text)));
}
