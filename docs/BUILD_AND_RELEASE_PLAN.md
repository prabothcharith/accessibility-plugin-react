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

| Milestone | Parent issue | Purpose |
| --- | --- | --- |
| M0 | [#22](https://github.com/prabothcharith/accessibility-react/issues/22) | Establish repository, package and compatibility reality |
| M1 | [#23](https://github.com/prabothcharith/accessibility-react/issues/23) | Build safe core state, effects and accessible widget UI |
| M2 | [#24](https://github.com/prabothcharith/accessibility-react/issues/24) | Add stable visual and typographic preferences |
| M3 | [#25](https://github.com/prabothcharith/accessibility-react/issues/25) | Add reading support, profiles and localization |
| M4 | [#26](https://github.com/prabothcharith/accessibility-react/issues/26) | Isolate advanced, browser-dependent and experimental controls |
| M5 | [#27](https://github.com/prabothcharith/accessibility-react/issues/27) | Complete launch evidence and prepare a release proposal |

Each milestone contains the numbered A11Y child issues. Work must be tracked in
those issues rather than in an unbounded feature branch or a single large
change.

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
