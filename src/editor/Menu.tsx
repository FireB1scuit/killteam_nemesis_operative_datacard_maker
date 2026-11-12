import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Small disclosure popover for the top-bar export options. Closes on Escape or outside click. */
export function Menu(props: { label: string; primary?: boolean; disabled?: boolean; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div className="menu" ref={root}>
      <button type="button" className={`btn${props.primary ? " primary" : ""}`} aria-expanded={open} aria-controls={id}
        disabled={props.disabled} onClick={() => setOpen((o) => !o)}>
        {props.label} <span aria-hidden>▾</span>
      </button>
      {open && <div className="menu-pop" id={id}>{props.children(() => setOpen(false))}</div>}
    </div>
  );
}
