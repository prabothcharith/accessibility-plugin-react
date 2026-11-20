# Image Hiding & Decorative Image Handling

This document specifies how `accessibility-plugin-react` hides HTML and CSS-based images while preserving interactive controls, essential visualizations, and opt-out boundaries in accordance with WCAG 2.1 / 2.2 Success Criterion 1.1.1 (Non-text Content) and issue [A11Y-207](https://github.com/prabothcharith/accessibility-react/issues/47).

---

## 1. Modes & Core Principles

The image-hiding system supports two explicit controller modes sharing the `hideImages` preference:

1. **General Image Hiding (`HideImagesController`, default `mode="all"`)**:
   - Hides all eligible host `<img>` (including non-empty `alt` and missing `alt`), `<picture>`, `<object type="image/*">`, `<embed type="image/*">`, and explicitly decorative `<svg>` elements.
   - Hides all CSS-based images across host elements (including `html`/`body` in host-wide scope), covering `background-image`, `background` shorthand, CSS custom properties (`var(...)`), `image-set()`, `list-style-image`, element `content: url(...)`, and `::before` / `::after` pseudo-element images (`background-image` and `content: url(...)`).
   - Preserves pure CSS gradients (`linear-gradient`, `radial-gradient`, etc.), widget UI, `[data-arap-ignore]` / `[data-arap-exempt]` regions, `<button>` / interactive controls, icon-only/image-only links (`<a>` / `[role="link"]` with no text content), CAPTCHAs, charts/graphs/diagrams, maps, QR/barcodes, and math formulas.
2. **Strict Decorative-Only Mode (`HideDecorativeImagesController` or `<HideImagesController mode="decorative" />`)**:
   - Hides only explicitly decorative HTML images (`alt=""`, `role="presentation"`, `role="none"`, `aria-hidden="true"`, `data-decorative`, `.decorative`, `.deco`) and decorative CSS-based images.
   - Strictly preserves informative images with non-empty `alt`, `aria-label`, `aria-labelledby`, or `title`, missing-`alt` `<img>` elements, meaningful `<picture>` elements, linked images, and informative CSS `role="img"` containers.
3. **Never fabricate alt text**:
   The plugin never mutates, synthesizes, or generates AI/heuristic `alt` text or accessible names. It strictly acts as a client-side display-preference modifier.
4. **Word-boundary token matching (zero false positives)**:
   Protection selectors split camelCase and match protected tokens (`captcha`, `chart`/`graph`/`diagram`, `map`, `qr`/`barcode`, `math`) on token boundaries so ordinary class names such as `.paragraph`, `.typography`, `.photography`, `.roadmap`, `.sitemap`, `.charter`, or `.aftermath` are never mistakenly excluded.
5. **Idempotent, dynamic, and reversible lifecycle**:
   Inline style overrides, dynamic `<style id="arap-hide-images-style">` pseudo-element rules (with optional CSP `nonce`), and `data-arap-hide-*` attributes are tracked and cleanly restored upon toggle-off, reset, or plugin unmount. Dynamic DOM additions as well as class, style, and media-attribute mutations are applied incrementally.

---

## 2. Classification Logic

### A. Functional or Meaningful Images (`isFunctionalOrMeaningfulImage`)

An image or element is deemed functional/meaningful for strict decorative filtering (`mode="decorative"`) if it satisfies any of the following:

- **Widget or explicit opt-out**: inside `[data-arap-ui]`, `[data-arap-diagnostics]`, `.arap-root`, `[data-arap-ignore]`, or `[data-arap-exempt]`.
- **Inside an interactive control or link**: `a`, `button`, `[role='button']`, `[role='link']`, `[role='menuitem']`, `[role='tab']`, `input`, `select`, `textarea`, `summary`.
- **CAPTCHA verification**: `data-captcha`, CAPTCHA tokens in `id`/`class`/`aria-label`, or `captcha` in `src`/`alt`/`title`.
- **Charts, Graphs, and Diagrams**: `role="graphics-document"`, `role="graphics-symbol"`, `aria-roledescription`, or token-bounded `chart`/`graph`/`diagram` classes or IDs.
- **Maps**: `data-map`, `[role="region"]` with map `aria-label`, token-bounded `map` classes/IDs, or recognized map/tile URLs.
- **QR Codes and Barcodes**: token-bounded `qr`/`qrcode`/`barcode` classes/IDs/alt/src.
- **Math Content**: `role="math"`, `<math>`, or token-bounded `math`/`mathjax`/`katex`/`formula`/`equation` classes or IDs.
- **Meaningful Authorship Attributes** (overridden when an explicit decorative marker is present on the element or parent `<picture>`):
  - `alt` is non-empty (`alt.trim().length > 0`)
  - `aria-label` is non-empty
  - `aria-labelledby` is non-empty
  - `title` is non-empty
  - `role` is an informative role (not `presentation`, `none`, or bare unlabeled `img`)

_(In `mode="all"`, critical protections still keep widget UI, `[data-arap-ignore]`/`[data-arap-exempt]`, buttons/controls, icon-only/image-only links, CAPTCHAs, charts/graphs/diagrams, maps, QR/barcodes, and math visible while hiding standard editorial `<img>` tags, missing-`alt` `<img>` tags, `<picture>`, `<object type="image/*">`, `<embed type="image/*">`, and CSS images.)_

---

### B. Eligible Decorative Images (`isEligibleDecorativeImage`)

An image element is eligible in strict decorative mode only if `isFunctionalOrMeaningfulImage(el)` is `false` AND it exhibits explicit decorative markup:

1. **Empty alt attribute**: `el.hasAttribute("alt") && el.getAttribute("alt")?.trim() === ""`
2. **Presentational ARIA role**: `el.getAttribute("role") === "presentation"` or `"none"`
3. **Hidden from AT**: `el.getAttribute("aria-hidden") === "true"`
4. **Explicit decorative cue**: `data-decorative="true"`, `.decorative`, or `.deco`
5. **`<picture>`, `<object type="image/*">`, `<embed type="image/*">`, and explicitly decorative `<svg>`**: `<picture>` elements inherit decorative status from their child `<img>` or own markers.

---

## 3. Component Usage

### General Image Hiding: `HideImagesController`

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

### Decorative-Only Image Hiding: `HideDecorativeImagesController`

```tsx
import {
  HideDecorativeImagesController,
  HideImagesController,
} from "accessibility-plugin-react";

// Dedicated decorative-only component (defaults to mode="decorative")
<HideDecorativeImagesController label="Hide Decorative Images" />;

// Equivalent explicit mode prop on HideImagesController
<HideImagesController label="Hide Decorative Images" mode="decorative" />;
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

| Target                                    | Mode                 | Expected Behavior                                 |
| :---------------------------------------- | :------------------- | :------------------------------------------------ |
| `img[alt=""]` / `[data-decorative]`       | `all` / `decorative` | `visibility: hidden`                              |
| `img[alt="Editorial photo"]`              | `all`                | `visibility: hidden`                              |
| `img[alt="Editorial photo"]`              | `decorative`         | **Visible** (preserved)                           |
| `img` (missing `alt`)                     | `all`                | `visibility: hidden`                              |
| `img` (missing `alt`)                     | `decorative`         | **Visible** (preserved)                           |
| `a:not(:has-text) > img` (icon-only link) | `all` / `decorative` | **Visible** (retained)                            |
| `button > img` / `button[style*="url("]`  | `all` / `decorative` | **Visible** (retained)                            |
| `img.captcha` / `img.chart` / `img.qr`    | `all` / `decorative` | **Visible** (retained)                            |
| `div` / `body` / `.paragraph` `url(...)`  | `all` / `decorative` | `background-image: none !important`               |
| `::before` / `::after` CSS `url(...)`     | `all` / `decorative` | Pseudo image hidden via `#arap-hide-images-style` |
| `div[style*="linear-gradient(...)"]`      | `all` / `decorative` | **Visible** (gradient retained)                   |
| Reset / Toggle OFF / Unmount              | `all` / `decorative` | All original styles & attrs restored              |
