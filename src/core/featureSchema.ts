const numberIn = (min: number, max: number) => (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const oneOf =
  (...values: unknown[]) =>
  (v: unknown) =>
    values.includes(v);
export const builtins: Record<
  string,
  { defaultValue: unknown; validate: (v: unknown) => boolean }
> = Object.assign(Object.create(null), {
  fontSize: { defaultValue: 100, validate: numberIn(50, 200) },
  lineHeight: { defaultValue: 100, validate: numberIn(50, 200) },
  letterSpacing: { defaultValue: 0, validate: numberIn(0, 10) },
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
