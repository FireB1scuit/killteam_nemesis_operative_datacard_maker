import { CONFIG } from "../config";
import { baseLongEdge } from "../data/bases";
import { TRAIT_BY_ID } from "../data/traits";
import { WEAPON_BY_ID } from "../data/weapons";
import { selectionBudget } from "./derive";
import type { NemesisBuild } from "./schema";

export type StepId = "operative" | "allegiance" | "size" | "behaviour" | "weapons" | "traits";
export type Issue = { step: StepId; level: "error" | "warning"; message: string; pickId?: string };

/** Rule checks from plan.md §3.5. Errors make the build invalid; warnings are advisory. */
export function validate(build: NemesisBuild): Issue[] {
  const issues: Issue[] = [];
  const add = (step: StepId, level: Issue["level"], message: string, pickId?: string) =>
    issues.push({ step, level, message, ...(pickId ? { pickId } : {}) });

  // Operative
  if (!build.name.trim()) add("operative", "error", "Give the operative a name.");

  // Allegiance
  if (!build.allegiance) add("allegiance", "error", "Choose an allegiance.");

  // Size & base
  if (!build.base.label.trim()) add("size", "warning", "No base size set.");
  else if (baseLongEdge(build.base.label) >= 100)
    add("size", "warning", "Bases of 100mm or more can be awkward in close-quarters killzones (e.g. Tomb World).");

  // Behaviour
  if (build.operativeType === "npo" && !build.behaviour) add("behaviour", "error", "An NPO needs a behaviour.");

  // Weapons
  const { used, allowed, traitSlots } = selectionBudget(build);
  if (used > allowed) add("weapons", "error", `Too many weapon selections: ${used} used, ${allowed} allowed.`);
  const real = build.weapons.filter((p) => WEAPON_BY_ID[p.weaponId] && !WEAPON_BY_ID[p.weaponId].modifier);
  if (real.length === 0) add("weapons", "warning", "Add at least one weapon.");

  const byId = new Map(build.weapons.map((p) => [p.id, p]));
  const targetCount = new Map<string, number>();
  for (const pick of build.weapons) {
    const def = WEAPON_BY_ID[pick.weaponId];
    if (!def) {
      add("weapons", "error", `Unknown weapon "${pick.weaponId}".`, pick.id);
      continue;
    }
    if (!def.modifier) continue;
    const target = pick.targetId ? byId.get(pick.targetId) : undefined;
    const tdef = target && WEAPON_BY_ID[target.weaponId];
    const kind = def.type === "ranged" ? "ranged" : "melee";
    if (!target || !tdef) {
      add("weapons", "error", `${def.name}: select the ${kind} weapon it applies to.`, pick.id);
    } else if (target.id === pick.id || tdef.modifier) {
      add("weapons", "error", `${def.name} must target another weapon, not a modifier.`, pick.id);
    } else if (tdef.type !== def.type) {
      add("weapons", "error", `${def.name} can only target a ${kind} weapon.`, pick.id);
    } else {
      const n = (targetCount.get(target.id) ?? 0) + 1;
      targetCount.set(target.id, n);
      if (n > CONFIG.maxModifiersPerTarget)
        add("weapons", "error", `${tdef.name} already has a Twinned/Paired modifier.`, pick.id);
    }
  }

  // Traits
  const unique = new Set(build.traits);
  if (unique.size !== build.traits.length) add("traits", "error", "The same nemesis trait can't be taken twice.");
  for (const t of build.traits) if (!TRAIT_BY_ID[t]) add("traits", "error", `Unknown trait "${t}".`);
  if (unique.size > traitSlots) add("traits", "error", `Too many nemesis traits: ${unique.size} chosen, ${traitSlots} allowed.`);
  else if (unique.size < traitSlots)
    add("traits", "warning", `Choose ${traitSlots - unique.size} more nemesis trait${traitSlots - unique.size > 1 ? "s" : ""} (${traitSlots} allowed).`);

  return issues;
}

export function isValid(issues: Issue[]): boolean {
  return !issues.some((i) => i.level === "error");
}

export function stepStatus(issues: Issue[], step: StepId): "ok" | "warning" | "error" {
  const mine = issues.filter((i) => i.step === step);
  if (mine.some((i) => i.level === "error")) return "error";
  if (mine.length) return "warning";
  return "ok";
}
