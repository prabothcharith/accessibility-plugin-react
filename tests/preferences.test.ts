import { describe, expect, it } from "vitest";
import {
  DEFAULT_PREFERENCES,
  PROFILE_DEFINITIONS,
  createInitialPreferencesState,
  normalizePreferenceValue,
  normalizePreferences,
  preferencesReducer,
  resolveEffectivePreferences,
} from "../src/core/preferences";
import type {
  ContrastMode,
  CursorSizePreference,
  ReaderMode,
  SaturationPreference,
  TextAlignPreference,
} from "../src/core/preferences";
import { clearState, loadState, saveState } from "../src/core/storage";

describe("Typed Preferences Registry & Normalization (A11Y-101)", () => {
  it("provides immutable safe defaults for all standard preferences", () => {
    expect(DEFAULT_PREFERENCES.fontScale).toBe(1.0);
    expect(DEFAULT_PREFERENCES.lineHeight).toBeNull();
    expect(DEFAULT_PREFERENCES.letterSpacingEm).toBeNull();
    expect(DEFAULT_PREFERENCES.wordSpacingEm).toBeNull();
    expect(DEFAULT_PREFERENCES.paragraphSpacingEm).toBeNull();
    expect(DEFAULT_PREFERENCES.textAlign).toBe("original");
    expect(DEFAULT_PREFERENCES.contrastMode).toBe("off");
    expect(DEFAULT_PREFERENCES.highlightLinks).toBe(false);
    expect(DEFAULT_PREFERENCES.highlightFocus).toBe(false);
    expect(DEFAULT_PREFERENCES.reduceMotion).toBe(false);
    expect(DEFAULT_PREFERENCES.hideDecorativeImages).toBe(false);
    expect(DEFAULT_PREFERENCES.fontFamily).toBe("original");
    expect(DEFAULT_PREFERENCES.cursorSize).toBe("original");
    expect(DEFAULT_PREFERENCES.readerMode).toBe("off");
    expect(DEFAULT_PREFERENCES.saturation).toBe("original");
    expect(DEFAULT_PREFERENCES.tooltips).toBe(false);
  });

  it("clamps fontScale within [0.5, 2.0] and handles invalid inputs", () => {
    expect(normalizePreferenceValue("fontScale", 1.5)).toBe(1.5);
    expect(normalizePreferenceValue("fontScale", 3.0)).toBe(2.0);
    expect(normalizePreferenceValue("fontScale", 0.2)).toBe(0.5);
    expect(normalizePreferenceValue("fontScale", Number.NaN)).toBe(0.5);
    expect(normalizePreferenceValue("fontScale", "big")).toBe(1.0);
  });

  it("validates nullable spacing metrics", () => {
    expect(normalizePreferenceValue("lineHeight", null)).toBeNull();
    expect(normalizePreferenceValue("lineHeight", 1.5)).toBe(1.5);
    expect(normalizePreferenceValue("lineHeight", 5.0)).toBe(2.0);

    expect(normalizePreferenceValue("letterSpacingEm", null)).toBeNull();
    expect(normalizePreferenceValue("letterSpacingEm", 0.12)).toBe(0.12);
    expect(normalizePreferenceValue("letterSpacingEm", 1.0)).toBe(0.5);
  });

  it("normalizes enum preferences and rejects unknown values", () => {
    expect(normalizePreferenceValue("contrastMode", "high")).toBe("high");
    expect(
      normalizePreferenceValue(
        "contrastMode",
        "neon" as unknown as ContrastMode,
      ),
    ).toBe("off");

    expect(normalizePreferenceValue("readerMode", "mask")).toBe("mask");
    expect(
      normalizePreferenceValue(
        "readerMode",
        "unknown" as unknown as ReaderMode,
      ),
    ).toBe("off");

    expect(normalizePreferenceValue("textAlign", "justify")).toBe("justify");
    expect(
      normalizePreferenceValue(
        "textAlign",
        "upside-down" as unknown as TextAlignPreference,
      ),
    ).toBe("original");

    expect(normalizePreferenceValue("cursorSize", "large")).toBe("large");
    expect(
      normalizePreferenceValue(
        "cursorSize",
        "huge" as unknown as CursorSizePreference,
      ),
    ).toBe("original");

    expect(normalizePreferenceValue("saturation", "grayscale")).toBe(
      "grayscale",
    );
    expect(
      normalizePreferenceValue(
        "saturation",
        "ultra" as unknown as SaturationPreference,
      ),
    ).toBe("original");
  });

  it("normalizes boolean preferences strictly", () => {
    expect(normalizePreferenceValue("reduceMotion", true)).toBe(true);
    expect(
      normalizePreferenceValue("reduceMotion", 1 as unknown as boolean),
    ).toBe(true);
    expect(
      normalizePreferenceValue("reduceMotion", 0 as unknown as boolean),
    ).toBe(false);
    expect(
      normalizePreferenceValue("reduceMotion", null as unknown as boolean),
    ).toBe(false);
  });

  it("normalizes a partial preference object", () => {
    const normalized = normalizePreferences({
      fontScale: 1.25,
      contrastMode: "dark",
      reduceMotion: true,
      textAlign: "invalid" as unknown as TextAlignPreference,
    });

    expect(normalized.fontScale).toBe(1.25);
    expect(normalized.contrastMode).toBe("dark");
    expect(normalized.reduceMotion).toBe(true);
    expect(normalized.textAlign).toBe("original");
    expect(normalized.tooltips).toBe(false);
  });

  it("resolves effective preferences combining base, snapshot, and overrides", () => {
    const effective = resolveEffectivePreferences(
      DEFAULT_PREFERENCES,
      { reduceMotion: true },
      { fontScale: 1.5 },
    );
    expect(effective.fontScale).toBe(1.5);
    expect(effective.reduceMotion).toBe(true);
    expect(effective.contrastMode).toBe("off");
  });
});

describe("Preferences Reducer & Profile Overrides (A11Y-101 / W-03)", () => {
  it("initializes with clean base and effective state", () => {
    const state = createInitialPreferencesState();
    expect(state.activeProfileId).toBeNull();
    expect(state.profileSnapshot).toBeNull();
    expect(state.overrides).toEqual({});
    expect(state.effective).toEqual(DEFAULT_PREFERENCES);
  });

  it("updates base preferences when no profile is active", () => {
    let state = createInitialPreferencesState();
    state = preferencesReducer(state, {
      type: "SET_PREFERENCE",
      key: "fontScale",
      value: 1.5,
    });

    expect(state.base.fontScale).toBe(1.5);
    expect(state.effective.fontScale).toBe(1.5);
    expect(state.overrides).toEqual({});
  });

  it("applies an accessibility profile preset atomically", () => {
    let state = createInitialPreferencesState();
    state = preferencesReducer(state, {
      type: "APPLY_PROFILE",
      profileId: "dyslexia",
      settings: PROFILE_DEFINITIONS.dyslexia.settings,
    });

    expect(state.activeProfileId).toBe("dyslexia");
    expect(state.effective.fontFamily).toBe("dyslexia-option");
    expect(state.effective.readerMode).toBe("guide");
    expect(state.effective.reduceMotion).toBe(true);
    expect(state.overrides).toEqual({});
  });

  it("records user overrides on top of an active profile without mutating base", () => {
    let state = createInitialPreferencesState({ fontScale: 1.0 });

    state = preferencesReducer(state, {
      type: "APPLY_PROFILE",
      profileId: "low-vision",
      settings: PROFILE_DEFINITIONS["low-vision"].settings,
    });
    expect(state.effective.fontScale).toBe(1.25);
    expect(state.base.fontScale).toBe(1.0);

    // User explicitly adjusts fontScale while profile is active
    state = preferencesReducer(state, {
      type: "SET_PREFERENCE",
      key: "fontScale",
      value: 1.5,
    });

    expect(state.overrides.fontScale).toBe(1.5);
    expect(state.effective.fontScale).toBe(1.5);
    expect(state.base.fontScale).toBe(1.0); // Base remains 1.0
  });

  it("clears profile while retaining user adjustments into base", () => {
    let state = createInitialPreferencesState();

    state = preferencesReducer(state, {
      type: "APPLY_PROFILE",
      profileId: "seizure",
      settings: PROFILE_DEFINITIONS.seizure.settings,
    });

    state = preferencesReducer(state, {
      type: "SET_PREFERENCE",
      key: "contrastMode",
      value: "high",
    });

    state = preferencesReducer(state, { type: "CLEAR_PROFILE" });

    expect(state.activeProfileId).toBeNull();
    expect(state.profileSnapshot).toBeNull();
    expect(state.effective.contrastMode).toBe("high");
    expect(state.base.contrastMode).toBe("high");
  });

  it("resets all preferences to defaults", () => {
    let state = createInitialPreferencesState({ fontScale: 1.75 });
    state = preferencesReducer(state, {
      type: "APPLY_PROFILE",
      profileId: "adhd",
      settings: PROFILE_DEFINITIONS.adhd.settings,
    });

    state = preferencesReducer(state, { type: "RESET_ALL" });

    expect(state.activeProfileId).toBeNull();
    expect(state.profileSnapshot).toBeNull();
    expect(state.overrides).toEqual({});
    expect(state.effective).toEqual(DEFAULT_PREFERENCES);
    expect(state.base).toEqual(DEFAULT_PREFERENCES);
  });

  it("imports settings safely", () => {
    let state = createInitialPreferencesState();
    state = preferencesReducer(state, {
      type: "IMPORT_PREFERENCES",
      preferences: {
        fontScale: 1.5,
        highlightLinks: true,
      },
    });

    expect(state.effective.fontScale).toBe(1.5);
    expect(state.effective.highlightLinks).toBe(true);
    expect(state.effective.reduceMotion).toBe(false);
  });
});

describe("Storage Modes (A11Y-103 / W-31)", () => {
  const TEST_KEY = "test:storage:mode";

  it("reads and writes in sessionStorage when mode is session", () => {
    saveState({ fontSize: 120 }, TEST_KEY, "session");
    const loaded = loadState(TEST_KEY, "session");
    expect(loaded).toEqual({ fontSize: 120 });

    // Should not have touched localStorage
    expect(loadState(TEST_KEY, "local")).toBeNull();

    clearState(TEST_KEY, "session");
    expect(loadState(TEST_KEY, "session")).toBeNull();
  });

  it("does not store anything when mode is none", () => {
    saveState({ fontSize: 150 }, TEST_KEY, "none");
    expect(loadState(TEST_KEY, "none")).toBeNull();
    expect(loadState(TEST_KEY, "local")).toBeNull();
    expect(loadState(TEST_KEY, "session")).toBeNull();
  });
});
