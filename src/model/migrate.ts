import { NemesisBuildSchema, SCHEMA_MAGIC, SCHEMA_VERSION, type NemesisBuild } from "./schema";

export class BuildImportError extends Error {}

type Migration = (doc: Record<string, unknown>) => Record<string, unknown>;

/**
 * Migrations keyed by the version they upgrade FROM. When the schema changes, bump SCHEMA_VERSION
 * and add `[oldVersion]: (doc) => ({ ...doc, version: oldVersion + 1, ... })`.
 */
const MIGRATIONS: Record<number, Migration> = {};

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
  const parsed = NemesisBuildSchema.safeParse(doc);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new BuildImportError(`The build data is damaged (${first.path.join(".") || "root"}: ${first.message}).`);
  }
  return parsed.data;
}
