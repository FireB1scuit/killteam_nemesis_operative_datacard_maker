import { CONFIG } from "../config";
import { ALLEGIANCE_BY_ID } from "../data/allegiances";
import { displayBaseLabel, isOvalLabel } from "../data/bases";
import { BEHAVIOUR_BY_ID, BEHAVIOUR_RESTRICTION } from "../data/behaviours";
import { CORE_RULES, PLAYER_RESTRICTIONS, REMINDER_CONTROL, REMINDER_NEMESIS } from "../data/coreRules";
import type { ProfileEffects } from "../data/rules";
import { SIZES } from "../data/sizes";
import { TRAIT_BY_ID } from "../data/traits";
import { WEAPON_BY_ID, type WeaponDef, type WeaponType } from "../data/weapons";
import { keywordFromName, type NemesisBuild, type WeaponPick } from "./schema";

// ---------------------------------------------------------------------------------------------
// Card model
// ---------------------------------------------------------------------------------------------

export type RuleChip = { text: string; changed: boolean };

export type WeaponRow = {
  key: string;
  pickId: string;
  type: WeaponType;
  label: string;
  atk: number;
  hit: number;
  dmg: string;
  rules: RuleChip[];
  changed: { atk: boolean; hit: boolean };
};

/** A text ability: "**Name:** text" (paragraphs split by "\n\n"), optional bullets, optional italic note. */
export type RuleAbility = {
  kind: "rule";
  key: string;
  /** Where it comes from; allegiance/trait blocks are the ones that may flow from card 1 to card 2. */
  source: "allegiance" | "trait" | "reminder" | "core";
  name: string;
  text?: string;
  bullets?: string[];
  note?: string;
};

/** An action-bar block (orange bar, ▶ effect, ◆ restriction, optional priority list). */
export type ActionAbility = {
  kind: "action";
  key: string;
  title: string;
  tag?: string;
  effect: string;
  restrictions: string[];
  /** Priority list, action names marked **bold**. */
  priorities?: string[];
};

export type AbilityBlock = RuleAbility | ActionAbility;

export type CardModel = {
  name: string;
  moniker?: string;
  operativeType: "player" | "npo";
  /** Footer keywords: allegiance (orange) then the rest. */
  keywords: { allegiance: string; rest: string[] };
  sizeLabel: string;
  base: { kind: "round" | "oval"; label: string };
  stats: { control: number; move: number; save: number; wounds: number };
  weapons: WeaponRow[];
  /** Card 1 trait blocks (allegiance + nemesis traits): may flow to card 2 when they don't fit. */
  traitBlocks: RuleAbility[];
  /** Card 1 reminders (always on card 1). */
  reminderBlocks: RuleAbility[];
  /** Card 2 action bar: behaviour (NPO) or player-nemesis restrictions. */
  actionBlock: ActionAbility;
  /** Card 2 core Nemesis rules. */
  coreBlocks: RuleAbility[];
  selections: { used: number; allowed: number; unused: number };
  traitSlots: number;
};

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

const isRange = (r: string) => /^Range\b/.test(r);

/** KT ordering: Range first, then alphabetical. */
function sortRules(rules: RuleChip[]): RuleChip[] {
  return [...rules].sort((a, b) => {
    if (isRange(a.text) !== isRange(b.text)) return isRange(a.text) ? -1 : 1;
    return a.text.localeCompare(b.text, "en");
  });
}

function dedupeRules(rules: RuleChip[]): RuleChip[] {
  const seen = new Map<string, RuleChip>();
  for (const r of rules) if (!seen.has(r.text)) seen.set(r.text, r);
  return [...seen.values()];
}

const hasRule = (rules: RuleChip[], name: string) => rules.some((r) => r.text === name);

export function selectionCost(pick: WeaponPick): number {
  return WEAPON_BY_ID[pick.weaponId]?.selection ?? 0;
}

export function selectionBudget(build: NemesisBuild) {
  const allowed = SIZES[build.size].weaponSelections;
  const used = build.weapons.reduce((n, p) => n + selectionCost(p), 0);
  const unused = Math.max(0, allowed - used);
  return { used, allowed, unused, traitSlots: 1 + unused };
}

/** Resolve modifier picks (Twinned/Paired) to their valid targets: targetPickId → modifier defs. */
export function resolveModifiers(build: NemesisBuild): Map<string, WeaponDef[]> {
  const byId = new Map(build.weapons.map((p) => [p.id, p]));
  const out = new Map<string, WeaponDef[]>();
  for (const pick of build.weapons) {
    const def = WEAPON_BY_ID[pick.weaponId];
    if (!def?.modifier || !pick.targetId) continue;
    const target = byId.get(pick.targetId);
    const tdef = target && WEAPON_BY_ID[target.weaponId];
    if (!target || !tdef || tdef.modifier || tdef.type !== def.modifier.targetType || target.id === pick.id) continue;
    const list = out.get(target.id) ?? [];
    if (list.length >= CONFIG.maxModifiersPerTarget) continue;
    list.push(def);
    out.set(target.id, list);
  }
  return out;
}

/** Permanent profile effects from the nemesis traits (e.g. Fury) and the allegiance (e.g. Waaagh!). */
export function profileEffects(build: NemesisBuild): ProfileEffects[] {
  const out: ProfileEffects[] = [];
  for (const id of build.traits) {
    const fx = TRAIT_BY_ID[id]?.applyToProfiles;
    if (fx) out.push(fx);
  }
  const allegianceFx = build.allegiance ? ALLEGIANCE_BY_ID[build.allegiance]?.applyToProfiles : undefined;
  if (allegianceFx) out.push(allegianceFx);
  return out;
}

/** True when two separate effects worsen ranged Hit (Fury + Waaagh!), so the editor can warn. */
export function hasStackedHitPenalty(build: NemesisBuild): boolean {
  return profileEffects(build).filter((fx) => fx.ranged?.hitWorsen).length > 1;
}

// ---------------------------------------------------------------------------------------------
// deriveCard
// ---------------------------------------------------------------------------------------------

/** Build → final card values (docs/rules-reference.md §9). Pure. */
export function deriveCard(build: NemesisBuild): CardModel {
  const size = SIZES[build.size];
  const allegiance = build.allegiance ? ALLEGIANCE_BY_ID[build.allegiance] : undefined;
  const budget = selectionBudget(build);
  const modifiers = resolveModifiers(build);
  const effects = profileEffects(build);

  let hitPenalty = effects.reduce((n, fx) => n + (fx.ranged?.hitWorsen ?? 0), 0);
  if (!CONFIG.stackHitPenalties) hitPenalty = Math.min(1, hitPenalty);

  // Steps 3-10: expand picks into rows, then apply modifiers, traits and the allegiance.
  const weapons: WeaponRow[] = [];
  for (const pick of build.weapons) {
    const def = WEAPON_BY_ID[pick.weaponId];
    if (!def || def.modifier) continue; // modifier picks print no row
    const mods = modifiers.get(pick.id) ?? [];
    const alias = pick.alias?.trim();
    // An alias is used as-is; otherwise a modifier renames the row "Twinned <name lower-cased>".
    const label = alias || (mods[0]?.modifier ? `${mods[0].modifier.labelPrefix} ${def.name.toLowerCase()}` : def.name);

    def.profiles.forEach((prof, i) => {
      let atk = prof.atk;
      let hit = prof.hit;
      let rules: RuleChip[] = prof.rules.map((text) => ({ text, changed: false }));
      const changed = { atk: false, hit: false };

      // 4-5. Twinned / Paired.
      for (const m of mods) {
        const apply = m.modifier!;
        const special = apply.special?.[def.id];
        const atkBonus = special ? special.atk : apply.atk;
        const addRule = special ? special.addRule : apply.addRule;
        if (atkBonus) {
          atk += atkBonus;
          changed.atk = true;
        }
        if (addRule && !hasRule(rules, addRule)) rules.push({ text: addRule, changed: true });
      }

      // 6-7. Fury, Waaagh! (data-driven: applyToProfiles).
      if (def.type === "melee") {
        for (const fx of effects) {
          const add = fx.melee?.addRule;
          if (!add) continue;
          const replace = fx.melee?.ifHasRuleReplaceWith;
          if (replace && hasRule(rules, add)) {
            rules = rules.filter((r) => r.text !== add);
            if (!hasRule(rules, replace)) rules.push({ text: replace, changed: true });
          } else if (!hasRule(rules, add) && !(replace && hasRule(rules, replace))) {
            rules.push({ text: add, changed: true });
          }
        }
      } else if (hitPenalty > 0) {
        const next = Math.min(6, hit + hitPenalty); // 8. clamp at 6+
        if (next !== hit) changed.hit = true;
        hit = next;
      }

      weapons.push({
        key: `${pick.id}-${i}`,
        pickId: pick.id,
        type: def.type,
        label: prof.suffix ? `${label} (${prof.suffix})` : label,
        atk,
        hit: Math.min(6, hit),
        dmg: `${prof.dmg[0]}/${prof.dmg[1]}`,
        rules: sortRules(dedupeRules(rules)),
        changed,
      });
    });
  }

  // Ability blocks
  const traitBlocks: RuleAbility[] = [];
  if (allegiance) {
    traitBlocks.push({ kind: "rule", key: "allegiance", source: "allegiance", name: allegiance.traitName, text: allegiance.cardText });
  }
  for (const id of build.traits) {
    const t = TRAIT_BY_ID[id];
    if (t) traitBlocks.push({ kind: "rule", key: `trait-${t.id}`, source: "trait", name: t.name, text: t.text });
  }

  const isNpo = build.operativeType === "npo";
  const behaviour = isNpo && build.behaviour ? BEHAVIOUR_BY_ID[build.behaviour] : undefined;

  const reminderBlocks: RuleAbility[] = [
    { kind: "rule", key: "rem-nemesis", source: "reminder", name: "Nemesis", text: REMINDER_NEMESIS, note: "(see other card)" },
    { kind: "rule", key: "rem-control", source: "reminder", name: "Control", text: REMINDER_CONTROL },
  ];
  if (isNpo) {
    reminderBlocks.push({
      kind: "rule", key: "rem-behaviour", source: "reminder", name: "Behaviour",
      text: behaviour ? behaviour.name : "None selected", note: "(see other card)",
    });
  }

  const actionBlock: ActionAbility = behaviour
    ? {
        kind: "action", key: "behaviour", title: `Behaviour: ${behaviour.name}`, tag: "NPO",
        effect: behaviour.text, restrictions: [BEHAVIOUR_RESTRICTION], priorities: behaviour.priorities,
      }
    : isNpo
      ? { kind: "action", key: "behaviour", title: "Behaviour: none selected", tag: "NPO", effect: "Select a behaviour for this NPO.", restrictions: [] }
      : {
          kind: "action", key: "player", title: PLAYER_RESTRICTIONS.title, tag: "Player",
          effect: PLAYER_RESTRICTIONS.effect, restrictions: PLAYER_RESTRICTIONS.restrictions,
        };

  const coreBlocks: RuleAbility[] = CORE_RULES.map((r) => ({ kind: "rule", key: `core-${r.name}`, source: "core", ...r }));

  const nameKeyword = build.nameKeyword.trim() || keywordFromName(build.name);
  const baseLabel = build.base.label.trim();

  return {
    name: build.name.trim(),
    moniker: build.moniker?.trim() || undefined,
    operativeType: build.operativeType,
    keywords: { allegiance: allegiance?.keyword ?? "", rest: ["NEMESIS", ...(nameKeyword ? [nameKeyword] : [])] },
    sizeLabel: `Size: ${size.label}`,
    base: { kind: build.base.kind === "oval" || isOvalLabel(baseLabel) ? "oval" : "round", label: displayBaseLabel(baseLabel) },
    stats: { control: size.control, move: size.move, save: size.save, wounds: size.wounds },
    weapons,
    traitBlocks,
    reminderBlocks,
    actionBlock,
    coreBlocks,
    selections: { used: budget.used, allowed: budget.allowed, unused: budget.unused },
    traitSlots: budget.traitSlots,
  };
}

// ---------------------------------------------------------------------------------------------
// Printed strings (as they appear on the card)
// ---------------------------------------------------------------------------------------------

/** WR column text: comma-separated rules, or "-" when there are none (official cards print a dash). */
export function wrText(row: WeaponRow): string {
  return row.rules.length ? row.rules.map((r) => r.text).join(", ") : "-";
}

/** A row as printed: { name, atk, hit: "3+", dmg, wr }. */
export function printedRow(row: WeaponRow) {
  return { name: row.label, atk: row.atk, hit: `${row.hit}+`, dmg: row.dmg, wr: wrText(row) };
}

/** Footer keyword line, e.g. "TYRANID, NEMESIS, SCREAMER-KILLER". */
export function keywordLine(card: CardModel): string {
  return [card.keywords.allegiance, ...card.keywords.rest].filter(Boolean).join(", ");
}

/** Printed stats: { control: 6, move: '6"', save: "4+", wounds: 75 }. */
export function printedStats(card: CardModel) {
  return { control: card.stats.control, move: `${card.stats.move}"`, save: `${card.stats.save}+`, wounds: card.stats.wounds };
}

/** Compact "Name: 4/3+/6/3 Range 6", Ceaseless" summary, handy for tests and the editor. */
export function rowSummary(r: WeaponRow): string {
  return `${r.label}: ${r.atk}/${r.hit}+/${r.dmg}${r.rules.length ? " " + wrText(r) : ""}`;
}
