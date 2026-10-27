# Custom Saved Presets and Settings Import/Export (A11Y-305)

The `accessibility-plugin-react` library includes user-editable custom presets and versioned JSON backup and transfer capabilities. Users can save their preferred combination of accessibility preferences under a meaningful name, re-apply them with a single click, and export or import them across browsers and devices.

---

## 1. Core Principles & Guardrails

- **Privacy Exclusions**: Presets and exported JSON files contain **only** validated accessibility settings. Private personal data, page contents, form inputs, session tokens, user credentials, transcripts, and recordings are **strictly excluded**.
- **Deterministic Storage & Reset Survival**: Custom presets are preserved across "Reset All" display resets. While display reset restores visual features to their initial values, the user's saved preset library remains intact unless individually deleted.
- **Stable IDs**: Each preset receives a persistent, stable identifier (`preset_<timestamp>_<random>`) that is retained during import and deduplicated upon merging.
- **Versioned Envelope**: Presets are exported in a standard, versioned envelope (`version: 1`) with schema references, export timestamps, and application identity.
- **Robust Error Handling**: Imports strictly validate incoming data, accepting valid v1 envelopes, legacy arrays, and flat settings objects, while returning clear, descriptive user-facing errors on syntax issues or unsupported future versions.

---

## 2. Versioned JSON Schema (v1)

```json
{
  "$schema": "https://accessibility-plugin.org/schemas/presets-v1.json",
  "version": 1,
  "app": "accessibility-plugin-react",
  "exportedAt": "2026-10-27T08:00:00.000Z",
  "presets": [
    {
      "id": "preset_1730000000000_a1b2c3",
      "name": "Evening Low Strain",
      "createdAt": "2026-10-27T08:00:00.000Z",
      "settings": {
        "fontScale": 1.25,
        "lineHeight": 1.5,
        "contrastMode": "dark",
        "reduceMotion": true,
        "highlightLinks": true
      }
    }
  ],
  "currentSettings": {
    "contrastMode": "dark",
    "fontScale": 1.25
  }
}
```

---

## 3. Supported Import Formats

| Format                   | Structure                                                                    | Behavior                                                                                                 |
| ------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Version 1 Envelope**   | Object with `version: 1`, `presets: [...]`, and optional `currentSettings`   | Validates schema, imports presets (deduped by ID), and applies current settings if present.              |
| **Legacy Preset Array**  | Array of objects `[{ id, name, settings }, ...]`                             | Automatically migrates into valid presets, generating IDs and timestamps if missing.                     |
| **Flat Settings Object** | Object with key-value preferences `{ fontScale: 1.2, contrastMode: "high" }` | Applies settings to active feature store as imported settings.                                           |
| **Unsupported Version**  | Object with `version > 1`                                                    | Rejects with clear message: _"Unsupported schema version: version X is newer than supported version 1."_ |
| **Malformed JSON**       | Invalid syntax or non-object content                                         | Rejects with syntax error message without corrupting state or store.                                     |

---

## 4. Components & Hooks

### `<PresetsController />`

Renders an accessible custom preset manager inside the widget list:

- Save current configuration as a new named preset.
- Browse saved presets with affected settings summary chips.
- 1-click **Apply** and **Delete** actions.
- **Export JSON** to download a backup file.
- **Import JSON** file picker supporting `.json` files.
- Live announcements with `role="status"` and `aria-live="polite"` for screen readers.

Aliases:

- `CustomPresetsController`
- `SettingsImportExportController`
- `PresetsBackupController`

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  PresetsController,
} from "accessibility-plugin-react";

export function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <PresetsController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### `usePresets()` Hook

Headless hook to interact with presets and import/export programmatically:

```tsx
import { usePresets } from "accessibility-plugin-react";

function CustomPresetUI() {
  const {
    presets,
    saveCurrentAsPreset,
    applyPreset,
    deletePreset,
    downloadExport,
    importFromFile,
  } = usePresets();

  return (
    <div>
      <button onClick={() => saveCurrentAsPreset("My Custom Setup")}>
        Save Preset
      </button>
      <button onClick={() => downloadExport()}>Export Backup</button>
      <ul>
        {presets.map((p) => (
          <li key={p.id}>
            <span>{p.name}</span>
            <button onClick={() => applyPreset(p.id)}>Apply</button>
            <button onClick={() => deletePreset(p.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```
