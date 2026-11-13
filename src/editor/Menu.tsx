import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

const GUTTER = 8;

/** Small disclosure popover for the top-bar export options. Closes on Escape or outside click. */
export function Menu(props: { label: string; primary?: boolean; disabled?: boolean; children: (close: () => void) => ReactNode }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const pop = useRef<HTMLDivElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the popover inside the viewport: on narrow screens the button can sit on the left,
  // so the right-aligned popover would otherwise hang off the left edge.
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const el = pop.current;
      if (!el) return;
      el.style.transform = "";
      const r = el.getBoundingClientRect();
      const vw = document.documentElement.clientWidth;
      let dx = 0;
      if (r.left < GUTTER) dx = GUTTER - r.left;
      else if (r.right > vw - GUTTER) dx = vw - GUTTER - r.right;
      if (dx) el.style.transform = `translateX(${Math.round(dx)}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [open]);

  return (
    <div className="menu" ref={root}>
      <button type="button" className={`btn${props.primary ? " primary" : ""}`} aria-expanded={open} aria-controls={id}
        disabled={props.disabled} onClick={() => setOpen((o) => !o)}>
        {props.label} <span aria-hidden>▾</span>
      </button>
      {open && <div className="menu-pop" id={id} ref={pop}>{props.children(() => setOpen(false))}</div>}
    </div>
  );
}
