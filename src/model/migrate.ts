import { BEHAVIOUR_BY_ID } from "../data/behaviours";
import { TRAIT_BY_ID } from "../data/traits";
import { WEAPON_BY_ID } from "../data/weapons";
import { NemesisBuildSchema, SCHEMA_MAGIC, SCHEMA_VERSION, type NemesisBuild } from "./schema";

export class BuildImportError extends Error {}

type Migration = (doc: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migrations keyed by the version they upgrade FROM. When the schema changes, bump SCHEMA_VERSION
 * and add `[oldVersion]: (doc) => ({ ...doc, version: oldVersion + 1, ... })`.
 */
const MIGRATIONS: Record<number, Migration> = {};

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, "$1_$2");

/**
 * Pre-release v1 builds used camelCase weapon ids ("burstCannon") and lower-case trait/behaviour ids
 * ("focusedTargeting", "marksman"). The ids now come from rules-data.json ("burst_cannon",
 * "FOCUSED_TARGETING", "MARKSMAN"); map unknown old ids onto them so old saves keep loading.
 */
function normaliseLegacyIds(doc: Record<string, unknown>): Record<string, unknown> {
  const out = { ...doc };
  if (Array.isArray(out.weapons)) {
    out.weapons = out.weapons.map((w) => {
      if (!w || typeof w !== "object") return w;
      const id = (w as { weaponId?: unknown }).weaponId;
      if (typeof id !== "string" || WEAPON_BY_ID[id]) return w;
      const fixed = snake(id).toLowerCase();
      return WEAPON_BY_ID[fixed] ? { ...w, weaponId: fixed } : w;
    });
  }
  if (Array.isArray(out.traits)) {
    out.traits = out.traits.map((t) => {
      if (typeof t !== "string" || TRAIT_BY_ID[t]) return t;
      const fixed = snake(t).toUpperCase();
      return TRAIT_BY_ID[fixed] ? fixed : t;
    });
  }
  if (typeof out.behaviour === "string" && !BEHAVIOUR_BY_ID[out.behaviour] && BEHAVIOUR_BY_ID[out.behaviour.toUpperCase()]) {
    out.behaviour = out.behaviour.toUpperCase();
  }
  return out;
}

/** Parse any JSON value into a current NemesisBuild, running migrations. Throws BuildImportError. */
export function migrateBuild(raw: unknown): NemesisBuild {
  if (!raw || typeof raw !== "object" || (raw as { schema?: unknown }).schema !== SCHEMA_MAGIC) {
    throw new BuildImportError("This file wasn't exported by Nemesis Datacard Maker.");
  }
  let doc = { ...(raw as Record<string, unknown>) };
  let version = Number(doc.version);
  if (!Number.isInteger(version) || version < 1) throw new BuildImportError("The build data has no valid version.");
  if (version > SCHEMA_VERSION) {
    throw new BuildImportError(`This build was made with a newer version of the app (format v${version}). Please update.`);
  }
  while (version < SCHEMA_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) throw new BuildImportError(`No migration from format v${version}.`);
    doc = step(doc);
    version = Number(doc.version);
  }
  const parsed = NemesisBuildSchema.safeParse(normaliseLegacyIds(doc));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new BuildImportError(`The build data is damaged (${first.path.join(".") || "root"}: ${first.message}).`);
  }
  return parsed.data;
}
