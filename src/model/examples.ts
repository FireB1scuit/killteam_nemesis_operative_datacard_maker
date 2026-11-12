import { emptyBuild, type NemesisBuild } from "./schema";

/** The four worked examples from the Nemesis Operatives Dossier. */
function build(partial: Partial<NemesisBuild>): NemesisBuild {
  return { ...emptyBuild(), ...partial };
}

export const EXAMPLES: { id: string; label: string; build: NemesisBuild }[] = [
  {
    id: "armoured-sentinel",
    label: "Armoured Sentinel ‘Armourbane’",
    build: build({
      operativeType: "npo", name: "Armoured Sentinel", moniker: "Armourbane", nameKeyword: "ARMOURED SENTINEL",
      allegiance: "IMPERIUM", size: "M", base: { kind: "round", label: "80" }, behaviour: "marksman",
      weapons: [
        { id: "as-1", weaponId: "plasmaCannon" },
        { id: "as-2", weaponId: "closeCombatWeapon" },
      ],
      traits: ["armoured", "focusedTargeting"],
    }),
  },
  {
    id: "xv8-crisis",
    label: "XV8 Crisis Battlesuit ‘Shas’ui Nomura’",
    build: build({
      operativeType: "npo", name: "XV8 Crisis Battlesuit", moniker: "Shas’ui Nomura", nameKeyword: "XV8 CRISIS BATTLESUIT",
      allegiance: "TAU_EMPIRE", size: "S", base: { kind: "round", label: "50" }, behaviour: "marksman",
      weapons: [
        { id: "xv-1", weaponId: "meltagun", alias: "Meltaguns" },
        { id: "xv-2", weaponId: "twinned", targetId: "xv-1" },
        { id: "xv-3", weaponId: "closeCombatWeapon" },
      ],
      traits: ["shielded"],
    }),
  },
  {
    id: "screamer-killer",
    label: "Screamer-Killer ‘The Deathdirge of Varl’",
    build: build({
      operativeType: "npo", name: "Screamer-Killer", moniker: "The Deathdirge of Varl", nameKeyword: "SCREAMER-KILLER",
      allegiance: "TYRANID", size: "L", base: { kind: "round", label: "90" }, behaviour: "battler",
      weapons: [
        { id: "sk-1", weaponId: "plasmaCannon", alias: "Bio-plasmic scream" },
        { id: "sk-2", weaponId: "scythingTalons" },
        { id: "sk-3", weaponId: "paired", targetId: "sk-2" },
      ],
      traits: ["fury"],
    }),
  },
  {
    id: "redemptor",
    label: "Redemptor Dreadnought",
    build: build({
      operativeType: "npo", name: "Redemptor Dreadnought", nameKeyword: "REDEMPTOR DREADNOUGHT",
      allegiance: "IMPERIUM", size: "L", base: { kind: "round", label: "90" }, behaviour: "guardian",
      weapons: [
        { id: "rd-1", weaponId: "heavyOnslaughtGatlingCannon" },
        { id: "rd-2", weaponId: "powerFist" },
      ],
      traits: ["implacable"],
    }),
  },
];

export function exampleBuild(id: string): NemesisBuild {
  const ex = EXAMPLES.find((e) => e.id === id);
  if (!ex) throw new Error(`Unknown example ${id}`);
  return structuredClone(ex.build);
}
