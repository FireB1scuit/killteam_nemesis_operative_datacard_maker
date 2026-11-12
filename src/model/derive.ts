import { CONFIG } from "../config";
import { ALLEGIANCE_BY_ID } from "../data/allegiances";
import { BEHAVIOUR_BY_ID, BEHAVIOUR_RESTRICTION, type PriorityStep } from "../data/behaviours";
import { CORE_RULES, PLAYER_RESTRICTIONS, REMINDER_CONTROL, REMINDER_NEMESIS } from "../data/coreRules";
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

/** A text ability: "**Name:** text", optional bullets, optional italic note. */
export type RuleAbility = {
  kind: "rule";
  key: string;
  /** Where it comes from; trait blocks are the ones that may flow from card 1 to card 2. */
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
  priorities?: PriorityStep[];
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

/** Lower-case the first letter unless the word looks like an acronym/proper code ("XV8"). */
function lowerFirst(s: string): string {
  if (s.length > 1 && s[1] === s[1].toUpperCase() && s[1] !== s[1].toLowerCase()) return s;
  return s.charAt(0).toLowerCase() + s.slice(1);
}

/** KT ordering: Range first, then alphabetical. */
function sortRules(rules: RuleChip[]): RuleChip[] {
  const isRange = (r: RuleChip) => /^Range\b/.test(r.text);
  return [...rules].sort((a, b) => {
    if (isRange(a) !== isRange(b)) return isRange(a) ? -1 : 1;
    return a.text.localeCompare(b.text, "en");
  });
}

function dedupeRules(rules: RuleChip[]): RuleChip[] {
  const seen = new Map<string, RuleChip>();
  for (const r of rules) {
    const prev = seen.get(r.text);
    if (!prev) seen.set(r.text, r);
    else if (!prev.changed && r.changed) seen.set(r.text, { ...prev, changed: false }); // already had it: not a change
  }
  return [...seen.values()];
}

function hasRule(rules: RuleChip[], name: string) {
  return rules.some((r) => r.text === name);
}

export function selectionCost(pick: WeaponPick): number {
  return WEAPON_BY_ID[pick.weaponId]?.selection ?? 0;
}

export function selectionBudget(build: NemesisBuild) {
  const allowed = SIZES[build.size].weaponSelections;
  const used = build.weapons.reduce((n, p) => n + selectionCost(p), 0);
  const unused = Math.max(0, allowed - used);
  return { used, allowed, unused, traitSlots: 1 + unused };
}

/** Resolve modifier picks to their (valid) targets: targetPickId → modifier defs. */
export function resolveModifiers(build: NemesisBuild): Map<string, WeaponDef[]> {
  const byId = new Map(build.weapons.map((p) => [p.id, p]));
  const out = new Map<string, WeaponDef[]>();
  for (const pick of build.weapons) {
    const def = WEAPON_BY_ID[pick.weaponId];
    if (!def?.modifier || !pick.targetId) continue;
    const target = byId.get(pick.targetId);
    const tdef = target && WEAPON_BY_ID[target.weaponId];
    if (!target || !tdef || tdef.modifier || tdef.type !== def.type || target.id === pick.id) continue;
    const list = out.get(target.id) ?? [];
    if (list.length >= CONFIG.maxModifiersPerTarget) continue;
    list.push(def);
    out.set(target.id, list);
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// deriveCard
// ---------------------------------------------------------------------------------------------

/** Build → final card values (plan.md §3.4). Pure. */
export function deriveCard(build: NemesisBuild): CardModel {
  const size = SIZES[build.size];
  const allegiance = build.allegiance ? ALLEGIANCE_BY_ID[build.allegiance] : undefined;
  const traits = build.traits.map((t) => TRAIT_BY_ID[t]).filter(Boolean);
  const hasFury = build.traits.includes("fury");
  const hasWaaagh = build.allegiance === "ORK";
  const budget = selectionBudget(build);
  const modifiers = resolveModifiers(build);

  let hitPenalty = (hasFury ? 1 : 0) + (hasWaaagh ? 1 : 0);
  if (!CONFIG.stackHitPenalties) hitPenalty = Math.min(1, hitPenalty);

  // 1-2. Expand picks into rows; 3-7. apply modifiers and traits.
  const weapons: WeaponRow[] = [];
  for (const pick of build.weapons) {
    const def = WEAPON_BY_ID[pick.weaponId];
    if (!def || def.modifier) continue; // modifier rows are not printed
    const mods = modifiers.get(pick.id) ?? [];
    const baseLabel = pick.alias?.trim() || def.name;
    const prefix = mods[0]?.modifier === "twinned" ? "Twinned " : mods[0]?.modifier === "paired" ? "Paired " : "";
    const label = prefix ? prefix + lowerFirst(baseLabel) : baseLabel;

    def.profiles.forEach((prof, i) => {
      let atk = prof.atk;
      let hit = prof.hit;
      let rules: RuleChip[] = prof.rules.map((text) => ({ text, changed: false }));
      const changed = { atk: false, hit: false };

      for (const m of mods) {
        if (m.modifier === "twinned") {
          // Twinned: Ceaseless; burst cannon gets +1 Atk instead.
          if (def.id === "burstCannon") {
            atk += 1;
            changed.atk = true;
          } else if (!hasRule(rules, "Ceaseless")) {
            rules.push({ text: "Ceaseless", changed: true });
          }
        } else if (m.modifier === "paired") {
          atk += 1;
          changed.atk = true;
        }
      }

      if (def.type === "melee") {
        if (hasFury) {
          // Fury: Ceaseless, or Relentless (replacing Ceaseless) if it already has Ceaseless.
          if (hasRule(rules, "Ceaseless")) {
            rules = rules.filter((r) => r.text !== "Ceaseless");
            if (!hasRule(rules, "Relentless")) rules.push({ text: "Relentless", changed: true });
          } else if (!hasRule(rules, "Relentless")) {
            rules.push({ text: "Ceaseless", changed: true });
          }
        }
        if (hasWaaagh && !hasRule(rules, "Severe")) rules.push({ text: "Severe", changed: true });
      } else if (hitPenalty > 0) {
        const next = Math.min(6, hit + hitPenalty);
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
    traitBlocks.push({ kind: "rule", key: "allegiance", source: "allegiance", name: allegiance.traitName, text: allegiance.traitText });
  }
  for (const t of traits) traitBlocks.push({ kind: "rule", key: `trait-${t.id}`, source: "trait", name: t.name, text: t.text });

  const isNpo = build.operativeType === "npo";
  const behaviour = isNpo && build.behaviour ? BEHAVIOUR_BY_ID[build.behaviour] : undefined;

  const reminderBlocks: RuleAbility[] = [
    { kind: "rule", key: "rem-nemesis", source: "reminder", name: "Nemesis", text: `${REMINDER_NEMESIS}`, note: "(see other card)" },
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
  const sizeLabel = `Size: ${size.label}`;
  const baseLabel = build.base.label.trim();

  return {
    name: build.name.trim(),
    moniker: build.moniker?.trim() || undefined,
    operativeType: build.operativeType,
    keywords: { allegiance: allegiance?.keyword ?? "", rest: ["NEMESIS", ...(nameKeyword ? [nameKeyword] : [])] },
    sizeLabel,
    base: { kind: build.base.kind === "oval" || baseLabel.includes("×") ? "oval" : "round", label: baseLabel },
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

/** Compact "4/3+/6/3 Range 6", Ceaseless" summary, handy for tests and the editor. */
export function rowSummary(r: WeaponRow): string {
  return `${r.label}: ${r.atk}/${r.hit}+/${r.dmg}${r.rules.length ? " " + r.rules.map((x) => x.text).join(", ") : ""}`;
}
