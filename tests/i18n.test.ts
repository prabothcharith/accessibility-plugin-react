import { describe, expect, it } from "vitest";
import {
  enLocale,
  isRtlLocale,
  registerLocale,
  resolveLocaleStrings,
  type LocaleStrings,
} from "../src/core/i18n";

describe("i18n infrastructure", () => {
  it("provides complete baseline English strings", () => {
    expect(enLocale.title).toBe("Accessibility settings");
    expect(enLocale.description).toBe("Adjust your reading experience");
    expect(enLocale.closeLabel).toBe("Close accessibility settings");
    expect(enLocale.skipToActions).toBe("Jump to quick actions");
    expect(enLocale.toolsLabel).toBe("Accessibility tools");
    expect(enLocale.quickActionsLabel).toBe("Quick actions");
    expect(enLocale.resetLabel).toBe("Reset all accessibility settings");
    expect(enLocale.resetAll).toBe("Reset All");
    expect(enLocale.statementLink).toBe("Accessibility Statement");
    expect(enLocale.openInNewTab).toBe("opens in a new tab");
    expect(enLocale.buttonTitle).toBe("Accessibility");
    expect(enLocale.moveButton).toBe("Move button");
    expect(enLocale.positionLabel).toBe("Button position");
    expect(enLocale.buttonPositionSelectLabel).toBe(
      "Accessibility button position",
    );
    expect(enLocale.largeControlsLabel).toBe("Oversized widget controls");
    expect(enLocale.formatPointPosition?.(0.25, 0.75)).toBe(
      "Button position: 25% horizontally, 75% vertically.",
    );
    expect(enLocale.formatCornerPosition?.("bottom-left")).toBe(
      "Button position: bottom left.",
    );
  });

  it("resolves default English strings when no locale or html lang is present", () => {
    const strings = resolveLocaleStrings();
    expect(strings.title).toBe("Accessibility settings");
    expect(strings.closeLabel).toBe("Close accessibility settings");
  });

  it("resolves English base when full BCP47 English variant tag is passed", () => {
    const strings = resolveLocaleStrings("en-US");
    expect(strings.title).toBe("Accessibility settings");

    const gbStrings = resolveLocaleStrings("en-GB");
    expect(gbStrings.closeLabel).toBe("Close accessibility settings");
  });

  it("falls back to English when an unknown locale is requested", () => {
    const strings = resolveLocaleStrings("xx-YY");
    expect(strings).toBe(enLocale);
  });

  it("allows registering and resolving a custom locale pack", () => {
    const customFr: LocaleStrings = {
      ...enLocale,
      title: "Paramètres d'accessibilité",
      closeLabel: "Fermer les paramètres d'accessibilité",
      resetAll: "Tout réinitialiser",
    };

    registerLocale("fr", customFr);
    const resolved = resolveLocaleStrings("fr-FR");
    expect(resolved.title).toBe("Paramètres d'accessibilité");
    expect(resolved.closeLabel).toBe("Fermer les paramètres d'accessibilité");
    expect(resolved.resetAll).toBe("Tout réinitialiser");
  });

  it("detects RTL locales correctly", () => {
    expect(isRtlLocale("ar")).toBe(true);
    expect(isRtlLocale("ar-SA")).toBe(true);
    expect(isRtlLocale("he")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("ur")).toBe(true);
    expect(isRtlLocale("en")).toBe(false);
    expect(isRtlLocale("en-US")).toBe(false);
    expect(isRtlLocale("si-LK")).toBe(false);
    expect(isRtlLocale(undefined)).toBe(false);
  });
});
