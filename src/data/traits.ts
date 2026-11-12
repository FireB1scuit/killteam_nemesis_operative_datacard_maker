export type TraitId =
  | "armoured" | "blitz" | "duellist" | "focusedTargeting" | "closeRangeLethality" | "fury"
  | "implacable" | "crushingImpact" | "shielded" | "shrouded" | "tenacious" | "tough" | "violentDemise";

export type TraitDef = { id: TraitId; name: string; text: string };

/** Nemesis traits, Dossier step 5 (Traits), verbatim. */
export const TRAITS: TraitDef[] = [
  { id: "armoured", name: "Armoured", text: "Whenever an operative is shooting this operative with a weapon that has a Normal Dmg stat of 3 or less, improve this operative’s Save stat by 1." },
  { id: "blitz", name: "Blitz", text: "Whenever this operative performs the Charge action during its activation, its melee weapons have the Severe and Shock weapon rules until the end of that activation." },
  { id: "duellist", name: "Duellist", text: "Whenever this operative is fighting or retaliating, you can resolve one of its successes before the normal order. If you do, that success must be used to block." },
  { id: "focusedTargeting", name: "Focused Targeting", text: "Whenever this operative is shooting during its activation, if it hasn’t performed any other actions during that activation, its ranged weapons have the Punishing weapon rule." },
  { id: "closeRangeLethality", name: "Close-range Lethality", text: "Whenever this operative is shooting the closest valid target within 8\" of it, its ranged weapons have the Lethal 5+ weapon rule; if the weapon already has that weapon rule, it also has the Severe weapon rule." },
  { id: "fury", name: "Fury", text: "This operative’s melee weapons have the Ceaseless weapon rule; if the weapon already has that weapon rule, it has the Relentless weapon rule. Worsen the Hit stat of this operative’s ranged weapons by 1." },
  { id: "implacable", name: "Implacable", text: "Ignore any changes to this operative’s weapon stats from being injured." },
  { id: "crushingImpact", name: "Crushing Impact", text: "When this operative finishes moving during the Charge action, inflict D3+3 damage on one enemy operative within its control range." },
  { id: "shielded", name: "Shielded", text: "Once per battle, when an attack dice inflicts damage on this operative, you can ignore that inflicted damage." },
  { id: "shrouded", name: "Shrouded", text: "Whenever an operative is shooting this operative from more than 8\" away, attack dice cannot be re-rolled." },
  { id: "tenacious", name: "Tenacious", text: "Ignore any changes to this operative’s Move stat from being injured." },
  { id: "tough", name: "Tough", text: "Whenever an attack dice inflicts damage of 4 or more on this operative, roll one D6: on a 5+, subtract 1 from that inflicted damage." },
  { id: "violentDemise", name: "Violent Demise", text: "If this operative is incapacitated, before it’s removed from the killzone, inflict D6+1 damage on each other operative within 3\" of it (excluding operatives with Heavy terrain wholly intervening between them and this operative)." },
];

export const TRAIT_BY_ID = Object.fromEntries(TRAITS.map((t) => [t.id, t])) as Record<TraitId, TraitDef>;
export const TRAIT_IDS = TRAITS.map((t) => t.id) as [TraitId, ...TraitId[]];
