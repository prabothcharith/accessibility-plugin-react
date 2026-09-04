import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { AccessibilityButton } from "../src/core/AccessibilityButton";
import { AccessibilityList } from "../src/core/AccessibilityList";
import { FontSizeController } from "../src/features/FontSizeController";
import { ContrastController } from "../src/features/ContrastController";
import { InvertColorsController } from "../src/features/InvertColorsController";
import { GrayscaleController } from "../src/features/GrayscaleController";
import { TextAlignController } from "../src/features/TextAlignController";
import { ResetController } from "../src/features/ResetController";
import { useAccessibility } from "../src/core/useAccessibility";

function renderWithFeatures(...features: React.ReactElement[]) {
  return render(
    <AccessibilityPlugin>
      <AccessibilityButton icon={<span>Icon</span>} />
      <AccessibilityList>
        {features}
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}

function openPanel() {
  fireEvent.click(screen.getByLabelText("Accessibility"));
}

describe("FontSizeController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = "";
  });

  it("renders with default value", () => {
    renderWithFeatures(<FontSizeController />);
    openPanel();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("increases font size", () => {
    renderWithFeatures(<FontSizeController />);
    openPanel();
    fireEvent.click(screen.getByLabelText("Increase font size"));
    expect(screen.getByText("110%")).toBeInTheDocument();
    expect(document.documentElement.style.fontSize).toBe("110%");
  });

  it("decreases font size", () => {
    renderWithFeatures(<FontSizeController />);
    openPanel();
    fireEvent.click(screen.getByLabelText("Increase font size"));
    fireEvent.click(screen.getByLabelText("Increase font size"));
    fireEvent.click(screen.getByLabelText("Decrease font size"));
    expect(screen.getByText("110%")).toBeInTheDocument();
  });

  it("disables decrease at minimum", () => {
    renderWithFeatures(<FontSizeController />);
    openPanel();
    // Default is 100%, decrease should be enabled
    expect(screen.getByLabelText("Decrease font size")).not.toBeDisabled();
    // Decrease to minimum (50%)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByLabelText("Decrease font size"));
    }
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByLabelText("Decrease font size")).toBeDisabled();
  });
});

describe("ContrastController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.filter = "";
  });

  it("renders with default off state", () => {
    renderWithFeatures(<ContrastController />);
    openPanel();
    expect(screen.getByText("Off")).toBeInTheDocument();
  });

  it("applies contrast filter", () => {
    renderWithFeatures(<ContrastController />);
    openPanel();
    fireEvent.click(screen.getByText("High"));
    expect(document.documentElement.style.filter).toBe("contrast(1.5)");
  });

  it("clears filter when set to off", () => {
    renderWithFeatures(<ContrastController />);
    openPanel();
    fireEvent.click(screen.getByText("High"));
    fireEvent.click(screen.getByText("Off"));
    expect(document.documentElement.style.filter).toBe("");
  });
});

describe("InvertColorsController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.filter = "";
  });

  it("toggles invert filter", () => {
    renderWithFeatures(<InvertColorsController />);
    openPanel();
    const toggle = screen.getByRole("button", { pressed: false });
    fireEvent.click(toggle);
    expect(document.documentElement.style.filter).toBe("invert(1)");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});

describe("GrayscaleController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.filter = "";
  });

  it("toggles grayscale filter", () => {
    renderWithFeatures(<GrayscaleController />);
    openPanel();
    const toggle = screen.getByRole("button", { pressed: false });
    fireEvent.click(toggle);
    expect(document.documentElement.style.filter).toBe("grayscale(1)");
  });
});

describe("TextAlignController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.textAlign = "";
  });

  it("changes text alignment", () => {
    renderWithFeatures(<TextAlignController />);
    openPanel();
    fireEvent.click(screen.getByText("center"));
    expect(document.documentElement.style.textAlign).toBe("center");
  });
});

describe("ResetController", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.fontSize = "";
    document.documentElement.style.filter = "";
  });

  it("resets all features", () => {
    function App() {
      return (
        <AccessibilityPlugin>
          <AccessibilityButton icon={<span>Icon</span>} />
          <AccessibilityList>
            <FontSizeController />
            <ContrastController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>
      );
    }

    render(<App />);
    openPanel();

    // Change some values
    fireEvent.click(screen.getByLabelText("Increase font size"));
    fireEvent.click(screen.getByText("High"));

    expect(screen.getByText("110%")).toBeInTheDocument();

    // Reset
    fireEvent.click(screen.getByText("Reset All"));
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(document.documentElement.style.filter).toBe("");
  });
});

describe("Custom feature support", () => {
  function CustomFeature() {
    const { value, setValue } = useAccessibility("customFeature", false);
    return (
      <button onClick={() => setValue(!value)} aria-pressed={value}>
        Custom: {String(value)}
      </button>
    );
  }

  it("works as a child of AccessibilityList", () => {
    renderWithFeatures(<CustomFeature />);
    openPanel();

    const customBtn = screen.getByText("Custom: false");
    expect(customBtn).toBeInTheDocument();

    fireEvent.click(customBtn);
    expect(screen.getByText("Custom: true")).toBeInTheDocument();
  });
});
