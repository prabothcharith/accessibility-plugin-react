import { describe, expect, it, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  ResetController,
  TextScaleController,
  ProfilesController,
  PresetsController,
  SearchCount,
  EmptyState,
} from "../src";

describe("A11Y-306: Sinhala and Tamil locale packs with accessibility review", () => {
  const originalLang = document.documentElement.lang;

  afterEach(() => {
    document.documentElement.lang = originalLang;
  });

  it("renders full widget in Sinhala (si-LK) with natural phrasing, correct attributes, and untranslated host content", () => {
    render(
      <main id="host-content">
        <h1>Welcome to our Government Portal</h1>
        <p>This is official citizen information and services.</p>
        <AccessibilityPlugin locale="si-LK">
          <AccessibilityButton />
          <AccessibilityList statementUrl="https://example.gov.lk/accessibility">
            <TextScaleController />
            <ProfilesController />
            <PresetsController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </main>,
    );

    // 1. Verify host content remains completely untouched and NOT translated
    expect(
      screen.getByRole("heading", { name: "Welcome to our Government Portal" }),
    ).toBeVisible();
    expect(
      screen.getByText("This is official citizen information and services."),
    ).toBeVisible();

    // 2. Trigger launcher button verification
    const trigger = screen.getByRole("button", { name: "ප්‍රවේශ්‍යතාව" });
    expect(trigger).toHaveAttribute("aria-label", "ප්‍රවේශ්‍යතාව");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Open panel
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // 3. Panel container attributes
    const panel = screen.getByRole("region", { name: "ප්‍රවේශ්‍යතා සැකසුම්" });
    expect(panel).toHaveAttribute("lang", "si-LK");
    expect(panel).toHaveAttribute("dir", "ltr");
    expect(panel).toHaveAttribute("translate", "no");

    // 4. Panel heading and description
    expect(
      screen.getByRole("heading", { name: "ප්‍රවේශ්‍යතා සැකසුම්" }),
    ).toBeVisible();
    expect(screen.getByText("ඔබේ කියවීමේ අත්දැකීම සකසා ගන්න")).toBeVisible();
    expect(
      screen.getByRole("button", { name: "ප්‍රවේශ්‍යතා සැකසුම් වසන්න" }),
    ).toBeVisible();

    // 5. Skip to actions button
    expect(
      screen.getByRole("button", { name: "ක්ෂණික ක්‍රියා වෙත මඟ හරින්න" }),
    ).toBeVisible();

    // 6. Tools group and quick actions group
    expect(
      screen.getByRole("group", { name: "ප්‍රවේශ්‍යතා මෙවලම්" }),
    ).toBeVisible();
    expect(screen.getByRole("group", { name: "ක්ෂණික ක්‍රියා" })).toBeVisible();

    // 7. Reset controller
    expect(
      screen.getByRole("button", { name: "සියල්ල යළි සකසන්න" }),
    ).toBeVisible();

    // 8. Position controls and localized corner names
    const moveBtn = screen.getByRole("button", { name: "බොත්තම ගෙනයන්න" });
    expect(moveBtn).toBeVisible();
    fireEvent.click(moveBtn);

    const cornerSelect = screen.getByRole("combobox", {
      name: "ප්‍රවේශ්‍යතා බොත්තමේ පිහිටීම",
    });
    expect(cornerSelect).toBeVisible();
    expect(
      screen.getByRole("option", { name: "පහළ දකුණ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "පහළ වම" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "ඉහළ දකුණ" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "ඉහළ වම" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ප්‍රවේශ්‍යතා බොත්තම වමට ගෙනයන්න" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "ප්‍රවේශ්‍යතා බොත්තම ඉහළට ගෙනයන්න" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "ප්‍රවේශ්‍යතා බොත්තම පහළට ගෙනයන්න" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "ප්‍රවේශ්‍යතා බොත්තම දකුණට ගෙනයන්න" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "බොත්තමේ පිහිටීම යළි සකසන්න" }),
    ).toBeVisible();
    expect(screen.getByRole("button", { name: "චලනය අවසන්" })).toBeVisible();

    // 9. Feature controllers automatically adopt Sinhala default labels
    expect(screen.getByRole("group", { name: "විශාල අකුරු" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "අකුරු ප්‍රමාණය අඩු කරන්න" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "අකුරු ප්‍රමාණය වැඩි කරන්න" }),
    ).toBeVisible();

    expect(
      screen.getByRole("group", { name: "ප්‍රවේශ්‍යතා පැතිකඩ" }),
    ).toBeVisible();
    expect(
      screen.getByRole("group", { name: "සුරකින ලද පෙරසැකසුම්" }),
    ).toBeVisible();

    // 10. Statement link
    expect(
      screen.getByRole("link", { name: /ප්‍රවේශ්‍යතා ප්‍රකාශය/ }),
    ).toHaveAttribute("href", "https://example.gov.lk/accessibility");
  });

  it("renders full widget in Tamil (ta-LK) with natural phrasing, correct attributes, and untranslated host content", () => {
    render(
      <main id="host-content">
        <h1>Official Public Services</h1>
        <p>Accessible government services for all citizens.</p>
        <AccessibilityPlugin locale="ta-LK">
          <AccessibilityButton />
          <AccessibilityList statementUrl="https://example.gov.lk/accessibility-ta">
            <TextScaleController />
            <ProfilesController />
            <PresetsController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </main>,
    );

    // 1. Verify host content remains completely untouched and NOT translated
    expect(
      screen.getByRole("heading", { name: "Official Public Services" }),
    ).toBeVisible();
    expect(
      screen.getByText("Accessible government services for all citizens."),
    ).toBeVisible();

    // 2. Trigger launcher button verification
    const trigger = screen.getByRole("button", { name: "அணுகல்தன்மை" });
    expect(trigger).toHaveAttribute("aria-label", "அணுகல்தன்மை");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Open panel
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // 3. Panel container attributes
    const panel = screen.getByRole("region", {
      name: "அணுகல்தன்மை அமைப்புகள்",
    });
    expect(panel).toHaveAttribute("lang", "ta-LK");
    expect(panel).toHaveAttribute("dir", "ltr");
    expect(panel).toHaveAttribute("translate", "no");

    // 4. Panel heading and description
    expect(
      screen.getByRole("heading", { name: "அணுகல்தன்மை அமைப்புகள்" }),
    ).toBeVisible();
    expect(
      screen.getByText("உங்கள் வாசிப்பு அனுபவத்தை மாற்றியமைக்கவும்"),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "அணுகல்தன்மை அமைப்புகளை மூடுக" }),
    ).toBeVisible();

    // 5. Skip to actions button
    expect(
      screen.getByRole("button", { name: "விரைவுச் செயல்களுக்குச் செல்க" }),
    ).toBeVisible();

    // 6. Tools group and quick actions group
    expect(
      screen.getByRole("group", { name: "அணுகல்தன்மை கருவிகள்" }),
    ).toBeVisible();
    expect(
      screen.getByRole("group", { name: "விரைவுச் செயல்கள்" }),
    ).toBeVisible();

    // 7. Reset controller
    expect(
      screen.getByRole("button", { name: "அனைத்தையும் மீட்டமை" }),
    ).toBeVisible();

    // 8. Position controls and localized corner names
    const moveBtn = screen.getByRole("button", { name: "பொத்தானை நகர்த்து" });
    expect(moveBtn).toBeVisible();
    fireEvent.click(moveBtn);

    const cornerSelect = screen.getByRole("combobox", {
      name: "அணுகல்தன்மை பொத்தான் அமைவிடம்",
    });
    expect(cornerSelect).toBeVisible();
    expect(
      screen.getByRole("option", { name: "கீழ் வலது" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "கீழ் இடது" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "மேல் வலது" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "மேல் இடது" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "அணுகல்தன்மை பொத்தானை இடதுபுறம் நகர்த்து",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "அணுகல்தன்மை பொத்தானை மேலே நகர்த்து",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "அணுகல்தன்மை பொத்தானை கீழே நகர்த்து",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "அணுகல்தன்மை பொத்தானை வலதுபுறம் நகர்த்து",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "பொத்தான் அமைவிடத்தை மீட்டமை" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "நகர்த்தல் முடிந்தது" }),
    ).toBeVisible();

    // 9. Feature controllers automatically adopt Tamil default labels
    expect(screen.getByRole("group", { name: "பெரிய உரை" })).toBeVisible();
    expect(
      screen.getByRole("button", { name: "உரை அளவைக் குறைக்கவும்" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "உரை அளவை அதிகரிக்கவும்" }),
    ).toBeVisible();

    expect(
      screen.getByRole("group", { name: "அணுகல்தன்மை சுயவிவரங்கள்" }),
    ).toBeVisible();
    expect(
      screen.getByRole("group", { name: "சேமிக்கப்பட்ட முன்னமைவுகள்" }),
    ).toBeVisible();

    // 10. Statement link
    expect(
      screen.getByRole("link", { name: /அணுகல்தன்மை அறிக்கை/ }),
    ).toHaveAttribute("href", "https://example.gov.lk/accessibility-ta");
  });

  it("automatically infers Sinhala from html lang='si-LK' without explicit locale prop", () => {
    document.documentElement.lang = "si-LK";

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const trigger = screen.getByRole("button", { name: "ප්‍රවේශ්‍යතාව" });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("heading", { name: "ප්‍රවේශ්‍යතා සැකසුම්" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "සියල්ල යළි සකසන්න" }),
    ).toBeVisible();
  });

  it("automatically infers Tamil from html lang='ta-LK' without explicit locale prop", () => {
    document.documentElement.lang = "ta-LK";

    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const trigger = screen.getByRole("button", { name: "அணுகல்தன்மை" });
    fireEvent.click(trigger);

    expect(
      screen.getByRole("heading", { name: "அணுகல்தன்மை அமைப்புகள்" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "அனைத்தையும் மீட்டமை" }),
    ).toBeVisible();
  });

  it("localizes SearchCount and EmptyState status announcements for Sinhala and Tamil", () => {
    // Sinhala SearchCount
    const { rerender } = render(
      <SearchCount
        totalCount={8}
        matchedCount={3}
        query="contrast"
        locale="si-LK"
      />,
    );
    expect(
      screen.getByText('මෙවලම් 8 න් "contrast" ට ගැලපෙන 3 ක් පෙන්වයි'),
    ).toHaveAttribute("role", "status");

    // Tamil SearchCount
    rerender(
      <SearchCount
        totalCount={8}
        matchedCount={3}
        query="contrast"
        locale="ta-LK"
      />,
    );
    expect(
      screen.getByText(
        'மொத்தமுள்ள 8 கருவிகளில் "contrast" உடன் பொருந்தும் 3 காட்டப்படுகின்றன',
      ),
    ).toHaveAttribute("role", "status");

    // Sinhala EmptyState
    rerender(<EmptyState locale="si-LK" />);
    expect(screen.getByText("ගැලපෙන මෙවලම් හමු නොවීය")).toBeVisible();
    expect(
      screen.getByText(
        "වෙනත් සෙවුම් පදයක් භාවිතා කර බලන්න හෝ පෙරහන් යළි සකසන්න.",
      ),
    ).toBeVisible();

    // Tamil EmptyState
    rerender(<EmptyState locale="ta-LK" />);
    expect(
      screen.getByText("பொருந்தும் கருவிகள் எதுவும் கிடைக்கவில்லை"),
    ).toBeVisible();
    expect(
      screen.getByText(
        "வேறு தேடல் வார்த்தையை முயற்சிக்கவும் அல்லது வடிப்பான்களை மீட்டமைக்கவும்.",
      ),
    ).toBeVisible();
  });

  it("guarantees RTL infrastructure applies dir='rtl' for RTL languages while preserving LTR for Sinhala and Tamil", () => {
    // 1. Sinhala is LTR
    const { rerender } = render(
      <AccessibilityPlugin locale="si-LK">
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );
    const triggerSi = screen.getByRole("button", { name: "ප්‍රවේශ්‍යතාව" });
    fireEvent.click(triggerSi);
    const panelSi = screen.getByRole("region", {
      name: "ප්‍රවේශ්‍යතා සැකසුම්",
    });
    expect(panelSi).toHaveAttribute("dir", "ltr");

    // 2. Tamil is LTR
    rerender(
      <AccessibilityPlugin locale="ta-LK">
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );
    const panelTa = screen.getByRole("region", {
      name: "அணுகல்தன்மை அமைப்புகள்",
    });
    expect(panelTa).toHaveAttribute("dir", "ltr");

    // 3. Arabic is RTL
    rerender(
      <AccessibilityPlugin locale="ar">
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );
    const panelAr = screen.getByRole("region");
    expect(panelAr).toHaveAttribute("dir", "rtl");
  });
});
