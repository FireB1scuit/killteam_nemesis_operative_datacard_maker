import { RULES } from "../src/data/rules";
import { glossaryFor, WEAPON_RULE_GLOSSARY } from "../src/data/weaponRules";
import { deriveCard } from "../src/model/derive";
import { buildFromExample } from "../src/model/examples";
import { emptyBuild, type NemesisBuild } from "../src/model/schema";
import { weaponRuleReference } from "../src/model/weaponRules";

const terms = (b: NemesisBuild) => weaponRuleReference(deriveCard(b)).map((e) => e.term);

describe("weaponRuleReference", () => {
  it.each(RULES.examples.map((ex) => [ex.name, ex] as const))("%s matches expected.weaponRuleReference", (_n, ex) => {
    expect(terms(buildFromExample(ex))).toEqual(ex.expected.weaponRuleReference);
  });

  it("is alphabetical and lists each rule once", () => {
    const list = terms({
      ...emptyBuild(), size: "L", allegiance: "CHAOS",
      weapons: [{ id: "a", weaponId: "heavy_bolter" }, { id: "b", weaponId: "havoc_launcher" }, { id: "c", weaponId: "rokkit_launcha" }],
    });
    expect(list).toEqual([...list].sort((a, b) => a.localeCompare(b)));
    expect(new Set(list).size).toBe(list.length);
    expect(list).toEqual(["Balanced", "Blast x", "Piercing x", "Torrent x"]);
  });

  it("doesn't mistake 'Heavy terrain' (Violent Demise) for the Heavy weapon rule", () => {
    const list = terms({ ...emptyBuild(), allegiance: "NECRON", traits: ["VIOLENT_DEMISE"], weapons: [{ id: "a", weaponId: "power_fist" }] });
    expect(list).not.toContain("Heavy");
    expect(list).toEqual(["Brutal", "Shock"]);
  });

  it("includes weapon rules named only in trait text", () => {
    expect(terms({ ...emptyBuild(), allegiance: "IMPERIUM", traits: ["BLITZ"], weapons: [] })).toEqual(["Severe", "Shock"]);
    expect(terms({ ...emptyBuild(), allegiance: "IMPERIUM", traits: ["CLOSE_RANGE_LETHALITY"], weapons: [] })).toEqual(["Lethal x+", "Severe"]);
  });

  it("glossary entries come straight from rules-data.json", () => {
    expect(WEAPON_RULE_GLOSSARY.map((e) => e.text).sort()).toEqual(RULES.weaponRuleGlossary.entries.map((e) => e.text).sort());
    expect(glossaryFor('Blast 2"')?.term).toBe("Blast x");
    expect(glossaryFor("Piercing Crits 1")?.term).toBe("Piercing x");
    expect(glossaryFor("Heavy (Reposition only)")?.term).toBe("Heavy");
    expect(glossaryFor("Selection 0")?.source).not.toBe("Lite Rules");
  });
});
