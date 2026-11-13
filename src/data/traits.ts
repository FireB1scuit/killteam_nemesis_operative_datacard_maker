import { RULES, type ProfileEffects } from "./rules";

export type TraitId = string;
export type TraitDef = { id: TraitId; name: string; text: string; flavour?: string; applyToProfiles?: ProfileEffects };

/** Nemesis traits, Dossier p.19 (from rules-data.json). */
export const TRAITS: TraitDef[] = RULES.traits.map((t) => ({
  id: t.id, name: t.name, text: t.text, flavour: t.flavour, applyToProfiles: t.applyToProfiles,
}));

export const TRAIT_BY_ID: Record<string, TraitDef | undefined> = Object.fromEntries(TRAITS.map((t) => [t.id, t]));
export const TRAIT_IDS = TRAITS.map((t) => t.id) as [string, ...string[]];
