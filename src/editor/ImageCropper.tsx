import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { BuildImage } from "../model/schema";
import { looksLikeImage, processImageFile } from "../io/image";
import { CameraDialog, canUseLiveCamera, prefersNativeCamera } from "./CameraDialog";

const ACCEPT_EXT = ".jpg,.jpeg,.jfif,.png,.webp,.gif,.avif,.bmp,.svg,.ico,.heic,.heif,.tif,.tiff";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Model picture: upload (click / drop / paste), then pan by dragging (or arrow keys) and zoom
 * (slider, wheel, +/-) inside a frame with the same size and fade as the card's portrait slot.
 */
export function ImageCropper({ image, onChange }: { image?: BuildImage; onChange: (img: BuildImage | undefined) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const native = prefersNativeCamera();
  const hasCamera = native || canUseLiveCamera();
  const openCamera = () => (native ? captureRef.current?.click() : setCameraOpen(true));
  const drag = useRef<{ x: number; y: number; ix: number; iy: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [over, setOver] = useState(false);

  const accept = async (file?: File | null) => {
    if (!file) return;
    setBusy(true);
    setError(undefined);
    try {
      const dataUrl = await processImageFile(file);
      onChange({ dataUrl, x: 50, y: 50, zoom: 1 });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const update = (patch: Partial<BuildImage>) => image && onChange({ ...image, ...patch });

  // Wheel zoom needs a non-passive listener so the form doesn't scroll at the same time.
  const frameRef = useRef<HTMLDivElement>(null);
  const latest = useRef({ image, onChange });
  latest.current = { image, onChange };
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      const { image: img, onChange: set } = latest.current;
      if (!img) return;
      e.preventDefault();
      set({ ...img, zoom: clamp(img.zoom - e.deltaY * 0.0015, 1, 5) });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!image) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ix: image.x, iy: image.y };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || !image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Dragging the picture right reveals more of its left side → focal point moves left.
    const k = 100 / image.zoom;
    update({
      x: clamp(d.ix - ((e.clientX - d.x) / rect.width) * k, 0, 100),
      y: clamp(d.iy - ((e.clientY - d.y) / rect.height) * k, 0, 100),
    });
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!image) return;
    const step = e.shiftKey ? 10 : 2;
    const map: Record<string, Partial<BuildImage>> = {
      ArrowLeft: { x: clamp(image.x + step, 0, 100) },
      ArrowRight: { x: clamp(image.x - step, 0, 100) },
      ArrowUp: { y: clamp(image.y + step, 0, 100) },
      ArrowDown: { y: clamp(image.y - step, 0, 100) },
      "+": { zoom: clamp(image.zoom + 0.1, 1, 5) },
      "=": { zoom: clamp(image.zoom + 0.1, 1, 5) },
      "-": { zoom: clamp(image.zoom - 0.1, 1, 5) },
    };
    if (map[e.key]) {
      e.preventDefault();
      update(map[e.key]);
    }
  };

  return (
    <div
      className={`drop${over ? " over" : ""}`}
      onDragOver={(e) => {
        if ([...e.dataTransfer.items].some((i) => i.kind === "file" && (!i.type || looksLikeImage(i)))) {
          e.preventDefault();
          e.stopPropagation();
          setOver(true);
        }
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        const f = [...e.dataTransfer.files].find(looksLikeImage);
        if (!f) return;
        e.preventDefault();
        e.stopPropagation();
        setOver(false);
        void accept(f);
      }}
      onPaste={(e) => {
        const f = [...e.clipboardData.files].find(looksLikeImage);
        if (f) void accept(f);
      }}
    >
      <div
        ref={frameRef}
        className={`frame${image ? " has" : ""}`}
        role={image ? "img" : undefined}
        aria-label={image ? "Picture position: drag or use arrow keys to move, + and - to zoom" : undefined}
        tabIndex={image ? 0 : -1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        onKeyDown={onKey}
        onClick={() => !image && fileRef.current?.click()}
      >
        {image ? (
          <img src={image.dataUrl} alt="" draggable={false}
            style={{ objectPosition: `${image.x}% ${image.y}%`, transformOrigin: `${image.x}% ${image.y}%`, transform: `scale(${image.zoom})` }} />
        ) : (
          <span>{busy ? "Processing…" : "No picture"}</span>
        )}
      </div>
      <div className="drop-side">
        <b>Model picture</b>
        {!image && <span>Drop an image here, paste, click to upload (JPG, PNG, WebP, HEIC, GIF, BMP, SVG…){hasCamera ? " or take a photo" : ""}. It's resized to 1600 px.</span>}
        {image && (
          <>
            <span>Drag to position · scroll or slider to zoom.</span>
            <label className="zoomrow">
              Zoom
              <input type="range" min={1} max={5} step={0.05} value={image.zoom}
                onChange={(e) => update({ zoom: Number(e.target.value) })} />
            </label>
          </>
        )}
        <div className="btnrow">
          <button type="button" className="btn small" onClick={() => fileRef.current?.click()} disabled={busy}>
            {image ? "Replace" : "Upload"}
          </button>
          {hasCamera && (
            <button type="button" className="btn small" onClick={openCamera} disabled={busy}>Take photo</button>
          )}
          {image && (
            <>
              <button type="button" className="btn small" onClick={() => update({ x: 50, y: 50, zoom: 1 })}>Reset</button>
              <button type="button" className="btn small" onClick={() => onChange(undefined)}>Remove</button>
            </>
          )}
        </div>
        {error && <span className="err" role="alert">{error}</span>}
        <input ref={fileRef} type="file" accept={`image/*,${ACCEPT_EXT}`} hidden
          onChange={(e) => {
            void accept(e.target.files?.[0]);
            e.target.value = "";
          }} />
        <input ref={captureRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => {
            void accept(e.target.files?.[0]);
            e.target.value = "";
          }} />
        {cameraOpen && <CameraDialog onCapture={(f) => void accept(f)} onClose={() => setCameraOpen(false)} />}
      </div>
    </div>
  );
}
