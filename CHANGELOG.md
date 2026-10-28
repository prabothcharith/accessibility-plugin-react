# Changelog

## Unreleased (Milestone 5 — Launch readiness and package hardening)

- Document full supported-browser, device, and assistive-technology matrix (closes #66).
  - Add comprehensive matrix document in `docs/SUPPORTED_MATRIX.md` covering Chromium, Gecko/Firefox, WebKit, Mobile WebKit, Android, React 18/19, Next.js (App and Pages Router).
  - Document 400% zoom reflow (WCAG 1.4.10) at 320px CSS viewport width, 200% font scaling, and safe area insets (`env(safe-area-inset-*)`).
  - Document high contrast and forced-colors protection (`forced-colors: active` filter suppression and system palette keywords).
  - Verify minimum 44px x 44px touch target sizing across all visible interactive buttons (WCAG 2.5.5 / 2.5.8).
  - Detail screen-reader semantics (NVDA, JAWS, VoiceOver, TalkBack) and explicit architectural boundaries (zero compliance overclaims, Shadow DOM, cross-origin iframes, and platform TTS constraints).
  - Add dedicated Playwright verification test in `tests/browser/widget.spec.ts`.
- Profile performance, bundle sizes, listeners, observers, and memory leaks (closes #67).
  - Add comprehensive profiling documentation in `docs/PERFORMANCE_PROFILING.md` documenting actual raw, gzip, and brotli distributions and real production consumer chunk footprints.
  - Audit closed idle runtime footprint: verifies 0 unthrottled pointer/mousemove listeners, 0 animation frame loops, and 0 polling intervals.
  - Profile 1,000-node DOM scaling and verify multi-feature application and style restoration benchmarks.
  - Stress-test 100 consecutive mount/unmount and toggle cycles, asserting 0 leaked `.arap-root` / `.arap-panel` DOM nodes, 0 residual style tags, and 0 memory drift.
  - Add dedicated test suite in `tests/performanceProfiling.test.tsx`.
- Synchronize documentation, API reference, feature catalogs, and interactive consumer examples (closes #68).
  - Add `CONTRIBUTING.md` guidelines for community contributions, design boundaries, and pull requests.
  - Synchronize `docs/API.md` with complete components table, exported types, and utilities (`SmartContrastController`, `DiagnosticsHarness`, event types, and disclaimers).
  - Synchronize `docs/FEATURES.md` with Smart Contrast Research Prototype documentation.
  - Update `examples/basic-usage/main.tsx` and `examples/next-app/app/components/AccessibilitySettings.tsx` with all prebuilt controllers.
  - Update `examples/index.html` with expanded capabilities.
- Audit dependencies, licenses, CSP compliance, and privacy threat models (closes #69).
  - Add `NOTICE` file detailing copyright, ISC license terms, upstream attribution, and asset origins.
  - Add comprehensive audit document in `docs/SECURITY_AUDIT.md` verifying 0 runtime dependencies, 0 `npm audit` vulnerabilities, strict CSP compliance (0 dynamic `eval`), and 0 unauthorized network calls.
  - Audit sensitive element exclusions (`isSensitiveElement`) and protocol sanitization (`isSafeUrl`).
  - Add automated test suite in `tests/securityAudit.test.ts`.
- Perform packed publish rehearsal and clean consumer smoke testing (closes #70).
  - Add `NOTICE` to package archive files allowlist in `package.json` and verification in `scripts/check-package.mjs`.
  - Verify exact `.consumers/package.tgz` tarball (61 files, 1.18 MB, `"use client";` directives, CSS injection, scoped resets).
  - Verify clean consumer installation and production builds across React 18 (`.consumers/react18`), React 19 with Tailwind CSS (`.consumers/react19`), and Next.js 16 App Router with Webpack and SSR (`.consumers/next`).
  - Document rehearsal verification in `docs/PUBLISH_REHEARSAL.md`.

## 2.28.0 — 2026-10-27

- Implement host-content translation adapter architecture with explicit consent, privacy threat model, sensitive element exclusion, and DOM restoration (closes #65). Completes Milestone 4 ([M4 #26](https://github.com/prabothcharith/accessibility-react/issues/26)).
- Introduce translation adapter architecture (`src/core/translationAdapter.ts`) and controller (`src/features/TranslationController.tsx`):
  - Strictly opt-in research prototype: labeled with `Prototype` pill in the UI; explicit disclaimer (`TRANSLATION_DISCLAIMER`) stating machine translation is an assistive convenience without official WCAG or legal guarantees.
  - Decoupled from widget UI localization: clear architectural boundary between static bundled widget strings (`src/core/i18n/`, `docs/LOCALES.md`) and host document content translation (`docs/TRANSLATION.md`).
  - Strict privacy threat model & sensitive element exclusion: automatically scans and excludes passwords (`input[type="password"]`), credential and financial inputs (`[autocomplete*="password"]`, `[autocomplete*="cc-"]`), email/phone inputs, technical code (`<code>`, `<pre>`, `<kbd>`, `<script>`, `<style>`), media/embedded boundaries (`<iframe>`, `<svg>`, `<canvas>`), explicit opt-out tags (`[translate="no"]`, `.notranslate`, `[data-no-translate]`), hidden elements (`[aria-hidden="true"]`), and the widget UI itself.
  - Cross-origin and iframe boundary protection: strictly excludes `<iframe>` elements to prevent Same-Origin Policy (SOP) violations and cross-frame leakage.
  - Zero default requests: never executes translation on page load or widget opening; requires explicit user consent via "Review & Grant Consent" modal before transmitting text.
  - DOM injection & XSS prevention: updates text nodes exclusively through `Text.textContent`, never `innerHTML`, completely eliminating markup injection and script execution vectors.
  - Idempotent restoration & teardown: provides a synchronous `session.restore()` callback that restores original host text immediately upon user request, consent revocation, or component unmount.
  - Built-in offline mock adapter: `createOfflineMockTranslationAdapter` enables 100% offline development and testing with zero network requests.
- Export `TranslationController`, `TRANSLATION_ERROR_CODES`, `TRANSLATION_DISCLAIMER`, `isSensitiveElement`, `extractTranslatableNodes`, `sanitizeTranslationOutput`, `applyTranslations`, `createOfflineMockTranslationAdapter`, `translateHostContent`, and related types in `src/index.ts`.
- Add documentation in `docs/TRANSLATION.md`, update `README.md`, `docs/FEATURES.md`, `docs/API.md`, `docs/BUILD_AND_RELEASE_PLAN.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 22 unit and integration tests in `tests/translationAdapter.test.ts` and `tests/translationWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.27.0 — 2026-10-27

- Implement voice navigation research prototype with local Web Speech API recognition, strict privacy boundaries, and keyboard alternatives (closes #64).
- Introduce voice navigation engine (`src/core/voiceNavigation.ts`) and controller (`src/features/VoiceNavigationController.tsx`):
  - Strictly opt-in research prototype: labeled with `Prototype` pill in the UI; explicit disclaimer (`VOICE_NAVIGATION_DISCLAIMER`) stating voice commands are an experimental prototype with zero audio or transcript storage.
  - Client-side Web Speech API: utilizes native browser speech recognition (`window.SpeechRecognition` or `window.webkitSpeechRecognition`) with zero external network requests, zero telemetry, and zero remote audio streaming.
  - Explicit finite command vocabulary: recognizes 11 non-destructive navigation and control commands (`open_widget`, `close_widget`, `next_heading`, `previous_heading`, `first_heading`, `scroll_down`, `scroll_up`, `scroll_top`, `scroll_bottom`, `stop_listening`, `help`).
  - High-visibility listening indicator: prominent visual badge with pulsating microphone dot and polite ARIA live region (`aria-live="polite"`) announcing active listening and recognized commands.
  - Inactivity watchdog timeout: automatically stops listening after 30 seconds of silence to prevent accidental continuous background microphone access.
  - Privacy protections & lifecycle cleanup: immediately halts recognition when the document is hidden (`document.hidden`), upon page unload (`beforeunload`, `pagehide`), or on component unmount; guarantees zero persistent storage in `localStorage` or `sessionStorage`.
  - Accessible keyboard alternatives: provides native accessible buttons within the controller for every navigation action ("Next Heading", "Prev Heading", "Scroll Down", "Scroll Up", "Scroll Top", "Scroll Bottom"), remaining 100% operational in unsupported browsers or when microphone permissions are denied.
  - Reduced motion integration: respects `prefers-reduced-motion` and widget `reduceMotion` preference by using instantaneous scrolling (`behavior: "auto"`) instead of smooth transitions.
  - Collapsible commands reference: expandable cheat sheet detailing all recognized commands, spoken phrases, and executed actions.
- Export `VoiceNavigationController`, `VOICE_COMMANDS`, `VOICE_NAVIGATION_DISCLAIMER`, `isSpeechRecognitionSupported`, `normalizeTranscript`, `matchVoiceCommand`, `executeVoiceCommand`, `createVoiceNavigationSession`, and related types in `src/index.ts`.
- Add documentation in `docs/VOICE_NAVIGATION.md`, update `README.md`, `docs/FEATURES.md`, `docs/API.md`, `docs/BUILD_AND_RELEASE_PLAN.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 24 unit and integration tests in `tests/voiceNavigation.test.ts` and `tests/voiceNavigationWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.26.0 — 2026-10-27

- Implement measured smart contrast research prototype with relative luminance, alpha compositing, and full non-destructive restoration (closes #63).
- Introduce smart contrast engine (`src/core/smartContrast.ts`) and controller (`src/features/SmartContrastController.tsx`):
  - Strictly opt-in research prototype: labeled with `Prototype` pill in the UI; explicit disclaimer (`SMART_CONTRAST_DISCLAIMER`) stating calculations are mathematical relative luminance algorithms and do not constitute or guarantee official WCAG compliance.
  - WCAG 2.1 relative luminance algorithm: implements exact standard sRGB component linearization ($c_{linear} = c / 12.92$ or $((c+0.055)/1.055)^{2.4}$) and spectral weighting ($L = 0.2126R + 0.7152G + 0.0722B$).
  - WCAG 2.1 contrast ratio calculation: computes $(L_1 + 0.05) / (L_2 + 0.05)$, supporting AA ($4.5:1$ normal / $3.0:1$ large) and AAA ($7.0:1$ normal / $4.5:1$ large) target thresholds.
  - Backdrop compositing & alpha blending: ascends ancestor trees to composite semi-transparent background colors over parent backdrops up to `document.body` and canvas fallback using Porter-Duff source-over blending.
  - Layout thrashing prevention: strictly separates execution into Batched Reads (collects computed styles), Pure Computation (mathematical evaluation and color caching), and Batched Writes (applies overrides in a single pass), processing 1,000 nodes under 10ms.
  - Unsupported elements reporting: detects and reports CSS gradients (`linear-gradient`, `radial-gradient`), background images (`url(...)`), and `backdrop-filter` as unsupported without guessing; displays an inspectable breakdown of skipped elements.
  - Non-destructive restoration: records original inline styles and CSS priorities; `undo()` completely removes applied overrides and tracking attributes with full idempotency.
  - OS forced-colors protection: automatically detects and yields to system high contrast mode (`forced-colors: active`), preserving native OS themes.
- Export `SmartContrastController`, `calculateRelativeLuminance`, `calculateContrastRatio`, `compositeRgba`, `parseColor`, `isLargeText`, `resolveEffectiveBackdrop`, `isEligibleForSmartContrast`, `evaluateSmartContrast`, `applySmartContrast`, `SMART_CONTRAST_DISCLAIMER`, `TARGET_RATIOS`, `HIGH_CONTRAST_TOKENS`, and related types in `src/index.ts`.
- Add documentation in `docs/SMART_CONTRAST.md`, update `README.md`, `docs/FEATURES.md`, `docs/API.md`, `docs/BUILD_AND_RELEASE_PLAN.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 24 unit and integration tests in `tests/smartContrast.test.ts` and `tests/smartContrastWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.25.0 — 2026-10-27

- Implement optional privacy-safe feature event callbacks with reviewed payloads and data minimization (closes #62).
- Introduce feature event definitions and sanitization (`src/core/events.ts`):
  - Strictly opt-in and disabled by default: no events, telemetry, or network traffic emitted unless consumer explicitly passes `onFeatureEvent` to `<AccessibilityPlugin>`.
  - Zero external network transmission: strictly local in-memory event dispatching inside the hosting application's React tree.
  - Strict privacy protections: event payloads strictly exclude page text, user selections, form inputs, emails, credentials, user identifiers, cookies, device fingerprints, and Web Speech TTS audio recordings or transcripts.
  - Reviewed event types: supports typed `feature-change`, `feature-reset`, `panel-toggle`, `placement-change`, `profile-apply`, and `preset-apply` with coarse categorical identifiers and numerical step levels.
  - Frozen and sanitized payloads: `sanitizeFeatureEvent` validates all fields against an allowlist, strips extraneous properties, and deep-freezes (`Object.freeze`) payloads before dispatch.
  - Consumer error boundary protection: `emitFeatureEvent` catches and silences exceptions thrown inside consumer event listeners to guarantee logging backends never interrupt plugin state updates or crash the application UI.
- Export `sanitizeFeatureEvent`, `emitFeatureEvent`, `AccessibilityFeatureEvent`, `FeatureEventListener`, and related event types in `src/index.ts`.
- Add documentation in `docs/PRIVACY_AND_EVENTS.md`, update `README.md`, `docs/FEATURES.md`, `docs/API.md`, `docs/BUILD_AND_RELEASE_PLAN.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 14 unit and integration tests in `tests/events.test.ts` and `tests/eventsWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.24.0 — 2026-10-27

- Implement development-only integration diagnostics and test harness without private data or compliance claims (closes #61).
- Introduce integration diagnostics engine (`src/core/diagnostics.ts`), developer harness component (`src/core/DiagnosticsHarness.tsx`), and `useDiagnostics` hook (`src/core/useDiagnostics.ts`):
  - Development-only by default: diagnostics routines are inert in production builds (`process.env.NODE_ENV === "production"`), returning an empty report with 0 issues unless explicitly forced via `{ force: true }`.
  - Zero compliance claims: explicit disclaimer on every report (`DIAGNOSTICS_DISCLAIMER`) stating diagnostics evaluate DOM landmarks and host CSS boundaries and do not constitute official WCAG 2.1/2.2 AA certification.
  - Strict privacy guarantees: scans content images for missing `alt` attributes and landmarks without collecting, logging, or exposing private data, user content, sensitive URLs, or auth query parameters.
  - Provider diagnostics: detects multiple `AccessibilityPlugin` instances on the document and diagnoses CSS containing-block traps (ancestor `filter`, `transform`, `perspective`, `backdrop-filter` breaking `position: fixed` viewport layout).
  - Storage diagnostics: tests `localStorage` and `sessionStorage` accessibility, quota boundaries, and sandbox restrictions; warns when operating in memory-only fallback mode.
  - CSP diagnostics: tests dynamic `<style>` injection and CSS custom property manipulation against restrictive Content Security Policy (`style-src`).
  - Host CSS diagnostics: detects root scroll locks (`overflow: hidden` on both `html` and `body`) and extreme host `z-index >= 2,147,483,000` that could obscure widget controls.
  - DOM diagnostics: detects missing `<main>` landmarks, missing `<h1>` page titles, skipped heading hierarchy, and unlabelled content images (`alt`).
  - Boundary diagnostics: detects embedded `<iframe>` elements (noting cross-origin styling boundaries), custom elements with `ShadowRoot`, and sub-body portal mount points.
  - Developer inspection UI: `<DiagnosticsHarness />` provides an accessible floating drawer with category tabs (`provider`, `host-css`, `csp`, `storage`, `dom`, `boundaries`), severity filters (`error`, `warning`, `info`), actionable remediation tips, documentation links, and re-run buttons.
  - Native `AccessibilityPlugin` integration: optional `diagnostics?: boolean | DiagnosticsConfig` prop automatically runs integration audits in development and logs collapsed console groups.
- Export `runDiagnostics`, `checkProviderDiagnostics`, `checkStorageDiagnostics`, `checkCspDiagnostics`, `checkHostCssDiagnostics`, `checkDomDiagnostics`, `checkBoundariesDiagnostics`, `DIAGNOSTICS_DISCLAIMER`, `DiagnosticsHarness`, `useDiagnostics`, and related types in `src/index.ts`.
- Add documentation in `docs/DIAGNOSTICS.md`, update `README.md`, `docs/FEATURES.md`, `docs/API.md`, `docs/BUILD_AND_RELEASE_PLAN.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 27 unit and integration tests in `tests/diagnostics.test.ts` and `tests/diagnosticsWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.23.0 — 2026-10-27

- Implement declarative per-site feature-menu customization and reordering with safe diagnostics and stable rerenders (closes #60).
- Introduce `FeatureMenu` (`src/features/FeatureMenu.tsx`) and `src/core/menuCustomization.ts`:
  - Declarative menu configuration: configure enabled feature IDs, custom ordering, custom labels, custom descriptions, custom component overrides, and suggested defaults via `menuConfig`.
  - Accessible grouped layout: supports visual categorizing into group sections with semantic `<section role="group" aria-labelledby="...">` and descriptive headings.
  - Non-crashing diagnostic safety: invalid, malformed, null, or primitive configurations are validated without throwing runtime exceptions; produces structured `MenuValidationIssue[]` diagnostics and development `console.warn` notifications with safe default fallback.
  - Unreachable accessibility action warnings: diagnoses and warns if `showReset === false`, or if close/reset/help actions become unreachable, ensuring end users can always restore baseline settings.
  - Focus preservation & stable rerendering: memoizes normalized configuration based on deterministic signatures; assigns stable React keys (`key={item.id}`) preventing active input focus loss or control remounting during parent updates.
  - Native integration with `AccessibilityList`: automatically renders `<FeatureMenu config={menuConfig} />` when `children` are omitted; respects `showPositionControls`, `showStatement`, and `showReset` toggles.
  - Preserved canonical IDs: retains all 30 built-in canonical feature IDs mapped directly to their native controllers.
  - Scoped styling: Clean light styles for `.arap-menu-customized`, `.arap-menu-grouped`, `.arap-menu-group`, `.arap-menu-group-heading`, and `.arap-menu-group-desc` with forced-colors support.
- Export `FeatureMenu`, `FeatureMenuProps`, `validateMenuConfig`, `getMenuConfigSignature`, `KNOWN_FEATURE_IDS`, `DEFAULT_MENU_GROUPS`, `DEFAULT_FEATURE_GROUP_MAP`, and related types in `src/index.ts`.
- Add documentation in `docs/MENU_CUSTOMIZATION.md`, update `docs/FEATURES.md`, `docs/API.md`, `README.md`, `docs/PROJECT_STATUS.md`, and `docs/ROADMAP.md`.
- Add 20 unit and integration tests in `tests/menuCustomization.test.ts` and `tests/menuCustomizationWidget.test.tsx`, plus Playwright browser test in `tests/browser/widget.spec.ts`.

## 2.22.0 — 2026-10-27

- Implement accessible terminology dictionary and provider interface with 100% offline local static glossaries, sanitization policy, and focus restoration (closes #59).
- Introduce `DictionaryController` (`src/features/DictionaryController.tsx`) and `src/core/dictionary.ts`:
  - Explicit user action lookup: lookups only run upon deliberate user action (form submission or clicking "Look up"); never auto-queries on hover, focus, text selection, or route change.
  - Zero network transmission by default: 100% offline static glossaries in English, Sinhala, and Tamil; `fetch()` and network requests are never called when provider is off.
  - Strict input sanitization & privacy: strips HTML and control characters, caps search terms to 50 characters, preserves Unicode combining marks (`\p{M}`) for Indic scripts (Sinhala, Tamil), and rejects sensitive/private patterns (emails, credit cards, bearer/auth tokens, API keys, URLs).
  - Truthful unknown results: never hallucinates or fabricates definitions for unknown words; returns `found: false` with honest messaging and clickable suggestions.
  - Accessible modal dialog: `role="dialog"`, `aria-modal="true"`, focus trapping (`Tab` / `Shift+Tab`), search input autofocus, and `Escape` dismissal.
  - Focus restoration guarantee: closing the dialog via `Escape` key or `Close dictionary` button returns keyboard focus back to the triggering button.
  - Pluggable `DictionaryProvider` interface: supports custom remote backends with rate limiting (minimum 400ms interval) and automatic fallback to local dictionary on network error.
  - Keyboard shortcut: registered `Alt+D` (`dictionary`) in `DEFAULT_SHORTCUTS` with collision checking and form field protection.
  - Review-approved localizations: full English (`en`), Sinhala (`si`, `si-LK`), and Tamil (`ta`, `ta-LK`) strings for dictionary UI, statuses, and native glossary entries.
  - Scoped styling: Clean light modal dialog, search input, clear button, definition card, part-of-speech badge, and suggestion chips meeting >=44px by 44px touch target guidelines with forced-colors and reduced-motion support.
- Export `DictionaryController`, `DictionaryControllerProps`, `DictionaryEntry`, `DictionaryLookupResult`, `DictionaryProvider`, `sanitizeLookupTerm`, `lookupLocalDictionary`, `lookupWord`, `LOCAL_DICTIONARY_EN`, `LOCAL_DICTIONARY_SI`, and `LOCAL_DICTIONARY_TA` in `src/index.ts`.
- Add documentation in `docs/DICTIONARY.md`, update `docs/FEATURES.md`, `docs/API.md`, `README.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add 24 unit and integration tests in `tests/dictionary.test.ts` and `tests/dictionaryWidget.test.tsx`, plus Playwright browser smoke test in `tests/browser/widget.spec.ts`.

## 2.21.0 — 2026-10-27

- Implement opt-in saturation and grayscale modes with chart/image advisory warnings, forced-colors protection, and instant reset across Chromium, Firefox, and WebKit (closes #58).
- Enhance `SaturationController` and `src/core/effects.ts`:
  - Support opt-in `Off` (0 / "original"), `Low` (1 / "low", 20% chroma `saturate(0.2)`), `High` (2 / "high", 200% chroma `saturate(2)`), and `Grayscale` (3 / "grayscale", 100% monochrome `grayscale(1)`).
  - Optional `includeGrayscale` prop (defaults to `true`) allowing developers to include or omit the grayscale segment within the saturation group.
  - Documented chart and image risk advisories (`role="note"`, `aria-live="polite"`):
    - Low saturation advisory: warns that reduced color differences may make color-dependent charts, maps, and status badges harder to distinguish per WCAG 1.4.1.
    - High saturation advisory: warns that 200% chroma may produce visual glare or photographic color clipping.
    - Grayscale advisory: warns that all color is removed and charts relying on color alone may require alternative labels.
    - Optional `showAdvisory` prop (defaults to `true`) to control advisory display.
- Enhance `GrayscaleController`:
  - Accessible standalone toggle with active state check, `showAdvisory` support, and forced-colors detection.
- Add forced-colors (Windows High Contrast Mode) protection:
  - Detects `@media (forced-colors: active)` and bypasses filter injection to preserve authoritative OS contrast palettes without compounding.
  - Renders live status announcement (`role="status"`, `aria-live="polite"`) informing users that filters are bypassed for OS contrast.
- Ensure instant, non-destructive reset across Chromium, Firefox, and WebKit:
  - Scoped effect cleanup restores prior inline host filter styles or removes property without leaving stale filters or artificial containing blocks.
- Register `saturation` values (`0, 1, 2, 3, "original", "low", "high", "grayscale"`) in `builtins` schema with versioned persistence.
- Add keyboard shortcut for Grayscale (`Alt+G`) in `DEFAULT_SHORTCUTS`.
- Provide complete Sinhala (`si`, `si-LK`) and Tamil (`ta`, `ta-LK`) localizations for all saturation levels, Grayscale, and advisory notices.
- Export `SaturationControllerProps` and `GrayscaleControllerProps` in `src/index.ts`.
- Add documentation in `docs/SATURATION_AND_GRAYSCALE.md`, updated `docs/FEATURES.md`, `docs/API.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add 13 unit/integration tests in `tests/saturationAndGrayscale.test.tsx` and Playwright browser smoke test in `tests/browser/widget.spec.ts`.

## 2.20.0 — 2026-10-27

- Implement user-initiated read-aloud TTS with voice, rate, pitch, and stop controls (closes #57).
- Introduce `ReadAloudController` and `src/core/readAloud.ts`:
  - 100% native Web Speech API (`window.speechSynthesis`) integration with zero network transmission, external servers, telemetry, transcripts, or recordings.
  - Strictly opt-in user initiation requiring explicit activation (button click or `Alt+L`); never automatically speaks on mount, route changes, or profile activation per WCAG 1.4.2 Audio Control.
  - Natural text chunking: splits continuous prose into sentence / breath group chunks (~60–180 chars) to prevent Chromium's 15-second utterance lockup bug while maintaining seamless playback across paragraphs.
  - Sensitive field exclusion: strictly eliminates `<input>`, `<textarea>`, `<select>`, `<button>`, passwords, credit card fields (`[autocomplete*="cc-"]`), `[data-sensitive]`, hidden elements (`aria-hidden="true"`, `display: none`), and widget internals (`[data-arap-ui]`, `.arap-widget`, `.arap-panel`).
  - Selection priority: reads active user text selection if present; otherwise extracts clean article content from `<article>`, `<main>`, or the document body.
  - Full playback controls: Play, Pause, Resume, and Stop controls with live status updates (`role="status"`, `aria-live="polite"`).
  - Floating player bar portal (`.arap-read-aloud-bar`): remains accessible when the widget panel is closed, providing instant access to Pause/Resume and Stop.
  - Voice selection dropdown dynamically populated from `speechSynthesis.getVoices()` with automatic change detection.
  - Stepper controls for rate (`0.5x`–`2.0x` with 0.25x steps) and pitch (`Low`, `Normal`, `High`) meeting >=44px by 44px touch target guidelines across all viewports.
  - Lifecycle safety: stops speech synthesis on `Escape` key (window capture phase), component unmount, `pagehide`, `beforeunload`, and tab hiding (`visibilitychange`).
- Add full Sinhala (`si`, `si-LK`) and Tamil (`ta`, `ta-LK`) localizations for all read-aloud controls, statuses, and pitch/speed labels.
- Register `readAloud`, `readAloudRate`, `readAloudPitch`, and `readAloudVoice` in `builtins` schema with versioned persistence.
- Export `ReadAloudController`, `ReadAloudControllerProps`, `isSpeechSynthesisSupported`, `getSpeechVoices`, `subscribeSpeechVoices`, `getActiveSelectionText`, `extractReadAloudText`, `splitTextIntoChunks`, `ReadAloudSession`, and `READ_ALOUD_EXCLUDED_SELECTORS`.
- Add documentation in `docs/READ_ALOUD.md`, update `docs/FEATURES.md`, `docs/API.md`, `README.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add 14 unit tests in `tests/readAloud.test.ts`, 9 integration tests in `tests/readAloudWidget.test.tsx`, and Playwright browser smoke test in `tests/browser/widget.spec.ts`.

## 2.19.0 — 2026-10-27

- Implement discoverable keyboard shortcut help, collision-safe remapping, and Link Explorer (closes #56).
- Introduce `KeyboardShortcutsController` and `src/core/shortcuts.ts`:
  - Discoverable shortcut cheat sheet with category filters (`All`, `Widget`, `Navigation`, `Reading`, `Tools`) and search box.
  - Global shortcuts kept off by default (`shortcutsEnabled: false`) to avoid interfering with screen readers and page commands per WCAG 2.1.4.
  - Optional user-controlled global shortcuts switch with accessible toggle.
  - Reserved browser command protection: strictly blacklists hijacking `Ctrl+U` (view source), `Ctrl+R` (reload), `Ctrl+T`, `Ctrl+W`, `Ctrl+N`, `Ctrl+P`, `Ctrl+F`, `Ctrl+S`, `F5`, `F12`, etc.
  - Form field protection guard (`isFormFieldOrEditable`): suppresses global hotkeys when focus is inside text inputs, textareas, selects, comboboxes, or `contenteditable` elements.
  - Collision-checked remapping: validates proposed shortcuts against other active plugin commands and enforces modifier key requirements.
  - Persistent custom remappings stored under `customShortcuts` with one-click "Reset to Defaults".
  - Persistent button alternatives: 100% of shortcut actions are directly accessible via interactive focusable buttons.
  - Modal reader overlay with `role="dialog"`, `aria-modal="true"`, focus trap, and Escape dismissal.
- Enhance `PageNavigatorController` and `src/core/pageNavigator.ts` with Link Explorer:
  - Add `scanLinks` utility to discover all visible links (`a[href]`) on the page in true DOM order.
  - Add dedicated `Links` tab alongside `Headings` and `Landmarks`.
  - Badges for `LINK` (internal), `ANCHOR` (hash jump), and `EXT` (external destination / new tab).
  - Uninformative link text warning badge (`Ambiguous`) for links with non-descriptive text (e.g. "click here", "read more").
  - Safe focus and smooth scroll navigation via temporary `tabindex="-1"` without modifying host markup.
- Add full Sinhala (`si`, `si-LK`) and Tamil (`ta`, `ta-LK`) localizations for all shortcut titles, descriptions, categories, and collision messages.
- Export `KeyboardShortcutsController`, `KeyboardShortcutsControllerProps`, `scanLinks`, `LinkItem`, `DEFAULT_SHORTCUTS`, `RESERVED_BROWSER_SHORTCUTS`, `normalizeKeyCombo`, `parseKeyboardEventToCombo`, `isFormFieldOrEditable`, `validateShortcutRemap`, `resolveActiveShortcut`, `ShortcutDefinition`, and `ValidationResult`.
- Add documentation in `docs/KEYBOARD_SHORTCUTS.md`, updated `docs/FEATURES.md`, `docs/API.md`, `README.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add 16 unit tests in `tests/shortcuts.test.ts`, 5 unit tests in `tests/linkExplorer.test.ts`, 8 integration tests in `tests/shortcutsWidget.test.tsx`, and Playwright browser smoke test in `tests/browser/widget.spec.ts`.

## 2.18.0 — 2026-10-27

- Implement non-destructive reading mode proof of concept (closes #55).
- Introduce `ReadingModeController` and `extractArticleContent`:
  - Non-destructive article content extraction using in-memory candidate cloning without mutating, rewriting, or unmounting host React DOM elements.
  - Automatically identifies substantive content from `<article>`, `[role="article"]`, `<main>`, `[itemprop="articleBody"]`, and text-dense content containers.
  - Retains semantic structure: headings (`h1`–`h6`), paragraphs, clean links (`a[href]`), lists, blockquotes, code blocks, and images with `alt` text.
  - Strictly filters out navigation headers, footers, sidebars, cookie banners, advertisements, dialogs, scripts, styles, and iframes.
  - Sensitive field exclusion: strictly eliminates password inputs, credit card fields, tokens, and form controls to prevent private data leakage.
  - Client-side confidentiality: 100% in-memory extraction with zero external network requests, third-party APIs, or telemetry.
  - Honest fallback and error recovery: pages lacking readable articles communicate a polite status announcement without crashing or trapping keyboard focus.
  - Accessible reading overlay dialog (`role="dialog"`, `aria-modal="true"`):
    - Full keyboard trap and `Escape` key dismissal with focus restoration to the triggering control.
    - Word count and estimated reading time calculation.
    - Reader theme switcher: Light, Sepia (reduced blue light), and Dark modes.
    - Reader text scaling: 90% to 160% zoom steppers (`A-` / `A+`).
    - Full localization support in English, Sinhala (`කියවීමේ මාදිලිය`), and Tamil (`வாசிப்பு முறை`).
- Register `readingMode` in `builtins` schema with versioned persistence and reset integration.
- Export `ReadingModeController`, `ReadingModeControllerProps`, `extractArticleContent`, `findArticleCandidate`, `countWords`, `estimateReadingTime`, and `ArticleContent`.
- Add documentation in `docs/READING_MODE.md`, updated `docs/FEATURES.md`, `docs/API.md`, `README.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add unit test suite in `tests/readingMode.test.ts`, integration tests in `tests/readingModeWidget.test.tsx`, and Playwright browser smoke test in `tests/browser/widget.spec.ts`.

## 2.17.0 — 2026-10-27

- Implement reviewed Sinhala and Tamil locale packs with accessibility review (closes #54).
- Introduce built-in `siLocale` (Sinhala: `si`, `si-LK`) and `taLocale` (Tamil: `ta`, `ta-LK`):
  - Native-speaker and accessibility-reviewed translations for panel titles, hints, options, and actions.
  - Natural localized coordinate strings (`formatPointPosition`) and corner labels (`formatCornerPosition`, `cornerNames`).
  - Localized search input placeholders, search clear buttons, and live polite count announcements (`formatSearchCount`).
  - Localized polite status announcements for profile switching and preset save/apply/delete actions.
  - Default localized feature names for controllers (`විශාල අකුරු` / `பெரிய உரை`, `ප්‍රවේශ්‍යතා පැතිකඩ` / `அணுகல்தன்மை சுயவிவரங்கள்`, `සුරකින ලද පෙරසැකසුම්` / `சேமிக்கப்பட்ட முன்னமைவுகள்`).
- Untranslated host content boundary:
  - Widget localization strictly covers its own controls, hints, and announcements.
  - Host application content, headings, and forms remain completely untouched and are never modified.
  - Root widget panel tagged with `translate="no"` to prevent browser auto-translation mangling of ARIA semantics.
- Automatic HTML `lang` detection:
  - When `locale` prop is omitted, automatically resolves `document.documentElement.lang` (e.g. `<html lang="si-LK">` or `<html lang="ta-LK">`) without requiring manual configuration.
- Right-to-Left (RTL) Writing Direction Infrastructure:
  - Bidirectional alignment (`text-align: start`) for all controls.
  - Automatically applies `dir="rtl"` when RTL locales (`ar`, `he`, `fa`, `ur`) are detected via `isRtlLocale`.
  - Preserves Left-to-Right (`dir="ltr"`) for Sinhala and Tamil Indic scripts.
  - Logical positioning properties (`inset-inline-end`) for search clear button.
  - Physical spatial direction retained for keyboard movement arrows.
- Typography & Complex Script Fallbacks:
  - Enhanced `.arap-root` scoped font stack with `"Noto Sans Sinhala"`, `"Iskoola Pota"`, `"Noto Sans Tamil"`, `"Latha"`, `"Nirmala UI"` fallbacks to prevent glyph clipping and missing glyph boxes.
- Export `siLocale`, `taLocale`, `SupportedLocale`, and `FeatureLocaleLabels`.
- Add documentation in `docs/LOCALES.md`, updated `docs/FEATURES.md`, `docs/API.md`, `README.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add unit test suites in `tests/i18n.test.ts` and `tests/localeWidget.test.tsx`, and automated browser smoke test in `tests/browser/widget.spec.ts`.

## 2.16.0 — 2026-10-27

- Implement custom saved presets and settings import/export (closes #53).
- Introduce `PresetsController`, `CustomPresetsController`, `SettingsImportExportController`, and `PresetsBackupController`:
  - 1-click preset saving with custom name, date, and settings chips preview.
  - Apply, delete, and manage named custom preference combinations.
  - Versioned JSON export with schema envelope reference (`version: 1`), application identity, and timestamp.
  - Safe JSON import supporting v1 envelopes, legacy preset arrays, and flat settings objects.
  - Live announcements (`role="status"` / `aria-live="polite"`) for save, apply, delete, export, and import operations.
  - Accessible error reporting on malformed JSON, empty files, or unsupported schema versions.
- Strict Privacy & Security Exclusions:
  - Presets and JSON exports strictly filter allowed accessibility preferences only.
  - Discards all private content, form inputs, session tokens, user credentials, transcripts, and recordings.
  - Rejects prototype pollution keys (`__proto__`, `constructor`, `prototype`).
- Presets library preserved across "Reset All" display resets.
- Introduce `usePresets()` hook exposing `presets`, `currentSettings`, `saveCurrentAsPreset`, `applyPreset`, `deletePreset`, `exportPresets`, `downloadExport`, `importFromJson`, and `importFromFile`.
- Export preset utilities: `createCustomPreset`, `isValidCustomPreset`, `exportPresetsToJson`, `downloadJsonFile`, `validateAndParseImport`, `applyCustomPresetToStore`, `sanitizePreferences`, `ALLOWED_PREFERENCE_KEYS`.
- Add documentation in `docs/PRESETS.md` and updated `docs/FEATURES.md`, `docs/API.md`, and `docs/BUILD_AND_RELEASE_PLAN.md`.
- Add unit test suite in `tests/presets.test.tsx` and automated browser smoke test in `tests/browser/widget.spec.ts`.

## 2.15.0 — 2026-10-27

- Implement eight accessibility profiles and deterministic override model (closes #52).
- Introduce `ProfilesController`, `ProfileController`, and `AccessibilityProfilesController` to preview, apply, and revert eight neutral accessibility profile suggestions:
  - **Motor Impaired** (`motor`): Enhanced focus rings (`highlightFocus`), richer tooltips (`tooltips`), and reduced motion (`reduceMotion`).
  - **Blind & Screen Reader** (`blind`): Semantic assistance and accessible authored descriptions (`tooltips`) with zero speech synthesis or microphone prompts.
  - **Color Blind** (`color-blind`): High contrast accents (`contrastMode: "high"`) and non-color-only link indicators (`highlightLinks`).
  - **Dyslexia Friendly** (`dyslexia`): Legible typeface (`fontFamily: "dyslexia-option"`), reading guide line (`readerMode: "guide"`), and reduced motion (`reduceMotion`).
  - **Low Vision** (`low-vision`): Enlarged text (`fontScale: 1.25`), large cursor pointer (`cursorSize: "large"`), and high-visibility focus (`highlightFocus`).
  - **Cognitive & Learning** (`cognitive`): Mild text scaling (`fontScale: 1.125`), reading guide line (`readerMode: "guide"`), distraction reduction (`reduceMotion`), and tooltips (`tooltips`).
  - **Seizure & Epileptic** (`seizure`): Pauses nonessential motion and reduces transition flashes (`reduceMotion: true`).
  - **ADHD / Focus** (`adhd`): Reading mask spotlight (`readerMode: "mask"`) and reduced animation distraction (`reduceMotion: true`).
- Deterministic override model & independent choice survival:
  - Preserves baseline custom preferences in `baseSnapshot` when applying any profile.
  - Transparently tracks explicit user adjustments made while a profile is active in `overrides`.
  - When reverting to custom settings, untouched settings return to their pre-profile base values, while all explicit user adjustments survive intact.
  - Supports direct atomic transitions between profiles.
- Privacy & Safety Guardrails:
  - Zero implicit audio, speech synthesis, or microphone activation.
  - Neutral suggestions without medical efficacy claims.
  - Never mutates native keyboard tab order or introduces modal traps.
- Export `useProfiles()` hook, `ALL_PROFILE_IDS`, `mapProfileSettingsToFeatures`, `mapFeaturesToProfileSettings`, `applyProfileToStore`, `revertProfileFromStore`, `recordProfileOverride`, and `ActiveProfileState` types.
- Add comprehensive documentation in `docs/PROFILES.md`.
- Add unit test suite in `tests/profiles.test.tsx` and automated browser smoke test in `tests/browser/widget.spec.ts`.

## 2.14.0 — 2026-10-27

- Implement page headings and landmarks navigator (closes #51).
- Introduce `PageNavigatorController`, `HeadingsNavigatorController`, and `PageStructureController` to explore, search, and jump to semantic headings (`h1`–`h6`) and named landmarks (`banner`, `navigation`, `main`, `region`, `complementary`, `contentinfo`, `search`, `form`) across the page.
- Truthful page scanning:
  - Scans genuine document headings in DOM document order and computes structural depth levels.
  - Scans genuine top-level semantic HTML landmarks (`<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section aria-labelledby/label>`, `<form aria-labelledby/label>`) and ARIA landmark roles (`role="banner"`, `role="navigation"`, etc.).
  - Correctly ignores scoped `<header>` and `<footer>` elements inside `<article>`, `<aside>`, `<main>`, `<nav>`, or `<section>` per HTML-AAM specifications.
  - Strictly ignores unnamed generic `<section>` and `<form>` elements and widget internals marked with `[data-arap-ui]`.
  - Truthfully reports empty states when pages contain no headings or landmarks instead of fabricating synthetic hierarchy.
- Safe keyboard focus & scroll navigation:
  - Automatically scrolls target into view with `block: 'start'` and respects `prefers-reduced-motion` (`behavior: 'smooth'` or `'auto'`).
  - Sets a temporary `tabindex="-1"` on non-focusable elements and installs a one-time `blur` listener that cleans up the temporary attribute immediately upon focus transfer, ensuring host document tab sequences are never permanently altered.
- Dynamic SPA route change observation without loops:
  - Employs `MutationObserver` debounced via `requestAnimationFrame` to detect DOM additions, removals, and attribute mutations.
  - Filters out mutations occurring inside `[data-arap-ui]` to guarantee zero feedback loops while the navigator dialog is open and interactive.
- Accessible modal dialog & tabbed navigation:
  - Headings and Landmarks tab interface with Left/Right arrow key navigation, `aria-selected`, and `role="tabpanel"`.
  - Accessible search filtering (`aria-label="Filter headings and landmarks"`) with live status announcements.
  - Native dismiss button and `Escape` key shortcut support.
- Export `scanHeadings`, `scanLandmarks`, `navigateToElement`, and `subscribePageStructure` utilities alongside `HeadingItem`, `LandmarkItem`, and `PageNavigatorControllerProps` types.
- Add comprehensive documentation in `docs/PAGE_NAVIGATOR.md`.
- Add unit test suite in `tests/pageNavigator.test.tsx` and automated browser smoke test in `tests/browser/widget.spec.ts`.

## 2.13.0 — 2026-10-27

- Implement accessible tooltips from authored descriptions (closes #50).
- Introduce `TooltipsController` and `AccessibleTooltipsController` alias to toggle accessible tooltips on pointer hover and keyboard focus.
- Extract authored descriptions only: supports `aria-description` (W3C ARIA 1.3), `aria-describedby` ID references, `aria-label` (on icon-only elements or when differing from visible text), `alt` text on images, and `title` attributes without ever inventing text or modifying host DOM attributes.
- Privacy protection: strictly excludes password inputs (`type="password"`), sensitive autocomplete fields (`current-password`, `new-password`, `cc-number`, `cc-csc`, `one-time-code`), and elements marked with `data-sensitive="true"`.
- Zero redundant AT announcements: marks visual tooltip overlay with `role="presentation"` and `aria-hidden="true"` to prevent double-announcement of accessible names and descriptions already spoken natively by screen readers.
- Zero focus loss: tooltip overlay is non-focusable and never steals focus from the active host element.
- Fully WCAG 2.1 SC 1.4.13 compliant (Content on Hover or Focus):
  - **Dismissible**: `Escape` key immediately dismisses the active tooltip without moving pointer or keyboard focus.
  - **Hoverable**: Pointer can move directly over the tooltip overlay itself without it closing.
  - **Persistent**: Remains visible until pointer/focus leaves, user presses Escape, or element unmounts.
- Viewport collision handling: horizontally clamped within viewport boundaries, automatically flips to bottom placement when top space is insufficient, and updates position smoothly on scroll and resize.
- Export `getAuthoredDescription`, `positionTooltip`, and `enableAccessibleTooltips` utilities.
- Add comprehensive documentation in `docs/TOOLTIPS.md`.
- Add unit test suite in `tests/accessibleTooltips.test.tsx` and browser smoke verification in `tests/browser/widget.spec.ts`.

## 2.12.0 — 2026-10-27

- Implement capability-aware cursor enlargement, pointer-transparent reading guide, and adjustable reading mask (closes #49).
- Add capability awareness to `BigCursorController` and `hasFinePointer()` / `subscribeFinePointer()` utilities: detects `(pointer: fine)` hardware and suppresses cursor styles on touch-only devices to avoid non-functional CSS artifacts.
- Enforce strict pointer transparency (`pointer-events: none !important`, `user-select: none !important`, `touch-action: none !important`) on reading guide and reading mask overlays, ensuring clicks, selections, context menus, and focus pass unimpeded to underlying host elements.
- Enhance reading guide and reading mask with multi-input tracking: tracks mouse and pointer movements, touch drag gestures (`touchstart`, `touchmove`), active keyboard focus (`focusin`), and viewport scroll.
- Add adjustable reading aperture window for `ReadingMaskController` via stepper buttons (`−` / `+`) and `readingMaskHeight` feature schema (40–400px range, default 100px), with `DEFAULT_READING_MASK_HEIGHT` and `READING_MASK_HEIGHT_PRESETS`.
- Support keyboard alternatives: `Escape` immediately dismisses active reading aids and synchronizes store state; `Alt+ArrowUp` and `Alt+ArrowDown` (as well as controller nudge buttons) move reading aids up or down by 30px.
- Export `nudgeReadingAid` utility and controller prop interfaces (`BigCursorControllerProps`, `ReadingMaskControllerProps`, `ReadingGuideControllerProps`).
- Add comprehensive documentation in `docs/READING_AIDS.md`.
- Add unit test suite in `tests/readingAids.test.tsx` and automated browser smoke test in `tests/browser/widget.spec.ts`.

## 2.11.0 — 2026-10-27

- Visual regression, cross-feature composition, and performance sweep across Milestone 2 features (closes #48).
- Verify simultaneous composition of A11Y-201..207 (text scaling, spacing, alignment, legible fonts, contrast modes, link highlight, focus visibility, reduce motion, and decorative image hiding) on dense application dashboards, forms, and media layouts with clean reset restoration.
- Verify 100 consecutive rapid toggles with zero style compounding, font-size drift, or memory leakage.
- Benchmark DOM scaling performance on 1,000-node documents under real browser environments and verify the 4,000-element safety budget (`MAX_HOST_ELEMENTS`) protecting the main UI thread.
- Verify 200% zoom and 320px viewport responsive reflow without layout clipping or false modal traps.
- Add comprehensive regression and performance test suite in `tests/regressionSweep.test.tsx` and automated browser smoke benchmark in `tests/browser/widget.spec.ts`.
- Document empirical benchmark measurements, testing methodology, and boundary conditions in `docs/REGRESSION_AND_PERFORMANCE.md`.
- Conclude and sign off Milestone 2 (Core visual and typographic adjustments).

## 2.10.0 — 2026-10-26

- Refine decorative image handling and safeguard informative and functional visuals (closes #47).
- Hide only eligible decorative imagery (`alt=""`, `role="presentation"`, `role="none"`, `aria-hidden="true"`, `data-decorative`) and remove decorative CSS background images from non-functional containers.
- Strictly preserve interactive controls (`<a>`, `<button>`, inputs, ARIA interactive roles), CAPTCHA challenges, charts, graphs, diagrams, maps, QR codes, and images with meaningful accessible names or descriptions.
- Ensure the library never fabricates, synthesizes, or modifies `alt` text or accessible names on host elements.
- Export `HideDecorativeImagesController` alias alongside `HideImagesController`.
- Export `isEligibleDecorativeImage` and `isFunctionalOrMeaningfulImage` element classification utilities.
- Add comprehensive documentation in `docs/DECORATIVE_IMAGES.md`.
- Add unit test suite in `tests/decorativeImages.test.tsx` and browser smoke verification in `tests/browser/widget.spec.ts`.

## 2.9.0 — 2026-10-26

- Implement reduced motion and best-effort media controls (closes #46).
- Introduce `ReduceMotionController` providing an accessible toggle to suppress animations, smooth scrolling, and autoplaying media.
- Inject scoped style overrides (`animation-duration: 0.001ms !important`, `animation-iteration-count: 1 !important`, `transition-duration: 0.001ms !important`, `scroll-behavior: auto !important`) protecting widget UI and ensuring transition callbacks dispatch cleanly without lockups.
- Pause actively running Web Animations API (WAAPI) animations on host elements and track them for selective resumption upon teardown.
- Explicitly pause playing HTML5 `<video>` and `<audio>` elements without ever autoplays on reset or teardown.
- Export `isReducedMotionActive` and `subscribeReducedMotion` for OS `prefers-reduced-motion` detection.
- Document animation pausing architecture, GIF limitations, and cross-origin boundaries in `docs/REDUCE_MOTION.md`.
- Add unit test suite in `tests/reduceMotion.test.tsx` and browser smoke test in `tests/browser/widget.spec.ts`.

## 2.8.0 — 2026-10-26

- Implement non-color-only link highlighting, enhanced focus visibility, and authentic skip-to-main landmark link (closes #45).
- Add `HighlightFocusController` (and `FocusHighlightController` alias) featuring a high-visibility dual-ring focus outline (3px solid #2563eb outer ring with 5px white halo) for keyboard navigation.
- Yield focus rings to `Highlight` system color under `@media (forced-colors: active)` and explicitly preserve disabled control semantics (`*:disabled:focus-visible`, `*[aria-disabled="true"]:focus-visible`).
- Enhance `LinkHighlightController` with non-color underline cues (`text-decoration: underline`, `text-decoration-thickness: 2px`, `text-underline-offset: 3px`) while preserving disabled links and system `LinkText` in forced-colors mode.
- Introduce `SkipToMainLink` and `findMainLandmark()` utility, dynamically detecting native `<main>` or `[role="main"]` landmarks and rendering an accessible skip link only when an authentic landmark exists.
- Add comprehensive documentation in `docs/LINKS_AND_FOCUS.md`.
- Add unit test suite in `tests/linksAndFocus.test.tsx` and browser smoke coverage in `tests/browser/widget.spec.ts`.

## 2.7.0 — 2026-10-26

- Implement semantic contrast modes (`original`, `light`, `dark`, `high`, `invert`) and native operating system forced-colors protection (closes #44).
- Introduce `ContrastModeController` providing one-click switching between semantic contrast tokens with Clean light design and pressed states.
- Enhance `ContrastController` with semantic tokens (`Light`, `Dark`, `High Contrast`, `Invert`) alongside existing contrast multiplier steps and legacy palettes.
- Export `CONTRAST_MODES`, `ContrastModeValue`, `isForcedColorsActive`, `CONTRAST_PROTECTED_SELECTOR`, `isProtectedFromContrast`, `CONTRAST_PALETTES`, and `ContrastPalette`.
- Protect non-text media (`img`, `picture`, `video`, `canvas`, `svg`), data visualizations, charts, icon glyphs, and widget internals from destructive background and color overrides.
- Invert mode preserves photography, artwork, and streaming media by applying mathematical counter-inversion (`filter: invert(1)`), preventing photographic negative distortion.
- Preserve form validation cues (`[aria-invalid="true"]`, `:invalid`, `.is-invalid`) and disabled control states (`:disabled`, `[aria-disabled="true"]`).
- Detect native OS `forced-colors: active` (e.g., Windows High Contrast Mode); bypass inline filter and color overrides to guarantee native system high contrast theme fidelity without interference.
- Document contrast architecture, tokens, and protections in `docs/CONTRAST.md`.
- Add unit test suite in `tests/contrastModes.test.tsx` and browser smoke coverage in `tests/browser/widget.spec.ts`.

## 2.6.0 — 2026-10-26

- Add scoped text alignment, legible fonts, and dyslexia-friendly font options with script fallbacks and symbol/code protections (closes #43).
- Scope `TextAlignController` strictly to logical text blocks (`p`, `h1`–`h6`, `li`, `blockquote`, `dt`, `dd`, `figcaption`, `[role="paragraph"]`, `[role="heading"]`), preventing distortions on tables, buttons, inputs, and code blocks.
- Add accessible WCAG SC 1.4.8 justification advisory warning in `TextAlignController` (&ldquo;rivers of white&rdquo; readability notice).
- Introduce `FontFamilyController` with `Default`, `Legible`, and `Dyslexia` segmented options.
- Export `FONT_FAMILY_PRESETS`, `FontFamilyPreset`, `LEGIBLE_FONT_STACK`, `DYSLEXIA_FONT_STACK`, `FONT_FAMILY_PROTECTED_SELECTOR`, `isProtectedFromFontFamily`, `TEXT_ALIGN_BLOCK_SELECTOR`, and `isProtectedFromTextAlign`.
- Add script fallbacks for Sinhala (`Noto Sans Sinhala`, `Iskoola Pota`, `Nirmala UI`) and Tamil (`Noto Sans Tamil`, `Latha`, `Nirmala UI`).
- Protect code blocks (`pre`, `code`, `kbd`, `samp`, `var`), SVGs, and icon fonts from font overrides, isolating monospace inheritance.
- Document font licensing details for OpenDyslexic (SIL OFL v1.1 / CC-BY 3.0) and system font stacks in `docs/FONTS.md`.
- Add comprehensive unit tests in `tests/textAlignmentAndFonts.test.tsx` and browser tests in `tests/browser/widget.spec.ts`.

## 2.5.0 — 2026-10-26

- Add independent letter spacing, word spacing, and paragraph spacing with script-aware limits and line-height options (closes #42).
- Introduce `WordSpacingController` (stepper 0–10px, step 1) and `ParagraphSpacingController` (stepper 0–32px, step 4).
- Enhance `LineHeightController` with `stepPresets` and custom `steps` props snapping to standard WCAG SC 1.4.12 line height options (100%, 150%, 175%, 200% / 1.0x, 1.5x, 1.75x, 2.0x).
- Export `LINE_HEIGHT_STEPS`, `LINE_HEIGHT_RATIOS`, `TEXT_SPACING_EXCLUDED_SELECTOR`, `isProtectedFromTextSpacing`, and `getScriptSpacingConstraints`.
- Protect tables (`table`, `thead`, `tbody`, `tr`, `th`, `td`), form controls, code blocks (`pre`, `code`), and widget internals from disruptive spacing and line-height overrides, including explicit isolation against CSS inherited properties.
- Implement language- and script-aware constraints: automatically suppress letter spacing on connected/cursive scripts (Arabic, Perso-Arabic, Urdu, or `dir="rtl"`) to preserve cursive glyph ligatures, and clamp letter spacing (<=1px) on Indic scripts (Sinhala, Tamil, Devanagari) to preserve character conjuncts and dependent vowel signs.
- Support combined W3C WCAG 2.1 SC 1.4.12 text spacing scenarios (1.5x line height, 2x paragraph spacing, 0.12x letter spacing, 0.16x word spacing) with exact restoration on reset.
- Add comprehensive unit tests in `tests/textSpacing.test.tsx` and packed browser integration tests in `tests/browser/widget.spec.ts`.

## 2.4.0 — 2026-10-23

- Implement reflow-safe stepwise text scaling (`1.0`, `1.125`, `1.25`, `1.5`, `2.0`) via scoped CSS properties without CSS transforms (closes #41).
- Introduce `TextScaleController` component dedicated to WCAG SC 1.4.4 / 1.4.10 reflow-safe text enlargement.
- Enhance `FontSizeController` with `stepScale` and custom `steps` props while maintaining backward compatibility with continuous 10% steps.
- Export `TEXT_SCALE_STEPS`, `TextScaleStep`, `TEXT_SCALE_PROTECTED_SELECTOR`, and `isProtectedFromTextScale`.
- Protect form controls (`input`, `textarea`, `select`, `button`), labels, code blocks (`pre`, `code`, `kbd`, `samp`), vector icons (`svg`, `[data-icon]`), and widget internals from destructive font-size and line-height mutations.
- Measure all baselines before writing inline styles, preventing nested compounding across deep DOM trees.
- Wire `fontScale` and `textScale` into `featureSchema` builtins and `effects.ts`, providing full runtime support for accessibility profiles (e.g. Cognitive and Low Vision).
- Add unit test coverage in `tests/textScaling.test.tsx` and browser integration test in `tests/browser/widget.spec.ts`.

## 2.3.2 — 2026-10-23

- Harden GitHub Actions CI workflow (`ci.yml`) with job timeouts and comprehensive artifact capture for test results and Playwright HTML reports on failure (closes #40).
- Add fast developer browser smoke command (`npm run test:browser:smoke`) targeting the Chromium consumer.
- Document local consumer server ports (`7311`, `7312`, `7313`), browser execution commands, environment failure modes, and automated Axe audit boundaries in `docs/DEVELOPMENT.md`.
- Conclude Milestone 1 (`[M1] Safe core, accessible widget UI and stable state`).

## 2.3.1 — 2026-10-23

- Provide runnable Next.js App Router consumer example in `examples/next-app/` with Server Component layout, client boundaries, and route transitions (closes #39).
- Add comprehensive Content Security Policy (CSP) guidance in `docs/CSP.md` for Next.js, Vite, and strict environments.
- Enhance Vite examples with light and dark theme switching and client-side view transition simulation.
- Verify React 18/19 Server-Side Rendering (SSR) in `tests/consumerSsr.test.tsx` ensuring zero server browser-global access and no hydration divergence.
- Add browser integration regression for Next.js App Router client-side Link transitions preserving accessibility preferences across routes.

## 2.3.0 — 2026-10-22

- Introduce accessible feature card and control primitives (`FeatureCard`, `ToggleControl`, `ChoiceControl`, `StepperControl`) (closes #36).
- Add support for keyboard Arrow navigation across choice options, bounded live outputs, and slider range inputs with full ARIA semantics.
- Add standard empty, error, unavailable, and permission status states (`SearchCount`, `EmptyState`, `ErrorState`).
- Add accessibility profile preview card (`ProfilePreviewCard`) with preview of affected settings and one-click reversal back to custom preferences.
- Provide scoped CSS tokens and styles for all control primitives and status UI.

## 2.2.2 — 2026-10-22

- Verify native-control launcher and non-modal widget panel keyboard/AT integration (closes #35).
- Ensure focus restoration on Escape or close button, route change resilience, non-modal disclosure semantics, and independent tool list scrolling.

## 2.2.1 — 2026-10-22

- Harden scoped effect manager and cleanup lifecycle (closes #33).
- Exclude `template` and `noscript` elements from host style mutations and limit processing on massive DOM trees.
- Debounce dynamic content mutations and resize observer updates to prevent thread thrashing.
- Ensure idempotent overlay mount/unmount and cleanup for reading aids.
- Add comprehensive lifecycle test coverage for enable -> update -> disable -> unmount -> remount cycles.

## 2.2.0 — 2026-10-22

- Add base locale infrastructure and typed English strings (`LocaleStrings`, `enLocale`), fallback resolution, custom locale registration (`registerLocale`), and RTL detection (`isRtlLocale`) (closes #38).
- Add oversized widget controls mode (`largeControls`) scaling touch targets to >=48px for motor/vision accommodations (closes #37, W-21).
- Add configurable accessibility statement link (`statementUrl`) rendered in the panel footer with accessible new-tab notices (closes #37, W-22).
- Add non-drag keyboard movement alternatives and localized position controls (reconciles #14).

## 2.1.0 — 2026-10-22

- Introduce typed preferences registry, state reducer, and default configuration (`AccessibilityPreferences`).
- Add 8 standardized accessibility profile definitions (`PROFILE_DEFINITIONS`) with deterministic user override layers (closes #32).
- Add configurable storage modes (`none`, `session`, `local`) to `AccessibilityPlugin` and storage engine (closes #34).
- Add preference normalization and resolution helpers (`normalizePreferences`, `normalizePreferenceValue`, `resolveEffectivePreferences`).

## 2.0.2 — 2026-10-21

- Automatically inject the scoped widget stylesheet on package import; retain the standalone stylesheet export for explicit CSS pipelines.
- Automate npm releases through GitHub Actions when pull requests are merged into `main`.
- Add registry version verification to skip redundant publication safely on unchanged versions.

## 2.0.1 — 2026-10-20

- Replace the incomplete README with current installation, composition, feature,
  persistence, movement, styling, framework, limitation, and documentation
  guidance for the published package.
- Align installation and troubleshooting guidance with the published v2
  package and the `2.0.1` patch release.

## 2.0.0 — 2026-10-16

- Continue the owner-selected npm package `accessibility-plugin-react` with a breaking major API upgrade, corrected installation/import guidance and packed consumers. Preserve the internal persistence key through the rename. Owner selected 2.0.0 under latest after the unpublished beta attempt. Manual accessibility acceptance remains pending.
- Align LICENSE and package/lock metadata with the owner’s explicit ISC licensing decision on 2026-10-13.
- Movable trigger with persisted placement, drag activation/cancellation handling, Alt+arrow/click alternatives, corner picker and position reset.
- Fixed header/action bar with pinned ResetController, keyboard jump to actions and optional footer slot; compact short-screen layout. Display reset preserves placement. Trigger/panel descriptions use distinct IDs.

- Clean light base design: scoped palette variables, consistent decorative icons, compact steppers, selected checkmarks, 44px switch targets and responsive spacing. Optional panel description supports custom text or omission.

- Font enlargement preserves fixed line-height proportions; nullable custom state restores before mount-effect initialization.
- Provider-owned built-in/custom effects persist across panel closure and control removal; cleanup restores host styles.
- Compose simultaneous color filters and restore reduced contrast, link palette variants and older React color palettes.
- Per-provider versioned storage, validated restore, debounced writes, reset cancellation and teardown/pagehide flush.
- Native named controls, non-modal panel, focus return, scoped responsive CSS and body portals.
- Correct reading mask, dynamic content sizing, media visibility, large cursor and pointer/focus reading aids.
- Optional custom apply/validate contract, optional trigger icon, labels/style customization and storage disable.
- ESM/CJS client boundary and matching declarations; both CSS export paths; correct repository metadata; include the owner-approved ISC license text.
- Regression, packed-consumer, browser/axe tests, CI and maintained integration/release documentation.
- Upgrade vulnerable development tooling; no runtime dependencies beyond React peers.

Stabilization merged into main through PR #3; the Clean light foundation merged through PR #16. Movement/fixed actions and corrected release-status documentation merged through PR #17; ISC, npm identity, version 2 metadata and the manual OIDC publishing workflow merged through PR #18. The tested archive from main commit `1d4ab1c` was published as `accessibility-plugin-react@2.0.0` under `latest` through npm trusted publishing. No Git release tag was created. See PROJECT_STATUS.md for remaining human-acceptance gates and limitations.

## Historical 0.1.0 branch

September 2026 compound-component implementation, fifteen controllers, generic state, tsup and initial tests. Historical verification is superseded by docs/BASELINE.md.

## Older React development history

December 2025 PR #1 repaired Vite CSS/declarations and changed tools-as-children to app-as-children. It used a different package name/version and ISC metadata. This is architectural history, not a release claim for the current package.
