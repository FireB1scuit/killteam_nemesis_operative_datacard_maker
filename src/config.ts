/**
 * App-wide defaults for the open questions in plan.md §8. Change them here; see README "Configuration".
 */
export const CONFIG = {
  /** §8.1 Physical card size. The card DOM is laid out at 10 CSS px per mm. */
  cardWidthMm: 120,
  cardHeightMm: 70,

  /** §8.3 Card accent colour (KT 2024 orange). Applied as the --faction CSS variable. */
  accent: "#e8641c",

  /**
   * §8.4 Allegiance trait wording. Only "friendly" (the Dossier's builder wording) ships with v1;
   * NPO-side wording would need a second text per allegiance in src/data/allegiances.ts.
   */
  allegianceWording: "friendly" as const,

  /** §8.5 Fury + Waaagh! both worsen ranged Hit: stack them (-2) or cap at -1. */
  stackHitPenalties: true,
  /** §8.5 Maximum Twinned/Paired modifiers that may target the same weapon. */
  maxModifiersPerTarget: 1,

  /** §8.6 Highlight calculated values. Preview default (user can toggle) and in exports. */
  highlightInPreview: true,
  highlightInExport: false,

  /** §8.7 Default PDF layout: "cards" = one card per 120×70 mm page; "sheet" = A4/Letter sheet with cut marks. */
  defaultPdfLayout: "cards" as "cards" | "sheet",

  /** PNG export pixel ratio (1200×700 → 3600×2100). */
  pngPixelRatio: 3,

  /** fitText lower bound as a fraction of the base ability font size (18px → ~13px). */
  minFontScale: 0.72,
} as const;

/** Card DOM size in CSS px (10 px/mm). */
export const CARD_PX = { width: CONFIG.cardWidthMm * 10, height: CONFIG.cardHeightMm * 10 };
