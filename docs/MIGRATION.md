# Migration

## From newer development baseline (6dfbd44)

Existing compound imports and two-argument `useAccessibility` calls remain. CSS `/dist/style.css` still resolves; prefer `/style.css` for new integrations. Optional trigger icon, configurable labels/style and `persist` are additions.

Behavior changes with rationale:

- Effects belong to the provider and persist after panel/control removal. Defaults register while the panel is closed; restored settings apply immediately after hydration. To disable a removed feature, reset it first. Mount one provider above routes.
- The panel is a **non-modal region**, not a modal dialog. Remove tests relying on `role=dialog`, focus traps or fixed ID `arap-panel`. Use the trigger's aria-controls or accessible role/name. Hidden content remains in the DOM; query its visibility rather than asserting node absence.
- No full-screen/side fixed wrapper around app children. Button/list use body portals. Ancestor-dependent CSS may need `.arap-root` overrides.
- Text alignment defaults to `default`; persisted `left` now actively forces left. Line-height percentages scale measured baseline. Font percentages scale individual computed fonts, including pixel-sized text, instead of only changing html.
- Low saturation is 20%, restoring original vanilla behavior; previous 50% is no longer the low preset. Contrast 1/2/3 retains 1.25/1.5/2; reduced and color palettes are additive choices.
- Image hiding preserves layout and removes CSS backgrounds. Videos use targeted embed recognition; unrelated document/map iframes remain visible. Reading mask now has a transparent reading window.
- Single provider/document is enforced. Changing persistence configuration in place is rejected; remount with a React key.
- Custom callbacks passed in hook options are immutable definitions. Direct click-handler DOM mutations must move into an apply callback with cleanup. Ordinary React effects remain supported but end when their own component unmounts.
- Persisted root data gains a version envelope. Unversioned records still load; invalid values fall back. Reset cancels pending writes and deletes display preferences; when a widget placement is saved, that preference remains. Reset button position removes it separately.
- Plain scoped CSS replaces Tailwind's global reset. Hosts must import CSS, but need no build-time scanning/configuration.

## From older development (7aef17c / PR #1)

The owner has selected the existing npm package `accessibility-plugin-react` for this update. The published 1.0.0 package uses the older integration; version 2.0.0 uses with explicit compound composition. Its historical development name was `react-accessibility-plugin@0.1.0`, which is not the release identity. This is a breaking API upgrade, not an automatic visual-only replacement.

The inspected published 1.0.0 archive has an empty `dist/index.d.ts` (`export {}`), metadata declaring ISC and a README declaring MIT. The new archive ships usable ESM/CJS declarations and uses ISC following the owner’s explicit confirmation on 2026-10-13 that all included code may be licensed under ISC. Published README package/import names were inconsistent; use `accessibility-plugin-react` and `accessibility-plugin-react/style.css` for this release.

Replace `<AccessibilityPlugin tools={...} trigger={...}>app</AccessibilityPlugin>` with app content plus an explicit `<AccessibilityButton icon={...}/>` and `<AccessibilityList>controllers</AccessibilityList>`. There are no automatic tools. Convert FontSizeTool to FontSizeController, LineHeightTool to LineHeightController, LetterSpacingTool to LetterSpacingController, TextAlignTool to TextAlignController. Split ContrastTool into Contrast/Saturation/InvertColors/Grayscale controllers; split CursorTool into BigCursor/ReadingGuide/ReadingMask controllers; split VisualTogglesTool into HideImages/LinkHighlight controllers. HideVideosController is additional. Add ResetController explicitly.

Replace `useAccessibility().fontSize/setFontSize` with `useAccessibility('fontSize', 100).value/setValue`; old scale 1.2 becomes 120. Do not mechanically migrate line-height absolute multipliers to relative percentages without checking rendered results. Old localStorage was not implemented; no legacy fixed-provider storage format is promised. The new trigger supports dragging, keyboard/click alternatives and saved placement; configure position for its initial corner.

## Historical documents

`react-accessibility-plugin-spec.md` and `COMMIT_SUMMARY.md` remain historical evidence. They describe prior intent/results, not current guarantees. Current docs, tests, public declarations and PROJECT_STATUS.md supersede contradictory examples and completion claims.

## Movable trigger and fixed actions

Pointer dragging is enabled by default; set AccessibilityButton draggable={false} to disable it. Normal activation is preserved through a movement threshold. Saved placement overrides the position prop until reset separately. ResetController keeps the saved placement while resetting display features. Its button moves to the fixed panel action area even when composed inside nested children; CSS overrides relying on its old scroll-list DOM ancestry may need updates. AccessibilityList footer is an additive slot for other fixed actions. Trigger and panel description IDs are now distinct.

## Upgrade from the historical compound development name

Replace imports from `react-accessibility-plugin` with `accessibility-plugin-react`, including the CSS import. Named compound components and the two-argument hook remain. The default storage key stays `react-accessibility-plugin:state` so existing compound-development preferences and placement are preserved; package branding does not reset user settings. No migration from the old published widget's unverified storage format is promised.
