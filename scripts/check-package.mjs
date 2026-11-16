import { readFile, mkdtemp, mkdir, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
const npmCli = process.env.npm_execpath;
assert(
  npmCli,
  "Run package validation through npm so npm_execpath is available",
);
const destination = await mkdtemp(join(tmpdir(), "arap-pack-"));
const packOutput = JSON.parse(
  execFileSync(
    process.execPath,
    [npmCli, "pack", "--json", "--pack-destination", destination],
    { encoding: "utf8" },
  ),
);
const result = Array.isArray(packOutput)
  ? packOutput[0]
  : Object.values(packOutput)[0];
assert(result, "npm pack did not return package metadata");
const names = result.files.map((file) => file.path);
for (const file of [
  "dist/index.mjs",
  "dist/index.js",
  "dist/index.d.ts",
  "dist/index.d.mts",
  "dist/style.css",
  "dist/fonts/Manrope-VariableFont_wght.ttf",
  "dist/fonts/OFL.txt",
  "LICENSE",
  "NOTICE",
])
  assert(names.includes(file), `Missing ${file}`);
for (const file of ["dist/index.mjs", "dist/index.js"])
  assert(
    (await readFile(file, "utf8")).startsWith('"use client";'),
    `Missing client directive: ${file}`,
  );
for (const file of ["dist/index.mjs", "dist/index.js"]) {
  const bundle = await readFile(file, "utf8");
  assert(
    bundle.includes("styleInject"),
    `Missing automatic CSS injection: ${file}`,
  );
  assert(bundle.includes(".arap-root"), `Missing bundled widget CSS: ${file}`);
  assert(bundle.includes("Manrope"), `Missing bundled Manrope font: ${file}`);
  assert(
    bundle.includes("data:font/ttf;base64,"),
    `Missing inlined Manrope data URI in ${file}`,
  );
  assert(
    !bundle.includes("./fonts/Manrope-VariableFont_wght.ttf"),
    `Relative Manrope font URL leaked into ${file}`,
  );
}
const css = await readFile("dist/style.css", "utf8");
assert(
  css.includes("./fonts/Manrope-VariableFont_wght.ttf"),
  "Standalone dist/style.css should reference ./fonts/Manrope-VariableFont_wght.ttf",
);
assert(
  !/(^|\})\s*(html|body|:root|\*)\s*\{/.test(css),
  "Global reset detected",
);
assert(css.includes(".arap-panel[hidden]"));
assert(!names.some((name) => name.startsWith("node_modules/")));
await mkdir(".consumers", { recursive: true });
await copyFile(
  join(destination, result.filename),
  resolve(".consumers/package.tgz"),
);
console.log(
  JSON.stringify(
    {
      tarball: resolve(".consumers/package.tgz"),
      files: names.length,
      bytes: result.size,
      clientBoundary: true,
      cssIsolation: true,
    },
    null,
    2,
  ),
);
