export type ContrastMode = "off" | "light" | "dark" | "high" | "invert";
export type ReaderMode = "off" | "guide" | "mask";
export type StorageMode = "none" | "session" | "local";
export type TextAlignPreference =
  "original" | "left" | "right" | "center" | "justify";
export type FontFamilyPreference = "original" | "legible" | "dyslexia-option";
export type CursorSizePreference = "original" | "large";
export type SaturationPreference = "original" | "low" | "high" | "grayscale";

export interface AccessibilityPreferences {
  /** Relative scale: 0.5 to 2.0 (1.0 = original). */
  fontScale: number;
  /** Relative scale: 0.5 to 2.0, or null for site original. */
  lineHeight: number | null;
  /** Letter spacing in em: 0.0 to 0.5, or null for site original. */
  letterSpacingEm: number | null;
  /** Word spacing in em: 0.0 to 0.5, or null for site original. */
  wordSpacingEm: number | null;
  /** Paragraph spacing in em: 0.0 to 1.0, or null for site original. */
  paragraphSpacingEm: number | null;
  textAlign: TextAlignPreference;
  contrastMode: ContrastMode;
  highlightLinks: boolean;
  highlightFocus: boolean;
  reduceMotion: boolean;
  hideDecorativeImages: boolean;
  fontFamily: FontFamilyPreference;
  cursorSize: CursorSizePreference;
  readerMode: ReaderMode;
  saturation: SaturationPreference;
  tooltips: boolean;
}

export type ProfilePresetId =
  | "motor"
  | "blind"
  | "color-blind"
  | "dyslexia"
  | "low-vision"
  | "cognitive"
  | "seizure"
  | "adhd";

export interface ProfileDefinition {
  id: ProfilePresetId;
  label: string;
  description: string;
  settings: Partial<AccessibilityPreferences>;
}

export interface ActiveProfileState {
  profileId: ProfilePresetId;
  baseSnapshot: Partial<AccessibilityPreferences>;
  overrides: Partial<AccessibilityPreferences>;
}

export interface PreferencesState {
  /** Base preferences configured before any profile was selected. */
  base: AccessibilityPreferences;
  /** Active profile preset identifier, if any. */
  activeProfileId: ProfilePresetId | null;
  /** Snapshot of settings applied by the current active profile. */
  profileSnapshot: Partial<AccessibilityPreferences> | null;
  /** User explicit overrides applied on top of the active profile. */
  overrides: Partial<AccessibilityPreferences>;
  /** Effective resolved preferences combining defaults, base, profile, and overrides. */
  effective: AccessibilityPreferences;
}

export type PreferencesAction =
  | {
      type: "SET_PREFERENCE";
      key: keyof AccessibilityPreferences;
      value: AccessibilityPreferences[keyof AccessibilityPreferences];
    }
  | {
      type: "APPLY_PROFILE";
      profileId: ProfilePresetId;
      settings: Partial<AccessibilityPreferences>;
    }
  | {
      type: "CLEAR_PROFILE";
    }
  | {
      type: "RESET_ALL";
    }
  | {
      type: "IMPORT_PREFERENCES";
      preferences: Partial<AccessibilityPreferences>;
    };
