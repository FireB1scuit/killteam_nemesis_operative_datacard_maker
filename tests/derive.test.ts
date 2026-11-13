import { RULES } from "../src/data/rules";
import { deriveCard, keywordLine, printedRow, printedStats, rowSummary } from "../src/model/derive";
import { buildFromExample, exampleBuild } from "../src/model/examples";
import { isValid, validate } from "../src/model/validate";
import { emptyBuild, type NemesisBuild } from "../src/model/schema";

const rows = (b: NemesisBuild) => deriveCard(b).weapons.map(rowSummary);

describe("golden: rules-data.json examples[].expected", () => {
  it.each(RULES.examples.map((ex) => [ex.name, ex] as const))("%s", (_name, ex) => {
    const build = buildFromExample(ex);
    const card = deriveCard(build);
    expect(printedStats(card)).toEqual(ex.expected.stats);
    expect(card.selections.used).toBe(ex.expected.selectionsUsed);
    expect(card.traitSlots).toBe(ex.expected.traitsAllowed);
    expect(card.weapons.map(printedRow)).toEqual(ex.expected.rows);
    expect(keywordLine(card)).toBe(ex.expected.keywords);
    expect(validate(build)).toEqual([]);
  });
});

describe("card text", () => {
  it("allegiance trait prints the official card wording (cardText)", () => {
    const card = deriveCard(exampleBuild("screamer-killer"));
    const tyranid = RULES.allegiances.find((a) => a.id === "TYRANID")!;
    expect(card.traitBlocks[0]).toMatchObject({ name: "Will of the Hive Mind", text: tyranid.cardText });
    expect(card.traitBlocks[0].text).toMatch(/^Ignore the changes to TYRANID NPO/);
  });

  it("trait blocks list the allegiance trait first, then the nemesis traits in order", () => {
    const card = deriveCard(exampleBuild("armoured-sentinel"));
    expect(card.traitBlocks.map((t) => t.name)).toEqual(["Defenders of the Imperium", "Armoured", "Focused Targeting"]);
  });

  it("Paired + Fury highlights the changed values", () => {
    const card = deriveCard(exampleBuild("screamer-killer"));
    const [std, , talons] = card.weapons;
    expect(std.changed.hit).toBe(true);
    expect(talons.changed.atk).toBe(true);
    expect(talons.rules).toEqual([{ text: "Relentless", changed: true }]);
  });

  it("Redemptor has nothing calculated", () => {
    const card = deriveCard(exampleBuild("redemptor-dreadnought"));
    expect(card.weapons.every((w) => !w.changed.atk && !w.changed.hit && w.rules.every((r) => !r.changed))).toBe(true);
  });

  it("weapon without rules prints a dash", () => {
    const b = { ...emptyBuild(), weapons: [{ id: "a", weaponId: "autocannon" }] };
    expect(printedRow(deriveCard(b).weapons[0]).wr).toBe("-");
  });
});

describe("engine edge cases", () => {
  const base = (over: Partial<NemesisBuild>): NemesisBuild => ({
    ...emptyBuild(), name: "Test", allegiance: "IMPERIUM", behaviour: "BATTLER", size: "L", ...over,
  });

  it("Twinned on a burst cannon gives +1 Atk instead of Ceaseless", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "burst_cannon" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual(['Twinned burst cannon: 6/3+/3/4 Ceaseless, Torrent 1"']);
    const row = deriveCard(b).weapons[0];
    expect(row.changed.atk).toBe(true);
    expect(row.rules.every((r) => !r.changed)).toBe(true);
  });

  it("Twinned on a two-profile weapon changes both profiles; an alias is used as-is", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "plasma_gun", alias: "Twin plasma guns" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual([
      "Twin plasma guns (standard): 4/3+/4/6 Ceaseless, Piercing 1",
      "Twin plasma guns (supercharge): 4/3+/5/6 Ceaseless, Hot, Lethal 5+, Piercing 1",
    ]);
  });

  it("Fury on a melee weapon that already has Ceaseless replaces it with Relentless", () => {
    const b = base({ traits: ["FURY"], weapons: [{ id: "a", weaponId: "scything_talons" }] });
    expect(rows(b)).toEqual(["Scything talons: 5/3+/4/6 Relentless"]);
  });

  it("Fury on a melee weapon without Ceaseless adds Ceaseless; Paired adds +1 Atk", () => {
    const b = base({ traits: ["FURY"], weapons: [{ id: "a", weaponId: "power_weapon" }, { id: "b", weaponId: "paired", targetId: "a" }] });
    expect(rows(b)).toEqual(["Paired power weapon: 5/3+/5/7 Ceaseless, Lethal 5+"]);
  });

  it("Ork Waaagh! worsens ranged Hit by 1 and gives melee Severe", () => {
    const b = base({ allegiance: "ORK", weapons: [{ id: "a", weaponId: "rokkit_launcha" }, { id: "b", weaponId: "power_fist" }] });
    expect(rows(b)).toEqual(['Rokkit launcha: 6/5+/4/5 Blast 1"', "Power fist: 4/3+/6/8 Brutal, Severe, Shock"]);
  });

  it("Hit is clamped at 6+ (Fury + Waaagh! on a 4+ weapon would be 6+, on a 5+ still 6+)", () => {
    const b = base({
      allegiance: "ORK", traits: ["FURY"],
      weapons: [{ id: "a", weaponId: "rokkit_launcha" }, { id: "b", weaponId: "chain_weapon" }],
    });
    expect(rows(b)).toEqual(['Rokkit launcha: 6/6+/4/5 Blast 1"', "Chain weapon: 4/3+/5/6 Brutal, Ceaseless, Rending, Severe"]);
    expect(validate(b).some((i) => /stack/.test(i.message))).toBe(true);
  });

  it("rule order: Range first, then alphabetical", () => {
    const b = base({ allegiance: "ORK", weapons: [{ id: "a", weaponId: "heavy_flamer" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual(['Twinned heavy flamer: 5/3+/3/3 Range 8", Ceaseless, Saturate, Torrent 2"']);
  });

  it("modifier rows are not printed and invalid targets are ignored", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "power_fist" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual(["Power fist: 4/3+/6/8 Brutal, Shock"]);
  });

  it("player operative has no behaviour and gets the player restrictions bar", () => {
    const card = deriveCard(base({ operativeType: "player" }));
    expect(card.actionBlock.key).toBe("player");
    expect(card.actionBlock.effect).toBe(RULES.playerOperative);
    expect(card.reminderBlocks.some((r) => r.name === "Behaviour")).toBe(false);
  });

  it("NPO behaviour bar prints the verbatim behaviour text and priority list", () => {
    const card = deriveCard(base({}));
    const battler = RULES.behaviours.find((x) => x.id === "BATTLER")!;
    expect(card.actionBlock).toMatchObject({ title: "Behaviour: Battler", tag: "NPO", effect: battler.text, priorities: battler.priority });
  });

  it("oval base labels print with ×", () => {
    expect(deriveCard(base({ base: { kind: "oval", label: "105x70" } })).base).toEqual({ kind: "oval", label: "105×70" });
  });

  it("valid example builds stay valid", () => {
    for (const id of ["armoured-sentinel", "xv8-crisis-battlesuit", "screamer-killer", "redemptor-dreadnought"]) {
      expect(isValid(validate(exampleBuild(id)))).toBe(true);
    }
  });
});
