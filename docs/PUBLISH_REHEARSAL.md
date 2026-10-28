# Packed publish rehearsal and clean consumer smoke test (A11Y-505)

This document records the exact archive inspection, tarball packaging rehearsal, and clean consumer installation and smoke test results for `accessibility-plugin-react`.

> **Publish Gate Verification**: This rehearsal verifies the exact `.tgz` tarball in clean consumer environments without uploading to npm or creating Git release tags.

---

## 1. Packed archive inspection (`npm run pack:check`)

The package archive was built, packed, and inspected via `scripts/check-package.mjs`:

| Inspection Item       | Requirement                                  | Measured Result                                        | Status   |
| :-------------------- | :------------------------------------------- | :----------------------------------------------------- | :------- |
| **Tarball Location**  | Local disposable archive                     | `.consumers/package.tgz`                               | **PASS** |
| **Total Files**       | Required bundle, types, CSS, legal, and docs | **61 files**                                           | **PASS** |
| **Archive Size**      | Uncompressed package content                 | **1,186,512 bytes** (~1.18 MB)                         | **PASS** |
| **Client Directives** | Leading `"use client";` on entrypoints       | Present in `dist/index.mjs` and `dist/index.js`        | **PASS** |
| **CSS Injection**     | Self-contained automatic injection           | `styleInject` with `.arap-root` present in bundles     | **PASS** |
| **CSS Isolation**     | Zero global element resets                   | No un-scoped resets on `html`, `body`, `:root`, or `*` | **PASS** |
| **Legal Files**       | Permissive license and attribution           | `LICENSE` and `NOTICE` verified in tarball             | **PASS** |

### Packed Files Breakdown

- `dist/index.mjs` (ESM build)
- `dist/index.js` (CommonJS build)
- `dist/index.d.mts` (ESM TypeScript declarations)
- `dist/index.d.ts` (CommonJS TypeScript declarations)
- `dist/style.css` (Standalone scoped stylesheet)
- `LICENSE` (ISC License)
- `NOTICE` (Attributions and asset origins)
- `docs/*` (Comprehensive documentation files)

---

## 2. Clean consumer smoke tests (`npm run test:consumers`)

The exact archive (`.consumers/package.tgz`) was installed in isolated consumer testbeds across supported framework versions:

### React 18 Consumer (`.consumers/react18`)

- **Environment**: React 18.3.1, React DOM 18.3.1, Vite 7.3.7.
- **Verification**:
  - NodeNext ESM import and SSR hydration: **PASS**
  - CommonJS `require()` resolution: **PASS**
  - Production Vite rollup build: **PASS** (`dist/assets/index-RXyyFYxY.js` 487.73 KB raw / 130.42 KB gzip).

### React 19 Consumer (`.consumers/react19`)

- **Environment**: React 19.2.0, React DOM 19.2.0, Tailwind CSS 3.4.19, Vite 7.3.7.
- **Verification**:
  - NodeNext ESM import and SSR hydration: **PASS**
  - CommonJS `require()` resolution: **PASS**
  - Production Vite rollup build: **PASS** (`dist/assets/index-CqZjbLpD.js` 538.30 KB raw / 144.98 KB gzip).
  - Tailwind CSS co-existence: Scoped `.arap-*` classes operate without interference from host Tailwind utilities.

### Next.js 16 Consumer (`.consumers/next`)

- **Environment**: Next.js 16.2.10 (Webpack), React 19.2.0.
- **Verification**:
  - Server Component layouts: **PASS**
  - `"use client";` boundary isolation: **PASS**
  - App Router routes (`/`, `/boundary`, `/route-test`): **PASS**
  - Pages Router route (`/legacy`): **PASS**
  - Production Next.js build (`next build --webpack`): **PASS** with 7 static routes prerendered.

---

## 3. Disposable lock hygiene

- All consumer installations reside inside the disposable `.consumers/` directory, which is excluded by `.gitignore`.
- Zero disposable lockfiles, temporary tarballs, or generated testbed files are tracked in version control.
