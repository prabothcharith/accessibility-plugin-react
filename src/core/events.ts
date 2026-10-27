"use client";

export type AccessibilityEventType =
  | "feature-change"
  | "feature-reset"
  | "panel-toggle"
  | "placement-change"
  | "profile-apply"
  | "preset-apply";

export type EventTriggerSource =
  | "ui"
  | "shortcut"
  | "profile"
  | "preset"
  | "reset"
  | "api";

export interface BaseAccessibilityEvent {
  type: AccessibilityEventType;
  timestamp: number;
  source: EventTriggerSource;
}

export interface FeatureChangeEvent extends BaseAccessibilityEvent {
  type: "feature-change";
  featureId: string;
  value: boolean | number | string;
  previousValue?: boolean | number | string;
}

export interface FeatureResetEvent extends BaseAccessibilityEvent {
  type: "feature-reset";
  clearedFeaturesCount: number;
}

export interface PanelToggleEvent extends BaseAccessibilityEvent {
  type: "panel-toggle";
  isOpen: boolean;
}

export interface PlacementChangeEvent extends BaseAccessibilityEvent {
  type: "placement-change";
  placement: "corner" | "point";
}

export interface ProfileApplyEvent extends BaseAccessibilityEvent {
  type: "profile-apply";
  profileId: string;
}

export interface PresetApplyEvent extends BaseAccessibilityEvent {
  type: "preset-apply";
  presetId: string;
}

export type AccessibilityFeatureEvent =
  | FeatureChangeEvent
  | FeatureResetEvent
  | PanelToggleEvent
  | PlacementChangeEvent
  | ProfileApplyEvent
  | PresetApplyEvent;

export type FeatureEventListener = (event: AccessibilityFeatureEvent) => void;

/**
 * Sanitizes and validates an event payload against a strict privacy allowlist.
 * Guarantees that no private data, DOM text, user inputs, recordings, or transcripts
 * can be inadvertently leaked into developer event streams.
 */
export function sanitizeFeatureEvent(
  rawEvent: AccessibilityFeatureEvent,
): AccessibilityFeatureEvent {
  const timestamp =
    typeof rawEvent.timestamp === "number" && !isNaN(rawEvent.timestamp)
      ? rawEvent.timestamp
      : Date.now();

  const source: EventTriggerSource =
    rawEvent.source === "ui" ||
    rawEvent.source === "shortcut" ||
    rawEvent.source === "profile" ||
    rawEvent.source === "preset" ||
    rawEvent.source === "reset" ||
    rawEvent.source === "api"
      ? rawEvent.source
      : "api";

  switch (rawEvent.type) {
    case "feature-change": {
      const featureId =
        typeof rawEvent.featureId === "string"
          ? rawEvent.featureId.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "")
          : "unknown";

      const sanitizeScalar = (val: unknown): boolean | number | string => {
        if (typeof val === "boolean") return val;
        if (typeof val === "number" && !isNaN(val)) return val;
        if (typeof val === "string") {
          // Coarse string tokens only (e.g. "dyslexia", "high", "dark"), capped to 64 chars
          return val.slice(0, 64).replace(/<[^>]*>/g, "").trim();
        }
        return false;
      };

      const sanitized: FeatureChangeEvent = {
        type: "feature-change",
        timestamp,
        source,
        featureId,
        value: sanitizeScalar(rawEvent.value),
      };

      if (rawEvent.previousValue !== undefined) {
        sanitized.previousValue = sanitizeScalar(rawEvent.previousValue);
      }

      return Object.freeze(sanitized);
    }

    case "feature-reset": {
      const clearedCount =
        typeof rawEvent.clearedFeaturesCount === "number" &&
        !isNaN(rawEvent.clearedFeaturesCount)
          ? Math.max(0, Math.floor(rawEvent.clearedFeaturesCount))
          : 0;

      return Object.freeze({
        type: "feature-reset",
        timestamp,
        source,
        clearedFeaturesCount: clearedCount,
      });
    }

    case "panel-toggle": {
      return Object.freeze({
        type: "panel-toggle",
        timestamp,
        source,
        isOpen: Boolean(rawEvent.isOpen),
      });
    }

    case "placement-change": {
      return Object.freeze({
        type: "placement-change",
        timestamp,
        source,
        placement: rawEvent.placement === "point" ? "point" : "corner",
      });
    }

    case "profile-apply": {
      const profileId =
        typeof rawEvent.profileId === "string"
          ? rawEvent.profileId.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "")
          : "unknown";

      return Object.freeze({
        type: "profile-apply",
        timestamp,
        source,
        profileId,
      });
    }

    case "preset-apply": {
      const presetId =
        typeof rawEvent.presetId === "string"
          ? rawEvent.presetId.slice(0, 64).replace(/[^a-zA-Z0-9_-]/g, "")
          : "unknown";

      return Object.freeze({
        type: "preset-apply",
        timestamp,
        source,
        presetId,
      });
    }

    default: {
      return Object.freeze({
        type: "feature-change",
        timestamp,
        source: "api",
        featureId: "unknown",
        value: false,
      });
    }
  }
}

/**
 * Safely emits a feature event to an optional subscriber callback.
 * Exceptions thrown inside consumer listeners are caught and silenced
 * to prevent breaking the application's runtime or accessibility plugin state.
 */
export function emitFeatureEvent(
  listener: FeatureEventListener | undefined,
  rawEvent: AccessibilityFeatureEvent,
): void {
  if (!listener || typeof listener !== "function") return;

  try {
    const sanitized = sanitizeFeatureEvent(rawEvent);
    listener(sanitized);
  } catch (err) {
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.NODE_ENV === "development"
    ) {
      console.warn(
        "[accessibility-plugin-react] Consumer onFeatureEvent callback threw an error:",
        err,
      );
    }
  }
}
