# Host-Content Translation Adapter Architecture

Host-content translation architecture, privacy threat model, and DOM restoration for `accessibility-plugin-react`.

## Overview & Scope Boundary

The host-content translation adapter (**A11Y-409**) provides a decoupled, privacy-safe interface for translating arbitrary host application text.

### Strict Distinction from Widget Localization

| Dimension            | Widget UI Localization (`docs/LOCALES.md`)      | Host-Content Translation (`docs/TRANSLATION.md`)       |
| :------------------- | :---------------------------------------------- | :----------------------------------------------------- |
| **Target Scope**     | Widget buttons, labels, and dialog strings only | Arbitrary host document content (articles, headings)   |
| **Network Requests** | **Zero** — 100% static bundled locale packs     | **Zero by default** — opt-in custom adapter only       |
| **Privacy Risk**     | None (no host content read)                     | High (host text transmitted to provider if configured) |
| **User Consent**     | Not required (local interface strings)          | **Mandatory explicit consent** prior to transmission   |

---

## Provider Adapter Interface

Developers can configure custom translation providers by implementing `TranslationAdapter`:

```typescript
export interface TranslationAdapter {
  /** Unique provider identifier */
  id: string;
  /** Human-readable provider name */
  name: string;
  /** Optional provider description */
  description?: string;
  /** External privacy policy URL */
  privacyPolicyUrl?: string;
  /** Data retention policy */
  dataRetention?: "none" | "transient" | "logged" | "model-training";
  /** Geographical data residency location */
  dataResidency?: string;
  /** Allowed origins for security check */
  allowedOrigins?: string[];
  /** Supported BCP-47 language codes */
  supportedTargetLanguages: string[] | (() => Promise<string[]>);
  /** Translation function */
  translate: (request: TranslationRequest) => Promise<TranslationResponse>;
}
```

### Request & Response Contracts

```typescript
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
```

---

## Privacy Threat Model & Security Boundaries

Host content translation involves reading user-facing DOM nodes. To guarantee privacy and prevent data leakage:

### 1. Sensitive Field Protection

The engine automatically scans element tags, attributes, and ancestor trees (`isSensitiveElement`) and rejects:

- **Passwords & Credentials**: `<input type="password">`, `[autocomplete*="password"]`, `[autocomplete*="current-password"]`, `[autocomplete*="new-password"]`.
- **Financial Information**: `[autocomplete*="cc-"]`, `[autocomplete*="credit"]`, `[autocomplete*="cvc"]`.
- **Personal Identifiers**: `<input type="email">`, `<input type="tel">`, `<input type="number">`, `[autocomplete*="email"]`, `[autocomplete*="username"]`.
- **Technical & Executable Code**: `<script>`, `<style>`, `<code>`, `<pre>`, `<kbd>`, `<samp>`, `<var>`, `<template>`.
- **Media & Embedded Objects**: `<iframe>`, `<svg>`, `<canvas>`, `<audio>`, `<video>`, `<object>`, `<embed>`.
- **Explicit Opt-Out Markers**: `[translate="no"]`, `class="notranslate"`, `[data-no-translate]`, `[data-sensitive]`.
- **Hidden Elements**: `[aria-hidden="true"]`, hidden inputs.
- **Widget Itself**: `[data-arap-portal]`, `[data-arap-widget]`, `.arap-widget-container`.

### 2. Cross-Origin & iframe Boundaries

- **Same-Origin Policy**: Browser security prevents reading content inside cross-origin `<iframe>` elements. Attempting to traverse cross-origin frames throws DOM security exceptions.
- **Architecture Guarantee**: All `<iframe>` elements are strictly excluded by `isSensitiveElement`. The adapter will never traverse, read, or inject into any frame.

### 3. Content Security Policy (CSP)

If a host application uses a remote translation API (e.g. Google Cloud, DeepL, LibreTranslate):

- The host's `connect-src` CSP directive must explicitly permit the provider endpoint:
  ```http
  Content-Security-Policy: default-src 'self'; connect-src 'self' https://api.deepl.com;
  ```
- If an on-device local model (e.g., Transformers.js via WebAssembly or browser native Translation API `ai.translator`) is used, no external `connect-src` is required, though `wasm-unsafe-eval` may be needed for WebAssembly execution.

### 4. DOM Injection & XSS Prevention

- Translated output is assigned exclusively via `Text.textContent`.
- It is **never** parsed or injected through `innerHTML`.
- Any raw HTML or markup returned by a translation API is treated as plain text, eliminating script injection or Cross-Site Scripting (XSS) vectors.

### 5. Mandatory User Consent

- Zero requests occur on page load or widget opening.
- Translation requires an explicit user click on **"Review & Grant Consent"** and confirmation on the consent agreement.
- Consent can be revoked at any time via the **"Revoke Translation Consent"** button, immediately restoring original text.

---

## Restoration & Teardown Lifecycle

Translations are completely non-destructive:

```typescript
const session = await translateHostContent({
  provider: myAdapter,
  targetLanguage: "es",
  consentRecord: userConsent,
});

// To revert back to original host text:
session.restore();
```

- Every translated node retains its original string in an internal closure record.
- Calling `session.restore()` resets all text nodes synchronously and idempotently.
- Unmounting the `TranslationController` or triggering display reset automatically executes restoration.

---

## Example Custom Providers

### 1. Local Offline Mock (Default)

Included for zero-network development and testing:

```typescript
import { createOfflineMockTranslationAdapter } from "accessibility-plugin-react";

const adapter = createOfflineMockTranslationAdapter({
  prefix: "[ES]",
  supportedLanguages: ["es", "fr", "de", "si", "ta"],
});
```

### 2. Custom Remote API (e.g., DeepL / LibreTranslate)

```typescript
import type {
  TranslationAdapter,
  TranslationRequest,
} from "accessibility-plugin-react";

export const myRemoteAdapter: TranslationAdapter = {
  id: "libretranslate-selfhosted",
  name: "Self-Hosted LibreTranslate",
  privacyPolicyUrl: "https://my-internal-host.com/privacy",
  dataRetention: "none",
  dataResidency: "internal-network",
  supportedTargetLanguages: ["es", "fr", "de", "si", "ta"],
  translate: async (req: TranslationRequest) => {
    const res = await fetch("https://my-internal-host.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: req.texts,
        source: req.sourceLanguage || "auto",
        target: req.targetLanguage,
      }),
      signal: req.signal,
    });

    const data = await res.json();
    return {
      translations: data.translatedText.map((t: string, i: number) => ({
        original: req.texts[i],
        translated: t,
      })),
      providerId: "libretranslate-selfhosted",
      timestamp: Date.now(),
    };
  },
};
```

---

## Zero Compliance Claims

> **Important**: Machine-assisted translation does not constitute official WCAG 2.1/2.2 compliance, nor does it guarantee legal, medical, or regulatory accuracy. Translations are provided as an assistive convenience only.
