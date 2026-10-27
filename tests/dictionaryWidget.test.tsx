import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  screen,
  fireEvent,
  cleanup,
  waitFor,
  within,
} from "@testing-library/react";
import * as A from "../src";
import { renderFeatures } from "./helpers";

describe("A11Y-403: DictionaryController Component", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
    document.body.innerHTML = "";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("renders trigger button with correct attributes and labels", () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });
    expect(trigger).toBeDefined();
    expect(trigger.getAttribute("data-arap-feature")).toBe("dictionary");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("opens modal dialog and focuses search input upon trigger click", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    const input = screen.getByRole("searchbox");
    await waitFor(() => {
      expect(document.activeElement).toBe(input);
    });
  });

  it("closes dialog and returns focus to trigger button when Escape key is pressed", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    expect(screen.getByRole("dialog")).toBeDefined();

    // Press Escape inside dialog
    fireEvent.keyDown(document, { key: "Escape" });

    // Dialog should be unmounted/closed
    expect(screen.queryByRole("dialog")).toBeNull();

    // Focus returns to trigger button
    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("closes dialog and returns focus to trigger button when Close button is clicked", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    const closeBtn = screen.getByRole("button", { name: /close dictionary/i });

    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).toBeNull();

    await waitFor(() => {
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("performs local lookup with ZERO network requests and displays definition", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("searchbox");
    const submitBtn = within(dialog).getByRole("button", {
      name: /^look up$/i,
    });

    fireEvent.change(input, { target: { value: "accessibility" } });
    fireEvent.click(submitBtn);

    // Verify definition is displayed
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: /accessibility/i }),
      ).toBeDefined();
      expect(screen.getByText(/Built-in Glossary/i)).toBeDefined();
      expect(
        screen.getByText(/The practice of designing software/i),
      ).toBeDefined();
    });

    // Acceptance requirement: ZERO network requests when provider is off
    expect(fetch).not.toHaveBeenCalled();
  });

  it("truthfully handles unknown words and allows clicking suggestions", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("searchbox");

    // Search for unknown term that generates suggestions
    fireEvent.change(input, { target: { value: "access" } });
    fireEvent.click(within(dialog).getByRole("button", { name: /^look up$/i }));

    await waitFor(() => {
      expect(within(dialog).getByRole("alert")).toBeDefined();
      expect(
        within(dialog).getAllByText(/No definition found for "access"/i).length,
      ).toBeGreaterThan(0);
      expect(
        within(dialog).getByRole("button", { name: "accessibility" }),
      ).toBeDefined();
    });

    // Click suggestion chip
    fireEvent.click(
      within(dialog).getByRole("button", { name: "accessibility" }),
    );

    await waitFor(() => {
      expect(
        within(dialog).getByRole("heading", {
          level: 3,
          name: /accessibility/i,
        }),
      ).toBeDefined();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  it("clears search input and results when clear button is clicked", async () => {
    renderFeatures(<A.DictionaryController />);
    const trigger = screen.getByRole("button", {
      name: /dictionary/i,
    });

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog");
    const input = screen.getByRole("searchbox");
    const submitBtn = within(dialog).getByRole("button", {
      name: /^look up$/i,
    });

    fireEvent.change(input, { target: { value: "focus" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 3, name: /focus/i }),
      ).toBeDefined();
    });

    const clearBtn = screen.getByRole("button", { name: /clear word/i });
    fireEvent.click(clearBtn);

    expect((input as HTMLInputElement).value).toBe("");
    expect(
      screen.queryByRole("heading", { level: 3, name: /focus/i }),
    ).toBeNull();
  });
});
