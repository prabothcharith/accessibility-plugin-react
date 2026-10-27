# Dictionary Provider Interface & Local Fallback (A11Y-403)

## Overview

The `accessibility-plugin-react` library includes an accessible terminology dictionary and customizable dictionary provider interface (`DictionaryController` and `core/dictionary.ts`).

It enables users to look up digital accessibility terms, WCAG definitions, and web terminology directly inside the application with **zero network transmission by default**, **strict privacy protection**, and **truthful responses without hallucination**.

---

## Core Principles & Guarantees

### 1. Explicit User Action Only
- Dictionary lookups **only occur on deliberate, explicit user action** (typing in the search field and pressing Enter or clicking "Look up").
- **Never looks up on hover, focus, text selection, or route change.** This prevents accidental network queries, distraction for screen-reader users, and unexpected interface layout shifts.

### 2. Zero Network Requests by Default (100% Offline Static Fallback)
- In default configuration (`provider` is null or undefined), the dictionary operates 100% locally from built-in static glossaries.
- The browser `fetch()` API and network stack are **never invoked** when the provider is off.
- Built-in curated terms cover key accessibility and digital concepts in **English (`en`)**, **Sinhala (`si`)**, and **Tamil (`ta`)**:
  - `accessibility` / `ප්‍රවේශ්‍යතාව` / `அணுகல்தன்மை`
  - `aria`
  - `contrast` / `වර්ණ වෙනස` / `மாறுபட்ட வண்ணம்`
  - `dyslexia`
  - `focus`
  - `grayscale` / `අළු පරිමාණය` / `சாம்பல் நிறம்`
  - `reflow`
  - `saturation` / `සන්තෘප්තිය` / `நிறச்செறிவூட்டல்`
  - `screen reader`
  - `semantic`
  - `wcag`

### 3. Truthful Unknown Results (Never Hallucinates)
- When a requested word is not present in the dictionary, the engine **never fabricates or hallucinates a definition**.
- It returns `{ found: false }` with honest messaging: `"No definition found for '<term>'. Check your spelling or try a suggestion below."`
- Suggestion matching offers clickable chips for partially matched terms without fabricating definitions.

### 4. Strict Sanitization & Sensitive Data Rejection
Before any term is searched locally or passed to an external provider:
- **HTML tags & control characters are stripped**: `<script>`, `<b>`, etc.
- **Length is strictly capped**: Maximum 50 characters to prevent buffer and memory abuse.
- **Sensitive data is rejected**: Terms matching email addresses, URLs, credit card numbers, auth tokens (`Bearer ...`, JWTs, API keys) are immediately rejected with an advisory message: `"Private or sensitive content cannot be looked up."`
- **Combining mark preservation**: Unicode combining marks (`\p{M}`) are preserved to support Indic and complex scripts (Sinhala, Tamil, etc.).
- **Privacy shield**: Whole-page DOM contents, cookies, form values, and clipboard contents are **never** transmitted to providers.

### 5. Focus Management & Restoration
- When the dialog opens, keyboard focus transfers immediately into the search input.
- Focus is trapped within the dialog while open (`Tab` and `Shift+Tab` cycle between focusable controls).
- Pressing `Escape` or clicking the `Close dictionary` button dismisses the dialog and **instantly returns keyboard focus to the triggering button**.

---

## Architecture & Provider Interface

Developers can configure a custom remote dictionary backend by supplying an implementation of `DictionaryProvider`:

```typescript
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
```

### Rate Limiting & Graceful Fallback
- `lookupWord()` enforces per-provider rate limiting (default 400ms minimum interval) to avoid query flooding.
- If a custom provider throws a network timeout or HTTP error, the system **automatically falls back to the local static glossary**.

---

## Usage Example

### Basic Setup (100% Offline)

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  DictionaryController,
} from "accessibility-plugin-react";

export function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <DictionaryController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### With Configured Remote Provider

```tsx
import {
  DictionaryController,
  type DictionaryProvider,
} from "accessibility-plugin-react";

const myApiProvider: DictionaryProvider = {
  id: "internal-wiki",
  name: "Corporate Terminology Service",
  rateLimitMs: 500,
  lookup: async (word: string, lang?: string) => {
    const response = await fetch(`/api/dictionary?q=${encodeURIComponent(word)}&lang=${lang}`);
    if (!response.ok) throw new Error("Service error");
    return response.json();
  },
};

export function CustomTools() {
  return <DictionaryController provider={myApiProvider} />;
}
```

---

## Keyboard Shortcuts

- Default shortcut: **`Alt+D`** (customizable via `KeyboardShortcutsController`).
- Dialog navigation: **`Tab`** / **`Shift+Tab`** to cycle controls.
- Dialog dismissal: **`Escape`** (restores focus to trigger button).
