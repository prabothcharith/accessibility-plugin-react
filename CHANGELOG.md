# Changelog

## Unreleased — stabilization based on 0.1.0

- Font enlargement preserves fixed line-height proportions; nullable custom state restores before mount-effect initialization.
- Provider-owned built-in/custom effects persist across panel closure and control removal; cleanup restores host styles.
- Compose simultaneous color filters and restore reduced contrast, link palette variants and older React color palettes.
- Per-provider versioned storage, validated restore, debounced writes, reset cancellation and teardown/pagehide flush.
- Native named controls, non-modal panel, focus return, scoped responsive CSS and body portals.
- Correct reading mask, dynamic content sizing, media visibility, large cursor and pointer/focus reading aids.
- Optional custom apply/validate contract, optional trigger icon, labels/style customization and storage disable.
- ESM/CJS client boundary and matching declarations; both CSS export paths; correct repository metadata; include existing GPL license text.
- Regression, packed-consumer, browser/axe tests, CI and maintained integration/release documentation.
- Upgrade vulnerable development tooling; no runtime dependencies beyond React peers.

No version bump, npm publication, release tag or default-branch merge has occurred. See PROJECT_STATUS.md for limitations and release gates.

## Historical 0.1.0 branch

September 2026 compound-component implementation, fifteen controllers, generic state, tsup and initial tests. Historical verification is superseded by docs/BASELINE.md.

## Older React development history

December 2025 PR #1 repaired Vite CSS/declarations and changed tools-as-children to app-as-children. It used a different package name/version and ISC metadata. This is architectural history, not a release claim for the current package.
