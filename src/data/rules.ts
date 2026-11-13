/**
 * Typed view of docs/rules-data.json, the single source of truth for every rule, stat and card text.
 * The src/data/*.ts modules only index and reshape this data; they never retype rules.
 */
import raw from "../../docs/rules-data.json";

export type ProfileEffects = {
  ranged?: { hitWorsen?: number };
  melee?: { addRule?: string; ifHasRuleReplaceWith?: string };
};

export type RawSize = {
  id: "S" | "M" | "L";
  name: "Small" | "Medium" | "Large";
  control: number;
  move: number;
  save: number;
  wounds: number;
  weaponSelections: number;
  defaultBaseMm: string;
};

export type RawAllegiance = {
  id: string;
  keyword: string;
  trait: string;
  bookText: string;
  /** Official allegiance card wording: this is what the card prints. Paragraphs are separated by "\n\n". */
  cardText: string;
  flavour?: string;
  note?: string;
  applyToProfiles?: ProfileEffects;
};

export type RawTrait = { id: string; name: string; text: string; flavour?: string; note?: string; applyToProfiles?: ProfileEffects };

export type RawBehaviour = {
  id: string;
  name: string;
  text: string;
  /** Numbered priority list; action names are marked **bold** (markdown). */
  priority: string[];
  flavour?: string;
};

export type RawCoreRule = { id: string; name: string; text?: string; bullets?: string[] };

export type RawProfile = { suffix?: string; atk: number; hit: number; dmg: [number, number]; rules: string[] };

export type ModifierApply = {
  targetType: "ranged" | "melee";
  addRule?: string;
  atk?: number;
  /** Per-target-weapon overrides, e.g. Twinned on a burst cannon: +1 Atk instead of Ceaseless. */
  special?: Record<string, { atk?: number; addRule?: string }>;
  labelPrefix: string;
};

export type RawWeapon = {
  id: string;
  name: string;
  type: "ranged" | "melee";
  selection: number;
  alternatives: string[];
  profiles?: RawProfile[];
  modifier?: boolean;
  text?: string;
  apply?: ModifierApply;
  note?: string;
};

export type RawExample = {
  _page: string;
  name: string;
  moniker?: string;
  nameKeyword: string;
  operativeType: "player" | "npo";
  allegiance: string;
  size: "S" | "M" | "L";
  base: string;
  behaviour?: string;
  weapons: { weaponId: string; alias?: string; targetIndex?: number }[];
  traits: string[];
  expected: {
    stats: { control: number; move: string; save: string; wounds: number };
    selectionsUsed: number;
    traitsAllowed: number;
    rows: { name: string; atk: number; hit: string; dmg: string; wr: string }[];
    keywords: string;
    weaponRuleReference: string[];
  };
};

export type GlossaryEntry = { term: string; source: string; text: string; match: string[] };

export type RulesData = {
  sizes: RawSize[];
  composition: { normalCount: number[]; S: number[]; M: number[]; L: number[] };
  baseSizes: { round: string[]; oval: string[]; warning: string };
  allegiances: RawAllegiance[];
  traits: RawTrait[];
  behaviours: RawBehaviour[];
  behaviourGeneral: string;
  coreRules: RawCoreRule[];
  controlStat: string;
  activation: string;
  missionActions: string;
  playerOperative: string;
  playerActivationLimits: string;
  npoActivationLimits: string;
  weapons: RawWeapon[];
  examples: RawExample[];
  weaponRuleGlossary: { entries: GlossaryEntry[] };
};

export const RULES = raw as unknown as RulesData;
