# Development, quality and release

## Clean checkout

Use Node >=22.13 and npm. The committed package-lock is the library dependency source of truth. No application environment variables or services are required.

```sh
git switch main
git pull --ff-only origin main
git switch -c codex/your-feature
npm ci
npm run validate
npm run pack:check
npm run test:consumers
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
```

For a PR under review, check out its head branch instead and record the tested commit. Main contains the merged stabilization and Clean light foundation; PR #17 adds movement and fixed actions.

`validate` runs typecheck, lint, unit tests and JS/declaration/CSS build. `test:consumers` builds, packs and installs the archive in `.consumers/react18`, `.consumers/react19` and `.consumers/next`, checks ESM/CJS and declarations/SSR, and produces application production builds. Consumers use explicitly selected framework versions; generated install locks reside in disposable `.consumers`. Network access is required for installation, not widget runtime. Browser tests start local ports 4311/4312/4313 and close their servers afterward. Avoid using these ports for unrelated processes. `CI` disables server reuse and is a test-runner environment flag, not a library setting.

`npm run example` serves the two built-package examples through Vite after `npm run build`. `npm run dev` watches the library JS bundle; run build:css after editing CSS. `npm run test:watch` is useful locally. `npm pack` produces the actual package archive. Never validate only source imports and call it release-ready.

## Directory map

```text
src/
  index.ts                    public exports
  core/
    AccessibilityPlugin.tsx   ownership, definitions, composition
    AccessibilityContext.ts   shared context
    preferenceStore.ts        external snapshot, SSR/hydration and writes
    storage.ts                schema envelope and isolated writer
    featureSchema.ts          defaults and value validation
    effects.ts                host effects and custom effect lifetimes
    useAccessibility.ts       consumer hook
    AccessibilityButton.tsx   trigger
    AccessibilityList.tsx     non-modal region and focus
    WidgetPortal.tsx          client-only body portal boundary
    widgetPlacement.ts        validated placement and viewport geometry
    PositionControls.tsx      non-drag movement alternatives
    PanelActionsContext.ts    fixed-action portal host
    FeatureIcon.tsx            decorative control icons
    types.ts                  public contracts
  features/*Controller.tsx    fifteen opt-in native controls
  styles/tailwind.css          scoped plain CSS (historical filename)
tests/
  *.test.ts(x)                regressions for effects/provider/storage
  helpers.tsx, setup.ts       fixtures and DOM matchers
  browser/                   packed consumer app, host CSS, Playwright tests
scripts/                     CSS build, archive checks, clean consumer setup
examples/                    basic and custom feature demos
.github/workflows/ci.yml      unit/build/package and browser integration jobs
docs/                        maintained architecture/API/status/guides
AGENTS.md                    future-agent entry point
LICENSE                      owner-approved ISC license text
COMMIT_SUMMARY.md             historical claims; not present verification
react-accessibility-plugin-spec.md historical requirements
```

## Test expectations

Write a reproducer before/alongside a lifecycle fix. Verify reset, restore, disable, provider unmount, repeated mount and Strict Mode. Check interactions with other active preferences and pre-existing host styles. Keep fake timers in storage tests; do not put unawaited assertions in timeout callbacks. Browser CSS numeric comparisons should tolerate subpixel serialization differences, not weaken functional bounds.

CI has read-only repository permissions. It runs validation on Node 22 and 24 and packed/browser consumers on Ubuntu 24.04 using Node24-based action releases. No publishing secrets, release tags, npm tokens or publishing job exist. A workflow file is implemented but not “CI passing” until a real hosted run succeeds.

## Manual accessibility acceptance checklist

These checks require a human/tester; mark results and platform/version in PROJECT_STATUS.md. Use [WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/) and [WAI disclosure guidance](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/).

1. Keyboard only: reach trigger, open with Enter and Space, verify focus is visibly on the panel, visit every control, exercise both stepper bounds, leave the non-modal panel with Tab, return, close using Escape/Close and confirm focus. Ensure no trap and no unexpected scrolling/focus loss when route content changes.
2. Screen readers: VoiceOver/Safari on macOS and iOS; NVDA/Firefox or Chrome on Windows. Verify trigger name/expanded state, named region, group names, pressed states, numeric announcements, hidden panel exclusion and reset state announcements. Check verbosity with multiple outputs changing together.
3. Browser zoom at 200% and 400% (actual browser zoom, not just resizing). Verify text, focus indicators, scroll access and control reflow. A 320px viewport test is supporting evidence, not complete zoom verification.
4. Physical touch devices: safe areas, landscape, large system fonts, scroll inside panel without swallowing host gestures, taps on closed-widget-adjacent content. Playwright device emulation does not substitute for physical touch testing.
5. Light/dark/custom global CSS, forced colors/high contrast, reduced motion. Check active/inactive/focus contrast and visible selection without color alone.
6. Host integration: sticky/fixed overlays, complex forms, embedded media, route navigation, dynamically inserted content and font loading. Confirm each selected setting improves intended content without concealing important controls. Video hiding does not stop playback.
7. Inspect reset/unmount restoration, rapid reload storage, blocked storage and corrupted saved data. Test a custom feature's restored and removed-control effects.

Automated axe results cover the tested widget DOM and criteria tags; they neither certify the host nor cover all assistive-technology behavior.

## Release procedure (manual, owner-authorized)

1. Resolve package identity and historical license conflict with the owner; keep evidence and update migration/license docs if an authorized decision changes anything.
2. Complete all P1 release gates in ROADMAP.md, including real screen readers/devices/zoom, Firefox and hosted CI. No known P0 defects may remain.
3. Choose a semantic version based on the final public contract. Do not silently reuse the unreleased 0.1.0 archive as a claimed registry release. Add dated release notes and supported/verified matrix.
4. Run `npm ci`, `npm run validate`, `npm run test:consumers`, full Playwright matrix, `npm audit`, and inspect `npm pack --dry-run` plus actual archive. Review source maps/docs/license disclosure.
5. Review branch diff and open a PR through the normal repository workflow. Obtain owner approval for merge, tag and npm publication separately as appropriate. Build artifacts locally are not authorization to publish.
6. Only after explicit publication authorization: authenticate with the owner's approved npm publishing method, publish the reviewed archive/version, verify registry exports/CSS/types by clean registry installation, then create authorized release/tag with matching commit. Do not claim success until verified.

No credentials are needed for local development. Never persist secrets in preference state, fixtures or source control.
