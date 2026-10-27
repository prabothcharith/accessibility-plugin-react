# Keyboard Shortcuts, Collision-Checked Remapping & Link Explorer (`KeyboardShortcutsController` & `PageNavigatorController`)

The **Keyboard Shortcuts & Link Explorer** system (Issue #56, `A11Y-308`) provides discoverable shortcut cheat sheets, safe conflict-checked remapping, and comprehensive semantic link exploration across the host application.

---

## 1. Architectural Principles

1. **Global Shortcuts Off by Default**:
   - To respect WCAG 2.1.4 (Character Key Shortcuts) and avoid conflicting with screen reader or browser hotkeys, document-wide keyboard shortcuts are **disabled by default** (`shortcutsEnabled: false`).
   - Users can explicitly opt into global shortcuts via the native toggle switch inside the shortcuts modal.
2. **Never Hijack Browser Commands**:
   - Critical browser/system keys are blacklisted from being remapped or captured:
     - `Ctrl+U` / `Cmd+U` (view source)
     - `Ctrl+R` / `F5` (reload)
     - `Ctrl+T` (new tab), `Ctrl+W` (close tab), `Ctrl+N` (new window)
     - `Ctrl+P` (print), `Ctrl+F` (find), `Ctrl+S` (save)
     - `Ctrl+A`, `Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Ctrl+Z`, `Ctrl+Y`
     - Developer tools (`F12`, `Ctrl+Shift+I`)
3. **Form and Route Command Protection**:
   - `isFormFieldOrEditable(event.target)` detects if keystrokes originate within `<input>`, `<textarea>`, `<select>`, `[contenteditable="true"]`, or ARIA input roles (`role="textbox"`, `role="combobox"`, `role="searchbox"`).
   - Global shortcuts are immediately suppressed when typing into form fields or search inputs.
4. **Collision Detection**:
   - Proposed remappings are validated against all other active plugin shortcuts to prevent ambiguous duplicate activations.
   - Enforces a modifier key requirement (`Alt+Key`, `Ctrl+Alt+Key`, `Alt+Shift+Key`) so plain alphanumeric characters do not intercept text input.
5. **Button Alternatives**:
   - Every shortcut corresponds to a persistent, accessible, focusable UI button inside the plugin panel. Keyboard users who cannot press multi-key chords have 100% equivalent access.
6. **Semantic Link Explorer**:
   - Integrated into `PageNavigatorController` alongside Headings and Landmarks.
   - Identifies all `<a>` links on the page, distinguishing between internal anchors, same-origin pages, and external destinations (`target="_blank"` or cross-origin).
   - Automatically flags uninformative / ambiguous link text (e.g. "click here", "read more", "more", "learn more") that fails WCAG 2.4.4 / 2.4.9.
   - Provides safe scrolling and focus transfer via temporary `tabindex="-1"` without permanently mutating host DOM attributes.

---

## 2. Default Shortcuts Registry

| Action ID       | Action Label                    | Category   | Default Key | Can Remap   |
| :-------------- | :------------------------------ | :--------- | :---------- | :---------- |
| `toggleWidget`  | Toggle accessibility panel      | Widget     | `Alt+A`     | Yes         |
| `resetAll`      | Reset all display settings      | Widget     | `Alt+R`     | Yes         |
| `pageNavigator` | Page Structure & Links Explorer | Navigation | `Alt+N`     | Yes         |
| `skipToMain`    | Skip to main content landmark   | Navigation | `Alt+1`     | Yes         |
| `readingMode`   | Non-destructive Reading Mode    | Reading    | `Alt+M`     | Yes         |
| `profiles`      | Accessibility Profiles          | Tools      | `Alt+P`     | Yes         |
| `presets`       | Saved Presets                   | Tools      | `Alt+S`     | Yes         |
| `shortcutsHelp` | Keyboard Shortcuts Help         | Tools      | `Alt+K`     | Yes         |
| `closeDialog`   | Dismiss dialog or overlay       | Widget     | `Escape`    | No (locked) |

---

## 3. Link Explorer Features

The **Link Explorer** tab in `PageNavigatorController` inspects all active links (`<a href>`) on the host page:

- **Filtering**: Real-time search filter matching link text or destination URL.
- **Badges**:
  - `LINK`: Internal / relative same-origin link.
  - `ANCHOR`: On-page hash jump (`#id`).
  - `EXT`: External link (`target="_blank"` or cross-origin).
  - `Ambiguous`: Visual warning badge indicating non-descriptive link text (e.g. "click here", "read more").
- **Navigation**: Click or keyboard activation safely scrolls to and focuses the link in the host DOM.

---

## 4. Usage

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  KeyboardShortcutsController,
  PageNavigatorController,
} from "accessibility-plugin-react";

export function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <PageNavigatorController />
        <KeyboardShortcutsController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

---

## 5. Verification Matrix

- **Unit Tests**: `tests/shortcuts.test.ts` (16 tests) + `tests/linkExplorer.test.ts` (5 tests).
- **Integration Tests**: `tests/shortcutsWidget.test.tsx` (8 tests).
- **Browser Smoke Tests**: `tests/browser/widget.spec.ts` (`A11Y-308`).
- **Translations**: Fully localized in English, Sinhala (`si-LK`), and Tamil (`ta-LK`).
