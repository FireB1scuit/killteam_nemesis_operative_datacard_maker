import { validate, isValid, stepStatus } from "../src/model/validate";
import { emptyBuild, type NemesisBuild } from "../src/model/schema";
import { migrateBuild, BuildImportError } from "../src/model/migrate";
import { EXAMPLES } from "../src/model/examples";
import { WEAPONS } from "../src/data/weapons";

const base = (over: Partial<NemesisBuild>): NemesisBuild => ({
  ...emptyBuild(), name: "Test", allegiance: "CHAOS", behaviour: "brawler", size: "M",
  weapons: [{ id: "a", weaponId: "powerFist" }], traits: ["tough", "blitz"], ...over,
});
const msgs = (b: NemesisBuild) => validate(b).map((i) => `${i.step}:${i.level}`);

describe("validate", () => {
  it("empty build lists the required fields", () => {
    const issues = validate(emptyBuild());
    expect(isValid(issues)).toBe(false);
    expect(stepStatus(issues, "operative")).toBe("error");
    expect(stepStatus(issues, "allegiance")).toBe("error");
    expect(stepStatus(issues, "behaviour")).toBe("error");
    expect(stepStatus(issues, "weapons")).toBe("warning");
  });

  it("valid M build with one unused selection → 2 traits", () => {
    expect(validate(base({}))).toEqual([]);
  });

  it("selection budget is enforced", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "heavyRailRifle" }, { id: "b", weaponId: "powerFist" }], traits: ["tough"] });
    expect(msgs(b)).toContain("weapons:error");
  });

  it("Selection 0 weapon frees a slot for an extra trait", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "closeCombatWeapon" }], traits: ["tough", "blitz"] });
    expect(validate(b).find((i) => i.step === "traits")?.message).toMatch(/1 more nemesis trait/);
  });

  it("too many / duplicate traits are errors", () => {
    expect(msgs(base({ traits: ["tough", "blitz", "fury"] }))).toContain("traits:error");
    expect(msgs(base({ traits: ["tough", "tough"] }))).toContain("traits:error");
  });

  it("modifier targets must be valid, of the right type, at most one per target", () => {
    expect(msgs(base({ weapons: [{ id: "a", weaponId: "paired" }], traits: ["tough", "blitz"] }))).toContain("weapons:error");
    expect(msgs(base({ weapons: [{ id: "a", weaponId: "meltagun" }, { id: "b", weaponId: "paired", targetId: "a" }], traits: ["tough"] }))).toContain("weapons:error");
    const twice = base({
      size: "L",
      weapons: [{ id: "a", weaponId: "powerFist" }, { id: "b", weaponId: "paired", targetId: "a" }, { id: "c", weaponId: "paired", targetId: "a" }],
      traits: ["tough"],
    });
    expect(validate(twice).filter((i) => i.level === "error")).toHaveLength(1);
  });

  it("NPO needs behaviour, player does not", () => {
    expect(msgs(base({ behaviour: undefined }))).toContain("behaviour:error");
    expect(msgs(base({ behaviour: undefined, operativeType: "player" }))).not.toContain("behaviour:error");
  });

  it("warns for 100mm+ bases", () => {
    expect(msgs(base({ base: { kind: "round", label: "130" } }))).toContain("size:warning");
    expect(msgs(base({ base: { kind: "oval", label: "105×70" } }))).toContain("size:warning");
  });
});

describe("data", () => {
  it("weapon ids are unique and every non-modifier has profiles", () => {
    const ids = WEAPONS.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const w of WEAPONS) expect([w.id, w.profiles.length > 0]).toEqual([w.id, !w.modifier]);
  });
  it("Selection X appears in WR exactly for non-1 selection weapons", () => {
    for (const w of WEAPONS.filter((x) => !x.modifier)) {
      const has = w.profiles.every((p) => p.rules.includes(`Selection ${w.selection}`));
      expect([w.id, has]).toEqual([w.id, w.selection !== 1]);
    }
  });
});

describe("migrate", () => {
  it("accepts the examples and rejects foreign data", () => {
    for (const ex of EXAMPLES) expect(migrateBuild(JSON.parse(JSON.stringify(ex.build)))).toEqual(ex.build);
    expect(() => migrateBuild({ hello: 1 })).toThrow(BuildImportError);
    expect(() => migrateBuild({ ...EXAMPLES[0].build, version: 99 })).toThrow(/newer version/);
    expect(() => migrateBuild({ ...EXAMPLES[0].build, size: "XL" })).toThrow(/damaged/);
  });
});
