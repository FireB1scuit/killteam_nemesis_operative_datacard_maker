import { EXAMPLES } from "./examples";
import { emptyBuild, type NemesisBuild } from "./schema";

/** Layout stress cases (docs/rules-reference.md §11 "Worst case"). */
export const WORST_CASES: { id: string; label: string; build: NemesisBuild }[] = [
  {
    id: "worst-traits",
    label: "Large NPO, Selection 0 melee only, 4 nemesis traits",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Hierophant Bio-titan Fragment", moniker: "The Unending Hunger of the Hive",
      nameKeyword: "HIEROPHANT FRAGMENT", allegiance: "LEAGUES_OF_VOTANN", size: "L", base: { kind: "oval", label: "170x105" },
      behaviour: "MARKSMAN",
      weapons: [{ id: "a", weaponId: "close_combat_weapon", alias: "Crushing limbs" }],
      traits: ["CLOSE_RANGE_LETHALITY", "VIOLENT_DEMISE", "FOCUSED_TARGETING", "FURY"],
    },
  },
  {
    id: "worst-rows",
    label: "Large NPO, 3 two-profile weapons + Selection 0 melee (7 rows)",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Onager Dunecrawler", nameKeyword: "ONAGER DUNECRAWLER",
      allegiance: "ORK", size: "L", base: { kind: "oval", label: "150x95" }, behaviour: "GUARDIAN",
      weapons: [
        { id: "a", weaponId: "plasma_cannon", alias: "Kustom plasma kannon" },
        { id: "b", weaponId: "plasma_gun" },
        { id: "c", weaponId: "missile_launcher" },
        { id: "d", weaponId: "close_combat_weapon" },
      ],
      traits: ["VIOLENT_DEMISE"],
    },
  },
  {
    id: "worst-mixed",
    label: "Large NPO, T'au (two-paragraph allegiance), 2-profile weapon + melee + 2 traits",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Riptide Battlesuit", moniker: "Shas'vre Ob'lotai",
      nameKeyword: "RIPTIDE", allegiance: "TAU_EMPIRE", size: "L", base: { kind: "oval", label: "120x92" }, behaviour: "BRAWLER",
      weapons: [
        { id: "a", weaponId: "macro_plasma_incinerator" },
        { id: "b", weaponId: "close_combat_weapon", alias: "Battlesuit fists" },
      ],
      traits: ["CLOSE_RANGE_LETHALITY", "VIOLENT_DEMISE"],
    },
  },
  {
    id: "worst-flow",
    label: "Large NPO, 6 rows + long allegiance + 2 long traits (over budget on purpose: blocks flow to card 2)",
    build: {
      ...emptyBuild(), operativeType: "npo", name: "Hammerhead Gunship", moniker: "Shas'vre Longstrike's Echo",
      nameKeyword: "HAMMERHEAD", allegiance: "LEAGUES_OF_VOTANN", size: "L", base: { kind: "oval", label: "170x105" }, behaviour: "GUARDIAN",
      weapons: [
        { id: "a", weaponId: "plasma_cannon", alias: "Ion cannon" },
        { id: "b", weaponId: "missile_launcher", alias: "Seeker missiles" },
        { id: "c", weaponId: "close_combat_weapon", alias: "Hull ram" },
        { id: "d", weaponId: "heavy_flamer" },
      ],
      traits: ["CLOSE_RANGE_LETHALITY", "VIOLENT_DEMISE"],
    },
  },
  {
    id: "player",
    label: "Small player operative",
    build: {
      ...emptyBuild(), operativeType: "player", name: "Ghost Keel", moniker: "Shas'vre Ka'tai", nameKeyword: "GHOST KEEL",
      allegiance: "TAU_EMPIRE", size: "S", base: { kind: "round", label: "28.5" },
      weapons: [{ id: "a", weaponId: "burst_cannon" }, { id: "b", weaponId: "twinned", targetId: "a" }],
      traits: ["SHROUDED"],
    },
  },
];

export const ALL_FIXTURES = [...EXAMPLES, ...WORST_CASES];
