"use client";

import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  LineHeightController,
  LetterSpacingController,
  ContrastController,
  SaturationController,
  InvertColorsController,
  GrayscaleController,
  LinkHighlightController,
  TextAlignController,
  HideImagesController,
  HideVideosController,
  BigCursorController,
  ReadingMaskController,
  ReadingGuideController,
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
        <FontSizeController />
        <LineHeightController />
        <LetterSpacingController />
        <ContrastController />
        <SaturationController />
        <InvertColorsController />
        <GrayscaleController />
        <LinkHighlightController />
        <TextAlignController />
        <HideImagesController />
        <HideVideosController />
        <BigCursorController />
        <ReadingMaskController />
        <ReadingGuideController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
