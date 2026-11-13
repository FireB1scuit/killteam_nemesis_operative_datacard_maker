import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardPair } from "../card/CardPair";
import { CONFIG } from "../config";
import type { CardModel } from "../model/derive";
import type { BuildImage } from "../model/schema";

export type ExportNodes = {
  card1: HTMLDivElement | null;
  card2: HTMLDivElement | null;
  /** Both cards side by side. */
  both: HTMLDivElement | null;
  /** Both cards below each other. */
  stacked: HTMLDivElement | null;
};

/**
 * Off-screen, unscaled copy of the two cards used as the export source (so the preview's zoom,
 * shadow and tab state never leak into exports). The pair is rendered twice: side by side and stacked.
 */
export const ExportStage = forwardRef<ExportNodes, { model: CardModel; image?: BuildImage; highlight: boolean }>(
  function ExportStage({ model, image, highlight }, ref) {
    const c1 = useRef<HTMLDivElement>(null);
    const c2 = useRef<HTMLDivElement>(null);
    const both = useRef<HTMLDivElement>(null);
    const stacked = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      get card1() { return c1.current; },
      get card2() { return c2.current; },
      get both() { return both.current; },
      get stacked() { return stacked.current; },
    }), []);
    return (
      <div aria-hidden style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <div ref={both} style={{ display: "inline-block", background: "transparent" }}>
          <CardPair model={model} image={image} highlight={highlight} accent={CONFIG.accent} direction="row" gap={40}
            card1Ref={c1} card2Ref={c2} />
        </div>
        <div ref={stacked} style={{ display: "inline-block", background: "transparent" }}>
          <CardPair model={model} image={image} highlight={highlight} accent={CONFIG.accent} direction="column" gap={40} />
        </div>
      </div>
    );
  },
);
