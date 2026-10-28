# Security, dependency, license and privacy audit (A11Y-504)

This document provides a comprehensive security review, dependency audit, Content Security Policy (CSP) compliance analysis, privacy threat model, and intellectual property/licensing verification for `accessibility-plugin-react`.

---

## 1. Executive summary and audit results

| Audit Area           | Standard / Requirement                                      | Current Verification Result                                                                                         | Status   |
| :------------------- | :---------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------ | :------- |
| **Dependencies**     | 0 runtime dependencies; peerDependencies only               | Clean `package.json`; 0 runtime dependencies. Only peer dependencies: React (`^18.3.1 \|\| ^19.0.0`) and React DOM. | **PASS** |
| **Vulnerabilities**  | `npm audit` 0 findings across direct and transitive tooling | `npm audit` returns 0 vulnerabilities across all installed packages.                                                | **PASS** |
| **Script Injection** | No dynamic code execution (`eval`, `new Function`)          | Automated AST scan verifies 0 instances of `eval` or `Function` constructors across all `src/` modules.             | **PASS** |
| **Network Requests** | No unauthorized telemetry, tracking, or background calls    | 0 `fetch()`, 0 `XMLHttpRequest`, 0 `navigator.sendBeacon`, 0 `WebSocket` calls.                                     | **PASS** |
| **Data Residency**   | All state stored locally; zero external exfiltration        | Preferences persist strictly in `localStorage` under `react-accessibility-plugin:state`. Zero cloud sync.           | **PASS** |
| **Licensing**        | Permissive ISC license; clean IP attribution                | Dedicated `LICENSE` and `NOTICE` files committed; zero GPL/copyleft or proprietary binary assets.                   | **PASS** |

---

## 2. Content Security Policy (CSP) compliance

The library is designed to function cleanly under strict corporate and enterprise Content Security Policies:

### Script Execution (`script-src`)

- **No Unsafe Eval**: The library never invokes `eval()` or constructs functions from strings. It is 100% compatible with CSPs that omit `'unsafe-eval'`.
- **Pre-Compiled Distributions**: Ships standard pre-bundled ESM and CommonJS artifacts; no runtime transpilation or script loaders are used.

### Style Sheets & Styling (`style-src`)

- **Scoped Plain CSS**: The library injects its stylesheet (`.arap-*`) scoped to its own container and uses CSS custom properties (`--arap-*`) on `.arap-root` and `.arap-panel`.
- **Standalone Stylesheet Option**: Applications with CSPs that disallow inline styles (`'unsafe-inline'`) can load the standalone pre-compiled stylesheet directly:
  ```css
  @import "accessibility-plugin-react/style.css";
  ```
  See [docs/CSP.md](CSP.md) for detailed nonce and hash configuration guidance.

### URL Protocol Sanitization (`isSafeUrl`)

- When displaying links in reading mode or page navigation, all URLs undergo strict protocol verification (`isSafeUrl()`):
  - Permitted protocols: `http:`, `https:`, relative paths (`/`, `./`, `../`), in-page hashes (`#`), and safe `data:image/` URLs.
  - Prohibited schemes: `javascript:`, `vbscript:`, and unknown protocols are immediately rejected to prevent cross-site scripting (XSS) vectors.

### DOM Updates & XSS Safeguards

- **TextContent Assignment**: The host translation adapter assigns translated content exclusively through `Text.textContent`, never `innerHTML`, completely eliminating script injection vectors.
- **Reading Mode HTML Sanitization**: Strips executable elements (`<script>`, `<iframe>`, `<object>`, `<embed>`) and inline event handlers (`onload`, `onclick`, `onerror`).

---

## 3. Privacy threat model and data residency

### Zero Telemetry & Tracking

- The library does not contain analytics beacons, tracking pixels, cookie setters, or telemetry endpoints.
- No network requests are made during normal widget lifecycle or feature toggling.

### Sensitive Element Detection (`isSensitiveElement`)

Features that inspect or transform DOM elements (such as host translation, read aloud, and smart contrast) automatically exclude sensitive and private nodes:

- **Credentials & Passwords**: `input[type="password"]`, `input[type="hidden"]`.
- **Financial Data**: `[autocomplete*="password"]`, `[autocomplete*="cc-"]`, `[autocomplete*="credit-card"]`.
- **Code & Technical Content**: `<code>`, `<pre>`, `<kbd>`, `<samp>`, `<script>`, `<style>`.
- **Explicit Opt-Out Tags**: `[translate="no"]`, `.notranslate`, `[data-no-translate]`, `[data-sensitive]`.
- **Cross-Origin Boundaries**: `<iframe>` elements are strictly skipped to prevent Same-Origin Policy (SOP) bypass.

### Client-Side Speech & Microphone Privacy

- **Web Speech API**: Text-to-speech synthesis and voice navigation utilize native browser platform engines (`window.speechSynthesis`, `window.SpeechRecognition`).
- **Zero Audio Retention**: No microphone recordings or voice audio streams are ever stored in `localStorage`, `sessionStorage`, or transmitted to remote servers.
- **Inactivity Watchdog**: Voice listening terminates automatically after 30 seconds of inactivity or when the tab becomes hidden (`document.hidden`).

---

## 4. License and intellectual property audit

- **License**: Released under the open-source **ISC License** (permissive, GPL-compatible).
- **Attribution**: Derived from the original vanilla JavaScript accessibility plugin; attribution is documented in `NOTICE` and `README.md`.
- **Assets**:
  - **Fonts**: No binary font files (`.woff`, `.woff2`, `.ttf`) are bundled. Presets rely entirely on standard system font stacks.
  - **Icons**: Authored in-tree as native inline SVG icons under ISC.
  - **Glossary Data**: Built-in dictionary entries (English, Sinhala, Tamil) are compiled in-tree under ISC for offline accessibility lookup.
