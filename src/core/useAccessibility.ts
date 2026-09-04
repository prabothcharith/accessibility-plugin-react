"use client";

import { useCallback, useContext, useEffect } from "react";
import { AccessibilityContext } from "./AccessibilityContext";

export function useAccessibility<T>(
  featureKey: string,
  defaultValue: T
): {
  value: T;
  setValue: (next: T) => void;
  reset: () => void;
} {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility must be used within an <AccessibilityPlugin> provider."
    );
  }

  const { getFeatureState, setFeatureState, registerReset, unregisterReset } =
    ctx;

  const value = getFeatureState<T>(featureKey, defaultValue);

  const setValue = useCallback(
    (next: T) => {
      setFeatureState<T>(featureKey, next);
    },
    [featureKey, setFeatureState]
  );

  const reset = useCallback(() => {
    setFeatureState<T>(featureKey, defaultValue);
  }, [featureKey, defaultValue, setFeatureState]);

  // Register reset function on mount, unregister on unmount
  useEffect(() => {
    registerReset(featureKey, reset);
    return () => {
      unregisterReset(featureKey);
    };
  }, [featureKey, reset, registerReset, unregisterReset]);

  return { value, setValue, reset };
}
