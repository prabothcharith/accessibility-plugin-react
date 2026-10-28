"use client";

import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  FontSizeController,
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ParagraphSpacingController,
  FontFamilyController,
  ContrastModeController,
  ContrastController,
  SmartContrastController,
  SaturationController,
  InvertColorsController,
  GrayscaleController,
  LinkHighlightController,
  HighlightFocusController,
  ReduceMotionController,
  TextAlignController,
  HideImagesController,
  HideVideosController,
  BigCursorController,
  ReadingMaskController,
  ReadingGuideController,
  TooltipsController,
  PageNavigatorController,
  ProfilesController,
  PresetsController,
  ReadingModeController,
  KeyboardShortcutsController,
  ReadAloudController,
  DictionaryController,
  VoiceNavigationController,
  TranslationController,
  ResetController,
} from "accessibility-plugin-react";

export function AccessibilitySettings() {
  return (
    <AccessibilityPlugin position="right" persistenceKey="example-next:a11y">
      <AccessibilityButton
        title="Accessibility"
        description="Adjust your display and reading preferences"
      />
      <AccessibilityList title="Accessibility preferences">
        <ProfilesController />
        <PresetsController />
        <TextScaleController />
        <FontSizeController />
        <LineHeightController />
        <LetterSpacingController />
        <WordSpacingController />
        <ParagraphSpacingController />
        <FontFamilyController />
        <TextAlignController />
        <ContrastModeController />
        <ContrastController />
        <SmartContrastController />
        <SaturationController />
        <InvertColorsController />
        <GrayscaleController />
        <LinkHighlightController />
        <HighlightFocusController />
        <ReduceMotionController />
        <TooltipsController />
        <ReadingMaskController />
        <ReadingGuideController />
        <BigCursorController />
        <HideImagesController />
        <HideVideosController />
        <PageNavigatorController />
        <ReadingModeController />
        <KeyboardShortcutsController />
        <ReadAloudController />
        <DictionaryController />
        <VoiceNavigationController />
        <TranslationController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
