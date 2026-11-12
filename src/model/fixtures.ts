import { EXAMPLES } from "./examples";
import { emptyBuild, type NemesisBuild } from "./schema";

/** Layout stress cases (plan.md §4 "Worst case to test"). */
export const WORST_CASES: { id: string; label: string; build: NemesisBuild }[] = [
  {
    id: "worst-traits",
    label: "Large NPO, Selection 0 melee only, 4 long traits",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Hierophant Bio-titan Fragment", moniker: "The Unending Hunger of the Hive",
      nameKeyword: "HIEROPHANT FRAGMENT", allegiance: "LEAGUES_OF_VOTANN", size: "L", base: { kind: "oval", label: "170×105" },
      behaviour: "marksman",
      weapons: [{ id: "a", weaponId: "closeCombatWeapon", alias: "Crushing limbs" }],
      traits: ["closeRangeLethality", "violentDemise", "focusedTargeting", "fury"],
    },
  },
  {
    id: "worst-rows",
    label: "Large NPO, 3 two-profile weapons + Selection 0 melee (7 rows)",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Onager Dunecrawler", nameKeyword: "ONAGER DUNECRAWLER",
      allegiance: "ORK", size: "L", base: { kind: "oval", label: "150×95" }, behaviour: "guardian",
      weapons: [
        { id: "a", weaponId: "plasmaCannon", alias: "Kustom plasma kannon" },
        { id: "b", weaponId: "plasmaGun" },
        { id: "c", weaponId: "missileLauncher" },
        { id: "d", weaponId: "closeCombatWeapon" },
      ],
      traits: ["violentDemise"],
    },
  },
  {
    id: "worst-mixed",
    label: "Large NPO, 2 two-profile weapons + melee + 2 traits",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Chaos Decimator", moniker: "Engine of Ruin",
      nameKeyword: "DECIMATOR", allegiance: "CHAOS", size: "L", base: { kind: "oval", label: "120×92" }, behaviour: "brawler",
      weapons: [
        { id: "a", weaponId: "macroPlasmaIncinerator" },
        { id: "b", weaponId: "closeCombatWeapon", alias: "Siege claws" },
      ],
      traits: ["closeRangeLethality", "violentDemise"],
    },
  },
  {
    id: "player",
    label: "Small player operative",
    build: {
      ...emptyBuild(), operativeType: "player", name: "Ghost Keel", moniker: "Shas’vre Ka’tai", nameKeyword: "GHOST KEEL",
      allegiance: "TAU_EMPIRE", size: "S", base: { kind: "round", label: "28.5" },
      weapons: [{ id: "a", weaponId: "burstCannon" }, { id: "b", weaponId: "twinned", targetId: "a" }],
      traits: ["shrouded"],
    },
  },
];

export const ALL_FIXTURES = [...EXAMPLES, ...WORST_CASES];
