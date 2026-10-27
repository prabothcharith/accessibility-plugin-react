import { describe, expect, it } from "vitest";
import {
  enLocale,
  siLocale,
  taLocale,
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

  it("provides reviewed Sinhala (si / si-LK) strings with natural terminology and formatting", () => {
    expect(siLocale.title).toBe("ප්‍රවේශ්‍යතා සැකසුම්");
    expect(siLocale.description).toBe("ඔබේ කියවීමේ අත්දැකීම සකසා ගන්න");
    expect(siLocale.closeLabel).toBe("ප්‍රවේශ්‍යතා සැකසුම් වසන්න");
    expect(siLocale.skipToActions).toBe("ක්ෂණික ක්‍රියා වෙත මඟ හරින්න");
    expect(siLocale.skipToMain).toBe("ප්‍රධාන අන්තර්ගතය වෙත මඟ හරින්න");
    expect(siLocale.toolsLabel).toBe("ප්‍රවේශ්‍යතා මෙවලම්");
    expect(siLocale.quickActionsLabel).toBe("ක්ෂණික ක්‍රියා");
    expect(siLocale.resetLabel).toBe("සියලු ප්‍රවේශ්‍යතා සැකසුම් යළි සකසන්න");
    expect(siLocale.resetAll).toBe("සියල්ල යළි සකසන්න");
    expect(siLocale.statementLink).toBe("ප්‍රවේශ්‍යතා ප්‍රකාශය");
    expect(siLocale.openInNewTab).toBe("නව ටැබයක විවෘත වේ");
    expect(siLocale.buttonTitle).toBe("ප්‍රවේශ්‍යතාව");
    expect(siLocale.moveButton).toBe("බොත්තම ගෙනයන්න");
    expect(siLocale.positionLabel).toBe("බොත්තමේ පිහිටීම");
    expect(siLocale.buttonPositionSelectLabel).toBe(
      "ප්‍රවේශ්‍යතා බොත්තමේ පිහිටීම",
    );
    expect(siLocale.customPosition).toBe("අභිරුචි පිහිටීම");
    expect(siLocale.resetPosition).toBe("බොත්තමේ පිහිටීම යළි සකසන්න");
    expect(siLocale.doneMoving).toBe("චලනය අවසන්");
    expect(siLocale.largeControlsLabel).toBe("විශාල ප්‍රමාණයේ පාලන");

    // Position formatting
    expect(siLocale.formatPointPosition?.(0.3, 0.7)).toBe(
      "බොත්තමේ පිහිටීම: තිරස් අතට 30%, සිරස් අතට 70%.",
    );
    expect(siLocale.formatCornerPosition?.("bottom-right")).toBe(
      "බොත්තමේ පිහිටීම: පහළ දකුණ.",
    );
    expect(siLocale.formatCornerPosition?.("top-left")).toBe(
      "බොත්තමේ පිහිටීම: ඉහළ වම.",
    );

    // Search and announcements
    expect(siLocale.searchPlaceholder).toBe("මෙවලම් හෝ පැතිකඩ සොයන්න...");
    expect(siLocale.formatSearchCount?.(2, 8, "contrast")).toBe(
      'මෙවලම් 8 න් "contrast" ට ගැලපෙන 2 ක් පෙන්වයි',
    );
    expect(siLocale.formatSearchCount?.(8, 8)).toBe("සියලු මෙවලම් 8 ම පෙන්වයි");
    expect(siLocale.formatProfileApplied?.("Vision")).toBe(
      '✓ "Vision" පැතිකඩ සක්‍රිය කරන ලදී.',
    );
    expect(siLocale.formatPresetSaved?.("Night")).toBe(
      '"Night" පෙරසැකසුම සාර්ථකව සුරකින ලදී.',
    );

    // Feature labels
    expect(siLocale.features?.textScale).toBe("විශාල අකුරු");
    expect(siLocale.features?.contrast).toBe("වර්ණ වෙනස");
    expect(siLocale.features?.profiles).toBe("ප්‍රවේශ්‍යතා පැතිකඩ");
    expect(siLocale.features?.presets).toBe("සුරකින ලද පෙරසැකසුම්");
  });

  it("provides reviewed Tamil (ta / ta-LK) strings with natural terminology and formatting", () => {
    expect(taLocale.title).toBe("அணுகல்தன்மை அமைப்புகள்");
    expect(taLocale.description).toBe(
      "உங்கள் வாசிப்பு அனுபவத்தை மாற்றியமைக்கவும்",
    );
    expect(taLocale.closeLabel).toBe("அணுகல்தன்மை அமைப்புகளை மூடுக");
    expect(taLocale.skipToActions).toBe("விரைவுச் செயல்களுக்குச் செல்க");
    expect(taLocale.skipToMain).toBe("முக்கிய உள்ளடக்கத்திற்குச் செல்க");
    expect(taLocale.toolsLabel).toBe("அணுகல்தன்மை கருவிகள்");
    expect(taLocale.quickActionsLabel).toBe("விரைவுச் செயல்கள்");
    expect(taLocale.resetLabel).toBe(
      "அனைத்து அணுகல்தன்மை அமைப்புகளையும் மீட்டமை",
    );
    expect(taLocale.resetAll).toBe("அனைத்தையும் மீட்டமை");
    expect(taLocale.statementLink).toBe("அணுகல்தன்மை அறிக்கை");
    expect(taLocale.openInNewTab).toBe("புதிய தாவலில் திறக்கும்");
    expect(taLocale.buttonTitle).toBe("அணுகல்தன்மை");
    expect(taLocale.moveButton).toBe("பொத்தானை நகர்த்து");
    expect(taLocale.positionLabel).toBe("பொத்தான் அமைவிடம்");
    expect(taLocale.buttonPositionSelectLabel).toBe(
      "அணுகல்தன்மை பொத்தான் அமைவிடம்",
    );
    expect(taLocale.customPosition).toBe("தனிப்பயன் அமைவிடம்");
    expect(taLocale.resetPosition).toBe("பொத்தான் அமைவிடத்தை மீட்டமை");
    expect(taLocale.doneMoving).toBe("நகர்த்தல் முடிந்தது");
    expect(taLocale.largeControlsLabel).toBe("பெரிய விட்ஜெட் கட்டுப்பாடுகள்");

    // Position formatting
    expect(taLocale.formatPointPosition?.(0.4, 0.6)).toBe(
      "பொத்தான் அமைவிடம்: கிடைமட்டமாக 40%, செங்குத்தாக 60%.",
    );
    expect(taLocale.formatCornerPosition?.("bottom-left")).toBe(
      "பொத்தான் அமைவிடம்: கீழ் இடது.",
    );
    expect(taLocale.formatCornerPosition?.("top-right")).toBe(
      "பொத்தான் அமைவிடம்: மேல் வலது.",
    );

    // Search and announcements
    expect(taLocale.searchPlaceholder).toBe(
      "கருவிகள் அல்லது சுயவிவரங்களைத் தேடுக...",
    );
    expect(taLocale.formatSearchCount?.(3, 8, "text")).toBe(
      'மொத்தமுள்ள 8 கருவிகளில் "text" உடன் பொருந்தும் 3 காட்டப்படுகின்றன',
    );
    expect(taLocale.formatSearchCount?.(8, 8)).toBe(
      "அனைத்து 8 கருவிகளும் காட்டப்படுகின்றன",
    );
    expect(taLocale.formatProfileApplied?.("Reading")).toBe(
      '✓ "Reading" சுயவிவரம் செயல்படுத்தப்பட்டது.',
    );
    expect(taLocale.formatPresetSaved?.("Evening")).toBe(
      '"Evening" முன்னமைவு வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
    );

    // Feature labels
    expect(taLocale.features?.textScale).toBe("பெரிய உரை");
    expect(taLocale.features?.contrast).toBe("மாறுபட்ட வண்ணம்");
    expect(taLocale.features?.profiles).toBe("அணுகல்தன்மை சுயவிவரங்கள்");
    expect(taLocale.features?.presets).toBe("சேமிக்கப்பட்ட முன்னமைவுகள்");
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

  it("resolves Sinhala base and variant BCP47 tags", () => {
    expect(resolveLocaleStrings("si")).toBe(siLocale);
    expect(resolveLocaleStrings("si-LK")).toBe(siLocale);
    expect(resolveLocaleStrings("SI-lk")).toBe(siLocale);
    expect(resolveLocaleStrings("si-US")).toBe(siLocale);
  });

  it("resolves Tamil base and variant BCP47 tags", () => {
    expect(resolveLocaleStrings("ta")).toBe(taLocale);
    expect(resolveLocaleStrings("ta-LK")).toBe(taLocale);
    expect(resolveLocaleStrings("TA-lk")).toBe(taLocale);
    expect(resolveLocaleStrings("ta-IN")).toBe(taLocale);
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
    expect(isRtlLocale("si")).toBe(false);
    expect(isRtlLocale("si-LK")).toBe(false);
    expect(isRtlLocale("ta")).toBe(false);
    expect(isRtlLocale("ta-LK")).toBe(false);
    expect(isRtlLocale(undefined)).toBe(false);
  });
});
