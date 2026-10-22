import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  AccessibilityButton,
  AccessibilityList,
  AccessibilityPlugin,
  registerLocale,
  type LocaleStrings,
  enLocale,
} from "../src";

afterEach(() => {
  cleanup();
});

describe("Accessibility Statement link and oversized controls", () => {
  it("renders statementUrl when provided", () => {
    render(
      <AccessibilityPlugin statementUrl="https://example.com/accessibility-statement">
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    const statementLink = screen.getByRole("link", {
      name: /Accessibility Statement/i,
    });
    expect(statementLink).toBeInTheDocument();
    expect(statementLink).toHaveAttribute(
      "href",
      "https://example.com/accessibility-statement",
    );
    expect(statementLink).toHaveAttribute("target", "_blank");
    expect(statementLink).toHaveAttribute("rel", "noopener noreferrer");
    expect(statementLink).toHaveTextContent("opens in a new tab");
  });

  it("does not render statement link when statementUrl is undefined or not provided", () => {
    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    expect(
      screen.queryByRole("link", { name: /Accessibility Statement/i }),
    ).toBeNull();
  });

  it("applies large controls data attributes to button and panel", () => {
    render(
      <AccessibilityPlugin largeControls={true}>
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );

    const trigger = screen.getByRole("button", { name: "Accessibility" });
    expect(trigger).toHaveAttribute("data-large-controls", "true");

    fireEvent.click(trigger);

    const panel = screen.getByRole("region");
    expect(panel).toHaveAttribute("data-large-controls", "true");
  });

  it("applies locale, lang, dir, and translate attributes on panel", () => {
    const arLocale: LocaleStrings = {
      ...enLocale,
      title: "إعدادات إمكانية الوصول",
      closeLabel: "إغلاق الإعدادات",
    };
    registerLocale("ar", arLocale);

    render(
      <AccessibilityPlugin locale="ar">
        <AccessibilityButton />
        <AccessibilityList children={null} />
      </AccessibilityPlugin>,
    );

    const trigger = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(trigger);

    const panel = screen.getByRole("region");
    expect(panel).toHaveAttribute("lang", "ar");
    expect(panel).toHaveAttribute("dir", "rtl");
    expect(panel).toHaveAttribute("translate", "no");
    expect(
      screen.getByRole("heading", { name: "إعدادات إمكانية الوصول" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "إغلاق الإعدادات" }),
    ).toBeInTheDocument();
  });
});
