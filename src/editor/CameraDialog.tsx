import { useEffect, useRef, useState } from "react";

/** True when a live camera preview can be opened (needs a secure context: https or localhost). */
export const canUseLiveCamera = () => typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

/** Phones/tablets: hand off to the native camera app via <input capture>, which gives better photos. */
export const prefersNativeCamera = () =>
  typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;

/**
 * Live webcam preview in a modal dialog. "Take photo" grabs the current frame as a JPEG File.
 * The stream is stopped as soon as the dialog closes.
 */
export function CameraDialog({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [facing, setFacing] = useState<"user" | "environment">("environment");
  const [error, setError] = useState<string>();
  const [ready, setReady] = useState(false);
  const [multiple, setMultiple] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  }, []);

  useEffect(() => {
    let stream: MediaStream | undefined;
    let cancelled = false;
    setReady(false);
    setError(undefined);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        stream = s;
        const v = video.current;
        if (v) {
          v.srcObject = s;
          await v.play().catch(() => undefined);
        }
        const devices = await navigator.mediaDevices.enumerateDevices().catch(() => []);
        if (!cancelled) setMultiple(devices.filter((d) => d.kind === "videoinput").length > 1);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        const name = e instanceof DOMException ? e.name : "";
        setError(
          name === "NotAllowedError" ? "Camera access was blocked. Allow it in your browser's site settings and try again."
            : name === "NotFoundError" || name === "OverconstrainedError" ? "No camera was found on this device."
            : "The camera couldn't be started.",
        );
      });
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  const snap = () => {
    const v = video.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // The user-facing preview is mirrored for comfort; the saved photo is not.
    ctx.drawImage(v, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return setError("The photo couldn't be captured.");
      onCapture(new File([blob], "camera.jpg", { type: "image/jpeg" }));
      onClose();
    }, "image/jpeg", 0.92);
  };

  return (
    <dialog ref={dialog} className="camera" aria-label="Take a picture" onClose={onClose}>
      <div className="camera-view">
        <video ref={video} playsInline muted className={facing === "user" ? "mirror" : undefined}
          onLoadedData={() => setReady(true)} />
        {!ready && !error && <span className="muted">Starting camera…</span>}
        {error && <span className="err" role="alert">{error}</span>}
      </div>
      <div className="btnrow">
        <button type="button" className="btn primary" onClick={snap} disabled={!ready}>Take photo</button>
        {multiple && (
          <button type="button" className="btn" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
            Switch camera
          </button>
        )}
        <button type="button" className="btn" onClick={onClose}>Cancel</button>
      </div>
    </dialog>
  );
}
