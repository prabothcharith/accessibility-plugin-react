# Scoped Effects, Strict CSP, and Host Compatibility (Issue #13)

This document specifies the design, contracts, and platform boundaries for scoped effect targeting (`effectScope`), strict Content Security Policy nonce support (`nonce`), open Shadow DOM traversal, and host container isolation in `accessibility-plugin-react`.

---

## 1. Overview & Motivation

By default, `accessibility-plugin-react` operates host-wide, traversing eligible descendants of `document.body` and applying display enhancements (font enlargement, proportional line height, letter and word spacing, semantic contrast, and color filters).

In complex or enterprise host applications, host-wide styling presents two primary challenges:

1. **Host Chrome & Navigation Bleed**: Embedded sub-portals, micro-frontends, multi-tenant dashboards, and CMS content viewers often need accessibility preferences restricted to their main content region (e.g., `<main id="page-content">`), leaving application top bars, breadcrumbs, user avatars, or side navigation untouched.
2. **Fixed-Descendant Filter Stacking Contexts**: According to the CSS Transforms and Filter Effects Level 1 specifications, applying a CSS filter (`filter: grayscale(...)` or `filter: invert(...)`) to any element causes that element to become a containing block and stacking context for all `position: fixed` descendants. In host layouts with fixed headers or sticky navbars, root filtering can cause fixed elements to jump or lose viewport pinning.

---

## 2. Scoped Effects Configuration (`effectScope`)

### Configuration Prop

`AccessibilityPlugin` supports the optional `effectScope` prop:

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
} from "accessibility-plugin-react";

export function App() {
  const contentRef = useRef<HTMLElement>(null);

  return (
    <AccessibilityPlugin effectScope="#main-content">
      {/* Host navigation remains completely untouched by accessibility preferences */}
      <header className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </header>

      {/* Preferences apply strictly to this container and its descendants */}
      <main id="main-content" ref={contentRef}>
        <Article />
      </main>

      <AccessibilityButton />
      <AccessibilityList>
        <TextScaleController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### Supported Target Types

`effectScope` accepts any of the following types (`EffectScopeTarget`):

| Type                               | Example                              | Resolution Behavior                                                                                              |
| :--------------------------------- | :----------------------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **CSS Selector String**            | `"#main-content"`, `".article-body"` | Resolves via `document.querySelector<HTMLElement>(selector)`. Falls back safely to `document.body` if not found. |
| **HTMLElement**                    | `document.getElementById("main")`    | Uses the passed element directly.                                                                                |
| **React RefObject**                | `useRef<HTMLElement>(null)`          | Resolves `ref.current`. Falls back to `document.body` if unmounted or null.                                      |
| **Omitted / `undefined` / `null`** | `undefined`                          | Defaults to `document.body` (100% backward compatible).                                                          |

### Scoped Container Filter Isolation

When `effectScope` targets a container (e.g. `<main id="main-content">`):

- CSS filters (grayscale, invert, saturation) are applied **directly to the scoped container**, rather than filtering every child of `document.body`.
- External fixed elements outside the scoped container (such as `<header className="fixed top-0">` or sticky sidebars) receive **zero CSS filters**, completely eliminating filter-induced containing-block positioning bugs.
- The widget portal itself (`.arap-root`) remains excluded from filtering and is portaled outside the container.

---

## 3. Open Shadow DOM Traversal

Modern web applications may incorporate Web Components or custom elements using Shadow DOM.

- **Open Shadow DOM (`mode: "open"`)**:
  - Traversal scans elements inside `scopeRoot`. When an element has `.shadowRoot` with `mode === "open"`, the query engine traverses into `shadowRoot.querySelectorAll("*")` and applies typography and display preferences to eligible shadow descendants.
  - Incremental mutation batching also traverses open shadow roots when new nodes are added.
- **Closed Shadow DOM (`mode: "closed"`)**:
  - Closed shadow roots are completely inaccessible to external scripts by W3C platform security design (`element.shadowRoot` evaluates to `null`). Closed shadow DOM contents remain isolated.

---

## 4. iframe Platform Boundaries

- **Cross-Origin iframes**:
  - Inaccessible due to browser Same-Origin Policy (SOP). Attempts to access `iframe.contentDocument` or modify internal styles throw security errors.
  - The plugin strictly respects SOP boundaries and never attempts cross-origin DOM traversal.
- **Same-Origin iframes**:
  - Same-origin iframes possess their own distinct browsing contexts and style cascades. Styling an iframe's internal DOM requires mounting an `AccessibilityPlugin` within that iframe's window context.

---

## 5. Strict Content Security Policy (CSP) & Nonces

### Nonce Support (`nonce`)

In environments enforcing strict CSP with `style-src 'self' 'nonce-...'` (disallowing `'unsafe-inline'`):

```tsx
<AccessibilityPlugin nonce={nonceValue}>
  <App />
</AccessibilityPlugin>
```

When provided:

1. All dynamically injected `<style>` elements (such as `arap-focus-highlight-style` and `arap-reduce-motion-style`) have their `nonce` attribute and property assigned (`styleEl.nonce = nonce; styleEl.setAttribute("nonce", nonce)`).
2. The browser permits stylesheet execution under strict nonce-based policies.
3. If `nonce` is omitted and CSP forbids inline `<style>`, consumers can import the precompiled stylesheet statically (`import "accessibility-plugin-react/style.css"`).

### Custom SVG Cursor & Fallback

The `bigCursor` feature uses an inline SVG data URI (`data:image/svg+xml,...`).

- Requires `img-src 'self' data:`.
- If `data:` is omitted from `img-src`, modern browsers block the custom cursor and automatically fall back to the native system pointer with zero JavaScript exceptions.

---

## 6. Backward Compatibility & Migration

- **Zero Breaking Changes**: When `effectScope` and `nonce` are omitted, behavior is 100% identical to prior releases.
- **Full Restoration**: `resetAll()`, `session.undo()`, or component unmount cleanly restores all previous inline styles, filters, and priorities on both the scoped container and all modified descendants.
