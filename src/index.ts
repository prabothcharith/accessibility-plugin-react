"use client";

import "./styles/tailwind.css";

// Core
export { AccessibilityPlugin } from "./core/AccessibilityPlugin";
export { AccessibilityButton } from "./core/AccessibilityButton";
export { AccessibilityList } from "./core/AccessibilityList";
export { useAccessibility } from "./core/useAccessibility";
export { AccessibilityContext } from "./core/AccessibilityContext";

// Types
export type {
  AccessibilityPluginProps,
  AccessibilityButtonProps,
  AccessibilityListProps,
  AccessibilityState,
  AccessibilityContextValue,
  PluginPosition,
  WidgetPlacement,
  FeatureOptions,
  FeatureRegistration,
  AccessibilityPreferences,
  ContrastMode,
  CursorSizePreference,
  FontFamilyPreference,
  ProfileDefinition,
  ProfilePresetId,
  ReaderMode,
  SaturationPreference,
  StorageMode,
  TextAlignPreference,
} from "./core/types";

// Preferences & Profiles
export {
  DEFAULT_PREFERENCES,
  PROFILE_DEFINITIONS,
  normalizePreferences,
  normalizePreferenceValue,
  resolveEffectivePreferences,
  preferencesReducer,
  createInitialPreferencesState,
} from "./core/preferences";

// Prebuilt Features
export { FontSizeController } from "./features/FontSizeController";
export { LineHeightController } from "./features/LineHeightController";
export { LetterSpacingController } from "./features/LetterSpacingController";
export { ContrastController } from "./features/ContrastController";
export { SaturationController } from "./features/SaturationController";
export { InvertColorsController } from "./features/InvertColorsController";
export { GrayscaleController } from "./features/GrayscaleController";
export { LinkHighlightController } from "./features/LinkHighlightController";
export { TextAlignController } from "./features/TextAlignController";
export { HideImagesController } from "./features/HideImagesController";
export { HideVideosController } from "./features/HideVideosController";
export { BigCursorController } from "./features/BigCursorController";
export { ReadingMaskController } from "./features/ReadingMaskController";
export { ReadingGuideController } from "./features/ReadingGuideController";
export { ResetController } from "./features/ResetController";
