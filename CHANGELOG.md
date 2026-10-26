# Changelog

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
