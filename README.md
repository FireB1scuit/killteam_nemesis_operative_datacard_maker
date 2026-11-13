# Nemesis Datacard Maker

A static browser app for building a **Kill Team (2024) Nemesis operative** with the *Nemesis Custom Builder*
rules from the Nemesis Operatives Dossier, and exporting it as print-ready **KT 2024-style datacards**
(PNG or PDF). Exported files carry the build inside them, so you can import a PNG or PDF later and keep editing.

> **Fan-made tool. Not affiliated with or endorsed by Games Workshop.** Kill Team and Warhammer are trademarks
> of Games Workshop Ltd. The app uses original icons only (no GW logos or artwork). Rules text is reproduced
> from the Nemesis Operatives Dossier and the Kill Team Lite Rules for personal, non-commercial use.

## Using it

1. **Operative**: player operative or NPO, name, optional moniker, name keyword (follows the name until you edit
   it), and a model picture (drop / paste / upload; drag to position, scroll or slider to zoom, arrow keys and +/− work too).
2. **Allegiance**: one of the 8 allegiance keywords. It sets the orange footer keyword and the allegiance trait.
3. **Size & base**: Small / Medium / Large (stat line shown) and a base preset or custom size (`105x70` = oval).
4. **Behaviour**: NPOs only.
5. **Weapons**: search by name *or* Dossier alternative (typing "deathspitter" finds Autocannon). Add an alias to
   rename a weapon on the card. Twinned / Paired pick their target weapon. The meter shows selections used.
   Hover a weapon rule for its Lite Rules text.
6. **Traits**: 1 + one per unused weapon selection.

The preview shows the **final** weapon values (Twinned, Paired, Fury and Waaagh! applied); calculated values can be
highlighted in orange in the preview. Steps show ✓ / ! / ✕, and exporting an invalid build asks for confirmation.

**Top bar**: New · Example (the four Dossier examples) · Import PDF / PNG / JSON (or drag a file onto the
page) · Save JSON · Export PNG (card 1, card 2, both side by side, or both below each other; 3600 × 2100 px per card) ·
**Weapon rules on PDF** switch · Export PDF.

### Weapon rules on PDF

The switch next to **Export PDF** (on by default) adds a **WEAPON RULES** reference below the cards on the PDF:
every weapon rule that appears on the cards (WR column plus rules named in trait text, e.g. Fury → Ceaseless,
Relentless), listed once, alphabetically, in the Kill Team Lite Rules wording. *Selection x* isn't in the Lite
Rules, so it uses the Dossier wording with a source label. The line under the preview says what the PDF will contain.

The choice is saved in the build (`options.weaponRulesOnPdf`), so a re-imported PDF/PNG/JSON keeps it, and it's
remembered in this browser as the default for new builds. PNG exports never include the reference.

| Switch | Export PDF menu (first entry = default) |
|---|---|
| **On** | Cards + weapon rules on one A4/Letter page (cards at true size, cut line, reference in two columns, continued on a second page if needed) · Double-sided: card 1 + reference on the front, card 2 on the back |
| **Off** | Two separate cards (120 × 70 mm pages) · Double-sided A4/Letter (card 1 front, card 2 back) · Print sheet with cut marks |

Paper size (A4 / Letter) is chosen in the menu and remembered. Always print at **100 % / actual size**.

The current build autosaves in your browser (`localStorage`). `?example=screamer-killer` (or `armoured-sentinel`,
`xv8-crisis-battlesuit`, `redemptor-dreadnought`) opens an example directly.

### Embedded build data

| Export | Where the build JSON lives |
|---|---|
| PNG | `iTXt` chunk with keyword `nemesis-datacard` |
| PDF | file attachment `nemesis-build.json`, plus the Info-dictionary key `/NemesisBuild` as a fallback |
| JSON | the file is the build (`schema: "nemesis-datacard"`, `version: 1`) |

Imports are validated with zod. Files from other sources can't be turned back into a build (no OCR); the app says so.

## Settings and defaults (plan.md §8)

Change them in [`src/config.ts`](src/config.ts).

| § | Setting | Default | Key |
|---|---|---|---|
| 8.1 | Physical card size | **120 × 70 mm** (card DOM is 1200 × 700 px at 10 px/mm) | `cardWidthMm`, `cardHeightMm` |
| 8.2 | Rules text | **Verbatim** from [`docs/rules-data.json`](docs/rules-data.json) (flavour text only in editor tooltips) | – |
| 8.3 | Card colour | **Always KT orange** `#e8641c` | `accent` |
| 8.4 | Allegiance wording | **Official allegiance card wording** (`cardText`) | – |
| 8.5 | Fury + Waaagh! | **Stack** (ranged Hit −2, capped at 6+), with an editor warning | `stackHitPenalties` |
| 8.5 | Twinned / Paired per target | **Max one** per weapon | `maxModifiersPerTarget` |
| 8.6 | Highlight calculated values | **Preview only** (preview checkbox on; export checkbox off) | `highlightInPreview`, `highlightInExport` |
| 8.7 | PDF without weapon rules | **Two separate 120 × 70 mm cards**; double-sided and print-sheet layouts also available | – |
| 8.8 | Weapon rules on PDF | **On** for new builds (then the user's last choice) | `weaponRulesOnPdf` |
| – | Paper | **A4** (Letter in the menu) | `defaultPaper` |

## Judgement calls

- **One source of truth**: `src/data/*.ts` are thin typed views over `docs/rules-data.json`; nothing is retyped.
  Engine effects come from the data too (`apply` on Twinned/Paired, `applyToProfiles` on Fury and Waaagh!).
- **IDs** follow rules-data.json (`burst_cannon`, `FOCUSED_TARGETING`, `MARKSMAN`). Saves from the earlier
  pre-release build (camelCase ids) are mapped on import, so old autosaves and exports still load.
- **Twinned/Paired labels**: an alias is printed as-is (the Crisis example uses "Twinned meltaguns"); without
  one the row is "Twinned &lt;name&gt;" / "Paired &lt;name&gt;".
- **Card wording that isn't in the sources** (from docs/rules-reference.md §11): the card-1 Nemesis/Control/
  Behaviour reminders and the behaviour bar's ◆ "Performs the first action it can…" line. A player operative's
  card 2 shows the Dossier player-operative text plus the mission-pack activation limits.
- **Footer**: `NPO · SIZE: LARGE` for an NPO, `SIZE: LARGE` for a player operative (rules-reference §11).
- **Card overflow**: trait blocks that don't fit under the weapon table move (last first) to card 2, before the
  core rules; then the body text shrinks (down to 72 %, ≈ 13 px). Card 1 keeps 8 px of headroom, because the
  export renderer can lay text out a pixel taller than the live page.
- **PNG rendering** doesn't use `html-to-image` (it floors font sizes and changed line breaks).
  [`src/io/renderCard.ts`](src/io/renderCard.ts) draws the card via SVG `foreignObject` with the real `card.css`
  and embedded fonts, so exports match the preview.
- **PDF text** is real, selectable text (pdf-lib + fontkit). It uses WOFF copies of the self-hosted fonts,
  because fontkit crashes subsetting glyphs decoded from WOFF2. pdf-lib/fontkit (~1 MB) load only on PDF export or import.
- **Double-sided layouts** assume a long-edge flip; cards are centred, so the mirrored position is the same spot.
- Allegiance is optional while a new build is being filled in (validation requires it).

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: golden Dossier examples (from rules-data.json), weapon rules reference, validation,
                   #         PNG/PDF/JSON round trips, UI smoke tests
npm run lint
npm run build      # outputs dist/ with base /killteam_nemesis_operative_datacard_maker/
```

`/?gallery` renders every fixture (the Dossier examples plus layout worst cases) at 1:1; `/?gallery=<id>&export=1`
shows the exporter's PNG output; `/?gallery=<id>&pdf=<layout>&paper=a4` runs the real PDF exporter.

**Checking visuals**: with `npm run build && npx vite preview --port 4173` running, `node scripts/visual-check.mjs`
writes card screenshots, editor screenshots (desktop and a true 390 px phone viewport), and exported PDFs
(rendered to PNG if `pdftoppm` is installed) to `docs/screenshots/` (git-ignored). Set `CHROME` if Chrome isn't
in the default Windows location.

Layout: `src/data` (views over rules-data.json), `src/model` (schema/zod, `deriveCard`, `weaponRuleReference`,
`validate`, migrations, examples), `src/card` (datacard components, flow + fitText), `src/editor` (steps,
picker, cropper, preview, prefs), `src/io` (renderer, PNG text chunks, PDF, import).

Fonts: Oswald and Roboto Condensed (SIL OFL 1.1), self-hosted in `public/fonts/` (latin subset; woff2 for the
page, woff for PDF embedding).

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main` (and on manual dispatch):
`npm ci → lint → test → build → upload-pages-artifact → deploy-pages`. The Vite `base` comes from
`GITHUB_REPOSITORY` (`/<repo-name>/`), so forks work too.

One-time setup: in the repository, **Settings → Pages → Build and deployment → Source: GitHub Actions**.
Then merge to `main` (or run the workflow by hand); the site appears at `https://<user>.github.io/<repo-name>/`.

`reference/` (the rulebook PDFs) is git-ignored and must never be committed.

## Print check

Card-size PDF pages are exactly 120 × 70 mm and A4/Letter pages are exact paper sizes (asserted in
`tests/io.roundtrip.test.ts`). Print at **100 % / actual size** (not "fit to page") and measure one card against a
real datacard before printing a batch; if your cards measure differently, change `cardWidthMm`/`cardHeightMm`.
