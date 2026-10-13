import React from "react";
import ReactDOM from "react-dom/client";
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
} from "react-accessibility-plugin";
import "react-accessibility-plugin/style.css";

function App() {
  return (
    <AccessibilityPlugin position="right">
      <AccessibilityButton
        title="Accessibility"
        description="Adjust display settings"
      />
      <AccessibilityList title="Accessibility">
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

      <h1>React Accessibility Plugin</h1>
      <p>
        Click the blue button in the bottom-right corner to open the
        accessibility panel. Try adjusting font size, contrast, and other
        settings to see them applied in real-time.
      </p>
      <p>
        This example demonstrates all 15 prebuilt feature controllers working
        together in a single panel.
      </p>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
      </p>
    </AccessibilityPlugin>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
