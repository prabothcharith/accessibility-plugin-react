# Accessible Tooltips from Authored Descriptions

This document specifies the accessible tooltips system implemented in `accessibility-plugin-react` in accordance with WCAG 2.1 / 2.2 Success Criterion 1.4.13 (Content on Hover or Focus) and issue [A11Y-302](https://github.com/prabothcharith/accessibility-react/issues/50).

---

## 1. Core Principles & Acceptance Criteria

1. **Authored Descriptions Only (Never Invented Text)**:
   - Tooltips display only author-provided accessible descriptions:
     - `aria-description` (W3C ARIA 1.3 specification).
     - `aria-describedby` (concatenates text from referenced ID elements).
     - `aria-label` (accessible name for icon buttons, inputs, links, or when differing from visible inner text).
     - `alt` (meaningful alternative text for images and graphic elements).
     - `title` (fallback authored descriptions).
   - The plugin never invents descriptions or performs unsolicited guessing.
2. **Never Disclose Private or Sensitive Fields**:
   - Password fields (`<input type="password">`) and sensitive autocomplete fields (`current-password`, `new-password`, `cc-number`, `cc-csc`, `one-time-code`, etc.) are strictly excluded.
   - Elements marked with `data-sensitive="true"` are never inspected or displayed in tooltips.
3. **No Redundant AT Announcements**:
   - Screen readers already announce `aria-label`, `alt`, and `aria-describedby` when an element receives focus or virtual cursor navigation.
   - The tooltip overlay element is marked with `role="presentation"` and `aria-hidden="true"`, ensuring zero double-reading or redundant screen reader announcements.
4. **No Semantics Overwriting**:
   - Host DOM attributes (`alt`, `aria-label`, `aria-describedby`, `title`) are never deleted, renamed, or modified.
5. **No Focus Loss**:
   - The tooltip overlay is non-focusable (`tabindex` is not present) and never steals focus from the active host element.
6. **WCAG 2.1 Success Criterion 1.4.13 (Content on Hover or Focus)**:
   - **Dismissible**: Pressing the `Escape` key immediately dismisses the active tooltip without moving pointer hover or losing keyboard focus. The tooltip stays dismissed until focus or pointer leaves and returns.
   - **Hoverable**: Sighted users can move their pointer directly over the tooltip overlay itself without it collapsing (allowing reading or copying long descriptions).
   - **Persistent**: The tooltip remains visible until the hover or focus is removed, the user presses Escape, or the element unmounts.
7. **No Flicker & Viewport Clamping**:
   - Tooltip positioning calculates viewport boundaries (`window.innerWidth`, `window.innerHeight`) and clamps within safe margins.
   - If there is insufficient room above the target element, the tooltip automatically flips below the target (`data-placement="bottom"`).
   - Repositions smoothly on scroll and resize, hiding if the target scrolls out of the visible viewport.
8. **Clean Lifecycle Teardown**:
   - Toggling the feature off, resetting preferences, or unmounting the provider completely removes the tooltip element from the DOM and disconnects all event listeners.

---

## 2. Feature Schema & Built-in Keys

| Feature Key          | Type      | Default | Description                                                        |
| -------------------- | --------- | ------- | ------------------------------------------------------------------ |
| `tooltips`           | `boolean` | `false` | Enables accessible tooltips from authored descriptions across page |
| `accessibleTooltips` | `boolean` | `false` | Alias for `tooltips`                                               |

---

## 3. Component Reference

### `TooltipsController`

```tsx
import { TooltipsController } from "accessibility-plugin-react";

<TooltipsController
  label="Accessible Tooltips"
  description="Show authored alt text and descriptions on hover or focus"
/>;
```

- **Props**:
  - `label?: string` (default: `"Accessible Tooltips"`): The accessible and visible toggle label.
  - `description?: string` (default: `"Show authored alt text and descriptions on hover or focus"`): Subtitle explaining the feature.
  - `className?: string`: Custom CSS classes for the feature container.
- **Alias**: `AccessibleTooltipsController`.

---

## 4. Helper Functions

### `getAuthoredDescription(element: Element): string | null`

Extracts the authored accessible description from any DOM element while enforcing privacy rules and deduplication against visible text.

```ts
import { getAuthoredDescription } from "accessibility-plugin-react";

const desc = getAuthoredDescription(document.querySelector("#my-button"));
// Returns "Close modal window" or null
```

### `enableAccessibleTooltips(): () => void`

Programmatically activates the global tooltip event listeners and returns an idempotent teardown cleanup function.

```ts
import { enableAccessibleTooltips } from "accessibility-plugin-react";

const cleanup = enableAccessibleTooltips();
// Later...
cleanup();
```

---

## 5. Viewport and Positioning Architecture

- **Default Placement**: Above the target element with an 8px vertical gap, centered horizontally.
- **Top Overflow Collision**: If `rect.top - height - 8 < 8px`, placement flips to `bottom`.
- **Viewport Boundary Clamping**: Horizontally clamped within `[8px, window.innerWidth - tooltipWidth - 8px]`.
- **High Contrast / Forced Colors**: Supports Windows High Contrast and CSS forced colors using system colors (`Canvas`, `CanvasText`, and `Highlight` border).
