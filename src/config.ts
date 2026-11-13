/**
 * App-wide defaults for the decisions in plan.md §8. Change them here; see README "Settings and defaults".
 */
export const CONFIG = {
  /** §8.1 Physical card size. The card DOM is laid out at 10 CSS px per mm. */
  cardWidthMm: 120,
  cardHeightMm: 70,

  /** §8.3 Card accent colour (KT 2024 orange). Applied as the --faction CSS variable. */
  accent: "#e8641c",

  /** §8.5 Fury + Waaagh! both worsen ranged Hit: stack them (-2) or cap at -1. */
  stackHitPenalties: true,
  /** §8.5 Maximum Twinned/Paired modifiers that may target the same weapon. */
  maxModifiersPerTarget: 1,

  /** §8.6 Highlight calculated values. Preview default (user can toggle) and in exports. */
  highlightInPreview: true,
  highlightInExport: false,

  /** §8.8 Weapon rules reference below the cards on the PDF: default for new builds (the user's choice is remembered). */
  weaponRulesOnPdf: true,

  /** Paper size for the PDF pages with weapon rules / print sheets. The user can switch it in the Export PDF menu. */
  defaultPaper: "a4" as "a4" | "letter",

  /** PNG export pixel ratio (1200×700 → 3600×2100). */
  pngPixelRatio: 3,

  /** fitText lower bound as a fraction of the base ability font size (18px → ~13px). */
  minFontScale: 0.72,
} as const;

/** Card DOM size in CSS px (10 px/mm). */
export const CARD_PX = { width: CONFIG.cardWidthMm * 10, height: CONFIG.cardHeightMm * 10 };
