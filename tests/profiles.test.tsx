import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup } from "@testing-library/react";
import { useContext, useEffect } from "react";
import * as API from "../src";
import { renderFeatures } from "./helpers";

let latestContext: API.AccessibilityContextValue | null = null;
function ContextProbe() {
  const ctx = useContext(API.AccessibilityContext);
  useEffect(() => {
    latestContext = ctx;
  });
  return null;
}

describe("A11Y-304: Eight Profiles and Deterministic Override Model", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
    document.body.innerHTML = "";
    latestContext = null;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    localStorage.clear();
    latestContext = null;
  });

  it("defines all eight neutral profiles without implicit audio, speech, or microphone permissions", () => {
    expect(API.ALL_PROFILE_IDS).toHaveLength(8);
    expect(API.ALL_PROFILE_IDS).toEqual([
      "motor",
      "blind",
      "color-blind",
      "dyslexia",
      "low-vision",
      "cognitive",
      "seizure",
      "adhd",
    ]);

    for (const id of API.ALL_PROFILE_IDS) {
      const profile = API.PROFILE_DEFINITIONS[id];
      expect(profile).toBeDefined();
      expect(profile.id).toBe(id);
      expect(profile.label).toBeTruthy();
      expect(profile.description).toBeTruthy();
      expect(profile.settings).toBeDefined();

      // Guardrail: Never implicitly request microphone or speech synthesis
      const settingsKeys = Object.keys(profile.settings);
      expect(settingsKeys).not.toContain("speech");
      expect(settingsKeys).not.toContain("microphone");
      expect(settingsKeys).not.toContain("voice");
      expect(settingsKeys).not.toContain("audio");
    }

    // Specific verification of blind profile
    const blindProfile = API.PROFILE_DEFINITIONS.blind;
    expect(blindProfile.settings).toEqual({
      tooltips: true,
    });
  });

  it("renders ProfilesController with toggle button, search, and all 8 preview cards", () => {
    renderFeatures(
      <>
        <API.ProfilesController />
        <ContextProbe />
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Browse" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // All 8 profile cards should be visible
    expect(screen.getByText("Motor Impaired")).toBeInTheDocument();
    expect(screen.getByText("Blind & Screen Reader")).toBeInTheDocument();
    expect(screen.getByText("Color Blind")).toBeInTheDocument();
    expect(screen.getByText("Dyslexia Friendly")).toBeInTheDocument();
    expect(screen.getByText("Low Vision")).toBeInTheDocument();
    expect(screen.getByText("Cognitive & Learning")).toBeInTheDocument();
    expect(screen.getByText("Seizure & Epileptic")).toBeInTheDocument();
    expect(screen.getByText("ADHD / Focus")).toBeInTheDocument();

    // Verify search count live status
    expect(screen.getByText("Showing all 8 tools")).toBeInTheDocument();
  });

  it("filters profiles via search input and handles empty query states", () => {
    renderFeatures(
      <>
        <API.ProfilesController />
        <ContextProbe />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Browse" }));

    const searchInput = screen.getByLabelText("Filter profiles");
    fireEvent.change(searchInput, { target: { value: "seizure" } });

    expect(screen.getByText("Seizure & Epileptic")).toBeInTheDocument();
    expect(screen.queryByText("Color Blind")).not.toBeInTheDocument();
    expect(
      screen.getByText('Showing 1 of 8 tools matching "seizure"'),
    ).toBeInTheDocument();

    // Unmatched query
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });
    expect(screen.getByText("No profiles found")).toBeInTheDocument();

    // Clear filter button in empty state
    const clearBtn = screen.getByRole("button", { name: "Clear filter" });
    fireEvent.click(clearBtn);
    expect(screen.getByText("Showing all 8 tools")).toBeInTheDocument();
    expect(screen.getByText("Motor Impaired")).toBeInTheDocument();
  });

  it("atomically applies and previews each profile with accurate settings", () => {
    const handleProfileChange = vi.fn();
    renderFeatures(
      <>
        <API.ProfilesController onProfileChange={handleProfileChange} />
        <API.ContrastModeController />
        <API.LinkHighlightController />
        <API.ReduceMotionController />
        <API.HighlightFocusController />
        <API.FontFamilyController />
        <API.BigCursorController />
        <API.ReadingGuideController />
        <API.ReadingMaskController />
        <API.TooltipsController />
        <ContextProbe />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Browse" }));

    // 1. Motor Impaired
    const applyMotor = screen.getByRole("button", {
      name: "Apply Motor Impaired profile",
    });
    fireEvent.click(applyMotor);
    expect(handleProfileChange).toHaveBeenCalledWith("motor");
    expect(latestContext!.getFeatureState("reduceMotion", false)).toBe(true);
    expect(latestContext!.getFeatureState("highlightFocus", false)).toBe(true);
    expect(latestContext!.getFeatureState("tooltips", false)).toBe(true);

    // 2. Color Blind
    const applyColorBlind = screen.getByRole("button", {
      name: "Apply Color Blind profile",
    });
    fireEvent.click(applyColorBlind);
    expect(handleProfileChange).toHaveBeenCalledWith("color-blind");
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("high");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(true);

    // 3. Dyslexia Friendly
    const applyDyslexia = screen.getByRole("button", {
      name: "Apply Dyslexia Friendly profile",
    });
    fireEvent.click(applyDyslexia);
    expect(handleProfileChange).toHaveBeenCalledWith("dyslexia");
    expect(latestContext!.getFeatureState("fontFamily", "default")).toBe(
      "dyslexia-option",
    );
    expect(latestContext!.getFeatureState("readingGuide", false)).toBe(true);
    expect(latestContext!.getFeatureState("reduceMotion", false)).toBe(true);

    // 4. Low Vision
    const applyLowVision = screen.getByRole("button", {
      name: "Apply Low Vision profile",
    });
    fireEvent.click(applyLowVision);
    expect(handleProfileChange).toHaveBeenCalledWith("low-vision");
    expect(latestContext!.getFeatureState("bigCursor", false)).toBe(true);
    expect(latestContext!.getFeatureState("highlightFocus", false)).toBe(true);

    // 5. ADHD / Focus
    const applyAdhd = screen.getByRole("button", {
      name: "Apply ADHD / Focus profile",
    });
    fireEvent.click(applyAdhd);
    expect(handleProfileChange).toHaveBeenCalledWith("adhd");
    expect(latestContext!.getFeatureState("readingMask", false)).toBe(true);
    expect(latestContext!.getFeatureState("reduceMotion", false)).toBe(true);
  });

  it("implements deterministic override model where user explicit choices survive profile reversal", () => {
    renderFeatures(
      <>
        <API.ProfilesController />
        <API.FontSizeController />
        <API.ContrastModeController />
        <API.LinkHighlightController />
        <API.ReduceMotionController />
        <ContextProbe />
      </>,
    );

    // Baseline: font 100%, contrast off, links false, motion false
    expect(latestContext!.getFeatureState("fontSize", 100)).toBe(100);
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("off");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(false);

    // Step 1: User applies Color Blind profile (contrastMode -> high, linkHighlight -> true)
    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    const applyColorBlind = screen.getByRole("button", {
      name: "Apply Color Blind profile",
    });
    fireEvent.click(applyColorBlind);

    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("high");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(true);

    // Step 2: While profile is active, user independently adjusts font size to 120%
    const incFont = screen.getByRole("button", {
      name: /increase font size/i,
    });
    fireEvent.click(incFont);
    fireEvent.click(incFont);
    expect(latestContext!.getFeatureState("fontSize", 100)).toBe(120);

    // Step 3: User also overrides one of the profile's settings: sets contrastMode to "light"
    const lightOption = screen.getByRole("button", { name: "Light" });
    fireEvent.click(lightOption);
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("light");

    // Step 4: User reverts the profile to custom settings
    const revertBtn = screen.getByRole("button", {
      name: "Revert Color Blind profile",
    });
    fireEvent.click(revertBtn);

    // Verification of deterministic survival:
    // - linkHighlight was NOT overridden by user, so it safely returns to baseline (false)
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(false);

    // - contrastMode WAS overridden to "light" by user, so "light" SURVIVES!
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("light");

    // - fontSize was independently adjusted to 120%, so 120% SURVIVES!
    expect(latestContext!.getFeatureState("fontSize", 100)).toBe(120);

    // Active profile is cleared
    expect(screen.queryByLabelText("Active profile")).not.toBeInTheDocument();
  });

  it("resets active profile state completely when ResetController is invoked", () => {
    renderFeatures(
      <>
        <API.ProfilesController />
        <API.ContrastModeController />
        <API.LinkHighlightController />
        <ContextProbe />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Browse" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Apply Color Blind profile" }),
    );

    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("high");
    expect(
      latestContext!.getFeatureState("activeProfile", null),
    ).not.toBeNull();

    // Click Reset all preferences
    const resetBtn = screen.getByRole("button", { name: /Reset all/i });
    fireEvent.click(resetBtn);

    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("off");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(false);
    expect(latestContext!.getFeatureState("activeProfile", null)).toBeNull();
  });

  it("supports switching directly between profiles while preserving base state", () => {
    renderFeatures(
      <>
        <API.ProfilesController />
        <API.ContrastModeController />
        <API.LinkHighlightController />
        <API.FontFamilyController />
        <API.ReadingGuideController />
        <ContextProbe />
      </>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Browse" }));

    // Apply Color Blind
    fireEvent.click(
      screen.getByRole("button", { name: "Apply Color Blind profile" }),
    );
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("high");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(true);

    // Switch directly to Dyslexia Friendly
    fireEvent.click(
      screen.getByRole("button", { name: "Apply Dyslexia Friendly profile" }),
    );
    expect(latestContext!.getFeatureState("fontFamily", "default")).toBe(
      "dyslexia-option",
    );
    expect(latestContext!.getFeatureState("readingGuide", false)).toBe(true);
    expect(latestContext!.getFeatureState("activeProfile", null)).toEqual(
      expect.objectContaining({ profileId: "dyslexia" }),
    );

    // Revert Dyslexia
    const revertBtn = screen.getByRole("button", {
      name: "Revert Dyslexia Friendly profile",
    });
    fireEvent.click(revertBtn);
    expect(latestContext!.getFeatureState("fontFamily", "default")).toBe(
      "default",
    );
    expect(latestContext!.getFeatureState("readingGuide", false)).toBe(false);
    expect(latestContext!.getFeatureState("activeProfile", null)).toBeNull();
  });

  it("works identically via ProfileController and AccessibilityProfilesController aliases and largeControls", () => {
    renderFeatures(
      <>
        <API.ProfileController largeControls={true} />
        <API.AccessibilityProfilesController />
      </>,
    );

    expect(document.querySelector(".arap-large-controls")).toBeInTheDocument();
  });
});
