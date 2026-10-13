# React Accessibility Plugin

Build a composable React display-preference library. Read [status](docs/PROJECT_STATUS.md), [roadmap](docs/ROADMAP.md), [architecture](docs/ARCHITECTURE.md) and [API](docs/API.md) before changing behavior. They supersede historical root specification/commit-summary claims.

- Foundation: `new-development` at 6dfbd44; stabilization merged into `main` at 2893b6c. Clean light merged into `main` through PR #16 at 15e9465. Movement/fixed actions are in PR #17 on `codex/movable-quick-actions`. Preserve unrelated work. Use focused branches/PRs; no force push, publish, tags or default-branch merge without owner authorization.
- Core owns state, storage and persistent effects; controls only render/set state. Never restore controller-owned effect lifetimes. One provider per document; definitions persist through control unmount. Keep the widget outside host filters and application layout.
- Public compound exports and two-argument hook are compatibility contracts. Justify behavior/API changes and update MIGRATION.md. Custom feature options require cleanup and validated persistence.
- `src/core`: store/provider/effects/UI. `src/features`: controllers. `src/styles/tailwind.css`: plain scoped CSS despite its historical filename. `tests`: unit and packed browser fixtures. `scripts`: build/package/consumer validation. `examples`: built-package demos. `docs`: maintained guidance.
- Node >=22.13 and npm; `npm ci`, `npm run validate`, `npm run pack:check`, `npm run test:consumers`, `npx playwright install --with-deps`, `npm run test:browser`. `npm run example` serves built demos after build.
- Add meaningful regressions for behavior changes. Verify actual tarball consumers, not only source imports. Keep async assertions deterministic. Browser checks are required for CSS, focus, hit testing, responsive behavior and axe. Record environment failures separately.
- Native named controls, pressed/disabled states, visible focus, non-modal semantics, safe areas and reduced motion are required. Automated audits do not establish WCAG compliance. Follow manual checks in DEVELOPMENT.md.
- Built-in keys/defaults/bounds live in featureSchema.ts; effects belong in effects.ts. Preserve host property values/priorities. Include restore/reset/unmount/dynamic-content coverage. No global CSS preflight.
- Update FEATURES/API/custom examples when contracts change, PROJECT_STATUS/ROADMAP when verified status changes, and CHANGELOG for user-visible work. Never invent test results, releases or percentages.
- GPL declaration retained from selected branch; conflicting historical ISC metadata and package identity need owner resolution before release. Do not silently change license or publish.

- Base appearance follows the owner-selected Clean light principles in docs/DESIGN.md. Keep scoped palette variables, decorative icons, native controls, visible checked states and at least 44px button targets. Keep every existing mode; do not copy mockup omissions or add fake navigation.

- Widget placement is reserved provider-owned state. Display reset preserves it; position reset removes it. Keep drag cancellation/activation guards, non-drag alternatives and resize clamping. Only the tools list scrolls; reset/footer actions stay fixed through the internal action portal.
