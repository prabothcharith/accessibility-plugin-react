import { mkdir, writeFile, copyFile, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const npmCli = process.env.npm_execpath;
const runNodeCli = (entrypoint, args, options) =>
  execFileSync(process.execPath, [entrypoint, ...args], options);
const runNpm = (args, options) =>
  npmCli
    ? runNodeCli(npmCli, args, options)
    : execFileSync("npm", args, {
        ...options,
        shell: process.platform === "win32",
      });
const run = (args, cwd) =>
  runNpm(args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
const registryVersion = process.env.ARAP_CONSUMER_VERSION;
if (registryVersion && !/^\d+\.\d+\.\d+$/.test(registryVersion))
  throw new Error("ARAP_CONSUMER_VERSION must be an exact stable version");
const installSpec = registryVersion
  ? `accessibility-plugin-react@${registryVersion}`
  : "../package.tgz";
const fixture = await readFile("tests/browser/Fixture.jsx", "utf8");
for (const [name, react, next] of [
  ["react18", "18.3.1", false],
  ["react19", "19.2.0", false],
  ["next", "19.2.0", true],
]) {
  const directory = resolve(".consumers", name);
  await mkdir(directory, { recursive: true });
  await writeFile(
    `${directory}/package.json`,
    JSON.stringify(
      {
        name: `arap-test-${name}`,
        private: true,
        type: "module",
        scripts: {
          build: next ? "next build --webpack" : "vite build",
          dev: next
            ? "next dev --webpack -p 7313"
            : `vite --host 127.0.0.1 --port ${name === "react18" ? 7311 : 7312}`,
        },
        dependencies: {
          react,
          "react-dom": react,
          "accessibility-plugin-react":
            registryVersion ?? "file:../package.tgz",
          ...(next ? { next: "16.2.10" } : { vite: "7.3.7" }),
        },
        devDependencies: {
          typescript: "5.9.3",
          "@types/react": next || name === "react19" ? "^19" : "^18",
          "@types/react-dom": next || name === "react19" ? "^19" : "^18",
          ...(name === "react19" ? { tailwindcss: "3.4.19" } : {}),
        },
      },
      null,
      2,
    ),
  );
  // Installing the archive explicitly refreshes the package on reruns.
  runNpm(["install", installSpec, "--no-audit", "--no-fund"], {
    cwd: directory,
    stdio: "inherit",
  });
  await writeFile(`${directory}/Fixture.jsx`, fixture);
  await copyFile("tests/browser/host.css", `${directory}/host.css`);
  await writeFile(
    `${directory}/consumer.mts`,
    `import { AccessibilityPlugin, useAccessibility, type FeatureOptions } from 'accessibility-plugin-react';\nconst options: FeatureOptions<boolean> = { apply: value => { console.log(value); } };\nexport { AccessibilityPlugin, useAccessibility, options };\n`,
  );
  await copyFile(`${directory}/consumer.mts`, `${directory}/consumer.cts`);
  await writeFile(
    `${directory}/consumer.tsx`,
    `import { AccessibilityPlugin, AccessibilityButton, AccessibilityList, FontSizeController } from 'accessibility-plugin-react';
export const widget = <AccessibilityPlugin persist={false} position="left"><AccessibilityButton/><AccessibilityList title="Preferences"><FontSizeController/></AccessibilityList></AccessibilityPlugin>;
// @ts-expect-error unsupported placement must be rejected by declarations
export const invalid = <AccessibilityPlugin position="middle">content</AccessibilityPlugin>;
`,
  );
  runNodeCli(
    resolve("node_modules/typescript/bin/tsc"),
    [
      "--noEmit",
      "--skipLibCheck",
      "--strict",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--jsx",
      "react-jsx",
      "consumer.mts",
      "consumer.cts",
      "consumer.tsx",
    ],
    { cwd: directory, stdio: "inherit" },
  );
  execFileSync(
    "node",
    [
      "--input-type=module",
      "-e",
      `import * as p from 'accessibility-plugin-react'; import React from 'react'; import {renderToString} from 'react-dom/server'; if (!p.FontSizeController || !p.useAccessibility) throw Error('ESM exports'); renderToString(React.createElement(p.AccessibilityPlugin, {}, React.createElement(p.AccessibilityButton))); console.log('ESM + SSR passed');`,
    ],
    { cwd: directory, stdio: "inherit" },
  );
  execFileSync(
    "node",
    [
      "-e",
      `const p = require('accessibility-plugin-react'); if (!p.AccessibilityPlugin) throw Error('CJS exports'); console.log('CJS passed');`,
    ],
    { cwd: directory, stdio: "inherit" },
  );
  if (next) {
    await writeFile(
      `${directory}/next.config.mjs`,
      "export default {outputFileTracingRoot:import.meta.dirname};",
    );
    await mkdir(`${directory}/app`, { recursive: true });
    await mkdir(`${directory}/pages`, { recursive: true });
    await writeFile(
      `${directory}/app/layout.jsx`,
      `import 'accessibility-plugin-react/style.css'; import '../host.css'; export const metadata={title:'Accessibility consumer'}; export default function Layout({children}) {return <html lang="en"><body>{children}</body></html>}`,
    );
    await writeFile(
      `${directory}/app/page.jsx`,
      `import Fixture from '../Fixture'; export default function Page(){return <Fixture/>}`,
    );
    await writeFile(
      `${directory}/pages/_app.jsx`,
      `import 'accessibility-plugin-react/style.css'; import '../host.css'; export default function App({Component,pageProps}) {return <Component {...pageProps}/>}`,
    );
    await writeFile(
      `${directory}/pages/legacy.jsx`,
      `import Fixture from '../Fixture'; export default function Page(){return <Fixture/>}`,
    );
    // Imports client exports directly from a Server Component: verifies the packed boundary.
    await mkdir(`${directory}/app/boundary`, { recursive: true });
    await writeFile(
      `${directory}/app/boundary/page.jsx`,
      `import { AccessibilityPlugin, AccessibilityButton, AccessibilityList, GrayscaleController } from 'accessibility-plugin-react'; export default function Page(){return <><main><h1>Server boundary</h1></main><AccessibilityPlugin><AccessibilityButton/><AccessibilityList><GrayscaleController/></AccessibilityList></AccessibilityPlugin></>}`,
    );
  } else {
    await writeFile(
      `${directory}/index.html`,
      '<!doctype html><html lang="en"><head><title>Accessibility consumer</title><meta name="viewport" content="width=device-width, initial-scale=1"/></head><body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>',
    );
    if (name === "react19") {
      await writeFile(
        `${directory}/tailwind.config.cjs`,
        "module.exports={content:['./Fixture.jsx'],theme:{extend:{}},plugins:[]}",
      );
      await writeFile(
        `${directory}/tailwind.css`,
        "@tailwind base; @tailwind components; @tailwind utilities;",
      );
      runNodeCli(
        resolve(directory, "node_modules/tailwindcss/lib/cli.js"),
        ["-i", "tailwind.css", "-o", "tailwind-built.css"],
        { cwd: directory, stdio: "inherit" },
      );
    }
    await writeFile(
      `${directory}/main.jsx`,
      `import React from 'react'; import {createRoot} from 'react-dom/client'; ${name === "react19" ? "import './tailwind-built.css';" : ""} import 'accessibility-plugin-react/style.css'; import './host.css'; import Fixture from './Fixture'; createRoot(document.getElementById('root')).render(<React.StrictMode><Fixture/></React.StrictMode>);`,
    );
  }
  // Repacking the same unreleased version can retain archive timestamps.
  // A clean Next cache must verify this archive rather than an earlier bundle.
  if (next) await rm(`${directory}/.next`, { recursive: true, force: true });
  run(["run", "build"], directory);
}
