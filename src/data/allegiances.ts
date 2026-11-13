import { RULES, type ProfileEffects } from "./rules";

export type AllegianceId = string;

export type AllegianceDef = {
  id: AllegianceId;
  /** Printed keyword, e.g. "T'AU EMPIRE". */
  keyword: string;
  /** UI label, e.g. "T'au Empire". */
  label: string;
  traitName: string;
  /** Official allegiance card wording (printed on the card). Paragraphs separated by "\n\n". */
  cardText: string;
  /** Dossier p.19 table wording (friendly perspective), editor reference only. */
  bookText: string;
  flavour?: string;
  applyToProfiles?: ProfileEffects;
};

/** "LEAGUES OF VOTANN" → "Leagues of Votann", "T'AU EMPIRE" → "T'au Empire". */
function titleCase(keyword: string): string {
  return keyword
    .toLowerCase()
    .split(" ")
    .map((w, i) => (i > 0 && w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export const ALLEGIANCES: AllegianceDef[] = RULES.allegiances.map((a) => ({
  id: a.id,
  keyword: a.keyword,
  label: titleCase(a.keyword),
  traitName: a.trait,
  cardText: a.cardText,
  bookText: a.bookText,
  flavour: a.flavour,
  applyToProfiles: a.applyToProfiles,
}));

export const ALLEGIANCE_BY_ID: Record<string, AllegianceDef | undefined> = Object.fromEntries(ALLEGIANCES.map((a) => [a.id, a]));
export const ALLEGIANCE_IDS = ALLEGIANCES.map((a) => a.id) as [string, ...string[]];
