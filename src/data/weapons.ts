export type WeaponType = "ranged" | "melee";
export type ModifierKind = "twinned" | "paired";

export type WeaponProfile = {
  /** Profile suffix printed in brackets, e.g. "standard" → "Plasma cannon (standard)". */
  suffix?: string;
  atk: number;
  hit: number; // x+
  dmg: [number, number]; // normal / critical
  /** Weapon rules as printed, including "Selection X" where the Dossier table has it. */
  rules: string[];
};

export type WeaponDef = {
  id: string;
  name: string;
  type: WeaponType;
  /** Weapon selections this pick uses: 0, 1 or 2. */
  selection: 0 | 1 | 2;
  profiles: WeaponProfile[];
  /** Alternative names (search aliases in the picker). */
  alternatives: string[];
  /** Twinned / Paired modifier picks print no row; they change their target instead. */
  modifier?: ModifierKind;
  /** Modifier rule text (Dossier verbatim). */
  modifierText?: string;
};

const p = (atk: number, hit: number, dmg: string, rules: string[], suffix?: string): WeaponProfile => {
  const [n, c] = dmg.split("/").map(Number);
  return { atk, hit, dmg: [n, c], rules, ...(suffix ? { suffix } : {}) };
};

const HEAVY = "Heavy (Reposition only)";

/** Dossier step 4 (Weapons). "Muti-melta" corrected to Multi-melta. */
export const WEAPONS: WeaponDef[] = [
  // ---------- Ranged ----------
  { id: "autocannon", name: "Autocannon", type: "ranged", selection: 1, profiles: [p(5, 3, "5/6", [])], alternatives: ["Deathspitter", "Missile pod"] },
  { id: "burstCannon", name: "Burst cannon", type: "ranged", selection: 1, profiles: [p(5, 3, "3/4", ["Ceaseless", 'Torrent 1"'])], alternatives: ["Scatter laser", "Devourer"] },
  { id: "cyclicIonRaker", name: "Cyclic ion raker", type: "ranged", selection: 2, profiles: [p(5, 3, "4/5", [HEAVY, "Piercing 1", "Selection 2", 'Torrent 2"'])], alternatives: [] },
  { id: "flamestormCannon", name: "Flamestorm cannon", type: "ranged", selection: 2, profiles: [p(6, 2, "3/3", ['Range 8"', HEAVY, "Selection 2", 'Torrent 2"'])], alternatives: ["Flamespurt"] },
  { id: "havocLauncher", name: "Havoc launcher", type: "ranged", selection: 1, profiles: [p(4, 3, "4/6", ['Blast 2"'])], alternatives: ["Grotzooka", "Spore mine launcher"] },
  { id: "heavyBolter", name: "Heavy bolter", type: "ranged", selection: 1, profiles: [p(5, 3, "4/5", ["Piercing Crits 1", 'Torrent 1"'])], alternatives: [] },
  { id: "heavyFlamer", name: "Heavy flamer", type: "ranged", selection: 1, profiles: [p(5, 2, "3/3", ['Range 8"', "Saturate", 'Torrent 2"'])], alternatives: ["Incendine combustor", "Liquifier gun", "Skorcha"] },
  { id: "heavyOnslaughtGatlingCannon", name: "Heavy onslaught gatling cannon", type: "ranged", selection: 2, profiles: [p(6, 3, "4/5", [HEAVY, "Selection 2", 'Torrent 2"'])], alternatives: ["Avenger chaincannon", "Enmitic exterminator"] },
  { id: "heavyPhosphorBlaster", name: "Heavy phosphor blaster", type: "ranged", selection: 1, profiles: [p(5, 3, "4/5", ["Saturate", "Severe"])], alternatives: [] },
  { id: "heavyRailRifle", name: "Heavy rail rifle", type: "ranged", selection: 2, profiles: [p(5, 3, "6/7", [HEAVY, "Piercing 2", "Selection 2"])], alternatives: ["Doomsday blaster", "Gauss destructor"] },
  { id: "heavyStubber", name: "Heavy stubber", type: "ranged", selection: 1, profiles: [p(5, 3, "4/5", ['Torrent 1"'])], alternatives: ["Big shoota"] },
  { id: "lascannon", name: "Lascannon", type: "ranged", selection: 1, profiles: [p(4, 3, "6/7", [HEAVY, "Piercing 2"])], alternatives: ["Bright lance", "Dark lance"] },
  {
    id: "macroPlasmaIncinerator", name: "Macro plasma incinerator", type: "ranged", selection: 2,
    profiles: [
      p(5, 3, "4/6", ['Blast 2"', HEAVY, "Piercing 1", "Selection 2"], "standard"),
      p(5, 3, "5/6", ['Blast 2"', HEAVY, "Lethal 5+", "Piercing 1", "Selection 2"], "supercharge"),
    ],
    alternatives: [],
  },
  { id: "meltagun", name: "Meltagun", type: "ranged", selection: 1, profiles: [p(4, 3, "6/3", ['Range 6"', "Devastating 4", "Piercing 2"])], alternatives: ["Fusion blaster", "Heat lance"] },
  {
    id: "missileLauncher", name: "Missile launcher", type: "ranged", selection: 1,
    profiles: [p(4, 3, "3/5", ['Blast 2"'], "frag"), p(4, 3, "5/7", ["Piercing 1"], "krak")],
    alternatives: [],
  },
  { id: "multiMelta", name: "Multi-melta", type: "ranged", selection: 1, profiles: [p(4, 3, "6/3", ["Devastating 4", HEAVY, "Piercing 2"])], alternatives: [] },
  {
    id: "plasmaCannon", name: "Plasma cannon", type: "ranged", selection: 1,
    profiles: [
      p(4, 3, "4/6", ['Blast 2"', HEAVY, "Piercing 1"], "standard"),
      p(4, 3, "5/6", ['Blast 2"', HEAVY, "Hot", "Lethal 5+", "Piercing 1"], "supercharge"),
    ],
    alternatives: [],
  },
  {
    id: "plasmaGun", name: "Plasma gun", type: "ranged", selection: 1,
    profiles: [p(4, 3, "4/6", ["Piercing 1"], "standard"), p(4, 3, "5/6", ["Hot", "Lethal 5+", "Piercing 1"], "supercharge")],
    alternatives: [],
  },
  { id: "rokkitLauncha", name: "Rokkit launcha", type: "ranged", selection: 1, profiles: [p(6, 4, "4/5", ['Blast 1"'])], alternatives: [] },
  { id: "shurikenCannon", name: "Shuriken cannon", type: "ranged", selection: 1, profiles: [p(5, 3, "4/5", ["Rending", 'Torrent 1"'])], alternatives: [] },
  { id: "splinterCannon", name: "Splinter cannon", type: "ranged", selection: 1, profiles: [p(5, 3, "3/5", ["Lethal 5+", 'Torrent 1"'])], alternatives: [] },
  { id: "starcannon", name: "Starcannon", type: "ranged", selection: 1, profiles: [p(4, 3, "5/6", ["Lethal 5+", "Piercing 1"])], alternatives: ["Heavy venom cannon", "Kustom mega-blasta"] },
  { id: "stranglethornCannon", name: "Stranglethorn cannon", type: "ranged", selection: 1, profiles: [p(5, 3, "3/5", ['Blast 2"', "Lethal 5+"])], alternatives: [] },
  { id: "thermalSpear", name: "Thermal spear", type: "ranged", selection: 2, profiles: [p(5, 3, "6/3", ["Devastating 4", HEAVY, "Piercing 2", "Selection 2"])], alternatives: ["Fusion collider"] },
  {
    id: "twinned", name: "Twinned weapon", type: "ranged", selection: 1, profiles: [], alternatives: [],
    modifier: "twinned",
    modifierText: "Select one other ranged weapon this operative has to have the Ceaseless weapon rule; if it’s a burst cannon, add 1 to its Atk stat instead.",
  },

  // ---------- Melee ----------
  { id: "chainWeapon", name: "Chain weapon", type: "melee", selection: 1, profiles: [p(4, 3, "5/6", ["Brutal", "Rending"])], alternatives: [] },
  { id: "closeCombatWeapon", name: "Close combat weapon", type: "melee", selection: 0, profiles: [p(3, 4, "4/5", ["Selection 0"])], alternatives: [] },
  { id: "dreadSaw", name: "Dread saw", type: "melee", selection: 1, profiles: [p(5, 3, "4/5", ["Rending"])], alternatives: [] },
  { id: "fleshmower", name: "Fleshmower", type: "melee", selection: 1, profiles: [p(5, 2, "4/5", ["Brutal"])], alternatives: [] },
  { id: "powerFist", name: "Power fist", type: "melee", selection: 1, profiles: [p(4, 3, "6/8", ["Brutal", "Shock"])], alternatives: ["Crushing claw"] },
  { id: "powerScourge", name: "Power scourge", type: "melee", selection: 1, profiles: [p(6, 3, "3/5", ["Lethal 5+"])], alternatives: ["Lasher tendrils"] },
  { id: "powerTalon", name: "Power talon", type: "melee", selection: 1, profiles: [p(4, 3, "5/6", ["Lethal 5+", "Rending"])], alternatives: [] },
  { id: "powerWeapon", name: "Power weapon", type: "melee", selection: 1, profiles: [p(4, 3, "5/7", ["Lethal 5+"])], alternatives: ["Ghostglaive"] },
  { id: "scythingTalons", name: "Scything talons", type: "melee", selection: 1, profiles: [p(5, 3, "4/6", ["Ceaseless"])], alternatives: ["Macro-scalpels"] },
  { id: "thunderHammer", name: "Thunder hammer", type: "melee", selection: 1, profiles: [p(4, 3, "6/8", ["Shock", "Stun"])], alternatives: [] },
  {
    id: "paired", name: "Paired weapon", type: "melee", selection: 1, profiles: [], alternatives: [],
    modifier: "paired",
    modifierText: "Select one other melee weapon this operative has and add 1 to its Atk stat.",
  },
];

export const WEAPON_BY_ID: Record<string, WeaponDef> = Object.fromEntries(WEAPONS.map((w) => [w.id, w]));

/** Case-insensitive search over names and alternatives. */
export function searchWeapons(query: string, type?: WeaponType): WeaponDef[] {
  const q = query.trim().toLowerCase();
  return WEAPONS.filter((w) => (!type || w.type === type) && (!q || [w.name, ...w.alternatives].some((n) => n.toLowerCase().includes(q))));
}
