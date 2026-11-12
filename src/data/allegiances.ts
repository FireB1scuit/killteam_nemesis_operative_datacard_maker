export type AllegianceId =
  | "AELDARI"
  | "CHAOS"
  | "IMPERIUM"
  | "LEAGUES_OF_VOTANN"
  | "NECRON"
  | "ORK"
  | "TAU_EMPIRE"
  | "TYRANID";

export type AllegianceDef = {
  id: AllegianceId;
  /** Printed keyword. */
  keyword: string;
  /** UI label. */
  label: string;
  traitName: string;
  /** Friendly-perspective wording, Dossier step 5 (Traits), verbatim. */
  traitText: string;
};

export const ALLEGIANCES: AllegianceDef[] = [
  {
    id: "AELDARI", keyword: "AELDARI", label: "Aeldari", traitName: "Arrogant Superiority",
    traitText: "Whenever this operative is shooting against or fighting against a ready enemy operative, if two or more fails are rolled for it, one of them can be discarded to re-roll another.",
  },
  {
    id: "CHAOS", keyword: "CHAOS", label: "Chaos", traitName: "Let the Galaxy Burn",
    traitText: "Whenever this operative is wholly within enemy territory, its weapons have the Balanced weapon rule.",
  },
  {
    id: "IMPERIUM", keyword: "IMPERIUM", label: "Imperium", traitName: "Defenders of the Imperium",
    traitText: "Whenever an operative is shooting this operative, if this operative is wholly within your territory, one of its defence dice can be retained as a normal success without rolling it (in addition to a cover save, if any).",
  },
  {
    id: "LEAGUES_OF_VOTANN", keyword: "LEAGUES OF VOTANN", label: "Leagues of Votann", traitName: "Acquisition at All Costs",
    traitText: "Whenever this operative is shooting against or fighting against an enemy operative that contests an objective marker, or an area of the killzone that determines victory (e.g. flanks), this operative’s weapons have the Balanced weapon rule.",
  },
  {
    id: "NECRON", keyword: "NECRON", label: "Necron", traitName: "Living Metal",
    traitText: "In the Ready step of each Strategy phase, this operative regains up to D3+1 lost wounds.",
  },
  {
    id: "ORK", keyword: "ORK", label: "Ork", traitName: "Waaagh!",
    traitText: "Whenever this operative is fighting, its weapons have the Balanced weapon rule. Worsen the Hit stat of this operative’s ranged weapons by 1, but its melee weapons have the Severe weapon rule.",
  },
  {
    id: "TAU_EMPIRE", keyword: "T’AU EMPIRE", label: "T’au Empire", traitName: "Supporting Fire",
    traitText: "Whenever this operative is within 3\" of another friendly T’AU EMPIRE operative, this operative’s ranged weapons have the Accurate 1 weapon rule.",
  },
  {
    id: "TYRANID", keyword: "TYRANID", label: "Tyranid", traitName: "Will of the Hive Mind",
    traitText: "Ignore changes to this operative’s stats from being injured (including its weapons’ stats).",
  },
];

export const ALLEGIANCE_BY_ID = Object.fromEntries(ALLEGIANCES.map((a) => [a.id, a])) as Record<AllegianceId, AllegianceDef>;
export const ALLEGIANCE_IDS = ALLEGIANCES.map((a) => a.id) as [AllegianceId, ...AllegianceId[]];
