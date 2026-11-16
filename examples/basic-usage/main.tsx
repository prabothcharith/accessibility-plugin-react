import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
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
  TextAlignController,
  ContrastModeController,
  SaturationController,
  InvertColorsController,
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

const DECORATIVE_BANNER_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="90" viewBox="0 0 320 90"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#ede9fe"/></linearGradient></defs><rect width="320" height="90" rx="12" fill="url(#g)"/><circle cx="48" cy="45" r="22" fill="#93c5fd" opacity="0.7"/><circle cx="110" cy="45" r="14" fill="#c4b5fd" opacity="0.8"/><text x="148" y="50" font-family="sans-serif" font-size="14" fill="#1e3a8a">Decorative divider pattern</text></svg>',
  );

const INFORMATIVE_DIAGRAM_SVG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="90" viewBox="0 0 320 90"><rect width="320" height="90" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/><rect x="20" y="23" width="96" height="44" rx="8" fill="#1d4ed8"/><text x="68" y="50" text-anchor="middle" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">44px Min</text><text x="140" y="42" font-family="sans-serif" font-size="13" font-weight="bold" fill="#0f172a">Target Contrast 7.2:1</text><text x="140" y="60" font-family="sans-serif" font-size="12" fill="#475569">Informative graphic (preserved)</text></svg>',
  );

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
        <FeatureGroup
          id="grp-setup"
          title="Quick Setup"
          description="Profiles and saved configurations"
        >
          <ProfilesController />
          <PresetsController />
        </FeatureGroup>

        <FeatureGroup
          id="grp-typography"
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
          id="grp-color"
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
          id="grp-reading"
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
          id="grp-tools"
          title="Navigation & Tools"
          description="Outline explorer, dictionary lookup, and keyboard shortcuts"
        >
          <PageNavigatorController />
          <DictionaryController />
          <KeyboardShortcutsController />
        </FeatureGroup>

        <FeatureGroup
          id="grp-experimental"
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
              This example demonstrates all prebuilt feature controllers working
              together with persistent settings, theme adaptation, and dynamic
              view transitions.
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
                id="host-protected-input"
                name="host-protected-input"
                type="text"
                aria-label="Protected input field"
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
            <h2>Decorative &amp; Informative Media</h2>
            <p>
              Hide Images conceals purely decorative visuals below while keeping
              informative diagrams visible. Hide Videos hides video players
              while preserving layout space.
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginTop: "10px",
              }}
            >
              <img
                src={DECORATIVE_BANNER_SVG}
                alt=""
                width={320}
                height={90}
                data-decorative="true"
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
              <img
                src={INFORMATIVE_DIAGRAM_SVG}
                alt="Diagram showing 44px minimum target size and 7.2:1 contrast"
                width={320}
                height={90}
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  height: "auto",
                }}
              />
            </div>
            <div style={{ marginTop: "14px" }}>
              <video
                controls
                width={320}
                height={180}
                poster={DECORATIVE_BANNER_SVG}
                aria-label="Sample product accessibility walkthrough video"
                style={{
                  borderRadius: "8px",
                  maxWidth: "100%",
                  background: "#0f172a",
                }}
              >
                <track kind="captions" label="English captions" default />
              </video>
            </div>
          </div>
        ) : (
          <article className="card">
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
            <h2>Section 2: Semantic Landmarks &amp; Reading Mode</h2>
            <p>
              Semantic landmarks and structured headings allow Page Navigator
              and Reading Mode to isolate primary prose cleanly even when
              toggling between dark mode, custom typography, and live routes.
            </p>
          </article>
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
