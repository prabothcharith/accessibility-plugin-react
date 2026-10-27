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
  ALL_PROFILE_IDS,
  normalizePreferences,
  normalizePreferenceValue,
  resolveEffectivePreferences,
  preferencesReducer,
  createInitialPreferencesState,
} from "./core/preferences";
export {
  getProfileDefinition,
  mapProfileSettingsToFeatures,
  mapFeaturesToProfileSettings,
  applyProfileToStore,
  revertProfileFromStore,
  recordProfileOverride,
  type ActiveProfileState,
} from "./core/profiles";
export { useProfiles, type UseProfilesResult } from "./core/useProfiles";

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
  subscribeForcedColors,
  isReducedMotionActive,
  subscribeReducedMotion,
  isEligibleDecorativeImage,
  isFunctionalOrMeaningfulImage,
  hasFinePointer,
  subscribeFinePointer,
  nudgeReadingAid,
  getAuthoredDescription,
  positionTooltip,
  enableAccessibleTooltips,
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
  DEFAULT_READING_MASK_HEIGHT,
  MIN_READING_MASK_HEIGHT,
  MAX_READING_MASK_HEIGHT,
  READING_MASK_HEIGHT_PRESETS,
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
export {
  HideImagesController,
  HideDecorativeImagesController,
  type HideImagesControllerProps,
} from "./features/HideImagesController";
export { HideVideosController } from "./features/HideVideosController";
export {
  BigCursorController,
  type BigCursorControllerProps,
} from "./features/BigCursorController";
export {
  ReadingMaskController,
  type ReadingMaskControllerProps,
} from "./features/ReadingMaskController";
export {
  ReadingGuideController,
  type ReadingGuideControllerProps,
} from "./features/ReadingGuideController";
export {
  HighlightFocusController,
  FocusHighlightController,
} from "./features/HighlightFocusController";
export { ReduceMotionController } from "./features/ReduceMotionController";
export {
  TooltipsController,
  AccessibleTooltipsController,
  type TooltipsControllerProps,
} from "./features/TooltipsController";
export {
  PageNavigatorController,
  HeadingsNavigatorController,
  PageStructureController,
  type PageNavigatorControllerProps,
} from "./features/PageNavigatorController";
export {
  scanHeadings,
  scanLandmarks,
  navigateToElement,
  subscribePageStructure,
  type HeadingItem,
  type LandmarkItem,
} from "./core/pageNavigator";
export {
  ProfilesController,
  ProfileController,
  AccessibilityProfilesController,
  type ProfilesControllerProps,
} from "./features/ProfilesController";
export { ResetController } from "./features/ResetController";
export {
  PresetsController,
  CustomPresetsController,
  SettingsImportExportController,
  PresetsBackupController,
  type PresetsControllerProps,
} from "./features/PresetsController";

// Custom Presets, Backup & JSON Import/Export
export { usePresets, type UsePresetsResult } from "./core/usePresets";
export {
  createCustomPreset,
  isValidCustomPreset,
  exportPresetsToJson,
  downloadJsonFile,
  validateAndParseImport,
  applyCustomPresetToStore,
  sanitizePreferences,
  ALLOWED_PREFERENCE_KEYS,
  type CustomPreset,
  type PresetsExportV1,
  type ImportResult,
} from "./core/presets";

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
