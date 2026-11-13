import { RULES, type ModifierApply, type RawProfile } from "./rules";

export type WeaponType = "ranged" | "melee";
export type WeaponProfile = RawProfile;

export type WeaponDef = {
  id: string;
  name: string;
  type: WeaponType;
  /** Weapon selections this pick uses: 0, 1 or 2. */
  selection: number;
  /** Profiles (two for standard/supercharge or frag/krak). Empty for Twinned/Paired modifiers. */
  profiles: WeaponProfile[];
  /** Alternative names (search aliases in the picker). */
  alternatives: string[];
  /** Twinned / Paired: prints no row of its own; changes its target instead. */
  modifier?: ModifierApply;
  /** Modifier rule text (verbatim). */
  modifierText?: string;
};

export const WEAPONS: WeaponDef[] = RULES.weapons.map((w) => ({
  id: w.id,
  name: w.name,
  type: w.type,
  selection: w.selection,
  profiles: w.profiles ?? [],
  alternatives: w.alternatives,
  ...(w.modifier && w.apply ? { modifier: w.apply, modifierText: w.text } : {}),
}));

export const WEAPON_BY_ID: Record<string, WeaponDef | undefined> = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

/** Case-insensitive search over names and alternatives. */
export function searchWeapons(query: string, type?: WeaponType): WeaponDef[] {
  const q = query.trim().toLowerCase();
  return WEAPONS.filter((w) => (!type || w.type === type) && (!q || [w.name, ...w.alternatives].some((n) => n.toLowerCase().includes(q))));
}
