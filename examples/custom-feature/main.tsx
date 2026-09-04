import React from "react";
import ReactDOM from "react-dom/client";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
  useAccessibility,
} from "../../src/index";
import "../../src/styles/tailwind.css";

function DyslexiaFontFeature() {
  const { value, setValue } = useAccessibility("dyslexiaFont", false);

  const toggle = () => {
    const next = !value;
    setValue(next);
    document.body.classList.toggle("dyslexia-font", next);
  };

  return (
    <div className="arap-feature">
      <label className="arap-label">Dyslexia-Friendly Font</label>
      <button
        className={`arap-toggle ${value ? "arap-toggle-active" : ""}`}
        onClick={toggle}
        aria-pressed={value}
        type="button"
      >
        <span className="arap-toggle-knob" />
      </button>
    </div>
  );
}

function ColorTintFeature() {
  const { value, setValue } = useAccessibility<number>("colorTint", 0);

  const applyTint = (level: number) => {
    setValue(level);
    if (level > 0) {
      document.documentElement.style.filter = `sepia(${level * 10}%)`;
    } else {
      document.documentElement.style.filter = "";
    }
  };

  return (
    <div className="arap-feature">
      <label className="arap-label">Color Tint</label>
      <div className="arap-segmented">
        {[0, 1, 2, 3].map((level) => (
          <button
            key={level}
            className={`arap-segment ${value === level ? "arap-segment-active" : ""}`}
            onClick={() => applyTint(level)}
            aria-pressed={value === level}
            type="button"
          >
            {level === 0 ? "Off" : `${level * 10}%`}
          </button>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <AccessibilityPlugin position="right">
      <AccessibilityButton
        icon={<span role="img" aria-label="Accessibility">⚙️</span>}
        title="Accessibility"
        description="Adjust display settings"
      />
      <AccessibilityList>
        <FontSizeController />
        <DyslexiaFontFeature />
        <ColorTintFeature />
        <ResetController />
      </AccessibilityList>

      <h1>Custom Feature Example</h1>
      <p>
        This example demonstrates how to build custom accessibility features
        using the <code>useAccessibility</code> hook. Two custom features are
        shown: a dyslexia-friendly font toggle and a color tint controller.
      </p>
      <p>
        Custom features work identically to prebuilt ones — they participate
        in the same save/restore/reset lifecycle through the shared context.
      </p>
      <p>
        Try enabling the Dyslexia-Friendly Font and the Color Tint, then
        click "Reset All" to see both custom features reset along with the
        built-in Font Size controller.
      </p>
    </AccessibilityPlugin>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
