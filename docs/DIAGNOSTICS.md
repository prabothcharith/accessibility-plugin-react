# Integration Diagnostics and Test Harness (A11Y-405)

The `accessibility-plugin-react` library includes a built-in, development-only diagnostics engine and inspection harness designed to detect host environment conflicts, CSS containing block traps, Content Security Policy restrictions, and accessibility landmark health.

## Core Principles

1. **Development-Only by Default**:
   Diagnostics routines are inert in production builds (`process.env.NODE_ENV === "production"`). They return an empty report with 0 issues unless explicitly forced via `{ force: true }`.
2. **Zero Compliance Claims**:
   Automated integration diagnostics evaluate DOM structure, CSP, storage, and host CSS boundaries. They **do not certify WCAG 2.1/2.2 AA compliance** and cannot replace manual keyboard navigation, screen-reader testing (NVDA, VoiceOver), or physical device evaluation.
   Every report carries the standard disclaimer:
   > _"Automated diagnostics evaluate host environment compatibility, DOM landmarks, and CSS boundaries. They do not constitute official WCAG 2.1/2.2 AA certification and cannot substitute for manual keyboard and screen-reader auditing."_
3. **Strict Privacy Safety**:
   Diagnostics never collect, log, or transmit private data, form inputs, session tokens, user IDs, or URLs with query strings. Images lacking `alt` attributes are reported by count and sanitized CSS selectors without exposing sensitive URLs or credentials.

---

## Diagnostic Categories

| Category         | Checks Performed                                                                                                                                                                                                                 | Severity            |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------ |
| **`provider`**   | Multi-provider detection; verifies the document has only one `AccessibilityPlugin` owner. Detects containing-block traps (ancestors with `filter`, `transform`, `perspective`, or `backdrop-filter` breaking `position: fixed`). | `warning` / `error` |
| **`storage`**    | Tests `localStorage` and `sessionStorage` accessibility, quota boundaries, and sandbox restrictions. Diagnoses in-memory fallback mode.                                                                                          | `warning` / `info`  |
| **`csp`**        | Tests dynamic stylesheet `<style>` injection and CSS custom property manipulation against restrictive Content Security Policy (`style-src`).                                                                                     | `warning` / `error` |
| **`host-css`**   | Detects extreme `z-index >= 2,147,483,000` that could obscure widget controls; detects root scroll locks (`overflow: hidden` on both `html` and `body`).                                                                         | `warning`           |
| **`dom`**        | Checks for `<main>` landmark presence; verifies `<h1>` page heading; checks for skipped heading levels (e.g. `<h1>` to `<h3>`); scans content images lacking an `alt` attribute.                                                 | `warning` / `info`  |
| **`boundaries`** | Detects embedded `<iframe>` elements (noting cross-origin isolation); detects custom elements with `ShadowRoot`; validates portal mount point.                                                                                   | `info` / `warning`  |

---

## Usage

### 1. Enabling Diagnostics on `AccessibilityPlugin`

Pass the `diagnostics` prop to `AccessibilityPlugin` in your root or development layout:

```tsx
import { AccessibilityPlugin } from "accessibility-plugin-react";

// Enable console logging in development:
<AccessibilityPlugin diagnostics={true}>
  <App />
</AccessibilityPlugin>

// Or configure custom options:
<AccessibilityPlugin
  diagnostics={{
    logToConsole: true,
    categories: ["host-css", "csp", "dom"],
    onReport: (report) => {
      console.log(`Diagnostics completed with ${report.summary.total} findings.`);
    },
  }}
>
  <App />
</AccessibilityPlugin>
```

### 2. Developer Inspection UI: `<DiagnosticsHarness />`

The `DiagnosticsHarness` provides an accessible, floating drawer UI for developers to inspect detected issues, switch categories, view actionable fix recommendations, and re-run audits:

```tsx
import { DiagnosticsHarness } from "accessibility-plugin-react";

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {process.env.NODE_ENV !== "production" && <DiagnosticsHarness />}
    </>
  );
}
```

### 3. Programmatic API: `runDiagnostics` and `useDiagnostics`

```ts
import { runDiagnostics, useDiagnostics } from "accessibility-plugin-react";

// Run synchronously:
const report = runDiagnostics({
  force: true, // Bypass production check if testing
  categories: ["provider", "host-css", "storage"],
});

console.log(report.summary.total);
console.log(report.issues);

// Or via React hook:
function DevToolbar() {
  const report = useDiagnostics();
  return <div>Active integration issues: {report.summary.total}</div>;
}
```

---

## Actionable Diagnostics Reference

### `provider-fixed-position-trap` (Error)

- **Problem**: The accessibility widget was rendered inside a container with CSS `transform`, `filter`, or `perspective`. CSS specification states these properties create a new containing block for `position: fixed` descendants, pinning the widget relative to the container rather than the browser viewport.
- **Fix**: Render `AccessibilityPlugin` or its `WidgetPortal` directly as a child of `document.body` outside transformed wrappers.

### `csp-style-injection-restricted` (Warning / Error)

- **Problem**: Content Security Policy restricts dynamic inline `<style>` injection (`style-src`).
- **Fix**: Ensure your CSP header allows `'self'` and `'unsafe-inline'`, or serve plugin styles using external `<link rel="stylesheet" href="...">`.

### `host-css-extreme-z-index` (Warning)

- **Problem**: Host elements define `z-index >= 2,147,483,000`, obscuring the accessibility launcher button (z-index `2,147,483,001`).
- **Fix**: Constrain host application z-index layers below `2,147,483,000`.

### `dom-missing-main-landmark` (Warning)

- **Problem**: The document lacks a `<main>` or `[role="main"]` landmark.
- **Fix**: Wrap main page content in a semantic `<main>` tag.
