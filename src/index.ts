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
  LocaleStrings,
} from "./core/types";

// Internationalization (i18n)
export {
  enLocale,
  registerLocale,
  resolveLocaleStrings,
  isRtlLocale,
} from "./core/i18n";
export type { SupportedLocale } from "./core/i18n";

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
export {
  FontSizeController,
  type FontSizeControllerProps,
} from "./features/FontSizeController";
export {
  TextScaleController,
  type TextScaleControllerProps,
} from "./features/TextScaleController";
export { TEXT_SCALE_STEPS, type TextScaleStep } from "./core/featureSchema";
export {
  TEXT_SCALE_PROTECTED_SELECTOR,
  isProtectedFromTextScale,
} from "./core/effects";
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

// Control Primitives & State UI
export {
  ToggleControl,
  ChoiceControl,
  StepperControl,
  FeatureCard,
  SearchCount,
  EmptyState,
  ErrorState,
  ProfilePreviewCard,
} from "./core/controls";
export type {
  ToggleControlProps,
  ChoiceControlProps,
  ChoiceOption,
  ChoiceGroup,
  StepperControlProps,
  FeatureCardProps,
  FeatureStatus,
  SearchCountProps,
  EmptyStateProps,
  ErrorStateProps,
  ProfilePreviewCardProps,
} from "./core/controls";
