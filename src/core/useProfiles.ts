"use client";

import { useCallback, useContext } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { useAccessibility } from "./useAccessibility";
import {
  ALL_PROFILE_IDS,
  PROFILE_DEFINITIONS,
  applyProfileToStore,
  getProfileDefinition,
  revertProfileFromStore,
} from "./profiles";
import type {
  ActiveProfileState,
  ProfileDefinition,
  ProfilePresetId,
} from "./preferences/types";

export interface UseProfilesResult {
  /** All eight predefined accessibility profiles in recommended order. */
  profiles: readonly ProfileDefinition[];
  /** Active profile preset ID or null if none is applied. */
  activeProfileId: ProfilePresetId | null;
  /** Active profile definition or null if none is applied. */
  activeProfile: ProfileDefinition | null;
  /** Complete active profile state including base snapshot and user overrides. */
  activeProfileState: ActiveProfileState | null;
  /** Atomically applies a profile to the store, preserving previous custom settings. */
  applyProfile: (profileId: ProfilePresetId) => void;
  /** Reverts the active profile, retaining any user explicit overrides. */
  revertProfile: () => void;
  /** Returns whether a specific profile preset is currently active. */
  isProfileActive: (profileId: ProfilePresetId) => boolean;
}

/**
 * Hook to access and manage accessibility profiles with deterministic override survival.
 */
export function useProfiles(): UseProfilesResult {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useProfiles must be used within an <AccessibilityPlugin> provider.",
    );
  }

  const { value: activeProfileState, setValue: setActiveProfileState } =
    useAccessibility<ActiveProfileState | null>("activeProfile", null);

  const applyProfile = useCallback(
    (profileId: ProfilePresetId) => {
      const nextState = applyProfileToStore(
        profileId,
        ctx.state.features,
        ctx.setFeatureState,
        activeProfileState,
      );
      setActiveProfileState(nextState);
    },
    [
      ctx.state.features,
      ctx.setFeatureState,
      activeProfileState,
      setActiveProfileState,
    ],
  );

  const revertProfile = useCallback(() => {
    if (activeProfileState) {
      revertProfileFromStore(activeProfileState, ctx.setFeatureState);
      setActiveProfileState(null);
    }
  }, [activeProfileState, ctx.setFeatureState, setActiveProfileState]);

  const activeProfileId = activeProfileState?.profileId ?? null;
  const activeProfile = activeProfileId
    ? (getProfileDefinition(activeProfileId) ?? null)
    : null;

  const isProfileActive = useCallback(
    (id: ProfilePresetId) => activeProfileId === id,
    [activeProfileId],
  );

  const allProfiles = ALL_PROFILE_IDS.map((id) => PROFILE_DEFINITIONS[id]);

  return {
    profiles: allProfiles,
    activeProfileId,
    activeProfile,
    activeProfileState,
    applyProfile,
    revertProfile,
    isProfileActive,
  };
}
