import { describe, expect, it, vi } from "vitest";
import {
  sanitizeFeatureEvent,
  emitFeatureEvent,
  type AccessibilityFeatureEvent,
} from "../src/core/events";

describe("Privacy-Safe Feature Event Callbacks (A11Y-406)", () => {
  describe("sanitizeFeatureEvent", () => {
    it("preserves legitimate scalar values and canonical feature IDs", () => {
      const raw: AccessibilityFeatureEvent = {
        type: "feature-change",
        timestamp: 1700000000000,
        source: "ui",
        featureId: "fontSize",
        value: 120,
        previousValue: 100,
      };

      const sanitized = sanitizeFeatureEvent(raw);
      expect(sanitized.type).toBe("feature-change");
      expect(sanitized.timestamp).toBe(1700000000000);
      expect(sanitized.source).toBe("ui");
      if (sanitized.type === "feature-change") {
        expect(sanitized.featureId).toBe("fontSize");
        expect(sanitized.value).toBe(120);
        expect(sanitized.previousValue).toBe(100);
      }
    });

    it("freezes the returned payload to prevent recipient mutation", () => {
      const raw: AccessibilityFeatureEvent = {
        type: "panel-toggle",
        timestamp: Date.now(),
        source: "ui",
        isOpen: true,
      };

      const sanitized = sanitizeFeatureEvent(raw);
      expect(Object.isFrozen(sanitized)).toBe(true);
    });

    it("strictly strips extraneous private properties, text, transcripts, and credentials", () => {
      // Craft an event containing malicious/inadvertent text or private data
      const untypedWithLeak = {
        type: "feature-change",
        timestamp: Date.now(),
        source: "ui",
        featureId: "readingGuide",
        value: true,
        // Forbidden fields:
        userPageText: "Sensitive medical or financial text from article",
        userSelection: "Private user highlight",
        transcript: "Voice navigation speech recording audio data",
        authToken: "Bearer eyJhbGciOi...",
      } as unknown as AccessibilityFeatureEvent;

      const sanitized = sanitizeFeatureEvent(untypedWithLeak);
      expect(sanitized).not.toHaveProperty("userPageText");
      expect(sanitized).not.toHaveProperty("userSelection");
      expect(sanitized).not.toHaveProperty("transcript");
      expect(sanitized).not.toHaveProperty("authToken");
    });

    it("sanitizes string values to prevent arbitrary HTML or script injection", () => {
      const raw: AccessibilityFeatureEvent = {
        type: "feature-change",
        timestamp: Date.now(),
        source: "ui",
        featureId: "fontFamily",
        value: "<script>alert(1)</script>dyslexia",
      };

      const sanitized = sanitizeFeatureEvent(raw);
      if (sanitized.type === "feature-change") {
        expect(sanitized.value).not.toContain("<script>");
        expect(sanitized.value).toBe("alert(1)dyslexia");
      }
    });

    it("correctly sanitizes feature-reset events with coarse count only", () => {
      const raw: AccessibilityFeatureEvent = {
        type: "feature-reset",
        timestamp: 1700000000000,
        source: "reset",
        clearedFeaturesCount: 5.8,
      };

      const sanitized = sanitizeFeatureEvent(raw);
      expect(sanitized.type).toBe("feature-reset");
      if (sanitized.type === "feature-reset") {
        expect(sanitized.clearedFeaturesCount).toBe(5);
      }
    });

    it("sanitizes profile-apply and preset-apply events", () => {
      const profileEvent: AccessibilityFeatureEvent = {
        type: "profile-apply",
        timestamp: Date.now(),
        source: "profile",
        profileId: "motor-impaired",
      };
      const sanitizedProfile = sanitizeFeatureEvent(profileEvent);
      if (sanitizedProfile.type === "profile-apply") {
        expect(sanitizedProfile.profileId).toBe("motor-impaired");
      }

      const presetEvent: AccessibilityFeatureEvent = {
        type: "preset-apply",
        timestamp: Date.now(),
        source: "preset",
        presetId: "custom-night-reader",
      };
      const sanitizedPreset = sanitizeFeatureEvent(presetEvent);
      if (sanitizedPreset.type === "preset-apply") {
        expect(sanitizedPreset.presetId).toBe("custom-night-reader");
      }
    });
  });

  describe("emitFeatureEvent Error Safety", () => {
    it("invokes listener with sanitized payload", () => {
      const listener = vi.fn();
      emitFeatureEvent(listener, {
        type: "panel-toggle",
        timestamp: 123456,
        source: "ui",
        isOpen: true,
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith({
        type: "panel-toggle",
        timestamp: 123456,
        source: "ui",
        isOpen: true,
      });
    });

    it("catches listener exceptions without crashing or throwing", () => {
      const throwingListener = () => {
        throw new Error("Consumer analytics crash!");
      };

      expect(() => {
        emitFeatureEvent(throwingListener, {
          type: "panel-toggle",
          timestamp: 123456,
          source: "ui",
          isOpen: false,
        });
      }).not.toThrow();
    });

    it("does nothing when listener is undefined", () => {
      expect(() => {
        emitFeatureEvent(undefined, {
          type: "panel-toggle",
          timestamp: 123456,
          source: "ui",
          isOpen: false,
        });
      }).not.toThrow();
    });
  });
});
