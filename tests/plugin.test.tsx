import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { AccessibilityButton } from "../src/core/AccessibilityButton";
import { AccessibilityList } from "../src/core/AccessibilityList";
import { useAccessibility } from "../src/core/useAccessibility";

function TestChild() {
  const { value, setValue } = useAccessibility("testFeature", false);
  return (
    <div>
      <span data-testid="value">{String(value)}</span>
      <button onClick={() => setValue(!value)}>Toggle</button>
    </div>
  );
}

function renderPlugin(ui: React.ReactElement) {
  return render(
    <AccessibilityPlugin>
      {ui}
    </AccessibilityPlugin>
  );
}

describe("AccessibilityPlugin", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders children", () => {
    renderPlugin(
      <AccessibilityButton icon={<span>Icon</span>} />
    );
    expect(screen.getByLabelText("Accessibility")).toBeInTheDocument();
  });

  it("toggles panel open/close", () => {
    renderPlugin(
      <>
        <AccessibilityButton icon={<span>Icon</span>} />
        <AccessibilityList>
          <div>Panel content</div>
        </AccessibilityList>
      </>
    );

    const button = screen.getByLabelText("Accessibility");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Panel content")).toBeInTheDocument();

    fireEvent.click(button);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("provides context to useAccessibility hook", () => {
    renderPlugin(<TestChild />);
    expect(screen.getByTestId("value")).toHaveTextContent("false");

    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("value")).toHaveTextContent("true");
  });
});

describe("AccessibilityList", () => {
  it("renders children when open", () => {
    renderPlugin(
      <>
        <AccessibilityButton icon={<span>Icon</span>} />
        <AccessibilityList>
          <span>List item</span>
        </AccessibilityList>
      </>
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));
    expect(screen.getByText("List item")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    renderPlugin(
      <>
        <AccessibilityButton icon={<span>Icon</span>} />
        <AccessibilityList>
          <span>List item</span>
        </AccessibilityList>
      </>
    );

    expect(screen.queryByText("List item")).not.toBeInTheDocument();
  });
});

describe("useAccessibility", () => {
  it("throws when used outside provider", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      render(<TestChild />);
    }).toThrow("useAccessibility must be used within an <AccessibilityPlugin> provider.");
    consoleSpy.mockRestore();
  });

  it("returns default value", () => {
    renderPlugin(<TestChild />);
    expect(screen.getByTestId("value")).toHaveTextContent("false");
  });

  it("updates value", () => {
    renderPlugin(<TestChild />);
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.getByTestId("value")).toHaveTextContent("true");
  });
});
