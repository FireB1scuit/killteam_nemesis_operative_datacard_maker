Build the complete Nemesis Operative Datacard Maker by executing plan.md, from the current repo state to a finished, tested app ready for GitHub Pages, in one go. Planning is done and every decision is made. Don't stop to ask questions; where something isn't specified, make a sensible call and note it in the README.

Read first, in this order (do NOT open the PDFs in reference/; everything is already transcribed):
1. plan.md: scope, architecture, file structure, save/export/import design, milestones (§7), confirmed decisions (§8). §4.1 covers the weapon rules toggle.
2. docs/rules-reference.md: all rules and card text, the exact calculation algorithm (§9), golden tests (§10), the KT 2024 datacard format (§11) and the weapon rules reference (§12). It is the authority on rules; if it disagrees with plan.md, it wins.
3. docs/rules-data.json: the machine-readable rules data (sizes, allegiances with cardText, traits, behaviours, core rules, weapons, weaponRuleGlossary with match regexes, examples with expected output). Use it as the single data source; don't retype rules.
4. docs/mockups/datacard.png, pdf-page.png and app.png (and the .html files plus card.css): the exact visual targets for the cards, the PDF page and the editor.

Current repo state: work may already exist on branch feat/datacard-maker (scaffold, rules engine, cards, editor, partial export/import, todo.md). Check `git log`, `git status` and todo.md first. Keep and finish what's there instead of starting over, and bring it in line with the docs above. If src/data/*.ts duplicates rules-data.json, switch it to read from rules-data.json (or generate from it) so there's one source of truth, and make sure the text matches (allegiance traits print `cardText`).

Must be done when you finish (each item is specified in plan.md / rules-reference.md):
- Editor: player/NPO, name, moniker, name keyword, picture upload with pan/zoom, allegiance, size, base, behaviour (NPO only), weapons (searchable incl. alternatives, alias, Twinned/Paired targets, selection budget), traits (1 + unused selections). Per-step validation status. Autosave. "Load example" with the four Dossier builds.
- Cards: card 1 + card 2 in the KT 2024 format exactly as in the mockups. Final weapon values from deriveCard (rules-reference §9). Ability blocks flow from card 1 to card 2, plus fitText. Highlights in the preview only.
- "Weapon rules on PDF" toggle button in the top bar next to Export PDF, ON by default, saved as options.weaponRulesOnPdf and remembered as the user's default. On: A4/Letter PDF page with both cards at true size, a cut line, and a WEAPON RULES block below (only weapon rules used on the cards, alphabetical, Lite Rules text verbatim, from weaponRuleGlossary). Off: cards only. A preview line says what the PDF will include.
- Export: PNG (card 1 / card 2 / both) and PDF (layouts from plan.md §5 and §8), with the build JSON embedded (PNG iTXt chunk, PDF attachment + Info fallback), plus .json save/load. Import .json/.png/.pdf by button or drag-and-drop, zod-validated, with clear errors for foreign files.
- Self-hosted Oswald + Roboto Condensed. Original SVG icons only. Fan-made disclaimer in the app footer and README. Usable on phone width (editor and preview stack).
- GitHub Actions workflow that tests, builds and deploys to Pages (vite base = repo name).

Tests (vitest), all green before you finish:
- deriveCard reproduces every example in rules-data.json `examples[].expected` exactly (stats, selectionsUsed, traitsAllowed, rows, WR strings, keywords). Plus edge cases: Twinned on a burst cannon, Fury on a weapon that already has Ceaseless, Ork Hit worsening, Hit clamped at 6+, rule order (Range first, then alphabetical).
- weaponRuleReference matches each example's `expected.weaponRuleReference`.
- Validation: over budget, wrong trait count, duplicate traits, NPO without behaviour, invalid Twinned/Paired target.
- Round trips: build → PNG → import and build → PDF → import give an identical build, including options.weaponRulesOnPdf.

How to work:
- Go through the plan.md §7 milestones in order, skipping ones that are already complete. After each, run `npm test`, `npm run lint` and `npm run build`, and commit on feat/datacard-maker with a clear message.
- Check visuals yourself: run `npx vite preview` and take headless Chrome screenshots ("C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --screenshot=<file> --window-size=WxH <url>). Compare them with docs/mockups/*.png and fix differences. Also screenshot the worst cases (Large NPO with 4 traits; 3 two-profile weapons) and an exported PDF page with the weapon rules on and off.
- Keep todo.md current as a checklist.

Finish with: all tests, lint and build passing; work committed on feat/datacard-maker; README (usage, local dev, deploy steps incl. setting Pages to "GitHub Actions", settings/defaults, judgement calls, disclaimer); and a short final report of what was built, how it was verified (screenshot paths), and anything left open. Ask me before pushing, merging or opening a PR.

---

## Checklist (kept current while working)

- [x] M1 Scaffold: Vite/React/TS, lint, vitest, Pages workflow (done earlier)
- [x] M2 Rules data + engine: src/data/*.ts read docs/rules-data.json (single source); allegiance prints `cardText`; deriveCard data-driven (Twinned/Paired `apply`, Fury/Waaagh! `applyToProfiles`); golden tests loop over `examples[].expected`; edge cases; legacy-id migration
- [x] weaponRuleReference(card) + tests against `expected.weaponRuleReference`
- [ ] M3 Cards: check against docs/mockups/datacard.png; worst cases (Large NPO 4 traits; 3 two-profile weapons)
- [ ] M4/M5 Editor + picture: verify against app.png; "Weapon rules on PDF" toggle (role=switch, On/Off, tooltip, remembered default) + preview line
- [ ] M6 Export: PDF page with cards + cut line + WEAPON RULES (pdf-lib + fontkit, real text, 2 columns, continues on page 2); double-sided; cards-only layouts when off; A4/Letter
- [ ] M7 Import: round trips incl. options.weaponRulesOnPdf
- [ ] M8 Polish: mobile layout, keyboard, empty states, Load example
- [ ] M9 Release: README (usage, dev, deploy + Pages "GitHub Actions", settings, judgement calls, disclaimer); screenshots
