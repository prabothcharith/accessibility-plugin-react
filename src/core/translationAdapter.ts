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
      curr.hasAttribute("data-arap-portal") ||
      curr.hasAttribute("data-arap-widget") ||
      curr.classList.contains("arap-widget-container") ||
      curr.id === "arap-portal-root"
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
        item.node.textContent = sanitized;
        item.translatedText = sanitized;
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
        translated: `${prefix} ${t}`,
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

  if (
    supported.length > 0 &&
    !supported.includes(targetLanguage.toLowerCase())
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
