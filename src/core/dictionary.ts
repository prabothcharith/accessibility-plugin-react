/**
 * Dictionary provider interface, local curated dictionary, and sanitization policy.
 *
 * Implements A11Y-403:
 * - Explicit user action required (never auto-looks up on hover/focus)
 * - Zero network requests by default (100% offline static dictionary)
 * - Truthful unknown results (never hallucinates or fabricates definitions)
 * - Strict sanitization (strips HTML, limits length, rejects sensitive/token patterns)
 * - Rate-limited provider interface for custom backends
 * - Privacy protection (never sends whole-page DOM, cookies, or clipboard data)
 */

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
  example?: string;
  source: "local" | "custom" | "provider";
  language?: string;
}

export interface DictionaryLookupResult {
  found: boolean;
  term?: string;
  entry?: DictionaryEntry;
  suggestions?: string[];
  error?: string;
}

export interface DictionaryProvider {
  id: string;
  name: string;
  lookup: (word: string, lang?: string) => Promise<DictionaryLookupResult>;
  allowedOrigins?: string[];
  rateLimitMs?: number;
}

/**
 * Built-in curated accessibility & web dictionary entries.
 * Guaranteed 100% offline with zero network requests.
 */
export const LOCAL_DICTIONARY_EN: Record<string, Omit<DictionaryEntry, "word" | "source">> = {
  accessibility: {
    phonetic: "/əkˌsesəˈbɪləti/",
    partOfSpeech: "noun",
    definition: "The practice of designing software, websites, and environments usable by people with diverse abilities and disabilities.",
    example: "Web accessibility ensures screen reader users can navigate and interact with all page controls.",
    language: "en",
  },
  aria: {
    phonetic: "/ˈɑːriə/",
    partOfSpeech: "abbreviation",
    definition: "Accessible Rich Internet Applications; a W3C specification of HTML attributes that convey roles, states, and properties to assistive technologies.",
    example: "The button specifies aria-expanded to indicate whether its associated menu is open.",
    language: "en",
  },
  contrast: {
    phonetic: "/ˈkɒntrɑːst/",
    partOfSpeech: "noun",
    definition: "The visual difference in luminance between text or foreground graphics and their background surface.",
    example: "WCAG AA requires a 4.5:1 contrast ratio for normal body text.",
    language: "en",
  },
  dyslexia: {
    phonetic: "/dɪsˈleksiə/",
    partOfSpeech: "noun",
    definition: "A neurodivergent learning variation that primarily impacts reading, word decoding, and spelling fluency.",
    example: "Increased letter spacing and specialized legible typefaces can support readers with dyslexia.",
    language: "en",
  },
  focus: {
    phonetic: "/ˈfoʊkəs/",
    partOfSpeech: "noun",
    definition: "The visual and programmatic state indicating which interactive element currently receives keyboard input.",
    example: "A clear visible focus indicator is essential for keyboard-only navigation.",
    language: "en",
  },
  grayscale: {
    phonetic: "/ˈɡreɪskeɪl/",
    partOfSpeech: "noun",
    definition: "A visual mode displaying content exclusively in shades of gray, removing all chromatic hue and color saturation.",
    example: "Grayscale mode helps users who experience visual overstimulation or migraine triggers from vibrant colors.",
    language: "en",
  },
  reflow: {
    phonetic: "/ˌriːˈfloʊ/",
    partOfSpeech: "noun",
    definition: "The browser's ability to reorganize and wrap text content to fit the viewport width without requiring two-dimensional scrolling.",
    example: "WCAG 1.4.10 requires responsive reflow up to 400% zoom without horizontal scrollbars.",
    language: "en",
  },
  saturation: {
    phonetic: "/ˌsætʃəˈreɪʃn/",
    partOfSpeech: "noun",
    definition: "The relative purity, vividness, or chromatic intensity of a color.",
    example: "Lowering saturation reduces eye strain while maintaining natural color separation.",
    language: "en",
  },
  "screen reader": {
    phonetic: "/ˈskriːn ˌriːdər/",
    partOfSpeech: "noun",
    definition: "Assistive software that translates digital text and interface elements into synthetic speech or refreshable braille displays.",
    example: "Screen readers announce the role and state of native button elements automatically.",
    language: "en",
  },
  semantic: {
    phonetic: "/sɪˈmæntɪk/",
    partOfSpeech: "adjective",
    definition: "HTML elements and code structures that convey inherent meaning, structure, and hierarchy rather than presentation alone.",
    example: "Using semantic headings h1 through h6 creates an operable page outline for assistive technologies.",
    language: "en",
  },
  wcag: {
    phonetic: "/ˈwɪkæɡ/",
    partOfSpeech: "abbreviation",
    definition: "Web Content Accessibility Guidelines; international standards published by the W3C defining technical criteria for digital accessibility.",
    example: "The site targets WCAG 2.1 Level AA conformance across all interactive features.",
    language: "en",
  },
};

export const LOCAL_DICTIONARY_SI: Record<string, Omit<DictionaryEntry, "word" | "source">> = {
  accessibility: {
    phonetic: "ප්‍රවේශ්‍යතාව",
    partOfSpeech: "නාම පදය",
    definition: "සියලු හැකියාවන් සහ ආබාධ සහිත පුද්ගලයින්ට පහසුවෙන් සහ ස්වාධීනව භාවිතා කළ හැකි වන පරිදි මෘදුකාංග සහ පරිසරයන් නිර්මාණය කිරීම.",
    example: "ඩිජිටල් ප්‍රවේශ්‍යතාව මඟින් තිර කියවනය භාවිතා කරන්නන්ට වෙබ් අඩවි පහසුවෙන් භාවිතා කිරීමට ඉඩ සලසයි.",
    language: "si",
  },
  ප්‍රවේශ්‍යතාව: {
    phonetic: "accessibility",
    partOfSpeech: "නාම පදය",
    definition: "සියලු හැකියාවන් සහ ආබාධ සහිත පුද්ගලයින්ට පහසුවෙන් සහ ස්වාධීනව භාවිතා කළ හැකි වන පරිදි මෘදුකාංග සහ පරිසරයන් නිර්මාණය කිරීම.",
    example: "ඩිජිටල් ප්‍රවේශ්‍යතාව මඟින් තිර කියවනය භාවිතා කරන්නන්ට වෙබ් අඩවි පහසුවෙන් භාවිතා කිරීමට ඉඩ සලසයි.",
    language: "si",
  },
  contrast: {
    phonetic: "වර්ණ වෙනස",
    partOfSpeech: "නාම පදය",
    definition: "පෙළ සහ එහි පසුබිම අතර ඇති දීප්තියේ දෘශ්‍ය වෙනස.",
    example: "පැහැදිලි කියවීමේ හැකියාව සඳහා ප්‍රමාණවත් වර්ණ වෙනසක් තිබීම අත්‍යවශ්‍ය වේ.",
    language: "si",
  },
  "වර්ණ වෙනස": {
    phonetic: "contrast",
    partOfSpeech: "නාම පදය",
    definition: "පෙළ සහ එහි පසුබිම අතර ඇති දීප්තියේ දෘශ්‍ය වෙනස.",
    example: "පැහැදිලි කියවීමේ හැකියාව සඳහා ප්‍රමාණවත් වර්ණ වෙනසක් තිබීම අත්‍යවශ්‍ය වේ.",
    language: "si",
  },
  saturation: {
    phonetic: "සන්තෘප්තිය",
    partOfSpeech: "නාම පදය",
    definition: "වර්ණයක තීව්‍රතාව හෝ දීප්තිමත් බව.",
    example: "වර්ණ සන්තෘප්තිය අඩු කිරීමෙන් ඇස්වල වෙහෙස අවම කරගත හැක.",
    language: "si",
  },
  සන්තෘප්තිය: {
    phonetic: "saturation",
    partOfSpeech: "නාම පදය",
    definition: "වර්ණයක තීව්‍රතාව හෝ දීප්තිමත් බව.",
    example: "වර්ණ සන්තෘප්තිය අඩු කිරීමෙන් ඇස්වල වෙහෙස අවම කරගත හැක.",
    language: "si",
  },
  grayscale: {
    phonetic: "අළු පරිමාණය",
    partOfSpeech: "නාම පදය",
    definition: "සියලු වර්ණ ඉවත් කර අළු පැහැයේ විවිධ ඡායාවන්ගෙන් පමණක් දර්ශනය වන මාදිලිය.",
    example: "අළු පරිමාණ මාදිලිය මඟින් දීප්තිමත් වර්ණ නිසා ඇතිවන අපහසුතා මඟහරවා ගත හැක.",
    language: "si",
  },
  "අළු පරිමාණය": {
    phonetic: "grayscale",
    partOfSpeech: "නාම පදය",
    definition: "සියලු වර්ණ ඉවත් කර අළු පැහැයේ විවිධ ඡායාවන්ගෙන් පමණක් දර්ශනය වන මාදිලිය.",
    example: "අළු පරිමාණ මාදිලිය මඟින් දීප්තිමත් වර්ණ නිසා ඇතිවන අපහසුතා මඟහරවා ගත හැක.",
    language: "si",
  },
};

export const LOCAL_DICTIONARY_TA: Record<string, Omit<DictionaryEntry, "word" | "source">> = {
  accessibility: {
    phonetic: "அணுகல்தன்மை",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "அனைத்து திறன் மற்றும் குறைபாடுகள் கொண்ட நபர்களும் பயன்படுத்தக்கூடிய வகையில் மென்பொருள் மற்றும் இணையதளங்களை வடிவமைத்தல்.",
    example: "திரை வாசிப்பான் பயனர்களுக்கு டிஜிட்டல் அணுகல்தன்மை மிகவும் அவசியம்.",
    language: "ta",
  },
  அணுகல்தன்மை: {
    phonetic: "accessibility",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "அனைத்து திறன் மற்றும் குறைபாடுகள் கொண்ட நபர்களும் பயன்படுத்தக்கூடிய வகையில் மென்பொருள் மற்றும் இணையதளங்களை வடிவமைத்தல்.",
    example: "திரை வாசிப்பான் பயனர்களுக்கு டிஜிட்டல் அணுகல்தன்மை மிகவும் அவசியம்.",
    language: "ta",
  },
  contrast: {
    phonetic: "மாறுபட்ட வண்ணம்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "உரைக்கும் அதன் பின்னணிக்கும் இடையே உள்ள பிரகாசத்தின் காட்சி வேறுபாடு.",
    example: "தெளிவான வாசிப்புக்கு போதுமான வண்ண மாறுபாடு அவசியம்.",
    language: "ta",
  },
  "மாறுபட்ட வண்ணம்": {
    phonetic: "contrast",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "உரைக்கும் அதன் பின்னணிக்கும் இடையே உள்ள பிரகாசத்தின் காட்சி வேறுபாடு.",
    example: "தெளிவான வாசிப்புக்கு போதுமான வண்ண மாறுபாடு அவசியம்.",
    language: "ta",
  },
  saturation: {
    phonetic: "நிறச்செறிவூட்டல்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "ஒரு நிறத்தின் தூய்மை மற்றும் தீவிரம்.",
    example: "நிறச்செறிவைக் குறைப்பது கண் சோர்வைத் தடுக்கிறது.",
    language: "ta",
  },
  நிறச்செறிவூட்டல்: {
    phonetic: "saturation",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "ஒரு நிறத்தின் தூய்மை மற்றும் தீவிரம்.",
    example: "நிறச்செறிவைக் குறைப்பது கண் சோர்வைத் தடுக்கிறது.",
    language: "ta",
  },
  grayscale: {
    phonetic: "சாம்பல் நிறம்",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "அனைத்து வண்ணங்களையும் நீக்கி, சாம்பல் நிற நிழல்களில் மட்டுமே காட்சிகளை வழங்கும் முறை.",
    example: "சாம்பல் நிற முறை அதிகப்படியான வண்ண ஒளிர்தலைத் தவிர்க்க உதவுகிறது.",
    language: "ta",
  },
  "சாம்பல் நிறம்": {
    phonetic: "grayscale",
    partOfSpeech: "பெயர்ச்சொல்",
    definition: "அனைத்து வண்ணங்களையும் நீக்கி, சாம்பல் நிற நிழல்களில் மட்டுமே காட்சிகளை வழங்கும் முறை.",
    example: "சாம்பல் நிற முறை அதிகப்படியான வண்ண ஒளிர்தலைத் தவிர்க்க உதவுகிறது.",
    language: "ta",
  },
};

/** Patterns that indicate sensitive, token, or private content that must never be sent or looked up. */
const SENSITIVE_INPUT_PATTERNS = [
  /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i, // Email
  /^(https?:\/\/|www\.)[^\s]+$/i, // URL
  /^\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}$/, // Credit card
  /^[A-Za-z0-9-_]{20,}$/, // Auth tokens, API keys, hashes
  /\b(bearer\s+|token\s+|apikey\s+|key\s+)[A-Za-z0-9._-]+/i, // Bearer tokens / auth headers
  /^(eyJh|ghp_|gho_|sk_live|pk_live)[A-Za-z0-9._-]+/i, // Common API token prefixes
];

/**
 * Sanitizes and validates a lookup term.
 * Removes HTML tags, excess whitespace, and control characters.
 * Enforces length bounds (1 to 50 characters).
 */
export function sanitizeLookupTerm(term: unknown): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  if (typeof term !== "string") {
    return { valid: false, sanitized: "", error: "Please enter a valid word." };
  }

  // Strip HTML tags and control characters
  // eslint-disable-next-line no-control-regex
  let clean = term.replace(/<[^>]*>/g, "").replace(/[\x00-\x1F\x7F]/g, "").trim();

  // Strip leading/trailing punctuation except quotes
  clean = clean.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}\p{M}]+$/gu, "");

  if (!clean || clean.length < 1) {
    return { valid: false, sanitized: "", error: "Please enter a word to look up." };
  }

  if (clean.length > 50) {
    return {
      valid: false,
      sanitized: clean.slice(0, 50),
      error: "Search term is too long (maximum 50 characters).",
    };
  }

  // Check against sensitive patterns (emails, credit cards, auth tokens)
  for (const pattern of SENSITIVE_INPUT_PATTERNS) {
    if (pattern.test(clean)) {
      return {
        valid: false,
        sanitized: "",
        error: "Private or sensitive content cannot be looked up.",
      };
    }
  }

  return { valid: true, sanitized: clean.toLowerCase() };
}

/**
 * Looks up a term in the built-in local static dictionary.
 * Guaranteed 100% offline, zero network requests, zero hallucination.
 */
export function lookupLocalDictionary(
  term: string,
  locale = "en",
): DictionaryLookupResult {
  const check = sanitizeLookupTerm(term);
  if (!check.valid) {
    return { found: false, term: typeof term === "string" ? term : "", error: check.error };
  }

  const query = check.sanitized;
  const lang = locale.toLowerCase().split("-")[0];

  let dict = LOCAL_DICTIONARY_EN;
  if (lang === "si") dict = LOCAL_DICTIONARY_SI;
  else if (lang === "ta") dict = LOCAL_DICTIONARY_TA;

  // 1. Direct match in selected locale
  if (dict[query]) {
    return {
      found: true,
      term: query,
      entry: {
        word: query,
        ...dict[query],
        source: "local",
      },
    };
  }

  // 2. Fallback to English dictionary if not found in translated glossary
  if (dict !== LOCAL_DICTIONARY_EN && LOCAL_DICTIONARY_EN[query]) {
    return {
      found: true,
      term: query,
      entry: {
        word: query,
        ...LOCAL_DICTIONARY_EN[query],
        source: "local",
      },
    };
  }

  // 3. Find suggestions (terms containing or starting with query)
  const allKeys = Object.keys(LOCAL_DICTIONARY_EN);
  const suggestions = allKeys
    .filter((k) => k.includes(query) || query.includes(k))
    .slice(0, 4);

  return {
    found: false,
    term: query,
    suggestions: suggestions.length > 0 ? suggestions : undefined,
  };
}

/** Rate limiter tracking per provider to prevent request flooding. */
const lastProviderRequestMap = new Map<string, number>();

/**
 * Executes a dictionary lookup using the configured provider or falling back to the local dictionary.
 * When provider is null or undefined (provider-off), performs zero network requests.
 */
export async function lookupWord(
  term: string,
  options: {
    locale?: string;
    provider?: DictionaryProvider | null;
  } = {},
): Promise<DictionaryLookupResult> {
  const { locale = "en", provider } = options;

  const check = sanitizeLookupTerm(term);
  if (!check.valid) {
    return { found: false, error: check.error };
  }

  const query = check.sanitized;

  // 1. If no provider is configured, use local static dictionary (zero network requests)
  if (!provider) {
    return lookupLocalDictionary(query, locale);
  }

  // 2. Enforce rate limiting for external providers
  const rateLimit = provider.rateLimitMs ?? 400;
  const now = Date.now();
  const lastRequest = lastProviderRequestMap.get(provider.id) ?? 0;
  if (now - lastRequest < rateLimit) {
    return {
      found: false,
      error: "Please wait a moment before looking up another word.",
    };
  }
  lastProviderRequestMap.set(provider.id, now);

  try {
    const result = await provider.lookup(query, locale);
    if (result && result.found && result.entry) {
      return {
        ...result,
        entry: {
          ...result.entry,
          source: result.entry.source ?? "provider",
        },
      };
    }
  } catch (err) {
    // Graceful fallback to local dictionary on provider network failure
    const localFallback = lookupLocalDictionary(query, locale);
    if (localFallback.found) {
      return localFallback;
    }
    return {
      found: false,
      error: err instanceof Error ? err.message : "Dictionary service unavailable.",
    };
  }

  // Fallback to local dictionary if provider returned no results
  return lookupLocalDictionary(query, locale);
}
