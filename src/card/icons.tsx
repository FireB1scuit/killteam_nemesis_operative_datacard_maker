/* Original placeholder glyphs that only echo the KT shapes (no Games Workshop artwork).
   Inline SVG (not <use>) so html-to-image captures them reliably. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export const IconControl = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path d="M2 4h20L12 21z" /></svg>
);
export const IconMove = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path d="M3 21 15 9l-4-1 11-6-4 11-1-4L5 21z" /></svg>
);
export const IconSave = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path d="M3 3h18v9c0 5-4 8-9 10-5-2-9-5-9-10z" /></svg>
);
export const IconWounds = (p: P) => (
  <svg viewBox="0 0 24 24" aria-hidden {...p}><path d="M12 1c2 6 5 11 5 15a5 5 0 0 1-10 0c0-4 3-9 5-15z" /></svg>
);
export const IconRanged = (p: P) => (
  <svg viewBox="0 0 34 22" aria-hidden {...p}>
    <rect x="1" y="7" width="8" height="14" rx="4" /><rect x="13" y="7" width="8" height="14" rx="4" /><rect x="25" y="7" width="8" height="14" rx="4" />
  </svg>
);
export const IconMelee = (p: P) => (
  <svg viewBox="0 0 34 22" aria-hidden {...p}>
    <path d="M1 9h21v4H1z" /><path d="M22 7h4v8h-4z" /><path d="M26 10h7v2h-7z" />
  </svg>
);
/** Neutral silhouette used when no picture is uploaded. */
export const PortraitPlaceholder = () => (
  <svg viewBox="0 0 260 128" preserveAspectRatio="xMidYMid slice" aria-hidden className="ph">
    <rect width="260" height="128" fill="#2d2d2d" />
    <circle cx="160" cy="34" r="22" fill="#5a5a5a" />
    <path d="M110 128c0-40 22-66 50-66s50 26 50 66z" fill="#4a4a4a" />
  </svg>
);
