# accessibility-plugin-react

Composable React controls for display preferences and reading assistance. Choose
the controls in JSX, keep the widget outside your application layout, and let
the provider own state, persistence, effects, focus behavior, and cleanup.

The library features modular accessible control primitives (`FeatureCard`, `ToggleControl`, `ChoiceControl`, `StepperControl`), state UI (`SearchCount`, `EmptyState`, `ErrorState`), profile previews (`ProfilePreviewCard`), locale packs (English, Sinhala, Tamil), offline dictionary lookup, native speech read-aloud TTS, opt-in saturation/grayscale with advisory warnings, reading mode, keyboard shortcuts, per-site feature-menu customization, and automated releases across npm, GitHub Releases, and GitHub Packages.
It supports React 18.3.1 and React 19.x, ships ESM, CommonJS, TypeScript declarations,
and scoped plain CSS, and has no runtime dependency other than React and React DOM.

> This library improves the presentation of your content. It cannot repair
> inaccessible application markup or certify WCAG conformance. Human
> screen-reader, physical-device, actual-zoom, forced-colors, and host
> integration checks remain part of your application's accessibility process.

![Clean light accessibility panel with remembered placement and fixed quick actions](https://raw.githubusercontent.com/prabothcharith/accessibility-react/main/docs/assets/movable-desktop.png)

## Installation

### From npm (recommended)

```sh
npm install accessibility-plugin-react
```

### From GitHub Packages

```sh
npm install @prabothcharith/accessibility-plugin-react --registry=https://npm.pkg.github.com
```

React and React DOM are peer dependencies and must use the same major/minor
line. The package requires Node.js 22.13 or newer for development and builds.
The widget itself does not require an API key, backend, environment variable,
Tailwind, Motion, or an icon library.

## Quick start

Import the package and mount one provider per document, preferably above route
changes or in the persistent application layout. The package automatically
injects its scoped CSS in browser environments:

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ContrastController,
  GrayscaleController,
  ResetController,
} from "accessibility-plugin-react";

export function AccessibilitySettings() {
  return (
    <AccessibilityPlugin position="right">
      <AccessibilityButton description="Adjust display preferences" />
      <AccessibilityList>
        <FontSizeController />
        <ContrastController />
        <GrayscaleController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

The button and panel are non-modal body portals. The application remains
interactive while the panel is open. Opening moves focus to the named region;
Escape and Close return focus to the trigger. Focus is not trapped.

`AccessibilityPlugin` can be rendered next to application content:

```tsx
export function App() {
  return (
    <>
      <main>{/* application routes and content */}</main>
      <AccessibilitySettings />
    </>
  );
}
```

## Built-in controllers

Every controller is opt-in. Add only the controls that make sense for your
site, and choose their order in JSX.

| Controller                                                | Effect                                                                                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `TextScaleController`                                     | Stepwise reflow-safe text enlargement (1.0x, 1.125x, 1.25x, 1.5x, 2.0x) protecting forms, code, and icons.                              |
| `FontSizeController`                                      | Scales eligible HTML text from 50% to 200%; supports continuous 10% steps or `stepScale` mode.                                          |
| `LineHeightController`                                    | Scales computed line height (50%–200%, step 10); supports `stepPresets` (100%, 150%, 175%, 200%).                                       |
| `LetterSpacingController`                                 | Applies 0–10px letter spacing with automatic cursive (Arabic/RTL) and Indic (Sinhala/Tamil) protection.                                 |
| `WordSpacingController`                                   | Applies 0–10px word spacing while protecting tables, code, forms, and widget internals.                                                 |
| `ContrastController`                                      | Adjusts contrast levels, palettes, or semantic modes while preserving images, video, charts, and validation.                            |
| `ContrastModeController`                                  | Applies light, dark, high contrast, or media-safe invert tokens with native forced-colors protection.                                   |
| `SaturationController`                                    | Reduces or increases saturation.                                                                                                        |
| `InvertColorsController`                                  | Inverts eligible page content.                                                                                                          |
| `GrayscaleController`                                     | Removes color while preserving the selected saturation value for later.                                                                 |
| `LinkHighlightController`                                 | Highlights links or selects a link palette.                                                                                             |
| `TextAlignController`                                     | Scopes left, center, right, or justified alignment to text blocks; warns about justification.                                           |
| `FontFamilyController`                                    | Applies clean system-ui or OpenDyslexic with Sinhala/Tamil fallbacks while protecting code and icons.                                   |
| `HideImagesController` / `HideDecorativeImagesController` | Hides only eligible decorative images while preserving controls, CAPTCHA, charts, maps, and informative graphics.                       |
| `HideVideosController`                                    | Hides video elements and recognized YouTube/Vimeo embeds visually.                                                                      |
| `BigCursorController`                                     | Applies a 40px high-contrast SVG pointer; capability-aware (requires `(pointer: fine)`).                                                |
| `ReadingMaskController`                                   | Adjustable transparent reading window (40–400px, default 100px); pointer-transparent; follows pointer, touch, and focus.                |
| `ReadingGuideController`                                  | 4px pointer-transparent guide ruler; never blocks clicks/selection; follows pointer, touch, and focus.                                  |
| `TooltipsController` / `AccessibleTooltipsController`     | Accessible tooltips for authored descriptions (`aria-description`, `aria-describedby`, `alt`, etc.) with WCAG 1.4.13.                   |
| `PageNavigatorController` / `HeadingsNavigatorController` | Explores real headings and landmarks, supports keyboard navigation, safe scroll/focus, and search filtering.                            |
| `ProfilesController` / `ProfileController`                | Previews, applies, and reverts eight neutral presets (Motor, Blind, Color Blind, Dyslexia, etc.) with deterministic overrides.          |
| `PresetsController` / `CustomPresetsController`           | Saves named custom presets and handles versioned JSON import/export with privacy exclusions.                                            |
| `ReadAloudController`                                     | User-initiated native text-to-speech with play/pause/resume/stop, voice selection, rate/pitch steppers, and sensitive field protection. |
| `DictionaryController`                                    | Accessible terminology dictionary dialog with 100% offline local glossaries (en, si, ta), sanitization, and focus restoration.          |
| `ResetController`                                         | Resets display features and custom registered features without moving the widget.                                                       |

Effects compose where appropriate. For example, contrast, saturation, invert,
and grayscale are applied in a deterministic order. Defaults leave host styles
unchanged, and the provider restores host inline values and priorities when an
effect is disabled or the provider is removed.

## Control primitives and profiles

Build custom accessible panels or custom features with modular primitives that include ARIA semantics, keyboard navigation, and Clean light styling:

- **`FeatureCard`**: Accessible container with header, icon, description, status badge, and alert states (`idle`, `active`, `error`, `unavailable`, `permission-required`).
- **`ToggleControl`**: Native switch button with `role="switch"`, `aria-checked`, and >=44px touch targets.
- **`ChoiceControl`**: Segmented or grouped choices with `role="radiogroup"`, Arrow key navigation (Left/Right/Up/Down/Home/End), and visual check indicators.
- **`StepperControl`**: Bounded decrement/increment buttons, `<output aria-live="polite">`, and optional range slider.
- **`SearchCount` & `EmptyState`**: Polite live announcements for feature filtering and search zero-results states.
- **`ProfilePreviewCard`**: Previews affected accessibility profile settings (e.g. low-vision, dyslexia, cognitive) and provides one-click reversal back to custom settings.
- **`ReadingModeController`**: Non-destructive article content reader with Light/Sepia/Dark themes, font scaling, and zero external transmission.
- **`KeyboardShortcutsController`**: Discoverable keyboard shortcut cheat sheet, collision-checked remapping, protected browser commands (e.g. Ctrl+U), form typing protection, and full Link Explorer.
- **`ReadAloudController`**: User-initiated native text-to-speech (TTS) with play, pause, resume, and stop controls, voice dropdown, rate and pitch steppers, persistent floating player bar, and sensitive field exclusion.
- **`DictionaryController`**: Accessible terminology dictionary lookup with local offline glossaries in English, Sinhala, and Tamil, sensitive data rejection, and truthful non-hallucinating responses.
- **`FeatureMenu`**: Declarative per-site feature menu reordering, grouping, custom labels, and non-crashing safe diagnostics with stable rerenders. See [docs/MENU_CUSTOMIZATION.md](docs/MENU_CUSTOMIZATION.md).

## Custom features

Use the two-argument hook for simple state, or provide validation and a
provider-owned effect for a feature that changes the page:

```tsx
import { useAccessibility } from "accessibility-plugin-react";

export function OutlineFeature() {
  const { value, setValue } = useAccessibility("site:outline", false, {
    apply(enabled) {
      if (!enabled) return;

      const previous = document.body.style.outline;
      document.body.style.outline = "3px solid #1e40af";
      return () => {
        document.body.style.outline = previous;
      };
    },
  });

  return (
    <button type="button" aria-pressed={value} onClick={() => setValue(!value)}>
      Outline page
    </button>
  );
}
```

Place the feature inside `AccessibilityList`:

```tsx
<AccessibilityList>
  <FontSizeController />
  <OutlineFeature />
  <ResetController />
</AccessibilityList>
```

The provider owns the effect lifetime, so it continues when the panel closes or
the control temporarily unmounts. Cleanup runs before reapplication and when
the provider unmounts. Custom state is JSON-compatible; supply `validate` for
arrays and objects. Feature keys must be stable and cannot use reserved
prototype names or built-in keys. See [custom feature details](docs/CUSTOM_FEATURES.md).

## Persistence and movement

Preferences are stored in a versioned local-storage record under
`react-accessibility-plugin:state` by default. Writes are debounced and flushed
when the page is hidden or the provider is removed. Invalid saved values fall
back to defaults; storage failures do not make the widget unusable.

```tsx
<AccessibilityPlugin
  persistenceKey="my-site:accessibility"
  persist={true}
  position="left"
>
  {/* button, list, and selected controllers */}
</AccessibilityPlugin>
```

Persistence options are fixed for the provider lifetime. Remount with a React
`key` when changing the storage identity. Use one provider per document.

The trigger is draggable by default. Movement also works with Alt+Arrow keys
and the panel's explicit corner and arrow controls. Drag activation has an
8px threshold, cancelled drags do not open the panel, and placement is clamped
on resize. `ResetController` preserves placement; the panel's separate
position reset removes it. Set `draggable={false}` when only the non-drag
controls should be available.

## Styling and framework integration

The stylesheet is scoped to `.arap-root` and does not add a global reset,
Tailwind preflight, or host theme variables. Load it once, then put consumer
overrides after it:

```css
.arap-root {
  --arap-accent: #1e40af;
  --arap-accent-hover: #1e3a8a;
  --arap-selected: #eff6ff;
}

.arap-root .my-trigger {
  border-radius: 999px;
}
```

Use `className`, `style`, `title`, `description`, and `closeLabel` to adapt
the widget to your product language and layout. Preserve visible focus,
pressed states, contrast, and the library's 44px minimum interactive targets
when overriding styles.

For Next.js App Router, put the provider and custom controls in a Client
Component, import the CSS from the root layout, and render the provider in the
persistent layout rather than once per route:

```tsx
// app/accessibility-settings.tsx
"use client";

import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
} from "accessibility-plugin-react";

export function AccessibilitySettings() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <FontSizeController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

See [installation and Next.js](docs/INSTALLATION.md) for App Router and Pages
Router examples, runnable code in [`examples/next-app/`](examples/next-app/), and [strict CSP guidance](docs/CSP.md).

## API and limitations

- Public components, props, exported types, placement, persistence, custom
  features, and CSS variables are documented in [API.md](docs/API.md).
- Detailed per-feature defaults, bounds, and host behavior are in
  [FEATURES.md](docs/FEATURES.md).
- Filters can create stacking contexts and containing blocks for fixed host
  descendants. Test sticky headers, overlays, and third-party widgets in the
  real application.
- Text measurement covers the current document's eligible HTML elements.
  Shadow DOM, iframe interiors, SVG/canvas text, pseudo-elements, and raw text
  nodes directly under `body` are outside scope.
- Image/video hiding is visual; video playback is not paused or muted.
- Reading aids are pointer-transparent overlays and do not replace semantic
  reading structure.
- There is no live cross-tab synchronization or server-side preference sync.
- `persist={false}` disables both display and placement persistence.

See [troubleshooting](docs/TROUBLESHOOTING.md) before filing an issue.

## Documentation and examples

- [API reference](docs/API.md)
- [Feature behavior and bounds](docs/FEATURES.md)
- [Link highlighting, focus visibility, and landmark skip links](docs/LINKS_AND_FOCUS.md)
- [Reduce motion and media controls](docs/REDUCE_MOTION.md)
- [Internationalization and locale packs](docs/LOCALES.md)
- [Non-destructive reading mode](docs/READING_MODE.md)
- [Contrast modes and forced-colors protection](docs/CONTRAST.md)
- [Legible and dyslexia font stacks](docs/FONTS.md)
- [Installation and Next.js](docs/INSTALLATION.md)
- [Content Security Policy (CSP) guidance](docs/CSP.md)
- [Custom features](docs/CUSTOM_FEATURES.md)
- [Migration from v1 and development baselines](docs/MIGRATION.md)
- [Architecture and lifecycle decisions](docs/ARCHITECTURE.md)
- [Development and testing](docs/DEVELOPMENT.md)
- [Design foundation](docs/DESIGN.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Project status and verification evidence](docs/PROJECT_STATUS.md)
- [Release procedure](docs/RELEASE.md)
- [Changelog](CHANGELOG.md)

Runnable package-consumer examples are in [`examples/`](examples/):

```sh
npm ci
npm run build
npm run example
```

## License

This package is available under the [ISC license](LICENSE). The original
vanilla JavaScript project is maintained separately at
[prabothcharith/accessibility-plugin](https://github.com/prabothcharith/accessibility-plugin).
