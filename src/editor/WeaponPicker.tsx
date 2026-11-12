import { useId, useMemo, useRef, useState } from "react";
import { searchWeapons, WEAPON_BY_ID, type WeaponDef } from "../data/weapons";

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
                <span>{w.name}</span>
                {alt && <small> ({alt})</small>}
                <span className="cost">{w.selection}</span>
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
        <ul id={listId} role="listbox" aria-label={props.label} className="combo-list">
          {ordered.length === 0 && <li className="none">No match. Pick the closest weapon.</li>}
          {renderGroup("Ranged", ranged, 0)}
          {renderGroup("Melee", melee, ranged.length)}
        </ul>
      )}
    </div>
  );
}
