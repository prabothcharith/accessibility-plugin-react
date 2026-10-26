"use client";

import "./styles/tailwind.css";

// Core
export { AccessibilityPlugin } from "./core/AccessibilityPlugin";
export { AccessibilityButton } from "./core/AccessibilityButton";
export { AccessibilityList } from "./core/AccessibilityList";
export { SkipToMainLink, findMainLandmark } from "./core/SkipToMainLink";
export type { SkipToMainLinkProps } from "./core/SkipToMainLink";
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
  TEXT_SPACING_EXCLUDED_SELECTOR,
  isProtectedFromTextSpacing,
  getScriptSpacingConstraints,
  type ScriptSpacingConstraints,
  TEXT_ALIGN_BLOCK_SELECTOR,
  isProtectedFromTextAlign,
  LEGIBLE_FONT_STACK,
  DYSLEXIA_FONT_STACK,
  FONT_FAMILY_PROTECTED_SELECTOR,
  isProtectedFromFontFamily,
  isForcedColorsActive,
  CONTRAST_PROTECTED_SELECTOR,
  isProtectedFromContrast,
  CONTRAST_PALETTES,
  type ContrastPalette,
} from "./core/effects";
export {
  FONT_FAMILY_PRESETS,
  type FontFamilyPreset,
  CONTRAST_MODES,
  type ContrastModeValue,
  LINE_HEIGHT_STEPS,
  LINE_HEIGHT_RATIOS,
} from "./core/featureSchema";
export {
  LineHeightController,
  type LineHeightControllerProps,
} from "./features/LineHeightController";
export {
  LetterSpacingController,
  type LetterSpacingControllerProps,
} from "./features/LetterSpacingController";
export {
  WordSpacingController,
  type WordSpacingControllerProps,
} from "./features/WordSpacingController";
export {
  ParagraphSpacingController,
  type ParagraphSpacingControllerProps,
} from "./features/ParagraphSpacingController";
export { ContrastController } from "./features/ContrastController";
export { ContrastModeController } from "./features/ContrastModeController";
export { SaturationController } from "./features/SaturationController";
export { InvertColorsController } from "./features/InvertColorsController";
export { GrayscaleController } from "./features/GrayscaleController";
export { LinkHighlightController } from "./features/LinkHighlightController";
export { TextAlignController } from "./features/TextAlignController";
export { FontFamilyController } from "./features/FontFamilyController";
export { HideImagesController } from "./features/HideImagesController";
export { HideVideosController } from "./features/HideVideosController";
export { BigCursorController } from "./features/BigCursorController";
export { ReadingMaskController } from "./features/ReadingMaskController";
export { ReadingGuideController } from "./features/ReadingGuideController";
export {
  HighlightFocusController,
  FocusHighlightController,
} from "./features/HighlightFocusController";
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
