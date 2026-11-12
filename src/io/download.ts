import type { NemesisBuild } from "../model/schema";
import { keywordFromName } from "../model/schema";

/** `nemesis-<name-keyword>-<size>` (plan.md §5.2). */
export function fileBaseName(build: NemesisBuild): string {
  const kw = (build.nameKeyword || keywordFromName(build.name) || "operative")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `nemesis-${kw || "operative"}-${build.size.toLowerCase()}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadJson(build: NemesisBuild, filename: string) {
  downloadBlob(new Blob([JSON.stringify(build, null, 2)], { type: "application/json" }), filename);
}
