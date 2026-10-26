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
      "reduced",
      "yellow-on-black",
      "white-on-black",
      "blue-on-yellow",
    ),
  },
  saturation: { defaultValue: 0, validate: oneOf(0, 1, 2) },
  textAlign: {
    defaultValue: "default",
    validate: oneOf("default", "left", "center", "right", "justify"),
  },
  linkHighlight: {
    defaultValue: false,
    validate: oneOf(
      false,
      true,
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
  "readingMask",
  "readingGuide",
]) {
  builtins[key] = {
    defaultValue: false,
    validate: (v) => typeof v === "boolean",
  };
}
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
