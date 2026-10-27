import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import * as API from "../src/index";
import { composeFilter } from "../src/core/effects";
import {
  mapProfileSettingsToFeatures,
  mapFeaturesToProfileSettings,
} from "../src/core/profiles";

const initialMatchMedia = window.matchMedia;

function renderWithPlugin(ui: React.ReactNode, locale = "en") {
  const host = document.createElement("main");
  host.id = "host";
  host.innerHTML =
    '<h1>Sample Heading</h1><p>Sample paragraph</p><div role="img" aria-label="Sample Chart">Data Visual</div>';
  document.body.appendChild(host);

  const view = render(
    <API.AccessibilityPlugin locale={locale}>
      <API.AccessibilityButton />
      <API.AccessibilityList>
        {ui}
        <API.ResetController />
      </API.AccessibilityList>
    </API.AccessibilityPlugin>,
  );

  const buttonName = locale.startsWith("si")
    ? "ප්‍රවේශ්‍යතාව"
    : locale.startsWith("ta")
      ? "அணுகல்தன்மை"
      : "Accessibility";

  fireEvent.click(screen.getByRole("button", { name: buttonName }));

  return { ...view, host };
}

describe("A11Y-402: Saturation and Grayscale Modes", () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = initialMatchMedia;
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    window.matchMedia = initialMatchMedia;
    vi.restoreAllMocks();
  });

  it("renders SaturationController with Off, Low, High, and Grayscale segments by default", () => {
    renderWithPlugin(<API.SaturationController />);

    const group = screen.getByRole("group", { name: "Saturation" });
    expect(group).toBeTruthy();

    const buttons = within(group).getAllByRole("button");
    expect(buttons).toHaveLength(4);
    expect(buttons[0]).toHaveTextContent("Off");
    expect(buttons[1]).toHaveTextContent("Low");
    expect(buttons[2]).toHaveTextContent("High");
    expect(buttons[3]).toHaveTextContent("Grayscale");

    // By default, Off is active (value === 0)
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[3]).toHaveAttribute("aria-pressed", "false");
  });

  it("respects includeGrayscale=false prop", () => {
    renderWithPlugin(<API.SaturationController includeGrayscale={false} />);

    const group = screen.getByRole("group", { name: "Saturation" });
    const buttons = within(group).getAllByRole("button");
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent("Off");
    expect(buttons[1]).toHaveTextContent("Low");
    expect(buttons[2]).toHaveTextContent("High");
    expect(within(group).queryByText("Grayscale")).toBeNull();
  });

  it("applies Low saturation (saturate(0.2)) and displays chart/indicator advisory", () => {
    const { host } = renderWithPlugin(<API.SaturationController />);

    const group = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(group).getByText("Low"));

    expect(host.style.filter).toContain("saturate(0.2)");

    // Advisory warning should appear
    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "Low saturation reduces color differences. Color-coded charts and indicators may be harder to distinguish.",
    );
  });

  it("applies High saturation (saturate(2)) and displays visual glare advisory", () => {
    const { host } = renderWithPlugin(<API.SaturationController />);

    const group = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(group).getByText("High"));

    expect(host.style.filter).toContain("saturate(2)");

    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "High saturation increases color intensity (200%), which may cause visual glare or color clipping.",
    );
  });

  it("applies Grayscale mode (grayscale(1)) via SaturationController and displays advisory", () => {
    const { host } = renderWithPlugin(<API.SaturationController />);

    const group = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(group).getByText("Grayscale"));

    expect(host.style.filter).toContain("grayscale(1)");

    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "Grayscale removes all color. Visualizations and charts relying on color alone may require alternative labels.",
    );
  });

  it("clears saturation filter when Off is selected", () => {
    const { host } = renderWithPlugin(<API.SaturationController />);

    const group = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(group).getByText("Low"));
    expect(host.style.filter).toContain("saturate(0.2)");

    fireEvent.click(within(group).getByText("Off"));
    expect(host.style.filter).toBe("");
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("instantly clears filters when Reset All is clicked without leaving stale styles", () => {
    const { host } = renderWithPlugin(
      <>
        <API.SaturationController />
        <API.GrayscaleController />
      </>,
    );

    const satGroup = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(satGroup).getByText("High"));
    fireEvent.click(screen.getByRole("button", { name: "Grayscale" }));

    expect(host.style.filter).toContain("saturate(2)");
    expect(host.style.filter).toContain("grayscale(1)");

    // Instant reset
    fireEvent.click(screen.getByText("Reset All"));
    expect(host.style.filter).toBe("");
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("showAdvisory=false suppresses advisory warning in SaturationController", () => {
    renderWithPlugin(<API.SaturationController showAdvisory={false} />);

    const group = screen.getByRole("group", { name: "Saturation" });
    fireEvent.click(within(group).getByText("Low"));
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("GrayscaleController toggles grayscale and displays advisory", () => {
    const { host } = renderWithPlugin(<API.GrayscaleController />);

    const toggle = screen.getByRole("button", { name: "Grayscale" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(host.style.filter).toContain("grayscale(1)");

    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "Grayscale removes all color. Visualizations and charts relying on color alone may require alternative labels.",
    );

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(host.style.filter).toBe("");
    expect(screen.queryByRole("note")).toBeNull();
  });

  it("bypasses saturation and grayscale filters when forced-colors is active", () => {
    // Mock forced-colors: active
    window.matchMedia = vi.fn().mockImplementation((query: string) => {
      if (query.includes("forced-colors: active")) {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        };
      }
      return initialMatchMedia
        ? initialMatchMedia(query)
        : {
            matches: false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
          };
    });

    // composeFilter returns "" immediately
    expect(composeFilter({ saturation: 1, grayscale: true })).toBe("");

    renderWithPlugin(
      <>
        <API.SaturationController />
        <API.GrayscaleController />
      </>,
    );

    const notices = screen.getAllByText(
      "Operating system high contrast (forced colors) is active. Filter effects are bypassed to preserve OS contrast.",
    );
    expect(notices).toHaveLength(2);
    expect(notices[0]).toHaveAttribute("role", "status");
  });

  it("renders localized labels and warnings in Sinhala (si-LK)", () => {
    renderWithPlugin(<API.SaturationController />, "si-LK");

    const group = screen.getByRole("group", { name: "සන්තෘප්තිය" });
    expect(group).toBeTruthy();

    const buttons = within(group).getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("අක්‍රියයි");
    expect(buttons[1]).toHaveTextContent("අඩු");
    expect(buttons[2]).toHaveTextContent("ඉහළ");
    expect(buttons[3]).toHaveTextContent("අළු පැහැ");

    // Click low
    fireEvent.click(buttons[1]);
    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "අඩු සන්තෘප්තිය වර්ණ වෙනස්කම් අඩු කරයි. ප්‍රස්තාර සහ වර්ණ සංකේත වෙන්කර හඳුනා ගැනීම අපහසු විය හැක.",
    );
  });

  it("renders localized labels and warnings in Tamil (ta-LK)", () => {
    renderWithPlugin(<API.SaturationController />, "ta-LK");

    const group = screen.getByRole("group", { name: "நிறச்செறிவூட்டல்" });
    expect(group).toBeTruthy();

    const buttons = within(group).getAllByRole("button");
    expect(buttons[0]).toHaveTextContent("முடக்கு");
    expect(buttons[1]).toHaveTextContent("குறைந்த");
    expect(buttons[2]).toHaveTextContent("அதிக");

    // Click high
    fireEvent.click(buttons[2]);
    const advisory = screen.getByRole("note");
    expect(advisory).toHaveTextContent(
      "அதிக நிறச்செறிவூட்டல் வண்ணத் தீவிரத்தை (200%) அதிகரிக்கிறது, இது கண் கூச்சம் அல்லது நிறச் சிதைவை ஏற்படுத்தலாம்.",
    );
  });

  it("correctly maps between profiles and live saturation preferences", () => {
    // 1. mapProfileSettingsToFeatures
    expect(mapProfileSettingsToFeatures({ saturation: "low" }).saturation).toBe(
      1,
    );
    expect(
      mapProfileSettingsToFeatures({ saturation: "high" }).saturation,
    ).toBe(2);
    expect(
      mapProfileSettingsToFeatures({ saturation: "grayscale" }).saturation,
    ).toBe(3);
    expect(
      mapProfileSettingsToFeatures({ saturation: "original" }).saturation,
    ).toBe(0);

    // 2. mapFeaturesToProfileSettings
    expect(mapFeaturesToProfileSettings({ saturation: 1 }).saturation).toBe(
      "low",
    );
    expect(mapFeaturesToProfileSettings({ saturation: 2 }).saturation).toBe(
      "high",
    );
    expect(mapFeaturesToProfileSettings({ saturation: 3 }).saturation).toBe(
      "grayscale",
    );
    expect(mapFeaturesToProfileSettings({ grayscale: true }).saturation).toBe(
      "grayscale",
    );
    expect(mapFeaturesToProfileSettings({ saturation: 0 }).saturation).toBe(
      "original",
    );
  });
});
