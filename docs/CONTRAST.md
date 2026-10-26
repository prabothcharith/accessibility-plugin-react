# Contrast Modes, Semantic Tokens and Native Forced-Colors Protection

This document details the contrast architecture, semantic tokens, element and state protections, and native operating system forced-colors integration in `accessibility-plugin-react`.

---

## 1. Contrast Modes and Semantic Tokens

The library provides five semantic contrast modes, configurable via `ContrastModeController` or `ContrastController`:

| Mode               | Key                      | Description                                     | Semantic Palette                                                           |
| :----------------- | :----------------------- | :---------------------------------------------- | :------------------------------------------------------------------------- |
| **Original / Off** | `off` / `original` / `0` | Restores original host styles without injection | N/A                                                                        |
| **Light**          | `light`                  | Crisp, high-clarity light theme                 | Background: `#ffffff`, Text: `#0f172a`, Border: `#94a3b8`, Link: `#0284c7` |
| **Dark**           | `dark`                   | Deep dark mode with legible ink tones           | Background: `#0f172a`, Text: `#f8fafc`, Border: `#475569`, Link: `#38bdf8` |
| **High Contrast**  | `high`                   | Strict WCAG AAA (>= 7:1) high contrast          | Background: `#000000`, Text: `#ffffff`, Border: `#ffffff`, Link: `#93c5fd` |
| **Invert**         | `invert`                 | Luminance inversion with media preservation     | Outer: `invert(1)`, Media: counter-inverted `invert(1)`                    |

In addition to semantic tokens, historical custom palettes (`yellow-on-black`, `white-on-black`, `blue-on-yellow`, `black-on-white`) and continuous filter multipliers (`reduced` 0.5×, `low` 1.25×, `high` 1.5×, `extra` 2.0×) are preserved for full backward compatibility.

---

## 2. Element & State Protections

Indiscriminate CSS filters or universal background overrides destroy non-text elements, chart visualizations, and critical interactive state cues. `isProtectedFromContrast(element)` strictly protects the following:

1. **Images & Media**:
   - `img`, `picture`, `picture *`, `video`, `canvas`
   - Opaque background colors are never forced onto images or videos.
2. **Graphics, SVGs & Charts**:
   - `svg`, `svg *`, `[role="img"]`, `[role="graphics-document"]`, `[role="graphics-symbol"]`
   - Data visualizations, vector diagrams, and charts remain clear and undistorted.
3. **Icon Fonts & Glyph Elements**:
   - `[data-icon]`, `i[class*="icon"]`, `span[class*="icon"]`, `i[class*="fa-"]`, `i[class*="material-symbols"]`, `i[class*="lucide"]`
4. **Form Validation Error States**:
   - `[aria-invalid="true"]`, `:invalid`, `.is-invalid`, `.invalid-feedback`, `[role="alert"]`
   - Critical validation indicator colors (such as error red outlines, borders, and error copy) are never stripped or replaced with plain black/white text.
5. **Disabled Control States**:
   - `:disabled`, `[aria-disabled="true"]`, `[disabled]`
   - Form buttons and inputs retain their disabled opacity and cues, preventing confusion between active and disabled controls.
6. **Widget Isolation**:
   - `.arap-root` and `[data-arap-ui]` remain completely isolated from page contrast overrides.

---

## 3. Media Preservation in Invert Mode

When page-level inversion (`invert(1)`) is enabled, photographs, artwork, and video streams normally become unsightly "negatives".

To protect user experience and visual accessibility:

- The library automatically queries all `img, video, canvas, picture, [role="img"]` within the inverted scope.
- It applies a counter-inversion (`filter: invert(1)`), which mathematical inversion cancels out (`invert(invert(X)) = X`).
- Photos, streaming video, and charts display with their true, natural photographic colors.
- When invert mode is disabled or reset, the counter-inversion filter is cleanly removed.

---

## 4. Operating System Forced-Colors Protection

Windows High Contrast Mode and operating systems supporting CSS `@media (forced-colors: active)` enforce system-level high-contrast palettes using keywords such as `Canvas`, `CanvasText`, `Highlight`, and `ButtonText`.

If an application forcibly applies inline colors or `contrast()` / `invert()` CSS filters while `forced-colors: active` is enabled, it interferes with user-configured system themes.

The library implements native forced-colors protection:

1. **Detection**: `isForcedColorsActive()` inspects `window.matchMedia("(forced-colors: active)").matches`.
2. **Non-Interference**: If forced-colors is active:
   - `composeFilter()` yields `""`, suppressing CSS filter injections.
   - Page inline background and color overrides are bypassed.
   - Operating system high-contrast theme keywords remain in full control.
3. **User Transparency**: `ContrastController` and `ContrastModeController` render an accessible notice:
   > _Operating system high contrast (forced colors) is active._
