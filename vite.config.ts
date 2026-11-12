/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// GitHub Pages serves the app from /<repo-name>/. In GitHub Actions the repo name comes from
// GITHUB_REPOSITORY; locally `npm run build` falls back to this repo's name. Dev server uses "/".
const REPO = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "killteam_nemesis_operative_datacard_maker";
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === "build" ? `/${REPO}/` : "/"),
  plugins: [react()],
  server: { watch: { ignored: ["**/reference/**", "**/docs/**"] } },
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.{ts,tsx}"],
  },
}));
