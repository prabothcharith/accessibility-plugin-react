# Decorative Image Handling

This document specifies how `accessibility-plugin-react` identifies, scopes, and manages decorative images and CSS background images in accordance with WCAG 2.1 / 2.2 Success Criterion 1.1.1 (Non-text Content) and issue [A11Y-207](https://github.com/prabothcharith/accessibility-react/issues/47).

---

## 1. Core Principles

1. **Hide only eligible decorative imagery**:
   Only images that are unambiguously decorative are hidden when image hiding is activated.
2. **Never hide functional or interactive controls**:
   Images inside `<a>`, `<button>`, `<input>`, or elements with interactive ARIA roles (`button`, `link`, `menuitem`, `tab`) must remain visible so users do not lose critical interface affordances or touch targets.
3. **Never hide essential, informative, or security content**:
   - **CAPTCHA**: Verification puzzles and audio/visual challenge widgets are strictly protected.
   - **Charts & Graphs**: Analytical visual representations, figures, and diagrams (`role="graphics-document"`, `role="figure"`, `.chart`, `.graph`, `.diagram`) remain fully available.
   - **Maps**: Geolocation tiles, satellite maps, and interactive maps (`[role="region"][aria-label*="map"]`, `.map`, tile servers) remain visible.
   - **QR & Barcodes**: Payment, login, and verification codes (`.qr`, `.barcode`) remain visible.
   - **Math & Formulas**: Formulas (`role="math"`, `math`, `.math`) remain intact.
   - **Meaningful Alt & Labels**: Any image with non-empty `alt`, `aria-label`, `aria-labelledby`, or `title` is considered informative and preserved.
4. **Never fabricate alt text**:
   The plugin never mutates, synthesizes, or generates AI/heuristic `alt` text or accessible names. It strictly acts as a client-side display-preference modifier.
5. **Scoped CSS Background Images**:
   CSS background images are only stripped from non-functional, non-meaningful layout containers. Buttons, links, CAPTCHA, charts, and maps retain their background graphics.
6. **Idempotent and Reversible Lifecycle**:
   Every visual override is tracked inline with priority preservation and completely restored upon toggle-off, reset, or plugin unmount.

---

## 2. Classification Logic

### A. Functional or Meaningful Images (`isFunctionalOrMeaningfulImage`)

An image or element is deemed functional/meaningful and **MUST NEVER BE HIDDEN** if it satisfies any of the following:

- **Inside an interactive control**:
  ```ts
  el.closest(
    "a, button, [role='button'], [role='link'], [role='menuitem'], [role='tab'], input, select, textarea, summary",
  );
  ```
- **CAPTCHA verification**:
  ```ts
  el.closest(
    "[id*='captcha' i], [class*='captcha' i], [aria-label*='captcha' i], [data-captcha]",
  ) ||
    el.matches(
      "[src*='captcha' i], [alt*='captcha' i], [title*='captcha' i], [id*='captcha' i], [class*='captcha' i]",
    );
  ```
- **Charts, Graphs, Figures, and Diagrams**:
  ```ts
  el.closest(
    "[role='graphics-document'], [role='graphics-symbol'], [role='figure'], figure, [class*='chart' i], [id*='chart' i], [class*='graph' i], [id*='graph' i], [class*='diagram' i], [id*='diagram' i]",
  ) ||
    el.matches(
      "[role='graphics-document'], [role='graphics-symbol'], [aria-roledescription*='chart' i]",
    );
  ```
- **Maps**:
  ```ts
  el.closest(
    "[role='region'][aria-label*='map' i], [class*='map' i], [id*='map' i], [data-map]",
  ) ||
    el.matches(
      "[src*='maps' i], [src*='tiles' i], [src*='openstreetmap' i], [src*='mapbox' i]",
    );
  ```
- **QR Codes and Barcodes**:
  ```ts
  el.closest(
    "[class*='qr' i], [id*='qr' i], [class*='barcode' i], [id*='barcode' i]",
  ) ||
    el.matches(
      "[src*='qr' i], [alt*='qr' i], [src*='barcode' i], [alt*='barcode' i]",
    );
  ```
- **Math Content**:
  ```ts
  el.closest("[role='math'], math, [class*='math' i]");
  ```
- **Meaningful Authorship Attributes**:
  - `alt` is non-empty (`alt.trim().length > 0`)
  - `aria-label` is non-empty
  - `aria-labelledby` is non-empty
  - `title` is non-empty
  - `role` is an informative role (not `presentation`, `none`, or bare unlabeled `img`)

---

### B. Eligible Decorative Images (`isEligibleDecorativeImage`)

An image or `<picture>` element is eligible to be hidden only if `isFunctionalOrMeaningfulImage(el)` is `false` AND it exhibits explicit decorative markup:

1. **Empty alt attribute**: `el.hasAttribute("alt") && el.getAttribute("alt")?.trim() === ""`
2. **Presentational ARIA role**: `el.getAttribute("role") === "presentation"` or `"none"`
3. **Hidden from AT**: `el.getAttribute("aria-hidden") === "true"`
4. **Explicit decorative cue**: `data-decorative="true"`, `.decorative`, or `.deco`
5. **`<picture>` containers**: Any `<picture>` containing an eligible decorative child `<img>` is hidden as a unit.

Images that lack an `alt` attribute entirely without any decorative marker are **NOT** assumed decorative; omitting `alt` is an authoring defect, not proof of decorative intent. Hiding such images could remove informative visuals.

---

## 3. Component Usage

### Standard Export: `HideImagesController`

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  HideImagesController,
} from "accessibility-plugin-react";

export function Settings() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <HideImagesController label="Hide Images" />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### Semantic Alias: `HideDecorativeImagesController`

```tsx
import { HideDecorativeImagesController } from "accessibility-plugin-react";

// Drop-in alias with semantic naming
<HideDecorativeImagesController label="Hide Decorative Images" />;
```

---

## 4. Helper Utilities

Consumers can inspect elements using the exported predicates:

```ts
import {
  isEligibleDecorativeImage,
  isFunctionalOrMeaningfulImage,
} from "accessibility-plugin-react";

const img = document.querySelector("#banner-photo");
if (isEligibleDecorativeImage(img)) {
  console.log("Safe to hide as decorative imagery");
}
if (isFunctionalOrMeaningfulImage(img)) {
  console.log("Protected informative or functional image");
}
```

---

## 5. Verification Matrix

| Target                                     | Condition                     | Expected Behavior                   |
| :----------------------------------------- | :---------------------------- | :---------------------------------- |
| `img[alt=""]`                              | Independent decorative image  | `visibility: hidden`                |
| `img[role="presentation"]`                 | Presentational image          | `visibility: hidden`                |
| `img[aria-hidden="true"]`                  | Screen-reader hidden image    | `visibility: hidden`                |
| `img[data-decorative]`                     | Marked decorative             | `visibility: hidden`                |
| `a > img[alt=""]`                          | Linked control image          | **Visible** (retained)              |
| `button > img`                             | Button control image          | **Visible** (retained)              |
| `img.captcha`                              | Security verification         | **Visible** (retained)              |
| `img.chart` / `[role="graphics-document"]` | Analytical visualization      | **Visible** (retained)              |
| `img[src*="tile.openstreetmap.org"]`       | Map tile                      | **Visible** (retained)              |
| `img.qr`                                   | QR code                       | **Visible** (retained)              |
| `div[style*="background-image"]`           | Decorative container          | `background-image: none !important` |
| `button[style*="background-image"]`        | Functional control background | **Visible** (retained)              |
| Reset / Unmount                            | Preferences cleared           | All original styles restored        |
