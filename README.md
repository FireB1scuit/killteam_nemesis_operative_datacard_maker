# Nemesis Datacard Maker

A static browser app for building a **Kill Team (2024) Nemesis operative** with the *Nemesis Custom Builder*
rules from the Nemesis Operatives Dossier, and exporting it as print-ready **KT 2024-style datacards**
(PNG or PDF). Exported files carry the build inside them, so you can import a PNG or PDF later and keep editing.

> **Fan-made tool. Not affiliated with or endorsed by Games Workshop.** Kill Team and Warhammer are trademarks
> of Games Workshop Ltd. The app uses original icons only (no GW logos or artwork). Rules text is reproduced
> from the Dossier for personal, non-commercial use.

## Using it

1. **Operative**: player operative or NPO, name, optional moniker, name keyword (follows the name until you edit
   it), and a model picture (drop / paste / upload; drag to position, scroll or slider to zoom, arrow keys and +/− work too).
2. **Allegiance**: one of the 8 allegiance keywords. It sets the orange footer keyword and the allegiance trait.
3. **Size & base**: Small / Medium / Large (stat line shown) and a base preset or custom size (`105x70` = oval).
4. **Behaviour**: NPOs only.
5. **Weapons**: search by name *or* Dossier alternative (typing "deathspitter" finds Autocannon). Add an alias to
   rename a weapon on the card. Twinned / Paired pick their target weapon. The meter shows selections used.
6. **Traits**: 1 + one per unused weapon selection.

The preview shows the **final** weapon values (Twinned, Paired, Fury and Waaagh! applied); calculated values can be
highlighted in orange in the preview. Steps show ✓ / ! / ✕, and exporting an invalid build asks for confirmation.

**Top bar**: New · Load example (the four Dossier examples) · Import PDF / PNG / JSON (or drag a file onto the
page) · Save JSON · Export PNG (card 1, card 2, or both side by side; 3600 × 2100 px per card) · Export PDF (two
120 × 70 mm pages, or an A4 / Letter sheet with cut marks; print at 100 %).

The current build autosaves in your browser (`localStorage`). `?example=screamer-killer` (or `armoured-sentinel`,
`xv8-crisis`, `redemptor`) opens an example directly.

### Embedded build data

| Export | Where the build JSON lives |
|---|---|
| PNG | `iTXt` chunk with keyword `nemesis-datacard` |
| PDF | file attachment `nemesis-build.json`, plus the Info-dictionary key `/NemesisBuild` as a fallback |
| JSON | the file is the build (`schema: "nemesis-datacard"`, `version: 1`) |

Files from other sources can't be turned back into a build (no OCR); the app says so.

## Configuration (open questions in plan.md §8)

The undecided questions use these defaults. Change them in [`src/config.ts`](src/config.ts) (and the data files where noted).

| § | Question | Default | Where |
|---|---|---|---|
| 8.1 | Physical card size | **120 × 70 mm** (card DOM is 1200 × 700 px at 10 px/mm). A 300 dpi scan of the official Nemesis trait cards measures ≈ 70 × 121 mm (±1 mm), which matches. | `cardWidthMm`, `cardHeightMm` |
| 8.2 | Rules text | **Dossier text verbatim** (one exception, below) | `src/data/*.ts` |
| 8.3 | Card colour | **Always KT orange** `#e8641c` | `accent` |
| 8.4 | Allegiance wording | **Friendly perspective** (the builder's wording). The official allegiance cards print an NPO + friendly-NEMESIS wording; adding it would mean a second text per allegiance in `src/data/allegiances.ts`. | `allegianceWording` |
| 8.5 | Fury + Waaagh! | **Stack** (ranged Hit −2, capped at 6+) | `stackHitPenalties` |
| 8.5 | Twinned / Paired per target | **Max one** modifier per weapon | `maxModifiersPerTarget` |
| 8.6 | Highlight calculated values | **Preview only** (preview checkbox on by default; export menu checkbox off by default) | `highlightInPreview`, `highlightInExport` |
| 8.7 | PDF layout | **Two separate cards** (120 × 70 mm pages) first in the menu; A4 / Letter sheets with cut marks also available | `defaultPdfLayout` |

Rules-text notes: the Leagues of Votann trait says "victory (e.g. flanks)" instead of the Dossier's
"victor (e.g. flanks on pg 50)", because a Dossier page reference means nothing on a card. "Muti-melta" is printed as Multi-melta.
The behaviour bar's ◆ line ("Performs the first action it can…") and the card-1 Nemesis/Control reminders are app wording.

## Deviations from plan.md

- **PNG rendering** doesn't use `html-to-image`. That library inlines every element's computed style and floors
  font sizes (`floor(px) − 0.1`), which changed line breaks and dropped paragraph spacing compared with the
  preview. [`src/io/renderCard.ts`](src/io/renderCard.ts) uses the same technique (SVG `foreignObject` → canvas)
  but serialises the card with the real `card.css` and base64-embedded fonts, so exports match the preview exactly.
- Allegiance is optional while a new build is being filled in (validation requires it), so a blank build doesn't
  pretend to be IMPERIUM.
- Card overflow: trait blocks that don't fit under the weapon table move (last first) to card 2, before the core
  rules; then the body text shrinks (down to 72 %, ≈ 13 px) on whichever card still overflows.

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest: golden Dossier examples, validation, PNG/PDF/JSON round trips, UI smoke test
npm run lint
npm run build      # outputs dist/ with base /killteam_nemesis_operative_datacard_maker/
```

`/?gallery` renders every fixture (the Dossier examples plus layout worst cases) at 1:1 for visual checks;
`/?gallery=<id>&export=1` shows the real exporter's PNG output.

Layout: `src/data` (rules data), `src/model` (schema/zod, `deriveCard`, `validate`, migrations, examples),
`src/card` (datacard components, flow + fitText), `src/editor` (steps, picker, cropper, preview),
`src/io` (renderer, PNG text chunks, PDF, import).

Fonts: Oswald and Roboto Condensed (SIL OFL 1.1), self-hosted in `public/fonts/` (latin subset).

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main`: `npm ci → lint → test → build → deploy-pages`.
The Vite `base` comes from `GITHUB_REPOSITORY`, so it works for forks too. One-time setup: repository
**Settings → Pages → Source: GitHub Actions**.

`reference/` (the rulebook PDFs) is git-ignored and must never be committed.

## Print check

PDF pages are exactly 120 × 70 mm (asserted in `tests/io.roundtrip.test.ts`). Print at **100 % / actual size**
(not "fit to page") and measure one card against a real datacard before printing a batch.
