# Public API

All exports are named from `accessibility-plugin-react`. JavaScript consumers receive compiled ESM/CJS; TypeScript consumers receive matching declarations. Importing the package automatically injects its scoped CSS in browser environments. The standalone `accessibility-plugin-react/style.css` export (historical `/dist/style.css` also works) remains available for applications that require an explicit stylesheet pipeline.

## Components

| Component                            | Props                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AccessibilityPlugin                  | `children: ReactNode` required; `position?: 'left' \| 'right' \| 'top' \| 'bottom'` default right; `persistenceKey?: string` default `react-accessibility-plugin:state`; `persist?: boolean` default true; `storage?: 'local' \| 'session' \| 'none'` default local; `locale?: string`; `statementUrl?: string`; `largeControls?: boolean` default false                                           |
| AccessibilityButton                  | `draggable?: boolean` default true (pointer/Alt+arrow movement); `icon?: ReactNode` default inline accessibility SVG; `title?: string` accessible name, default Accessibility; `description?: string` supplementary accessible description; `className?: string`; `style?: CSSProperties`; `largeControls?: boolean`                                                                               |
| AccessibilityList                    | `footer?: ReactNode` extra fixed actions; `children: ReactNode` required; `title?: string` visible heading and region name, default Accessibility settings; `description?: string` default Adjust your reading experience; `closeLabel?: string` default Close; `statementUrl?: string`; `largeControls?: boolean`; `locale?: string`; `className?: string`; `style?: CSSProperties`               |
| FeatureCard                          | `title: ReactNode` required; `children: ReactNode` required; `featureKey?: string`; `icon?: ReactNode`; `description?: ReactNode`; `statusBadge?: string`; `status?: 'idle' \| 'active' \| 'error' \| 'unavailable' \| 'permission-required'`; `errorMessage?: string`; `unavailableMessage?: string`; `permissionMessage?: string`; `onRequestPermission?: () => void`; `largeControls?: boolean` |
| ToggleControl                        | `label: ReactNode` required; `checked: boolean` required; `onChange: (checked: boolean) => void` required; `disabled?: boolean`; `unavailable?: boolean`; `unavailableReason?: string`; `largeControls?: boolean`                                                                                                                                                                                  |
| ChoiceControl                        | `label: string` required; `value: T` required; `options?: ChoiceOption<T>[]`; `groups?: ChoiceGroup<T>[]`; `onChange: (value: T) => void` required; `disabled?: boolean`; `largeControls?: boolean`                                                                                                                                                                                                |
| StepperControl                       | `label: string` required; `value: number` required; `min: number`; `max: number`; `step: number`; `unit?: string` default '%'; `showSlider?: boolean`; `formatValue?: (val: number) => string`; `onChange: (value: number) => void` required; `disabled?: boolean`; `largeControls?: boolean`                                                                                                      |
| ProfilePreviewCard                   | `profile: ProfileDefinition` required; `isActive: boolean` required; `onApply: (profile: ProfileDefinition) => void` required; `onRevert: () => void` required; `largeControls?: boolean`                                                                                                                                                                                                          |
| TextScaleController                  | `steps?: readonly number[]` default `[1.0, 1.125, 1.25, 1.5, 2.0]`; `label?: string` default `Bigger Text`. Stepped text scaling without transforms.                                                                                                                                                                                                                                               |
| FontSizeController                   | Optional `stepScale?: boolean` (snaps to WCAG 1x–2x reflow steps); `steps?: readonly number[]` (custom steps); or omitted for continuous 10% steps. Protects forms, code, and icons.                                                                                                                                                                                                               |
| LineHeightController                 | Optional `stepPresets?: boolean` (snaps to WCAG 1.0x, 1.5x, 1.75x, 2.0x); `steps?: readonly number[]` (custom steps); or omitted for 10% steps. Excludes tables, code, and controls.                                                                                                                                                                                                               |
| LetterSpacingController              | Optional `min`, `max`, `step`, `steps`. Excludes tables and code blocks; respects language-aware limits (disables on cursive/Arabic, clamps <=1px on Indic/Sinhala/Tamil).                                                                                                                                                                                                                         |
| WordSpacingController                | Optional `min`, `max`, `step`, `steps` (default 0–10px, step 1). Excludes tables, code blocks, controls, and widget UI.                                                                                                                                                                                                                                                                            |
| ParagraphSpacingController           | Optional `min`, `max`, `step`, `steps` (default 0–32px, step 4). Increases bottom margin on `p` and `[role="paragraph"]`.                                                                                                                                                                                                                                                                          |
| All other controllers in FEATURES.md | Pick/omit in JSX. For custom labels or behavior, compose a control with useAccessibility or the modular control primitives.                                                                                                                                                                                                                                                                        |

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

`setValue` takes a concrete value, not a React functional updater. It validates and throws on invalid programmatic values. `reset` restores only this feature; `ResetController` clears all display features and preserves saved widget placement. JSON-compatible state only: no functions, symbols, cycles, class instances or DOM references. Custom validators are essential for records and arrays. Unique stable keys cannot be empty, `__proto__`, `constructor` or `prototype`. Built-in keys are reserved; their validation cannot be overridden by custom definitions.

Definitions/defaults are immutable for the provider lifetime; the first registered definition for a key wins. Repeated readers may share a key if they agree on the definition. Do not change a hook's key in place; remount a keyed component. `apply` runs only on the client; return cleanup. It runs again when the value changes and may be replayed by Strict Mode. Its lifetime is the provider's, not its control's.

## Context and exported types

`AccessibilityContext` defaults to null outside the provider. Prefer the hook for feature state. Advanced consumers may read `state: { isOpen, features }`, `isOpen`, `panelId`, `position`, `widgetPlacement`; call `setWidgetPlacement(nextOrNull)`, `toggleOpen()`, `closeMenu()`, `resetAll()`; and use `getFeatureState<T>(key, defaultValue)`, `setFeatureState<T>(key, value)`, `registerFeature(key, definition)`.

`FeatureRegistration` is `FeatureOptions<unknown>` plus `defaultValue: unknown`. Use the generic hook instead of manually casting callbacks. Legacy `registerReset(key, fn)` / `unregisterReset(key)` remain available; callbacks run before global state is cleared. They are not the primary effect lifecycle API. Callback owners must unregister their callback on teardown.

Exported types: `AccessibilityPluginProps`, `AccessibilityButtonProps`, `AccessibilityListProps`, `AccessibilityState`, `AccessibilityContextValue`, `PluginPosition`, `WidgetPlacement`, `FeatureOptions<T>`, `FeatureRegistration`, `ToggleControlProps`, `ChoiceControlProps`, `ChoiceOption<T>`, `ChoiceGroup<T>`, `StepperControlProps`, `FeatureCardProps`, `FeatureStatus`, `SearchCountProps`, `EmptyStateProps`, `ErrorStateProps`, `ProfilePreviewCardProps`, `FontSizeControllerProps`, `TextScaleControllerProps`, `TextScaleStep`, `FontFamilyPreset`, `ContrastModeValue`, `ContrastPalette`, `LineHeightControllerProps`, `LetterSpacingControllerProps`, `WordSpacingControllerProps`, `ParagraphSpacingControllerProps`, `ScriptSpacingConstraints`, `AccessibilityPreferences`, `ContrastMode`, `CursorSizePreference`, `FontFamilyPreference`, `ProfileDefinition`, `ProfilePresetId`, `ReaderMode`, `SaturationPreference`, `StorageMode`, `TextAlignPreference`, `LocaleStrings`.

Exported control components: `ToggleControl`, `ChoiceControl`, `StepperControl`, `FeatureCard`, `SearchCount`, `EmptyState`, `ErrorState`, `ProfilePreviewCard`, `FontSizeController`, `TextScaleController`, `LineHeightController`, `LetterSpacingController`, `WordSpacingController`, `ParagraphSpacingController`, `FontFamilyController`, `TextAlignController`, `ContrastController`, `ContrastModeController`.

Exported typography, contrast, and reflow utilities: `TEXT_SCALE_STEPS`, `TEXT_SCALE_PROTECTED_SELECTOR`, `isProtectedFromTextScale`, `LINE_HEIGHT_STEPS`, `LINE_HEIGHT_RATIOS`, `TEXT_SPACING_EXCLUDED_SELECTOR`, `isProtectedFromTextSpacing`, `getScriptSpacingConstraints`, `FONT_FAMILY_PRESETS`, `LEGIBLE_FONT_STACK`, `DYSLEXIA_FONT_STACK`, `FONT_FAMILY_PROTECTED_SELECTOR`, `isProtectedFromFontFamily`, `TEXT_ALIGN_BLOCK_SELECTOR`, `isProtectedFromTextAlign`, `CONTRAST_MODES`, `isForcedColorsActive`, `CONTRAST_PROTECTED_SELECTOR`, `isProtectedFromContrast`, `CONTRAST_PALETTES`.

Exported preference and profile utilities: `DEFAULT_PREFERENCES`, `PROFILE_DEFINITIONS`, `normalizePreferences`, `normalizePreferenceValue`, `resolveEffectivePreferences`, `preferencesReducer`, `createInitialPreferencesState`.

Exported localization utilities: `enLocale`, `registerLocale`, `resolveLocaleStrings`, `isRtlLocale`.

## Styling and labels

The package automatically injects its library CSS once when imported in a browser. The standalone stylesheet export is available when your application uses an explicit CSS pipeline. Load your overrides after the library CSS. It does not require Tailwind or set host `html`, `body`, universal resets, theme variables or heading defaults. `arap-` classes are the customization convention. Scope overrides to your panel class or `.arap-root` so they do not affect host controls:

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

## Movement and always-visible actions

The trigger is draggable by default. An 8px movement threshold distinguishes dragging from clicking; completing or cancelling a drag does not open the panel. Alt+arrow keys move it by 20px. The fixed “Move button” action also provides four corners, four click-to-move arrows, “Reset button position” and “Done moving”, so movement never requires a dragging gesture. Movement updates a polite status announcement.

Placement is either `{ kind: "corner", corner: "bottom-right" | "bottom-left" | "top-right" | "top-left" }` or `{ kind: "point", x: number, y: number }`, with normalized coordinates in [0,1]. It shares the provider's versioned persistence record under reserved key `__arap_widget_placement`; custom features must not use that key. Saved placement overrides the initial position prop. Without it, left means bottom-left, top means top-right, and right/bottom mean bottom-right. Resetting placement returns to the current prop. `persist={false}` disables saving and restoring placement as well as display settings.

Coordinates are clamped on resizing and account for the trigger's measured dimensions. The panel opens above or below the moved trigger within available viewport space. On short screens it uses the available screen height and temporarily hides the trigger while open, avoiding overlap with actions; Close/Escape restores the trigger and focus.

Only `.arap-tools` scrolls. The heading, Close, “Move button” and fixed action area stay accessible. A ResetController placed anywhere inside AccessibilityList (including nested composition) renders its button in that area without changing its effect ownership. It remains opt-in; no reset button is injected when it is omitted. Keyboard users can Tab from Close to “Jump to quick actions”, then activate it to focus reset/the first footer action. An open movement menu consumes Escape before the panel does.

Use `footer` for additional fixed actions. Keep actions concise and independently keyboard accessible. `draggable={false}` disables pointer/Alt+arrow movement on the trigger; the panel's explicit movement controls remain available. Consumer inline positioning styles override library geometry and should be tested with movement.
