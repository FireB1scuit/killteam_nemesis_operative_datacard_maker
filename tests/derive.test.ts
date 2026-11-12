import { deriveCard, rowSummary } from "../src/model/derive";
import { exampleBuild } from "../src/model/examples";
import { isValid, validate } from "../src/model/validate";
import { emptyBuild, type NemesisBuild } from "../src/model/schema";

const rows = (b: NemesisBuild) => deriveCard(b).weapons.map(rowSummary);

describe("golden: Dossier examples", () => {
  it("Armoured Sentinel ‘Armourbane’", () => {
    const b = exampleBuild("armoured-sentinel");
    const card = deriveCard(b);
    expect(card.stats).toEqual({ control: 5, move: 6, save: 4, wounds: 50 });
    expect(rows(b)).toEqual([
      'Plasma cannon (standard): 4/3+/4/6 Blast 2", Heavy (Reposition only), Piercing 1',
      'Plasma cannon (supercharge): 4/3+/5/6 Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1',
      "Close combat weapon: 3/4+/4/5 Selection 0",
    ]);
    expect(card.selections).toEqual({ used: 1, allowed: 2, unused: 1 });
    expect(card.traitSlots).toBe(2);
    expect(card.traitBlocks.map((t) => t.name)).toEqual(["Defenders of the Imperium", "Armoured", "Focused Targeting"]);
    expect(card.keywords).toEqual({ allegiance: "IMPERIUM", rest: ["NEMESIS", "ARMOURED SENTINEL"] });
    expect(card.sizeLabel).toBe("Size: Medium");
    expect(isValid(validate(b))).toBe(true);
  });

  it("XV8 Crisis ‘Shas’ui Nomura’", () => {
    const b = exampleBuild("xv8-crisis");
    const card = deriveCard(b);
    expect(card.stats).toEqual({ control: 4, move: 6, save: 4, wounds: 35 });
    expect(rows(b)).toEqual([
      'Twinned meltaguns: 4/3+/6/3 Range 6", Ceaseless, Devastating 4, Piercing 2',
      "Close combat weapon: 3/4+/4/5 Selection 0",
    ]);
    expect(card.weapons[0].rules.find((r) => r.text === "Ceaseless")?.changed).toBe(true);
    expect(card.selections).toEqual({ used: 2, allowed: 2, unused: 0 });
    expect(card.traitBlocks.map((t) => t.name)).toEqual(["Supporting Fire", "Shielded"]);
    expect(card.keywords.allegiance).toBe("T’AU EMPIRE");
    expect(validate(b)).toEqual([]);
  });

  it("Screamer-Killer ‘The Deathdirge of Varl’", () => {
    const b = exampleBuild("screamer-killer");
    const card = deriveCard(b);
    expect(card.stats).toEqual({ control: 6, move: 6, save: 4, wounds: 75 });
    expect(rows(b)).toEqual([
      'Bio-plasmic scream (standard): 4/4+/4/6 Blast 2", Heavy (Reposition only), Piercing 1',
      'Bio-plasmic scream (supercharge): 4/4+/5/6 Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1',
      "Paired scything talons: 6/3+/4/6 Relentless",
    ]);
    const [std, , talons] = card.weapons;
    expect(std.changed.hit).toBe(true);
    expect(talons.changed.atk).toBe(true);
    expect(talons.rules).toEqual([{ text: "Relentless", changed: true }]);
    expect(card.selections).toEqual({ used: 3, allowed: 3, unused: 0 });
    expect(validate(b)).toEqual([]);
  });

  it("Redemptor Dreadnought", () => {
    const b = exampleBuild("redemptor");
    const card = deriveCard(b);
    expect(rows(b)).toEqual([
      'Heavy onslaught gatling cannon: 6/3+/4/5 Heavy (Reposition only), Selection 2, Torrent 2"',
      "Power fist: 4/3+/6/8 Brutal, Shock",
    ]);
    expect(card.selections).toEqual({ used: 3, allowed: 3, unused: 0 });
    expect(card.traitBlocks.map((t) => t.name)).toEqual(["Defenders of the Imperium", "Implacable"]);
    expect(card.weapons.every((w) => !w.changed.atk && !w.changed.hit && w.rules.every((r) => !r.changed))).toBe(true);
    expect(validate(b)).toEqual([]);
  });
});

describe("engine rules", () => {
  const base = (over: Partial<NemesisBuild>): NemesisBuild => ({
    ...emptyBuild(), name: "Test", allegiance: "IMPERIUM", behaviour: "battler", size: "L", ...over,
  });

  it("Twinned burst cannon gets +1 Atk instead of Ceaseless", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "burstCannon" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual(['Twinned burst cannon: 6/3+/3/4 Ceaseless, Torrent 1"']);
    expect(deriveCard(b).weapons[0].changed.atk).toBe(true);
  });

  it("Waaagh! worsens ranged Hit and gives melee Severe", () => {
    const b = base({ allegiance: "ORK", weapons: [{ id: "a", weaponId: "rokkitLauncha" }, { id: "b", weaponId: "powerFist" }] });
    expect(rows(b)).toEqual(['Rokkit launcha: 6/5+/4/5 Blast 1"', "Power fist: 4/3+/6/8 Brutal, Severe, Shock"]);
  });

  it("Fury + Waaagh! stack on ranged Hit (4+ → 6+)", () => {
    const b = base({
      allegiance: "ORK", traits: ["fury"],
      weapons: [{ id: "a", weaponId: "rokkitLauncha" }, { id: "b", weaponId: "chainWeapon" }],
    });
    expect(rows(b)).toEqual(['Rokkit launcha: 6/6+/4/5 Blast 1"', "Chain weapon: 4/3+/5/6 Brutal, Ceaseless, Rending, Severe"]);
  });

  it("Paired + Fury on a weapon without Ceaseless gives Ceaseless", () => {
    const b = base({ traits: ["fury"], weapons: [{ id: "a", weaponId: "powerWeapon", alias: "Ghostglaive" }, { id: "b", weaponId: "paired", targetId: "a" }] });
    expect(rows(b)).toEqual(["Paired ghostglaive: 5/3+/5/7 Ceaseless, Lethal 5+"]);
  });

  it("modifier rows are not printed and invalid targets are ignored", () => {
    const b = base({ weapons: [{ id: "a", weaponId: "powerFist" }, { id: "b", weaponId: "twinned", targetId: "a" }] });
    expect(rows(b)).toEqual(["Power fist: 4/3+/6/8 Brutal, Shock"]);
  });

  it("player operative drops behaviour", () => {
    const b = base({ operativeType: "player" });
    const card = deriveCard(b);
    expect(card.actionBlock.key).toBe("player");
    expect(card.reminderBlocks.some((r) => r.name === "Behaviour")).toBe(false);
  });
});
