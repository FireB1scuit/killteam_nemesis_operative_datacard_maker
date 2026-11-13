import { forwardRef, type CSSProperties } from "react";
import type { CardModel, RuleAbility } from "../model/derive";
import type { BuildImage } from "../model/schema";
import { AbilityView, CardFooter, CardHeader } from "./CardParts";
import { ruleTooltip } from "../data/weaponRules";
import { IconMelee, IconRanged } from "./icons";

export type CardProps = {
  model: CardModel;
  image?: BuildImage;
  highlight?: boolean;
  shadow?: boolean;
  accent?: string;
  /** Total pages, e.g. "1/2". */
  page: string;
};

export function cardClass(highlight?: boolean, shadow?: boolean) {
  return `kt-card${highlight ? " hl" : ""}${shadow ? " shadow" : ""}`;
}

/** Card 1 (front): stats + weapons + the trait blocks that fit + reminders. */
export const Datacard = forwardRef<HTMLDivElement, CardProps & { traitBlocks: RuleAbility[] }>(function Datacard(
  { model, image, highlight, shadow, accent, page, traitBlocks },
  ref,
) {
  return (
    <div ref={ref} className={cardClass(highlight, shadow)} style={accent ? ({ "--faction": accent } as CSSProperties) : undefined} data-card="1">
      <CardHeader model={model} image={image} />
      <div className="kt-body" data-fit="body">
        <table className="weapons">
          <thead>
            <tr><th className="ico" aria-label="Type" /><th className="n">Name</th><th className="c">Atk</th><th className="c">Hit</th><th className="c">Dmg</th><th className="wr">WR</th></tr>
          </thead>
          <tbody>
            {model.weapons.length === 0 && (
              <tr className="empty"><td className="ico" /><td className="n">No weapons selected</td><td className="c" /><td className="c" /><td className="c" /><td className="wr" /></tr>
            )}
            {model.weapons.map((w) => (
              <tr key={w.key}>
                <td className="ico">{w.type === "ranged" ? <IconRanged /> : <IconMelee />}</td>
                <td className="n">{w.label}</td>
                <td className="c"><span className={w.changed.atk ? "mod" : undefined}>{w.atk}</span></td>
                <td className="c"><span className={w.changed.hit ? "mod" : undefined}>{w.hit}+</span></td>
                <td className="c">{w.dmg}</td>
                <td className="wr">
                  {w.rules.length === 0 ? "-" : w.rules.map((r, i) => (
                    <span key={r.text}>
                      {i > 0 && ", "}
                      <span className={r.changed ? "mod" : undefined} title={ruleTooltip(r.text)}>{r.text}</span>
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="abil" data-fit="abil">
          {traitBlocks.map((b) => <AbilityView key={b.key} block={b} />)}
          {model.reminderBlocks.map((b) => <AbilityView key={b.key} block={b} />)}
        </div>
      </div>
      <CardFooter model={model} page={page} />
    </div>
  );
});
