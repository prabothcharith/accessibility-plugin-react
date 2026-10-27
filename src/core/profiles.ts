import {
  ALL_PROFILE_IDS,
  DEFAULT_PREFERENCES,
  PROFILE_DEFINITIONS,
} from "./preferences/defaults";
import type {
  AccessibilityPreferences,
  ActiveProfileState,
  ProfileDefinition,
  ProfilePresetId,
} from "./preferences/types";

export { ALL_PROFILE_IDS, PROFILE_DEFINITIONS };
export type {
  AccessibilityPreferences,
  ActiveProfileState,
  ProfileDefinition,
  ProfilePresetId,
};

/**
 * Retrieves a profile definition by its unique identifier.
 */
export function getProfileDefinition(
  id: ProfilePresetId,
): ProfileDefinition | undefined {
  return PROFILE_DEFINITIONS[id];
}

/**
 * Maps typed AccessibilityPreferences settings to internal widget feature store keys.
 */
export function mapProfileSettingsToFeatures(
  settings: Partial<AccessibilityPreferences>,
): Record<string, unknown> {
  const features: Record<string, unknown> = {};

  if (settings.fontScale !== undefined) {
    features.fontScale = settings.fontScale;
    features.textScale = settings.fontScale;
    features.fontSize = Math.round(settings.fontScale * 100);
  }

  if (settings.lineHeight !== undefined) {
    features.lineHeight =
      settings.lineHeight !== null
        ? Math.round(settings.lineHeight * 100)
        : 100;
  }

  if (settings.letterSpacingEm !== undefined) {
    features.letterSpacingEm = settings.letterSpacingEm;
  }

  if (settings.wordSpacingEm !== undefined) {
    features.wordSpacingEm = settings.wordSpacingEm;
  }

  if (settings.paragraphSpacingEm !== undefined) {
    features.paragraphSpacingEm = settings.paragraphSpacingEm;
  }

  if (settings.textAlign !== undefined) {
    features.textAlign =
      settings.textAlign === "original" ? "default" : settings.textAlign;
  }

  if (settings.contrastMode !== undefined) {
    features.contrastMode = settings.contrastMode;
    features.contrast = settings.contrastMode;
  }

  if (settings.highlightLinks !== undefined) {
    features.linkHighlight = settings.highlightLinks;
  }

  if (settings.highlightFocus !== undefined) {
    features.highlightFocus = settings.highlightFocus;
    features.focusHighlight = settings.highlightFocus;
  }

  if (settings.reduceMotion !== undefined) {
    features.reduceMotion = settings.reduceMotion;
  }

  if (settings.hideDecorativeImages !== undefined) {
    features.hideImages = settings.hideDecorativeImages;
  }

  if (settings.fontFamily !== undefined) {
    features.fontFamily =
      settings.fontFamily === "original" ? "default" : settings.fontFamily;
  }

  if (settings.cursorSize !== undefined) {
    features.bigCursor = settings.cursorSize === "large";
  }

  if (settings.readerMode !== undefined) {
    if (settings.readerMode === "guide") {
      features.readingGuide = true;
      features.readingMask = false;
    } else if (settings.readerMode === "mask") {
      features.readingMask = true;
      features.readingGuide = false;
    } else {
      features.readingGuide = false;
      features.readingMask = false;
    }
  }

  if (settings.saturation !== undefined) {
    features.saturation =
      settings.saturation === "low"
        ? 1
        : settings.saturation === "high"
          ? 2
          : settings.saturation === "grayscale"
            ? 3
            : 0;
  }

  if (settings.tooltips !== undefined) {
    features.tooltips = settings.tooltips;
    features.accessibleTooltips = settings.tooltips;
  }

  return features;
}

/**
 * Maps current live features from the store to typed AccessibilityPreferences.
 */
export function mapFeaturesToProfileSettings(
  features: Record<string, unknown>,
): Partial<AccessibilityPreferences> {
  const result: Partial<AccessibilityPreferences> = {
    ...DEFAULT_PREFERENCES,
  };

  if (typeof features.fontScale === "number") {
    result.fontScale = features.fontScale;
  } else if (typeof features.textScale === "number") {
    result.fontScale = features.textScale;
  } else if (typeof features.fontSize === "number") {
    result.fontScale = features.fontSize / 100;
  }

  if (features.lineHeight !== undefined) {
    result.lineHeight =
      typeof features.lineHeight === "number"
        ? features.lineHeight / 100
        : null;
  }

  if (typeof features.contrastMode === "string") {
    result.contrastMode =
      features.contrastMode === "original"
        ? "off"
        : (features.contrastMode as AccessibilityPreferences["contrastMode"]);
  }

  if (features.linkHighlight !== undefined) {
    result.highlightLinks = Boolean(features.linkHighlight);
  }

  if (
    features.highlightFocus !== undefined ||
    features.focusHighlight !== undefined
  ) {
    result.highlightFocus = Boolean(
      features.highlightFocus ?? features.focusHighlight,
    );
  }

  if (features.reduceMotion !== undefined) {
    result.reduceMotion = Boolean(features.reduceMotion);
  }

  if (features.hideImages !== undefined) {
    result.hideDecorativeImages = Boolean(features.hideImages);
  }

  if (typeof features.fontFamily === "string") {
    result.fontFamily =
      features.fontFamily === "default"
        ? "original"
        : (features.fontFamily as AccessibilityPreferences["fontFamily"]);
  }

  if (features.bigCursor !== undefined) {
    result.cursorSize = features.bigCursor ? "large" : "original";
  }

  if (features.readingMask) {
    result.readerMode = "mask";
  } else if (features.readingGuide) {
    result.readerMode = "guide";
  } else if (
    features.readingMask === false ||
    features.readingGuide === false
  ) {
    result.readerMode = "off";
  }

  if (
    features.tooltips !== undefined ||
    features.accessibleTooltips !== undefined
  ) {
    result.tooltips = Boolean(features.tooltips ?? features.accessibleTooltips);
  }

  if (features.saturation !== undefined || features.grayscale !== undefined) {
    if (
      features.grayscale ||
      features.saturation === 3 ||
      features.saturation === "grayscale"
    ) {
      result.saturation = "grayscale";
    } else if (features.saturation === 1 || features.saturation === "low") {
      result.saturation = "low";
    } else if (features.saturation === 2 || features.saturation === "high") {
      result.saturation = "high";
    } else {
      result.saturation = "original";
    }
  }

  return result;
}

/**
 * Atomically applies a profile to the live feature store.
 * Preserves initial base settings in baseSnapshot and initializes empty overrides.
 */
export function applyProfileToStore(
  profileId: ProfilePresetId,
  currentFeatures: Record<string, unknown>,
  setFeatureState: <T>(key: string, value: T) => void,
  existingActiveState?: ActiveProfileState | null,
): ActiveProfileState {
  const profile = PROFILE_DEFINITIONS[profileId];
  if (!profile) {
    throw new Error(`Unknown profile identifier: ${profileId}`);
  }

  const currentSettings = mapFeaturesToProfileSettings(currentFeatures);
  const targetSettings = profile.settings;

  // Snapshot the baseline settings before applying the profile
  const baseSnapshot: Partial<AccessibilityPreferences> = {
    ...(existingActiveState?.baseSnapshot ?? {}),
  };

  for (const k of Object.keys(targetSettings) as Array<
    keyof AccessibilityPreferences
  >) {
    if (!(k in baseSnapshot)) {
      baseSnapshot[k] = currentSettings[k] as never;
    }
  }

  const activeProfileState: ActiveProfileState = {
    profileId,
    baseSnapshot,
    overrides: {},
  };

  // Convert profile settings to features and apply each
  const targetFeatures = mapProfileSettingsToFeatures(targetSettings);
  for (const [key, val] of Object.entries(targetFeatures)) {
    try {
      setFeatureState(key, val);
    } catch {
      // Ignored if feature is not registered in current consumer
    }
  }

  // Update activeProfile in store
  try {
    setFeatureState("activeProfile", activeProfileState);
  } catch {
    // Stored feature
  }

  return activeProfileState;
}

/**
 * Reverts an active profile back to custom settings with deterministic override survival.
 * Settings that the user explicitly changed while the profile was active survive at their
 * overridden values; settings untouched by the user revert to their pre-profile base values.
 */
export function revertProfileFromStore(
  activeProfileState: ActiveProfileState,
  setFeatureState: <T>(key: string, value: T) => void,
): void {
  const { baseSnapshot, overrides } = activeProfileState;

  // Revert settings: if a key has an override, keep the override; otherwise revert to base
  const restoredSettings: Partial<AccessibilityPreferences> = {};
  for (const [k, baseVal] of Object.entries(baseSnapshot)) {
    const key = k as keyof AccessibilityPreferences;
    if (key in overrides) {
      restoredSettings[key] = overrides[key] as never;
    } else {
      restoredSettings[key] = baseVal as never;
    }
  }

  const restoredFeatures = mapProfileSettingsToFeatures(restoredSettings);
  for (const [key, val] of Object.entries(restoredFeatures)) {
    try {
      setFeatureState(key, val);
    } catch {
      // Ignored if feature not registered
    }
  }

  try {
    setFeatureState("activeProfile", null);
  } catch {
    // Stored feature
  }
}

/**
 * Records an explicit user override when a setting is modified while a profile is active.
 */
export function recordProfileOverride(
  key: keyof AccessibilityPreferences,
  value: AccessibilityPreferences[keyof AccessibilityPreferences],
  activeProfileState: ActiveProfileState | null,
  setFeatureState: <T>(key: string, value: T) => void,
): ActiveProfileState | null {
  if (!activeProfileState) return null;

  const nextOverrides = {
    ...activeProfileState.overrides,
    [key]: value,
  };

  const nextState: ActiveProfileState = {
    ...activeProfileState,
    overrides: nextOverrides,
  };

  try {
    setFeatureState("activeProfile", nextState);
  } catch {
    // Stored feature
  }

  return nextState;
}
