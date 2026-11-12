import { forwardRef, type CSSProperties, type ReactNode } from "react";
import type { RuleAbility } from "../model/derive";
import { AbilityView, CardFooter, CardHeader } from "./CardParts";
import { cardClass, type CardProps } from "./Datacard";

const EMPHASIS = /\b(Engage|Conceal|Fight|Charge|Shoot|Fall Back|Reposition|Dash)\b/g;

/** Bold order and action names, as on official action cards. */
function emphasise(text: string): ReactNode[] {
  return text.split(EMPHASIS).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

/** Card 2: behaviour (or player restrictions) as an action bar, overflow traits, core Nemesis rules. */
export const RulesCard = forwardRef<HTMLDivElement, CardProps & { overflowBlocks: RuleAbility[] }>(function RulesCard(
  { model, image, highlight, shadow, accent, page, overflowBlocks },
  ref,
) {
  const a = model.actionBlock;
  const hasPrio = !!a.priorities?.length;
  return (
    <div ref={ref} className={cardClass(highlight, shadow)} style={accent ? ({ "--faction": accent } as CSSProperties) : undefined} data-card="2">
      <CardHeader model={model} image={image} />
      <div className="kt-body c2" data-fit="body">
        <div className="actbar">{a.title} {a.tag && <span>{a.tag}</span>}</div>
        <div className="act">
          <div>
            <p className="eff">{emphasise(a.effect)}</p>
            {hasPrio && a.restrictions.map((r, i) => <p key={i} className="res">{r}</p>)}
          </div>
          {hasPrio ? (
            <ol className="prio">
              {a.priorities!.map((s, i) => {
                // Bold the action name and its full stop ("Fight." / "Reposition. If possible…").
                const dot = s.rest.startsWith(".");
                return <li key={i}><b>{s.action}{dot ? "." : ""}</b>{dot ? s.rest.slice(1) : s.rest}</li>;
              })}
            </ol>
          ) : (
            <div>{a.restrictions.map((r, i) => <p key={i} className="res">{r}</p>)}</div>
          )}
        </div>
        <div className="sep" />
        <div className="abil" data-fit="abil">
          {overflowBlocks.map((b) => <AbilityView key={b.key} block={b} />)}
          {model.coreBlocks.map((b) => <AbilityView key={b.key} block={b} />)}
        </div>
      </div>
      <CardFooter model={model} page={page} />
    </div>
  );
});
