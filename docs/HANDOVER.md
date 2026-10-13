# Engineering handover — 2026-10-13

## Executive summary

Stabilized the existing compound-component library rather than rebuilding from the empty default branch. All fifteen built-ins and the generic custom-feature hook remain. Effects now belong to the provider and survive closing/unmounting controls; reset/cleanup/persistence are coordinated. Built distribution has been exercised in independent React and Next applications. Stabilization and the Clean light design are merged into main. Remembered movement and fixed quick actions are in [PR #17](https://github.com/prabothcharith/accessibility-react/pull/17). Local and hosted validation are recorded for their respective snapshots; no stable release has been published or certified.

## Repository and baseline

Repository: prabothcharith/accessibility-react. Historical stabilization branch: codex/stabilize-accessibility from origin/new-development (6dfbd44). Stabilization reached main through PR #3 at 2893b6c; Clean light reached main through PR #16 at 15e9465. Current follow-up branch: codex/movable-quick-actions, based on that merged main. Original checkout development (7aef17c) was clean. Compared main, development, new-development, merged PR #1 and vanilla plugin at 47f44c5. Read the historical specification and commit summary; their unsupported current-completion claims are now marked historical. Baseline and parity evidence are in BASELINE.md and FEATURES.md.

Baseline defects included controller-owned lifetime, overwriting filters, fixed invisible hit areas, shared debounce/reset races, false modal semantics, unnamed toggles, global Tailwind resets, ineffective custom DOM examples, missing shipped client directive and incorrect repository metadata. Initial lint failed seven checks; nominal 24 tests did not await three persistence assertions; audit reported 15 findings.

## Architecture and implementation

- Cached external preference store provides SSR-safe snapshots and isolated storage writer. Schema validation rejects malformed/obsolete storage, bounds invalid built-ins and protects reserved/prototype-like keys.
- Provider owns registered effects and cleanup. Validated nullable/union custom state restores before mount effects can initialize fallback values. Custom useAccessibility third argument adds apply/validate; original two-argument contract remains. Single-document ownership avoids conflicting global providers.
- Built-in engine composes host/contrast/saturation/invert/grayscale and restores prior inline styles/priorities. It responds to inserted/removed content and resize, measures text before writing, scales fixed line heights with fonts to prevent overlap, and excludes widget portals.
- Trigger/list are body portals, preventing host filters and invisible fixed wrapper hit areas. The list is non-modal with focus/return/Escape behavior and native controls. CSS is scoped, responsive, safe-area-aware and reduced-motion-friendly.
- Restored original reduced contrast/link palettes and older React color palettes. Corrected transparent reading mask. Added explicit default alignment, names, numeric announcements and default trigger icon. Historical stabilization deferred dragging and documented original visual differences; the current movement follow-up implements dragging with keyboard/click alternatives.

## Package and compatibility

Retained tsup, ESM/CJS, React peers and named compound exports. Preserved use-client boundary in distribution; matched .d.mts/.d.ts conditional exports. Both CSS entry paths work. No runtime design-system dependencies. Replaced unnecessary Tailwind build/reset pipeline with copied authored CSS. Corrected repository URL, bounded React18/19 peers and included existing GPL text. Historical stabilization metadata was 0.1.0. The owner has now selected the existing npm identity accessibility-plugin-react; codex/npm-v2-release prepares a proposed 2.0.0-beta.1 candidate with updated imports and packed consumers. The owner approved ISC for all included code and the 2.0.0-beta.1 beta channel; npm maintainer authentication is verified; see RELEASE.md.

## Verification and accessibility

See PROJECT_STATUS.md for the exact current matrix. The stabilization/Clean light snapshots passed source/test/config typecheck, zero-warning lint, 61 unit regressions, build, package inspection and audit. Independent packed React18.3.1 and React19.2.0/Tailwind consumers passed ESM/CJS/declarations/SSR/build. Next16.2.10 App/Pages/direct server imports passed production build and runtime checks. Corrected non-Firefox browser suite: 31 passed, four intentional Next-only skips. Axe found zero violations in tested widget scopes; real keyboard interaction and geometry were exercised. Both built examples ran with zero page errors and desktop/mobile screenshots were visually inspected.

Firefox's profile-folder launch failure is an environment blocker, not a passing check. Human screen-reader, physical-device, actual zoom and forced-colors acceptance remains pending. Hosted Node22/24 checks and packed consumer builds passed. The first full browser run had 36 passes, five intentional skips and one Firefox rounding assertion failure; the assertion was corrected and [the full rerun](https://github.com/prabothcharith/accessibility-react/actions/runs/38327577761) passed: 37 browser tests and five intentional skips, including complete Linux Firefox coverage. No WCAG compliance or universal host compatibility is claimed.

The [merged Clean light main run](https://github.com/prabothcharith/accessibility-react/actions/runs/38353340223) passed all jobs on 15e9465. Movement source d5e21df in PR #17 has local validation of 66 unit tests, packed React18/React19/Next consumers and 46 browser passes with four intentional Next-only skips. Its hosted checks must be read from PR #17; earlier green runs do not validate the movement commit.

## Stabilization change inventory

Updated core provider/context/hook/storage/types/button/list, all controller files (ResetController formatting only), public types, CSS, package/lock, tsup/Vitest, unit tests and examples. Added preferenceStore, featureSchema, effects and WidgetPortal; packed consumer fixtures/scripts, Playwright, TypeScript test config, flat ESLint, CI and example index. Removed obsolete ESLint config, unused Tailwind config and unused unsafe DOM mutation utilities; their history remains in Git.

Created AGENTS.md, LICENSE, CHANGELOG.md and maintained docs: ARCHITECTURE, FEATURES, API, INSTALLATION, CUSTOM_FEATURES, DEVELOPMENT, TROUBLESHOOTING, PROJECT_STATUS, ROADMAP, MIGRATION, BASELINE and this HANDOVER. Added actual desktop/mobile example screenshots. README and historical document notices now direct readers to verified current guidance.

## Remaining work and authorization

P1: review PR #17 and its hosted checks; complete human accessibility and host-integration acceptance; record the approved ISC/beta decision; run final candidate validation. Then choose an approved release version and obtain tag/npm publication authorization. Track the release in [Project #18](https://github.com/users/prabothcharith/projects/18) and [release tracker #15](https://github.com/prabothcharith/accessibility-react/issues/15). P2: profile large dynamic hosts, improve style/font-change refresh and explicit scopes, then localization/cross-tab work.

Current limits include one provider/document, host filter containing-block behavior, no Shadow DOM/iframe interior/pseudo-element effects, no auto-pause for hidden video and CSP considerations. These are documented implementation boundaries, not hidden workarounds.

[PR #2](https://github.com/prabothcharith/accessibility-react/pull/2) merged into new-development and [PR #3](https://github.com/prabothcharith/accessibility-react/pull/3) merged stabilization into main. [Final stabilization validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38328538388) on a020352 passed hosted Node22/24 with 61 unit tests, all packed consumers and the full browser matrix (37 passed, five intentional skips). [PR #16](https://github.com/prabothcharith/accessibility-react/pull/16) subsequently merged the Clean light foundation. PR #17 contains movement and fixed actions; it has not merged. Stable release acceptance remains open. No npm publication or release tag has occurred.

## Historical stabilization file inventory

This inventory describes the original stabilization changes. Subsequent Clean light and movement additions are documented in DESIGN.md and their PR diffs.

### Added

```text
.github/workflows/ci.yml
AGENTS.md
CHANGELOG.md
LICENSE
docs/API.md
docs/ARCHITECTURE.md
docs/BASELINE.md
docs/CUSTOM_FEATURES.md
docs/DEVELOPMENT.md
docs/FEATURES.md
docs/HANDOVER.md
docs/INSTALLATION.md
docs/MIGRATION.md
docs/PROJECT_STATUS.md
docs/ROADMAP.md
docs/TROUBLESHOOTING.md
docs/assets/widget-desktop.png
docs/assets/widget-mobile.png
eslint.config.mjs
examples/index.html
playwright.config.ts
scripts/build-css.mjs
scripts/check-package.mjs
scripts/prepare-consumers.mjs
src/core/WidgetPortal.tsx
src/core/effects.ts
src/core/featureSchema.ts
src/core/preferenceStore.ts
tests/browser/Fixture.jsx
tests/browser/host.css
tests/browser/widget.spec.ts
tests/helpers.tsx
tsconfig.tests.json
```

### Modified

```text
.gitignore
COMMIT_SUMMARY.md
README.md
examples/basic-usage/index.html
examples/basic-usage/main.tsx
examples/custom-feature/index.html
examples/custom-feature/main.tsx
package-lock.json
package.json
react-accessibility-plugin-spec.md
src/core/AccessibilityButton.tsx
src/core/AccessibilityContext.ts
src/core/AccessibilityList.tsx
src/core/AccessibilityPlugin.tsx
src/core/storage.ts
src/core/types.ts
src/core/useAccessibility.ts
src/features/BigCursorController.tsx
src/features/ContrastController.tsx
src/features/FontSizeController.tsx
src/features/GrayscaleController.tsx
src/features/HideImagesController.tsx
src/features/HideVideosController.tsx
src/features/InvertColorsController.tsx
src/features/LetterSpacingController.tsx
src/features/LineHeightController.tsx
src/features/LinkHighlightController.tsx
src/features/ReadingGuideController.tsx
src/features/ReadingMaskController.tsx
src/features/ResetController.tsx
src/features/SaturationController.tsx
src/features/TextAlignController.tsx
src/index.ts
src/styles/tailwind.css
tests/features.test.tsx
tests/plugin.test.tsx
tests/storage.test.ts
tsup.config.ts
vitest.config.ts
```

### Removed

```text
.eslintrc.json
src/utils/dom.ts
tailwind.config.ts
```
