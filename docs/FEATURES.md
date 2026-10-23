# Features and parity

All features are opt-in via controllers, use native buttons, support Enter/Space and ordinary Tab order, and expose pressed/disabled state or a polite numeric output. Defaults leave the host unchanged. Values persist once changed and return to defaults on Reset All. Effects persist when controls/panel disappear and are cleaned on provider removal. Widget portals are excluded. The engine restores prior inline properties and priorities instead of simply deleting them.

| Controller / key                        | Default; states and bounds                                           | Host behavior / edge cases                                                                                                                                           |
| --------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TextScaleController / fontScale         | 1.0; 1.0, 1.125, 1.25, 1.5, 2.0 (stepwise)                           | Reflow-safe stepwise text enlargement without CSS transforms or compounding. Protects forms, labels, code, icons, widget, and exempt content.                        |
| FontSizeController / fontSize           | 100; 50–200%, step 10 or stepwise                                    | Scales computed font size and line height together. Supports optional `stepScale` / `steps` props; protects forms, labels, code blocks, icons, and widget UI.        |
| LineHeightController / lineHeight       | 100; 50–200%, step 10                                                | Scales existing computed line height, multiplied by active font scale. Normal line height uses 1.2× font approximation.                                              |
| LetterSpacingController / letterSpacing | 0; 0–10px, step 1                                                    | Nonzero value sets spacing on HTML descendants. Zero restores host.                                                                                                  |
| ContrastController / contrast           | 0; 0/1/2/3, reduced, yellow-on-black, white-on-black, blue-on-yellow | Off, 1.25×, 1.5×, 2×; reduced=0.5×. Named palettes set foreground/background instead of contrast filter. Palette doesn't guarantee contrast of all rendered content. |
| SaturationController / saturation       | 0; 0/1/2                                                             | Off, 0.2×, 2× saturation. Composes with other filters.                                                                                                               |
| InvertColorsController / invertColors   | false; boolean                                                       | Adds invert(1), includes content images.                                                                                                                             |
| GrayscaleController / grayscale         | false; boolean                                                       | Adds grayscale(1); saturation cannot restore color while this is active.                                                                                             |
| LinkHighlightController / linkHighlight | false; false/true/yellow-on-black/blue-on-yellow/black-on-white      | True uses dark text on pale yellow; palette buttons restore the original variants. Underlines a[href]. Toggle turns selected palette off.                            |
| TextAlignController / textAlign         | default; default/left/center/right/justify                           | Default restores host; left really forces left, including in RTL content. Justification can reduce readability for some users.                                       |
| HideImagesController / hideImages       | false; boolean                                                       | Hides img/picture with visibility:hidden and removes CSS background images from HTML elements. Layout retained. SVG/canvas/pseudo-element imagery not hidden.        |
| HideVideosController / hideVideos       | false; boolean                                                       | Hides video and recognized YouTube/Vimeo embed URL patterns. Does not hide unrelated iframe documents, pause video or mute audio.                                    |
| BigCursorController / bigCursor         | false; boolean                                                       | 40px high-contrast pointer via SVG cursor with native fallback. Host CSS cursor effects are restored. No effect on touch-only hardware.                              |
| ReadingMaskController / readingMask     | false; boolean                                                       | Transparent 100px reading window; surrounding screen dimmed. Follows pointer or host focus.                                                                          |
| ReadingGuideController / readingGuide   | false; boolean                                                       | 4px blue line with white border follows pointer or host focus. Can coexist with mask.                                                                                |
| ResetController                         | No feature state                                                     | Clears display settings including custom/unmounted controls, preserves widget placement; runs legacy reset callbacks; keeps panel open.                              |

## Accessible control primitives and UI states

The library exports modular UI primitives conforming to WCAG 2.2 criteria:

| Primitive                   | Accessible Role & State                             | Key Capabilities                                                                                                                                |
| --------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `ToggleControl`             | `role="switch"`, `aria-checked`                     | Keyboard Space/Enter toggle, disabled/unavailable states, >=44px touch targets (>=48px in largeControls mode).                                  |
| `ChoiceControl`             | `role="radiogroup"`, `role="radio"`, `aria-checked` | Arrow key (Left/Right/Up/Down/Home/End) cycling, check indicators, multi-level/category grouping.                                               |
| `StepperControl`            | `role="group"` with `<output aria-live="polite">`   | Accessible increment/decrement buttons, boundary clamping, optional `role="slider"` range input.                                                |
| `FeatureCard`               | `role="group"`, `aria-label`                        | Card container with title, icon, description, status badge, and alert states (`idle`, `active`, `error`, `unavailable`, `permission-required`). |
| `SearchCount`               | `role="status"`, `aria-live="polite"`               | Live status announcement of matched and total features for search filtering.                                                                    |
| `EmptyState` / `ErrorState` | `role="status"` / `role="alert"`                    | Clear messaging with action button for empty results and error recovery.                                                                        |
| `ProfilePreviewCard`        | `role="group"`                                      | Previews affected settings for accessibility profiles (low-vision, dyslexia, etc.) and provides one-click reversal back to custom settings.     |

## Original JavaScript and branch comparison

Reference: vanilla `47f44c5` (`accessibility-menu.js`, package 1.2.2); older React `7aef17c`; newer baseline `6dfbd44`. “Present” is source evidence, not proof of correctness. See baseline for defects.

| Original behavior                     | Older React                 | Newer baseline                          | Stabilized behavior                                             |
| ------------------------------------- | --------------------------- | --------------------------------------- | --------------------------------------------------------------- |
| Invert + grayscale                    | Exclusive contrast enum     | Independent but overwrite               | Independent, composable                                         |
| Low 20% / high 200% saturation        | Exclusive modes             | 50% / 200%, overwrite                   | Restore original 20% / 200%                                     |
| Contrast 0.5 / 1.5 / 2                | Replaced by named palettes  | 1.25 / 1.5 / 2                          | Preserve newer levels, add reduced 0.5 and older palettes       |
| 3 link palettes                       | One highlighting toggle     | One toggle                              | Default toggle plus all 3 original palettes                     |
| Font size 1.3/1.5/1.8rem on html      | Root scale                  | 50–200% on html                         | Fine-grained computed font scaling, including px fonts          |
| Line height 1.5/1.8/2 on descendants  | Root inherited value        | Root percent                            | Scale actual computed line height across descendants            |
| Letter spacing .1/.2/.3rem            | em slider                   | 0–10px root                             | 0–10px descendant override                                      |
| Left/center/right text alignment      | Includes initial            | Left is “off”                           | Explicit default plus left/center/right/justify                 |
| Hide img / video with display:none    | Images only                 | Images/videos plus some embeds          | Both; retain layout, restrict video embeds                      |
| Circle cursor enlarges on link hover  | Big cursor                  | Static circle CSS cursor                | Large contrast pointer; decorative hover enlargement replaced   |
| Reading mask clear center             | Guide only                  | Dark strip obscures center              | Clear center restored                                           |
| Quarter-width guide + triangle        | Guide                       | Full-width line                         | Full-width line; native cursor retained                         |
| Reset classes, sizes, counters        | Fixed state reset           | Generic reset, stale timer              | Generic reset, cancellation and effect restoration              |
| Four user-selected placements, saved  | Draggable trigger           | Position prop, broken panel positioning | Persisted free drag, four corners, Alt+arrow and click controls |
| Save on beforeunload, unguarded parse | No localStorage persistence | Debounced but shared timer              | Versioned/validated, per-owner debounce, pagehide/unmount flush |

Widget placement is now a persisted preference with pointer dragging and non-drag alternatives. The initial position prop remains a fallback. Original cursor decoration remains deferred, not counted as visual parity. Original combinations enumerated CSS selectors; centralized composition avoids that unmaintainable combinatorial model. Original click-only div controls are replaced with native named buttons.

## Verification mapping

`tests/features.test.tsx`: stepper bounds, palettes, all alignment states, boolean effects, combined filters, native host restoration and dynamic routes. `tests/plugin.test.tsx`: custom lifecycle, restoration, invalid data, focus, Strict Mode, SSR, hydration, singleton enforcement. `tests/storage.test.ts`: deterministic timers, errors and schema envelopes. `tests/browser/widget.spec.ts`: actual compiled CSS, packed consumers, visibility, pointer interaction, geometry, keyboard and axe. See project status for executed results and manual gaps.
