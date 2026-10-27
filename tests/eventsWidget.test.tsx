import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
} from "../src";

describe("AccessibilityPlugin onFeatureEvent Integration (A11Y-406)", () => {
  beforeEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("emits zero events when onFeatureEvent prop is omitted (default disabled)", () => {
    // Verify default behavior: no global network or console emissions
    const consoleSpy = vi.spyOn(console, "warn");
    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const button = screen.getByRole("button", { name: /accessibility/i });
    fireEvent.click(button);

    expect(consoleSpy).not.toHaveBeenCalled();
  });

  it("emits panel-toggle event when launcher opens and closes", () => {
    const onFeatureEvent = vi.fn();
    render(
      <AccessibilityPlugin onFeatureEvent={onFeatureEvent}>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const button = screen.getByRole("button", { name: /accessibility/i });
    fireEvent.click(button);

    expect(onFeatureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "panel-toggle",
        isOpen: true,
        source: "ui",
      }),
    );

    const closeBtn = screen.getByRole("button", {
      name: /close accessibility settings/i,
    });
    fireEvent.click(closeBtn);

    expect(onFeatureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "panel-toggle",
        isOpen: false,
        source: "ui",
      }),
    );
  });

  it("emits feature-change event when a controller updates state", () => {
    const onFeatureEvent = vi.fn();
    render(
      <AccessibilityPlugin onFeatureEvent={onFeatureEvent}>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: /accessibility/i }));

    // Click Increase font size
    const increaseBtn = screen.getByRole("button", {
      name: /increase font size/i,
    });
    fireEvent.click(increaseBtn);

    expect(onFeatureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "feature-change",
        featureId: "fontSize",
        source: "ui",
      }),
    );
  });

  it("emits feature-reset event when reset is triggered", () => {
    const onFeatureEvent = vi.fn();
    render(
      <AccessibilityPlugin onFeatureEvent={onFeatureEvent}>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: /accessibility/i }));

    // Change a feature
    fireEvent.click(screen.getByRole("button", { name: /increase font size/i }));

    // Trigger reset
    const resetBtn = screen.getByRole("button", { name: /^reset all$/i });
    fireEvent.click(resetBtn);

    expect(onFeatureEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "feature-reset",
        source: "reset",
      }),
    );
  });

  it("survives throwing consumer listener without breaking UI or state", () => {
    const faultyListener = vi.fn().mockImplementation(() => {
      throw new Error("Analytics backend network crash");
    });

    render(
      <AccessibilityPlugin onFeatureEvent={faultyListener}>
        <AccessibilityButton />
        <AccessibilityList>
          <FontSizeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const button = screen.getByRole("button", { name: /accessibility/i });
    // Should NOT throw
    expect(() => fireEvent.click(button)).not.toThrow();

    // Verify panel opened successfully despite listener exception
    expect(
      screen.getByRole("region", { name: /accessibility settings/i }),
    ).toBeInTheDocument();
  });
});
