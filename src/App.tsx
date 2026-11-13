import { useEffect, useMemo, useRef, useState } from "react";
import Gallery from "./Gallery";
import { CONFIG } from "./config";
import { deriveCard } from "./model/derive";
import { EXAMPLES, exampleBuild } from "./model/examples";
import { emptyBuild, type NemesisBuild } from "./model/schema";
import { isValid, validate } from "./model/validate";
import { useBuildStore } from "./editor/state";
import { StepAllegiance, StepBehaviour, StepOperative, StepSize, StepTraits } from "./editor/Steps";
import { StepWeapons } from "./editor/StepWeapons";
import { Preview } from "./editor/Preview";
import { ExportStage, type ExportNodes } from "./editor/ExportStage";
import { Menu } from "./editor/Menu";
import { downloadBlob, downloadJson, fileBaseName } from "./io/download";
import { exportPdf, exportPng, type PngWhich } from "./io/exportCards";
import type { PdfLayout } from "./io/pdf";
import { importFile } from "./io/importFile";
import "./app.css";

const CARD_PAGES: { id: PdfLayout; label: string } = {
  id: "cards",
  label: `Two separate cards (${CONFIG.cardWidthMm} × ${CONFIG.cardHeightMm} mm pages)`,
};
const SHEETS: { id: PdfLayout; label: string }[] = [
  { id: "sheet-a4", label: "A4 sheet with cut marks" },
  { id: "sheet-letter", label: "Letter sheet with cut marks" },
];
/** Export PDF menu, with the configured default layout (CONFIG.defaultPdfLayout) first. */
const PDF_LAYOUTS = CONFIG.defaultPaper === "a4" ? [CARD_PAGES, ...SHEETS] : [...SHEETS, CARD_PAGES];

type Toast = { kind: "ok" | "error"; text: string } | null;

function Editor() {
  const { build, dispatch, dirty, markSaved } = useBuildStore();
  const card = useMemo(() => deriveCard(build), [build]);
  const issues = useMemo(() => validate(build), [build]);
  const valid = isValid(issues);
  const [highlight, setHighlight] = useState<boolean>(CONFIG.highlightInPreview);
  const [exportHighlight, setExportHighlight] = useState<boolean>(CONFIG.highlightInExport);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<ExportNodes>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), toast.kind === "error" ? 8000 : 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  const confirmDiscard = () => !dirty || window.confirm("You have unsaved changes. Replace the current operative?");
  const confirmInvalid = () => {
    if (valid) return true;
    const list = issues.filter((i) => i.level === "error").map((i) => `• ${i.message}`).join("\n");
    return window.confirm(`This build breaks the builder rules:\n\n${list}\n\nExport anyway?`);
  };

  const load = (b: NemesisBuild, message?: string) => {
    dispatch({ type: "load", build: b });
    markSaved(b);
    if (message) setToast({ kind: "ok", text: message });
  };

  const runImport = async (file?: File | null) => {
    if (!file) return;
    try {
      const b = await importFile(file);
      if (!confirmDiscard()) return;
      load(b, `Loaded “${b.name || "operative"}” from ${file.name}.`);
    } catch (e) {
      setToast({ kind: "error", text: e instanceof Error ? e.message : String(e) });
    }
  };

  const runExport = async (fn: () => Promise<void>) => {
    if (!confirmInvalid()) return;
    setBusy(true);
    try {
      await fn();
      markSaved(build);
    } catch (e) {
      setToast({ kind: "error", text: `Export failed: ${e instanceof Error ? e.message : String(e)}` });
    } finally {
      setBusy(false);
    }
  };

  const doPng = (which: PngWhich) =>
    runExport(async () => {
      const s = stage.current;
      const node = which === "1" ? s?.card1 : which === "2" ? s?.card2 : s?.both;
      if (!node) throw new Error("Cards not ready");
      const blob = await exportPng(node, build);
      const suffix = which === "both" ? "" : `-card${which}`;
      downloadBlob(blob, `${fileBaseName(build)}${suffix}.png`);
      setToast({ kind: "ok", text: "PNG exported. It contains your build: import it later to keep editing." });
    });

  const doPdf = (layout: PdfLayout) =>
    runExport(async () => {
      const s = stage.current;
      if (!s?.card1 || !s.card2) throw new Error("Cards not ready");
      const blob = await exportPdf([s.card1, s.card2], build, layout);
      downloadBlob(blob, `${fileBaseName(build)}.pdf`);
      setToast({ kind: "ok", text: "PDF exported. Print at 100% / actual size. It contains your build for re-import." });
    });

  // Drag-and-drop import anywhere on the page (the picture drop zone handles its own images).
  const dragDepth = useRef(0);
  useEffect(() => {
    const reset = () => {
      dragDepth.current = 0;
      setDragging(false);
    };
    window.addEventListener("drop", reset, true);
    window.addEventListener("dragend", reset, true);
    return () => {
      window.removeEventListener("drop", reset, true);
      window.removeEventListener("dragend", reset, true);
    };
  }, []);
  const hasFiles = (e: React.DragEvent) => [...e.dataTransfer.types].includes("Files");

  const stepProps = { build, dispatch, issues, card };
  const errorCount = issues.filter((i) => i.level === "error").length;
  const warnCount = issues.length - errorCount;

  return (
    <div
      className="app"
      onDragEnter={(e) => {
        if (!hasFiles(e)) return;
        dragDepth.current++;
        setDragging(true);
      }}
      onDragLeave={() => {
        dragDepth.current = Math.max(0, dragDepth.current - 1);
        if (!dragDepth.current) setDragging(false);
      }}
      onDragOver={(e) => hasFiles(e) && e.preventDefault()}
      onDrop={(e) => {
        dragDepth.current = 0;
        setDragging(false);
        if (!hasFiles(e)) return;
        e.preventDefault();
        void runImport(e.dataTransfer.files[0]);
      }}
    >
      <header className="topbar">
        <div className="brand">Nemesis <span>Datacard</span> Maker</div>
        <div className="spacer" />
        <button type="button" className="btn" onClick={() => confirmDiscard() && load(emptyBuild())}>New</button>
        <label className="btn select-btn">
          <span>Example</span>
          <select value="" aria-label="Load an example from the Dossier" onChange={(e) => {
            const id = e.target.value;
            if (id && confirmDiscard()) load(exampleBuild(id));
          }}>
            <option value="">Load example…</option>
            {EXAMPLES.map((ex) => <option key={ex.id} value={ex.id}>{ex.label}</option>)}
          </select>
        </label>
        <button type="button" className="btn" onClick={() => fileInput.current?.click()}>Import PDF / PNG / JSON</button>
        <input ref={fileInput} type="file" hidden accept=".json,.png,.pdf,application/json,image/png,application/pdf"
          onChange={(e) => {
            void runImport(e.target.files?.[0]);
            e.target.value = "";
          }} />
        <button type="button" className="btn" onClick={() => {
          downloadJson(build, `${fileBaseName(build)}.json`);
          markSaved(build);
        }}>Save JSON</button>
        <Menu label={busy ? "Exporting…" : "Export PNG"} primary disabled={busy}>
          {(close) => (
            <>
              <button type="button" className="btn" onClick={() => { close(); void doPng("1"); }}>Card 1 · Datacard</button>
              <button type="button" className="btn" onClick={() => { close(); void doPng("2"); }}>Card 2 · Rules</button>
              <button type="button" className="btn" onClick={() => { close(); void doPng("both"); }}>Both side by side</button>
              <hr />
              <label className="opt"><input type="checkbox" checked={exportHighlight} onChange={(e) => setExportHighlight(e.target.checked)} /> Highlight calculated values</label>
              <span className="note">3600 × 2100 px per card. Your build is embedded in the file.</span>
            </>
          )}
        </Menu>
        <Menu label={busy ? "Exporting…" : "Export PDF"} primary disabled={busy}>
          {(close) => (
            <>
              {PDF_LAYOUTS.map((l) => (
                <button key={l.id} type="button" className="btn" onClick={() => { close(); void doPdf(l.id); }}>{l.label}</button>
              ))}
              <hr />
              <label className="opt"><input type="checkbox" checked={exportHighlight} onChange={(e) => setExportHighlight(e.target.checked)} /> Highlight calculated values</label>
              <span className="note">Print at 100% (actual size). Your build is attached to the PDF.</span>
            </>
          )}
        </Menu>
      </header>

      <div className="layout">
        <main className="form" aria-label="Build steps">
          {!build.name && !build.allegiance && build.weapons.length === 0 && (
            <div className="okbox empty-hint">
              Build a nemesis step by step, or start from one of the Dossier's examples:{" "}
              {EXAMPLES.map((ex, i) => (
                <span key={ex.id}>
                  {i > 0 && " · "}
                  <button type="button" className="linkbtn" onClick={() => load(exampleBuild(ex.id))}>{ex.label.split(" ‘")[0]}</button>
                </span>
              ))}
            </div>
          )}
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
            <span className="longnote">Exports embed your build data, so you can re-import the PDF or PNG later to keep editing.</span>
            {dirty && <span className="muted">· Unsaved changes (autosaved in this browser)</span>}
          </div>
        </section>
      </div>

      <footer className="disclaimer">
        Fan-made tool, not affiliated with or endorsed by Games Workshop. Kill Team and Warhammer are trademarks of Games
        Workshop Ltd. Rules text is reproduced from the Nemesis Operatives Dossier for personal, non-commercial use.
      </footer>

      <ExportStage ref={stage} model={card} image={build.image} highlight={exportHighlight} />
      {dragging && <div className="drop-overlay">Drop a PDF, PNG or JSON to import</div>}
      {toast && <div className={`toast${toast.kind === "error" ? " error" : ""}`} role={toast.kind === "error" ? "alert" : "status"}>{toast.text}</div>}
    </div>
  );
}

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("gallery")) return <Gallery only={params.get("gallery") || undefined} />;
  return <Editor />;
}
