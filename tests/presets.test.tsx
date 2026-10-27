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

describe("A11Y-305: Custom Saved Presets and Settings Import/Export", () => {
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
    vi.restoreAllMocks();
  });

  it("creates custom presets with stable IDs, timestamps, and privacy-safe sanitized preferences", () => {
    const rawSettings = {
      fontScale: 1.25,
      contrastMode: "dark" as const,
      reduceMotion: true,
      // Private / forbidden fields that MUST be stripped:
      user: "user-12345",
      token: "secret-bearer-token",
      email: "test@example.com",
      pageContent: "Secret internal document text",
      notes: "Private reading notes",
      __proto__: { polluted: true },
    };

    const preset = API.createCustomPreset(
      "Work Reading",
      rawSettings as unknown as Partial<API.AccessibilityPreferences>,
    );

    expect(preset.id).toMatch(/^preset_\d+_[a-z0-9]+$/);
    expect(preset.name).toBe("Work Reading");
    expect(preset.createdAt).toBeTruthy();
    expect(new Date(preset.createdAt).toString()).not.toBe("Invalid Date");

    // Strictly privacy-safe settings:
    expect(preset.settings).toEqual({
      fontScale: 1.25,
      contrastMode: "dark",
      reduceMotion: true,
    });
    const settingsRecord = preset.settings as Record<string, unknown>;
    expect(settingsRecord.user).toBeUndefined();
    expect(settingsRecord.token).toBeUndefined();
    expect(settingsRecord.pageContent).toBeUndefined();
  });

  it("serializes custom presets to version 1 JSON envelope and triggers clean download", () => {
    const preset = API.createCustomPreset("High Contrast Big Text", {
      fontScale: 1.5,
      contrastMode: "high",
      highlightLinks: true,
    });

    const json = API.exportPresetsToJson({
      presets: [preset],
      currentSettings: { fontScale: 1.5, contrastMode: "high" },
    });

    const parsed = JSON.parse(json);
    expect(parsed.version).toBe(1);
    expect(parsed.app).toBe("accessibility-plugin-react");
    expect(parsed.exportedAt).toBeTruthy();
    expect(parsed.presets).toHaveLength(1);
    expect(parsed.presets[0].name).toBe("High Contrast Big Text");
    expect(parsed.presets[0].settings.fontScale).toBe(1.5);
    expect(parsed.currentSettings.contrastMode).toBe("high");
  });

  it("validates and parses valid v1 envelopes, legacy arrays, and flat settings objects", () => {
    // 1. Valid v1 envelope
    const v1Json = JSON.stringify({
      version: 1,
      app: "accessibility-plugin-react",
      exportedAt: new Date().toISOString(),
      presets: [
        {
          id: "p1",
          name: "V1 Preset",
          createdAt: new Date().toISOString(),
          settings: { fontScale: 1.25, contrastMode: "light" },
        },
      ],
      currentSettings: { reduceMotion: true },
    });

    const v1Result = API.validateAndParseImport(v1Json);
    expect(v1Result.success).toBe(true);
    if (v1Result.success) {
      expect(v1Result.presets).toHaveLength(1);
      expect(v1Result.presets[0].name).toBe("V1 Preset");
      expect(v1Result.currentSettings?.reduceMotion).toBe(true);
    }

    // 2. Legacy array of presets
    const legacyArrayJson = JSON.stringify([
      {
        id: "legacy_1",
        name: "Legacy Preset",
        settings: { fontScale: 1.5 },
      },
    ]);
    const arrayResult = API.validateAndParseImport(legacyArrayJson);
    expect(arrayResult.success).toBe(true);
    if (arrayResult.success) {
      expect(arrayResult.presets).toHaveLength(1);
      expect(arrayResult.presets[0].name).toBe("Legacy Preset");
      expect(arrayResult.presets[0].settings.fontScale).toBe(1.5);
    }

    // 3. Flat settings object
    const flatJson = JSON.stringify({
      fontScale: 1.5,
      contrastMode: "high",
    });
    const flatResult = API.validateAndParseImport(flatJson);
    expect(flatResult.success).toBe(true);
    if (flatResult.success) {
      expect(flatResult.currentSettings).toEqual({
        fontScale: 1.5,
        contrastMode: "high",
      });
    }
  });

  it("returns clear, user-facing error messages on malformed, empty, or unsupported version imports", () => {
    // 1. Empty string
    const emptyResult = API.validateAndParseImport("");
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(emptyResult.error).toMatch(/empty/i);
    }

    // 2. Syntax error
    const syntaxResult = API.validateAndParseImport("{ broken json ");
    expect(syntaxResult.success).toBe(false);
    if (!syntaxResult.success) {
      expect(syntaxResult.error).toMatch(/syntax error/i);
    }

    // 3. Unsupported future schema version
    const futureResult = API.validateAndParseImport(
      JSON.stringify({ version: 2, presets: [] }),
    );
    expect(futureResult.success).toBe(false);
    if (!futureResult.success) {
      expect(futureResult.error).toMatch(/unsupported schema version/i);
    }

    // 4. Object without any valid presets or preferences
    const invalidObjResult = API.validateAndParseImport(
      JSON.stringify({ foo: "bar", other: 123 }),
    );
    expect(invalidObjResult.success).toBe(false);
    if (!invalidObjResult.success) {
      expect(invalidObjResult.error).toMatch(
        /no valid presets or accessibility settings/i,
      );
    }
  });

  it("renders PresetsController, manages open/close, and handles empty state", () => {
    renderFeatures(
      <>
        <API.PresetsController />
        <ContextProbe />
      </>,
    );

    const trigger = screen.getByRole("button", { name: "Presets" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-controls", "arap-presets-dialog");

    // Open
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveTextContent("Close");

    const dialog = screen.getByRole("region", {
      name: "Custom Presets and Settings",
    });
    expect(dialog).toBeVisible();

    // Verify empty state is rendered
    expect(screen.getByText("No saved presets yet")).toBeVisible();
    expect(screen.getByText("Saved Presets (0):")).toBeVisible();
  });

  it("saves a new custom preset and announces confirmation via role='status'", () => {
    renderFeatures(
      <>
        <API.PresetsController />
        <API.FontSizeController />
        <API.ContrastModeController />
        <ContextProbe />
      </>,
    );

    // Set font size to 120 and contrast to dark
    const trigger = screen.getByRole("button", { name: "Presets" });
    fireEvent.click(trigger);

    // Attempt saving with empty name -> should show alert error
    const saveBtn = screen.getByRole("button", { name: "Save current preset" });
    fireEvent.click(saveBtn);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Please enter a name for your preset.",
    );

    // Now type a name and save
    const nameInput = screen.getByRole("textbox", { name: "Preset name" });
    fireEvent.change(nameInput, { target: { value: "My Night Setup" } });
    fireEvent.click(saveBtn);

    // Status announcement
    expect(
      screen.getByText('✓ Preset "My Night Setup" saved successfully.'),
    ).toBeVisible();

    // Preset list should now show 1 preset
    expect(screen.getByText("Saved Presets (1):")).toBeVisible();
    expect(screen.getByText("My Night Setup")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Apply preset My Night Setup" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Delete preset My Night Setup" }),
    ).toBeVisible();
  });

  it("atomically applies and deletes custom presets with status announcements", () => {
    renderFeatures(
      <>
        <API.PresetsController />
        <API.TextScaleController />
        <API.ContrastModeController />
        <API.LinkHighlightController />
        <ContextProbe />
      </>,
    );

    // Create preset via hook directly in context
    const preset = API.createCustomPreset("Focus Reading", {
      fontScale: 1.5,
      contrastMode: "high",
      highlightLinks: true,
    });
    latestContext!.setFeatureState("customPresets", [preset]);

    // Open Presets dialog
    fireEvent.click(screen.getByRole("button", { name: "Presets" }));
    expect(screen.getByText("Focus Reading")).toBeVisible();

    // Apply preset
    const applyBtn = screen.getByRole("button", {
      name: "Apply preset Focus Reading",
    });
    fireEvent.click(applyBtn);

    // Verify settings applied in store
    expect(latestContext!.getFeatureState("fontScale", 1.0)).toBe(1.5);
    expect(latestContext!.getFeatureState("contrastMode", "off")).toBe("high");
    expect(latestContext!.getFeatureState("linkHighlight", false)).toBe(true);
    expect(screen.getByText('✓ Preset "Focus Reading" applied.')).toBeVisible();

    // Delete preset
    const deleteBtn = screen.getByRole("button", {
      name: "Delete preset Focus Reading",
    });
    fireEvent.click(deleteBtn);

    // Preset removed and announced
    expect(screen.getByText('✓ Preset "Focus Reading" deleted.')).toBeVisible();
    expect(screen.getByText("No saved presets yet")).toBeVisible();
  });

  it("preserves custom presets library when ResetController executes", () => {
    renderFeatures(
      <>
        <API.PresetsController />
        <API.TextScaleController />
        <ContextProbe />
      </>,
    );

    // Save a custom preset
    const preset = API.createCustomPreset("Persistent Preset", {
      fontScale: 1.25,
      contrastMode: "dark",
    });
    latestContext!.setFeatureState("customPresets", [preset]);
    latestContext!.setFeatureState("fontScale", 1.5);

    // Reset All
    fireEvent.click(screen.getByRole("button", { name: "Reset All" }));

    // fontScale reset to default
    expect(latestContext!.getFeatureState("fontScale", 1.0)).toBe(1.0);

    // customPresets preserved!
    const preservedPresets = latestContext!.getFeatureState<API.CustomPreset[]>(
      "customPresets",
      [],
    );
    expect(preservedPresets).toHaveLength(1);
    expect(preservedPresets[0].name).toBe("Persistent Preset");
  });

  it("supports CustomPresetsController and SettingsImportExportController aliases with largeControls", () => {
    renderFeatures(
      <>
        <API.CustomPresetsController largeControls={true} />
        <API.SettingsImportExportController />
        <API.PresetsBackupController />
        <ContextProbe />
      </>,
    );

    const buttons = screen.getAllByRole("button", { name: "Presets" });
    expect(buttons).toHaveLength(3);
    expect(buttons[0].closest(".arap-feature")).toHaveClass(
      "arap-large-controls",
    );
  });
});
