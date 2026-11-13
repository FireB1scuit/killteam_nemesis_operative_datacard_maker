import { useEffect, useRef, useState } from "react";
import { CardPair } from "../card/CardPair";
import { CARD_PX, CONFIG } from "../config";
import type { CardModel } from "../model/derive";
import type { BuildImage } from "../model/schema";

export type PreviewTab = "1" | "2" | "both";

const GAP = 24;

export function Preview(props: { model: CardModel; image?: BuildImage; highlight: boolean }) {
  const [tab, setTab] = useState<PreviewTab>("1");
  const [zoom, setZoom] = useState<"fit" | number>("fit");
  const host = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(900);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = zoom === "fit" ? Math.min(1, Math.max(0.2, width / CARD_PX.width)) : zoom;
  const cards = tab === "both" ? 2 : 1;
  const h = CARD_PX.height * cards + (cards - 1) * GAP;

  const tabs: { id: PreviewTab; label: string }[] = [
    { id: "1", label: "Card 1 · Datacard" },
    { id: "2", label: "Card 2 · Rules" },
    { id: "both", label: "Both (print sheet)" },
  ];

  return (
    <div className="preview-inner">
      <div className="tabs" role="tablist" aria-label="Preview">
        {tabs.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id}
            className={`tab${tab === t.id ? " on" : ""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <label className="zoom">
          <span className="sr-only">Preview zoom</span>
          <select value={String(zoom)} onChange={(e) => setZoom(e.target.value === "fit" ? "fit" : Number(e.target.value))}>
            <option value="fit">Fit · {Math.round(scale * 100)}%</option>
            <option value="0.5">50%</option>
            <option value="0.75">75%</option>
            <option value="1">100%</option>
          </select>
        </label>
      </div>
      <div ref={host} className="stage-host">
        <div className="stage" style={{ width: CARD_PX.width * scale, height: h * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: CARD_PX.width }}>
            <CardPair model={props.model} image={props.image} highlight={props.highlight} shadow show={tab} gap={GAP} accent={CONFIG.accent} />
          </div>
        </div>
      </div>
    </div>
  );
}
