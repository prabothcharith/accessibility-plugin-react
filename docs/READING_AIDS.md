# Reading Aids: Cursor Enlargement, Reading Mask, and Reading Guide

This document specifies the capability-aware pointer enlargement, pointer-transparent reading guide, and adjustable reading mask implemented in `accessibility-plugin-react` in accordance with WCAG 2.1 / 2.2 guidelines and issue [A11Y-301](https://github.com/prabothcharith/accessibility-react/issues/49).

---

## 1. Core Principles & Acceptance Criteria

1. **Overlays Never Block Interactions**:
   - Reading guide and reading mask overlays strictly enforce `pointer-events: none !important`, `user-select: none !important`, `-webkit-user-select: none !important`, and `touch-action: none !important`.
   - Clicks, double-clicks, text selections, context menus, drag interactions, and touch gestures pass unimpeded to host page elements beneath them.
2. **Accessible Semantics**:
   - Overlays are marked with `aria-hidden="true"` and `data-arap-ui=""`.
   - They do not participate in the document tab sequence or trap focus.
3. **Capability-Aware Pointer Enlargement**:
   - Cursor enlargement detects hardware fine pointer support (`(pointer: fine)`).
   - On touch-only devices (`(pointer: coarse)` without fine pointer), custom cursor injection is suppressed to prevent non-functional CSS artifacts.
   - The UI communicates hardware capability via visual badges/hints (`(Mouse)`).
4. **Multi-Input Tracking & Alignment**:
   - **Pointer & Mouse**: Tracks `pointermove` and `mousemove` smoothly across the viewport.
   - **Touch Drag**: Tracks `touchstart` and `touchmove` so touchscreen users can drag the reading aids across lines.
   - **Keyboard Focus Tracking**: Centers the reading aid on the active host element when users navigate with `Tab` or `focusin`.
   - **Scroll & Zoom Tracking**: When the page scrolls, the reading aid follows active keyboard focus or stays locked to the user's viewport line. Visual viewport zoom events re-clamp overlays cleanly.
5. **Keyboard Alternatives & Rapid Dismissal**:
   - `Escape`: Instantly disables the active reading aid and synchronizes state in the accessibility store.
   - `Alt+ArrowUp` / `Alt+ArrowDown`: Nudges reading aid position up or down by 30px without needing mouse interaction.
   - Native panel controls provide Move Up / Move Down buttons.
6. **Adjustable Reading Mask Window**:
   - The reading mask aperture height is adjustable (default 100px, clamped between 40px and 400px).
   - Stepper controls (`−` / `+`) allow narrowing the window to 1 text line or expanding it for paragraphs.
7. **Exact Lifecycle Cleanup**:
   - Disabling the feature, clicking "Reset All", or unmounting the provider completely removes the overlay elements from the DOM and disconnects all event listeners with zero memory leaks.

---

## 2. Feature Schema & Built-in Keys

| Feature Key         | Type                | Default | Description                                                                                                     |
| ------------------- | ------------------- | ------- | --------------------------------------------------------------------------------------------------------------- |
| `bigCursor`         | `boolean`           | `false` | High-contrast 40px SVG pointer (black fill, white border, hotspot at `4 2`).                                    |
| `readingGuide`      | `boolean`           | `false` | 4px horizontal tracking guide ruler with high-contrast borders.                                                 |
| `readingMask`       | `boolean \| number` | `false` | Transparent aperture window with `box-shadow: 0 0 0 200vmax rgba(0,0,0,.65)`. Accepts boolean or custom height. |
| `readingMaskHeight` | `number`            | `100`   | Aperture window height in pixels (clamped between 40px and 400px). Presets: `60`, `100`, `160`, `240`.          |

---

## 3. Component Reference

### `BigCursorController`

```tsx
import { BigCursorController } from "accessibility-plugin-react";

<BigCursorController showCapabilityHint={true} />;
```

- **Props**:
  - `showCapabilityHint?: boolean` (default: `true`): Renders a subtle `(Mouse)` badge if coarse-only touch hardware is detected.

### `ReadingGuideController`

```tsx
import { ReadingGuideController } from "accessibility-plugin-react";

<ReadingGuideController nudgeStep={30} />;
```

- **Props**:
  - `nudgeStep?: number` (default: `30`): Step size in pixels when using Move Up / Move Down buttons.

### `ReadingMaskController`

```tsx
import { ReadingMaskController } from "accessibility-plugin-react";

<ReadingMaskController minHeight={40} maxHeight={300} step={20} />;
```

- **Props**:
  - `minHeight?: number` (default: `40`): Minimum window height in pixels.
  - `maxHeight?: number` (default: `300`): Maximum window height in pixels.
  - `step?: number` (default: `20`): Height increment/decrement step in pixels.

---

## 4. Helper Functions & Utilities

```ts
import {
  hasFinePointer,
  subscribeFinePointer,
  nudgeReadingAid,
  DEFAULT_READING_MASK_HEIGHT,
  READING_MASK_HEIGHT_PRESETS,
} from "accessibility-plugin-react";

// Check if device supports a mouse/trackpad pointer
if (hasFinePointer()) {
  console.log("Fine pointer hardware detected");
}

// Subscribe to hardware connection changes (e.g., mouse plugged in)
const unsubscribe = subscribeFinePointer(() => {
  console.log("Pointer capabilities changed");
});

// Programmatically nudge the reading guide or mask
nudgeReadingAid("readingGuide", -30); // Move guide up 30px
nudgeReadingAid("readingMask", 30); // Move mask down 30px
```

---

## 5. Keyboard and Gesture Reference

| Action                    | Shortcut / Gesture        | Behavior                                                            |
| ------------------------- | ------------------------- | ------------------------------------------------------------------- |
| **Dismiss / Disable**     | `Escape`                  | Dismisses overlay and sets feature state to `false`.                |
| **Nudge Up**              | `Alt + ArrowUp`           | Moves guide or mask up by 30px.                                     |
| **Nudge Down**            | `Alt + ArrowDown`         | Moves guide or mask down by 30px.                                   |
| **Follow Pointer**        | Mouse movement / trackpad | Centers reading window or guide on cursor Y position.               |
| **Follow Touch**          | Finger drag on screen     | Centers reading window or guide on touch contact Y position.        |
| **Follow Keyboard Focus** | `Tab` / `Shift + Tab`     | Centers reading window or guide on focused element vertical middle. |
| **Scroll Tracking**       | Page scroll               | Keeps active focused element aligned within reading aperture.       |

---

## 6. Verification and Test Coverage

1. **Unit Tests (`tests/readingAids.test.tsx`)**:
   - `hasFinePointer` and `subscribeFinePointer` hardware capability detection and touch suppression.
   - `BigCursorController` capability badge and clean cursor application/removal.
   - `ReadingGuideController` pointer transparency, click-through, selection, touch tracking, focus tracking, scroll tracking, Alt+Up/Down nudging, Escape dismissal, and cleanup.
   - `ReadingMaskController` transparent window, viewport shadow, stepper height adjustability, touch drag, Escape dismissal, and cleanup.
   - Provider `Reset All` lifecycle teardown.
2. **Browser Smoke Tests (`tests/browser/widget.spec.ts`)**:
   - Real Chromium verification of pointer transparency on host buttons.
   - Aperture height adjustments in live DOM.
   - Escape key and Reset All dismissal verification.
