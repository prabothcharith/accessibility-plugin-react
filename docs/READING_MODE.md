# Non-Destructive Reading Mode (`ReadingModeController`)

The **Reading Mode** feature (`ReadingModeController`, key `readingMode`) provides a distraction-free, high-readability article view that extracts long-form text and media into an accessible reading modal without rewriting or unmounting the host application's React DOM tree.

---

## Architecture and Core Principles

### 1. Strictly Non-Destructive Extraction

Traditional browser reader modes or third-party bookmarklets often replace or mutate the underlying document body, destroying client-side React component trees, losing form input state, breaking single-page application (SPA) routing, and detaching event listeners.

The `accessibility-plugin-react` implementation is **100% non-destructive**:

- The article extractor clones the candidate content element (`node.cloneNode(true)`) in memory.
- The original host DOM tree is **never rewritten, detached, or mutated**.
- Interactive host elements (such as counters, search fields, or form inputs) retain their exact state, event listeners, and focus history before, during, and after a reading session.

### 2. Client-Side Confidentiality (Zero External Network Requests)

- Extraction, scoring, sanitization, and rendering execute purely in memory in the user's browser.
- **No external APIs, cloud extractors, or third-party web services** are contacted.
- Verified in automated test suites: zero calls to `fetch`, `XMLHttpRequest`, or `navigator.sendBeacon`.

### 3. Sensitive Field and Non-Article Stripping

Even when articles contain nested widgets or forms, the extractor strictly sanitizes all disallowed and sensitive markup:

- **Sensitive inputs**: Password fields (`input[type="password"]`), credit card inputs (`[autocomplete*="cc-"]`), CSRF/hidden tokens, and sensitive data attributes (`[data-sensitive]`) are stripped completely.
- **Forms and interactive inputs**: `<form>`, `<input>`, `<select>`, `<textarea>`, and `<button>` elements are removed to prevent state ambiguity.
- **Boilerplate and navigation**: `<nav>`, `<header>`, `<footer>`, `<aside>`, modals/dialogs, cookie banners, advertisements, and social share widgets are filtered out.
- **Dangerous code and handlers**: `<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers (`onclick`, etc.), and unsafe URL protocols (`javascript:`, `vbscript:`) are sanitized.

### 4. Preservation of Semantic Structure

The extractor preserves meaningful article semantics:

- **Headings**: `h1` through `h6` retaining clear hierarchy.
- **Typography & Flow**: `p`, `blockquote`, `pre`, `code`, `time`, and emphasis (`strong`, `em`, `mark`).
- **Lists & Tables**: `ul`, `ol`, `li`, `table`, `thead`, `tbody`, `tr`, `th`, `td`.
- **Hyperlinks**: `a[href]` with safe URLs (`https://`, relative paths, anchor fragments), decorated with `target="_blank"` and `rel="noopener noreferrer"`.
- **Images and Media**: `img[src]` preserving `alt` text and dimensions, together with `<figure>` and `<figcaption>` captions.

### 5. Honest Fallback and Failure Recovery

If a page lacks substantive readable content (e.g. an authentication screen, an empty dashboard, or a navigation-only hub):

- Extraction gracefully fails without throwing an unhandled exception or trapping the user in a blank view.
- The toggle state automatically reverts to `false`.
- A polite status announcement is communicated to assistive technology:
  - English: _"No readable article content found on this page."_
  - Sinhala: _"මෙම පිටුවෙහි කියවිය හැකි ලිපි අන්තර්ගතයක් හමු නොවීය."_
  - Tamil: _"இப்பக்கத்தில் படிக்கக்கூடிய கட்டுரை உள்ளடக்கம் எதுவும் இல்லை."_
- Focus safely returns to the triggering control.

---

## User Experience and Controls

When reading mode is opened, it renders an accessible overlay dialog (`role="dialog"`, `aria-modal="true"`):

1. **Toolbar Header**:
   - **Article Meta**: Displays word count and estimated reading time (standard 200 words-per-minute baseline).
   - **Theme Switcher**: Quick toggle between **Light**, **Sepia** (reduced blue light), and **Dark** modes.
   - **Text Scaling**: Incremental zoom steppers (`A-` and `A+`) allowing text scaling between 90% and 160%.
   - **Close Button**: Accessible `×` button with minimum 44×44px touch targets.
2. **Focus Management & Keyboard Accessibility**:
   - Focus is automatically placed inside the dialog when opened.
   - Focus is trapped within interactive controls inside the dialog during the reading session (`Tab` / `Shift+Tab`).
   - Pressing `Escape` immediately dismisses the reader view and restores focus to the invoking launcher/toggle button.
   - Footer contains an explicit "Close Reading Mode" button for touch and keyboard users.

---

## Component Usage

### Basic Compound Integration

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  ReadingModeController,
} from "accessibility-plugin-react";
import "accessibility-plugin-react/styles.css";

export function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <ReadingModeController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### Standalone Extractor Utility

For headless or custom reader implementations, the core extractor function is exported directly:

```ts
import { extractArticleContent } from "accessibility-plugin-react";

const article = extractArticleContent(document.body);
if (article) {
  console.log(`Title: ${article.title}`);
  console.log(
    `Words: ${article.wordCount} (~${article.readingTimeMinutes} min)`,
  );
  console.log(`Sanitized HTML: ${article.html}`);
} else {
  console.log("No readable article content found on this page.");
}
```

---

## Technical Specifications & Verification

- **Feature Key**: `readingMode` (Boolean, default: `false`).
- **Storage Compatibility**: Fully integrated with preference storage modes (`local`, `session`, `none`) and cleanly reset via `resetAll()`.
- **Test Matrix**:
  - `tests/readingMode.test.ts`: Candidate scoring, sensitive field exclusion, protocol sanitization, image alt preservation, and offline execution.
  - `tests/readingModeWidget.test.tsx`: Modal lifecycle, theme switching, Escape key dismissal, host React state persistence across open/close, and Sinhala/Tamil localization.
  - `tests/browser/widget.spec.ts`: Playwright browser smoke test for live extraction, DOM isolation, theme switching, and host button interactivity.
