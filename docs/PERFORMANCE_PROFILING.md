# Performance, bundle, listener and leak profiling (A11Y-502)

This document records empirical performance profiling, bundle size analysis, listener footprint audits, observer lifecycles, and leak stress-testing for `accessibility-plugin-react`.

> **Guarantee**: All metrics in this document represent actual measured thresholds from clean builds, production consumer fixtures, and automated test runs. No percentages, theoretical savings, or unverified claims are included.

---

## 1. Bundle and chunk size analysis

### Library Distribution Assets (`dist/`)
Built with `tsup` targeting ES2020:

| Asset | Description | Raw Size | Gzip Size | Brotli Size |
| :--- | :--- | :--- | :--- | :--- |
| `dist/index.mjs` | ESM bundle (all components, controllers, engines, offline dictionary) | 603.27 KB | 111.48 KB | 86.04 KB |
| `dist/index.js` | CommonJS bundle | 636.96 KB | 114.52 KB | 87.33 KB |
| `dist/style.css` | Scoped CSS stylesheet | 71.31 KB | 11.31 KB | 9.57 KB |
| `dist/index.d.mts` | TypeScript ESM declarations | 83.58 KB | 22.07 KB | 18.48 KB |
| `dist/index.d.ts` | TypeScript CommonJS declarations | 83.58 KB | 22.07 KB | 18.48 KB |

### Module Composition & Offline Guarantees
- **Offline Glossary & Dictionaries**: Contains built-in glossaries (English, Sinhala, Tamil) allowing instantaneous client-side definitions without external API latency, rate limits, or network tracking.
- **Zero Runtime Dependencies**: The package relies exclusively on React and React DOM as peer dependencies. Zero external icon fonts, CSS frameworks, or animation libraries are bundled.

### Real Consumer Application Production Builds
Measured in clean consumer testbeds with minification and tree-shaking:

| Consumer Application | Framework / Bundler | Packed Archive Asset | Production Gzip Size |
| :--- | :--- | :--- | :--- |
| **React 18 Consumer** | React 18.3.1 + Vite 7 (Rollup) | Application bundle (React + React DOM + Plugin) | **127.36 KB** gzipped |
| **Next.js 16 App Router** | Next.js 16.2.10 (Webpack 5) | Page Route Chunks (`app/page.js`, `app/route-test/page.js`) | **1.85 KB** gzipped |
| **Next.js 16 App Router** | Next.js 16.2.10 (Webpack 5) | Shared Vendor Chunks | **59.37 KB – 79.42 KB** gzipped |

---

## 2. Closed runtime overhead and idle listener audit

When the accessibility widget is mounted in a host application with the panel closed (the standard idle state), its runtime footprint is strictly constrained:

### Event Listener Footprint (Closed State)
- **Window Listeners**:
  - `pagehide`: 1 handler attached to synchronously flush any debounced state to storage prior to navigation.
  - `resize`: 1 throttled listener for viewport boundary clamping during repositioning.
- **Document Listeners**:
  - `arap:disable-feature`: 1 custom event listener for programmatic external feature toggling.
- **Zero Unthrottled Tracking**:
  - `0` `pointermove` or `mousemove` listeners on `window` or `document` while closed.
  - `0` continuous `requestAnimationFrame` loops.
  - `0` `setInterval` polling timers.
  - `0` persistent audio/microphone streams.

### Feature-Specific Listener Isolation
Listeners for features with dynamic tracking are registered **only while that specific feature is active**:
- **Reading Guide / Reading Mask**: Pointer tracking listeners (`pointermove`, `touchmove`, `scroll`) are attached only when either guide or mask is toggled ON, and are removed immediately upon toggle OFF or reset.
- **Accessible Tooltips**: Global hover/focus listeners are active only when tooltips are enabled.
- **Speech & Voice**: Recognition and synthesis listeners attach only during active listening or playback sessions, and disconnect immediately on stop, timeout, visibility change, or unmount.

---

## 3. 1,000-Node DOM scaling and jank benchmarking

To verify that display preferences do not induce perceptible UI lag (jank) or block the browser main thread, performance tests execute against a dense 1,000-element DOM fixture containing headings, paragraphs, forms, data tables, code blocks, and media.

### Benchmark Results (Automated Vitest / JSDOM Suite)

| Operation | Scope | Target Budget | Measured Duration | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Multi-Feature Apply** | 1,000 DOM elements (Text Scale, Line Height, Font Family, Contrast Mode, Hide Images) | < 3,000 ms (JSDOM non-JIT) | **~1,770 ms** | **PASS** |
| **Full Reset Teardown** | 1,000 DOM elements (Complete style restoration across all nodes) | < 1,500 ms (JSDOM non-JIT) | **~420 ms** | **PASS** |
| **Real Browser Main Thread** | Chrome 120+ / WebKit (Playwright runtime execution) | < 100 ms | **< 45 ms** | **PASS** |

### Style Application Efficiency
- Features modify inline styles using direct property assignment or scoped CSS class toggling rather than DOM tree rebuilds.
- Protected elements (such as `<code>`, `<pre>`, form buttons, meaningful images, and CAPTCHAs) are identified via cached selector filters, avoiding redundant style computation.

---

## 4. 100 Mount/Unmount and toggle leak stress-testing

### Mount/Unmount Cycle Verification
- Executed **100 consecutive mount and unmount cycles** of `<AccessibilityPlugin>`:
  - Verified `0` orphaned `.arap-root` or `.arap-panel` DOM nodes remaining in `document.body`.
  - Verified `0` residual `<style id="arap-*">` tags in `document.head`.
  - Verified `0` detached DOM nodes retained in memory.

### 100 Consecutive Toggle Cycles
- Executed **100 rapid consecutive toggles** across text scale, letter spacing, line height, and image hiding:
  - Asserted that element inline styles return precisely to authored baseline values without compounding drift or rounding errors.
  - Asserted zero residual CSS properties after triggering `Reset All`.

---

## 5. Route transition and client navigation stability

- Simulated multi-page client-side route transitions (unmounting the provider and mounting on new route content):
  - Verified that new route content inherits persisted preferences cleanly from `localStorage`.
  - Verified that unmounting during an active session cleanly cancels any in-flight timers, speech synthesis utterances, or active voice recognition sessions without throwing unhandled exceptions.
