# Changelog

## Unreleased — 2.0.0 candidate

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

Stabilization merged into main through PR #3; the Clean light foundation merged through PR #16. Movement/fixed actions and corrected release-status documentation are in PR #17. No version bump, npm publication or release tag has occurred. See PROJECT_STATUS.md for limitations and release gates.

## Historical 0.1.0 branch

September 2026 compound-component implementation, fifteen controllers, generic state, tsup and initial tests. Historical verification is superseded by docs/BASELINE.md.

## Older React development history

December 2025 PR #1 repaired Vite CSS/declarations and changed tools-as-children to app-as-children. It used a different package name/version and ISC metadata. This is architectural history, not a release claim for the current package.
