import { RULES, type RawSize } from "./rules";

export type SizeId = RawSize["id"];

export type SizeDef = {
  id: SizeId;
  label: RawSize["name"];
  control: number;
  move: number; // inches
  save: number; // x+
  wounds: number;
  weaponSelections: number;
  /** Typical base from the Dossier examples, used as the default when the size changes. */
  defaultBase: string;
};

/** Dossier step 2 (Size), from rules-data.json. */
export const SIZES = Object.fromEntries(
  RULES.sizes.map((s) => [
    s.id,
    {
      id: s.id, label: s.name, control: s.control, move: s.move, save: s.save, wounds: s.wounds,
      weaponSelections: s.weaponSelections, defaultBase: s.defaultBaseMm,
    },
  ]),
) as Record<SizeId, SizeDef>;

export const SIZE_IDS: SizeId[] = RULES.sizes.map((s) => s.id);

/** Kill team operatives allowed alongside the nemesis (info only, not printed). */
export const TEAM_SIZE_COLUMNS = RULES.composition.normalCount;
export const OPERATIVES_ALONGSIDE: Record<SizeId, number[]> = { S: RULES.composition.S, M: RULES.composition.M, L: RULES.composition.L };

/** Verbatim Control-stat note (editor help text). */
export const CONTROL_STAT_TEXT = RULES.controlStat;
