"use client";

import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FeatureGroup,
  FontSizeController,
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ParagraphSpacingController,
  FontFamilyController,
  ContrastModeController,
  SmartContrastController,
  SaturationController,
  InvertColorsController,
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
        <FeatureGroup
          id="next-grp-setup"
          title="Quick Setup"
          description="Profiles and saved configurations"
        >
          <ProfilesController />
          <PresetsController />
        </FeatureGroup>

        <FeatureGroup
          id="next-grp-typography"
          title="Text & Typography"
          description="Font sizing, typeface, and spacing"
        >
          <FontSizeController />
          <FontFamilyController />
          <LineHeightController />
          <LetterSpacingController />
          <WordSpacingController />
          <ParagraphSpacingController />
          <TextAlignController />
        </FeatureGroup>

        <FeatureGroup
          id="next-grp-color"
          title="Color & Contrast"
          description="Contrast themes, saturation, and focus emphasis"
        >
          <ContrastModeController />
          <SaturationController />
          <InvertColorsController />
          <LinkHighlightController />
          <HighlightFocusController />
        </FeatureGroup>

        <FeatureGroup
          id="next-grp-reading"
          title="Reading Aids & Media"
          description="Focus guides, speech, motion, and media visibility"
        >
          <ReadingModeController />
          <ReadAloudController />
          <ReadingGuideController />
          <ReadingMaskController />
          <BigCursorController />
          <TooltipsController />
          <ReduceMotionController />
          <HideImagesController />
          <HideVideosController />
        </FeatureGroup>

        <FeatureGroup
          id="next-grp-tools"
          title="Navigation & Tools"
          description="Outline explorer, dictionary lookup, and keyboard shortcuts"
        >
          <PageNavigatorController />
          <DictionaryController />
          <KeyboardShortcutsController />
        </FeatureGroup>

        <FeatureGroup
          id="next-grp-experimental"
          title="Experimental Prototypes"
          description="Opt-in adaptive contrast, voice commands, and translation"
          badge="Beta"
          collapsible
          defaultExpanded={false}
        >
          <SmartContrastController />
          <VoiceNavigationController />
          <TranslationController />
        </FeatureGroup>

        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
