// Ember Court — entrypoint (main.ts).
// Grader entry: `node main.ts` (no server, no arguments needed).
// Copies game/ and screenshots/ into the output directory, writes
// /output/dossier.json via the kit's buildDossier, then exits.
// Written in erasable TypeScript only (no enums, namespaces, or
// parameter properties) so Node 22 type stripping runs it as-is.
import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-game.ts";

const root: string = path.dirname(fileURLToPath(import.meta.url));
const outDir: string = process.env.MAKEFUN_OUTPUT_DIR || "/output";

mkdirSync(outDir, { recursive: true });
cpSync(path.join(root, "game"), path.join(outDir, "game"), { recursive: true });
cpSync(path.join(root, "screenshots"), path.join(outDir, "screenshots"), { recursive: true });

const dossier: Uint8Array = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(path.join(outDir, "dossier.json"), dossier);

console.log("Ember Court handed in to " + outDir);
