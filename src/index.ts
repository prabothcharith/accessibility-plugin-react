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
  siLocale,
  taLocale,
  registerLocale,
  resolveLocaleStrings,
  isRtlLocale,
} from "./core/i18n";
export type { SupportedLocale, FeatureLocaleLabels } from "./core/i18n";

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
export { SmartContrastController } from "./features/SmartContrastController";
export {
  SaturationController,
  type SaturationControllerProps,
} from "./features/SaturationController";
export { InvertColorsController } from "./features/InvertColorsController";
export {
  GrayscaleController,
  type GrayscaleControllerProps,
} from "./features/GrayscaleController";
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
  scanLinks,
  navigateToElement,
  subscribePageStructure,
  type HeadingItem,
  type LandmarkItem,
  type LinkItem,
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
export {
  ReadingModeController,
  type ReadingModeControllerProps,
} from "./features/ReadingModeController";
export {
  KeyboardShortcutsController,
  type KeyboardShortcutsControllerProps,
} from "./features/KeyboardShortcutsController";
export {
  ReadAloudController,
  type ReadAloudControllerProps,
} from "./features/ReadAloudController";
export {
  DictionaryController,
  type DictionaryControllerProps,
} from "./features/DictionaryController";
export {
  type DictionaryEntry,
  type DictionaryLookupResult,
  type DictionaryProvider,
  sanitizeLookupTerm,
  lookupLocalDictionary,
  lookupWord,
  LOCAL_DICTIONARY_EN,
  LOCAL_DICTIONARY_SI,
  LOCAL_DICTIONARY_TA,
} from "./core/dictionary";
export {
  isSpeechSynthesisSupported,
  getSpeechVoices,
  subscribeSpeechVoices,
  getActiveSelectionText,
  extractReadAloudText,
  splitTextIntoChunks,
  ReadAloudSession,
  type ReadAloudOptions,
  type ReadAloudState,
  READ_ALOUD_EXCLUDED_SELECTORS,
} from "./core/readAloud";
export {
  extractArticleContent,
  findArticleCandidate,
  countWords,
  estimateReadingTime,
  type ArticleContent,
} from "./core/readingMode";
export {
  DEFAULT_SHORTCUTS,
  RESERVED_BROWSER_SHORTCUTS,
  normalizeKeyCombo,
  parseKeyboardEventToCombo,
  isFormFieldOrEditable,
  validateShortcutRemap,
  resolveActiveShortcut,
  type ShortcutDefinition,
  type ValidationResult,
} from "./core/shortcuts";

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

// Menu Customization & Reordering (A11Y-404)
export { FeatureMenu, type FeatureMenuProps } from "./features/FeatureMenu";
export {
  validateMenuConfig,
  getMenuConfigSignature,
  KNOWN_FEATURE_IDS,
  DEFAULT_MENU_GROUPS,
  DEFAULT_FEATURE_GROUP_MAP,
  type FeatureMenuItemConfig,
  type FeatureMenuGroupConfig,
  type MenuCustomizationConfig,
  type MenuValidationIssue,
  type MenuValidationResult,
  type NormalizedMenuConfig,
  type NormalizedMenuItem,
  type NormalizedMenuGroup,
} from "./core/menuCustomization";

// Development-Only Integration Diagnostics & Test Harness (A11Y-405)
export {
  runDiagnostics,
  checkProviderDiagnostics,
  checkStorageDiagnostics,
  checkCspDiagnostics,
  checkHostCssDiagnostics,
  checkDomDiagnostics,
  checkBoundariesDiagnostics,
  DIAGNOSTICS_DISCLAIMER,
  type DiagnosticCategory,
  type DiagnosticIssue,
  type DiagnosticSeverity,
  type DiagnosticsConfig,
  type DiagnosticsReport,
  type DiagnosticsSummary,
} from "./core/diagnostics";
export {
  DiagnosticsHarness,
  type DiagnosticsHarnessProps,
} from "./core/DiagnosticsHarness";
export { useDiagnostics } from "./core/useDiagnostics";

// Optional Privacy-Safe Feature Event Callbacks (A11Y-406)
export {
  sanitizeFeatureEvent,
  emitFeatureEvent,
  type AccessibilityEventType,
  type EventTriggerSource,
  type BaseAccessibilityEvent,
  type FeatureChangeEvent,
  type FeatureResetEvent,
  type PanelToggleEvent,
  type PlacementChangeEvent,
  type ProfileApplyEvent,
  type PresetApplyEvent,
  type AccessibilityFeatureEvent,
  type FeatureEventListener,
} from "./core/events";

// Smart Contrast Research Prototype (A11Y-407)
export {
  SMART_CONTRAST_DISCLAIMER,
  TARGET_RATIOS,
  HIGH_CONTRAST_TOKENS,
  parseColor,
  calculateRelativeLuminance,
  calculateContrastRatio,
  compositeRgba,
  isLargeText,
  resolveEffectiveBackdrop,
  isEligibleForSmartContrast,
  evaluateSmartContrast,
  applySmartContrast,
  type SmartContrastLevel,
  type UnsupportedReason,
  type RgbColor,
  type RgbaColor,
  type UnsupportedElementInfo,
  type SmartContrastReport,
  type SmartContrastOptions,
  type AppliedSmartContrast,
  type BackdropResolution,
} from "./core/smartContrast";


