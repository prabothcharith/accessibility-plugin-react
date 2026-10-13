import { mkdir, writeFile, copyFile, readFile, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
const run = (args, cwd) =>
  execFileSync("npm", args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
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
            ? "next dev --webpack -p 4313"
            : `vite --host 127.0.0.1 --port ${name === "react18" ? 4311 : 4312}`,
        },
        dependencies: {
          react,
          "react-dom": react,
          "react-accessibility-plugin": "file:../package.tgz",
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
  execFileSync(
    "npm",
    ["install", "../package.tgz", "--no-audit", "--no-fund"],
    { cwd: directory, stdio: "inherit" },
  );
  await writeFile(`${directory}/Fixture.jsx`, fixture);
  await copyFile("tests/browser/host.css", `${directory}/host.css`);
  await writeFile(
    `${directory}/consumer.mts`,
    `import { AccessibilityPlugin, useAccessibility, type FeatureOptions } from 'react-accessibility-plugin';\nconst options: FeatureOptions<boolean> = { apply: value => { console.log(value); } };\nexport { AccessibilityPlugin, useAccessibility, options };\n`,
  );
  await copyFile(`${directory}/consumer.mts`, `${directory}/consumer.cts`);
  await writeFile(
    `${directory}/consumer.tsx`,
    `import { AccessibilityPlugin, AccessibilityButton, AccessibilityList, FontSizeController } from 'react-accessibility-plugin';
export const widget = <AccessibilityPlugin persist={false} position="left"><AccessibilityButton/><AccessibilityList title="Preferences"><FontSizeController/></AccessibilityList></AccessibilityPlugin>;
// @ts-expect-error unsupported placement must be rejected by declarations
export const invalid = <AccessibilityPlugin position="middle">content</AccessibilityPlugin>;
`,
  );
  execFileSync(
    resolve("node_modules/.bin/tsc"),
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
      `import * as p from 'react-accessibility-plugin'; import React from 'react'; import {renderToString} from 'react-dom/server'; if (!p.FontSizeController || !p.useAccessibility) throw Error('ESM exports'); renderToString(React.createElement(p.AccessibilityPlugin, {}, React.createElement(p.AccessibilityButton))); console.log('ESM + SSR passed');`,
    ],
    { cwd: directory, stdio: "inherit" },
  );
  execFileSync(
    "node",
    [
      "-e",
      `const p = require('react-accessibility-plugin'); if (!p.AccessibilityPlugin) throw Error('CJS exports'); console.log('CJS passed');`,
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
      `import 'react-accessibility-plugin/style.css'; import '../host.css'; export const metadata={title:'Accessibility consumer'}; export default function Layout({children}) {return <html lang="en"><body>{children}</body></html>}`,
    );
    await writeFile(
      `${directory}/app/page.jsx`,
      `import Fixture from '../Fixture'; export default function Page(){return <Fixture/>}`,
    );
    await writeFile(
      `${directory}/pages/_app.jsx`,
      `import 'react-accessibility-plugin/style.css'; import '../host.css'; export default function App({Component,pageProps}) {return <Component {...pageProps}/>}`,
    );
    await writeFile(
      `${directory}/pages/legacy.jsx`,
      `import Fixture from '../Fixture'; export default function Page(){return <Fixture/>}`,
    );
    // Imports client exports directly from a Server Component: verifies the packed boundary.
    await mkdir(`${directory}/app/boundary`, { recursive: true });
    await writeFile(
      `${directory}/app/boundary/page.jsx`,
      `import { AccessibilityPlugin, AccessibilityButton, AccessibilityList, GrayscaleController } from 'react-accessibility-plugin'; export default function Page(){return <><main><h1>Server boundary</h1></main><AccessibilityPlugin><AccessibilityButton/><AccessibilityList><GrayscaleController/></AccessibilityList></AccessibilityPlugin></>}`,
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
      execFileSync(
        `${directory}/node_modules/.bin/tailwindcss`,
        ["-i", "tailwind.css", "-o", "tailwind-built.css"],
        { cwd: directory, stdio: "inherit" },
      );
    }
    await writeFile(
      `${directory}/main.jsx`,
      `import React from 'react'; import {createRoot} from 'react-dom/client'; ${name === "react19" ? "import './tailwind-built.css';" : ""} import 'react-accessibility-plugin/style.css'; import './host.css'; import Fixture from './Fixture'; createRoot(document.getElementById('root')).render(<React.StrictMode><Fixture/></React.StrictMode>);`,
    );
  }
  // Repacking the same unreleased version can retain archive timestamps.
  // A clean Next cache must verify this archive rather than an earlier bundle.
  if (next) await rm(`${directory}/.next`, { recursive: true, force: true });
  run(["run", "build"], directory);
}
