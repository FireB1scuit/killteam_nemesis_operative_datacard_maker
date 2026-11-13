import { CONFIG } from "../config";
import type { Paper } from "../io/pdf";
import { emptyBuild, type NemesisBuild } from "../model/schema";

/** Per-browser user defaults (localStorage, best-effort: every access is wrapped in try/catch). */
const KEYS = {
  weaponRulesOnPdf: "nemesis-datacard:pref:weaponRulesOnPdf",
  paper: "nemesis-datacard:pref:paper",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage blocked: the preference just isn't remembered */
  }
}

/** The user's default for "Weapon rules on PDF" (used for new builds). */
export function defaultWeaponRulesOnPdf(): boolean {
  const v = read(KEYS.weaponRulesOnPdf);
  return v === null ? CONFIG.weaponRulesOnPdf : v === "1";
}
export function rememberWeaponRulesOnPdf(on: boolean) {
  write(KEYS.weaponRulesOnPdf, on ? "1" : "0");
}

export function defaultPaper(): Paper {
  const v = read(KEYS.paper);
  return v === "a4" || v === "letter" ? v : CONFIG.defaultPaper;
}
export function rememberPaper(p: Paper) {
  write(KEYS.paper, p);
}

/** A new, empty build that starts with the user's remembered export options. */
export function newBuild(): NemesisBuild {
  return { ...emptyBuild(), options: { weaponRulesOnPdf: defaultWeaponRulesOnPdf() } };
}

/** Apply the user's default options to a fresh build (e.g. a loaded example). */
export function withDefaultOptions(b: NemesisBuild): NemesisBuild {
  return { ...b, options: { weaponRulesOnPdf: defaultWeaponRulesOnPdf() } };
}
