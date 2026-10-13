import React from "react";
import ReactDOM from "react-dom/client";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
  useAccessibility,
} from "accessibility-plugin-react";
import "accessibility-plugin-react/style.css";

function OutlineFeature() {
  const { value, setValue } = useAccessibility("example:outline", false, {
    apply(enabled) {
      if (!enabled) return;
      const target = document.getElementById("example-content")!;
      const previous = target.style.outline;
      target.style.outline = "3px solid blue";
      return () => {
        target.style.outline = previous;
      };
    },
  });
  return (
    <div className="arap-feature">
      <button
        className="arap-segment"
        type="button"
        aria-pressed={value}
        onClick={() => setValue(!value)}
      >
        Outline content
      </button>
    </div>
  );
}
function App() {
  return (
    <>
      <main id="example-content">
        <h1>Custom feature example</h1>
        <p>
          Enable the outline, close the panel, reload, then reset. The effect
          follows the saved state.
        </p>
      </main>
      <AccessibilityPlugin persistenceKey="arap:custom-example">
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
          <OutlineFeature />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>
    </>
  );
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
