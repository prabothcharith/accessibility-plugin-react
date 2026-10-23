import React, { useState, useEffect } from "react";
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
              This example demonstrates all 15 prebuilt feature controllers
              working together with persistent settings, theme adaptation, and
              dynamic view transitions.
            </p>
            <p>
              Learn more in the{" "}
              <a href="../custom-feature/">custom feature example</a> or view
              the{" "}
              <a href="https://github.com/prabothcharith/accessibility-react">
                GitHub repository
              </a>
              .
            </p>
          </div>
        ) : (
          <div className="card">
            <h1>Article & Route Transition</h1>
            <p>
              This tab simulates a dynamic client-side route or page view
              transition.
            </p>
            <p>
              Notice how any active preferences (such as enlarged text or
              increased line height) are immediately applied to this new content
              as it enters the DOM.
            </p>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
              Nulla quis sem at nibh elementum imperdiet.
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
