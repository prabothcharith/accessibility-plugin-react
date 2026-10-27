# Accessibility Profiles and Deterministic Override Model

`accessibility-plugin-react` provides eight neutral, user-editable accessibility profile presets alongside a deterministic override model. The profiles offer tested suggestions of preference combinations without making medical claims or altering keyboard navigation.

## The Eight Presets

Each profile is defined in `src/core/preferences/defaults.ts` and exposed through `PROFILE_DEFINITIONS`:

| Profile Preset            | Identifier    | Description & Focus                                                                                | Settings Applied                                                                   |
| ------------------------- | ------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Motor Impaired**        | `motor`       | Enhanced focus rings, richer tooltips, and reduced motion.                                         | `highlightFocus: true`, `reduceMotion: true`, `tooltips: true`                     |
| **Blind & Screen Reader** | `blind`       | Semantic assistance and accessible authored descriptions without speech synthesis or mic requests. | `tooltips: true`                                                                   |
| **Color Blind**           | `color-blind` | High contrast accents and non-color-only link indicators.                                          | `contrastMode: "high"`, `highlightLinks: true`                                     |
| **Dyslexia Friendly**     | `dyslexia`    | Legible typeface, reading guide line, and reduced motion.                                          | `fontFamily: "dyslexia-option"`, `readerMode: "guide"`, `reduceMotion: true`       |
| **Low Vision**            | `low-vision`  | Enlarged text, large cursor pointer, and high-visibility focus.                                    | `fontScale: 1.25`, `cursorSize: "large"`, `highlightFocus: true`, `tooltips: true` |
| **Cognitive & Learning**  | `cognitive`   | Mild text scaling, reading guide line, and distraction reduction.                                  | `fontScale: 1.125`, `readerMode: "guide"`, `reduceMotion: true`, `tooltips: true`  |
| **Seizure & Epileptic**   | `seizure`     | Pauses nonessential motion and reduces transition flashes.                                         | `reduceMotion: true`                                                               |
| **ADHD / Focus**          | `adhd`        | Reading mask spotlight and reduced animation distraction.                                          | `readerMode: "mask"`, `reduceMotion: true`                                         |

## Deterministic Override Model

When a user applies a profile, their pre-existing customizations are never permanently overwritten. The model operates in three distinct layers:

```
┌────────────────────────────────────────────────────────┐
│ 1. User Explicit Overrides (Highest Precedence)        │
│    Any adjustment made while a profile is active.      │
├────────────────────────────────────────────────────────┤
│ 2. Active Profile Snapshot (Atomic Suggestion)         │
│    Settings configured by the selected profile preset. │
├────────────────────────────────────────────────────────┤
│ 3. Baseline Preferences (Pre-Profile Custom Settings)  │
│    Settings configured by the user prior to profile.   │
└────────────────────────────────────────────────────────┘
```

### Independent Choice Survival

- **Snapshotting**: Upon applying a profile, the pre-profile values for all affected settings are recorded in `baseSnapshot`.
- **Override Tracking**: When a user adjusts any setting while a profile is active, that setting is stored in `overrides`.
- **Reversion**: When the user clicks **Revert to custom settings**:
  - Settings that were **not** touched by the user return to their pre-profile `baseSnapshot` values.
  - Settings that **were** explicitly overridden by the user **survive** at their adjusted values.
  - The active profile is cleared to `null`.

## Privacy & Safety Guardrails

- **Zero Implicit Speech or Microphone Access**: Presets (such as `blind`) strictly provide DOM visual/structural enhancements and never invoke Web Speech API synthesis, microphone permissions, or external audio streams without explicit user consent.
- **No Medical Efficacy Claims**: Profiles are presented neutrally as assistive suggestions, not diagnostic or therapeutic solutions.
- **No Keyboard Sequence Mutation**: Profiles never alter standard DOM tab order or create false modal traps.

## Component & Hook Usage

### Controller Component

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  ProfilesController,
  FontSizeController,
  ContrastModeController,
} from "accessibility-plugin-react";

export function Settings() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <ProfilesController label="Profiles" />
        <FontSizeController />
        <ContrastModeController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

Aliases: `ProfileController`, `AccessibilityProfilesController`.

### Custom Profile Consumption via `useProfiles()`

```tsx
import { useProfiles } from "accessibility-plugin-react";

export function CustomProfileSelector() {
  const {
    profiles,
    activeProfileId,
    activeProfile,
    applyProfile,
    revertProfile,
    isProfileActive,
  } = useProfiles();

  return (
    <div>
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() =>
            isProfileActive(p.id) ? revertProfile() : applyProfile(p.id)
          }
          aria-pressed={isProfileActive(p.id)}
        >
          {p.label} {isProfileActive(p.id) ? "(Active)" : ""}
        </button>
      ))}
    </div>
  );
}
```
