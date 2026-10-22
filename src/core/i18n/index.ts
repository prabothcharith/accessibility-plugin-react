import type { LocaleStrings } from "./types";
import { enLocale } from "./en";

export * from "./types";
export { enLocale } from "./en";

const dictionaries: Record<string, LocaleStrings> = {
  en: enLocale,
};

const RTL_LOCALES = new Set([
  "ar",
  "arc",
  "dv",
  "fa",
  "ha",
  "he",
  "khw",
  "ks",
  "ku",
  "ps",
  "ur",
  "yi",
]);

export function registerLocale(code: string, strings: LocaleStrings): void {
  dictionaries[code.toLowerCase()] = strings;
}

export function isRtlLocale(localeProp?: string): boolean {
  if (!localeProp) return false;
  const base = localeProp.toLowerCase().split("-")[0];
  return RTL_LOCALES.has(base);
}

export function resolveLocaleStrings(localeProp?: string): LocaleStrings {
  const normalized = (
    localeProp ||
    (typeof document !== "undefined" ? document.documentElement.lang : "en") ||
    "en"
  )
    .trim()
    .toLowerCase();

  if (dictionaries[normalized]) {
    return dictionaries[normalized];
  }

  const base = normalized.split("-")[0];
  if (dictionaries[base]) {
    return dictionaries[base];
  }

  return enLocale;
}
