# Public API

All exports are named from `accessibility-plugin-react`. JavaScript consumers receive compiled ESM/CJS; TypeScript consumers receive matching declarations. Importing the package automatically injects its scoped CSS in browser environments. The standalone `accessibility-plugin-react/style.css` export (historical `/dist/style.css` also works) remains available for applications that require an explicit stylesheet pipeline.

## Components

| Component                            | Props                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AccessibilityPlugin                  | `children: ReactNode` required; `position?: 'left' \| 'right' \| 'top' \| 'bottom'` default right; `persistenceKey?: string` default `react-accessibility-plugin:state`; `persist?: boolean` default true; `storage?: 'local' \| 'session' \| 'none'` default local; `locale?: string`; `statementUrl?: string`; `largeControls?: boolean` default false                                                                               |
| AccessibilityButton                  | `draggable?: boolean` default true (pointer/Alt+arrow movement); `icon?: ReactNode` default inline accessibility SVG; `title?: string` accessible name, default Accessibility; `description?: string` supplementary accessible description; `className?: string`; `style?: CSSProperties`; `largeControls?: boolean`                                                                                                                   |
| AccessibilityList                    | `footer?: ReactNode` extra fixed actions; `children?: ReactNode` optional; `menuConfig?: MenuCustomizationConfig` optional; `title?: string` visible heading and region name, default Accessibility settings; `description?: string` default Adjust your reading experience; `closeLabel?: string` default Close; `statementUrl?: string`; `largeControls?: boolean`; `locale?: string`; `className?: string`; `style?: CSSProperties` |
| FeatureMenu                          | `config?: MenuCustomizationConfig`; `grouped?: boolean` default false; `className?: string`. Renders an ordered, validated, and optionally grouped accessibility menu with non-crashing diagnostics and stable rerenders. See docs/MENU_CUSTOMIZATION.md.                                                                                                                                                                              |
| FeatureCard                          | `title: ReactNode` required; `children: ReactNode` required; `featureKey?: string`; `icon?: ReactNode`; `description?: ReactNode`; `statusBadge?: string`; `status?: 'idle' \| 'active' \| 'error' \| 'unavailable' \| 'permission-required'`; `errorMessage?: string`; `unavailableMessage?: string`; `permissionMessage?: string`; `onRequestPermission?: () => void`; `largeControls?: boolean`                                     |
| ToggleControl                        | `label: ReactNode` required; `checked: boolean` required; `onChange: (checked: boolean) => void` required; `disabled?: boolean`; `unavailable?: boolean`; `unavailableReason?: string`; `largeControls?: boolean`                                                                                                                                                                                                                      |
| ChoiceControl                        | `label: string` required; `value: T` required; `options?: ChoiceOption<T>[]`; `groups?: ChoiceGroup<T>[]`; `onChange: (value: T) => void` required; `disabled?: boolean`; `largeControls?: boolean`                                                                                                                                                                                                                                    |
| StepperControl                       | `label: string` required; `value: number` required; `min: number`; `max: number`; `step: number`; `unit?: string` default '%'; `showSlider?: boolean`; `formatValue?: (val: number) => string`; `onChange: (value: number) => void` required; `disabled?: boolean`; `largeControls?: boolean`                                                                                                                                          |
| ProfilePreviewCard                   | `profile: ProfileDefinition` required; `isActive: boolean` required; `onApply: (profile: ProfileDefinition) => void` required; `onRevert: () => void` required; `largeControls?: boolean`                                                                                                                                                                                                                                              |
| TextScaleController                  | `steps?: readonly number[]` default `[1.0, 1.125, 1.25, 1.5, 2.0]`; `label?: string` default `Bigger Text`. Stepped text scaling without transforms.                                                                                                                                                                                                                                                                                   |
| FontSizeController                   | Optional `stepScale?: boolean` (snaps to WCAG 1x–2x reflow steps); `steps?: readonly number[]` (custom steps); or omitted for continuous 10% steps. Protects forms, code, and icons.                                                                                                                                                                                                                                                   |
| LineHeightController                 | Optional `stepPresets?: boolean` (snaps to WCAG 1.0x, 1.5x, 1.75x, 2.0x); `steps?: readonly number[]` (custom steps); or omitted for 10% steps. Excludes tables, code, and controls.                                                                                                                                                                                                                                                   |
| LetterSpacingController              | Optional `min`, `max`, `step`, `steps`. Excludes tables and code blocks; respects language-aware limits (disables on cursive/Arabic, clamps <=1px on Indic/Sinhala/Tamil).                                                                                                                                                                                                                                                             |
| WordSpacingController                | Optional `min`, `max`, `step`, `steps` (default 0–10px, step 1). Excludes tables, code blocks, controls, and widget UI.                                                                                                                                                                                                                                                                                                                |
| ParagraphSpacingController           | Optional `min`, `max`, `step`, `steps` (default 0–32px, step 4). Increases bottom margin on `p` and `[role="paragraph"]`.                                                                                                                                                                                                                                                                                                              |
| PageNavigatorController              | Optional `title?: string`, `headingsLabel?: string`, `landmarksLabel?: string`, `searchPlaceholder?: string`, `largeControls?: boolean`. Interactive headings and landmarks navigator with safe focus and live updates. Aliases: `HeadingsNavigatorController`, `PageStructureController`. See docs/PAGE_NAVIGATOR.md.                                                                                                                 |
| ProfilesController                   | Optional `label?: string`, `description?: string`, `largeControls?: boolean`, `onProfileChange?: (id) => void`. Previews, applies, and reverts eight neutral presets with deterministic override model. Aliases: `ProfileController`, `AccessibilityProfilesController`. See docs/PROFILES.md.                                                                                                                                         |
| PresetsController                    | Optional `className?: string`, `label?: string`, `description?: string`, `largeControls?: boolean`. Saves named custom presets and handles versioned JSON import/export with privacy exclusions. Aliases: `CustomPresetsController`, `SettingsImportExportController`, `PresetsBackupController`. See docs/PRESETS.md.                                                                                                                 |
| ReadAloudController                  | Optional `className?: string`, `label?: string`, `description?: string`, `onStart?: () => void`, `onEnd?: () => void`, `onError?: (error: Error) => void`. User-initiated client-side text-to-speech read-aloud via Web Speech API (`speechSynthesis`). See docs/READ_ALOUD.md.                                                                                                                                                        |
| DictionaryController                 | Optional `className?: string`, `label?: string`, `description?: string`, `provider?: DictionaryProvider                                                                                                                                                                                                                                                                                                                                | null`, `defaultOpen?: boolean`, `initialTerm?: string`. Accessible dictionary lookup dialog with zero network requests by default, local glossaries, and sanitization. See docs/DICTIONARY.md. |
| VoiceNavigationController            | Optional `className?: string`, `label?: string`, `description?: string`. Opt-in research prototype controller enabling browser-native speech commands with inactivity watchdog and keyboard fallback buttons. See docs/VOICE_NAVIGATION.md.                                                                                                                                                                                            |
| TranslationController                | Optional `className?: string`, `label?: string`, `description?: string`, `provider?: TranslationAdapter`, `defaultTargetLanguage?: string`. Host-content translation adapter prototype with explicit consent, privacy boundaries, sensitive element exclusion, and DOM restoration. See docs/TRANSLATION.md.                                                                                                                           |
| All other controllers in FEATURES.md | Pick/omit in JSX. For custom labels or behavior, compose a control with useAccessibility or the modular control primitives.                                                                                                                                                                                                                                                                                                            |

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

Exported types: `AccessibilityPluginProps`, `AccessibilityButtonProps`, `AccessibilityListProps`, `AccessibilityState`, `AccessibilityContextValue`, `PluginPosition`, `WidgetPlacement`, `FeatureOptions<T>`, `FeatureRegistration`, `ToggleControlProps`, `ChoiceControlProps`, `ChoiceOption<T>`, `ChoiceGroup<T>`, `StepperControlProps`, `FeatureCardProps`, `FeatureStatus`, `SearchCountProps`, `EmptyStateProps`, `ErrorStateProps`, `ProfilePreviewCardProps`, `FontSizeControllerProps`, `TextScaleControllerProps`, `TextScaleStep`, `FontFamilyPreset`, `ContrastModeValue`, `ContrastPalette`, `LineHeightControllerProps`, `LetterSpacingControllerProps`, `WordSpacingControllerProps`, `ParagraphSpacingControllerProps`, `ScriptSpacingConstraints`, `SkipToMainLinkProps`, `HideImagesControllerProps`, `BigCursorControllerProps`, `ReadingMaskControllerProps`, `ReadingGuideControllerProps`, `TooltipsControllerProps`, `PageNavigatorControllerProps`, `HeadingItem`, `LandmarkItem`, `LinkItem`, `ProfilesControllerProps`, `ActiveProfileState`, `UseProfilesResult`, `AccessibilityPreferences`, `ContrastMode`, `CursorSizePreference`, `FontFamilyPreference`, `ProfileDefinition`, `ProfilePresetId`, `ReaderMode`, `SaturationPreference`, `StorageMode`, `TextAlignPreference`, `LocaleStrings`, `SupportedLocale`, `FeatureLocaleLabels`, `PresetsControllerProps`, `CustomPreset`, `PresetsExportV1`, `ImportResult`, `UsePresetsResult`, `ReadingModeControllerProps`, `ArticleContent`, `KeyboardShortcutsControllerProps`, `ShortcutDefinition`, `ValidationResult`, `ReadAloudControllerProps`, `ReadAloudOptions`, `ReadAloudState`, `SaturationControllerProps`, `GrayscaleControllerProps`, `DictionaryControllerProps`, `DictionaryEntry`, `DictionaryLookupResult`, `DictionaryProvider`, `FeatureMenuProps`, `FeatureMenuItemConfig`, `FeatureMenuGroupConfig`, `MenuCustomizationConfig`, `MenuValidationIssue`, `MenuValidationResult`, `NormalizedMenuConfig`, `NormalizedMenuItem`, `NormalizedMenuGroup`, `VoiceNavigationControllerProps`, `VoiceNavigationStatus`, `VoiceCommandId`, `VoiceCommandDefinition`, `VoiceNavigationResult`, `VoiceNavigationOptions`, `VoiceNavigationSession`, `VoiceExecutionContext`, `TranslationControllerProps`, `TranslationAdapter`, `TranslationRequest`, `TranslationResponse`, `TranslatedItem`, `DataRetentionPolicy`, `TranslationConsentStatus`, `TranslationConsentRecord`, `TranslatableNode`, `TranslationSession`, `TranslationErrorCode`.

Exported control components: `ToggleControl`, `ChoiceControl`, `StepperControl`, `FeatureCard`, `SearchCount`, `EmptyState`, `ErrorState`, `ProfilePreviewCard`, `FontSizeController`, `TextScaleController`, `LineHeightController`, `LetterSpacingController`, `WordSpacingController`, `ParagraphSpacingController`, `FontFamilyController`, `TextAlignController`, `ContrastController`, `ContrastModeController`, `LinkHighlightController`, `HighlightFocusController`, `FocusHighlightController`, `ReduceMotionController`, `HideImagesController`, `HideDecorativeImagesController`, `BigCursorController`, `ReadingMaskController`, `ReadingGuideController`, `TooltipsController`, `AccessibleTooltipsController`, `PageNavigatorController`, `HeadingsNavigatorController`, `PageStructureController`, `ProfilesController`, `ProfileController`, `AccessibilityProfilesController`, `PresetsController`, `CustomPresetsController`, `SettingsImportExportController`, `PresetsBackupController`, `ReadingModeController`, `KeyboardShortcutsController`, `ReadAloudController`, `DictionaryController`, `VoiceNavigationController`, `TranslationController`, `FeatureMenu`, `SkipToMainLink`.

Exported typography, contrast, reading aids, tooltips, reading mode, read aloud, reflow, and menu customization utilities: `TEXT_SCALE_STEPS`, `TEXT_SCALE_PROTECTED_SELECTOR`, `isProtectedFromTextScale`, `LINE_HEIGHT_STEPS`, `LINE_HEIGHT_RATIOS`, `TEXT_SPACING_EXCLUDED_SELECTOR`, `isProtectedFromTextSpacing`, `getScriptSpacingConstraints`, `FONT_FAMILY_PRESETS`, `LEGIBLE_FONT_STACK`, `DYSLEXIA_FONT_STACK`, `FONT_FAMILY_PROTECTED_SELECTOR`, `isProtectedFromFontFamily`, `TEXT_ALIGN_BLOCK_SELECTOR`, `isProtectedFromTextAlign`, `CONTRAST_MODES`, `isForcedColorsActive`, `subscribeForcedColors`, `isReducedMotionActive`, `subscribeReducedMotion`, `isEligibleDecorativeImage`, `isFunctionalOrMeaningfulImage`, `hasFinePointer`, `subscribeFinePointer`, `nudgeReadingAid`, `DEFAULT_READING_MASK_HEIGHT`, `MIN_READING_MASK_HEIGHT`, `MAX_READING_MASK_HEIGHT`, `READING_MASK_HEIGHT_PRESETS`, `getAuthoredDescription`, `positionTooltip`, `enableAccessibleTooltips`, `scanHeadings`, `scanLandmarks`, `scanLinks`, `navigateToElement`, `subscribePageStructure`, `useProfiles`, `ALL_PROFILE_IDS`, `getProfileDefinition`, `mapProfileSettingsToFeatures`, `mapFeaturesToProfileSettings`, `applyProfileToStore`, `revertProfileFromStore`, `recordProfileOverride`, `usePresets`, `createCustomPreset`, `isValidCustomPreset`, `exportPresetsToJson`, `downloadJsonFile`, `validateAndParseImport`, `applyCustomPresetToStore`, `sanitizePreferences`, `ALLOWED_PREFERENCE_KEYS`, `extractArticleContent`, `findArticleCandidate`, `countWords`, `estimateReadingTime`, `CONTRAST_PROTECTED_SELECTOR`, `isProtectedFromContrast`, `CONTRAST_PALETTES`, `findMainLandmark`, `DEFAULT_SHORTCUTS`, `RESERVED_BROWSER_SHORTCUTS`, `normalizeKeyCombo`, `parseKeyboardEventToCombo`, `isFormFieldOrEditable`, `validateShortcutRemap`, `resolveActiveShortcut`, `isSpeechSynthesisSupported`, `getSpeechVoices`, `subscribeSpeechVoices`, `getActiveSelectionText`, `extractReadAloudText`, `splitTextIntoChunks`, `ReadAloudSession`, `READ_ALOUD_EXCLUDED_SELECTORS`, `sanitizeLookupTerm`, `lookupLocalDictionary`, `lookupWord`, `LOCAL_DICTIONARY_EN`, `LOCAL_DICTIONARY_SI`, `LOCAL_DICTIONARY_TA`, `validateMenuConfig`, `getMenuConfigSignature`, `KNOWN_FEATURE_IDS`, `DEFAULT_MENU_GROUPS`, `DEFAULT_FEATURE_GROUP_MAP`.

Exported preference and profile utilities: `DEFAULT_PREFERENCES`, `PROFILE_DEFINITIONS`, `normalizePreferences`, `normalizePreferenceValue`, `resolveEffectivePreferences`, `preferencesReducer`, `createInitialPreferencesState`.

Exported localization utilities: `enLocale`, `siLocale`, `taLocale`, `registerLocale`, `resolveLocaleStrings`, `isRtlLocale`.

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

## Integration Diagnostics and Harness (A11Y-405)

### `AccessibilityPluginProps.diagnostics`

- Type: `boolean | DiagnosticsConfig`
- In development (`NODE_ENV === "development"`), when set to `true` or configured via `DiagnosticsConfig`, executes integration diagnostics on mount and logs findings to the developer console.

### `<DiagnosticsHarness />`

Floating developer panel component for inspecting diagnostics findings:

```tsx
import { DiagnosticsHarness } from "accessibility-plugin-react";

<DiagnosticsHarness
  force={false} // Set to true to force display even in production
  defaultOpen={false} // Whether drawer starts open
  config={{ categories: ["provider", "host-css", "csp", "dom"] }}
/>;
```

### `runDiagnostics(config?: DiagnosticsConfig): DiagnosticsReport`

Synchronous diagnostics runner returning a structured report:

```ts
interface DiagnosticsReport {
  timestamp: number;
  environment: "development" | "production" | "test";
  disclaimer: string;
  summary: { total: number; errors: number; warnings: number; info: number };
  issues: DiagnosticIssue[];
}
```

### `useDiagnostics(config?: DiagnosticsConfig): DiagnosticsReport`

React hook returning reactive diagnostics reports.

## Privacy-Safe Feature Event Callbacks (A11Y-406)

### `AccessibilityPluginProps.onFeatureEvent`

- Type: `(event: AccessibilityFeatureEvent) => void`
- Optional local lifecycle callback triggered on user interactions (toggles, steppers, resets, profiles, presets, panel visibility, placement). Disabled by default.

### `AccessibilityFeatureEvent` Types

```ts
type AccessibilityFeatureEvent =
  | FeatureChangeEvent
  | FeatureResetEvent
  | PanelToggleEvent
  | PlacementChangeEvent
  | ProfileApplyEvent
  | PresetApplyEvent;
```

### `sanitizeFeatureEvent(raw: AccessibilityFeatureEvent): AccessibilityFeatureEvent`

Sanitizes and freezes event payloads against an allowlist, stripping forbidden or private fields.

## Smart Contrast Research Prototype (A11Y-407)

### `<SmartContrastController />`

Opt-in research prototype controller providing measured contrast evaluation and enhancement:

- Segmented buttons: `Original` (`off`), `AA (4.5:1)` (`aa`), `AAA (7.0:1)` (`aaa`).
- Displays live statistics (elements evaluated, adjusted, sufficient, unsupported).
- Inspectable unsupported elements list detailing skipped items (gradients, background images, backdrop filters).
- Prototype badge and `SMART_CONTRAST_DISCLAIMER` notice.
- Yields to operating system `forced-colors: active`.

### `evaluateSmartContrast(options?: SmartContrastOptions): SmartContrastReport`

Evaluates contrast ratios across all eligible text elements without mutating the DOM:

- `targetLevel`: `"aa"` (default) or `"aaa"`.
- `root`: Root element container (defaults to `document.body`).
- `maxElements`: Evaluation cap (default: 2000).

### `applySmartContrast(options?: SmartContrastOptions): AppliedSmartContrast`

Batched evaluation and non-destructive application of high-contrast replacement colors:

- Returns `{ report: SmartContrastReport, undo: () => void }`.
- `undo()` completely restores original styles and priorities; idempotent and clean.

### Core Mathematical Functions

- `calculateRelativeLuminance(r: number, g: number, b: number): number`: Computes WCAG 2.1 relative luminance with sRGB linearization ($0.0$–$1.0$).
- `calculateContrastRatio(l1: number, l2: number): number`: Computes WCAG 2.1 contrast ratio $(L_1 + 0.05) / (L_2 + 0.05)$ ($1.0$–$21.0$).
- `compositeRgba(fg: RgbaColor, bg: RgbaColor): RgbaColor`: Porter-Duff source-over alpha blending.
- `parseColor(colorStr: string): RgbaColor | null`: CSS color string parser with LRU memoization.
- `resolveEffectiveBackdrop(element: HTMLElement): BackdropResolution`: Resolves effective background color by climbing ancestor chain, detecting unsupported gradients, background images, and backdrop filters.
- `SMART_CONTRAST_DISCLAIMER`: Constant string disclaimer emphasizing prototype status and zero automatic WCAG compliance claims.

## Voice Navigation Research Prototype (A11Y-408)

### `<VoiceNavigationController />`

Opt-in research prototype controller enabling browser-native speech commands:

- Start/Stop toggle button with pulsating microphone indicator.
- Polite live status region (`aria-live="polite"`) announcing active listening and recognized commands.
- 30-second silence watchdog timeout and background tab (`document.hidden`) protection.
- Collapsible supported commands cheat sheet detailing spoken phrases.
- Fully operational accessible keyboard fallback buttons ("Next Heading", "Prev Heading", "Scroll Down", "Scroll Up", "Scroll Top", "Scroll Bottom").
- Prototype badge and `VOICE_NAVIGATION_DISCLAIMER` notice.

### `isSpeechRecognitionSupported(): boolean`

Returns whether native Web Speech Recognition (`SpeechRecognition` or `webkitSpeechRecognition`) is available in the current browser.

### `createVoiceNavigationSession(options?: VoiceNavigationOptions): VoiceNavigationSession`

Creates a managed speech recognition session with lifecycle, timeout, and privacy management:

- `start()`: Initiates speech recognition session.
- `stop()`: Halts session cleanly.
- `abort()`: Aborts session immediately.
- `destroy()`: Removes all event listeners, watchdog timers, and references.
- `getStatus(): VoiceNavigationStatus`: Current status (`idle`, `listening`, `processing`, `unsupported`, `denied`, `timeout`, `error`).
- `getLastResult(): VoiceNavigationResult | null`: Transient last recognized command and feedback.

### `matchVoiceCommand(transcript: string): { command: VoiceCommandDefinition | null; normalized: string }`

Matches a raw speech transcript against the supported command vocabulary with punctuation stripping and multi-word phrase boundary checking.

### `executeVoiceCommand(commandId: VoiceCommandId, context?: VoiceExecutionContext): { success: boolean; feedback: string }`

Executes a voice command safely without destructive operations, respecting user reduced motion preferences (`prefers-reduced-motion`).

### Constants

- `VOICE_COMMANDS`: Array of supported `VoiceCommandDefinition` objects (`open_widget`, `close_widget`, `next_heading`, `previous_heading`, `first_heading`, `scroll_down`, `scroll_up`, `scroll_top`, `scroll_bottom`, `stop_listening`, `help`).
- `VOICE_NAVIGATION_DISCLAIMER`: Constant string disclaimer stating voice commands are experimental with zero audio/transcript storage.

## Host-Content Translation Adapter Architecture (A11Y-409)

### `<TranslationController />`

Opt-in research prototype controller enabling host application content translation:

- Prototype badge and `TRANSLATION_DISCLAIMER` notice.
- Adapter metadata display: active provider name, data retention policy, data residency location, and privacy policy link.
- Explicit user consent banner and modal: requires user acknowledgment before transmitting any host document text.
- Target language dropdown selector with standard language options.
- Translate Page button with loading indicator.
- Restore Original button immediately reverting translated text nodes back to original host strings.
- Revoke Translation Consent button reverting translations and returning to unconsented state.
- Screen-reader live status updates (`aria-live="polite"`).

### Core Functions & Interfaces

- `isSensitiveElement(element: Element | null): boolean`: Evaluates whether an element or ancestor contains sensitive data (passwords, auth tokens, financial fields, PII inputs, code blocks, media elements, iframes, opt-out tags, or the widget UI).
- `extractTranslatableNodes(root: Element, maxNodes?: number): TranslatableNode[]`: Traverses DOM tree starting from root and collects translatable text nodes, strictly skipping sensitive elements.
- `sanitizeTranslationOutput(raw: string): string`: Sanitizes translated strings, stripping control characters and null bytes.
- `applyTranslations(nodes: TranslatableNode[], translations: string[]): () => void`: Safely assigns translated strings to text nodes via `textContent` and returns an idempotent restore callback.
- `createOfflineMockTranslationAdapter(options?): TranslationAdapter`: Creates a local offline mock translation adapter operating with zero network requests.
- `translateHostContent(options): Promise<TranslationSession>`: Coordinates end-to-end translation, enforcing consent, provider language support, sensitive element exclusion, and DOM restoration.
- `TRANSLATION_DISCLAIMER`: Constant string disclaimer emphasizing prototype status and zero official WCAG compliance claims.
- `TRANSLATION_ERROR_CODES`: Standard error code constants (`CONSENT_REQUIRED`, `NO_PROVIDER`, `UNSUPPORTED_LANGUAGE`, `NETWORK_ERROR`, `CSP_BLOCKED`, `RATE_LIMITED`, `SANITIZATION_FAILED`, `SENSITIVE_CONTENT_BLOCKED`, `DOM_MUTATION_ERROR`, `ABORTED`).
