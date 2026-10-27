"use client";
import React, { useState } from "react";
import * as A from "accessibility-plugin-react";
function Custom() {
  const { value, setValue } = A.useAccessibility("hostOutline", false, {
    apply: (value) => {
      if (!value) return;
      const el = document.querySelector("#host");
      const before = el.style.outline;
      el.style.outline = "3px solid blue";
      return () => {
        el.style.outline = before;
      };
    },
  });
  return (
    <button
      className="arap-btn-sm"
      type="button"
      aria-pressed={value}
      onClick={() => setValue(!value)}
    >
      Outline
    </button>
  );
}
export default function Fixture() {
  const [clicks, setClicks] = useState(0),
    [route, setRoute] = useState(false),
    [dark, setDark] = useState(false),
    [mounted, setMounted] = useState(true),
    [position, setPosition] = useState("right"),
    [locale, setLocale] = useState("en"),
    [customMenu, setCustomMenu] = useState(false),
    [showDiagnostics, setShowDiagnostics] = useState(false),
    [lastEvent, setLastEvent] = useState(null);
  return (
    <>
      <main id="host" className={dark ? "dark" : ""}>
        <h1>Accessibility preferences</h1>
        <p id="sample">
          A paragraph with a <a href="#destination">useful link</a>.
        </p>
        <button id="host-action" onClick={() => setClicks(clicks + 1)}>
          Host action {clicks}
        </button>
        <button onClick={() => setRoute(!route)}>Navigate</button>
        <button onClick={() => setDark(!dark)}>Theme</button>
        <button onClick={() => setMounted(!mounted)}>Mount widget</button>
        <button
          id="toggle-custom-menu"
          onClick={() => setCustomMenu(!customMenu)}
        >
          Toggle custom menu
        </button>
        <button
          id="toggle-diagnostics"
          onClick={() => setShowDiagnostics(!showDiagnostics)}
        >
          Toggle diagnostics
        </button>
        <label>
          Widget position{" "}
          <select
            value={position}
            onChange={(event) => setPosition(event.target.value)}
          >
            {["right", "left", "top", "bottom"].map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        {route && (
          <p id="route" style={{ fontSize: "30px" }}>
            New route content
          </p>
        )}
        <img
          id="sample-decorative-img"
          alt=""
          role="presentation"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='40'%3E%3Crect width='80' height='40' fill='gray'/%3E%3C/svg%3E"
        />
        <img
          alt="Example landscape"
          src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='60'%3E%3Crect width='100' height='60' fill='green'/%3E%3C/svg%3E"
        />
        <video title="Sample video" />
        <table id="sample-table">
          <tbody>
            <tr>
              <td id="sample-td">Table Data</td>
            </tr>
          </tbody>
        </table>
        <div id="destination">Destination</div>
        <pre id="sample-pre">
          <code id="sample-code">const accessible = true;</code>
        </pre>
        <article id="fixture-article">
          <p id="fixture-article-p1">
            Accessible web development ensures that digital applications and
            services are inclusive, functional, and perceivable for everyone,
            including people using screen readers, keyboard navigation, and
            custom browser settings.
          </p>
          <p id="fixture-article-p2">
            By designing with native HTML semantic elements, developers
            eliminate artificial barriers and provide resilient multi-device
            user experiences.
          </p>
        </article>
      </main>
      <div id="fixture-locale-wrapper">
        <label>
          Locale{" "}
          <select
            id="fixture-locale-select"
            value={locale}
            onChange={(event) => setLocale(event.target.value)}
          >
            {["en", "si-LK", "ta-LK"].map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      {mounted && (
        <A.AccessibilityPlugin
          position={position}
          locale={locale}
          onFeatureEvent={(e) => setLastEvent(e)}
        >
          <A.AccessibilityButton description="Adjust your display preferences" />
          {customMenu ? (
            <A.AccessibilityList
              menuConfig={{
                grouped: true,
                groups: [
                  { id: "customTypography", title: "Custom Text Group" },
                  { id: "customVisuals", title: "Custom Visuals Group" },
                ],
                items: [
                  {
                    id: "fontSize",
                    group: "customTypography",
                    label: "Custom Font Sizer",
                    order: 10,
                  },
                  {
                    id: "grayscale",
                    group: "customVisuals",
                    label: "Custom Black & White",
                    order: 20,
                  },
                ],
              }}
            />
          ) : (
            <A.AccessibilityList>
              <A.FontSizeController />
              <A.LineHeightController />
              <A.LetterSpacingController />
              <A.WordSpacingController />
              <A.ParagraphSpacingController />
              <A.ContrastController />
              <A.ContrastModeController />
              <A.SmartContrastController />
              <A.SaturationController />
              <A.InvertColorsController />
              <A.GrayscaleController />
              <A.LinkHighlightController />
              <A.HighlightFocusController />
              <A.ReduceMotionController />
              <A.TextAlignController />
              <A.FontFamilyController />
              <A.HideImagesController />
              <A.HideVideosController />
              <A.BigCursorController />
              <A.ReadingMaskController />
              <A.ReadingGuideController />
              <A.TooltipsController />
              <A.PageNavigatorController />
              <A.ProfilesController />
              <A.PresetsController />
              <A.ReadingModeController />
              <A.KeyboardShortcutsController />
              <A.ReadAloudController />
              <A.DictionaryController />
              <A.VoiceNavigationController />
              <Custom />
              <A.ResetController />
            </A.AccessibilityList>
          )}
        </A.AccessibilityPlugin>
      )}
      {showDiagnostics && <A.DiagnosticsHarness force={true} />}
      {lastEvent && (
        <div id="fixture-last-event" data-event-type={lastEvent.type}>
          {lastEvent.type}
        </div>
      )}
    </>
  );
}
