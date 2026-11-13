import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { SIZES, type SizeId } from "../data/sizes";
import type { TraitId } from "../data/traits";
import { WEAPON_BY_ID } from "../data/weapons";
import { migrateBuild } from "../model/migrate";
import { EXAMPLES, exampleBuild } from "../model/examples";
import { emptyBuild, keywordFromName, newPickId, type NemesisBuild, type WeaponPick } from "../model/schema";

export type Action =
  | { type: "patch"; patch: Partial<NemesisBuild> }
  | { type: "setName"; name: string }
  | { type: "setSize"; size: SizeId }
  | { type: "addWeapon"; weaponId: string }
  | { type: "updateWeapon"; id: string; patch: Partial<WeaponPick> }
  | { type: "removeWeapon"; id: string }
  | { type: "moveWeapon"; id: string; dir: -1 | 1 }
  | { type: "toggleTrait"; trait: TraitId }
  | { type: "load"; build: NemesisBuild };

export function reducer(b: NemesisBuild, a: Action): NemesisBuild {
  switch (a.type) {
    case "patch":
      return { ...b, ...a.patch };
    case "setName": {
      // Keep the name keyword in sync until the user edits it themselves.
      const synced = !b.nameKeyword || b.nameKeyword === keywordFromName(b.name);
      return { ...b, name: a.name, nameKeyword: synced ? keywordFromName(a.name) : b.nameKeyword };
    }
    case "setSize": {
      const baseUntouched = b.base.label === SIZES[b.size].defaultBase;
      return { ...b, size: a.size, base: baseUntouched ? { kind: "round", label: SIZES[a.size].defaultBase } : b.base };
    }
    case "addWeapon": {
      const def = WEAPON_BY_ID[a.weaponId];
      if (!def) return b;
      const pick: WeaponPick = { id: newPickId(), weaponId: a.weaponId };
      if (def.modifier) {
        // Pre-select the first eligible target that has no modifier yet.
        const taken = new Set(b.weapons.map((w) => w.targetId).filter(Boolean));
        const target = b.weapons.find((w) => {
          const d = WEAPON_BY_ID[w.weaponId];
          return d && !d.modifier && d.type === def.type && !taken.has(w.id);
        });
        if (target) pick.targetId = target.id;
      }
      return { ...b, weapons: [...b.weapons, pick] };
    }
    case "updateWeapon":
      return { ...b, weapons: b.weapons.map((w) => (w.id === a.id ? clean({ ...w, ...a.patch }) : w)) };
    case "removeWeapon":
      return {
        ...b,
        weapons: b.weapons
          .filter((w) => w.id !== a.id)
          .map((w) => (w.targetId === a.id ? clean({ ...w, targetId: undefined }) : w)),
      };
    case "moveWeapon": {
      const i = b.weapons.findIndex((w) => w.id === a.id);
      const j = i + a.dir;
      if (i < 0 || j < 0 || j >= b.weapons.length) return b;
      const weapons = [...b.weapons];
      [weapons[i], weapons[j]] = [weapons[j], weapons[i]];
      return { ...b, weapons };
    }
    case "toggleTrait":
      return {
        ...b,
        traits: b.traits.includes(a.trait) ? b.traits.filter((t) => t !== a.trait) : [...b.traits, a.trait],
      };
    case "load":
      return a.build;
  }
}

/** Drop undefined/empty optional keys so saved JSON stays tidy. */
function clean(p: WeaponPick): WeaponPick {
  const out: WeaponPick = { id: p.id, weaponId: p.weaponId };
  if (p.alias) out.alias = p.alias;
  if (p.targetId) out.targetId = p.targetId;
  return out;
}

// ---------------------------------------------------------------------------------------------
// Autosave
// ---------------------------------------------------------------------------------------------

const AUTOSAVE_KEY = "nemesis-datacard:autosave";
const SAVED_KEY = "nemesis-datacard:saved-snapshot";

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage full or blocked: autosave is best-effort */
  }
}

function loadAutosave(): NemesisBuild {
  // ?example=<id> opens one of the Dossier examples (handy for sharing and screenshots).
  const ex = new URLSearchParams(window.location.search).get("example");
  if (ex && EXAMPLES.some((e) => e.id === ex)) return exampleBuild(ex);
  const raw = readStorage(AUTOSAVE_KEY);
  if (raw) {
    try {
      return migrateBuild(JSON.parse(raw));
    } catch {
      /* ignore broken autosave */
    }
  }
  return emptyBuild();
}

const snapshot = (b: NemesisBuild) => JSON.stringify({ ...b, createdWith: "" });

/**
 * The editor store: build state, autosave to localStorage, and "unsaved changes" tracking
 * (changes since the last save/export/load).
 */
export function useBuildStore() {
  const [build, dispatch] = useReducer(reducer, undefined, loadAutosave);
  const [savedSnap, setSavedSnap] = useState<string>(() => readStorage(SAVED_KEY) ?? snapshot(emptyBuild()));
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => writeStorage(AUTOSAVE_KEY, JSON.stringify(build)), 300);
    return () => window.clearTimeout(timer.current);
  }, [build]);

  const markSaved = useCallback((b: NemesisBuild) => {
    const s = snapshot(b);
    setSavedSnap(s);
    writeStorage(SAVED_KEY, s);
  }, []);

  const dirty = snapshot(build) !== savedSnap;
  return { build, dispatch, dirty, markSaved };
}
