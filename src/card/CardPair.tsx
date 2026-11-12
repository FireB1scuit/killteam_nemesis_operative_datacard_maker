import { useEffect, useLayoutEffect, useRef, useState, type Ref } from "react";
import type { CardModel } from "../model/derive";
import type { BuildImage } from "../model/schema";
import { Datacard } from "./Datacard";
import { RulesCard } from "./RulesCard";
import { cardOverflows, fitCardBody, fitHeader } from "./fitText";
import "./card.css";

export type CardPairProps = {
  model: CardModel;
  image?: BuildImage;
  highlight?: boolean;
  shadow?: boolean;
  accent?: string;
  /** Which cards to render (both are always laid out so the flow is identical). */
  show?: "1" | "2" | "both";
  card1Ref?: Ref<HTMLDivElement>;
  card2Ref?: Ref<HTMLDivElement>;
  gap?: number;
  direction?: "row" | "column";
  /** Called after layout settles: how many trait blocks moved to card 2, and the font scales. */
  onLayout?: (info: LayoutInfo) => void;
};

export type LayoutInfo = { movedBlocks: number; scale1: number; scale2: number };

/** Re-render once web fonts finish loading so measurements use the real metrics. */
function useFontsReady() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let alive = true;
    document.fonts?.ready.then(() => alive && setTick((t) => t + 1));
    const onDone = () => alive && setTick((t) => t + 1);
    document.fonts?.addEventListener?.("loadingdone", onDone);
    return () => {
      alive = false;
      document.fonts?.removeEventListener?.("loadingdone", onDone);
    };
  }, []);
  return tick;
}

/**
 * Lays out card 1 and card 2. Trait blocks that don't fit under the weapon table move (from the end)
 * to card 2, before the core rules. Then each card's body font shrinks (fitText) if it still overflows.
 */
export function CardPair(props: CardPairProps) {
  const { model, image, highlight, shadow, accent, show = "both", gap = 24, direction = "column", onLayout } = props;
  const total = model.traitBlocks.length;
  const layoutKey = JSON.stringify(model) + (image ? `${image.x},${image.y},${image.zoom}` : "");
  const fontsTick = useFontsReady();

  const [flow, setFlow] = useState({ key: layoutKey, keep: total });
  const keep = flow.key === layoutKey ? Math.min(flow.keep, total) : total;

  const c1 = useRef<HTMLDivElement | null>(null);
  const c2 = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const card1 = c1.current;
    const card2 = c2.current;
    if (!card1 || !card2) return;
    fitHeader(card1);
    fitHeader(card2);
    card1.style.setProperty("--fs", "1");
    if (cardOverflows(card1) && keep > 0) {
      setFlow({ key: layoutKey, keep: keep - 1 });
      return;
    }
    const scale1 = fitCardBody(card1);
    const scale2 = fitCardBody(card2);
    onLayout?.({ movedBlocks: total - keep, scale1, scale2 });
  }, [keep, layoutKey, total, onLayout, fontsTick]);

  // Re-run the flow from scratch when fonts load (metrics change).
  useLayoutEffect(() => {
    if (fontsTick > 0) setFlow({ key: layoutKey, keep: total });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontsTick]);

  const setRef = (local: typeof c1, external?: Ref<HTMLDivElement>) => (el: HTMLDivElement | null) => {
    local.current = el;
    if (typeof external === "function") external(el);
    else if (external) (external as { current: HTMLDivElement | null }).current = el;
  };

  const common = { model, image, highlight, shadow, accent };
  const hidden = { position: "absolute", left: -99999, top: 0, visibility: "hidden" } as const;
  return (
    <div style={{ display: "flex", flexDirection: direction, gap, position: "relative", alignItems: "flex-start" }}>
      <div style={show === "2" ? hidden : undefined}>
        <Datacard {...common} ref={setRef(c1, props.card1Ref)} page="1/2" traitBlocks={model.traitBlocks.slice(0, keep)} />
      </div>
      <div style={show === "1" ? hidden : undefined}>
        <RulesCard {...common} ref={setRef(c2, props.card2Ref)} page="2/2" overflowBlocks={model.traitBlocks.slice(keep)} />
      </div>
    </div>
  );
}
