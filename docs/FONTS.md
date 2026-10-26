# Font Stacks, Script Fallbacks and Text Alignment

This document outlines the font preferences, script fallbacks, monospace/glyph protection, and text alignment architecture implemented in `accessibility-plugin-react`.

---

## 1. Font Family Options

The plugin provides three primary font modes:

1. **Default (`default` / `original`)**: Preserves the host application's original font typography without injecting overriding styles.
2. **Legible (`legible`)**: Applies a modern, highly legible system font stack optimized for clean rendering across all operating systems, with explicit script fallbacks.
3. **Dyslexia (`dyslexia-option` / `dyslexia`)**: Applies a dyslexia-friendly typeface stack prioritizing OpenDyslexic, weighted baselines, and soft rounded letterforms.

---

## 2. Font Stacks & Script Fallbacks

### Legible Font Stack

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  "Noto Sans Sinhala",
  "Iskoola Pota",
  "Noto Sans Tamil",
  "Latha",
  "Nirmala UI",
  sans-serif !important;
```

- **Primary**: High-clarity system interfaces across macOS, iOS, Windows, Android, and Linux.
- **Sinhala Fallbacks**: `"Noto Sans Sinhala"`, `"Iskoola Pota"`, `"Nirmala UI"` ensure complex consonant clusters and vowel modifiers render cleanly without glyph truncation.
- **Tamil Fallbacks**: `"Noto Sans Tamil"`, `"Latha"`, `"Nirmala UI"` ensure clear loop clarity and distinct character legibility.

### Dyslexia Font Stack

```css
font-family:
  OpenDyslexic, "Comic Sans MS", "Trebuchet MS", "Arial Rounded MT Bold",
  "Noto Sans Sinhala", "Iskoola Pota", "Noto Sans Tamil", "Latha", sans-serif !important;
```

- **Primary**: `OpenDyslexic` features heavy weighted bottoms, unique letter shaping, and wide apertures that counter letter rotation and flipping common in dyslexia.
- **Secondary Fallbacks**: `"Comic Sans MS"`, `"Trebuchet MS"`, and `"Arial Rounded MT Bold"` provide widely available fallback fonts with distinct non-symmetric letterforms (such as distinct `b` / `d` / `p` / `q`).
- **Script Fallbacks**: Preserves Sinhala and Tamil native readability.

---

## 3. Element & Symbol Protection

Font family overrides can break code blocks, symbol ligatures, and icon fonts if applied globally. The library strictly protects the following elements:

1. **Code & Monospace Blocks**:
   - `pre`, `code`, `kbd`, `samp`, `var`
   - Explicitly isolated with `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` to prevent inheriting global sans-serif or dyslexia fonts.
2. **Icon Fonts & SVGs**:
   - `svg`, `[data-icon]`, `i[class*="icon"]`, `span[class*="icon"]`, `i[class*="fa-"]`, `i[class*="material-symbols"]`, `i[class*="lucide"]`
   - Preserves private use area (PUA) glyphs and vector icons without font corruption.
3. **Exemptions & Widget UI**:
   - Elements marked with `[data-arap-ignore]` or `[data-arap-exempt]`.
   - Plugin widget internals (`.arap-root`, `[data-arap-ui]`).

---

## 4. Scoped Text Alignment & Justification Advisory

### Scoped Logical Text Blocks

Global alignment overrides distort button text, form inputs, table layouts, and navigation headers. `TextAlignController` scopes alignment strictly to logical text blocks:

- Headings: `h1, h2, h3, h4, h5, h6, [role="heading"]`
- Content blocks: `p, li, blockquote, dt, dd, figcaption, [role="paragraph"]`

Protected elements (`table, th, td, button, input, select, textarea, pre, code`) remain untouched.

### Justification Advisory (WCAG SC 1.4.8)

WCAG Success Criterion 1.4.8 (Visual Presentation) warns against fully justified text (aligned to both left and right margins), as uneven word spacing creates "rivers of white" running down the page, significantly impairing reading fluency for individuals with dyslexia or cognitive conditions.

When a user selects **Justify**, `TextAlignController` renders an accessible, polite notice (`role="note"`):

> _Justified text creates uneven word spacing ("rivers of white") that can impair readability._

---

## 5. Font Licensing & Attribution

- **OpenDyslexic**: Created by Abbie Gonzalez. Licensed under the [SIL Open Font License (OFL) v1.1](https://scripts.sil.org/OFL) and [Creative Commons Attribution 3.0 Unported](https://creativecommons.org/licenses/by/3.0/).
- **Noto Sans Sinhala & Noto Sans Tamil**: Designed by Google. Licensed under the [SIL Open Font License (OFL) v1.1](https://scripts.sil.org/OFL).
- **System Fonts** (`system-ui`, `Segoe UI`, `SF Pro`, `Roboto`, `Iskoola Pota`, `Latha`, `Nirmala UI`): Pre-installed native operating system fonts utilized via standard CSS fallback stacks without redistribution.
