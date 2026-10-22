import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ToggleControl,
  ChoiceControl,
  StepperControl,
  FeatureCard,
  SearchCount,
  EmptyState,
  ErrorState,
  ProfilePreviewCard,
} from "../src";
import type { ProfileDefinition } from "../src";

describe("A11Y-105: Feature cards and control primitives", () => {
  describe("ToggleControl", () => {
    it("renders switch with accessible role, name and aria-checked state", () => {
      const handleChange = vi.fn();
      render(
        <ToggleControl
          label="High Contrast"
          checked={false}
          onChange={handleChange}
        />,
      );

      const toggle = screen.getByRole("switch", { name: "High Contrast" });
      expect(toggle).toBeInTheDocument();
      expect(toggle).toHaveAttribute("aria-checked", "false");

      fireEvent.click(toggle);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it("respects disabled and unavailable states", () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <ToggleControl
          label="Speech Synthesis"
          checked={false}
          onChange={handleChange}
          disabled={true}
        />,
      );

      const toggle = screen.getByRole("switch", { name: "Speech Synthesis" });
      expect(toggle).toBeDisabled();
      fireEvent.click(toggle);
      expect(handleChange).not.toHaveBeenCalled();

      rerender(
        <ToggleControl
          label="Speech Synthesis"
          checked={false}
          onChange={handleChange}
          unavailable={true}
          unavailableReason="Browser does not support Web Speech API"
        />,
      );

      const unavailToggle = screen.getByRole("switch", {
        name: "Speech Synthesis",
      });
      expect(unavailToggle).toBeDisabled();
      expect(unavailToggle).toHaveAttribute(
        "title",
        "Browser does not support Web Speech API",
      );
      fireEvent.click(unavailToggle);
      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("ChoiceControl", () => {
    const options = [
      { label: "Off", value: "off" },
      { label: "Low", value: "low" },
      { label: "High", value: "high" },
    ];

    it("renders radiogroup with radio buttons and active selection", () => {
      const handleChange = vi.fn();
      render(
        <ChoiceControl
          label="Contrast level"
          value="low"
          options={options}
          onChange={handleChange}
        />,
      );

      const radiogroup = screen.getByRole("radiogroup", {
        name: "Contrast level",
      });
      expect(radiogroup).toBeInTheDocument();

      const lowRadio = screen.getByRole("radio", { name: /low/i });
      expect(lowRadio).toHaveAttribute("aria-checked", "true");

      const highRadio = screen.getByRole("radio", { name: /high/i });
      expect(highRadio).toHaveAttribute("aria-checked", "false");

      fireEvent.click(highRadio);
      expect(handleChange).toHaveBeenCalledWith("high");
    });

    it("supports keyboard Arrow navigation across choices", () => {
      const handleChange = vi.fn();
      render(
        <ChoiceControl
          label="Contrast level"
          value="off"
          options={options}
          onChange={handleChange}
        />,
      );

      const radiogroup = screen.getByRole("radiogroup", {
        name: "Contrast level",
      });

      // ArrowRight advances to next
      fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
      expect(handleChange).toHaveBeenCalledWith("low");

      // End key moves to last
      fireEvent.keyDown(radiogroup, { key: "End" });
      expect(handleChange).toHaveBeenCalledWith("high");

      // Home key moves to first
      fireEvent.keyDown(radiogroup, { key: "Home" });
      expect(handleChange).toHaveBeenCalledWith("off");
    });

    it("supports multi-level grouped choices", () => {
      const groups = [
        {
          label: "Standard",
          options: [
            { label: "Off", value: "off" },
            { label: "Light", value: "light" },
          ],
        },
        {
          label: "Inverted",
          options: [{ label: "Invert", value: "invert" }],
        },
      ];

      render(
        <ChoiceControl
          label="Contrast categories"
          value="invert"
          groups={groups}
          onChange={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("group", { name: "Standard" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("group", { name: "Inverted" }),
      ).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /invert/i })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
  });

  describe("StepperControl", () => {
    it("renders bounds, live output and handles increment/decrement", () => {
      const handleChange = vi.fn();
      render(
        <StepperControl
          label="Font Size"
          value={100}
          min={50}
          max={150}
          step={10}
          unit="%"
          onChange={handleChange}
        />,
      );

      const decBtn = screen.getByRole("button", { name: "Decrease Font Size" });
      const incBtn = screen.getByRole("button", { name: "Increase Font Size" });
      const output = screen.getByText("100%");

      expect(output).toHaveAttribute("aria-live", "polite");

      fireEvent.click(decBtn);
      expect(handleChange).toHaveBeenCalledWith(90);

      fireEvent.click(incBtn);
      expect(handleChange).toHaveBeenCalledWith(110);
    });

    it("clamps at min and max bounds", () => {
      const handleChange = vi.fn();
      const { rerender } = render(
        <StepperControl
          label="Font Size"
          value={50}
          min={50}
          max={150}
          step={10}
          onChange={handleChange}
        />,
      );

      const decBtn = screen.getByRole("button", { name: "Decrease Font Size" });
      expect(decBtn).toBeDisabled();

      rerender(
        <StepperControl
          label="Font Size"
          value={150}
          min={50}
          max={150}
          step={10}
          onChange={handleChange}
        />,
      );

      const incBtn = screen.getByRole("button", { name: "Increase Font Size" });
      expect(incBtn).toBeDisabled();
    });

    it("renders slider range input with proper aria attributes when enabled", () => {
      const handleChange = vi.fn();
      render(
        <StepperControl
          label="Font Size"
          value={120}
          min={50}
          max={200}
          step={10}
          showSlider={true}
          onChange={handleChange}
        />,
      );

      const slider = screen.getByRole("slider", { name: "Font Size" });
      expect(slider).toBeInTheDocument();
      expect(slider).toHaveAttribute("aria-valuemin", "50");
      expect(slider).toHaveAttribute("aria-valuemax", "200");
      expect(slider).toHaveAttribute("aria-valuenow", "120");
      expect(slider).toHaveAttribute("aria-valuetext", "120%");
    });
  });

  describe("FeatureCard", () => {
    it("renders feature card with title, description, and status badge", () => {
      render(
        <FeatureCard
          title="Line Height"
          description="Adjust the vertical space between lines of text"
          statusBadge="Active"
        >
          <div>Control content</div>
        </FeatureCard>,
      );

      expect(
        screen.getByRole("group", { name: "Line Height" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Line Height")).toBeInTheDocument();
      expect(
        screen.getByText("Adjust the vertical space between lines of text"),
      ).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText("Control content")).toBeInTheDocument();
    });

    it("displays error banner when status is error", () => {
      render(
        <FeatureCard
          title="Custom Feature"
          status="error"
          errorMessage="Failed to apply custom stylesheet filter."
        >
          <div>Inner content</div>
        </FeatureCard>,
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent(
        "Failed to apply custom stylesheet filter.",
      );
    });

    it("displays unavailable notice when status is unavailable", () => {
      render(
        <FeatureCard
          title="Voice Reader"
          status="unavailable"
          unavailableMessage="Speech synthesis is not supported on this platform."
        >
          <div>Inner content</div>
        </FeatureCard>,
      );

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(
        "Speech synthesis is not supported on this platform.",
      );
    });

    it("displays permission prompt with action button when permission is required", () => {
      const handlePermission = vi.fn();
      render(
        <FeatureCard
          title="Screen Reader Assistant"
          status="permission-required"
          permissionMessage="Microphone permission required for voice control."
          onRequestPermission={handlePermission}
        >
          <div>Inner content</div>
        </FeatureCard>,
      );

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent(
        "Microphone permission required for voice control.",
      );

      const btn = screen.getByRole("button", { name: "Allow permission" });
      fireEvent.click(btn);
      expect(handlePermission).toHaveBeenCalledTimes(1);
    });
  });

  describe("FeatureStatusState", () => {
    it("SearchCount announces matched count with aria-live", () => {
      render(<SearchCount totalCount={15} matchedCount={4} query="contrast" />);
      const count = screen.getByRole("status");
      expect(count).toHaveAttribute("aria-live", "polite");
      expect(count).toHaveTextContent(
        'Showing 4 of 15 tools matching "contrast"',
      );
    });

    it("EmptyState renders message and clear action", () => {
      const handleClear = vi.fn();
      render(
        <EmptyState
          title="No tools found"
          description="No tools matched your query."
          actionLabel="Clear filter"
          onAction={handleClear}
        />,
      );

      expect(screen.getByText("No tools found")).toBeInTheDocument();
      expect(
        screen.getByText("No tools matched your query."),
      ).toBeInTheDocument();
      const btn = screen.getByRole("button", { name: "Clear filter" });
      fireEvent.click(btn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    it("ErrorState renders error message and retry action", () => {
      const handleRetry = vi.fn();
      render(
        <ErrorState
          title="Failed to load preferences"
          message="Storage quota exceeded."
          onRetry={handleRetry}
        />,
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Storage quota exceeded.")).toBeInTheDocument();
      const retryBtn = screen.getByRole("button", { name: "Try again" });
      fireEvent.click(retryBtn);
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("ProfilePreviewCard", () => {
    const testProfile: ProfileDefinition = {
      id: "low-vision",
      label: "Low Vision Profile",
      description:
        "Enhances text size, contrast, and font clarity for low vision users.",
      settings: {
        fontScale: 1.3,
        contrastMode: "high",
        reduceMotion: true,
      },
    };

    it("previews affected settings and handles apply action", () => {
      const handleApply = vi.fn();
      const handleRevert = vi.fn();

      render(
        <ProfilePreviewCard
          profile={testProfile}
          isActive={false}
          onApply={handleApply}
          onRevert={handleRevert}
        />,
      );

      expect(
        screen.getByRole("group", { name: "Low Vision Profile profile" }),
      ).toBeInTheDocument();
      expect(screen.getByText("Low Vision Profile")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Enhances text size, contrast, and font clarity for low vision users.",
        ),
      ).toBeInTheDocument();

      // Check affected settings chips
      expect(screen.getByText("Font Size:")).toBeInTheDocument();
      expect(screen.getByText("130%")).toBeInTheDocument();
      expect(screen.getByText("Contrast:")).toBeInTheDocument();
      expect(screen.getByText("high")).toBeInTheDocument();
      expect(screen.getByText("Reduce Motion:")).toBeInTheDocument();
      expect(screen.getByText("On")).toBeInTheDocument();

      const applyBtn = screen.getByRole("button", {
        name: "Apply Low Vision Profile profile",
      });
      fireEvent.click(applyBtn);
      expect(handleApply).toHaveBeenCalledWith(testProfile);
    });

    it("shows active badge and reversal action when profile is active", () => {
      const handleApply = vi.fn();
      const handleRevert = vi.fn();

      render(
        <ProfilePreviewCard
          profile={testProfile}
          isActive={true}
          onApply={handleApply}
          onRevert={handleRevert}
        />,
      );

      expect(screen.getByLabelText("Active profile")).toBeInTheDocument();
      const revertBtn = screen.getByRole("button", {
        name: "Revert Low Vision Profile profile",
      });
      expect(revertBtn).toHaveTextContent("Revert to custom settings");

      fireEvent.click(revertBtn);
      expect(handleRevert).toHaveBeenCalledTimes(1);
    });
  });
});
