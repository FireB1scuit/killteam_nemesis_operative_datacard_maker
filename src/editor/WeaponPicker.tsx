import { useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { searchWeapons, WEAPON_BY_ID, type WeaponDef, type WeaponProfile } from "../data/weapons";

/** Atk / Hit / Dmg / WR cells for one profile, laid out on the shared column grid. */
function statCells(p: WeaponProfile) {
  return (
    <>
      <span className="num">{p.atk}</span>
      <span className="num">{p.hit}+</span>
      <span className="num">{p.dmg[0]}/{p.dmg[1]}</span>
      <span className="wr">{p.rules.length ? p.rules.join(", ") : "–"}</span>
    </>
  );
}

/** Weapon stats as in the Dossier's weapon table, so options can be compared while choosing. */
function WeaponStats({ w }: { w: WeaponDef }) {
  if (w.profiles.length === 0) return <span className="mod">{w.modifierText}</span>;
  if (w.profiles.length === 1) return statCells(w.profiles[0]);
  return (
    <>
      <span className="profiles-gap" />
      {w.profiles.map((p, i) => (
        <span key={i} className="profile">
          <span className="pname">– {p.suffix ?? `profile ${i + 1}`}</span>
          {statCells(p)}
        </span>
      ))}
    </>
  );
}

function matchNote(w: WeaponDef, q: string): string | undefined {
  const query = q.trim().toLowerCase();
  if (!query || w.name.toLowerCase().includes(query)) return undefined;
  return w.alternatives.find((a) => a.toLowerCase().includes(query));
}

/**
 * Searchable weapon combobox (ARIA 1.2 pattern). Typing filters by name and Dossier alternatives,
 * so "deathspitter" finds Autocannon.
 */
export function WeaponPicker(props: {
  value?: string;
  placeholder?: string;
  label: string;
  onPick: (weaponId: string) => void;
  /** Clear the input after picking (the "add weapon" box). */
  resetOnPick?: boolean;
}) {
  const current = props.value ? WEAPON_BY_ID[props.value] : undefined;
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [pos, setPos] = useState<CSSProperties>();

  // The list is position:fixed so it isn't clipped by the scrolling editor panel; keep it under (or above) the input.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const r = inputRef.current?.getBoundingClientRect();
      if (!r) return;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const width = Math.max(r.width, Math.min(680, vw - 16));
      const left = Math.max(8, Math.min(r.left, vw - 8 - width));
      const below = vh - r.bottom - 10;
      const above = r.top - 10;
      const up = below < 240 && above > below;
      const maxHeight = Math.min(420, up ? above : below);
      setPos(up ? { left, width, maxHeight, bottom: vh - r.top + 2 } : { left, width, maxHeight, top: r.bottom + 2 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const q = query ?? "";
  const results = useMemo(() => searchWeapons(q), [q]);
  const ranged = results.filter((w) => w.type === "ranged");
  const melee = results.filter((w) => w.type === "melee");
  const ordered = [...ranged, ...melee];

  const pick = (w: WeaponDef) => {
    props.onPick(w.id);
    setQuery(null);
    setOpen(false);
    if (props.resetOnPick) inputRef.current?.blur();
  };

  const optionId = (i: number) => `${listId}-o${i}`;
  const renderGroup = (title: string, list: WeaponDef[], offset: number) =>
    list.length > 0 && (
      <li role="presentation" className="grp">
        <div className="grp-title" aria-hidden>{title}</div>
        <ul role="group" aria-label={title}>
          {list.map((w, k) => {
            const i = offset + k;
            const alt = matchNote(w, q);
            return (
              <li
                key={w.id}
                id={optionId(i)}
                role="option"
                aria-selected={i === active}
                className={i === active ? "active" : undefined}
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(w);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="wname">
                  {w.name}
                  {alt && <small> ({alt})</small>}
                </span>
                <span className="cost">{w.selection}</span>
                <WeaponStats w={w} />
              </li>
            );
          })}
        </ul>
      </li>
    );

  return (
    <div className="combo">
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={props.label}
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && ordered[active] ? optionId(active) : undefined}
        placeholder={props.placeholder ?? "Search weapons…"}
        value={query ?? (props.resetOnPick ? "" : current?.name ?? "")}
        onFocus={(e) => {
          setOpen(true);
          setActive(0);
          e.target.select();
        }}
        onBlur={() => {
          setOpen(false);
          setQuery(null);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((a) => Math.min(ordered.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter") {
            if (open && ordered[active]) {
              e.preventDefault();
              pick(ordered[active]);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
            setQuery(null);
          }
        }}
      />
      {open && (
        <ul id={listId} role="listbox" aria-label={props.label} className="combo-list" style={pos}>
          {ordered.length === 0 && <li className="none">No match. Pick the closest weapon.</li>}
          {ordered.length > 0 && (
            <li role="presentation" aria-hidden className="combo-head">
              <span>Weapon</span>
              <span className="sel">Sel.</span>
              <span className="num">Atk</span>
              <span className="num">Hit</span>
              <span className="num">Dmg</span>
              <span className="wr">Weapon rules</span>
            </li>
          )}
          {renderGroup("Ranged", ranged, 0)}
          {renderGroup("Melee", melee, ranged.length)}
        </ul>
      )}
    </div>
  );
}
