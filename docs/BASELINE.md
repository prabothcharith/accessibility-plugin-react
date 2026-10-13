# Investigation baseline — 2026-10-12

Working branch: `codex/stabilize-accessibility`, based on `origin/new-development` at `6dfbd44`. Initial checkout was clean `development` at `7aef17c`. Remote refs fetched before selection.

## History and foundation

- `main` (`4aedffc`): only .gitignore. Not an implementation foundation.
- `development` (`7aef17c`): monolithic provider with seven tools, Motion dragging, color palettes, Vite distribution. PR #1 merged 2025-12-03 repairs CSS, declarations and changes children to application content. Its claims are historical, not current verification.
- `new-development`: September 2026 commits introduce generic state, compound composition, fifteen controllers, tsup and tests. Strongest match to requested architecture, but effect ownership and packaging are defective.
- GitHub issues endpoint returned only merged PR #1, no separate issues. No tags or CI in selected branch. Read PR body and merged diff, specification, commit summary, examples, source, configuration and tests.
- Original `accessibility-plugin` cloned read-only into `/tmp/accessibility-vanilla-reference`. Its GPL-3.0 LICENSE agrees with selected branch metadata/specification. Both original package.json and older React declare ISC despite the original GPL license file; retain selected GPL declaration and original license text, require owner review before release, do not silently relicense.

## Executed baseline

Node 22.14.0, npm 11.21.0, macOS. `npm ci`: success, 332 packages; audit 15 development dependency vulnerabilities (5 moderate, 8 high, 2 critical). `npm run typecheck`: pass. `npm run lint`: FAIL, seven unused identifiers. `npm test`: reports 24 passing, but three storage assertions are unawaited timer callbacks. `npm run build`: pass with warnings that use-client directives were removed; confirmed dist/index.mjs starts with import. `npm pack --dry-run`: 9 files, CSS and declarations present, LICENSE absent.

## Findings and priorities

| Priority | Finding                                                                              | Evidence                                                                           |
| -------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| P0       | Closing panel removes selected effects; restoration waits for opening                | AccessibilityList returns null; controller unmount cleanups                        |
| P0       | Filters erase each other                                                             | applyFilter/clearFilter overwrite root filter in four controllers                  |
| P0       | Invisible fixed widget intercepts host interaction                                   | provider full-height 380px region, unused panelStyle                               |
| P0       | Shared debounce and reset can resurrect settings                                     | storage.ts module timer; clearState does not cancel                                |
| P0       | Next client boundary stripped from built distribution                                | build warning and inspected first line                                             |
| P1       | Invalid storage unvalidated; restoration/save race                                   | loadState accepts JSON arrays/primitives; provider mount saves empty state         |
| P1       | False modal semantics and incomplete focus handling                                  | aria-modal without inert background; disabled controls included in trap            |
| P1       | Global CSS reset leaks; widget inherits root filters                                 | @tailwind base; effects target html                                                |
| P1       | Toggle buttons unnamed; empty default trigger                                        | labels unassociated; required icon                                                 |
| P1       | Reading mask covers reading area instead of exposing it                              | dark 80px strip at pointer                                                         |
| P1       | Host inline styles destroyed on disable/unmount                                      | removeProperty instead of restoration                                              |
| P1       | Generic custom examples do not restore/reset DOM effects                             | direct mutations inside onClick                                                    |
| P1       | Dynamic content, Strict Mode, hydration, mobile, package consumers untested          | tests only source imports/jsdom                                                    |
| P1       | Incorrect repo metadata, unbounded peers, absent license file                        | package.json                                                                       |
| P2       | Link palette variants and reduced contrast lost; left alignment cannot override host | original styles vs controllers                                                     |
| P2       | Dependency security/maintenance debt                                                 | npm audit; ESLint 8 deprecated                                                     |
| P2       | Historical claims inaccurate                                                         | COMMIT_SUMMARY claims outside click and SSR safety without implementation evidence |

Confirmed building blocks: generic state hook, controller composition, native stepper/segment buttons, dual JS/declaration output. Partially implemented: all effects, persistence, focus, position styling. Missing: persistent engine, browser tests, CI, packaged consumer verification, release documentation. Legacy drag is intentionally evaluated after core correctness.

## Implementation sequence

1. Provider-owned effects, schema validation, isolated persistence and deterministic single-document ownership.
2. Repair built-ins and custom effect contract; restore useful original variants.
3. Non-modal panel, portal isolation, responsive scoped CSS and keyboard/focus behavior.
4. Validate packed ESM/CJS/types/CSS, React 18/19, SSR/hydration, Vite and Next consumers.
5. Regression/browser/axe checks and CI.
6. Accurate documentation, migration, release checklist and handover; no publishing or merge.
