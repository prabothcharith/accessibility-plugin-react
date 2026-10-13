# Architecture

## Ownership and lifecycle

`AccessibilityPlugin` owns a generic preference store, feature definitions, effect coordination and panel state. `useAccessibility<T>(key, defaultValue, options?)` registers a definition after commit and returns shared state. Registration is immediately visible to subsequent mount effects, so custom controls may synchronize their state there. Registration survives control unmount until the provider is removed; changing routes or hiding UI therefore does not clear a selected preference. Omit a controller from the initial composition to omit that feature. A stored built-in value has no effect until its key is registered. To intentionally remove an already registered preference, reset it before removing its control or remount the provider with an appropriate storage key.

`AccessibilityButton` and `AccessibilityList` render portals under `document.body`. Their roots have no fixed dimensions; only visible trigger/panel boxes receive pointer events. Application content remains in normal flow, whether it is a provider child or sibling. `hidden` removes closed panel controls from display and accessibility navigation while keeping their React lifecycles alive. No application content is moved into the floating container.

The panel uses disclosure-style `aria-expanded`/`aria-controls` on the trigger and a named non-modal region. Opening focuses the region, closing restores focus. It neither traps focus nor makes the page inert. This supports adjusting and immediately trying preferences. See [WAI disclosure pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/). The historical modal requirement was deliberately replaced because the application stays interactive.

## Preference store

`preferenceStore.ts` uses `useSyncExternalStore` with a stable empty server snapshot and cached client snapshot. SSR does not access DOM or storage; hydration attaches to the same initial markup and then restores preferences. A brief default-state paint is possible and is not described as flash-free.

State is a JSON-compatible key/value record. `featureSchema.ts` checks built-in bounds, enums and booleans. Custom primitives receive type validation; structured values should supply a validator. Reserved prototype keys are rejected. Version 1 storage is `{ version: 1, features: {...} }`; the old unversioned record is readable, unknown envelope versions and invalid root shapes are ignored. Individual invalid values fall back to defaults without crashing effects.

Each provider owns its own 200ms trailing writer. An update replaces its pending snapshot; reset cancels it and removes the key immediately. `pagehide` and provider teardown flush pending user changes. Storage exceptions are swallowed because preferences must work without persistent storage. No cross-tab synchronization; last actual write wins across tabs. No telemetry, network calls, cookies or server-held preferences.

Persistence key and enabled state are immutable for a mounted provider; remount with `key` when changing them. One provider per document is explicitly enforced by a WeakMap ownership check. This avoids inconsistent global effect arbitration. Strict Mode setup/cleanup is supported. Separate browser documents may each have a provider.

## Effect engine

Controllers render UI only. The provider computes registered built-in values and calls `useBuiltinEffects`; custom `apply` callbacks run in provider-owned `CustomEffect` children.

Built-in effects snapshot only properties they write, including inline priority. Disabling/reset/unmount restores those properties; if the host has since written a different value, cleanup leaves that host change alone. Do not have host code and custom features continuously compete for the same CSS property.

Text sizing measures all eligible HTML elements before writing. Font size scales computed pixels; line height scales computed line height (normal uses a 1.2× font-size approximation). This handles explicit pixel fonts as well as rem and em layouts without nested multiplication. Letter spacing and alignment override eligible descendants. Detached nodes are restored and released on the next mutation refresh. The observer watches child-list changes and batches each delivered mutation batch; resize also recalculates. Attribute-only theme/style changes and late-loaded font metrics are limitations: toggle the relevant preference to refresh. Shadow roots and iframe documents are outside scope.

Color filters compose in the order **host filter → contrast → saturation → invert → grayscale**. Numeric contrast and named palettes share one setting. Grayscale logically removes saturation color differences, but saturation remains selected and resumes when grayscale is disabled. Filter only body child content roots, excluding widget/reading-aid nodes. Transparent roots receive a reversible background from the body's computed background (white fallback) so inversion includes the surface. Filtering creates CSS stacking contexts and containing blocks inside host roots; fixed descendants may need application-specific integration.

Reading aids are separate pointer-transparent, aria-hidden overlays, lower than the widget. Pointer movement and focused host elements move them; no motion transitions. Media hiding uses visibility to retain geometry; video hiding does not pause playback or mute sound.

## Decisions retained and changed

Retain compound JSX composition, all named controllers, generic hook, npm, TypeScript, tsup, React peers, static CSS. Add optional provider-owned custom effects without breaking the two-argument hook.

Replace controller-owned mutations and shared debounce; these failed lifecycle guarantees. Remove Tailwind build/reset machinery: authored CSS uses no utility generation, so a scoped static copy is simpler and avoids leaking preflight into consumers. Preserve the historical CSS source filename to keep history understandable. No runtime dependencies beyond React peers. Preserve both CSS export paths.

The selected branch is already a different API/package identity from `development`; do not claim old `tools`/`trigger` APIs remain compatible. See migration notes. Dragging is deferred because four placements already work without introducing pointer/activation ambiguity.
