# Link Highlighting, Focus Visibility, and Landmark Skip Links

This document outlines the architecture, WCAG 2.2 alignment, and behavioral guarantees for link highlighting, focus visibility, and the skip-to-main landmark link implemented under **[A11Y-205]**.

---

## 1. Non-Color-Only Link Highlighting

### The Problem

WCAG SC 1.4.1 (Use of Color) requires that color is not used as the sole visual means of conveying information or distinguishing interactive elements. Many websites style hyperlinks with custom colors that lack underlines or sufficient contrast against surrounding text.

### Implementation

- **Non-Color Cues**: Active link highlighting applies an unmistakable visual underline:
  ```css
  text-decoration: underline !important;
  text-decoration-thickness: 2px !important;
  text-underline-offset: 3px !important;
  ```
- **High-Contrast Palettes**: Users can select high-contrast badge/background styles (`yellow-on-black`, `blue-on-yellow`, `black-on-white`), or standard high-contrast underlining.
- **Forced-Colors Support**: Under Windows High Contrast Mode or `@media (forced-colors: active)`, links preserve the operating system's `LinkText` system keyword without conflicting hardcoded backgrounds.
- **Disabled Semantics Preservation**: Inactive, unlinked, or disabled anchors (`a:not([href])`, `a[aria-disabled="true"]`, `a.disabled`) are explicitly skipped, ensuring screen reader and keyboard users are not misled into attempting navigation on disabled links.
- **Widget Boundary Protection**: Elements matching `[data-arap-ui] *` are excluded from host mutations.

---

## 2. Enhanced Focus Visibility (`HighlightFocusController`)

### The Problem

WCAG SC 2.4.7 (Focus Visible) and SC 2.4.11 (Focus Appearance - AAA) require clear, high-contrast visual indicators for keyboard navigation. Native browser focus rings often disappear against complex backgrounds or are suppressed by host stylesheets (`outline: none`).

### Implementation

- **Dual-Ring High Contrast**: When enabled, an accessible high-contrast outline is applied to all active interactive controls (`button`, `a`, `input`, `select`, `textarea`, `[tabindex]`):
  ```css
  *:not([data-arap-ui]):not([data-arap-ui] *):focus-visible {
    outline: 3px solid #2563eb !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 5px rgba(255, 255, 255, 0.9) !important;
  }
  ```
  The primary 3px blue ring coupled with the outer 5px white halo ensures visibility on both light and dark backgrounds.
- **Forced-Colors Mode**: Under `@media (forced-colors: active)`, the ring yields to the system `Highlight` keyword with `box-shadow: none`, adhering to the active OS high-contrast theme.
- **Disabled Semantics**: Disabled elements (`*:disabled:focus-visible`, `*[aria-disabled="true"]:focus-visible`) have outlines suppressed (`outline: none !important`), preventing disabled controls from showing active focus rings.
- **Clean Teardown**: Upon reset or disabling, the injected style element is immediately removed, restoring host and UA defaults.

---

## 3. Authentic Skip-To-Main Landmark Link (`SkipToMainLink`)

### The Problem

WCAG SC 2.4.1 (Bypass Blocks) requires a mechanism to bypass repetitive navigation blocks directly to the main content. However, rendering a skip-to-main link when no `<main>` landmark exists results in broken navigation and false promises to assistive technology users.

### Implementation

- **Authentic Landmark Verification**: `findMainLandmark()` checks for a valid native `<main>` element or element with explicit `role="main"`.
- **Conditional Rendering**: `SkipToMainLink` renders **only when an authentic main landmark exists**. If no landmark is found, it renders `null`.
- **Dynamic Mutation Handling**: Uses `useSyncExternalStore` to monitor DOM mutations via `MutationObserver`. If a client-side route transition inserts or removes a `<main>` element, the skip link updates automatically without unnecessary re-renders.
- **Accessible Interaction**:
  - Hidden off-screen using `clip-path: inset(50%)` until focused via keyboard Tab.
  - On focus, slides into the top-left viewport meeting the minimum 44px touch/click target size.
  - On activation, assigns `tabindex="-1"` if needed, programmatically transfers focus to the landmark, and smoothly scrolls it into view.
