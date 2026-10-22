import { DEFAULT_PREFERENCES, PROFILE_DEFINITIONS } from "./defaults";
import {
  normalizePreferenceValue,
  normalizePreferences,
  resolveEffectivePreferences,
} from "./registry";
import type {
  AccessibilityPreferences,
  PreferencesAction,
  PreferencesState,
} from "./types";

export function createInitialPreferencesState(
  initial?: Partial<AccessibilityPreferences> | null,
): PreferencesState {
  const base = normalizePreferences(initial);
  return {
    base,
    activeProfileId: null,
    profileSnapshot: null,
    overrides: {},
    effective: { ...base },
  };
}

export function preferencesReducer(
  state: PreferencesState,
  action: PreferencesAction,
): PreferencesState {
  switch (action.type) {
    case "SET_PREFERENCE": {
      const normalizedValue = normalizePreferenceValue(
        action.key,
        action.value,
      );

      if (state.activeProfileId) {
        const nextOverrides = {
          ...state.overrides,
          [action.key]: normalizedValue,
        };
        return {
          ...state,
          overrides: nextOverrides,
          effective: resolveEffectivePreferences(
            state.base,
            state.profileSnapshot,
            nextOverrides,
          ),
        };
      }

      const nextBase = {
        ...state.base,
        [action.key]: normalizedValue,
      };
      return {
        ...state,
        base: nextBase,
        effective: resolveEffectivePreferences(nextBase, null, state.overrides),
      };
    }

    case "APPLY_PROFILE": {
      const profile = PROFILE_DEFINITIONS[action.profileId];
      const settings = action.settings || profile?.settings || {};
      const profileSnapshot = { ...settings };
      const nextOverrides: Partial<AccessibilityPreferences> = {};

      return {
        ...state,
        activeProfileId: action.profileId,
        profileSnapshot,
        overrides: nextOverrides,
        effective: resolveEffectivePreferences(
          state.base,
          profileSnapshot,
          nextOverrides,
        ),
      };
    }

    case "CLEAR_PROFILE": {
      // Merge overrides made during the profile session into base preferences
      const nextBase = {
        ...state.base,
        ...state.overrides,
      };
      return {
        ...state,
        activeProfileId: null,
        profileSnapshot: null,
        overrides: {},
        effective: normalizePreferences(nextBase),
        base: nextBase,
      };
    }

    case "RESET_ALL": {
      const cleanBase = { ...DEFAULT_PREFERENCES };
      return {
        base: cleanBase,
        activeProfileId: null,
        profileSnapshot: null,
        overrides: {},
        effective: cleanBase,
      };
    }

    case "IMPORT_PREFERENCES": {
      const cleanBase = normalizePreferences(action.preferences);
      return {
        base: cleanBase,
        activeProfileId: null,
        profileSnapshot: null,
        overrides: {},
        effective: cleanBase,
      };
    }

    default:
      return state;
  }
}
