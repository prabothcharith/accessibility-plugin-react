"use client";

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
  FeatureOptions,
  FeatureRegistration,
} from "./core/types";

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
