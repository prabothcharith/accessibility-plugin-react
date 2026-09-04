# React Accessibility Plugin — Full Build Specification (for Antigravity)

## 0. Context & Goal

Praboth previously built a vanilla-JS accessibility widget (`accessibility-plugin` on npm/GitHub) with features like invert colors, grayscale, saturation controls, link highlight, font size, line height, letter spacing, text alignment, contrast levels, hide images/videos, big cursor, reading mask/guide, reset, position, and localStorage persistence.

This spec is for a **ground-up React rewrite** as a compound-component library, published as its own npm package (e.g. `react-accessibility-plugin`), where:

1. Prebuilt features ship as individual opt-in components (`<FontSizeController />`, `<ContrastController />`, etc.) — a developer enables a feature simply by rendering it inside `<AccessibilityList>`, and disables it by omitting it.
2. Developers can build **fully custom features** as their own React components, following a documented contract, and drop them into the same `<AccessibilityList>` alongside the prebuilt ones — no forking or editing the library's source required.

Target usage (must work exactly like this):

```jsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ContrastController,
} from "react-accessibility-plugin";
import "react-accessibility-plugin/dist/style.css";
import { HiOutlineSpeakerWave } from "react-icons/hi2";
import CustomFeature from "./CustomFeature";

function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton
        icon={<HiOutlineSpeakerWave />}
        title="Accessibility"
        description="Adjust display settings"
      />
      <AccessibilityList>
        <FontSizeController />
        <ContrastController />
        <CustomFeature />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

---

## 1. Tech Stack & Tooling

- **Language:** TypeScript (source). Compiled output is plain JS + `.d.ts` files — consumers never need TypeScript installed, and can write their own custom features in plain `.jsx`/`.js` with zero friction.
- **Styling:** Tailwind CSS internally, but **compiled to a single static CSS file** at build time (`dist/style.css`) that consumers import once. Do NOT rely on the consumer's own Tailwind config to pick up your classes — most won't, and the widget will silently render unstyled. This is a shipped, pre-built stylesheet, same approach used by mature component libraries.
- **Bundler:** `tsup` (simplest, zero-config-friendly for React component libraries; produces ESM + CJS + `.d.ts` in one pass) — Antigravity may use Vite Library Mode instead if it's already the team's default, but tsup is the recommended starting point for a first library.
- **React support:** `react` and `react-dom` as `peerDependencies` (>=18), never bundled — prevents duplicate React instances in the consumer's app.
- **Package manager:** npm (matches the old plugin's publishing setup).
- **Testing:** Vitest + React Testing Library.
- **Linting:** ESLint + typescript-eslint, matching whatever config style Praboth already uses in his other repos if available; otherwise a standard `airbnb`-lite config.

---

## 2. Package Structure

```
react-accessibility-plugin/
├── src/
│   ├── index.ts                     # public exports
│   ├── core/
│   │   ├── AccessibilityPlugin.tsx  # root provider component
│   │   ├── AccessibilityContext.ts  # React context + types
│   │   ├── AccessibilityButton.tsx  # floating toggle button
│   │   ├── AccessibilityList.tsx    # panel/container for feature controllers
│   │   ├── useAccessibility.ts      # public hook for reading/writing state
│   │   ├── storage.ts               # localStorage persistence layer
│   │   └── types.ts                 # shared TS types (FeatureState, etc.)
│   ├── features/                    # PREBUILT features — one file per feature
│   │   ├── FontSizeController.tsx
│   │   ├── LineHeightController.tsx
│   │   ├── LetterSpacingController.tsx
│   │   ├── ContrastController.tsx
│   │   ├── SaturationController.tsx
│   │   ├── InvertColorsController.tsx
│   │   ├── GrayscaleController.tsx
│   │   ├── LinkHighlightController.tsx
│   │   ├── TextAlignController.tsx
│   │   ├── HideImagesController.tsx
│   │   ├── HideVideosController.tsx
│   │   ├── BigCursorController.tsx
│   │   ├── ReadingMaskController.tsx
│   │   ├── ReadingGuideController.tsx
│   │   └── ResetController.tsx
│   ├── styles/
│   │   └── tailwind.css             # source Tailwind file (build input only)
│   └── utils/
│       └── dom.ts                   # shared DOM helper functions (applying CSS filters/classes to <html>/<body>)
├── examples/
│   ├── basic-usage/                 # small CRA/Vite demo app consuming the built package
│   └── custom-feature/              # demo showing a custom feature end-to-end
├── tests/
│   └── ...                          # mirrors src/ structure
├── tsup.config.ts
├── tailwind.config.ts
├── package.json
├── tsconfig.json
├── README.md
└── CONTRIBUTING.md
```

---

## 3. Core Architecture

### 3.1 `AccessibilityContext`

A single React Context holds:

```ts
interface AccessibilityState {
  isOpen: boolean;
  // Generic registry: any feature (prebuilt or custom) can store its own
  // slice of state here under a unique string key, without the core
  // library needing to know that feature exists.
  features: Record<string, unknown>;
}

interface AccessibilityContextValue {
  state: AccessibilityState;
  isOpen: boolean;
  toggleOpen: () => void;
  closeMenu: () => void;
  // Generic getter/setter any feature component calls internally
  getFeatureState: <T>(key: string, defaultValue: T) => T;
  setFeatureState: <T>(key: string, value: T) => void;
  resetAll: () => void;
  // Registry of cleanup functions so ResetController and unmount can
  // undo any DOM mutation a feature applied (see 3.4)
  registerReset: (key: string, resetFn: () => void) => void;
}
```

This generic `features: Record<string, unknown>` registry (keyed by string, e.g. `"fontSize"`, `"contrast"`, or any key a custom feature author chooses) is the mechanism that makes the library open-ended — the core `AccessibilityPlugin` never needs to know the full list of possible features up front, prebuilt or custom.

### 3.2 `useAccessibility()` hook — the public contract for custom features

This is the single most important export for the "developer builds their own feature" requirement. It must be documented clearly in the README with a full example. Signature:

```ts
function useAccessibility<T>(featureKey: string, defaultValue: T): {
  value: T;
  setValue: (next: T) => void;
  reset: () => void;
};
```

Internally this wraps `getFeatureState`/`setFeatureState`/`registerReset` from context, and automatically:
- Reads the persisted value from localStorage on first mount (if persistence is enabled — see §4).
- Writes to localStorage on every change.
- Registers itself so `resetAll()` (triggered by the prebuilt `<ResetController />` or a custom "Reset" button) reverts this feature too, without the core library needing a hardcoded list of features.

This is what lets a third-party developer write, e.g., a "Dyslexia Font" toggle as a completely custom component that still participates in save/reset/persist behavior identical to the prebuilt ones — fulfilling requirement #2 in the brief.

### 3.3 `AccessibilityPlugin` (root provider)

- Must be rendered once, high in the component tree (ideally near the app root).
- Renders a `<AccessibilityContext.Provider>` wrapping its children.
- Renders a fixed-position container (`position: fixed`) that will host the button + panel — actual layout position (`left`/`right`/`top`/`bottom`, matching the old plugin's "Change Position" feature) should be a prop: `position?: "left" | "right" | "top" | "bottom"` (default `"right"`).
- On mount, hydrates all persisted feature values from localStorage in one batch (avoids a flash of unstyled/default state).
- Does NOT render the button or panel itself — those come from `<AccessibilityButton>` and `<AccessibilityList>`, which the developer places explicitly as children, matching the exact usage example in §0. This keeps the API declarative and gives the developer full control over composition.

### 3.4 `AccessibilityButton`

Props:
```ts
interface AccessibilityButtonProps {
  icon: React.ReactNode;
  title?: string;
  description?: string;
  className?: string; // escape hatch for custom Tailwind/CSS overrides
}
```
Renders the floating toggle button. On click, calls `toggleOpen()` from context. `title`/`description` are used for `aria-label`/`aria-describedby` — accessibility of the accessibility widget itself is non-negotiable (keyboard-focusable, proper ARIA roles, visible focus ring).

### 3.5 `AccessibilityList`

- Renders its children (the feature controllers) inside a panel, only visible when `isOpen` is true.
- Should render as a `<div role="dialog" aria-modal="true">` with focus trap while open (basic focus trap is enough — don't over-engineer, but don't skip it either; this is an accessibility tool, it must itself be accessible).
- Purely a layout/visibility container — it does NOT know or care what its children are. Any valid React component can be a child, prebuilt or custom. This is what satisfies requirement #2's "add that item inside the Accessibility component list."

### 3.6 Prebuilt feature components (requirement #1)

Each prebuilt feature (e.g. `FontSizeController`) is a **self-contained component** that:
1. Calls `useAccessibility(key, defaultValue)` internally.
2. Renders its own UI (e.g. a −/+ stepper for font size, a slider for contrast).
3. Applies the actual DOM effect as a side effect (`useEffect`) — e.g. `document.documentElement.style.fontSize = ...`, or toggling a class on `<body>` for grayscale/invert/high-contrast (keep the DOM mutation logic in `utils/dom.ts`, shared and unit-testable, not copy-pasted per component).

Enabling/disabling a prebuilt feature is purely: **is `<FontSizeController />` present in the JSX tree, or not.** No separate "enable/disable" config API is needed given the requirement — this composition-based on/off switch is simpler and matches the target usage exactly. (If Antigravity or Praboth later wants a config-object alternative like `<AccessibilityPlugin features={{ fontSize: true }}>`, that can be a v2 addition — but it should NOT replace the JSX composition API, since the brief explicitly wants that pattern.)

Full prebuilt feature list to port from the old plugin (map 1:1 where sensible):

| Old feature | New component |
|---|---|
| Font Size | `FontSizeController` |
| Line Height | `LineHeightController` |
| Letter Spacing | `LetterSpacingController` |
| Low/High/Extra Contrast | `ContrastController` (single component, multi-level via a slider/segmented control, not 3 separate components) |
| Low/High Saturation | `SaturationController` (same pattern) |
| Invert Colors | `InvertColorsController` |
| Grayscale | `GrayscaleController` |
| Link Highlight | `LinkHighlightController` |
| Text Alignment | `TextAlignController` |
| Hide Images | `HideImagesController` |
| Hide Videos | `HideVideosController` |
| Big Circle Cursor | `BigCursorController` |
| Reading Mask | `ReadingMaskController` |
| Reading Guide | `ReadingGuideController` |
| Reset | `ResetController` (calls `resetAll()`) |

(Position and Close are handled by `AccessibilityPlugin`/`AccessibilityButton` props, not separate feature components.)

### 3.7 Custom feature contract (requirement #2) — must be documented prominently in README

A developer builds a custom feature by creating a new component, anywhere in their own codebase, following this minimal pattern:

```jsx
// CustomFeature.jsx — lives in the CONSUMER's project, not the library
import { useAccessibility } from "react-accessibility-plugin";

export default function CustomFeature() {
  const { value, setValue } = useAccessibility("myCustomFeature", false);

  const toggle = () => {
    const next = !value;
    setValue(next);
    document.body.classList.toggle("my-custom-effect", next);
  };

  return (
    <button onClick={toggle} aria-pressed={value}>
      My Custom Feature
    </button>
  );
}
```

Then drop it into the list exactly like a prebuilt one:
```jsx
<AccessibilityList>
  <FontSizeController />
  <CustomFeature />
</AccessibilityList>
```

No import path into the library's internals, no registration step, no editing library source — this satisfies requirement #2 exactly as described in the brief ("create new js file... make it a child... add inside the list"), and works identically whether the consumer's file is `.js`, `.jsx`, or `.tsx`.

---

## 4. Persistence (localStorage)

- Single localStorage key, e.g. `"react-accessibility-plugin:state"`, storing the entire `features` record as JSON — not one key per feature. Simpler to reset/clear, avoids localStorage key collisions with the rest of the consumer's app.
- Debounce writes (e.g. 200ms) to avoid thrashing localStorage on rapid slider drags.
- Gracefully handle `localStorage` being unavailable (SSR/Next.js server render, privacy mode) — guard all reads/writes, default to in-memory state only.
- `resetAll()` clears the localStorage key entirely and resets every registered feature to its `defaultValue`.

---

## 5. SSR / Next.js Compatibility

Since Praboth builds Next.js apps regularly (per his other projects), this must not crash under SSR:
- All `document`/`window`/`localStorage` access must be guarded or deferred to `useEffect` (never at module scope or render time).
- Provide a `"use client"` directive at the top of every component file if targeting Next.js App Router compatibility.

---

## 6. Build & Publish Steps (for Antigravity to execute in order)

1. **Scaffold**: `npm init`, install `react`, `react-dom` as devDependencies + peerDependencies, install `typescript`, `tsup`, `tailwindcss`, `vitest`, `@testing-library/react`.
2. **Configure `tsup.config.ts`**: entry `src/index.ts`, format `["esm", "cjs"]`, `dts: true`, `external: ["react", "react-dom"]`.
3. **Configure Tailwind** to build `src/styles/tailwind.css` → `dist/style.css` as a separate build step (either a small postcss/tailwind CLI script run alongside tsup, or a tsup `onSuccess` hook). Verify the compiled CSS is scoped enough not to leak generic utility classes into the consumer's global page styles unexpectedly (consider a class-name prefix, e.g. `arap-` for "react-accessibility-plugin", applied via Tailwind's `prefix` config option, to avoid collisions with the consumer's own Tailwind setup).
4. **Implement core** (`AccessibilityContext`, `AccessibilityPlugin`, `useAccessibility`, `storage.ts`) first, with unit tests, before touching any feature components — this is the riskiest part architecturally and should be validated early.
5. **Implement `AccessibilityButton`, `AccessibilityList`** — validate the exact JSX usage from §0 compiles and renders correctly in a throwaway test app.
6. **Implement prebuilt features one at a time**, each with its own unit test asserting the correct DOM mutation happens and reverses correctly on toggle-off/reset.
7. **Write the `examples/basic-usage` and `examples/custom-feature` demo apps** — these double as manual QA and as README-embeddable proof the API works exactly as documented.
8. **Write README.md**: installation, the exact usage snippet from §0, full prebuilt feature table, and the full custom-feature contract from §3.7 with the exact code example.
9. **Accessibility audit of the widget itself**: keyboard nav (Tab/Escape to close), focus trap while open, ARIA roles, color contrast of the widget's own UI — run axe-core against the example app.
10. **Version + publish**: `npm version 0.1.0`, `npm publish` (or a beta tag `npm publish --tag beta` first for Praboth to test in a real project before a stable release).
11. **GitHub repo housekeeping**: reuse the existing `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE` (GPL-3.0) from the old repo if this replaces it, or link the two repos together (old vanilla-JS version vs new React version) if keeping both published separately.

---

## 7. Explicit Non-Goals (keep v1 scope tight)

- No visual theme/skin customization system beyond Tailwind class overrides via `className` props — don't over-build a theming API before there's demand for it.
- No config-object API (`<AccessibilityPlugin features={{...}} />`) in v1 — the JSX composition pattern from the brief is the only enable/disable mechanism, deliberately, to keep the mental model simple.
- No Vue/Svelte/Angular support — React only.
- No automatic feature discovery/auto-registration magic (e.g. scanning a folder) — explicit JSX composition only, per the brief.

---

## 8. Open Questions for Praboth to Confirm Before/During Build

- Should the widget ship with **zero default styling assumptions** beyond making it usable (i.e., a developer must style the button/panel themselves via `className`), or should there be a sensible default look-and-feel out of the box (like the old plugin had)? Recommendation: ship a clean, minimal default look (so it's usable with zero config, matching the old plugin's DX), fully overridable via `className`.
- Keep the old vanilla-JS `accessibility-plugin` package maintained in parallel, or deprecate it in favor of this one once stable?
- Package name: `react-accessibility-plugin`, or something distinct enough from the existing npm name to avoid confusion (e.g. `@prabothcharith/react-accessibility-plugin` as a scoped package)?
