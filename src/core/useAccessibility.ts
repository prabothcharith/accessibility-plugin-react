"use client";
import { useCallback, useContext, useEffect, useState } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import type { FeatureOptions, FeatureRegistration } from "./types";
import { validValue } from "./featureSchema";
import { PLACEMENT_KEY } from "./widgetPlacement";
import { validKey } from "./storage";

export function useAccessibility<T>(
  featureKey: string,
  defaultValue: T,
  options?: FeatureOptions<T>,
): {
  value: T;
  setValue: (next: T) => void;
  reset: () => void;
} {
  const ctx = useContext(AccessibilityContext);
  if (!ctx)
    throw new Error(
      "useAccessibility must be used within an <AccessibilityPlugin> provider.",
    );
  if (!validKey(featureKey) || featureKey === PLACEMENT_KEY)
    throw new Error(
      "Feature keys must be nonempty and cannot be prototype keys.",
    );
  // Definitions belong to a feature key and are immutable for the provider lifetime.
  const [definition] = useState({ defaultValue, ...options });
  const { registerFeature, setFeatureState } = ctx;
  useEffect(() => {
    registerFeature(featureKey, definition as FeatureRegistration);
  }, [featureKey, registerFeature, definition]);
  const setValue = useCallback(
    (next: T) => setFeatureState(featureKey, next),
    [featureKey, setFeatureState],
  );
  const reset = useCallback(
    () => setFeatureState(featureKey, definition.defaultValue),
    [featureKey, setFeatureState, definition],
  );
  // Validate restored data with this definition on the first render, before
  // registration. A nullable/union default must not conceal a valid saved value.
  const stored = Object.prototype.hasOwnProperty.call(
    ctx.state.features,
    featureKey,
  )
    ? ctx.state.features[featureKey]
    : definition.defaultValue;
  const value = validValue(
    featureKey,
    stored,
    definition.defaultValue,
    definition.validate,
  )
    ? (stored as T)
    : definition.defaultValue;
  return { value, setValue, reset };
}
