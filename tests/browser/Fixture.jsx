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
    [position, setPosition] = useState("right");
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
      </main>
      {mounted && (
        <A.AccessibilityPlugin position={position}>
          <A.AccessibilityButton description="Adjust your display preferences" />
          <A.AccessibilityList>
            <A.FontSizeController />
            <A.LineHeightController />
            <A.LetterSpacingController />
            <A.WordSpacingController />
            <A.ParagraphSpacingController />
            <A.ContrastController />
            <A.ContrastModeController />
            <A.SaturationController />
            <A.InvertColorsController />
            <A.GrayscaleController />
            <A.LinkHighlightController />
            <A.TextAlignController />
            <A.FontFamilyController />
            <A.HideImagesController />
            <A.HideVideosController />
            <A.BigCursorController />
            <A.ReadingMaskController />
            <A.ReadingGuideController />
            <Custom />
            <A.ResetController />
          </A.AccessibilityList>
        </A.AccessibilityPlugin>
      )}
    </>
  );
}
