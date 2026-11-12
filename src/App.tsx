import { useMemo, useState } from "react";
import Gallery from "./Gallery";
import { CONFIG } from "./config";
import { deriveCard } from "./model/derive";
import { EXAMPLES, exampleBuild } from "./model/examples";
import { emptyBuild } from "./model/schema";
import { isValid, validate } from "./model/validate";
import { useBuildStore } from "./editor/state";
import { StepAllegiance, StepBehaviour, StepOperative, StepSize, StepTraits } from "./editor/Steps";
import { StepWeapons } from "./editor/StepWeapons";
import { Preview } from "./editor/Preview";
import { downloadJson, fileBaseName } from "./io/download";
import "./app.css";

function Editor() {
  const { build, dispatch, dirty, markSaved } = useBuildStore();
  const card = useMemo(() => deriveCard(build), [build]);
  const issues = useMemo(() => validate(build), [build]);
  const valid = isValid(issues);
  const [highlight, setHighlight] = useState<boolean>(CONFIG.highlightInPreview);

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Replace the current operative?");

  const stepProps = { build, dispatch, issues, card };
  const errorCount = issues.filter((i) => i.level === "error").length;
  const warnCount = issues.length - errorCount;

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">Nemesis <span>Datacard</span> Maker</div>
        <div className="spacer" />
        <button type="button" className="btn" onClick={() => {
          if (!confirmDiscard()) return;
          const b = emptyBuild();
          dispatch({ type: "load", build: b });
          markSaved(b);
        }}>New</button>
        <label className="btn select-btn">
          <span>Load example</span>
          <select value="" aria-label="Load example" onChange={(e) => {
            const id = e.target.value;
            if (!id || !confirmDiscard()) return;
            const b = exampleBuild(id);
            dispatch({ type: "load", build: b });
            markSaved(b);
          }}>
            <option value="">Load example…</option>
            {EXAMPLES.map((ex) => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
          </select>
        </label>
        <button type="button" className="btn" onClick={() => {
          downloadJson(build, `${fileBaseName(build)}.json`);
          markSaved(build);
        }}>Save JSON</button>
      </header>

      <div className="layout">
        <main className="form" aria-label="Build steps">
          <StepOperative {...stepProps} />
          <StepAllegiance {...stepProps} />
          <StepSize {...stepProps} />
          <StepBehaviour {...stepProps} />
          <StepWeapons {...stepProps} />
          <StepTraits {...stepProps} />
        </main>

        <section className="preview" aria-label="Card preview">
          <Preview model={card} image={build.image} highlight={highlight} />
          <div className="exportbar">
            {valid ? (
              <span className="okbox">{warnCount ? `Valid · ${warnCount} note${warnCount > 1 ? "s" : ""}` : "All steps valid · ready to export"}</span>
            ) : (
              <span className="warnbox">{errorCount} problem{errorCount > 1 ? "s" : ""} to fix (see the steps marked ✕)</span>
            )}
            <label className="check">
              <input type="checkbox" checked={highlight} onChange={(e) => setHighlight(e.target.checked)} />
              Highlight calculated values (preview only)
            </label>
            {dirty && <span className="muted">Unsaved changes (autosaved in this browser)</span>}
          </div>
        </section>
      </div>
      <footer className="disclaimer">
        Fan-made tool, not affiliated with or endorsed by Games Workshop. Kill Team and Warhammer are trademarks of Games
        Workshop Ltd. Rules text is reproduced from the Nemesis Operatives Dossier for personal, non-commercial use.
      </footer>
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("gallery")) return <Gallery only={params.get("gallery") || undefined} />;
  return <Editor />;
}
