# Public API

All exports are named from `react-accessibility-plugin`. JavaScript consumers receive compiled ESM/CJS; TypeScript consumers receive matching declarations. CSS is an explicit import from `react-accessibility-plugin/style.css` (historical `/dist/style.css` also works).

## Components

| Component                                     | Props                                                                                                                                                                                                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AccessibilityPlugin                           | `children: ReactNode` required; `position?: 'left' \| 'right' \| 'top' \| 'bottom'` default right; `persistenceKey?: string` default `react-accessibility-plugin:state`; `persist?: boolean` default true                                                                                                          |
| AccessibilityButton                           | `icon?: ReactNode` default inline accessibility SVG; `title?: string` accessible name, default Accessibility; `description?: string` supplementary accessible description; `className?: string`; `style?: CSSProperties`                                                                                           |
| AccessibilityList                             | `children: ReactNode` required; `title?: string` visible heading and region name, default Accessibility settings; `description?: string` default Adjust your reading experience (empty string omits it); `closeLabel?: string` default Close accessibility settings; `className?: string`; `style?: CSSProperties` |
| All fifteen controllers listed in FEATURES.md | No props. Pick/omit in JSX. For custom labels or behavior, compose a control with useAccessibility.                                                                                                                                                                                                                |

Use one button/list pair per provider and one provider per document. UI IDs use React `useId`; do not target the old fixed `arap-panel` ID. Plugin children can include ordinary app content, but mounting the widget as a sibling makes intent clearer. Persistence configuration is fixed at mount; use `<AccessibilityPlugin key={newKey} persistenceKey={newKey}>` when switching storage identity.

## useAccessibility

```ts
useAccessibility<T>(featureKey: string, defaultValue: T, options?: FeatureOptions<T>): {
  value: T;
  setValue: (next: T) => void;
  reset: () => void;
}
interface FeatureOptions<T> {
  validate?: (value: unknown) => value is T;
  apply?: (value: T) => void | (() => void);
}
```

`setValue` takes a concrete value, not a React functional updater. It validates and throws on invalid programmatic values. `reset` restores only this feature; `ResetController` clears every stored feature. JSON-compatible state only: no functions, symbols, cycles, class instances or DOM references. Custom validators are essential for records and arrays. Unique stable keys cannot be empty, `__proto__`, `constructor` or `prototype`. Built-in keys are reserved; their validation cannot be overridden by custom definitions.

Definitions/defaults are immutable for the provider lifetime; the first registered definition for a key wins. Repeated readers may share a key if they agree on the definition. Do not change a hook's key in place; remount a keyed component. `apply` runs only on the client; return cleanup. It runs again when the value changes and may be replayed by Strict Mode. Its lifetime is the provider's, not its control's.

## Context and exported types

`AccessibilityContext` defaults to null outside the provider. Prefer the hook for feature state. Advanced consumers may read `state: { isOpen, features }`, `isOpen`, `panelId`, `position`; call `toggleOpen()`, `closeMenu()`, `resetAll()`; and use `getFeatureState<T>(key, defaultValue)`, `setFeatureState<T>(key, value)`, `registerFeature(key, definition)`.

`FeatureRegistration` is `FeatureOptions<unknown>` plus `defaultValue: unknown`. Use the generic hook instead of manually casting callbacks. Legacy `registerReset(key, fn)` / `unregisterReset(key)` remain available; callbacks run before global state is cleared. They are not the primary effect lifecycle API. Callback owners must unregister their callback on teardown.

Exported types: `AccessibilityPluginProps`, `AccessibilityButtonProps`, `AccessibilityListProps`, `AccessibilityState`, `AccessibilityContextValue`, `PluginPosition`, `FeatureOptions<T>`, `FeatureRegistration`.

## Styling and labels

Import library CSS once, then load your overrides. It does not require Tailwind or set host `html`, `body`, universal resets, theme variables or heading defaults. `arap-` classes are the customization convention. Scope overrides to your panel class or `.arap-root` so they do not affect host controls:

```css
.arap-root .my-panel {
  border-radius: 8px;
  background: #f8fafc;
}
.arap-root .my-trigger {
  background: #164e63;
}
```

```tsx
<AccessibilityButton className="my-trigger" title="Display preferences" />
<AccessibilityList className="my-panel" title="Display preferences" closeLabel="Close preferences">
  <FontSizeController />
</AccessibilityList>
```

Host theme classes on an application root do not enclose body portals. Use global `.arap-root` overrides for custom widget themes, and preserve contrast, focus and pressed states. Consumer CSS containing broad `!important` rules can still interfere. Native buttons have explicit type and are safe within application forms.

### Clean light design foundation

The default widget uses white surfaces, ink labels, blue selected controls, outline icons, subtle dividers and a compact stepper layout. Steppers stack below their labels at narrow widths. All existing modes remain available; the reference mockup is a direction, not a reduced feature set. Icons are decorative, selected segmented controls include a checkmark, and switches retain 44px button targets.

Override the scoped CSS variables on `.arap-root` to adapt the palette. Defaults include `--arap-surface`, `--arap-text`, `--arap-muted`, `--arap-border`, `--arap-divider`, `--arap-accent`, `--arap-accent-hover`, `--arap-selected` and `--arap-control`. Supply compatible contrast for every state and test custom palettes. Consumer styles may also set these variables on their panel/trigger class. These variables are not applied to the host document.

```css
.arap-root {
  --arap-accent: #1e40af;
  --arap-accent-hover: #1e3a8a;
  --arap-selected: #eff6ff;
}
```
