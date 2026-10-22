import { DEFAULT_PREFERENCES } from "./defaults";
import type {
  AccessibilityPreferences,
  ContrastMode,
  CursorSizePreference,
  FontFamilyPreference,
  ReaderMode,
  SaturationPreference,
  TextAlignPreference,
} from "./types";

const VALID_CONTRAST_MODES: ReadonlySet<ContrastMode> = new Set([
  "off",
  "light",
  "dark",
  "high",
  "invert",
]);

const VALID_READER_MODES: ReadonlySet<ReaderMode> = new Set([
  "off",
  "guide",
  "mask",
]);

const VALID_TEXT_ALIGNS: ReadonlySet<TextAlignPreference> = new Set([
  "original",
  "left",
  "right",
  "center",
  "justify",
]);

const VALID_FONT_FAMILIES: ReadonlySet<FontFamilyPreference> = new Set([
  "original",
  "legible",
  "dyslexia-option",
]);

const VALID_CURSOR_SIZES: ReadonlySet<CursorSizePreference> = new Set([
  "original",
  "large",
]);

const VALID_SATURATIONS: ReadonlySet<SaturationPreference> = new Set([
  "original",
  "low",
  "high",
  "grayscale",
]);

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

export function normalizePreferenceValue<
  K extends keyof AccessibilityPreferences,
>(key: K, value: unknown): AccessibilityPreferences[K] {
  switch (key) {
    case "fontScale":
      return (
        typeof value === "number" ? clamp(value, 0.5, 2.0) : 1.0
      ) as AccessibilityPreferences[K];

    case "lineHeight":
      if (value === null || value === undefined)
        return null as AccessibilityPreferences[K];
      return (
        typeof value === "number" ? clamp(value, 0.5, 2.0) : null
      ) as AccessibilityPreferences[K];

    case "letterSpacingEm":
      if (value === null || value === undefined)
        return null as AccessibilityPreferences[K];
      return (
        typeof value === "number" ? clamp(value, 0.0, 0.5) : null
      ) as AccessibilityPreferences[K];

    case "wordSpacingEm":
      if (value === null || value === undefined)
        return null as AccessibilityPreferences[K];
      return (
        typeof value === "number" ? clamp(value, 0.0, 0.5) : null
      ) as AccessibilityPreferences[K];

    case "paragraphSpacingEm":
      if (value === null || value === undefined)
        return null as AccessibilityPreferences[K];
      return (
        typeof value === "number" ? clamp(value, 0.0, 1.0) : null
      ) as AccessibilityPreferences[K];

    case "textAlign":
      return (
        typeof value === "string" &&
        VALID_TEXT_ALIGNS.has(value as TextAlignPreference)
          ? value
          : "original"
      ) as AccessibilityPreferences[K];

    case "contrastMode":
      return (
        typeof value === "string" &&
        VALID_CONTRAST_MODES.has(value as ContrastMode)
          ? value
          : "off"
      ) as AccessibilityPreferences[K];

    case "fontFamily":
      return (
        typeof value === "string" &&
        VALID_FONT_FAMILIES.has(value as FontFamilyPreference)
          ? value
          : "original"
      ) as AccessibilityPreferences[K];

    case "cursorSize":
      return (
        typeof value === "string" &&
        VALID_CURSOR_SIZES.has(value as CursorSizePreference)
          ? value
          : "original"
      ) as AccessibilityPreferences[K];

    case "readerMode":
      return (
        typeof value === "string" && VALID_READER_MODES.has(value as ReaderMode)
          ? value
          : "off"
      ) as AccessibilityPreferences[K];

    case "saturation":
      return (
        typeof value === "string" &&
        VALID_SATURATIONS.has(value as SaturationPreference)
          ? value
          : "original"
      ) as AccessibilityPreferences[K];

    case "highlightLinks":
    case "highlightFocus":
    case "reduceMotion":
    case "hideDecorativeImages":
    case "tooltips":
      return Boolean(value) as AccessibilityPreferences[K];

    default:
      return value as AccessibilityPreferences[K];
  }
}

export function normalizePreferences(
  input?: Partial<AccessibilityPreferences> | null,
): AccessibilityPreferences {
  const result = { ...DEFAULT_PREFERENCES };
  if (!input || typeof input !== "object") return result;

  for (const k of Object.keys(DEFAULT_PREFERENCES) as Array<
    keyof AccessibilityPreferences
  >) {
    if (k in input && input[k] !== undefined) {
      (result as Record<keyof AccessibilityPreferences, unknown>)[k] =
        normalizePreferenceValue(k, input[k]);
    }
  }
  return result;
}

export function resolveEffectivePreferences(
  base: AccessibilityPreferences,
  profileSnapshot: Partial<AccessibilityPreferences> | null,
  overrides: Partial<AccessibilityPreferences>,
): AccessibilityPreferences {
  const merged: Partial<AccessibilityPreferences> = {
    ...DEFAULT_PREFERENCES,
    ...base,
    ...(profileSnapshot ?? {}),
    ...overrides,
  };
  return normalizePreferences(merged);
}
