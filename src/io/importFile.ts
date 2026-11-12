import { BuildImportError, migrateBuild } from "../model/migrate";
import type { NemesisBuild } from "../model/schema";
import { readPdfBuildJson } from "./pdf";
import { isPngBytes, readPngText } from "./pngText";

const NOT_OURS = "This file wasn't exported by Nemesis Datacard Maker, so it has no build data to load. (Other PDFs or images can't be turned back into a build.)";

function kind(name: string, bytes: Uint8Array): "json" | "png" | "pdf" | "unknown" {
  if (isPngBytes(bytes)) return "png";
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return "pdf"; // %PDF
  const lower = name.toLowerCase();
  if (lower.endsWith(".json")) return "json";
  // JSON without extension: first non-space char is "{"
  const head = new TextDecoder().decode(bytes.subarray(0, 64)).trimStart();
  if (head.startsWith("{")) return "json";
  return "unknown";
}

function parseJson(text: string): NemesisBuild {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BuildImportError("The build data isn't valid JSON.");
  }
  return migrateBuild(raw);
}

/** Read a .json save, or a PNG/PDF exported by the app, into a (migrated) build. */
export async function importBytes(name: string, bytes: Uint8Array): Promise<NemesisBuild> {
  switch (kind(name, bytes)) {
    case "json":
      return parseJson(new TextDecoder().decode(bytes));
    case "png": {
      const text = readPngText(bytes);
      if (!text) throw new BuildImportError(`${NOT_OURS} To use an image as the model picture, drop it on the Model picture box.`);
      return parseJson(text);
    }
    case "pdf": {
      let text: string | undefined;
      try {
        text = await readPdfBuildJson(bytes);
      } catch {
        throw new BuildImportError("This PDF couldn't be opened.");
      }
      if (!text) throw new BuildImportError(NOT_OURS);
      return parseJson(text);
    }
    default:
      throw new BuildImportError("Unsupported file. Choose a .json save, or a PNG or PDF exported by this app.");
  }
}

export async function importFile(file: File): Promise<NemesisBuild> {
  return importBytes(file.name, new Uint8Array(await file.arrayBuffer()));
}
