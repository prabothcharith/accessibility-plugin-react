import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import React, { useState } from "react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { AccessibilityButton } from "../src/core/AccessibilityButton";
import { AccessibilityList } from "../src/core/AccessibilityList";
import { FeatureMenu } from "../src/features/FeatureMenu";
import type { MenuCustomizationConfig } from "../src/core/menuCustomization";

describe("FeatureMenu and AccessibilityList menu customization (A11Y-404)", () => {
  it("renders custom ordered items inside FeatureMenu", () => {
    const config: MenuCustomizationConfig = {
      items: [
        { id: "grayscale", order: 10 },
        { id: "fontSize", order: 20 },
      ],
      enableLogging: false,
    };

    render(
      <AccessibilityPlugin>
        <FeatureMenu config={config} />
      </AccessibilityPlugin>,
    );

    // Both controllers should be rendered
    expect(
      screen.getByRole("button", { name: /^grayscale$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /increase font size/i }),
    ).toBeInTheDocument();
  });

  it("omits disabled items from being rendered", () => {
    const config: MenuCustomizationConfig = {
      items: [
        { id: "grayscale", enabled: true },
        { id: "fontSize", enabled: false },
      ],
      enableLogging: false,
    };

    render(
      <AccessibilityPlugin>
        <FeatureMenu config={config} />
      </AccessibilityPlugin>,
    );

    expect(
      screen.getByRole("button", { name: /^grayscale$/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /increase font size/i }),
    ).not.toBeInTheDocument();
  });

  it("renders accessible grouped layout with section role='group' and aria-labelledby", () => {
    const config: MenuCustomizationConfig = {
      grouped: true,
      groups: [
        {
          id: "colorGroup",
          title: "Visual Adjustments",
          description: "Color modes",
        },
      ],
      items: [{ id: "grayscale", group: "colorGroup" }],
      enableLogging: false,
    };

    render(
      <AccessibilityPlugin>
        <FeatureMenu config={config} grouped={true} />
      </AccessibilityPlugin>,
    );

    const groupSection = screen.getByRole("group", {
      name: /visual adjustments/i,
    });
    expect(groupSection).toBeInTheDocument();
    expect(within(groupSection).getByText("Color modes")).toBeInTheDocument();
    expect(
      within(groupSection).getByRole("button", { name: /^grayscale$/i }),
    ).toBeInTheDocument();
  });

  it("renders custom label override on controller cards", () => {
    const config: MenuCustomizationConfig = {
      items: [{ id: "grayscale", label: "Black & White Mode" }],
      enableLogging: false,
    };

    render(
      <AccessibilityPlugin>
        <FeatureMenu config={config} />
      </AccessibilityPlugin>,
    );

    expect(screen.getByText("Black & White Mode")).toBeInTheDocument();
  });

  it("integrates automatically with AccessibilityList when children are omitted", () => {
    const config: MenuCustomizationConfig = {
      items: [{ id: "grayscale", order: 1 }],
      showStatement: false,
      showPositionControls: false,
      enableLogging: false,
    };

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList menuConfig={config} />
      </AccessibilityPlugin>,
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    // Grayscale controller should be rendered inside tools
    expect(
      screen.getByRole("button", { name: /^grayscale$/i }),
    ).toBeInTheDocument();

    // Position controls and statement link should be suppressed
    expect(
      screen.queryByRole("button", { name: /top left/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/accessibility statement/i),
    ).not.toBeInTheDocument();
  });

  it("maintains stable rerenders and preserves DOM focus on controls", () => {
    function TestHost() {
      const [count, setCount] = useState(0);
      const config: MenuCustomizationConfig = {
        items: [{ id: "grayscale" }, { id: "fontSize" }],
        enableLogging: false,
      };

      return (
        <AccessibilityPlugin>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            Increment ({count})
          </button>
          <FeatureMenu config={config} />
        </AccessibilityPlugin>
      );
    }

    render(<TestHost />);

    const grayscaleSwitch = screen.getByRole("button", {
      name: /^grayscale$/i,
    });
    grayscaleSwitch.focus();
    expect(document.activeElement).toBe(grayscaleSwitch);

    // Trigger parent rerender by updating unrelated state
    const incrementBtn = screen.getByRole("button", { name: /increment/i });
    fireEvent.click(incrementBtn);

    // Focus must NOT be lost or thrash on stable rerenders
    expect(document.activeElement).toBe(grayscaleSwitch);
  });

  it("handles malformed config gracefully without throwing", () => {
    const consoleWarnSpy = vi
      .spyOn(console, "warn")
      .mockImplementation(() => {});

    expect(() => {
      render(
        <AccessibilityPlugin>
          {/* @ts-expect-error Testing invalid runtime prop */}
          <FeatureMenu config={"not-an-object"} />
        </AccessibilityPlugin>,
      );
    }).not.toThrow();

    consoleWarnSpy.mockRestore();
  });
});
