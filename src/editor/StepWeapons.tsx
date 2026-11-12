import { WEAPON_BY_ID, type WeaponDef } from "../data/weapons";
import type { Issue } from "../model/validate";
import { Step } from "./Step";
import type { StepProps } from "./Steps";
import { WeaponPicker } from "./WeaponPicker";

function describe(def: WeaponDef): string {
  if (def.modifier) return `Modifier: ${def.modifierText}`;
  const kind = def.type === "ranged" ? "Ranged" : "Melee";
  const alt = def.alternatives.length ? ` · alt: ${def.alternatives.join(", ")}` : "";
  if (def.profiles.length > 1) {
    const names = def.profiles.map((p) => p.suffix).join(" / ");
    return `${kind} · two profiles (${names})${alt}`;
  }
  const p = def.profiles[0];
  const rules = p.rules.length ? ` · ${p.rules.join(", ")}` : "";
  return `${kind} · ${p.atk} / ${p.hit}+ / ${p.dmg.join("/")}${rules}${alt}`;
}

export function StepWeapons({ build, dispatch, issues, card }: StepProps) {
  const { used, allowed } = card.selections;
  const mine = issues.filter((i) => i.step === "weapons");
  const byPick = (id: string): Issue[] => mine.filter((i) => i.pickId === id);
  const over = used > allowed;
  const segments = Math.max(allowed, used);

  return (
    <Step no={5} title="Weapons" issues={mine} badge={`${used} / ${allowed}`}>
      <div className={`meter${over ? " over" : ""}`}>
        Selections
        <div className="bar" style={{ gridTemplateColumns: `repeat(${segments}, 1fr)` }} aria-hidden>
          {Array.from({ length: segments }, (_, i) => <i key={i} className={i < used ? (i >= allowed ? "over" : "on") : undefined} />)}
        </div>
        <span role="status">{used} of {allowed} used</span>
      </div>

      {build.weapons.map((pick, idx) => {
        const def = WEAPON_BY_ID[pick.weaponId];
        if (!def) return null;
        const targets = build.weapons.filter((w) => {
          const d = WEAPON_BY_ID[w.weaponId];
          return w.id !== pick.id && d && !d.modifier && d.type === def.type;
        });
        const rowIssues = byPick(pick.id);
        return (
          <div className={`wpn${rowIssues.some((i) => i.level === "error") ? " bad" : ""}`} key={pick.id}>
            <WeaponPicker
              label={`Weapon ${idx + 1}`}
              value={pick.weaponId}
              onPick={(weaponId) => dispatch({ type: "updateWeapon", id: pick.id, patch: { weaponId, ...(WEAPON_BY_ID[weaponId]?.modifier ? { alias: undefined } : { targetId: undefined }) } })}
            />
            {def.modifier ? (
              <select
                aria-label={`${def.name} target`}
                value={pick.targetId ?? ""}
                onChange={(e) => dispatch({ type: "updateWeapon", id: pick.id, patch: { targetId: e.target.value || undefined } })}
              >
                <option value="">→ choose {def.type} weapon</option>
                {targets.map((t) => (
                  <option key={t.id} value={t.id}>→ {t.alias || WEAPON_BY_ID[t.weaponId].name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                aria-label={`Alias for ${def.name}`}
                placeholder="Alias (optional)"
                maxLength={48}
                value={pick.alias ?? ""}
                onChange={(e) => dispatch({ type: "updateWeapon", id: pick.id, patch: { alias: e.target.value || undefined } })}
              />
            )}
            <span className="cost" title="Weapon selections used">{def.selection}</span>
            <span className="tools">
              <button type="button" className="icon" aria-label="Move up" disabled={idx === 0}
                onClick={() => dispatch({ type: "moveWeapon", id: pick.id, dir: -1 })}>▲</button>
              <button type="button" className="icon" aria-label="Move down" disabled={idx === build.weapons.length - 1}
                onClick={() => dispatch({ type: "moveWeapon", id: pick.id, dir: 1 })}>▼</button>
              <button type="button" className="icon x" aria-label={`Remove ${def.name}`}
                onClick={() => dispatch({ type: "removeWeapon", id: pick.id })}>✕</button>
            </span>
            <div className="sub">
              {describe(def)}
              {def.modifier && pick.targetId && (() => {
                const t = build.weapons.find((w) => w.id === pick.targetId);
                const name = t ? t.alias || WEAPON_BY_ID[t.weaponId]?.name : undefined;
                const prefix = def.modifier === "twinned" ? "Twinned" : "Paired";
                return name ? ` Shown as “${prefix} ${name.charAt(0).toLowerCase()}${name.slice(1)}”.` : null;
              })()}
            </div>
            {rowIssues.map((i, k) => <div key={k} className="sub err" role="alert">{i.message}</div>)}
          </div>
        );
      })}

      <div className="addrow">
        <WeaponPicker label="Add weapon" placeholder="+ Add weapon (type to search, e.g. deathspitter)" resetOnPick
          onPick={(weaponId) => dispatch({ type: "addWeapon", weaponId })} />
      </div>
      <div className="note">
        Selection 2 weapons use two slots and the close combat weapon uses none. Each unused slot adds +1 nemesis trait.
        Pick the closest weapon if yours isn't listed; the alias replaces its name on the card.
      </div>
    </Step>
  );
}
