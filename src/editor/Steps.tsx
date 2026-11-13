import type { Dispatch } from "react";
import { ALLEGIANCES, ALLEGIANCE_BY_ID } from "../data/allegiances";
import { BASE_PRESETS, normaliseBaseLabel } from "../data/bases";
import { BEHAVIOURS, parseBold } from "../data/behaviours";
import { OPERATIVES_ALONGSIDE, SIZES, SIZE_IDS, TEAM_SIZE_COLUMNS } from "../data/sizes";
import { TRAITS } from "../data/traits";
import type { NemesisBuild } from "../model/schema";
import type { Issue, StepId } from "../model/validate";
import type { CardModel } from "../model/derive";
import type { Action } from "./state";
import { Step } from "./Step";
import { ImageCropper } from "./ImageCropper";

export type StepProps = {
  build: NemesisBuild;
  dispatch: Dispatch<Action>;
  issues: Issue[];
  card: CardModel;
};

const forStep = (issues: Issue[], step: StepId) => issues.filter((i) => i.step === step);

export function Segmented<T extends string>(props: {
  label: string;
  value: T | undefined;
  options: { value: T; label: string; sub?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="seg" role="radiogroup" aria-label={props.label}>
      {props.options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={props.value === o.value}
          className={props.value === o.value ? "on" : undefined}
          onClick={() => props.onChange(o.value)}
        >
          {o.label}
          {o.sub && <small>{o.sub}</small>}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------------------------

export function StepOperative({ build, dispatch, issues }: StepProps) {
  return (
    <Step no={1} title="Operative" issues={forStep(issues, "operative")}>
      <Segmented
        label="Operative type"
        value={build.operativeType}
        options={[{ value: "player", label: "Player operative" }, { value: "npo", label: "NPO" }]}
        onChange={(v) => dispatch({ type: "patch", patch: { operativeType: v } })}
      />
      <div className="row">
        <label className="f">
          Operative name (model)
          <input type="text" value={build.name} maxLength={60} placeholder="e.g. Screamer-Killer"
            onChange={(e) => dispatch({ type: "setName", name: e.target.value })} />
        </label>
        <label className="f">
          Moniker / call sign (optional)
          <input type="text" value={build.moniker ?? ""} maxLength={60} placeholder="e.g. The Deathdirge of Varl"
            onChange={(e) => dispatch({ type: "patch", patch: { moniker: e.target.value || undefined } })} />
        </label>
      </div>
      <label className="f">
        Name keyword (auto from name, editable)
        <input type="text" value={build.nameKeyword} maxLength={60}
          onChange={(e) => dispatch({ type: "patch", patch: { nameKeyword: e.target.value.toUpperCase() } })} />
      </label>
      <ImageCropper image={build.image} onChange={(image) => dispatch({ type: "patch", patch: { image } })} />
    </Step>
  );
}

export function StepAllegiance({ build, dispatch, issues }: StepProps) {
  const a = build.allegiance ? ALLEGIANCE_BY_ID[build.allegiance] : undefined;
  return (
    <Step no={2} title="Allegiance" issues={forStep(issues, "allegiance")}>
      <div className="chips" role="radiogroup" aria-label="Allegiance">
        {ALLEGIANCES.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={build.allegiance === x.id}
            className={`chip${build.allegiance === x.id ? " on" : ""}`}
            onClick={() => dispatch({ type: "patch", patch: { allegiance: x.id } })}>
            {x.label}
          </button>
        ))}
      </div>
      <div className="note">
        {a ? (
          <>Allegiance trait: <b>{a.traitName}</b>. Adds keyword {a.keyword}.</>
        ) : (
          "Your allegiance sets the first keyword and the allegiance trait. Only operatives that share it can join the kill team."
        )}
      </div>
    </Step>
  );
}

export function StepSize({ build, dispatch, issues }: StepProps) {
  const isPreset = BASE_PRESETS.some((p) => p.label === build.base.label) && build.base.kind !== "custom";
  return (
    <Step no={3} title="Size & base" issues={forStep(issues, "size")}>
      <Segmented
        label="Size"
        value={build.size}
        options={SIZE_IDS.map((id) => {
          const s = SIZES[id];
          return { value: id, label: s.label, sub: `C${s.control} · ${s.move}" · ${s.save}+ · W${s.wounds} · ${s.weaponSelections} wpn` };
        })}
        onChange={(size) => dispatch({ type: "setSize", size })}
      />
      <div className="row">
        <label className="f">
          Base size
          <select
            value={isPreset ? build.base.label : "__custom"}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "__custom") dispatch({ type: "patch", patch: { base: { kind: "custom", label: build.base.label } } });
              else {
                const p = BASE_PRESETS.find((x) => x.label === v)!;
                dispatch({ type: "patch", patch: { base: { kind: p.kind, label: p.label } } });
              }
            }}
          >
            <optgroup label="Round">
              {BASE_PRESETS.filter((p) => p.kind === "round").map((p) => <option key={p.label} value={p.label}>{p.label}mm round</option>)}
            </optgroup>
            <optgroup label="Oval">
              {BASE_PRESETS.filter((p) => p.kind === "oval").map((p) => <option key={p.label} value={p.label}>{p.label}mm oval</option>)}
            </optgroup>
            <option value="__custom">Custom…</option>
          </select>
        </label>
        <label className="f">
          Custom (mm)
          <input type="text" placeholder="e.g. 105x70 oval" maxLength={12}
            value={isPreset ? "" : build.base.label}
            onChange={(e) => {
              const n = normaliseBaseLabel(e.target.value);
              dispatch({ type: "patch", patch: { base: { kind: "custom", label: n.label } } });
            }} />
        </label>
      </div>
      <details className="note">
        <summary>Kill team operatives allowed alongside a {SIZES[build.size].label.toLowerCase()} nemesis</summary>
        <table className="mini">
          <tbody>
            <tr><th>Normal team size</th>{TEAM_SIZE_COLUMNS.map((n) => <td key={n}>{n}</td>)}</tr>
            <tr><th>With this nemesis</th>{OPERATIVES_ALONGSIDE[build.size].map((n, i) => <td key={i}>{n}</td>)}</tr>
          </tbody>
        </table>
      </details>
    </Step>
  );
}

export function StepBehaviour({ build, dispatch, issues }: StepProps) {
  if (build.operativeType !== "npo") {
    return (
      <Step no={4} title="Behaviour" hint="NPO only" issues={[]}>
        <div className="note">
          A player operative has no behaviour: you choose its order and actions. It cannot perform mission actions or unique
          actions from equipment, except Operate Hatch and Breach.
        </div>
      </Step>
    );
  }
  const sel = BEHAVIOURS.find((b) => b.id === build.behaviour);
  return (
    <Step no={4} title="Behaviour" hint="NPO only" issues={forStep(issues, "behaviour")}>
      <div className="chips" role="radiogroup" aria-label="Behaviour">
        {BEHAVIOURS.map((b) => (
          <button key={b.id} type="button" role="radio" aria-checked={build.behaviour === b.id}
            className={`chip${build.behaviour === b.id ? " on" : ""}`}
            onClick={() => dispatch({ type: "patch", patch: { behaviour: b.id } })}>
            {b.name}
          </button>
        ))}
      </div>
      {sel && <div className="note">{sel.text.split(". When activated")[0]}. Priorities: {sel.priorities.map((p) => parseBold(p).find((x) => x.bold)?.text.replace(/\.$/, "") ?? "").join(" › ")}.</div>}
    </Step>
  );
}

export function StepTraits({ build, dispatch, issues, card }: StepProps) {
  const slots = card.traitSlots;
  const full = build.traits.length >= slots;
  const a = build.allegiance ? ALLEGIANCE_BY_ID[build.allegiance] : undefined;
  const effects: string[] = [];
  const fury = build.traits.includes("FURY");
  if (fury) effects.push("Fury applied: melee Ceaseless (or Ceaseless → Relentless), ranged Hit worsened by 1.");
  if (build.allegiance === "ORK") effects.push("Waaagh! applied: ranged Hit worsened by 1, melee weapons gain Severe.");
  return (
    <Step no={6} title="Nemesis traits" issues={forStep(issues, "traits")} badge={`${build.traits.length} / ${slots}`}>
      <div className="note">
        1 base + {slots - 1} from unused weapon selection{slots - 1 === 1 ? "" : "s"}.
        {a && <> Allegiance trait (automatic): <b>{a.traitName}</b>.</>}
      </div>
      <div className="chips" role="group" aria-label="Nemesis traits">
        {TRAITS.map((t) => {
          const on = build.traits.includes(t.id);
          return (
            <button key={t.id} type="button" aria-pressed={on} title={t.text}
              aria-disabled={!on && full}
              className={`chip${on ? " on" : full ? " dis" : ""}`}
              onClick={() => (on || !full) && dispatch({ type: "toggleTrait", trait: t.id })}>
              {t.name}
            </button>
          );
        })}
      </div>
      {build.traits.length > 0 && (
        <ul className="traitlist">
          {build.traits.map((id) => {
            const t = TRAITS.find((x) => x.id === id)!;
            return <li key={id}><b>{t.name}:</b> {t.text}</li>;
          })}
        </ul>
      )}
      {effects.map((e) => <div key={e} className="okbox">{e}</div>)}
    </Step>
  );
}
