# react-accessibility-plugin

A compound-component React accessibility widget with opt-in prebuilt features and full custom feature support.

## Features

- **15 prebuilt controllers**: Font Size, Line Height, Letter Spacing, Contrast, Saturation, Invert Colors, Grayscale, Link Highlight, Text Alignment, Hide Images, Hide Videos, Big Cursor, Reading Mask, Reading Guide, Reset
- **Custom features**: Build your own accessibility features using the `useAccessibility` hook — no forking required
- **Persistence**: Automatically saves and restores user preferences via localStorage
- **SSR safe**: Works with Next.js App Router and other SSR environments
- **Accessible**: Keyboard navigation, focus trap, ARIA roles, proper contrast

## Installation

```bash
npm install react-accessibility-plugin
```

## Quick Start

```jsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ContrastController,
} from "react-accessibility-plugin";
import "react-accessibility-plugin/dist/style.css";

function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton
        icon={<span>⚙️</span>}
        title="Accessibility"
        description="Adjust display settings"
      />
      <AccessibilityList>
        <FontSizeController />
        <ContrastController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

## API Reference

### `<AccessibilityPlugin>`

Root provider. Render once near your app root.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `position` | `"left" \| "right" \| "top" \| "bottom"` | `"right"` | Panel position |
| `persistenceKey` | `string` | `"react-accessibility-plugin:state"` | localStorage key |
| `children` | `ReactNode` | — | Must include `<AccessibilityButton>` and `<AccessibilityList>` |

### `<AccessibilityButton>`

Floating toggle button.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode` | — | Button icon content |
| `title` | `string` | `"Accessibility"` | Accessible label |
| `description` | `string` | — | Accessible description |
| `className` | `string` | `""` | CSS class override |

### `<AccessibilityList>`

Panel container for feature controllers.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Feature controller components |
| `className` | `string` | `""` | CSS class override |

### Prebuilt Features

| Component | Description |
|-----------|-------------|
| `FontSizeController` | Adjusts `font-size` on `<html>` (50%–200%) |
| `LineHeightController` | Adjusts `line-height` on `<html>` (50%–200%) |
| `LetterSpacingController` | Adjusts `letter-spacing` on `<html>` (0–10px) |
| `ContrastController` | Applies CSS `contrast()` filter (Off/Low/High/Extra) |
| `SaturationController` | Applies CSS `saturate()` filter (Off/Low/High) |
| `InvertColorsController` | Toggles CSS `invert(1)` filter |
| `GrayscaleController` | Toggles CSS `grayscale(1)` filter |
| `LinkHighlightController` | Highlights all links with yellow background |
| `TextAlignController` | Changes `text-align` on `<html>` (left/center/right/justify) |
| `HideImagesController` | Hides all images via CSS |
| `HideVideosController` | Hides all videos and embeds via CSS |
| `BigCursorController` | Applies a large circular cursor |
| `ReadingMaskController` | Shows a horizontal dark mask that follows the cursor |
| `ReadingGuideController` | Shows a horizontal blue line that follows the cursor |
| `ResetController` | Resets all features to defaults |

### `useAccessibility<T>(key, defaultValue)` hook

The public contract for building custom features.

```ts
function useAccessibility<T>(featureKey: string, defaultValue: T): {
  value: T;
  setValue: (next: T) => void;
  reset: () => void;
};
```

- Reads persisted value from localStorage on mount
- Writes to localStorage on every change
- Participates in `resetAll()` when ResetController is triggered

## Building Custom Features

```jsx
import { useAccessibility } from "react-accessibility-plugin";

function DyslexiaFontFeature() {
  const { value, setValue } = useAccessibility("dyslexiaFont", false);

  const toggle = () => {
    const next = !value;
    setValue(next);
    document.body.classList.toggle("dyslexia-font", next);
  };

  return (
    <div className="arap-feature">
      <label className="arap-label">Dyslexia-Friendly Font</label>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={toggle}
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}
```

Then use it exactly like a prebuilt feature:

```jsx
<AccessibilityList>
  <FontSizeController />
  <DyslexiaFontFeature />
</AccessibilityList>
```

## Styling

Import the compiled CSS once in your entry point:

```js
import "react-accessibility-plugin/dist/style.css";
```

All classes are prefixed with `arap-` to avoid collisions. Override styles via `className` props on `<AccessibilityButton>` and `<AccessibilityList>`.

## SSR / Next.js

All components include the `"use client"` directive and guard `document`/`window`/`localStorage` access. Safe to use with Next.js App Router.

## License

GPL-3.0
