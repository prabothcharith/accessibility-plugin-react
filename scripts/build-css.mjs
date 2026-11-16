import { copyFile, cp, mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

await mkdir("dist/fonts", { recursive: true });
await copyFile("src/styles/tailwind.css", "dist/style.css");
await cp("src/styles/fonts", "dist/fonts", { recursive: true });

// tsup injects CSS as a raw string without resolving font url() assets; inline base64
// into the runtime JS bundles while leaving dist/style.css referencing dist/fonts/.
const ttfBytes = await readFile(
  "src/styles/fonts/Manrope-VariableFont_wght.ttf",
);
const fontDataUri = `data:font/ttf;base64,${ttfBytes.toString("base64")}`;
const fontUrlPattern =
  /url\(\s*(?:"\.\/fonts\/Manrope-VariableFont_wght\.ttf"|'\.\/fonts\/Manrope-VariableFont_wght\.ttf'|\.\/fonts\/Manrope-VariableFont_wght\.ttf)\s*\)/g;

for (const bundleFile of ["dist/index.mjs", "dist/index.js"]) {
  const source = await readFile(bundleFile, "utf8");
  assert(
    fontUrlPattern.test(source),
    `Expected Manrope font URL placeholder in ${bundleFile}`,
  );
  fontUrlPattern.lastIndex = 0;
  await writeFile(
    bundleFile,
    source.replace(fontUrlPattern, `url(${fontDataUri})`),
    "utf8",
  );
}
