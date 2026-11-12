import { forwardRef, useImperativeHandle, useRef } from "react";
import { CardPair } from "../card/CardPair";
import { CONFIG } from "../config";
import type { CardModel } from "../model/derive";
import type { BuildImage } from "../model/schema";

export type ExportNodes = { card1: HTMLDivElement | null; card2: HTMLDivElement | null; both: HTMLDivElement | null };

/**
 * Off-screen, unscaled copy of the two cards used as the export source (so the preview's zoom,
 * shadow and tab state never leak into exports).
 */
export const ExportStage = forwardRef<ExportNodes, { model: CardModel; image?: BuildImage; highlight: boolean }>(
  function ExportStage({ model, image, highlight }, ref) {
    const c1 = useRef<HTMLDivElement>(null);
    const c2 = useRef<HTMLDivElement>(null);
    const both = useRef<HTMLDivElement>(null);
    useImperativeHandle(ref, () => ({
      get card1() { return c1.current; },
      get card2() { return c2.current; },
      get both() { return both.current; },
    }), []);
    return (
      <div aria-hidden style={{ position: "fixed", left: -20000, top: 0, pointerEvents: "none" }}>
        <div ref={both} style={{ display: "inline-block", background: "transparent" }}>
          <CardPair model={model} image={image} highlight={highlight} accent={CONFIG.accent} direction="row" gap={40}
            card1Ref={c1} card2Ref={c2} />
        </div>
      </div>
    );
  },
);
