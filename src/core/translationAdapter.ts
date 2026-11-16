/**
 * Host-content translation adapter architecture, privacy threat model, and DOM sanitization.
 *
 * Implements A11Y-409:
 * - Distinct from widget UI localization (src/core/i18n/ statically localizes widget controls).
 * - Provider adapter interface with clear privacy/retention/origin boundaries.
 * - Explicit user consent required before sending text to external or custom providers.
 * - Zero network requests by default (no automatic translation or default requests).
 * - Strict exclusion of sensitive elements (passwords, auth tokens, credit cards, PII, hidden nodes).
 * - Iframe & cross-origin boundary enforcement (never traverses cross-origin frames).
 * - XSS & DOM injection prevention via strict textContent assignment and output sanitization.
 * - Complete teardown and instant restoration back to original host text.
 * - Non-destructive execution: zero medical/compliance claims.
 */

export type DataRetentionPolicy =
  "none" | "transient" | "logged" | "model-training";

export type TranslationConsentStatus =
  "unprompted" | "granted" | "denied" | "revoked";

export interface TranslationConsentRecord {
  status: TranslationConsentStatus;
  grantedAt?: number;
  providerId?: string;
  targetLanguage?: string;
  userAcknowledgedRisks: boolean;
}

export interface TranslationRequest {
  texts: string[];
  sourceLanguage?: string;
  targetLanguage: string;
  signal?: AbortSignal;
}

export interface TranslatedItem {
  original: string;
  translated: string;
  detectedSourceLanguage?: string;
}

export interface TranslationResponse {
  translations: TranslatedItem[];
  providerId: string;
  timestamp: number;
  attribution?: string;
}

export interface TranslationAdapter {
  id: string;
  name: string;
  description?: string;
  privacyPolicyUrl?: string;
  dataRetention?: DataRetentionPolicy;
  dataResidency?: string;
  allowedOrigins?: string[];
  supportedTargetLanguages: string[] | (() => Promise<string[]>);
  translate: (request: TranslationRequest) => Promise<TranslationResponse>;
}

export interface TranslatableNode {
  node: Text;
  originalText: string;
  translatedText?: string;
  parentElement: Element;
}

export interface TranslationSession {
  active: boolean;
  providerId: string;
  targetLanguage: string;
  translatedCount: number;
  restore: () => void;
}

export const TRANSLATION_ERROR_CODES = {
  CONSENT_REQUIRED: "CONSENT_REQUIRED",
  NO_PROVIDER: "NO_PROVIDER",
  UNSUPPORTED_LANGUAGE: "UNSUPPORTED_LANGUAGE",
  EMPTY_REQUEST: "EMPTY_REQUEST",
  NETWORK_ERROR: "NETWORK_ERROR",
  CSP_BLOCKED: "CSP_BLOCKED",
  RATE_LIMITED: "RATE_LIMITED",
  SANITIZATION_FAILED: "SANITIZATION_FAILED",
  SENSITIVE_CONTENT_BLOCKED: "SENSITIVE_CONTENT_BLOCKED",
  DOM_MUTATION_ERROR: "DOM_MUTATION_ERROR",
  ABORTED: "ABORTED",
} as const;

export type TranslationErrorCode =
  (typeof TRANSLATION_ERROR_CODES)[keyof typeof TRANSLATION_ERROR_CODES];

export class TranslationError extends Error {
  readonly code: TranslationErrorCode;
  readonly details?: unknown;

  constructor(code: TranslationErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "TranslationError";
    this.code = code;
    this.details = details;
  }
}

/**
 * Standard disclaimer: machine-assisted translation is an assistive convenience,
 * not guaranteed for legal, medical, or WCAG compliance accuracy.
 */
export const TRANSLATION_DISCLAIMER =
  "Research Prototype: Host content translation is machine-assisted and provided for convenience only. It does not guarantee semantic accuracy, cultural fidelity, or legal/regulatory compliance. Content containing sensitive or personal information is excluded.";

export const MAX_NODES_PER_TRANSLATION_BATCH = 500;
export const MAX_TEXT_LENGTH_PER_NODE = 2000;

/**
 * Evaluates whether an element or any of its ancestors represents sensitive,
 * protected, or non-translatable content.
 */
export function isSensitiveElement(element: Element | null): boolean {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) {
    return false;
  }

  let curr: Element | null = element;
  while (curr && curr !== document.documentElement) {
    const tag = curr.tagName.toLowerCase();

    // Technical / code / executable nodes
    if (
      tag === "script" ||
      tag === "style" ||
      tag === "noscript" ||
      tag === "template" ||
      tag === "code" ||
      tag === "pre" ||
      tag === "kbd" ||
      tag === "samp" ||
      tag === "var"
    ) {
      return true;
    }

    // Media & embedded cross-document boundaries
    if (
      tag === "iframe" ||
      tag === "canvas" ||
      tag === "svg" ||
      tag === "audio" ||
      tag === "video" ||
      tag === "object" ||
      tag === "embed"
    ) {
      return true;
    }

    // Widget UI elements (must not translate widget UI through host adapter)
    if (
      curr.hasAttribute("data-arap-ui") ||
      curr.hasAttribute("data-arap-diagnostics") ||
      curr.classList.contains("arap-root") ||
      curr.hasAttribute("data-arap-portal") ||
      curr.hasAttribute("data-arap-widget") ||
      curr.classList.contains("arap-widget-container") ||
      curr.id === "arap-portal-root"
    ) {
      return true;
    }

    // Native selects and free-text form fields whose option labels/values should not mutate
    if (
      tag === "select" ||
      tag === "option" ||
      tag === "optgroup" ||
      tag === "textarea" ||
      tag === "datalist"
    ) {
      return true;
    }

    // Explicit opt-out attributes
    if (
      curr.getAttribute("translate") === "no" ||
      curr.classList.contains("notranslate") ||
      curr.hasAttribute("data-no-translate") ||
      curr.hasAttribute("data-sensitive")
    ) {
      return true;
    }

    // Form inputs and sensitive data fields
    if (tag === "input") {
      const inputType = (curr.getAttribute("type") || "text").toLowerCase();
      if (
        inputType === "password" ||
        inputType === "hidden" ||
        inputType === "email" ||
        inputType === "tel" ||
        inputType === "number" ||
        inputType === "file"
      ) {
        return true;
      }
    }

    // Autocomplete markers for credentials and financial data
    const autocomplete = (
      curr.getAttribute("autocomplete") || ""
    ).toLowerCase();
    if (
      autocomplete.includes("password") ||
      autocomplete.includes("cc-") ||
      autocomplete.includes("credit") ||
      autocomplete.includes("cvc") ||
      autocomplete.includes("token") ||
      autocomplete.includes("username") ||
      autocomplete.includes("email")
    ) {
      return true;
    }

    // Accessibility hidden trees
    if (curr.getAttribute("aria-hidden") === "true") {
      return true;
    }

    curr = curr.parentElement;
  }

  return false;
}

/**
 * Traverses DOM tree starting from root and collects translatable text nodes,
 * strictly skipping sensitive elements, widget elements, scripts, and iframes.
 */
export function extractTranslatableNodes(
  root: Element,
  maxNodes: number = MAX_NODES_PER_TRANSLATION_BATCH,
): TranslatableNode[] {
  if (!root || isSensitiveElement(root)) {
    return [];
  }

  const results: TranslatableNode[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      const textNode = node as Text;
      const text = textNode.textContent ?? "";
      const trimmed = text.trim();

      if (!trimmed || trimmed.length < 2) {
        return NodeFilter.FILTER_REJECT;
      }

      const parent = textNode.parentElement;
      if (!parent || isSensitiveElement(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  let current = walker.nextNode();
  while (current && results.length < maxNodes) {
    const textNode = current as Text;
    const parent = textNode.parentElement!;
    const raw = textNode.textContent ?? "";

    if (raw.trim().length > 0) {
      results.push({
        node: textNode,
        originalText: raw,
        parentElement: parent,
      });
    }

    current = walker.nextNode();
  }

  return results;
}

/**
 * Sanitizes translated output strings to prevent XSS and control character injection.
 * Because nodes are applied via textContent, raw HTML is never parsed by the DOM,
 * but this removes control codes and null bytes.
 */
export function sanitizeTranslationOutput(raw: string): string {
  if (!raw) return "";

  return (
    raw
      // eslint-disable-next-line no-control-regex
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      .trim()
  );
}

/**
 * Applies translated strings to translatable text nodes safely using textContent.
 * Returns an idempotent restore function that reverts all modified nodes to their original text.
 */
export function applyTranslations(
  nodes: TranslatableNode[],
  translations: string[],
): () => void {
  const appliedList: Array<{ node: Text; original: string }> = [];

  for (let i = 0; i < nodes.length; i++) {
    const item = nodes[i];
    const trans = translations[i];

    if (trans && item.node.isConnected) {
      const sanitized = sanitizeTranslationOutput(trans);
      if (sanitized) {
        const leading =
          item.node.previousSibling && /^\s/.test(item.originalText) ? " " : "";
        const trailing =
          item.node.nextSibling && /\s$/.test(item.originalText) ? " " : "";
        const finalText = `${leading}${sanitized}${trailing}`;
        item.node.textContent = finalText;
        item.translatedText = finalText;
        appliedList.push({ node: item.node, original: item.originalText });
      }
    }
  }

  let restored = false;
  return () => {
    if (restored) return;
    restored = true;

    for (const record of appliedList) {
      if (record.node.isConnected) {
        record.node.textContent = record.original;
      }
    }
  };
}

const OFFLINE_PHRASE_LEXICON: Record<string, Record<string, string>> = {
  si: {
    "skip to main content": "ප්‍රධාන අන්තර්ගතයට යන්න",
    overview: "සමාලෝචනය",
    about: "අප ගැන",
    news: "පුවත්",
    contact: "සම්බන්ධ වන්න",
    home: "මුල් පිටුව",
    "accessibility plugin react": "ප්‍රවේශ්‍යතා ප්ලගිනය (React)",
    "welcome to the accessibility demo":
      "ප්‍රවේශ්‍යතා ආදර්ශනයට සාදරයෙන් පිළිගනිමු",
    "accessibility controls showcase": "ප්‍රවේශ්‍යතා පාලන ප්‍රදර්ශනය",
    "hello accessibility": "ආයුබෝවන් ප්‍රවේශ්‍යතාව",
    "sample content": "නියැදි අන්තර්ගතය",
    "secondary section": "ද්විතීයික කොටස",
    "read more": "තව කියවන්න",
    "learn more": "තව දැනගන්න",
    "example landscape": "නියැදි භූ දර්ශනය",
    "decorative divider": "අලංකාර බෙදුම",
  },
  ta: {
    "skip to main content": "முதன்மை உள்ளடக்கத்திற்குச் செல்லவும்",
    overview: "கண்ணோட்டம்",
    about: "எங்களைப் பற்றி",
    news: "செய்திகள்",
    contact: "தொடர்பு கொள்ள",
    home: "முகப்பு",
    "accessibility plugin react": "அணுகல்தன்மை செருகுநிரல் (React)",
    "welcome to the accessibility demo":
      "அணுகல்தன்மை செயல்முறைக்கு வரவேற்கிறோம்",
    "accessibility controls showcase": "அணுகல்தன்மை கட்டுப்பாடுகள் காட்சி",
    "hello accessibility": "வணக்கம் அணுகல்தன்மை",
    "sample content": "மாதிரி உள்ளடக்கம்",
    "secondary section": "இரண்டாம் பிரிவு",
    "read more": "மேலும் படிக்கவும்",
    "learn more": "மேலும் அறிய",
  },
  es: {
    "skip to main content": "Saltar al contenido principal",
    overview: "Resumen",
    about: "Acerca de",
    news: "Noticias",
    contact: "Contacto",
    home: "Inicio",
    "accessibility plugin react": "Complemento de Accesibilidad React",
    "welcome to the accessibility demo":
      "Bienvenido a la demostración de accesibilidad",
    "accessibility controls showcase":
      "Exhibición de controles de accesibilidad",
    "hello accessibility": "Hola Accesibilidad",
    "sample content": "Contenido de ejemplo",
    "secondary section": "Sección secundaria",
    "read more": "Leer más",
    "learn more": "Más información",
  },
  fr: {
    "skip to main content": "Aller au contenu principal",
    overview: "Aperçu",
    about: "À propos",
    news: "Actualités",
    contact: "Contact",
    home: "Accueil",
    "accessibility plugin react": "Extension d'accessibilité React",
    "welcome to the accessibility demo":
      "Bienvenue dans la démonstration d'accessibilité",
    "accessibility controls showcase":
      "Présentation des contrôles d'accessibilité",
    "hello accessibility": "Bonjour l'accessibilité",
    "sample content": "Contenu d'exemple",
    "secondary section": "Section secondaire",
    "read more": "Lire la suite",
    "learn more": "En savoir plus",
  },
  de: {
    "skip to main content": "Zum Hauptinhalt springen",
    overview: "Übersicht",
    about: "Über uns",
    news: "Neuigkeiten",
    contact: "Kontakt",
    home: "Startseite",
    "accessibility plugin react": "Barrierefreiheits-Plugin React",
    "welcome to the accessibility demo":
      "Willkommen zur Barrierefreiheits-Demo",
    "accessibility controls showcase":
      "Präsentation der Barrierefreiheits-Steuerung",
    "hello accessibility": "Hallo Barrierefreiheit",
    "sample content": "Beispielinhalt",
    "secondary section": "Sekundärer Abschnitt",
    "read more": "Mehr lesen",
    "learn more": "Mehr erfahren",
  },
  ja: {
    "skip to main content": "メインコンテンツへスキップ",
    overview: "概要",
    about: "概要",
    news: "ニュース",
    contact: "お問い合わせ",
    home: "ホーム",
    "accessibility plugin react": "アクセシビリティプラグイン React",
    "welcome to the accessibility demo": "アクセシビリティデモへようこそ",
    "hello accessibility": "こんにちは アクセシビリティ",
    "read more": "続きを読む",
    "learn more": "詳細を見る",
  },
  zh: {
    "skip to main content": "跳至主要内容",
    overview: "概览",
    about: "关于",
    news: "新闻",
    contact: "联系我们",
    home: "首页",
    "accessibility plugin react": "无障碍插件 React",
    "welcome to the accessibility demo": "欢迎来到无障碍演示",
    "hello accessibility": "你好，无障碍",
    "read more": "阅读更多",
    "learn more": "了解更多",
  },
};

const OFFLINE_WORD_LEXICON: Record<string, Record<string, string>> = {
  si: {
    accessibility: "ප්‍රවේශ්‍යතාව",
    accessible: "ප්‍රවේශ්‍ය",
    article: "ලිපිය",
    button: "බොත්තම",
    close: "වසන්න",
    color: "වර්ණය",
    colors: "වර්ණ",
    content: "අන්තර්ගතය",
    contrast: "ප්‍රතිවිරෝධතාව",
    control: "පාලනය",
    controls: "පාලන",
    custom: "අභිරුචි",
    dark: "අඳුරු",
    demo: "ආදර්ශනය",
    design: "නිර්මාණය",
    display: "දර්ශනය",
    documentation: "ලේඛන",
    example: "උදාහරණය",
    feature: "විශේෂාංගය",
    features: "විශේෂාංග",
    focus: "අවධානය",
    font: "අකුරු",
    guide: "මාර්ගෝපදේශය",
    heading: "ශීර්ෂය",
    headings: "ශීර්ෂ",
    help: "උදව්",
    high: "ඉහළ",
    image: "රූපය",
    images: "රූප",
    keyboard: "යතුරුපුවරුව",
    language: "භාෂාව",
    layout: "පිරිසැලසුම",
    light: "ආලෝක",
    link: "සබැඳිය",
    links: "සබැඳි",
    main: "ප්‍රධාන",
    menu: "මෙනුව",
    mode: "මාදිලිය",
    motion: "චලනය",
    navigation: "සංචාලනය",
    page: "පිටුව",
    paragraph: "ඡේදය",
    plugin: "ප්ලගිනය",
    preferences: "මනාපයන්",
    profile: "පැතිකඩ",
    reading: "කියවීම",
    reset: "යළි පිහිටුවන්න",
    sample: "නියැදි",
    screen: "තිරය",
    search: "සෙවීම",
    section: "කොටස",
    settings: "සැකසුම්",
    size: "ප්‍රමාණය",
    text: "පෙළ",
    theme: "තේමාව",
    tools: "මෙවලම්",
    translation: "පරිවේශනය",
    video: "වීඩියෝ",
    videos: "වීඩියෝ",
    voice: "හඬ",
    welcome: "සාදරයෙන් පිළිගනිමු",
  },
  ta: {
    accessibility: "அணுகல்தன்மை",
    accessible: "அணுகக்கூடிய",
    article: "கட்டுரை",
    content: "உள்ளடக்கம்",
    contrast: "மாறுபாடு",
    controls: "கட்டுப்பாடுகள்",
    demo: "செயல்முறை",
    example: "உதாரணம்",
    features: "அம்சங்கள்",
    focus: "கவனம்",
    font: "எழுத்துரு",
    guide: "வழிகாட்டி",
    heading: "தலைப்பு",
    help: "உதவி",
    high: "உயர்",
    image: "படம்",
    images: "படங்கள்",
    keyboard: "விசைப்பலகை",
    language: "மொழி",
    light: "ஒளி",
    links: "இணைப்புகள்",
    main: "முதன்மை",
    menu: "பட்டியல்",
    mode: "பயன்முறை",
    navigation: "வழிசெலுத்தல்",
    page: "பக்கம்",
    reading: "வாசிப்பு",
    sample: "மாதிரி",
    section: "பிரிவு",
    settings: "அமைப்புகள்",
    text: "உரை",
    tools: "கருவிகள்",
    video: "காணொளி",
    voice: "குரல்",
    welcome: "வரவேற்கிறோம்",
  },
  es: {
    accessibility: "accesibilidad",
    article: "artículo",
    content: "contenido",
    contrast: "contraste",
    controls: "controles",
    demo: "demostración",
    example: "ejemplo",
    features: "funciones",
    focus: "enfoque",
    font: "fuente",
    guide: "guía",
    heading: "encabezado",
    help: "ayuda",
    high: "alto",
    image: "imagen",
    images: "imágenes",
    keyboard: "teclado",
    language: "idioma",
    light: "claro",
    links: "enlaces",
    main: "principal",
    mode: "modo",
    navigation: "navegación",
    page: "página",
    reading: "lectura",
    sample: "ejemplo",
    section: "sección",
    settings: "ajustes",
    text: "texto",
    tools: "herramientas",
    video: "vídeo",
    voice: "voz",
    welcome: "bienvenido",
  },
  fr: {
    accessibility: "accessibilité",
    article: "article",
    content: "contenu",
    contrast: "contraste",
    controls: "contrôles",
    demo: "démonstration",
    example: "exemple",
    features: "fonctionnalités",
    focus: "focus",
    font: "police",
    guide: "guide",
    heading: "titre",
    help: "aide",
    image: "image",
    keyboard: "clavier",
    language: "langue",
    light: "clair",
    links: "liens",
    main: "principal",
    mode: "mode",
    navigation: "navigation",
    page: "page",
    reading: "lecture",
    sample: "exemple",
    section: "section",
    settings: "paramètres",
    text: "texte",
    tools: "outils",
    video: "vidéo",
    voice: "voix",
    welcome: "bienvenue",
  },
  de: {
    accessibility: "Barrierefreiheit",
    article: "Artikel",
    content: "Inhalt",
    contrast: "Kontrast",
    controls: "Steuerung",
    demo: "Demo",
    example: "Beispiel",
    features: "Funktionen",
    focus: "Fokus",
    font: "Schriftart",
    guide: "Leitfaden",
    heading: "Überschrift",
    help: "Hilfe",
    image: "Bild",
    keyboard: "Tastatur",
    language: "Sprache",
    light: "hell",
    links: "Links",
    main: "Haupt",
    mode: "Modus",
    navigation: "Navigation",
    page: "Seite",
    reading: "Lesen",
    sample: "Beispiel",
    section: "Abschnitt",
    settings: "Einstellungen",
    text: "Text",
    tools: "Werkzeuge",
    video: "Video",
    voice: "Sprache",
    welcome: "Willkommen",
  },
  ja: {
    accessibility: "アクセシビリティ",
    article: "記事",
    content: "コンテンツ",
    contrast: "コントラスト",
    demo: "デモ",
    features: "機能",
    help: "ヘルプ",
    navigation: "ナビゲーション",
    page: "ページ",
    reading: "リーディング",
    settings: "設定",
    text: "テキスト",
    welcome: "ようこそ",
  },
  zh: {
    accessibility: "无障碍",
    article: "文章",
    content: "内容",
    contrast: "对比度",
    demo: "演示",
    features: "功能",
    help: "帮助",
    navigation: "导航",
    page: "页面",
    reading: "阅读",
    settings: "设置",
    text: "文本",
    welcome: "欢迎",
  },
};

function translateOfflineText(raw: string, targetLanguage: string): string {
  const baseLang = targetLanguage.trim().toLowerCase().split("-")[0];
  const trimmed = raw.trim();
  const lower = trimmed.toLowerCase().replace(/\s+/g, " ");
  const phrases = OFFLINE_PHRASE_LEXICON[baseLang];
  if (phrases && phrases[lower]) {
    return phrases[lower];
  }
  const words = OFFLINE_WORD_LEXICON[baseLang];
  if (!words) {
    return trimmed;
  }
  let matchedCount = 0;
  const converted = trimmed.replace(/\b([A-Za-z]+)\b/g, (word) => {
    const replacement = words[word.toLowerCase()];
    if (replacement) {
      matchedCount += 1;
      return replacement;
    }
    return word;
  });
  return matchedCount > 0 ? converted : trimmed;
}

/**
 * Creates an offline, mock translation adapter for development and testing.
 * Operates 100% locally with zero network requests.
 */
export function createOfflineMockTranslationAdapter(options?: {
  latencyMs?: number;
  prefix?: string;
  supportedLanguages?: string[];
}): TranslationAdapter {
  const latency = options?.latencyMs ?? 10;
  const hasCustomPrefix = options?.prefix !== undefined;
  const prefix = options?.prefix ?? "[TR]";
  const supported = options?.supportedLanguages ?? [
    "es",
    "fr",
    "de",
    "si",
    "ta",
    "ja",
    "zh",
  ];

  return {
    id: "offline-mock-adapter",
    name: "Offline Mock Translation Adapter",
    description:
      "A simulated translation adapter running 100% locally without network requests.",
    privacyPolicyUrl: "https://example.com/privacy-local",
    dataRetention: "none",
    dataResidency: "client-only",
    supportedTargetLanguages: supported,
    translate: async (
      request: TranslationRequest,
    ): Promise<TranslationResponse> => {
      if (latency > 0) {
        await new Promise((resolve) => setTimeout(resolve, latency));
      }

      if (request.signal?.aborted) {
        throw new TranslationError(
          TRANSLATION_ERROR_CODES.ABORTED,
          "Translation request was aborted.",
        );
      }

      const translations: TranslatedItem[] = request.texts.map((t) => ({
        original: t,
        translated: hasCustomPrefix
          ? `${prefix} ${t}`
          : `${prefix} ${translateOfflineText(t, request.targetLanguage)}`,
        detectedSourceLanguage: request.sourceLanguage || "en",
      }));

      return {
        translations,
        providerId: "offline-mock-adapter",
        timestamp: Date.now(),
        attribution: "Local Offline Mock Translation",
      };
    },
  };
}

/**
 * Coordinates end-to-end host content translation:
 * 1. Verifies user consent status (throws if unprompted, denied, or revoked).
 * 2. Checks target language support on provider.
 * 3. Extracts translatable DOM nodes skipping sensitive elements.
 * 4. Calls provider adapter.
 * 5. Applies translations to text nodes and returns a TranslationSession with full restore capability.
 */
export async function translateHostContent(options: {
  rootElement?: Element;
  provider: TranslationAdapter;
  targetLanguage: string;
  sourceLanguage?: string;
  consentRecord: TranslationConsentRecord;
  signal?: AbortSignal;
}): Promise<TranslationSession> {
  const {
    rootElement = document.body,
    provider,
    targetLanguage,
    sourceLanguage,
    consentRecord,
    signal,
  } = options;

  if (
    consentRecord.status !== "granted" ||
    !consentRecord.userAcknowledgedRisks
  ) {
    throw new TranslationError(
      TRANSLATION_ERROR_CODES.CONSENT_REQUIRED,
      "Explicit user consent is required before translating host content.",
    );
  }

  if (!provider) {
    throw new TranslationError(
      TRANSLATION_ERROR_CODES.NO_PROVIDER,
      "No translation provider adapter configured.",
    );
  }

  const supported =
    typeof provider.supportedTargetLanguages === "function"
      ? await provider.supportedTargetLanguages()
      : provider.supportedTargetLanguages;

  const normalizedTarget = targetLanguage.trim().toLowerCase();
  const baseTarget = normalizedTarget.split("-")[0];
  const supportedNormalized = supported.map((s) => s.trim().toLowerCase());

  if (
    supported.length > 0 &&
    !supportedNormalized.includes(normalizedTarget) &&
    !supportedNormalized.includes(baseTarget)
  ) {
    throw new TranslationError(
      TRANSLATION_ERROR_CODES.UNSUPPORTED_LANGUAGE,
      `Target language "${targetLanguage}" is not supported by provider "${provider.name}".`,
    );
  }

  const nodes = extractTranslatableNodes(rootElement);
  if (nodes.length === 0) {
    return {
      active: false,
      providerId: provider.id,
      targetLanguage,
      translatedCount: 0,
      restore: () => {},
    };
  }

  const texts = nodes.map((n) => n.originalText);

  let response: TranslationResponse;
  try {
    response = await provider.translate({
      texts,
      sourceLanguage,
      targetLanguage,
      signal,
    });
  } catch (err: unknown) {
    if (err instanceof TranslationError) {
      throw err;
    }
    const message = err instanceof Error ? err.message : String(err);
    throw new TranslationError(
      TRANSLATION_ERROR_CODES.NETWORK_ERROR,
      `Translation request failed: ${message}`,
      err,
    );
  }

  const translatedTexts = response.translations.map((t) => t.translated);
  const restoreFn = applyTranslations(nodes, translatedTexts);

  return {
    active: true,
    providerId: provider.id,
    targetLanguage,
    translatedCount: translatedTexts.length,
    restore: restoreFn,
  };
}
