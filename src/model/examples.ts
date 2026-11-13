import { normaliseBaseLabel } from "../data/bases";
import { RULES, type RawExample } from "../data/rules";
import { emptyBuild, type NemesisBuild } from "./schema";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** A Dossier example (rules-data.json → examples[]) as an editor build. Twinned/Paired targetIndex → targetId. */
export function buildFromExample(ex: RawExample): NemesisBuild {
  const prefix = slug(ex.name).slice(0, 12);
  const ids = ex.weapons.map((_, i) => `${prefix}-${i + 1}`);
  const base = normaliseBaseLabel(ex.base);
  return {
    ...emptyBuild(),
    operativeType: ex.operativeType,
    name: ex.name,
    ...(ex.moniker ? { moniker: ex.moniker } : {}),
    nameKeyword: ex.nameKeyword,
    allegiance: ex.allegiance,
    size: ex.size,
    base: { kind: base.kind, label: base.label },
    ...(ex.behaviour ? { behaviour: ex.behaviour } : {}),
    weapons: ex.weapons.map((w, i) => ({
      id: ids[i],
      weaponId: w.weaponId,
      ...(w.alias ? { alias: w.alias } : {}),
      ...(w.targetIndex !== undefined ? { targetId: ids[w.targetIndex] } : {}),
    })),
    traits: [...ex.traits],
  };
}

/** The four worked examples from the Nemesis Operatives Dossier (pp.24-31). */
export const EXAMPLES: { id: string; label: string; build: NemesisBuild; source: RawExample }[] = RULES.examples.map((ex) => ({
  id: slug(ex.name),
  label: ex.moniker ? `${ex.name} ‘${ex.moniker}’` : ex.name,
  build: buildFromExample(ex),
  source: ex,
}));

export function exampleBuild(id: string): NemesisBuild {
  const ex = EXAMPLES.find((e) => e.id === id);
  if (!ex) throw new Error(`Unknown example ${id}`);
  return structuredClone(ex.build);
}
