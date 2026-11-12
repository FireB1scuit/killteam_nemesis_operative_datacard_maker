import type { ReactNode } from "react";
import type { Issue } from "../model/validate";

export function Step(props: {
  no: number;
  title: string;
  hint?: string;
  issues: Issue[];
  /** Replaces the ✓ when given (e.g. "3 / 3"). */
  badge?: string;
  children: ReactNode;
}) {
  const errors = props.issues.filter((i) => i.level === "error");
  const warnings = props.issues.filter((i) => i.level === "warning");
  const state = errors.length ? "error" : warnings.length ? "warn" : "ok";
  const symbol = state === "ok" ? "✓" : state === "warn" ? "!" : "✕";
  const headingId = `step-${props.no}`;
  return (
    <section className="step" aria-labelledby={headingId}>
      <h2 id={headingId}>
        <span className="no" aria-hidden>{props.no}</span>
        {props.title}
        {props.hint && <small className="hint">{props.hint}</small>}
        <span className={`state ${state}`} title={[...errors, ...warnings].map((i) => i.message).join("\n") || "Complete"}>
          {props.badge ? `${props.badge} ` : ""}
          <span aria-label={state === "ok" ? "complete" : state === "warn" ? "warning" : "error"}>{symbol}</span>
        </span>
      </h2>
      <div className="inner">
        {props.children}
        {[...errors, ...warnings].filter((i) => !i.pickId).map((i, k) => (
          <div key={k} className={i.level === "error" ? "errbox" : "warnbox"} role={i.level === "error" ? "alert" : undefined}>
            {i.message}
          </div>
        ))}
      </div>
    </section>
  );
}
