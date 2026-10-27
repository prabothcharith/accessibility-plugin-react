const numberIn = (min: number, max: number) => (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const oneOf =
  (...values: unknown[]) =>
  (v: unknown) =>
    values.includes(v);
/**
 * Reflow-safe text scale steps: 1x baseline, 1.125x subtle, 1.25x medium, 1.5x large, 2.0x maximum.
 */
export const TEXT_SCALE_STEPS = [1.0, 1.125, 1.25, 1.5, 2.0] as const;
export type TextScaleStep = (typeof TEXT_SCALE_STEPS)[number];

/**
 * Standard WCAG SC 1.4.12 line height options: 1.0 (baseline), 1.5 (150%), 1.75 (175%), 2.0 (200%).
 */
export const LINE_HEIGHT_STEPS = [100, 150, 175, 200] as const;
export const LINE_HEIGHT_RATIOS = [1.0, 1.5, 1.75, 2.0] as const;

/**
 * Font family options: default (host fonts), legible (clean modern sans-serif), dyslexia-option (weighted baseline fonts).
 */
export const FONT_FAMILY_PRESETS = [
  "default",
  "legible",
  "dyslexia-option",
] as const;
export type FontFamilyPreset = (typeof FONT_FAMILY_PRESETS)[number];

/**
 * Semantic contrast modes: off/original (standard colors), light (crisp light), dark (deep dark), high (AAA high contrast), invert (luminance inversion).
 */
export const CONTRAST_MODES = [
  "off",
  "original",
  "light",
  "dark",
  "high",
  "invert",
] as const;
export type ContrastModeValue = (typeof CONTRAST_MODES)[number];

export const builtins: Record<
  string,
  { defaultValue: unknown; validate: (v: unknown) => boolean }
> = Object.assign(Object.create(null), {
  fontSize: { defaultValue: 100, validate: numberIn(50, 200) },
  fontScale: { defaultValue: 1.0, validate: numberIn(0.5, 2.0) },
  textScale: { defaultValue: 1.0, validate: numberIn(0.5, 2.0) },
  lineHeight: {
    defaultValue: 100,
    validate: (v: unknown) =>
      typeof v === "number" &&
      Number.isFinite(v) &&
      ((v >= 0.5 && v <= 2.5) || (v >= 50 && v <= 200)),
  },
  letterSpacing: { defaultValue: 0, validate: numberIn(0, 20) },
  wordSpacing: { defaultValue: 0, validate: numberIn(0, 20) },
  paragraphSpacing: { defaultValue: 0, validate: numberIn(0, 64) },
  letterSpacingEm: {
    defaultValue: null,
    validate: (v: unknown) => v === null || numberIn(0, 1)(v),
  },
  wordSpacingEm: {
    defaultValue: null,
    validate: (v: unknown) => v === null || numberIn(0, 1)(v),
  },
  paragraphSpacingEm: {
    defaultValue: null,
    validate: (v: unknown) => v === null || numberIn(0, 2)(v),
  },
  contrast: {
    defaultValue: 0,
    validate: oneOf(
      0,
      1,
      2,
      3,
      "off",
      "original",
      "light",
      "dark",
      "high",
      "invert",
      "reduced",
      "yellow-on-black",
      "white-on-black",
      "blue-on-yellow",
      "black-on-white",
    ),
  },
  contrastMode: {
    defaultValue: "off",
    validate: oneOf("off", "original", "light", "dark", "high", "invert"),
  },
  saturation: { defaultValue: 0, validate: oneOf(0, 1, 2) },
  textAlign: {
    defaultValue: "default",
    validate: oneOf("default", "left", "center", "right", "justify"),
  },
  fontFamily: {
    defaultValue: "default",
    validate: oneOf(
      "default",
      "original",
      "legible",
      "dyslexia-option",
      "dyslexia",
    ),
  },
  linkHighlight: {
    defaultValue: false,
    validate: oneOf(
      false,
      true,
      "underline",
      "yellow-on-black",
      "blue-on-yellow",
      "black-on-white",
    ),
  },
});
for (const key of [
  "invertColors",
  "grayscale",
  "hideImages",
  "hideVideos",
  "bigCursor",
  "readingGuide",
  "highlightFocus",
  "focusHighlight",
  "reduceMotion",
  "tooltips",
  "accessibleTooltips",
]) {
  builtins[key] = {
    defaultValue: false,
    validate: (v) => typeof v === "boolean",
  };
}

export const DEFAULT_READING_MASK_HEIGHT = 100;
export const MIN_READING_MASK_HEIGHT = 40;
export const MAX_READING_MASK_HEIGHT = 400;
export const READING_MASK_HEIGHT_PRESETS = [60, 100, 160, 240] as const;

builtins.readingMask = {
  defaultValue: false,
  validate: (v) =>
    typeof v === "boolean" ||
    (typeof v === "number" &&
      v >= MIN_READING_MASK_HEIGHT &&
      v <= MAX_READING_MASK_HEIGHT),
};

builtins.readingMaskHeight = {
  defaultValue: DEFAULT_READING_MASK_HEIGHT,
  validate: (v) =>
    typeof v === "number" &&
    v >= MIN_READING_MASK_HEIGHT &&
    v <= MAX_READING_MASK_HEIGHT,
};
export function validValue(
  key: string,
  value: unknown,
  fallback: unknown,
  validate?: (value: unknown) => boolean,
): boolean {
  if (builtins[key]) return builtins[key].validate(value);
  if (validate) {
    try {
      return validate(value);
    } catch {
      return false;
    }
  }
  return value === null
    ? fallback === null
    : typeof value === typeof fallback &&
        (typeof value !== "number" || Number.isFinite(value)) &&
        (typeof value !== "object" ||
          Array.isArray(value) === Array.isArray(fallback));
}
