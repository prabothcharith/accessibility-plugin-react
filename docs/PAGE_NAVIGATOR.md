# Page Headings and Landmarks Navigator

This document details the Page Headings and Landmarks Navigator implemented in `accessibility-plugin-react` in accordance with WCAG 2.1 / 2.2 Success Criterion 2.4.1 (Bypass Blocks), 2.4.6 (Headings and Labels), and issue [A11Y-303](https://github.com/prabothcharith/accessibility-react/issues/51).

---

## 1. Core Principles & Acceptance Criteria

1. **True DOM Tree Order**:
   - Discovers actual `h1`–`h6` elements and ARIA headings (`[role="heading"][aria-level]`) in physical document order.
   - Maps top-level landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<form role="search">`, and ARIA landmark regions) and named anchors (`<a id="...">`, `<a name="...">`).
   - Ignores scoped `<header>` and `<footer>` elements inside `<article>`, `<aside>`, `<main>`, `<nav>`, or `<section>` which are not top-level page landmarks according to the HTML-AAM specification.
   - Strictly excludes internal heading/landmark structures rendered within the accessibility plugin itself (`[data-arap-ui]`).
2. **Safe Navigation with Temporary TabIndex Cleanup**:
   - Navigating to an element scrolls it smoothly into view (`scrollIntoView({ behavior: 'smooth', block: 'start' })`, or instant if reduced motion is requested).
   - If the target element is naturally focusable (links, buttons, inputs, elements with pre-existing `tabindex`), focus is set directly.
   - If the element is not naturally focusable (standard `h1`-`h6` or generic section containers), a temporary `tabindex="-1"` is assigned to receive keyboard focus. On `blur`, the temporary `tabindex` is removed immediately, restoring original host DOM semantics.
3. **Truthful Representation on Empty Pages**:
   - If the host document has no headings or no landmarks, the navigator displays an explicit status announcement: `"No headings found on this page."` or `"No landmarks found on this page."`.
   - The plugin never fabricates synthetic headings, phantom landmarks, or placeholder outlines.
4. **Dynamic SPA / Route Updates Without Observer Loops**:
   - The navigator watches external DOM mutations (`MutationObserver`) while open so client-side route changes update headings and landmarks in real time.
   - Mutations originating inside the plugin UI are strictly ignored, preventing recursive observer loops.
5. **Keyboard Operability & Rapid Dismissal**:
   - Accessible tabs (`role="tablist"`, `role="tab"`) switchable with `Left` / `Right` arrow keys.
   - Jump buttons support `Enter` and `Space`.
   - Pressing `Escape` closes the explorer dialog and returns keyboard focus to the "Explore" button.

---

## 2. Component Reference

### `PageNavigatorController`

```tsx
import { PageNavigatorController } from "accessibility-plugin-react";

<PageNavigatorController
  label="Page Navigator"
  description="Explore headings and landmarks"
  closeOnNavigate={false}
/>;
```

- **Props**:
  - `label?: string` (default: `"Page Navigator"`): Visible and accessible feature label.
  - `description?: string` (default: `"Explore headings and landmarks"`): Subtitle describing the feature.
  - `closeOnNavigate?: boolean` (default: `false`): If true, automatically closes the navigator explorer once an item is activated.
  - `className?: string`: Custom container classes.
- **Aliases**: `HeadingsNavigatorController`, `PageStructureController`.

---

## 3. Utility APIs

### `scanHeadings(root?: Document | Element): HeadingItem[]`

Discovers all visible `h1`-`h6` headings and `role="heading"` elements in DOM tree order, excluding plugin UI elements and hidden elements.

```ts
import { scanHeadings } from "accessibility-plugin-react";

const headings = scanHeadings();
// [ { id: "intro", level: 1, text: "Introduction", element: HTMLHeadingElement }, ... ]
```

### `scanLandmarks(root?: Document | Element): LandmarkItem[]`

Discovers visible landmarks (`banner`, `navigation`, `main`, `complementary`, `contentinfo`, `search`, `region`, `form`) and named anchors in DOM tree order.

```ts
import { scanLandmarks } from "accessibility-plugin-react";

const landmarks = scanLandmarks();
// [ { id: "site-nav", type: "navigation", label: "Primary Nav", element: HTMLElement }, ... ]
```

### `navigateToElement(element: HTMLElement, options?: { behavior?: ScrollBehavior, onComplete?: () => void }): void`

Safely scrolls to and focuses an element with automatic temporary `tabindex="-1"` cleanup upon blur.

```ts
import { navigateToElement } from "accessibility-plugin-react";

navigateToElement(document.querySelector("h2"));
```

### `subscribePageStructure(callback: () => void): () => void`

Listens to external DOM additions and removals outside `[data-arap-ui]`, invoking the callback with a 100ms debounce.
