import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
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
  TextAlignController,
  ContrastController,
  ContrastModeController,
  SaturationController,
  InvertColorsController,
  GrayscaleController,
  LinkHighlightController,
  HighlightFocusController,
  ReduceMotionController,
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
  SmartContrastController,
  VoiceNavigationController,
  TranslationController,
  ResetController,
} from "accessibility-plugin-react";

function App() {
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "article">(
    "overview",
  );

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <AccessibilityPlugin position="right">
      <AccessibilityButton
        title="Accessibility"
        description="Adjust display settings"
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

      <header className="toolbar">
        <nav className="nav-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "article" ? "active" : ""}`}
            onClick={() => setActiveTab("article")}
          >
            Article (Route Test)
          </button>
        </nav>
        <button
          type="button"
          className="theme-btn"
          onClick={() => setDark((prev) => !prev)}
        >
          {dark ? "☀️ Light Theme" : "🌙 Dark Theme"}
        </button>
      </header>

      <main>
        {activeTab === "overview" ? (
          <div className="card">
            <h1>React Accessibility Plugin</h1>
            <p>
              Click the blue button in the bottom-right corner to open the
              accessibility panel. Try adjusting font size, contrast, spacing,
              and color filters to see them applied in real-time.
            </p>
            <p>
              This example demonstrates all prebuilt feature controllers
              working together with persistent settings, theme adaptation, and
              dynamic view transitions.
            </p>
            <h2>Testing Links & Form Controls</h2>
            <p>
              Here is a <a href="#test">sample hyperlink</a> to verify link
              highlighting and focus styling. Below is an input field to ensure
              form elements are never unintentionally altered by text scaling or
              color filters:
            </p>
            <div style={{ marginTop: "12px" }}>
              <input
                type="text"
                placeholder="Protected input field"
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--host-border)",
                  background: "var(--host-card)",
                  color: "var(--host-text)",
                }}
              />
            </div>
            <h2>Decorative Images</h2>
            <p>
              Decorative images below are eligible to be hidden when the Hide
              Images mode is activated:
            </p>
            <img
              src="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=300&q=80"
              alt=""
              style={{
                borderRadius: "8px",
                maxWidth: "100%",
                height: "auto",
                marginTop: "8px",
              }}
            />
          </div>
        ) : (
          <div className="card">
            <h1>Simulated Route: Long Article</h1>
            <p>
              This view simulates navigating to a reading-heavy page to test
              reading guides, line height adjustments, letter spacing, and
              paragraph spacing.
            </p>
            <p>
              Accessibility preferences remain fully active when navigating
              between tabs and views without requiring any re-initialization or
              page reloads.
            </p>
            <h2>Section 1: Typography Adaptability</h2>
            <p>
              Adjusting letter spacing and line height enhances reading
              comprehension for individuals with dyslexia or low vision. Notice
              how the container adjusts naturally without layout truncation or
              unintended scrollbars.
            </p>
          </div>
        )}
      </main>
    </AccessibilityPlugin>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
