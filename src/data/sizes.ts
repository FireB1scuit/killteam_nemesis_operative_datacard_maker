export type SizeId = "S" | "M" | "L";

export type SizeDef = {
  id: SizeId;
  label: "Small" | "Medium" | "Large";
  control: number;
  move: number; // inches
  save: number; // x+
  wounds: number;
  weaponSelections: number;
};

/** Dossier step 2 (Size). */
export const SIZES: Record<SizeId, SizeDef> = {
  S: { id: "S", label: "Small", control: 4, move: 6, save: 4, wounds: 35, weaponSelections: 2 },
  M: { id: "M", label: "Medium", control: 5, move: 6, save: 4, wounds: 50, weaponSelections: 2 },
  L: { id: "L", label: "Large", control: 6, move: 6, save: 4, wounds: 75, weaponSelections: 3 },
};

export const SIZE_IDS: SizeId[] = ["S", "M", "L"];

/** Kill team operatives allowed alongside the nemesis (info only, not printed). */
export const TEAM_SIZE_COLUMNS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export const OPERATIVES_ALONGSIDE: Record<SizeId, number[]> = {
  S: [4, 4, 5, 5, 6, 7, 7, 8, 9, 9],
  M: [3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
  L: [2, 2, 2, 3, 3, 3, 4, 4, 4, 5],
};
