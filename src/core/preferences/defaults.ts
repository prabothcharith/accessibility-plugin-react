import type {
  AccessibilityPreferences,
  ProfileDefinition,
  ProfilePresetId,
} from "./types";

export const DEFAULT_PREFERENCES: Readonly<AccessibilityPreferences> =
  Object.freeze({
    fontScale: 1.0,
    lineHeight: null,
    letterSpacingEm: null,
    wordSpacingEm: null,
    paragraphSpacingEm: null,
    textAlign: "original",
    contrastMode: "off",
    highlightLinks: false,
    highlightFocus: false,
    reduceMotion: false,
    hideDecorativeImages: false,
    fontFamily: "original",
    cursorSize: "original",
    readerMode: "off",
    saturation: "original",
    tooltips: false,
  });

export const ALL_PROFILE_IDS: readonly ProfilePresetId[] = [
  "motor",
  "blind",
  "color-blind",
  "dyslexia",
  "low-vision",
  "cognitive",
  "seizure",
  "adhd",
] as const;

export const PROFILE_DEFINITIONS: Record<ProfilePresetId, ProfileDefinition> = {
  motor: {
    id: "motor",
    label: "Motor Impaired",
    description: "Enhanced focus rings, richer tooltips, and reduced motion.",
    settings: {
      reduceMotion: true,
      highlightFocus: true,
      tooltips: true,
    },
  },
  blind: {
    id: "blind",
    label: "Blind & Screen Reader",
    description: "Semantic assistance and accessible authored descriptions.",
    settings: {
      tooltips: true,
    },
  },
  "color-blind": {
    id: "color-blind",
    label: "Color Blind",
    description: "High contrast accents and non-color-only link indicators.",
    settings: {
      contrastMode: "high",
      highlightLinks: true,
    },
  },
  dyslexia: {
    id: "dyslexia",
    label: "Dyslexia Friendly",
    description: "Legible typeface, reading guide line, and reduced motion.",
    settings: {
      fontFamily: "dyslexia-option",
      readerMode: "guide",
      reduceMotion: true,
    },
  },
  "low-vision": {
    id: "low-vision",
    label: "Low Vision",
    description:
      "Enlarged text, large cursor pointer, and high-visibility focus.",
    settings: {
      fontScale: 1.25,
      cursorSize: "large",
      highlightFocus: true,
      tooltips: true,
    },
  },
  cognitive: {
    id: "cognitive",
    label: "Cognitive & Learning",
    description:
      "Mild text scaling, reading guide line, and distraction reduction.",
    settings: {
      fontScale: 1.125,
      readerMode: "guide",
      reduceMotion: true,
      tooltips: true,
    },
  },
  seizure: {
    id: "seizure",
    label: "Seizure & Epileptic",
    description: "Pauses nonessential motion and reduces transition flashes.",
    settings: {
      reduceMotion: true,
    },
  },
  adhd: {
    id: "adhd",
    label: "ADHD / Focus",
    description: "Reading mask spotlight and reduced animation distraction.",
    settings: {
      readerMode: "mask",
      reduceMotion: true,
    },
  },
};
