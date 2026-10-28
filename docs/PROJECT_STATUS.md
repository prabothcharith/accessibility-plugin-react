# Project status — 2026-10-28

**Version 2.28.0 is merged into main and published.** All
core, feature, and accessibility milestone releases from 2.0.0 through 2.28.0
are implemented, tested, and published under `latest`. Milestone 5 launch readiness
and hardening is underway; the full supported-browser, device, and assistive-technology
matrix is verified in [SUPPORTED_MATRIX.md](SUPPORTED_MATRIX.md) (Issue #66), performance,
bundle, listener, and leak profiling is verified in [PERFORMANCE_PROFILING.md](PERFORMANCE_PROFILING.md) (Issue #67),
and public API/features documentation and runnable examples are synchronized (Issue #68).

## Status categories

| Category                   | Current evidence                                                                                                                                                                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Implemented and verified   | Provider-owned built-in/custom effects; reset cancellation; validated restoration; all fifteen controllers; combined filters; host style cleanup; dynamic child content; non-modal focus; portal layout; scoped CSS; React18/19 packed consumers; Next App/Pages and direct Server Component imports |
| Implemented but unverified | Broader React19 patch versions, physical devices, assistive technologies and browser versions outside the executed matrix                                                                                                                                                                            |
| Partially implemented      | Broad accessibility acceptance: automated keyboard/axe/reflow checks passed, real screen-reader/physical-device/actual zoom review remains. Host-wide integration: known filter/CSP/Shadow DOM/attribute-change limits remain.                                                                       |
| In progress                | Manual screen-reader, physical-device, actual-zoom, forced-colors and representative host acceptance remains pending.                                                                                                                                                                                |
| Planned                    | Large-DOM profiling, attribute/font-load refresh, explicit effect scopes and richer localization                                                                                                                                                                                                     |
| Blocked                    | Local macOS Firefox launch only (Linux coverage passed); stable human acceptance remains pending                                                                                                                                                                                                     |
| Deferred                   | Multi-provider arbitration and live cross-tab sync                                                                                                                                                                                                                                                   |
| Completed                  | Investigation/baseline, local P0 stabilization, feature regression suite, packed consumer/build verification, documentation, local example verification and full hosted CI meet their stated local acceptance criteria                                                                               |

## Stabilization and Clean light checks

Environment: macOS, Node 22.14.0, npm 11.21.0. Baseline: typecheck/build pass, lint seven errors, 24 nominal tests with three ineffective async assertions, 15 audit findings. See BASELINE.md.

| Check                                       | Actual result                                                                                                                    |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| npm ci (original lock)                      | Passed before implementation                                                                                                     |
| npm run typecheck                           | Passed for source, unit/browser tests and TypeScript configs                                                                     |
| npm run lint                                | Passed with zero warnings, ESLint 10 and hooks rules                                                                             |
| npm test                                    | 61 tests passed in 3 files                                                                                                       |
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

## Merge and review state

[PR #2](https://github.com/prabothcharith/accessibility-react/pull/2) merged stabilization into `new-development`; [PR #3](https://github.com/prabothcharith/accessibility-react/pull/3) merged the complete implementation into `main`. [Merged-main validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38345207412) passed all jobs. PR #16 merged Clean light into main at `15e9465`; [that main run](https://github.com/prabothcharith/accessibility-react/actions/runs/38353340223) also passed all jobs. PR #17 and PR #18 are merged. Version 2 is published from the reviewed main archive; no Git release tag has been created.

## Hosted validation

[Initial hosted run](https://github.com/prabothcharith/accessibility-react/actions/runs/38327175897) on commit `0dc6ead`: Node 22 and 24 unit/type/lint/format/build/archive/audit jobs passed. Packed React/Next builds passed. Full browser matrix: 36 passed, five intentional skips, one Firefox failure caused by computed font-size quantization (`19.8125px` vs `19.8px`). Five other Firefox scenarios passed. The font-size test now permits less than 1/32 CSS-pixel rounding error and still verifies the intended enlargement.

[Corrected hosted run](https://github.com/prabothcharith/accessibility-react/actions/runs/38327577761) on source/test/workflow commit `4fd3768` **passed all jobs**. Fresh final-lock installs, 59 unit tests on Node 22 and 24, type/lint/format/build/archive/audit checks, three packed consumer builds and the full Chromium/Firefox/WebKit/mobile matrix succeeded: **37 passed, five intentional Next-only skips**. Firefox 157 is verified on Linux. This run verified the earlier stabilization snapshot. Follow-up regressions now cover proportional font/line-height scaling and restoration of nullable custom state before mount-effect initialization; their full hosted verification follows below.

CI uses Ubuntu 24.04 and verified Node24-based action releases to avoid the deprecated action runtime and an impending ubuntu-latest image rollover. This configuration passed the corrected hosted run.

## Final regression follow-up

The local suite now passes 61 tests. Font enlargement scales fixed line heights too, preventing overlapping lines, and a validated nullable custom preference restores before a mount effect can initialize a fallback. Packed consumer builds/type checks passed; the text-layout browser regression passed locally in Chromium and desktop/mobile WebKit (18 passed, three intentional skips). [Final source validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38328538388) on commit `a020352` **passed all jobs**: 61 unit tests on Node 22 and 24, type/lint/format/build/archive/audit checks, all three packed consumers and the full browser matrix (**37 passed, five intentional Next-only skips**). This includes Linux Firefox coverage and both final regressions. Subsequent handover edits only record these results.

## Known limits and release gates

1. **Human accessibility testing pending:** VoiceOver/NVDA, physical touch devices, forced-colors visual review, browser zoom 200/400%. Automated axe and emulation do not establish WCAG conformance.
2. **Local Firefox remains unavailable on this Mac.** The complete Firefox browser scenarios passed on Linux, so the local launch issue does not block automated release verification.
3. **License resolved for this release:** on 2026-10-13 the owner confirmed authority to license all included code under ISC. LICENSE and package/lock metadata now agree on ISC. Historical GPL/ISC/MIT discrepancies remain recorded in baseline/migration evidence.
4. **Version 2 identity and channel:** `accessibility-plugin-react@2.0.0` is published under `latest`, superseding the unpublished beta candidate. Registry metadata, integrity, clean React/Next consumers and the browser matrix were verified after npm's publish-time scan completed; see RELEASE.md.
5. One provider per document, no live cross-tab sync, immutable definitions/storage configuration. Routes should share the provider.
6. Effects target current-document HTML only; no Shadow DOM, iframe interiors, pseudo-elements or SVG/canvas text. Color filters alter host containing blocks. Late fonts/attribute-only style changes need a preference refresh. Very large/changing DOMs need application-specific profiling.
7. Media hiding retains layout and does not stop playback. CSP may restrict inline styles/data cursors. No universal host compatibility claim.

**Release readiness:** not yet stable-release-ready. Local implementation and integration evidence are substantially stronger than baseline; the gates above remain explicit. See ROADMAP.md for priorities and DEVELOPMENT.md for the manual procedure.

## Clean light design follow-up

The selected Clean light foundation adds scoped palette variables, decorative icons, compact steppers, responsive spacing, checked selected states, 44px toggle targets and an optional panel description. Local validation: 61 unit tests, type/lint/build/archive checks and all packed consumers passed; Chromium/desktop and mobile WebKit matrix passed 31 tests with four intentional skips. Narrow viewport checks also verify horizontal fit and 44px button dimensions. Runtime screenshots were visually inspected. [Hosted design validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38350884486) and [merged-main validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38353340223) passed all jobs. This foundation is merged, not an outstanding draft. See DESIGN.md.

## Movement and quick-action follow-up

Merged through PR #17 (movement source `d5e21df`), the trigger persists normalized drag/corner placement alongside display settings, with pointer-cancellation/activation guards and keyboard/click alternatives. Fixed header/footer controls and a keyboard action jump keep reset available without scrolling. Resetting display settings preserves placement; position reset is separate. Local validation: 66 unit tests and packed React18/React19/Next consumers passed; the final local browser matrix passed 46 tests with four intentional skips, including measured-size geometry, mouse/Chromium touch dragging, WebKit mobile taps, cancelled drags, 320px/short-screen fit, persistence and fixed-action checks. Hosted movement validation is tracked by PR #17 checks; it is separate from the earlier merged-main results. Human touch, screen-reader and actual zoom acceptance remains pending.

## Release tracking

[Project #18](https://github.com/users/prabothcharith/projects/18) and [tracker #15](https://github.com/prabothcharith/accessibility-react/issues/15) track the remaining release work. Owner licensing/identity decisions (#4/#5), documentation correction (#9), final automated candidate checks and npm publication are complete. Human acceptance (#6–#8) and any separately authorized Git tag/GitHub release remain outstanding.

## npm identity follow-up

The owner requested that the new design update the existing `accessibility-plugin-react` package. The `codex/npm-v2-release` branch updates metadata, imports, documentation, examples and packed consumer fixtures to that name. It retains the previous internal storage key to preserve preferences. This branch includes PR #17's movement source and is based on that review head. The inspected 1.0.0 archive has empty declaration exports and conflicting ISC/MIT metadata; migration guidance records the new major API and the owner’s ISC decision. Candidate validation is recorded in RELEASE.md; no registry publication is implied.

## Final beta validation and upload status

Owner-approved ISC beta source `cf4348b` passed [full hosted validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38356642128): 66 unit tests on Node22/24 and 55 full-matrix browser passes with five intentional skips, plus packed consumers and all build/package checks. npm accepted browser authentication but rejected the upload with a temporary account suspension (E403). Registry checks confirmed no 2.0.0-beta.1, no beta tag, and latest=1.0.0. Publication remains blocked by npm account state, not build failures. Issues #4/#5 are resolved by the owner’s decisions; #11 remains open. See RELEASE.md for the exact archive and retry procedure.

## Version 2 channel selection

The owner requested 2.0.0 without beta on 2026-10-13. Package/lock version and publishConfig now use 2.0.0/latest; README and migration instructions match. This is explicit publication authorization despite the remaining documented human acceptance checks. The earlier account suspension is a registry blocker independent of version choice. Publication results will be recorded after the retry.

## Published version 2

The owner authorized merging PR #17 and PR #18 and dispatching publication. Main commit `1d4ab1c` contains package version 2.0.0, ISC and latest publishConfig. [Pre-merge final validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38359055736) passed all jobs. After the trusted-publisher connection was saved, the failed publish job in [Action 38359604307](https://github.com/prabothcharith/accessibility-react/actions/runs/38359604307) was rerun on 2026-10-16. npm accepted the checksum-verified archive through OIDC.

The action's immediate registry check raced npm's publish-time malware scan and therefore remained red even though upload succeeded. After the scan completed, registry metadata reported 2.0.0/latest with ISC and integrity `sha512-CQFzF0pNl/bb+YVauI35+GNK2PIgk4qoh8+PnEkj1HAeW2lLMM/LTV5fq0tigNRnmPVX0M7rpYR4XPo820CQWw==`. Clean public-registry React18, React19/Tailwind and Next16 consumers passed declarations, ESM/CJS, SSR and production builds. The registry-installed browser matrix passed 55 tests with five intentional Next-only skips across Chromium, Firefox, WebKit and mobile WebKit. Workflow follow-up adds propagation-aware verification; no Git release tag was created.

## Milestone releases (v2.1.0 – v2.27.0)

Subsequent minor releases expanded the library's capabilities while preserving stability, backward compatibility, and the zero-runtime-dependency architecture:

1. **v2.3.0**: Modular accessible control primitives (`FeatureCard`, `ToggleControl`, `ChoiceControl`, `StepperControl`), UI states (`SearchCount`, `EmptyState`, `ErrorState`), profile previews (`ProfilePreviewCard`), and automated multi-registry release workflow.
2. **v2.4.0 – v2.9.0**: Enhanced typography controls (`TextScaleController`, `LineHeightController`, `LetterSpacingController`, `WordSpacingController`, `ParagraphSpacingController`) with reflow protection, script-aware safety (Arabic cursive and Sinhala/Tamil clamping), and stepwise enlargement.
3. **v2.10.0 – v2.14.0**: Reading aids (`ReadingGuideController`, `ReadingMaskController`, `BigCursorController`), decorative image hiding (`HideDecorativeImagesController`), video suppression (`HideVideosController`), and motion reduction (`ReduceMotionController`).
4. **v2.15.0 – v2.19.0**: Accessible tooltips (`TooltipsController`), DOM heading & landmark navigator (`PageNavigatorController`), profile presets (`ProfilesController`), custom preset backup & export (`PresetsController`), non-destructive reader mode (`ReadingModeController`), and keyboard shortcuts with link explorer (`KeyboardShortcutsController`).
5. **v2.20.0 (Issue #57, PR #134)**: User-initiated read-aloud TTS via Web Speech API with sentence-level chunking, pause/resume/stop, voice dropdown, rate and pitch steppers, floating player bar, sensitive field exclusions, and zero network transmission.
6. **v2.21.0 (Issue #58, PR #136)**: Opt-in saturation and grayscale modes with chart/image advisory warnings, Windows forced-colors protection, and instant non-destructive reset.
7. **v2.22.0 (Issue #59, PR #138)**: Accessible terminology dictionary dialog with 100% offline local static glossaries (`en`, `si`, `ta`), zero network calls by default, truthful responses, strict input sanitization, and focus restoration.
8. **v2.23.0 (Issue #60, PR #140)**: Per-site feature-menu customization and reordering (`MenuCustomizationConfig`, `FeatureMenu`) with safe diagnostics and stable rerenders.
9. **v2.24.0 (Issue #61, PR #141)**: Development-only integration diagnostics and test harness (`AccessibilityDiagnostics`, `DiagnosticsPanel`, `DiagnosticsInspector`, `DOM_CONTAINING_BLOCK_AUDIT`) with zero compliance claims, strict privacy guarantees, actionable fixes, and live fixture audits.
10. **v2.25.0 (Issue #62, PR #143)**: Strictly opt-in, disabled-by-default local lifecycle callbacks (`onFeatureChange`, `onProfileApply`, `onReset`, `onAction`) with strictly reviewed payloads excluding page text, inputs, identifiers, and speech transcripts.
11. **v2.26.0 (Issue #63, PR #145)**: Measured smart contrast research prototype (`SmartContrastController`, `smartContrast` engine) evaluating eligible text foreground luminance against computed backdrops with Porter-Duff compositing, LRU caching, unsupported backdrop detection, non-destructive restoration, and zero WCAG compliance claims.
12. **v2.27.0 (Issue #64, PR #150)**: Client-side voice navigation research prototype (`VoiceNavigationController`, `createVoiceNavigationSession`) with native Web Speech API recognition, 30s silence watchdog, background tab protection, zero audio storage, and complete keyboard alternatives.
13. **v2.28.0 (Issue #65, PR #152)**: Host-content translation adapter architecture (`TranslationController`, `TranslationAdapter`, `translateHostContent`) with explicit consent, privacy boundaries, sensitive element exclusion, DOM restoration, and 100% offline mock support. Completes Milestone 4.
