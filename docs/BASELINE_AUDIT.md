# Baseline Audit & Compatibility Safety Net (M0)

**Package:** `accessibility-plugin-react`  
**Current Version:** `2.0.2`  
**Target Program:** Master Engineering Plan (PRD & Architecture)  
**Parent Issue:** [#22: `[M0] Repository audit and compatibility safety net`](https://github.com/prabothcharith/accessibility-react/issues/22)  
**Execution Date:** 22 October 2026  
**Auditor:** Antigravity Engineering Lead

---

## 1. Executive Summary

This audit establishes the verified engineering baseline for `accessibility-plugin-react` at version `2.0.2` prior to implementing the 32 capabilities (W-01 through W-32) specified in the Master Engineering Plan.

The package is verified as an active, working, published package with ISC licensing, React 18/19 and Next.js App Router support, automatic stylesheet injection, 15 prebuilt feature controllers, movable trigger placement, and a suite of 66 unit tests and 55 browser/Axe tests. All compatibility contracts and public APIs are documented below and must be strictly preserved during future feature extensions.

---

## 2. Package & Registry Baseline Audit (A11Y-000)

### 2.1 Identity and Registry Synchronization

- **Package Name**: `accessibility-plugin-react`
- **Current Workspace Version**: `2.0.2`
- **npm Registry Status**: `accessibility-plugin-react@2.0.2` is published under `latest`.
- **Published Version History**: `['1.0.0', '2.0.0', '2.0.1', '2.0.2']`
- **Repository URL**: `git+https://github.com/prabothcharith/accessibility-react.git`
- **License**: `ISC` (Confirmed by owner on 2026-10-13 for all included code).

### 2.2 Exports and Module Format

```json
"exports": {
  ".": {
    "import": {
      "types": "./dist/index.d.mts",
      "default": "./dist/index.mjs"
    },
    "require": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  },
  "./dist/style.css": "./dist/style.css",
  "./style.css": "./dist/style.css"
}
```

- **Client Boundary**: Verified. Both `dist/index.mjs` and `dist/index.js` include `'use client';` banners, ensuring zero hydration or bundler failures when imported in Next.js Server Components.
- **Automatic CSS Injection**: The entry point imports `./styles/tailwind.css` (plain scoped CSS). In browser environments, stylesheet insertion is automated once; standalone CSS exports (`accessibility-plugin-react/style.css`) remain available for explicit CSS pipelines.
- **Peer Dependencies**: `"react": "^18.3.1 || ^19.0.0"`, `"react-dom": "^18.3.1 || ^19.0.0"`.

### 2.3 Artifact Build Metrics

Executed via `npm run build` (`tsup` + `node scripts/build-css.mjs`):

- `dist/index.mjs` (ESM): 71.05 KB (map: 114.13 KB)
- `dist/index.js` (CJS): 77.81 KB (map: 114.22 KB)
- `dist/index.d.mts` / `dist/index.d.ts` (Types): 4.35 KB
- `dist/style.css` (Scoped CSS): 7.64 KB
- Pack check tarball (`.consumers/package.tgz`): 32 files, 518,908 bytes.

---

## 3. Test & Consumer Fixture Validation (A11Y-001 & A11Y-002)

All verification suites were executed cleanly in the repository:

### 3.1 Unit & Static Analysis Suites

- `npm run typecheck`: **Passed** (0 errors across `tsconfig.json` and `tsconfig.tests.json`).
- `npm run lint`: **Passed** (0 warnings/errors with ESLint 10 and React Hooks rules).
- `npm test` (Vitest v4.1.11, 4 test files): **66 passed** (0 failures).
  - `tests/features.test.tsx` (32 tests): stepper bounds, palettes, text alignments, filter compositions, host restoration, and dynamic routes.
  - `tests/plugin.test.tsx` (17 tests): custom lifecycle, restoration, invalid data, focus management, Strict Mode double-mount, SSR hydration, singleton enforcement.
  - `tests/placement.test.tsx` (9 tests): corner snapping, free drag math, coordinate normalization, Alt+Arrow keyboard navigation.
  - `tests/storage.test.ts` (8 tests): deterministic timers, quota/security error handling, schema envelope parsing.

### 3.2 Packaged Tarball Consumer Verifications (`npm run test:consumers`)

Consumers build directly from the packed `.consumers/package.tgz` archive:

1. **React 18 Consumer** (`.consumers/react18`):
   - ESM + SSR import: **Passed**
   - CommonJS import: **Passed**
   - Vite 7.3.7 production bundle: **Passed** (`188.51 kB │ gzip: 58.08 kB`)
2. **React 19 Consumer with Tailwind 3** (`.consumers/react19`):
   - ESM + SSR import: **Passed**
   - CommonJS import: **Passed**
   - Vite 7.3.7 production bundle: **Passed** (`239.20 kB │ gzip: 72.61 kB`)
3. **Next.js 16.2.10 App & Pages Router** (`.consumers/next`):
   - ESM + SSR / Server Component imports: **Passed**
   - Next.js production build (`next build --webpack`): **Passed** (6/6 static pages pre-rendered successfully).

### 3.3 Full Browser & Accessibility Suite (`npm run test:browser`)

Playwright 1.64.0 executed against packed consumer applications:

- **Total Executed**: **55 passed**, 5 skipped (intentional Next-only tests on non-Next fixtures).
- **Browsers Tested**:
  - Chromium (React 18, React 19, Next.js)
  - Firefox (Linux/Windows engine parity verified)
  - WebKit (Desktop Safari engine)
  - Mobile Emulation (WebKit iPhone 13)
- **Accessibility Audits**:
  - Automated Axe-core audits executed inside test fixtures in light and dark host themes; **0 violations** detected for tested widget scopes (WCAG 2.0 A/AA, 2.1 AA, 2.2 AA).
  - Focus containment, visible `:focus-visible` styling, escape dismissal, and touch hit-target dimensions verified.

---

## 4. Current vs. Proposed Feature Matrix (W-01 to W-32)

| ID       | Capability Name                     |   Current Status in v2.0.2   | Existing Source Paths                                                                                                             | Target Milestone | Proposed Scope & Guardrails                                                                                                 |
| :------- | :---------------------------------- | :--------------------------: | :-------------------------------------------------------------------------------------------------------------------------------- | :--------------: | :-------------------------------------------------------------------------------------------------------------------------- |
| **W-01** | Launcher, panel, position, reset    |    **Existing - Working**    | `src/core/AccessibilityButton.tsx`<br/>`src/core/AccessibilityList.tsx`<br/>`src/core/widgetPlacement.ts`                         |        M1        | Retain Clean Light launcher, movable corner snapping; add non-modal reset confirmation.                                     |
| **W-02** | Searchable locale & language picker | **Existing - Base (v2.2.0)** | `src/core/i18n/`                                                                                                                  |     M1 / M3      | Internal widget translation dictionary, English baseline, fallback resolution, and pack registry implemented.               |
| **W-03** | 8 Accessibility profile presets     |         **Missing**          | N/A                                                                                                                               |        M3        | Implement Motor, Blind, Color Blind, Dyslexia, Low Vision, Cognitive, Seizure, ADHD preference presets with user overrides. |
| **W-04** | Bigger text with reflow scaling     |    **Existing - Working**    | `src/features/FontSizeController.tsx`                                                                                             |        M2        | Reflow-safe font enlargement (50–200%, step 10) scaling font-size and line-height together.                                 |
| **W-05** | Spacing: letter, word, paragraph    |    **Existing - Partial**    | `src/features/LetterSpacingController.tsx`                                                                                        |        M2        | `letterSpacing` exists (0–10px). Add separate word-spacing and paragraph-spacing controls.                                  |
| **W-06** | Line-height adjustments             |    **Existing - Working**    | `src/features/LineHeightController.tsx`                                                                                           |        M2        | Proportional line-height scaling (50–200%, step 10).                                                                        |
| **W-07** | Text alignment                      |    **Existing - Working**    | `src/features/TextAlignController.tsx`                                                                                            |        M2        | `default/left/center/right/justify`. Preserve RTL warning and host restoration.                                             |
| **W-08** | Contrast presets                    |    **Existing - Working**    | `src/features/ContrastController.tsx`<br/>`src/features/InvertColorsController.tsx`                                               |        M2        | High contrast, yellow-on-black, white-on-black, blue-on-yellow, invert(1). Protect OS `forced-colors: active`.              |
| **W-09** | Link highlighting                   |    **Existing - Working**    | `src/features/LinkHighlightController.tsx`                                                                                        |        M2        | Underline + high-contrast palettes (yellow/black, blue/yellow, black/white).                                                |
| **W-10** | Pause animation & reduce motion     |         **Missing**          | N/A                                                                                                                               |        M2        | Scoped reduced-motion stylesheet, Web Animations API pause, and HTML media pause.                                           |
| **W-11** | Hide decorative imagery             |    **Existing - Partial**    | `src/features/HideImagesController.tsx`                                                                                           |        M2        | Currently hides all `img`/`picture`. Refine to target decorative (`alt=""`) and preserve CAPTCHA/functional images.         |
| **W-12** | Legible & dyslexia-friendly fonts   |         **Missing**          | N/A                                                                                                                               |        M2        | Opt-in readable font family (system legible and open-license dyslexia font) with Unicode script fallback.                   |
| **W-13** | Pointer & reading guides            |    **Existing - Working**    | `src/features/BigCursorController.tsx`<br/>`src/features/ReadingMaskController.tsx`<br/>`src/features/ReadingGuideController.tsx` |        M3        | 40px SVG pointer, 100px reading mask, 4px reading guide following pointer/focus. Add touch device suppression.              |
| **W-14** | Accessible tooltips                 |         **Missing**          | N/A                                                                                                                               |        M3        | Non-intrusive tooltip displaying authored accessible descriptions (`alt`, `aria-label`). Dismissible with Escape.           |
| **W-15** | Page structure & landmarks          |         **Missing**          | N/A                                                                                                                               |        M3        | Semantic outline explorer for `h1`-`h6` and landmarks (`main`, `nav`, `aside`) with focus jump.                             |
| **W-16** | Saturation & grayscale              |    **Existing - Working**    | `src/features/SaturationController.tsx`<br/>`src/features/GrayscaleController.tsx`                                                |        M4        | 0.2×, 2× saturation and `grayscale(1)`. Composable with contrast filters.                                                   |
| **W-17** | Read-aloud TTS                      |         **Missing**          | N/A                                                                                                                               |        M4        | Web Speech API integration (`speechSynthesis`). User-initiated start/pause/stop; no transmission of private inputs.         |
| **W-18** | Voice navigation prototype          |         **Missing**          | N/A                                                                                                                               |        M4        | P3 experimental speech recognition navigation with explicit microphone consent and inactivity timeout.                      |
| **W-19** | Dictionary & comprehension          |         **Missing**          | N/A                                                                                                                               |        M4        | Local/offline terminology helper with opt-in remote provider adapter.                                                       |
| **W-20** | Smart contrast prototype            |         **Missing**          | N/A                                                                                                                               |        M4        | P3 experimental client-side element color analysis without auto-compliance claims.                                          |
| **W-21** | Oversized / large controls          |    **Existing - Working**    | `src/core/AccessibilityButton.tsx`<br/>`src/core/AccessibilityList.tsx`<br/>`src/styles/tailwind.css`                             |        M1        | Setting to enlarge panel buttons to >=48px touch targets for motor/vision accommodations.                                   |
| **W-22** | Accessibility statement link        |    **Existing - Working**    | `src/core/AccessibilityList.tsx`<br/>`src/styles/tailwind.css`                                                                    |        M1        | Configurable `statementUrl` prop rendered into the panel footer with accessible new-tab indicators.                         |
| **W-23** | Feature menu customization          |         **Missing**          | N/A                                                                                                                               |        M4        | Host-provided `enabledFeatures`, `featureOrder`, and grouping configuration.                                                |
| **W-24** | Privacy-safe feature events         |         **Missing**          | N/A                                                                                                                               |        M4        | Typed lifecycle event callbacks (`onPreferenceChange`, `onOpenChange`) without telemetry.                                   |
| **W-25** | Translation adapter architecture    |         **Missing**          | N/A                                                                                                                               |        M4        | Specification for host-content translation provider adapter without bundled proprietary APIs.                               |
| **W-26** | Focus indicator enhancement         |         **Missing**          | N/A                                                                                                                               |        M2        | Enhanced `:focus-visible` styling preserving native keyboard tab sequence.                                                  |
| **W-27** | Custom saved user presets           |         **Missing**          | N/A                                                                                                                               |        M3        | User-defined named preset snapshots.                                                                                        |
| **W-28** | Accessible reading mode             |         **Missing**          | N/A                                                                                                                               |        M3        | Non-destructive extraction of article content into a high-legibility view.                                                  |
| **W-29** | Keyboard shortcut cheat sheet       |         **Missing**          | N/A                                                                                                                               |        M3        | Searchable keyboard navigation cheat sheet with conflict prevention.                                                        |
| **W-30** | Developer diagnostics               |         **Missing**          | N/A                                                                                                                               |        M4        | Dev-only overlay reporting missing landmarks, contrast issues, and active scopes.                                           |
| **W-31** | Session / ephemeral storage         |         **Missing**          | N/A                                                                                                                               |        M1        | Support `storage: 'none'                                                                                                    | 'session' | 'local'` for public/shared computers. |
| **W-32** | Settings import / export            |         **Missing**          | N/A                                                                                                                               |        M3        | Privacy-safe JSON configuration import and export.                                                                          |

---

## 5. Compatibility Contract & Public API Protection

To prevent breaking existing consumer installations, the following contracts are locked:

### 5.1 Public Component & Hook Signatures

1. `<AccessibilityPlugin children position? persistenceKey? persist?>`:
   - Storage key defaults to `react-accessibility-plugin:state`.
   - Preserves provider-owned state, effect lifetimes, and reset cancellations.
2. `<AccessibilityButton draggable? icon? title? description? className? style?>`:
   - Preserves free drag and corner placement, Alt+Arrow keyboard shortcuts, and aria attributes.
3. `<AccessibilityList footer? children title? description? closeLabel? className? style?>`:
   - Rendered in portal outside host filters. Non-modal dialog semantics (`aria-expanded`, `aria-controls`).
4. `useAccessibility<T>(featureKey, defaultValue, options)`:
   - Two-argument generic hook returning `{ value, setValue, reset }`.
   - Definitions persist through controller unmount.

### 5.2 Prebuilt Controllers

All 15 existing controllers exported from `src/index.ts` must remain valid JSX children of `<AccessibilityList>` with no mandatory props:
`FontSizeController`, `LineHeightController`, `LetterSpacingController`, `ContrastController`, `SaturationController`, `InvertColorsController`, `GrayscaleController`, `LinkHighlightController`, `TextAlignController`, `HideImagesController`, `HideVideosController`, `BigCursorController`, `ReadingMaskController`, `ReadingGuideController`, `ResetController`.

### 5.3 Storage Schema Envelope

- Storage Key: `react-accessibility-plugin:state`
- Data Envelope:
  ```json
  {
    "features": {
      "fontSize": 100,
      "contrast": 0
    },
    "placement": {
      "corner": "bottom-right",
      "x": null,
      "y": null
    }
  }
  ```
- Migrations in M1 must read this structure and seamlessly handle upgrades without erasing user preferences.

---

## 6. Architecture & Migration Decisions (A11Y-003)

### Decision 1: Unified Preference Store Coexistence

- **Problem**: The Master Plan specifies an immutable settings object and reducer for profiles and export, whereas v2.0.2 uses `preferenceStore.ts` with individual dynamic keys.
- **Resolution**: Maintain `preferenceStore.ts` as the underlying store, with a unified preferences adapter that exposes the entire preference dictionary to profile presets and JSON import/export. Individual controller calls to `useAccessibility` will route directly through this validated store.

### Decision 2: Storage Mode Architecture (W-31)

- **Problem**: v2.0.2 supports `persist?: boolean` (boolean toggle between `localStorage` and memory).
- **Resolution**: Extend `AccessibilityPluginProps` to accept `storage?: 'none' | 'session' | 'local'`, defaulting to `'local'` (or whatever `persist: false` mapped to). If `persist={false}` is passed, map it to `storage: 'none'` for full backwards compatibility.

### Decision 3: Effect Management & Scoped Injections

- **Problem**: Some host styles overwrite element styles; indiscriminate global resets cause regressions.
- **Resolution**: Maintain `src/core/effects.ts` as the sole owner of DOM mutations and inline style cache. All visual alterations must continue to store previous inline styles and priorities in internal maps for exact restoration on reset/disable/unmount.

---

## 7. M0 Acceptance Sign-Off

- [x] **A11Y-000**: Verified npm metadata, exports, bundle metrics, dependencies, and license.
- [x] **A11Y-001**: Clean consumer builds verified across React 18, React 19, and Next.js App Router.
- [x] **A11Y-002**: Automated regression test suite passed (66 unit tests, 55 browser/Axe tests).
- [x] **A11Y-003**: Current vs Proposed feature matrix and compatibility contract documented.
- [x] **Release Gate**: Ready for owner review to close milestone [#22](https://github.com/prabothcharith/accessibility-react/issues/22) and proceed with M1 implementation on branch `feat/m1-core-architecture`.
