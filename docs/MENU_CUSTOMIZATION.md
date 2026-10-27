# Per-Site Feature-Menu Customization and Reordering (A11Y-404)

`accessibility-plugin-react` provides declarative per-site feature menu customization and reordering via `menuConfig` and the `FeatureMenu` component. Sites can tailor the order of features, configure custom labels and descriptions, organize tools into categorized group sections, provide suggested defaults, and toggle feature visibility—without end-user crashes or focus thrashing.

---

## Key Principles & Guarantees

1. **Non-Crashing Diagnostic Safety**:
   - Malformed, null, undefined, or primitive configurations never throw runtime exceptions or break the host application.
   - The engine validates configuration, emits structured `MenuValidationIssue[]` diagnostics (and development `console.warn` notifications), and falls back gracefully to a fully functional default menu.

2. **Stable Rerenders & Focus Preservation**:
   - Controllers maintain canonical React keys (`key={item.id}`).
   - State updates in parent components do not thrash focus, cause active inputs to lose focus, or unmount running features.

3. **Accessibility Guarantees & Unreachable Action Warnings**:
   - Emits developer warnings if `showReset === false` or if `reset` is omitted, cautioning that users may be unable to return their display settings to baseline defaults.
   - Emits warnings if all features are disabled (`EMPTY_MENU`).
   - Group sections are rendered as accessible landmark groups (`<section role="group" aria-labelledby="...">`) with semantic headings.

4. **Preserved Canonical IDs**:
   - All 30 built-in canonical feature IDs are supported and mapped to their native controllers.
   - Custom features outside the 30 canonical IDs are preserved and rendered via optional `component` overrides.

---

## Configuration API: `MenuCustomizationConfig`

```tsx
interface MenuCustomizationConfig {
  /**
   * List of feature items to render, order, or configure.
   * Can be strings (feature IDs) or detailed FeatureMenuItemConfig objects.
   */
  items?: (string | FeatureMenuItemConfig)[];

  /** Custom visual groups / sections for organized menu layout. */
  groups?: FeatureMenuGroupConfig[];

  /** Whether to render features organized into visual group sections. Defaults to false (flat list). */
  grouped?: boolean;

  /** Suggested default values on initial mount if not already saved. */
  suggestedDefaults?: Record<string, unknown>;

  /** Visibility of Accessibility Profiles controller. Defaults to true. */
  showProfiles?: boolean;

  /** Visibility of site accessibility statement link. Defaults to true. */
  showStatement?: boolean;

  /** Visibility of the Reset All action button. Defaults to true. */
  showReset?: boolean;

  /** Visibility of keyboard shortcuts help controller. Defaults to true. */
  showShortcutsHelp?: boolean;

  /** Visibility of button position movement controls. Defaults to true. */
  showPositionControls?: boolean;

  /** Optional callback invoked with validation issues. */
  diagnosticsCallback?: (issues: MenuValidationIssue[]) => void;

  /** When true, logs diagnostics to console.warn in development mode. Defaults to true. */
  enableLogging?: boolean;
}
```

### Feature Item Configuration: `FeatureMenuItemConfig`

```tsx
interface FeatureMenuItemConfig {
  /** Canonical feature identifier (e.g. "fontSize", "contrast", "readAloud"). */
  id: string;

  /** Whether the feature is enabled and rendered in the menu. Defaults to true. */
  enabled?: boolean;

  /** Explicit display order weight. Smaller numbers appear first. */
  order?: number;

  /** Optional custom accessible label or title override. */
  label?: string;

  /** Optional custom accessible description or subtitle. */
  description?: string;

  /** Group / category identifier for grouping controls. */
  group?: string;

  /** Suggested default value on initial mount if not already saved. */
  suggestedDefault?: unknown;

  /** Custom props passed directly to the controller component. */
  props?: Record<string, unknown>;

  /** Optional custom React component to render instead of the standard controller. */
  component?: React.ComponentType<Record<string, unknown>>;
}
```

---

## Canonical Feature IDs

The 30 built-in canonical feature IDs are:
`textScale`, `fontSize`, `lineHeight`, `letterSpacing`, `wordSpacing`, `paragraphSpacing`, `contrast`, `contrastMode`, `saturation`, `invertColors`, `grayscale`, `linkHighlight`, `highlightFocus`, `reduceMotion`, `textAlign`, `fontFamily`, `hideImages`, `hideVideos`, `bigCursor`, `readingMask`, `readingGuide`, `tooltips`, `pageNavigator`, `profiles`, `presets`, `readingMode`, `keyboardShortcuts`, `readAloud`, `dictionary`, `reset`.

---

## Usage Examples

### 1. Simple Custom Reordering via `AccessibilityList`

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
} from "accessibility-plugin-react";

export function CustomOrderApp() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList
        menuConfig={{
          items: [
            { id: "readAloud", order: 1 },
            { id: "dictionary", order: 2 },
            { id: "fontSize", order: 3 },
            { id: "contrast", order: 4 },
            { id: "reset", order: 5 },
          ],
        }}
      />
    </AccessibilityPlugin>
  );
}
```

### 2. Grouped Layout with Section Headings

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
} from "accessibility-plugin-react";

export function GroupedMenuApp() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList
        menuConfig={{
          grouped: true,
          groups: [
            {
              id: "readingAssistance",
              title: "Reading & Speech",
              description: "Audio read-aloud and word definitions",
              order: 1,
            },
            {
              id: "visualAdjustments",
              title: "Visual Appearance",
              description: "Text size and color contrast",
              order: 2,
            },
          ],
          items: [
            { id: "readAloud", group: "readingAssistance" },
            { id: "dictionary", group: "readingAssistance" },
            { id: "fontSize", group: "visualAdjustments", label: "Text Scale" },
            { id: "contrast", group: "visualAdjustments" },
          ],
        }}
      />
    </AccessibilityPlugin>
  );
}
```

### 3. Standalone `FeatureMenu` in Custom Panels

```tsx
import { FeatureMenu, validateMenuConfig } from "accessibility-plugin-react";

export function CustomPanel() {
  const config = {
    items: [
      { id: "fontSize", label: "Magnification" },
      { id: "grayscale", label: "Black & White" },
    ],
  };

  // Optional pre-validation
  const { valid, issues } = validateMenuConfig(config);

  return (
    <div className="my-custom-accessibility-sheet">
      <FeatureMenu config={config} />
    </div>
  );
}
```

---

## Validation Diagnostics

`validateMenuConfig(config)` evaluates configuration without throwing:

| Diagnostic Code         | Type      | Description                                                        |
| ----------------------- | --------- | ------------------------------------------------------------------ |
| `INVALID_CONFIG_TYPE`   | `error`   | Config is not an object or null; default fallback applied.         |
| `UNKNOWN_FEATURE_ID`    | `info`    | ID is not built-in; preserved as custom feature item.              |
| `DUPLICATE_FEATURE_ID`  | `warning` | Feature ID is duplicated; subsequent duplicates ignored.           |
| `INVALID_DEFAULT_VALUE` | `warning` | Suggested default fails schema validation; default cleared.        |
| `UNREACHABLE_RESET`     | `warning` | Reset action disabled or omitted; users may lose default baseline. |
| `EMPTY_MENU`            | `warning` | All menu features are disabled.                                    |
| `INVALID_GROUP_CONFIG`  | `warning` | Group entry missing a valid `id` string.                           |
