# Project status — 2026-10-13

**Local stabilization implemented and automatically verified; stable release not yet approved.** No npm publication, release tag or default-branch merge. Working branch: `codex/stabilize-accessibility`, based on `new-development` at `6dfbd44`.

## Status categories

| Category                   | Current evidence                                                                                                                                                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented and verified   | Provider-owned built-in/custom effects; reset cancellation; validated restoration; all fifteen controllers; combined filters; host style cleanup; dynamic child content; non-modal focus; portal layout; scoped CSS; React18/19 packed consumers; Next App/Pages and direct Server Component imports |
| Implemented but unverified | Broader React19 patch versions, physical devices, assistive technologies and browser versions outside the executed matrix                                                                                                                                                                            |
| Partially implemented      | Broad accessibility acceptance: automated keyboard/axe/reflow checks passed, real screen-reader/physical-device/actual zoom review remains. Host-wide integration: known filter/CSP/Shadow DOM/attribute-change limits remain.                                                                       |
| In progress                | No active implementation work remains. Draft PR #2 is ready for owner review; manual release acceptance remains pending.                                                                                                                                                                             |
| Planned                    | Large-DOM profiling, attribute/font-load refresh, explicit effect scopes and richer localization                                                                                                                                                                                                     |
| Blocked                    | Local macOS Firefox launch only (Linux coverage passed); owner decision on conflicting historical license metadata and intended registry identity before release                                                                                                                                     |
| Deferred                   | Draggable trigger, built-in persisted position picker, multi-provider arbitration and live cross-tab sync                                                                                                                                                                                            |
| Completed                  | Investigation/baseline, local P0 stabilization, feature regression suite, packed consumer/build verification, documentation, local example verification and full hosted CI meet their stated local acceptance criteria                                                                               |

## Executed checks

Environment: macOS, Node 22.14.0, npm 11.21.0. Baseline: typecheck/build pass, lint seven errors, 24 nominal tests with three ineffective async assertions, 15 audit findings. See BASELINE.md.

| Check                                       | Actual result                                                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| npm ci (original lock)                      | Passed before implementation                                                                                                     |
| npm run typecheck                           | Passed for source, unit/browser tests and TypeScript configs                                                                     |
| npm run lint                                | Passed with zero warnings, ESLint 10 and hooks rules                                                                             |
| npm test                                    | 59 tests passed in 3 files                                                                                                       |
| npm run build                               | ESM + CJS + both declaration formats + standalone CSS produced                                                                   |
| npm audit                                   | Zero vulnerabilities after tooling/dependency updates (snapshot, not a perpetual guarantee)                                      |
| npm pack / pack:check                       | Archive generated and inspected; required JS/types/CSS/license present; client boundary and CSS reset guard passed               |
| Clean packed consumer installs              | React 18.3.1 and React 19.2.0; ESM, CJS, NodeNext ESM/CommonJS and JSX declarations, SSR and production Vite 7.3.7 builds passed |
| Next.js 16.2.10 + React19.2.0               | Production webpack build, App Router, Pages Router and direct Server Component package imports passed                            |
| Browser suite excluding unavailable Firefox | 31 passed, 4 intentional skips (Next-only test on non-Next projects)                                                             |
| Axe                                         | Zero violations for tested widget scopes in light/dark hosts using WCAG2 A/AA, 2.1AA and 2.2AA tags in passing browser projects  |
| Built examples                              | Basic and custom demos opened/interacted/reset through actual package imports; zero page errors                                  |
| Visual review                               | Desktop and 320px custom example screenshots inspected; no panel overflow/clipped controls observed. Actual images in assets/.   |
| git diff --check                            | Passed                                                                                                                           |

Local browser projects: Chromium 156 (React18, React19 with Tailwind3, Next production); WebKit 27.2 desktop and iPhone13 emulation. Playwright 1.64.0. These are tested engine builds, not claims about every installed Safari/Chrome version.

The initial full browser run had 10 failures: seven Firefox launch failures before page execution, two overly exact WebKit fractional-CSS assertions, and one test clearing storage before a pending pagehide flush. Numeric assertions now use explicit tolerance and each Next route starts with clean storage. The corrected non-Firefox suite passed. Firefox157 build1555 fails “Could not find profile folder” with temporary or persistent profiles, including TMPDIR=/tmp; the local environment provides no Firefox functionality result. Linux-hosted execution is recorded separately below. The workflow retains Firefox tests rather than silently excluding them.

Expected error-path unit tests deliberately trigger missing-provider and duplicate-provider errors; jsdom logs these while their throw assertions pass. The continuation added regressions for mount-effect state initialization and focus return when the panel itself is removed. No unexpected runtime errors were observed in the passing browser/examples matrix.

## Review branch

[Draft PR #2](https://github.com/prabothcharith/accessibility-react/pull/2) targets `new-development`. Implementation, integration tests, documentation and CI corrections are committed and pushed. No merge, release tag or npm publication has occurred.

## Hosted validation

[Initial hosted run](https://github.com/prabothcharith/accessibility-react/actions/runs/38327175897) on commit `0dc6ead`: Node 22 and 24 unit/type/lint/format/build/archive/audit jobs passed. Packed React/Next builds passed. Full browser matrix: 36 passed, five intentional skips, one Firefox failure caused by computed font-size quantization (`19.8125px` vs `19.8px`). Five other Firefox scenarios passed. The font-size test now permits less than 1/32 CSS-pixel rounding error and still verifies the intended enlargement.

[Corrected hosted run](https://github.com/prabothcharith/accessibility-react/actions/runs/38327577761) on source/test/workflow commit `4fd3768` **passed all jobs**. Fresh final-lock installs, 59 unit tests on Node 22 and 24, type/lint/format/build/archive/audit checks, three packed consumer builds and the full Chromium/Firefox/WebKit/mobile matrix succeeded: **37 passed, five intentional Next-only skips**. Firefox 157 is verified on Linux. The final follow-up changes only documentation recording this result.

CI uses Ubuntu 24.04 and verified Node24-based action releases to avoid the deprecated action runtime and an impending ubuntu-latest image rollover. This configuration passed the corrected hosted run.

## Known limits and release gates

1. **Human accessibility testing pending:** VoiceOver/NVDA, physical touch devices, forced-colors visual review, browser zoom 200/400%. Automated axe and emulation do not establish WCAG conformance.
2. **Local Firefox remains unavailable on this Mac.** The complete Firefox browser scenarios passed on Linux, so the local launch issue does not block automated release verification.
3. **License conflict:** selected branch/spec declare GPL-3.0; original LICENSE is GPLv3; original package.json and older React metadata declare ISC. The existing selected-branch declaration is retained, LICENSE included, no rights reinterpreted. Owner must resolve intended licensing before release.
4. **Package identity:** current branch uses react-accessibility-plugin@0.1.0; older branch used accessibility-plugin-react@1.0.0. No registry ownership/publication status is inferred. Owner must confirm name/version/migration/release permissions.
5. One provider per document, no live cross-tab sync, immutable definitions/storage configuration. Routes should share the provider.
6. Effects target current-document HTML only; no Shadow DOM, iframe interiors, pseudo-elements or SVG/canvas text. Color filters alter host containing blocks. Late fonts/attribute-only style changes need a preference refresh. Very large/changing DOMs need application-specific profiling.
7. Media hiding retains layout and does not stop playback. CSP may restrict inline styles/data cursors. No universal host compatibility claim.

**Release readiness:** not yet stable-release-ready. Local implementation and integration evidence are substantially stronger than baseline; the gates above remain explicit. See ROADMAP.md for priorities and DEVELOPMENT.md for the manual procedure.
