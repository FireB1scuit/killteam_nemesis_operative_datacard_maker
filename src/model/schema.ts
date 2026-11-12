import { z } from "zod";
import { ALLEGIANCE_IDS } from "../data/allegiances";
import { BEHAVIOUR_IDS } from "../data/behaviours";
import { TRAIT_IDS } from "../data/traits";
import { WEAPON_BY_ID } from "../data/weapons";

export const SCHEMA_MAGIC = "nemesis-datacard" as const;
export const SCHEMA_VERSION = 1 as const;

export const WeaponPickSchema = z.object({
  id: z.string().min(1),
  weaponId: z.string().refine((id) => id in WEAPON_BY_ID, { message: "Unknown weapon" }),
  alias: z.string().optional(),
  /** For Twinned/Paired picks: the `id` of the pick they modify. */
  targetId: z.string().optional(),
});

export const ImageSchema = z.object({
  dataUrl: z.string().startsWith("data:image/"),
  /** Focal point in % of the image (0–100), like CSS object-position. */
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  /** 1 = image just covers the frame; >1 zooms in. */
  zoom: z.number().min(1).max(5),
});

export const NemesisBuildSchema = z.object({
  schema: z.literal(SCHEMA_MAGIC),
  version: z.literal(SCHEMA_VERSION),
  operativeType: z.enum(["player", "npo"]),
  name: z.string(),
  moniker: z.string().optional(),
  nameKeyword: z.string(),
  /** Optional only while a new build is being filled in; validation requires it. */
  allegiance: z.enum(ALLEGIANCE_IDS).optional(),
  theme: z.string().optional(),
  size: z.enum(["S", "M", "L"]),
  base: z.object({ kind: z.enum(["round", "oval", "custom"]), label: z.string() }),
  behaviour: z.enum(BEHAVIOUR_IDS).optional(),
  weapons: z.array(WeaponPickSchema),
  traits: z.array(z.enum(TRAIT_IDS)),
  image: ImageSchema.optional(),
  createdWith: z.string(),
});

export type WeaponPick = z.infer<typeof WeaponPickSchema>;
export type BuildImage = z.infer<typeof ImageSchema>;
export type NemesisBuild = z.infer<typeof NemesisBuildSchema>;

let counter = 0;
export function newPickId(): string {
  counter += 1;
  return `w${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function emptyBuild(): NemesisBuild {
  return {
    schema: SCHEMA_MAGIC,
    version: SCHEMA_VERSION,
    operativeType: "npo",
    name: "",
    nameKeyword: "",
    size: "M",
    base: { kind: "round", label: "80" },
    weapons: [],
    traits: [],
    createdWith: typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev",
  };
}

/** "Screamer-Killer" → "SCREAMER-KILLER". */
export function keywordFromName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toUpperCase();
}
