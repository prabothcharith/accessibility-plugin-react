/**
 * Keyboard shortcuts registry, collision detection, and form protection.
 *
 * Implements A11Y-308:
 * - Discoverable, localized shortcut help
 * - Collision-checked remapping
 * - Never hijacks browser shortcuts (e.g. Ctrl+U, Ctrl+R, Ctrl+T, Ctrl+W, F5)
 * - Keeps global shortcuts disabled by default
 * - Form and route command protection: never intercepts keystrokes inside inputs or textareas
 * - Button alternatives provided for every shortcut
 */

export interface ShortcutDefinition {
  id: string;
  category: "widget" | "navigation" | "reading" | "tools";
  labelKey: string;
  descriptionKey: string;
  defaultKey: string;
  allowRemap: boolean;
}

export const DEFAULT_SHORTCUTS: ShortcutDefinition[] = [
  {
    id: "toggleWidget",
    category: "widget",
    labelKey: "shortcutToggleWidget",
    descriptionKey: "shortcutToggleWidgetDesc",
    defaultKey: "Alt+A",
    allowRemap: true,
  },
  {
    id: "resetAll",
    category: "widget",
    labelKey: "shortcutResetAll",
    descriptionKey: "shortcutResetAllDesc",
    defaultKey: "Alt+R",
    allowRemap: true,
  },
  {
    id: "pageNavigator",
    category: "navigation",
    labelKey: "shortcutPageNavigator",
    descriptionKey: "shortcutPageNavigatorDesc",
    defaultKey: "Alt+N",
    allowRemap: true,
  },
  {
    id: "skipToMain",
    category: "navigation",
    labelKey: "shortcutSkipToMain",
    descriptionKey: "shortcutSkipToMainDesc",
    defaultKey: "Alt+1",
    allowRemap: true,
  },
  {
    id: "readingMode",
    category: "reading",
    labelKey: "shortcutReadingMode",
    descriptionKey: "shortcutReadingModeDesc",
    defaultKey: "Alt+M",
    allowRemap: true,
  },
  {
    id: "readAloud",
    category: "reading",
    labelKey: "shortcutReadAloud",
    descriptionKey: "shortcutReadAloudDesc",
    defaultKey: "Alt+L",
    allowRemap: true,
  },
  {
    id: "profiles",
    category: "tools",
    labelKey: "shortcutProfiles",
    descriptionKey: "shortcutProfilesDesc",
    defaultKey: "Alt+P",
    allowRemap: true,
  },
  {
    id: "presets",
    category: "tools",
    labelKey: "shortcutPresets",
    descriptionKey: "shortcutPresetsDesc",
    defaultKey: "Alt+S",
    allowRemap: true,
  },
  {
    id: "shortcutsHelp",
    category: "tools",
    labelKey: "shortcutHelp",
    descriptionKey: "shortcutHelpDesc",
    defaultKey: "Alt+K",
    allowRemap: true,
  },
  {
    id: "closeDialog",
    category: "widget",
    labelKey: "shortcutCloseDialog",
    descriptionKey: "shortcutCloseDialogDesc",
    defaultKey: "Escape",
    allowRemap: false,
  },
];

/**
 * Standard reserved browser and OS shortcuts that must NEVER be hijacked or remapped to.
 * Specifically includes Ctrl+U (view source), Ctrl+R (reload), Ctrl+T (new tab), etc.
 */
export const RESERVED_BROWSER_SHORTCUTS = new Set([
  "Ctrl+U",
  "Meta+U",
  "Ctrl+R",
  "Meta+R",
  "Ctrl+Shift+R",
  "Meta+Shift+R",
  "Ctrl+T",
  "Meta+T",
  "Ctrl+W",
  "Meta+W",
  "Ctrl+N",
  "Meta+N",
  "Ctrl+Shift+N",
  "Meta+Shift+N",
  "Ctrl+P",
  "Meta+P",
  "Ctrl+S",
  "Meta+S",
  "Ctrl+F",
  "Meta+F",
  "Ctrl+G",
  "Meta+G",
  "Ctrl+H",
  "Meta+H",
  "Ctrl+J",
  "Meta+J",
  "Ctrl+D",
  "Meta+D",
  "Ctrl+L",
  "Meta+L",
  "Ctrl+O",
  "Meta+O",
  "Ctrl+A",
  "Meta+A",
  "Ctrl+C",
  "Meta+C",
  "Ctrl+V",
  "Meta+V",
  "Ctrl+X",
  "Meta+X",
  "Ctrl+Z",
  "Meta+Z",
  "Ctrl+Y",
  "Meta+Y",
  "Ctrl+Q",
  "Meta+Q",
  "F5",
  "F11",
  "F12",
  "Alt+F4",
  "Ctrl+Shift+I",
  "Meta+Alt+I",
  "Ctrl+Shift+J",
  "Meta+Alt+J",
  "Ctrl+Shift+C",
  "Meta+Alt+C",
  "Tab",
  "Shift+Tab",
  "Enter",
  "Space",
]);

/**
 * Normalizes a key combination string into standard "Alt+Shift+Key" format.
 */
export function normalizeKeyCombo(combo: string): string {
  if (!combo) return "";
  const parts = combo
    .split("+")
    .map((p) => p.trim())
    .filter(Boolean);

  let hasCtrl = false;
  let hasAlt = false;
  let hasShift = false;
  let hasMeta = false;
  let key = "";

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (lower === "ctrl" || lower === "control") hasCtrl = true;
    else if (lower === "alt" || lower === "option") hasAlt = true;
    else if (lower === "shift") hasShift = true;
    else if (lower === "meta" || lower === "cmd" || lower === "command")
      hasMeta = true;
    else {
      // Capitalize first letter or uppercase single letter
      key =
        part.length === 1
          ? part.toUpperCase()
          : part.charAt(0).toUpperCase() + part.slice(1);
    }
  }

  const result: string[] = [];
  if (hasCtrl) result.push("Ctrl");
  if (hasAlt) result.push("Alt");
  if (hasShift) result.push("Shift");
  if (hasMeta) result.push("Meta");
  if (key) result.push(key);

  return result.join("+");
}

/**
 * Parses a native KeyboardEvent into a normalized key combo string.
 */
export function parseKeyboardEventToCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push("Ctrl");
  if (event.altKey) parts.push("Alt");
  if (event.shiftKey) parts.push("Shift");
  if (event.metaKey) parts.push("Meta");

  const key = event.key;
  if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
    const formattedKey =
      key === " " ? "Space" : key.length === 1 ? key.toUpperCase() : key;
    parts.push(formattedKey);
  }

  return parts.join("+");
}

/**
 * Checks whether a key event occurred inside a form field or editable text container.
 * Never hijacks keys when user is typing in forms, text inputs, search boxes, or contenteditable.
 */
export function isFormFieldOrEditable(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  if (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    Boolean(target.isContentEditable) ||
    target.contentEditable === "true" ||
    target.contentEditable === "" ||
    target.getAttribute("contenteditable") === "true" ||
    target.getAttribute("contenteditable") === ""
  ) {
    return true;
  }

  const role = target.getAttribute("role");
  if (
    role === "textbox" ||
    role === "searchbox" ||
    role === "combobox" ||
    role === "spinbutton"
  ) {
    return true;
  }

  return false;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  normalizedCombo?: string;
}

/**
 * Validates a proposed keyboard shortcut remapping against:
 * 1. Reserved browser and operating system shortcuts (especially Ctrl+U, Ctrl+R, etc.)
 * 2. Minimum modifier requirements (must have Alt or Ctrl+Alt to avoid intercepting normal typing)
 * 3. Collisions with other active accessibility plugin shortcuts
 */
export function validateShortcutRemap(
  shortcutId: string,
  newCombo: string,
  existingCustomShortcuts: Record<string, string> = {},
): ValidationResult {
  const normalized = normalizeKeyCombo(newCombo);

  if (!normalized) {
    return { valid: false, error: "Shortcut key combination cannot be empty." };
  }

  // Check reserved browser combinations
  if (RESERVED_BROWSER_SHORTCUTS.has(normalized)) {
    return {
      valid: false,
      error: `"${normalized}" is a reserved browser command and cannot be remapped.`,
    };
  }

  // Ensure modifier is present if it is an alphanumeric key
  const hasModifier =
    normalized.includes("Alt+") ||
    normalized.includes("Ctrl+") ||
    normalized.includes("Meta+");

  const parts = normalized.split("+");
  const mainKey = parts[parts.length - 1];

  if (
    !hasModifier &&
    mainKey !== "Escape" &&
    mainKey !== "F1" &&
    mainKey !== "F2"
  ) {
    return {
      valid: false,
      error:
        "Shortcuts must include a modifier key (e.g. Alt or Alt+Shift) to avoid conflicting with typing.",
    };
  }

  // Check collision with other shortcuts
  for (const item of DEFAULT_SHORTCUTS) {
    if (item.id === shortcutId) continue;
    const currentActiveCombo =
      existingCustomShortcuts[item.id] || item.defaultKey;

    if (
      normalizeKeyCombo(currentActiveCombo).toLowerCase() ===
      normalized.toLowerCase()
    ) {
      return {
        valid: false,
        error: `"${normalized}" conflicts with the shortcut for "${item.labelKey}".`,
      };
    }
  }

  return { valid: true, normalizedCombo: normalized };
}

/**
 * Resolves the active keyboard shortcut for an action ID by checking custom overrides first,
 * then falling back to defaults.
 */
export function resolveActiveShortcut(
  shortcutId: string,
  customShortcuts: Record<string, string> = {},
): string {
  if (customShortcuts[shortcutId]) {
    return normalizeKeyCombo(customShortcuts[shortcutId]);
  }
  const found = DEFAULT_SHORTCUTS.find((s) => s.id === shortcutId);
  return found ? found.defaultKey : "";
}
