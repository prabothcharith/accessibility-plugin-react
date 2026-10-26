# Build and release plan

This document is the execution guide for the accessibility feature-release
program. It turns the approved master plan and the GitHub issue hierarchy into
a repeatable sequence for implementation, review, validation and release.

The package is an existing product. The first responsibility of every change
is to preserve the current public contract and host-application behavior.
The feature list in the roadmap is not evidence that a capability already
exists.

## Current baseline

The repository currently contains the v2 provider-owned architecture,
compound components, fifteen controllers, persistent preferences, widget
movement, fixed actions, scoped CSS, React 18/19 packed consumers and Next.js
consumer coverage. Consult [PROJECT_STATUS.md](./PROJECT_STATUS.md),
[ARCHITECTURE.md](./ARCHITECTURE.md) and [API.md](./API.md) before changing
behavior.

The current release track and the feature program are separate:

1. **2.0.1 documentation patch:** validate the already-prepared package
   metadata and archive, then publish only through the authorized release
   procedure in [RELEASE.md](./RELEASE.md).
2. **Feature-release program:** begin with the repository audit in M0, then
   implement M1 through M5 in dependency order. Do not describe proposed
   capabilities as shipped until their acceptance evidence exists.

The master tracker is
[issue #21](https://github.com/prabothcharith/accessibility-react/issues/21).
Its milestone issues are:

| Milestone | Parent issue                                                           | Purpose                                                       |
| --------- | ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| M0        | [#22](https://github.com/prabothcharith/accessibility-react/issues/22) | Establish repository, package and compatibility reality       |
| M1        | [#23](https://github.com/prabothcharith/accessibility-react/issues/23) | Build safe core state, effects and accessible widget UI       |
| M2        | [#24](https://github.com/prabothcharith/accessibility-react/issues/24) | Add stable visual and typographic preferences                 |
| M3        | [#25](https://github.com/prabothcharith/accessibility-react/issues/25) | Add reading support, profiles and localization                |
| M4        | [#26](https://github.com/prabothcharith/accessibility-react/issues/26) | Isolate advanced, browser-dependent and experimental controls |
| M5        | [#27](https://github.com/prabothcharith/accessibility-react/issues/27) | Complete launch evidence and prepare a release proposal       |

Each milestone contains the numbered A11Y child issues. Work must be tracked in
those issues rather than in an unbounded feature branch or a single large
change.

## Issue execution checklist

Use this checklist together with the nested issue view in
[issue #21](https://github.com/prabothcharith/accessibility-react/issues/21).
Check an item only after its issue acceptance criteria and evidence have been
completed. Closing a child issue does not replace the milestone exit review.

### Program and milestones

- [ ] [Master feature-release program #21](https://github.com/prabothcharith/accessibility-react/issues/21) — Coordinate the complete feature-release program, enforce scope and guardrails, and accept milestone evidence without treating planned work as shipped.
- [ ] [M0 — Repository audit and compatibility safety net #22](https://github.com/prabothcharith/accessibility-react/issues/22) — Establish the real repository/package baseline, protect compatibility, and finish the M0 evidence gate before feature coding.
- [ ] [M1 — Safe core, accessible widget UI and stable state #23](https://github.com/prabothcharith/accessibility-react/issues/23) — Build the typed state, storage, effects, accessible widget shell, examples and CI needed for a safe foundation.
- [ ] [M2 — Core visual and typographic adjustments #24](https://github.com/prabothcharith/accessibility-react/issues/24) — Add reversible text, spacing, font, contrast, focus, motion and decorative-image preferences with fixture evidence.
- [ ] [M3 — Reading support, profiles and localization #25](https://github.com/prabothcharith/accessibility-react/issues/25) — Add reading aids, semantic navigation, profiles, custom presets, import/export and reviewed regional localization.
- [ ] [M4 — Opt-in advanced and browser-dependent controls #26](https://github.com/prabothcharith/accessibility-react/issues/26) — Isolate TTS, dictionary, color, diagnostics, callbacks, smart contrast, voice and translation work behind safe opt-in boundaries.
- [ ] [M5 — Launch readiness and package hardening #27](https://github.com/prabothcharith/accessibility-react/issues/27) — Complete browser/AT, performance, documentation, security, licensing and packed-archive validation, then prepare a release proposal.

### M0 — Audit and compatibility safety net

- [ ] [A11Y-000 — Repository, published package, API and license audit #28](https://github.com/prabothcharith/accessibility-react/issues/28) — Audit package metadata, published exports, dependencies, CSS/types, build, tests, CI, license, storage and security; document actual behavior in `BASELINE_AUDIT.md`.
- [ ] [A11Y-001 — Current consumer fixture and baseline screenshots #29](https://github.com/prabothcharith/accessibility-react/issues/29) — Build a clean current-API React/TypeScript consumer, verify SSR/Next support where applicable, and capture baseline screenshots and interaction evidence.
- [ ] [A11Y-002 — Regression tests for existing public behavior #30](https://github.com/prabothcharith/accessibility-react/issues/30) — Add regression tests for existing exports, props, hooks, CSS/storage contracts, reset, cleanup, Strict Mode, dynamic content and host-style preservation.
- [ ] [A11Y-003 — Technical design decision record and migration plan #31](https://github.com/prabothcharith/accessibility-react/issues/31) — Record the source-grounded architecture, compatibility matrix, migration risks, dependency graph, branch sequence and owner decisions needed for M1.

### M1 — Safe core and accessible widget

- [x] [A11Y-101 — Typed preferences registry and state reducer #32](https://github.com/prabothcharith/accessibility-react/issues/32) — Implement typed preference definitions, validation, defaults, stable feature IDs and reducer logic for effective settings and profile overrides.
- [x] [A11Y-102 — Scoped effect manager and cleanup lifecycle #33](https://github.com/prabothcharith/accessibility-react/issues/33) — Implement provider-owned idempotent effect apply/dispose lifecycle with scoped styles, listener cleanup, widget exclusion and Strict Mode safety.
- [x] [A11Y-103 — Versioned storage, reset, migration and no-storage fallback #34](https://github.com/prabothcharith/accessibility-react/issues/34) — Implement versioned `none`/session/local storage, migrations, validation, reset of owned keys, blocked-storage handling and temporary no-remember mode.
- [x] [A11Y-104 — Accessible launcher and non-modal widget panel #35](https://github.com/prabothcharith/accessibility-react/issues/35) — Build the keyboard and screen-reader accessible non-modal launcher/panel with visible focus, Escape, focus restoration, responsive layout and stable scrolling.
- [x] [A11Y-105 — Feature cards and state/value UI #36](https://github.com/prabothcharith/accessibility-react/issues/36) — Build reusable native feature controls for toggles, choices, sliders, search, values, statuses, errors, unsupported states and profile previews.
- [x] [A11Y-106 — Position, oversized controls, statement link and help #37](https://github.com/prabothcharith/accessibility-react/issues/37) — Implement position and non-drag movement, oversized controls, safe-area actions, conditional statement link and help while reconciling existing positioning work.
- [x] [A11Y-107 — Base locale infrastructure and English strings #38](https://github.com/prabothcharith/accessibility-react/issues/38) — Add typed English locale strings, configured/html-language fallback, BCP 47 and RTL handling, announcements and safe missing-key behavior.
- [x] [A11Y-108 — Vite and Next.js App Router consumer integrations #39](https://github.com/prabothcharith/accessibility-react/issues/39) — Provide Vite and Next.js App Router consumers and verify hydration, portals, React peer versions, CSS, declarations, themes and CSP guidance.
- [x] [A11Y-109 — CI for typecheck, lint, unit, axe and browser smoke #40](https://github.com/prabothcharith/accessibility-react/issues/40) — Establish CI for typecheck, lint, unit/integration, relevant axe checks, packed browser smoke and supported browser jobs without publication credentials.

### M2 — Stable visual and typographic features

- [x] [A11Y-201 — Bigger text and reflow-safe scaling #41](https://github.com/prabothcharith/accessibility-react/issues/41) — Add stepwise 1x–2x text scaling through reflow-safe scoped styles without nested compounding, clipping or changes to protected controls.
- [x] [A11Y-202 — Letter, word, paragraph spacing and line height #42](https://github.com/prabothcharith/accessibility-react/issues/42) — Add independent letter, word and paragraph spacing plus line-height options with script-aware limits and restoration tests.
- [x] [A11Y-203 — Text alignment, legible fonts and language fallback #43](https://github.com/prabothcharith/accessibility-react/issues/43) — Add scoped text alignment and legally distributable readable font choices with Sinhala/Tamil fallbacks while protecting icons, code and symbols.
- [x] [A11Y-204 — Contrast modes and native forced-color protection #44](https://github.com/prabothcharith/accessibility-react/issues/44) — Add targeted original/light/dark/high/invert contrast modes that preserve host content and respect forced colors and other native settings.
- [x] [A11Y-205 — Link highlighting and focus visibility #45](https://github.com/prabothcharith/accessibility-react/issues/45) — Add non-color-only link cues and stronger focus visibility without removing native indicators or creating unsafe skip links.
- [ ] [A11Y-206 — Reduce motion and best-effort media controls #46](https://github.com/prabothcharith/accessibility-react/issues/46) — Add reduced-motion CSS, tracked Web Animations pausing and explicit media controls while documenting GIF and cross-origin limitations.
- [ ] [A11Y-207 — Decorative image handling #47](https://github.com/prabothcharith/accessibility-react/issues/47) — Hide only eligible decorative imagery and keep functional, meaningful, CAPTCHA, chart, map and QR content available.
- [ ] [A11Y-208 — Visual regression and performance sweep #48](https://github.com/prabothcharith/accessibility-react/issues/48) — Run cross-feature visual, restoration, repeated-toggle, route, zoom, forced-color, reduced-motion and performance regression sweeps.

### M3 — Reading support, profiles and localization

- [ ] [A11Y-301 — Cursor enlargement, reading mask and reading guide #49](https://github.com/prabothcharith/accessibility-react/issues/49) — Add capability-aware large cursor, pointer-transparent reading guide and adjustable reading mask with keyboard/touch alternatives and cleanup.
- [ ] [A11Y-302 — Accessible tooltips from authored descriptions #50](https://github.com/prabothcharith/accessibility-react/issues/50) — Show keyboard/pointer tooltips only from authored accessible descriptions, with Escape dismissal, safe positioning and no private-field disclosure.
- [ ] [A11Y-303 — Page headings and landmarks navigator #51](https://github.com/prabothcharith/accessibility-react/issues/51) — Build a read-only headings/landmarks navigator that scrolls and focuses safely, updates dynamic routes and never invents semantics.
- [ ] [A11Y-304 — Eight profiles and deterministic override model #52](https://github.com/prabothcharith/accessibility-react/issues/52) — Implement eight neutral editable profiles with previews, atomic application, explicit override layering and no implicit speech or microphone activation.
- [ ] [A11Y-305 — Custom saved presets and settings import/export #53](https://github.com/prabothcharith/accessibility-react/issues/53) — Add named custom presets and validated versioned JSON import/export that excludes personal content and handles malformed data clearly.
- [ ] [A11Y-306 — Sinhala and Tamil locale packs with accessibility review #54](https://github.com/prabothcharith/accessibility-react/issues/54) — Add reviewed Sinhala and Tamil widget locale packs and verify glyphs, long labels, search, announcements, fallback and assistive use.
- [ ] [A11Y-307 — Non-destructive reading mode proof of concept #55](https://github.com/prabothcharith/accessibility-react/issues/55) — Prototype safe article-focused reading mode without rewriting host DOM, losing content, breaking focus or sending content externally.
- [ ] [A11Y-308 — Keyboard shortcut help, remapping and link explorer #56](https://github.com/prabothcharith/accessibility-react/issues/56) — Add discoverable shortcut and heading-navigation help, collision-safe remapping and link exploration without hijacking browser or host commands.

### M4 — Advanced and experimental controls

- [ ] [A11Y-401 — Read-aloud TTS with voice, rate and stop controls #57](https://github.com/prabothcharith/accessibility-react/issues/57) — Add user-initiated read-aloud with voice/rate/pitch/language, pause/resume/stop, sensitive-content exclusions and lifecycle cleanup.
- [ ] [A11Y-402 — Saturation and grayscale modes #58](https://github.com/prabothcharith/accessibility-react/issues/58) — Add opt-in saturation and grayscale modes with chart/image warnings, forced-color protection, browser coverage and exact reset.
- [ ] [A11Y-403 — Dictionary provider interface and local fallback #59](https://github.com/prabothcharith/accessibility-react/issues/59) — Define local and optional remote dictionary providers with explicit consent, origin/rate/sanitization rules, private-data protection and truthful unknown results.
- [ ] [A11Y-404 — Per-site feature-menu customization and reorder #60](https://github.com/prabothcharith/accessibility-react/issues/60) — Add validated feature visibility, ordering, grouping, labels and default customization while keeping close, reset and help reachable.
- [ ] [A11Y-405 — Development-only integration diagnostics and harness #61](https://github.com/prabothcharith/accessibility-react/issues/61) — Build development-only diagnostics and fixtures for supported features, effect ownership, storage, host CSS, CSP, portals, iframes and dynamic content.
- [ ] [A11Y-406 — Optional privacy-safe feature event callbacks #62](https://github.com/prabothcharith/accessibility-react/issues/62) — Add disabled-by-default local lifecycle callbacks with reviewed payloads that exclude page text, inputs, identifiers, transcripts and recordings.
- [ ] [A11Y-407 — Smart contrast research prototype #63](https://github.com/prabothcharith/accessibility-react/issues/63) — Research measured smart contrast for eligible elements with compositing, caching, unsupported reporting, performance evidence and full restoration.
- [ ] [A11Y-408 — Voice navigation research prototype #64](https://github.com/prabothcharith/accessibility-react/issues/64) — Research a small voice-command set with permission, visible listening, timeout, cleanup, privacy disclosure and keyboard alternatives.
- [ ] [A11Y-409 — Host-content translation adapter architecture #65](https://github.com/prabothcharith/accessibility-react/issues/65) — Design an explicit host-translation provider boundary with consent, origin/privacy documentation, sanitization and cross-origin limitations.

### M5 — Launch readiness and package hardening

- [ ] [A11Y-501 — Full supported-browser, device and assistive-technology matrix #66](https://github.com/prabothcharith/accessibility-react/issues/66) — Run the full browser, device, keyboard, screen-reader, zoom, touch, forced-color, reduced-motion and representative-host acceptance matrix.
- [ ] [A11Y-502 — Performance, bundle, listener and leak profiling #67](https://github.com/prabothcharith/accessibility-react/issues/67) — Measure bundle size, runtime response, memory, listeners, observers, mount/unmount cycles, large-DOM behavior and feature-toggle jank.
- [ ] [A11Y-503 — Documentation website and interactive examples #68](https://github.com/prabothcharith/accessibility-react/issues/68) — Synchronize README, API, features, testing, privacy, limitations, migration, contributing docs and interactive packed examples.
- [ ] [A11Y-504 — Dependency, license and security audit #69](https://github.com/prabothcharith/accessibility-react/issues/69) — Audit dependencies, licenses, archive contents, CSP, unsafe rendering, external domains, privacy behavior and vulnerabilities.
- [ ] [A11Y-505 — Packed publish rehearsal and clean consumer smoke test #70](https://github.com/prabothcharith/accessibility-react/issues/70) — Inspect and install the exact tarball in clean React 18, React 19 and Next.js consumers, verifying exports, types, CSS, SSR and builds.
- [ ] [A11Y-506 — Version recommendation, changelog and owner-approved release proposal #71](https://github.com/prabothcharith/accessibility-react/issues/71) — Review evidence, recommend patch/minor/major, prepare changelog/migration/release PR and request separate owner approval for merge, tag and publication.

### Existing release and follow-up trackers

- [ ] [Screen-reader accessibility acceptance #6](https://github.com/prabothcharith/accessibility-react/issues/6) — Complete manual screen-reader acceptance for the launcher, panel, controls, announcements, focus, reset and hidden states.
- [ ] [Physical devices, actual zoom and visual accessibility #7](https://github.com/prabothcharith/accessibility-react/issues/7) — Verify physical touch devices, safe areas, actual browser zoom, large text, responsive layout and visual accessibility modes.
- [ ] [Representative host-application acceptance #8](https://github.com/prabothcharith/accessibility-react/issues/8) — Test representative host applications with fixed overlays, forms, media, route changes, dynamic content and host CSS.
- [ ] [Final release candidate validation #10](https://github.com/prabothcharith/accessibility-react/issues/10) — Validate the final release candidate with the exact archive, full test matrix, audit, package inspection and release evidence.
- [ ] [Approved package publication and registry verification #11](https://github.com/prabothcharith/accessibility-react/issues/11) — Publish only the owner-approved archive through the authorized workflow, then verify registry metadata, integrity, tags and clean consumers.
- [ ] [Large-document profiling and late font/style refresh #12](https://github.com/prabothcharith/accessibility-react/issues/12) — Profile large documents and verify late font/style changes refresh effects without redundant work or stale computed styles.
- [ ] [Scoped effects and stronger host compatibility #13](https://github.com/prabothcharith/accessibility-react/issues/13) — Design and test explicit effect scopes, CSP behavior, fixed-descendant alternatives, Shadow DOM boundaries and iframe limitations.
- [ ] [Localization and widget positioning controls #14](https://github.com/prabothcharith/accessibility-react/issues/14) — Improve control labels/localization and optional positioning while preserving keyboard/touch parity, safe areas, zoom and hit testing.
- [ ] [First stable release tracker #15](https://github.com/prabothcharith/accessibility-react/issues/15) — Coordinate the existing stable-release acceptance children and publish only after all release gates and owner approvals are complete.

## Operating rules

### Before changing code

1. Read this document, the target issue, [PROJECT_STATUS.md](./PROJECT_STATUS.md),
   [ROADMAP.md](./ROADMAP.md), [ARCHITECTURE.md](./ARCHITECTURE.md),
   [API.md](./API.md) and [DEVELOPMENT.md](./DEVELOPMENT.md).
2. Inspect the current implementation and tests for the affected behavior.
3. Identify existing exports, storage keys, CSS contracts, effect ownership and
   host properties that must remain compatible.
4. Write a small reproducer or regression test before changing lifecycle or
   effect behavior.
5. Confirm issue dependencies are complete. Do not start a child issue whose
   parent milestone or required architectural child is not ready.
6. Create a focused branch from the current authorized base:

   ```text
   codex/a11y-<issue-id>-<short-name>
   ```

   Do not work directly on `main`, force-push, amend an existing commit, or
   publish from a feature branch.

### While implementing

- Core owns state, storage, persistence and effect lifetimes. Controllers render
  controls and request state changes; they do not restore provider-owned
  effects.
- Effects must be scoped, idempotent and reversible on update, disable, reset,
  provider unmount and remount.
- Preserve authored host styles and priorities. Do not use broad DOM rewrites,
  unsafe HTML, document-wide filters, changing every `tabindex`, or mutations
  of React-owned nodes.
- Keep one provider per document. Keep widget DOM outside host filters and
  application layout.
- Use native controls, visible focus, accurate names/values/pressed states,
  non-modal semantics, safe-area handling, RTL support and approximately 44px
  targets where practical.
- Respect browser zoom, forced colors, reduced motion, native assistive
  technology, forms, CAPTCHA, charts, media, portals, Shadow DOM and
  cross-origin boundaries.
- No network calls, telemetry, microphone activation, recording, transcript
  storage, remote dictionary, host translation or remotely generated content
  changes by default.
- Add documentation and a changelog entry for every observable public or UX
  change. Add migration guidance for every changed contract.

### Before closing a child issue

The issue comment or pull request must record:

- issue ID, branch and pull request;
- existing behavior verified;
- files and public API changed;
- unit, integration and browser tests added;
- exact commands and actual results;
- browser, zoom, keyboard and assistive-technology evidence applicable to the
  change;
- reset, unmount, remount, route-change and unsupported-state behavior;
- performance, bundle, security and privacy impact;
- known limitations and environment failures;
- breaking-change status and owner decisions required next.

Do not report a test, browser, performance or accessibility result that was not
actually run.

## Step-by-step implementation sequence

## Step 0 — Establish a clean working baseline

Run from a clean checkout using Node `>=22.13` and npm:

```sh
npm ci
npm run validate
npm run pack:check
npm run test:consumers
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

Record the exact commit, Node/npm versions, operating system, browser versions,
warnings, failures and generated artifacts. Separate unavailable environment
coverage from product failures. Do not fix unrelated baseline failures in the
same change.

## Step 1 — Complete M0: audit and compatibility safety net

Work through [M0 #22](https://github.com/prabothcharith/accessibility-react/issues/22)
in this order:

1. **A11Y-000, issue #28:** audit package metadata, published versions,
   exports, peer dependencies, CSS/type packaging, build scripts, CI, tests,
   license evidence and storage/API contracts. Produce
   `docs/BASELINE_AUDIT.md`.
2. **A11Y-001, issue #29:** build a minimal current-API React/TypeScript
   consumer and verify SSR/Next behavior where advertised. Capture baseline
   screenshots and keyboard, persistence, responsive and route-change results.
3. **A11Y-002, issue #30:** add regression coverage for current exports,
   props, hooks, CSS, storage, reset, restore, disable, unmount, repeated mount,
   Strict Mode, dynamic content and host-style preservation.
4. **A11Y-003, issue #31:** record the architecture decision, compatibility
   matrix, migration plan, branch sequence and unresolved owner decisions.

M0 is a blocking gate. No feature implementation starts until the current
contract is known and protected by evidence.

## Step 2 — Complete M1: safe core and accessible widget

Work through [M1 #23](https://github.com/prabothcharith/accessibility-react/issues/23).
The recommended dependency order is:

1. **A11Y-101, issue #32:** typed preferences registry and reducer.
2. **A11Y-102, issue #33:** provider-owned scoped effect manager and cleanup.
3. **A11Y-103, issue #34:** versioned storage, migration, reset and
   `none`/session/local persistence behavior.
4. **A11Y-104, issue #35:** accessible launcher and non-modal panel.
5. **A11Y-105, issue #36:** feature cards and value/state controls.
6. **A11Y-106, issue #37:** placement, large controls, statement link and help.
7. **A11Y-107, issue #38:** English locale infrastructure and fallback.
8. **A11Y-108, issue #39:** Vite and Next.js consumer examples.
9. **A11Y-109, issue #40:** CI typecheck, lint, unit, axe and browser smoke.

M1 exit requirements:

- existing public exports remain compatible;
- the widget opens and closes with keyboard and assistive technology;
- focus is visible, restored and never trapped incorrectly;
- state, storage, reset and effect cleanup are deterministic;
- examples build from the documented public API;
- automated checks are supplemented by manual review and are not described as
  WCAG certification.

## Step 3 — Complete M2: stable visual and typographic features

Work through [M2 #24](https://github.com/prabothcharith/accessibility-react/issues/24).
The independent feature branches may be parallelized after M1, but changes to
the shared schema and effect manager must be coordinated.

1. **A11Y-201, issue #41:** bigger text with reflow-safe scaling.
2. **A11Y-202, issue #42:** letter, word and paragraph spacing plus line height.
3. **A11Y-203, issue #43:** alignment, legible fonts and language fallback.
4. **A11Y-204, issue #44:** contrast modes with forced-color protection.
5. **A11Y-205, issue #45:** link highlighting and focus visibility.
6. **A11Y-206, issue #46:** reduce motion and best-effort media controls.
7. **A11Y-207, issue #47:** decorative-image handling.
8. **A11Y-208, issue #48:** visual regression and performance sweep.

Every feature must prove its supported scope, unsupported cases, restoration
of original host behavior and behavior at 200% zoom. M2 is only a release
candidate milestone; publication requires a separate owner decision.

## Step 4 — Complete M3: reading, profiles and localization

Work through [M3 #25](https://github.com/prabothcharith/accessibility-react/issues/25).
The semantic navigator may proceed after M1; the remaining presentation work
depends on M2.

1. **A11Y-301, issue #49:** cursor enlargement, reading mask and guide.
2. **A11Y-302, issue #50:** tooltips from authored descriptions only.
3. **A11Y-303, issue #51:** headings and landmarks navigator.
4. **A11Y-304, issue #52:** eight neutral, editable profiles and deterministic
   overrides.
5. **A11Y-305, issue #53:** custom saved presets and validated import/export.
6. **A11Y-306, issue #54:** reviewed Sinhala and Tamil locale packs.
7. **A11Y-307, issue #55:** non-destructive reading-mode proof of concept.
8. **A11Y-308, issue #56:** shortcut help, collision-safe remapping and link
   explorer.

No profile may silently enable speech or microphone access, imply medical
efficacy, change keyboard order or undo independent user choices. Localization
must cover widget strings only; it must not become implicit host-content
translation.

## Step 5 — Complete M4: opt-in advanced and experimental controls

Work through [M4 #26](https://github.com/prabothcharith/accessibility-react/issues/26).
These are not automatically stable release features:

1. **A11Y-401, issue #57:** read-aloud TTS.
2. **A11Y-402, issue #58:** saturation and grayscale.
3. **A11Y-403, issue #59:** dictionary interface and local fallback.
4. **A11Y-404, issue #60:** per-site feature menu customization.
5. **A11Y-405, issue #61:** development-only diagnostics and test harness.
6. **A11Y-406, issue #62:** privacy-safe opt-in event callbacks.
7. **A11Y-407, issue #63:** measured smart-contrast research prototype.
8. **A11Y-408, issue #64:** voice-navigation research prototype.
9. **A11Y-409, issue #65:** host-content translation adapter architecture.

Each browser-dependent or privacy-sensitive feature requires an explicit
support matrix, security/privacy review, stop/disable behavior, a safe
unsupported state and an owner decision before promotion. Research prototypes
must not be presented as compliance or production support.

## Step 6 — Complete M5: launch readiness

Work through [M5 #27](https://github.com/prabothcharith/accessibility-react/issues/27):

1. **A11Y-501, issue #66:** complete Chromium, Firefox and WebKit, keyboard,
   screen-reader, physical-device, touch, safe-area, zoom, forced-color,
   reduced-motion and representative host testing.
2. **A11Y-502, issue #67:** measure bundle, runtime, responsiveness, memory,
   listeners, observers and repeated mount/unmount behavior.
3. **A11Y-503, issue #68:** synchronize README, API, feature, testing, privacy,
   limitations, migration, contributing docs and interactive examples.
4. **A11Y-504, issue #69:** complete dependency, license, CSP, security and
   privacy review.
5. **A11Y-505, issue #70:** inspect and test the exact packed archive in clean
   React 18, React 19 and Next.js consumers.
6. **A11Y-506, issue #71:** recommend the semantic version, prepare changelog
   and release proposal, and request owner approval.

The existing release tracker [#15](https://github.com/prabothcharith/accessibility-react/issues/15)
and its manual acceptance children remain authoritative for already-identified
release checks. Reuse their evidence; do not create duplicate claims.

## Testing requirements

### Unit and integration coverage

Each behavior change requires tests for:

- valid, invalid, boundary and unsupported values;
- apply, update, disable, reset, unmount and remount;
- React Strict Mode and repeated registration;
- storage restore, migration, corruption, blocked storage and no-storage mode;
- host styles and priorities that existed before activation;
- dynamic content, route changes and widget exclusion;
- focus, keyboard activation, accessible names and status announcements.

### Browser coverage

Use packed consumer fixtures for browser validation. Cover forms, tables,
dashboards, long articles, media players, accordions, overlays, RTL content,
custom host CSS, late font loading and dynamically inserted content.

Automated axe checks are useful for the tested widget DOM but do not establish
host-site conformance, screen-reader behavior or legal compliance.

### Manual acceptance

Record platform and version for:

- keyboard-only operation, focus return and absence of traps;
- NVDA with Firefox/Chrome, VoiceOver with Safari and TalkBack with Chrome
  where available;
- browser zoom at 200% and 400%, not only viewport resizing;
- physical touch, landscape, safe areas and large system fonts;
- light/dark themes, forced colors, reduced motion and custom host CSS;
- sticky/fixed overlays, forms, media, route navigation and dynamic content;
- reset, unmount, reload, blocked storage and corrupted preferences.

## Version and release procedure

### Version decision

- **Patch:** fixes with no intentional public behavior or default change.
- **Minor:** backward-compatible capabilities or optional exports.
- **Major:** changed/deleted exports, defaults, storage semantics or CSS contract.

The version decision must be based on the audited current API, not the number
of files changed. A migration document is required for a breaking release.

### Candidate validation

Run the smallest relevant checks during development, then the full candidate
sequence:

```sh
npm ci
npm run validate
npm run format:check
npm run pack:check
npm run test:consumers
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm audit
npm pack --dry-run
```

Inspect the actual archive for package name/version, exports, ESM/CJS,
declarations, CSS, README, license and source-map policy. Install that exact
archive in clean consumer applications; source imports alone are insufficient.

### Authorization and publication

1. Open the release PR with the exact candidate commit and evidence.
2. Obtain owner approval for the version, merge and release contents.
3. Run the manual workflow in dry-run mode and inspect its archive/checksum
   results.
4. Configure and verify the approved npm trusted publisher.
5. Only after explicit publication authorization, run the real workflow.
6. Verify the registry version, `latest` tag, integrity, exports, CSS,
   declarations and clean registry consumers.
7. Create a Git tag or GitHub release only if separately authorized.
8. Update [PROJECT_STATUS.md](./PROJECT_STATUS.md), [ROADMAP.md](./ROADMAP.md),
   [RELEASE.md](./RELEASE.md) and [CHANGELOG.md](../CHANGELOG.md) with actual
   results and remaining limitations.

Publication is never implied by a successful local build, a passing dry run,
or a prepared archive. Do not put credentials in the repository or in issue
comments.

## Completion checklist

- [ ] The relevant issue and dependency children are complete.
- [ ] Existing public API and storage/CSS contracts were verified.
- [ ] Tests cover the feature, reset, cleanup, unsupported state and host
      integration.
- [ ] Packed React and Next consumers pass.
- [ ] Browser, zoom, keyboard and applicable assistive-technology evidence is
      recorded.
- [ ] Privacy, security, license and performance impact is documented.
- [ ] User-facing documentation and changelog are updated.
- [ ] Known limitations are visible and no automatic WCAG claim is made.
- [ ] The candidate version and publication actions have explicit owner
      approval.
- [ ] Registry and release artifacts are verified after publication, if
      publication was authorized.
