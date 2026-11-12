# Nemesis Operative Datacard Maker — Plan

A browser app (static, hosted on GitHub Pages) for building a **Kill Team (2024 edition) Nemesis operative**
using the *Nemesis Custom Builder* rules from the *Nemesis Operatives Dossier*, then exporting it as a
print-ready datacard (PNG or PDF). An exported file can be loaded back into the app to keep editing.

**All rules, card text, the calculation algorithm and the test cases are in [`docs/rules-reference.md`](docs/rules-reference.md), with machine-readable data in [`docs/rules-data.json`](docs/rules-data.json). Those two files override §2 below if they ever differ.**

Visual references live in [`docs/mockups/`](docs/mockups/):

| File | What it shows |
|---|---|
| [`datacard.html`](docs/mockups/datacard.html) / [`datacard.png`](docs/mockups/datacard.png) | The two output cards in **KT 2024 datacard format**, filled with the Dossier's Screamer-Killer example |
| [`app.html`](docs/mockups/app.html) / [`app.png`](docs/mockups/app.png) | Editor layout: step form on the left, live card preview on the right, import/export in the top bar |
| [`pdf-page.html`](docs/mockups/pdf-page.html) / [`pdf-page.png`](docs/mockups/pdf-page.png) | PDF export page: both cards at true size (A4), cut line, and the **weapon rules reference** below |
| [`card.css`](docs/mockups/card.css) | Shared card styling. This is the starting point for the real card component |

Sources used: `reference/Kill Team - Nemesis Operatives Dossier.pdf` (builder on pp. 14–20, examples on
pp. 24–31), `reference/Kill Team Lite Rules [2025-07].pdf`, the Kill Team 2024 Core Rules, and
<https://ktdash.app/killteams/SPEC-NEM> (confirms stats, the composition table and option lists).
The card format follows the Core Rules "Datacards" page (book p.48, PDF page 50).

---

## 1. Scope

### In scope (v1)
- Step-by-step builder that follows the Dossier: **Allegiance → Size → Behaviour (NPO only) → Weapons → Traits → Name**.
- Free-text **operative name**, optional **moniker/call sign**, and an optional **alias for each weapon**.
- **Model picture upload**, with pan and zoom inside the card's portrait frame.
- **Allegiance** picker (the 8 allegiance keywords from the Dossier; sets the keyword and allegiance trait).
- **Base size** picker (presets plus custom).
- **Player operative vs NPO** toggle (changes the card title and whether Behaviour applies).
- Live preview of **Card 1 (datacard)** and **Card 2 (rules card)**.
- Weapon profiles are calculated with the trait and modifier changes already applied, as on the official example cards.
- Rule checking: selection budget, trait count, no duplicate traits, Twinned/Paired targets, NPO behaviour.
- Export **PNG** (each card, or both side by side) and **PDF** (one card per page at card size, or a print sheet with cut marks).
- **Weapon rules reference** (PDF option, on by default): below the card(s) on the PDF, every weapon rule used on the cards, in alphabetical order, explained exactly as in the Lite Rules' "Weapon Rules" list (see §4.1).
- **Import** a PDF/PNG exported by the app, or a `.json` save, and keep editing.
- Autosave of the current build in the browser (`localStorage`).
- Deployed to GitHub Pages by a GitHub Actions workflow.

### Out of scope (v1, possible later)
- Rosters with several nemesis operatives, or a whole kill team.
- Datacards for normal (non-nemesis) operatives.
- Pre-built Ambull and Archivist cards (they have fixed rules; could be added later as "presets").
- Accounts or cloud storage. Everything stays client-side.

---

## 2. Rules data (from the Dossier, pp. 14–20)

This becomes typed data files in `src/data/`. The text below is the spec. The data files must match it.

### 2.1 Size table
| Size | Control* | Move | Save | Wounds | Weapon selections |
|---|---|---|---|---|---|
| Small (S) | 4 | 6" | 4+ | 35 | 2 |
| Medium (M) | 5 | 6" | 4+ | 50 | 2 |
| Large (L) | 6 | 6" | 4+ | 75 | 3 |

\*Control replaces APL in every case except spending action points (control of markers, rules that compare a dice result to APL, etc.).

Kill team operatives allowed alongside the nemesis (shown in the app as info, not printed on the card):

| Normal team size | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 |
|---|---|---|---|---|---|---|---|---|---|---|
| with Small | 4 | 4 | 5 | 5 | 6 | 7 | 7 | 8 | 9 | 9 |
| with Medium | 3 | 3 | 4 | 4 | 5 | 5 | 6 | 6 | 7 | 7 |
| with Large | 2 | 2 | 2 | 3 | 3 | 3 | 4 | 4 | 4 | 5 |

### 2.2 Allegiances (keyword → allegiance trait)
| Keyword | Trait | Rule |
|---|---|---|
| AELDARI | Arrogant Superiority | Whenever this operative is shooting against or fighting against a ready enemy operative, if two or more fails are rolled for it, one of them can be discarded to re-roll another. |
| CHAOS | Let the Galaxy Burn | Whenever this operative is wholly within enemy territory, its weapons have the Balanced weapon rule. |
| IMPERIUM | Defenders of the Imperium | Whenever an operative is shooting this operative, if this operative is wholly within your territory, one of its defence dice can be retained as a normal success without rolling it (in addition to a cover save, if any). |
| LEAGUES OF VOTANN | Acquisition at All Costs | Whenever this operative is shooting against or fighting against an enemy operative that contests an objective marker, or an area of the killzone that determines victory (e.g. flanks on pg 50), this operative's weapons have the Balanced weapon rule. |
| NECRON | Living Metal | In the Ready step of each Strategy phase, this operative regains up to D3+1 lost wounds. |
| ORK | Waaagh! | Whenever this operative is fighting, its weapons have the Balanced weapon rule. Worsen the Hit stat of this operative's ranged weapons by 1, but its melee weapons have the Severe weapon rule. |
| T'AU EMPIRE | Supporting Fire | Whenever this operative is within 3" of another friendly T'AU EMPIRE operative, this operative's ranged weapons have the Accurate 1 weapon rule. |
| TYRANID | Will of the Hive Mind | Ignore changes to this operative's stats from being injured (including its weapons' stats). |

(The table above is the book's friendly wording. The card prints the **official allegiance card wording** instead (`cardText` in docs/rules-data.json).)

### 2.3 Behaviours (NPO only)
Each behaviour has a short description, an order rule and a numbered action priority list. Full text is on Dossier p. 15:
- **Brawler**: Fight › Charge closest › Reposition towards closest (to cover) › Dash towards closest (to cover). Engage if NEMESIS NPO or will Fight/Charge.
- **Battler**: Fight › Charge closest › Reposition › Shoot › Dash. Engage if NEMESIS NPO or will Fight/Charge/Shoot.
- **Guardian**: Fight › Shoot › Charge closest within 4" › Reposition (to unobscured target or mission position) › Dash.
- **Marksman**: Fall Back › Shoot › Reposition › Dash (each towards a valid unobscured target or a mission-appropriate location). Engage if NEMESIS NPO or will Shoot.

A player operative has no behaviour. It cannot perform mission actions or unique equipment actions, except **Operate Hatch** and **Breach**.

### 2.4 Weapons
Each pick uses `selection` slots: 1 by default, 2 for "Selection 2", 0 for "Selection 0".
The *Alternatives* column feeds **search aliases** in the weapon picker, so typing "deathspitter" finds Autocannon.
A weapon with two profiles (standard/supercharge, frag/krak) is **one** pick that prints **two rows**.

**Ranged**
| Name | Atk | Hit | Dmg | Weapon rules | Sel | Alternatives |
|---|---|---|---|---|---|---|
| Autocannon | 5 | 3+ | 5/6 | – | 1 | Deathspitter, missile pod |
| Burst cannon | 5 | 3+ | 3/4 | Ceaseless, Torrent 1" | 1 | Scatter laser, devourer |
| Cyclic ion raker | 5 | 3+ | 4/5 | Heavy (Reposition only), Piercing 1, Torrent 2" | 2 | – |
| Flamestorm cannon | 6 | 2+ | 3/3 | Range 8", Heavy (Reposition only), Torrent 2" | 2 | Flamespurt |
| Havoc launcher | 4 | 3+ | 4/6 | Blast 2" | 1 | Grotzooka, spore mine launcher |
| Heavy bolter | 5 | 3+ | 4/5 | Piercing Crits 1, Torrent 1" | 1 | – |
| Heavy flamer | 5 | 2+ | 3/3 | Range 8", Saturate, Torrent 2" | 1 | Incendine combustor, liquifier gun, skorcha |
| Heavy onslaught gatling cannon | 6 | 3+ | 4/5 | Heavy (Reposition only), Torrent 2" | 2 | Avenger chaincannon, enmitic exterminator |
| Heavy phosphor blaster | 5 | 3+ | 4/5 | Saturate, Severe | 1 | – |
| Heavy rail rifle | 5 | 3+ | 6/7 | Heavy (Reposition only), Piercing 2 | 2 | Doomsday blaster, gauss destructor |
| Heavy stubber | 5 | 3+ | 4/5 | Torrent 1" | 1 | Big shoota |
| Lascannon | 4 | 3+ | 6/7 | Heavy (Reposition only), Piercing 2 | 1 | Bright lance, dark lance |
| Macro plasma incinerator — standard | 5 | 3+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1 | 2 | – |
| Macro plasma incinerator — supercharge | 5 | 3+ | 5/6 | Blast 2", Heavy (Reposition only), Lethal 5+, Piercing 1 | (same pick) | – |
| Meltagun | 4 | 3+ | 6/3 | Range 6", Devastating 4, Piercing 2 | 1 | Fusion blaster, heat lance |
| Missile launcher — frag | 4 | 3+ | 3/5 | Blast 2" | 1 | – |
| Missile launcher — krak | 4 | 3+ | 5/7 | Piercing 1 | (same pick) | – |
| Multi-melta | 4 | 3+ | 6/3 | Devastating 4, Heavy (Reposition only), Piercing 2 | 1 | – |
| Plasma cannon — standard | 4 | 3+ | 4/6 | Blast 2", Heavy (Reposition only), Piercing 1 | 1 | – |
| Plasma cannon — supercharge | 4 | 3+ | 5/6 | Blast 2", Heavy (Reposition only), Hot, Lethal 5+, Piercing 1 | (same pick) | – |
| Plasma gun — standard | 4 | 3+ | 4/6 | Piercing 1 | 1 | – |
| Plasma gun — supercharge | 4 | 3+ | 5/6 | Hot, Lethal 5+, Piercing 1 | (same pick) | – |
| Rokkit launcha | 6 | 4+ | 4/5 | Blast 1" | 1 | – |
| Shuriken cannon | 5 | 3+ | 4/5 | Rending, Torrent 1" | 1 | – |
| Splinter cannon | 5 | 3+ | 3/5 | Lethal 5+, Torrent 1" | 1 | – |
| Starcannon | 4 | 3+ | 5/6 | Lethal 5+, Piercing 1 | 1 | Heavy venom cannon, kustom mega-blasta |
| Stranglethorn cannon | 5 | 3+ | 3/5 | Blast 2", Lethal 5+ | 1 | – |
| Thermal spear | 5 | 3+ | 6/3 | Devastating 4, Heavy (Reposition only), Piercing 2 | 2 | Fusion collider |
| **Twinned weapon** (modifier) | – | – | – | Select one other ranged weapon: it gains Ceaseless; if it's a burst cannon, +1 Atk instead. | 1 | – |

(The Dossier prints "Muti-melta". The app corrects it to Multi-melta.)

**Melee**
| Name | Atk | Hit | Dmg | Weapon rules | Sel | Alternatives |
|---|---|---|---|---|---|---|
| Chain weapon | 4 | 3+ | 5/6 | Brutal, Rending | 1 | – |
| Close combat weapon | 3 | 4+ | 4/5 | Selection 0 | 0 | – |
| Dread saw | 5 | 3+ | 4/5 | Rending | 1 | – |
| Fleshmower | 5 | 2+ | 4/5 | Brutal | 1 | – |
| Power fist | 4 | 3+ | 6/8 | Brutal, Shock | 1 | Crushing claw |
| Power scourge | 6 | 3+ | 3/5 | Lethal 5+ | 1 | Lasher tendrils |
| Power talon | 4 | 3+ | 5/6 | Lethal 5+, Rending | 1 | – |
| Power weapon | 4 | 3+ | 5/7 | Lethal 5+ | 1 | Ghostglaive |
| Scything talons | 5 | 3+ | 4/6 | Ceaseless | 1 | Macro-scalpels |
| Thunder hammer | 4 | 3+ | 6/8 | Shock, Stun | 1 | – |
| **Paired weapon** (modifier) | – | – | – | Select one other melee weapon: +1 Atk. | 1 | – |

How the "Selection X" rule is printed (based on the official example cards): the Sentinel card prints "Selection 0" on its close combat weapon, but the
Redemptor card's gatling cannon prints Selection 2. Keep the Selection rule in the WR text exactly as in the weapon table.

### 2.5 Nemesis traits
Armoured, Blitz, Duellist, Focused Targeting, Close-range Lethality, Fury, Implacable, Crushing Impact,
Shielded, Shrouded, Tenacious, Tough, Violent Demise. The full rule text is on Dossier p. 19 and goes verbatim into `src/data/traits.ts`.

Count: **1 + (unused weapon selections)**. No duplicates.

### 2.6 Core Nemesis rules (on every nemesis card)
- **Extra Defence**: one additional defence dice when shot, unless injured.
- **Bulky**: no Vantage above 2"; Fight control range 1" horizontal / 4" vertical; moves through non-NEMESIS operatives; ignores APL changes (player: APL changes don't affect the 5AP).
- **Towering Size**: no Conceal in the Firefight phase; limited cover/obscuring; can be shot while within friendly control range; terrain-movement rules.
- No faction keyword when it's a player operative. Activates twice per turning point (restrictions come from the mission pack).

Keywords printed on the card: `<ALLEGIANCE>, NEMESIS, <NAME KEYWORD>`, e.g. `TYRANID, NEMESIS, SCREAMER-KILLER`.

---

## 3. Builder behaviour

### 3.1 Steps (form on the left, see `app.png`)
1. **Operative**: Player/NPO toggle, name, moniker (optional), name keyword (filled in from the name, editable), picture upload.
2. **Allegiance**: 8 allegiance chips that set the keyword and allegiance trait.
3. **Size & base**: S/M/L (each option shows its stat line). Base size preset or custom; a warning for 100mm+ bases.
4. **Behaviour**: shown only for NPOs. One of 4.
5. **Weapons**: budget meter (`used / allowed`). Each row: weapon picker (searchable, alternatives included) + alias field + cost badge + remove. Twinned/Paired rows get a "target" dropdown instead of an alias.
6. **Traits**: chips; the allowed count updates from unused selections. Allegiance trait shown as read-only.

Each step header shows ✓ / warning status. Export works even with warnings, but asks for confirmation if the build is invalid.

### 3.2 Allegiance
Allegiance is the only "faction" choice: AELDARI, CHAOS, IMPERIUM, LEAGUES OF VOTANN, NECRON, ORK, T'AU EMPIRE, TYRANID.
It sets the first keyword (printed in orange in the footer, where a normal card shows its faction keyword) and the allegiance trait.
A NEMESIS operative never gains a kill team faction keyword, so the app has no kill-team picker.

### 3.3 Base sizes
Presets: round 25, 28.5, 32, 40, 50, 60, 80, 90, 100, 130, 160 mm; oval 60×35, 75×42, 90×52, 105×70, 120×92, 150×95, 170×105 mm; plus custom text.
Printed in the footer circle (the official cards show e.g. `SIZE: LARGE (90)`).

### 3.4 Calculation engine (`derive.ts`)
A pure function `deriveCard(build) → CardModel`, unit-tested. Order of application:
1. Base stats from the size.
2. Expand each weapon pick into its profile rows. A row's label is `alias ?? name` (plus the profile suffix). The base weapon name is shown in the editor only, not on the card (KT format has no subtitle row).
3. **Twinned** → target gets Ceaseless (burst cannon: +1 Atk instead). Label becomes "Twinned &lt;name&gt;" (plural is up to the user via the alias).
4. **Paired** → target +1 Atk. Label becomes "Paired &lt;name&gt;". The Twinned/Paired rows themselves are not printed.
5. **Fury** → melee: Ceaseless, or Relentless if it already has Ceaseless (Relentless replaces Ceaseless on the card); ranged: Hit +1 (worse).
6. **Waaagh!** → ranged Hit +1 (worse), melee gains Severe. "Balanced when fighting" stays as rule text only.
7. Hit is capped at 6+. Duplicate weapon rules are merged.
8. Changed values are marked so the preview can **highlight** them. Highlighting is optional (off by default in exports, like the official cards).

Conditional rules (Blitz, Close-range Lethality, Supporting Fire, Armoured, etc.) are **not** applied to the stats. They appear as text only.

**Golden tests**: the four Dossier examples must come out exactly as printed:
| Example | Build | Expected |
|---|---|---|
| Armoured Sentinel ‘Armourbane’ | IMPERIUM, M, Marksman, Plasma cannon + CCW | C5/6"/4+/50; CCW 3/4+/4/5 Selection 0; 1 unused → traits Armoured + Focused Targeting |
| XV8 Crisis ‘Shas’ui Nomura’ | T'AU, S, Marksman, Meltagun + Twinned + CCW | Twinned meltaguns 4/3+/6/3 Range 6", Ceaseless, Devastating 4, Piercing 2; trait Shielded |
| Screamer-Killer ‘The Deathdirge of Varl’ | TYRANID, L, Battler, Plasma cannon + Scything talons + Paired, Fury | Plasma 4/**4+**; Paired scything talons **6**/3+/4/6 **Relentless** |
| Redemptor Dreadnought | IMPERIUM, L, Guardian, Heavy onslaught gatling (Sel 2) + Power fist, Implacable | 6/3+/4/5 …Selection 2, Torrent 2"; Power fist 4/3+/6/8 |

### 3.5 Validation
- Selections used ≤ allowed. Twinned/Paired must have a valid, different target of the right type, and at most one modifier per target.
- At least one weapon (warning only).
- Trait count = 1 + unused selections, with no duplicates.
- NPO ⇒ behaviour required. Player ⇒ behaviour hidden and removed from the card.
- Name required. Picture optional (falls back to a neutral placeholder or the allegiance emblem).

---

## 4. Card design (see `docs/mockups/datacard.png`)

The final cards follow the **Kill Team 2024 (3rd edition) datacard format**, as described in the Core Rules on p.48 "Datacards"
(PDF page 50) and shown on official cards such as the Kommando Dakka Boy. The anatomy, numbered as in the Core Rules:

| # | Core Rules element | Nemesis card |
|---|---|---|
| 1 | Name: white condensed caps, orange underline, on the dark textured header | Operative name; the **moniker** goes in small caps under the underline |
| – | Model picture in the header, between the name and the stats | The **uploaded picture**. User pan and zoom; it fades into the header on the left (CSS mask) so a normal photo still blends in |
| 2 | Stat tiles: 4 separate dark tiles, label on top, orange icon + big value | **CONTROL** · MOVE · SAVE · WOUNDS (Control replaces APL) |
| 3 | Weapon table: `NAME ATK HIT DMG WR`, orange rule under the header and after the last row, alternating grey rows, orange ranged/melee icons | The same. Weapon values are final (§3.4). The alias replaces the name. The table has no subtitle row, so it matches official cards |
| 4 | WR column | Weapon rules, including `Selection X` where the weapon table has it |
| 5 | Abilities under the table: rules as **bold name:** text; actions as an orange bar (name + AP) with ▶ green effect / ◆ red restriction | Card 1: allegiance trait + nemesis traits written out in full, plus Nemesis/Control/Behaviour reminders. Card 2: behaviour as an action bar with its priority list, and the core Nemesis rules written out |
| 6 | Keyword footer: dark bar; faction keyword in orange, the rest white | `<ALLEGIANCE>` in orange, then `NEMESIS, <NAME KEYWORD>`. On the right: `NPO · SIZE: LARGE` and the card number (`1/2`) |
| 7 | Base size circle (e.g. 28, 32) | Base size in mm (`90`). An oval base gets a pill-shaped badge (`105×70`) |

The body is a light grey textured background with large rounded corners. Accent colour is the orange used throughout KT 2024 (CSS variable `--faction`, can be themed).

**Card 1 (front): Datacard**: header + weapons + traits (the things you check every activation).
**Card 2 (back / second card)**: same header and footer. Behaviour action bar (NPO) or player-nemesis restrictions (player), then
Extra Defence, Bulky and Towering Size as abilities. Like official datacards, both can be printed double-sided (front/back) or as two separate cards.

**Overflow handling**: content is laid out as a list of ability blocks. Card 1 takes as many trait blocks as fit under the weapon table.
The rest **flows onto card 2**, before the core rules. A `fitText` routine then reduces the font size (min ~13px at 1x) if card 2 still overflows.
Worst case to test: Large NPO with a Selection 0 melee weapon (up to 4 nemesis traits) and 3 two-profile weapons (6 table rows).

**Sizing**
- Designed at **1200×700 CSS px = 120×70 mm** (10 px/mm). That's the KT 2024 card ratio taken from the Core Rules example (~1.7:1).
- PNG export at pixelRatio 3 (3600×2100 px). PDF places the PNGs at exactly 120×70 mm per page, or on an A4/Letter sheet with cut marks.
- Fonts: **Oswald** + **Roboto Condensed** (OFL). They are self-hosted so exports look the same offline and canvas capture isn't blocked.
- Icons: original SVGs that only echo the KT shapes (triangle, arrow, shield, drop, bullets, blade). No Games Workshop artwork or logos.
- Calculated values can be highlighted in orange in the editor preview. Exports are plain by default, like official cards.

### 4.1 Weapon rules reference (PDF add-on)
A **toggle button** lets the user add the weapon rules below the card(s) on the PDF or leave them out. It is **on by default**.
- **Toggle**: a switch labelled **"Weapon rules on PDF"** in the top bar, directly left of **Export PDF** (see `docs/mockups/app.png`), with an On/Off state label, `role="switch"` + `aria-checked`, and a tooltip. Under the preview, a line shows what the PDF will contain ("PDF will include 7 weapon rules: …"), or "Weapon rules not included" when off.
- **Persistence**: the choice is stored in the build JSON (`options.weaponRulesOnPdf`, default `true`), so a re-imported PDF/PNG/JSON keeps it. It is also remembered as the user's default for new builds (localStorage, wrapped in try/catch).
- **Effect**: on → the reference block below the cards (as described here); off → the PDF contains only the cards, using the card-only layouts from §5.2. PNG exports never include it.
- **Content**: every weapon rule that appears on the printed cards (the WR column, plus weapon rules named in trait/allegiance text, e.g. Fury → Ceaseless/Relentless, Focused Targeting → Punishing, Supporting Fire → Accurate). **Only weapon rules**, no other game terms. Each rule is listed once by its generic name (`Blast 2"` → **Blast x**, `Heavy (Reposition only)` → **Heavy**, `Piercing Crits 1` → **Piercing x**).
- **Text**: exactly as in the "Weapon Rules" list on the last page of the Kill Team Lite Rules. **Selection x** isn't in the Lite Rules, so it uses the Dossier wording with a small source label.
- **Order**: alphabetical.
- **Data & detection**: `docs/rules-data.json → weaponRuleGlossary.entries` (`term`, `text`, `source`, `match` regexes). The rule is in `docs/rules-reference.md` §12. A pure function `weaponRuleReference(card) → entries[]` runs the regexes over the final printed card text; each golden example has an `expected.weaponRuleReference` list for tests.
- **Layout** (see `docs/mockups/pdf-page.png`): with the option on, the PDF uses an A4/Letter portrait page: card 1 and card 2 at true size (120 × 70 mm) at the top, a dashed cut line, then a `WEAPON RULES` heading with an orange rule and the entries as **Term:** text in 2 columns (Roboto Condensed ~8pt). It continues on a second page if it doesn't fit. Double-sided layout: card 1 + reference on the front page, card 2 in the mirrored position on the back.
- **Rendering**: real, selectable PDF text via `pdf-lib` + `@pdf-lib/fontkit` with the self-hosted Roboto Condensed (regular + bold), using a simple word-wrap/column layout. (Fallback if that proves fiddly: render the block as HTML and embed it as an image at 3x.)
- The same entries are used for weapon-rule tooltips in the editor, whether the toggle is on or off.

---

## 5. Save / export / import

### 5.1 Build document (single source of truth)
```ts
type NemesisBuild = {
  schema: "nemesis-datacard";       // magic string
  version: 1;                       // bump + migrate on change
  operativeType: "player" | "npo";
  name: string; moniker?: string; nameKeyword: string;
  allegiance: AllegianceId; theme?: string;
  size: "S" | "M" | "L"; base: { kind: "round" | "oval" | "custom"; label: string };
  behaviour?: BehaviourId;
  weapons: Array<{ id: string; weaponId: WeaponId; alias?: string; targetId?: string }>;
  options?: { weaponRulesOnPdf: boolean };   // default true
  traits: TraitId[];
  image?: { dataUrl: string; x: number; y: number; zoom: number };
  createdWith: string;              // app version
};
```
Validated with **zod** on import. Uploaded images are downscaled to a maximum of 1600 px on the long edge and re-encoded (WebP/JPEG at ~0.85) before they are stored, so files stay small.

### 5.2 Export
| Format | How | Embedded build data |
|---|---|---|
| PNG | `html-to-image` renders the card DOM at 3x. Options: card 1, card 2, or both side by side | `iTXt` chunk `nemesis-datacard` containing the build JSON (small chunk writer, no heavy dependency) |
| PDF | `pdf-lib`: embed the PNG(s). Layout A: one card per page at card size. Layout B: A4/Letter sheet with both cards (plus cut marks). **Weapon rules reference on** (default): A4/Letter page with the cards on top and the reference below (§4.1) | JSON **file attachment** `nemesis-build.json` + a custom Info-dictionary key as a fallback |
| JSON | Plain download | It *is* the build |

File name: `nemesis-<name-keyword>-<size>.png|pdf`.

### 5.3 Import
A single "Import" button (plus drag-and-drop onto the app):
- `.json` → parse.
- `.png` → read the `iTXt` chunk.
- `.pdf` → `pdf-lib` load → read the attachment (or the Info key).
- Show an error if the file has no build data ("This file wasn't exported by Nemesis Datacard Maker"). PDFs or images from other sources **cannot** be turned back into a build (no OCR).
- Run version migrations, then load into the editor. If there are unsaved changes, ask before replacing them.

---

## 6. Tech stack & structure

- **Vite + React + TypeScript** (static output, fast dev server, suits GitHub Pages).
- State: React `useReducer` + context (the app is small; no external store needed). Autosave to `localStorage` (wrapped in try/catch).
- Libraries: `html-to-image`, `pdf-lib`, `zod`. Tests: `vitest` (+ `@testing-library/react` for a smoke test).
- Styling: plain CSS modules. The card CSS starts from `docs/mockups/card.css` (KT 2024 format, 1200×700).

```
src/
  data/        sizes.ts weapons.ts allegiances.ts traits.ts behaviours.ts coreRules.ts bases.ts
  model/       schema.ts (types + zod)  derive.ts  validate.ts  migrate.ts
  card/        Datacard.tsx  RulesCard.tsx  icons.tsx  fitText.ts  card.css
  editor/      StepOperative.tsx StepAllegiance.tsx StepSize.tsx StepBehaviour.tsx StepWeapons.tsx StepTraits.tsx ImageCropper.tsx
  io/          exportPng.ts  exportPdf.ts  pngText.ts  importFile.ts
  App.tsx  main.tsx
tests/         derive.test.ts (golden examples)  validate.test.ts  weaponRules.test.ts  io.roundtrip.test.ts
public/fonts/  Oswald + Roboto Condensed (woff2)
.github/workflows/deploy.yml
```

**Deployment**: GitHub Actions on push to `main` → `npm ci && npm test && npm run build` → `actions/upload-pages-artifact` → `actions/deploy-pages`.
`vite.config.ts` sets `base: "/<repo-name>/"`.

---

## 7. Milestones

1. **Scaffold**: Vite/React/TS, lint, vitest, Pages workflow deploying a placeholder. Fix repo housekeeping (see §9).
2. **Rules data + engine**: data files from §2, `deriveCard`, `validate`, golden tests for the four Dossier examples.
3. **Card components**: Datacard (front) + second card in KT 2024 format from the mockup CSS, ability-block flow between cards, `fitText`, self-hosted fonts, worst-case fixtures.
4. **Editor**: six steps, live preview tabs, validation status, autosave.
5. **Picture upload**: file/drag-drop, downscale, pan/zoom cropper.
6. **Export**: PNG (single/both), PDF (card-size pages + print sheet), embedded build data, and the **weapon rules reference** below the cards (§4.1) with tests against each example's `expected.weaponRuleReference`.
7. **Import**: JSON/PNG/PDF round-trip tests, migration hook, error states.
8. **Polish**: mobile layout (editor and preview stacked), keyboard access, empty states, "Load example" (the four Dossier builds), fan-content disclaimer footer.
9. **Release**: README with usage, deploy, and a check that print size matches real cards.

---

## 8. Decisions (confirmed)

These were the open questions; all are now decided. Each one is a setting in the app's export/settings panel and is listed in the README.

1. **Physical card size**: **120 × 70 mm** (designed at 1200 × 700 px), based on the ratio of the Core Rules datacard example. The size can be changed in the export settings if a real card measures differently.
2. **Rules text on the card**: print the rules text **word for word** (the official card/Dossier wording, as ktdash.app does). Flavour text is not printed on the cards; it is used for editor tooltips only.
3. **Card colour**: always the standard **KT 2024 orange** (`#e8641c`). The `--faction` CSS variable stays, so a per-allegiance accent could be added later as an option.
4. **Allegiance wording**: print the **official allegiance card wording** (`cardText` in rules-data.json), which covers both NPO and friendly use.
5. **Rule interpretations**: Fury and Waaagh! Hit penalties **stack** (−2), with a warning in the editor. **At most one** Twinned/Paired per target weapon; the target must be a different pick of the right type.
6. **Highlighting calculated stats**: highlighted in the **editor preview only**; exported cards are plain, like official cards (optional export setting to keep the highlights).
7. **Printing layout**: without the weapon rules reference, the PDF default is **two separate cards** (one 120 × 70 mm card per page). Also available: card 2 as the back of card 1 (double-sided), and an A4/Letter print sheet with cut marks.
8. **Weapon rules reference**: a user **toggle button** ("Weapon rules on PDF", next to Export PDF), **on by default**; the user can switch it off to leave the rules out. With it on, the PDF is an A4/Letter page with both cards at true size and the reference below (§4.1). Only weapon rules are listed, alphabetically, with the Lite Rules text verbatim.

## 9. Repo housekeeping (done)
- ✅ The ignore file is now correctly named **`.gitignore`**. It ignores `/reference/` (the copyrighted PDFs), `node_modules/`, `dist/` and `coverage/`, so the rulebooks are never committed or published.
- ✅ `src/` is scaffolded (Vite + React + TS, vitest, lint, Pages workflow) on branch `feat/datacard-maker`.
- ✅ A fan-made disclaimer (not affiliated with Games Workshop; Kill Team is a trademark of Games Workshop) is in the app. It still needs adding to the README when that's written.
