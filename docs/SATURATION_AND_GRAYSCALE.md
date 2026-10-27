# Saturation and Grayscale Modes (A11Y-402)

## Overview

The `accessibility-plugin-react` library provides opt-in, non-destructive color saturation and monochrome grayscale display modes via `SaturationController` and `GrayscaleController`.

These modes allow users with photophobia, visual fatigue, migraine susceptibility, color processing differences, or cognitive processing needs to adjust color intensity without breaking host styles, causing compounding filters, or leaking stale styles across client-side navigation.

---

## Capabilities & Modes

| Mode                | Value                                       | Applied CSS Filter | Use Case                                                                                                                   |
| ------------------- | ------------------------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| **Original / Off**  | `0` or `"original"`                         | None (`""`)        | Default natural site colors.                                                                                               |
| **Low Saturation**  | `1` or `"low"`                              | `saturate(0.2)`    | Reduces color chroma by 80% to alleviate visual overstimulation and sensory overload while retaining faint chromatic cues. |
| **High Saturation** | `2` or `"high"`                             | `saturate(2)`      | Increases color chroma by 200% for users with low contrast sensitivity who need vivid distinctions between colors.         |
| **Grayscale**       | `3` or `"grayscale"` (or `grayscale: true`) | `grayscale(1)`     | Full monochrome mode eliminating all color hues for users with severe photophobia or specific color processing conditions. |

Both controllers can be used independently or composed together:

- `SaturationController` offers segmented buttons (`Off`, `Low`, `High`, `Grayscale`) with an optional `includeGrayscale={false}` flag if developers prefer rendering `GrayscaleController` separately.
- `GrayscaleController` offers an accessible standalone toggle switch button.

---

## Documented Chart and Image Risks

When modifying color saturation or applying grayscale, users face specific perceptual trade-offs that web authors and users must understand:

### 1. Data Visualizations, Charts, and Maps (WCAG 1.4.1 Use of Color)

- **The Risk**: Charts, line graphs, pie charts, topological maps, and transit diagrams that convey meaning _solely through color hue_ (e.g., green for positive, red for negative, multi-colored lines for series) lose distinction when saturation is reduced or grayscale is applied.
- **Mitigation & Advisory**: Both controllers display a polite, visible advisory notice (`role="note"`, `aria-live="polite"`):
  - _Low Saturation_: `"Low saturation reduces color differences. Color-coded charts and indicators may be harder to distinguish."*
  - _Grayscale_: `"Grayscale removes all color. Visualizations and charts relying on color alone may require alternative labels."*
- **Author Best Practice**: Ensure all charts use distinct stroke dash patterns, hatch fills, direct text callouts, or data table alternatives so they remain comprehensible in monochrome.

### 2. High Saturation Glare and Image Clipping

- **The Risk**: Scaling saturation to 200% (`saturate(2)`) causes highly saturated reds, magentas, and cyans to clip to the gamut boundary (`#ff0000`, `#ff00ff`), causing halo artifacts around high-contrast edges and visual glare.
- **Mitigation & Advisory**:
  - _High Saturation_: `"High saturation increases color intensity (200%), which may cause visual glare or color clipping."*

---

## Forced-Colors (High Contrast) Protection

When an operating system forced-colors mode (such as Windows High Contrast Mode) is active, browser media query `@media (forced-colors: active)` indicates that the OS is enforcing an authoritative high-contrast palette.

1. **Automatic Filter Bypass**: `composeFilter()` detects `isForcedColorsActive()` and immediately returns an empty filter string `""`. This prevents CSS `saturate()` or `grayscale()` from interfering with the system's high-contrast color scheme.
2. **Accessible Notice**: Both controllers monitor forced-colors status using `useSyncExternalStore(subscribeForcedColors, isForcedColorsActive)` and render a clear status message:
   `"Operating system high contrast (forced colors) is active. Filter effects are bypassed to preserve OS contrast."`
3. **Preference Retention**: The user's chosen saturation level remains preserved in preferences and will take effect if forced-colors mode is subsequently disabled.

---

## Instant Reversible Reset Across Chromium, Firefox, and WebKit

Color filters are applied to top-level host body children rather than `<html>` or `<body>` to prevent creating unexpected CSS containing blocks that would distort fixed widget placement and portal elements:

1. **Reversible Mutations**: The scoped effect engine tracks prior inline values and priorities (`element.style.getPropertyValue("filter")`).
2. **Instant Reset**: When Reset All executes or when a user clicks "Off", the cleanup function restores the element's exact prior inline styles or calls `element.style.removeProperty("filter")`.
3. **No Stale Filter Leakage**: Tested across Chromium, Firefox, and WebKit to guarantee `getComputedStyle(element).filter` returns `"none"` after reset, with zero residual stacking contexts or color distortion.

---

## Localization Support

All labels, segment titles, and advisory warnings are fully localized in:

- English (`en`, `en-US`, `en-GB`)
- Sinhala (`si`, `si-LK`): e.g., `සන්තෘප්තිය`, `අක්‍රියයි`, `අඩු`, `ඉහළ`, `අළු පැහැ`
- Tamil (`ta`, `ta-LK`): e.g., `நிறச்செறிவூட்டல்`, `முடக்கு`, `குறைந்த`, `அதிக`, `சாம்பல் நிறம்`
