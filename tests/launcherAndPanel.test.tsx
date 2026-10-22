import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import * as API from "../src";
import { Widget } from "./helpers";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.useRealTimers();
});

describe("A11Y-104 Accessible launcher and non-modal widget panel", () => {
  it("provides native-control launcher with accurate aria-expanded, aria-controls, and description", () => {
    render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    const trigger = screen.getByLabelText("Accessibility");
    expect(trigger.tagName.toLowerCase()).toBe("button");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    const controlsId = trigger.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();

    // Trigger has aria-describedby for drag/keyboard shortcuts
    const describedBy = trigger.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    const descEl = document.getElementById(describedBy!);
    expect(descEl).not.toBeNull();
    expect(descEl?.textContent).toContain("Alt and arrow keys");

    // Click to open
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    const panel = screen.getByRole("region");
    expect(panel.id).toBe(controlsId);

    // Click to close
    fireEvent.click(screen.getByLabelText("Close accessibility settings"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("sets meaningful focus on open, restores focus to trigger on Escape or close button", () => {
    render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    const trigger = screen.getByLabelText("Accessibility");
    trigger.focus();
    expect(trigger).toHaveFocus();

    // Open via click
    fireEvent.click(trigger);

    const panel = screen.getByRole("region");
    expect(panel).toHaveFocus();

    // Close via Escape
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(screen.queryByRole("region")).toBeNull();
    expect(trigger).toHaveFocus();

    // Re-open and close via close button
    fireEvent.click(trigger);
    const closeBtn = screen.getByLabelText("Close accessibility settings");
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("region")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("maintains non-modal semantics without aria-modal or aria-hiding host content", () => {
    const hostApp = document.createElement("div");
    hostApp.id = "host-app";
    hostApp.innerHTML = `<button id="host-btn">Host button</button>`;
    document.body.appendChild(hostApp);

    render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    const trigger = screen.getByLabelText("Accessibility");
    fireEvent.click(trigger);

    const panel = screen.getByRole("region");
    expect(panel).not.toHaveAttribute("aria-modal");

    // Host content is NOT aria-hidden (no false modal trap)
    expect(hostApp.getAttribute("aria-hidden")).toBeNull();
  });

  it("provides scrollable tool list with tabIndex=0 and accessible label", () => {
    render(
      <Widget>
        <API.FontSizeController />
        <API.LineHeightController />
      </Widget>,
    );

    fireEvent.click(screen.getByLabelText("Accessibility"));

    const toolsGroup = screen.getByRole("group", {
      name: "Accessibility tools",
    });
    expect(toolsGroup).toHaveAttribute("tabindex", "0");
    expect(toolsGroup.className).toContain("arap-tools");
  });

  it("preserves widget panel and focus across host route changes or dynamic content", () => {
    const hostContent = document.createElement("div");
    hostContent.id = "dynamic-route";
    hostContent.innerHTML = "<p>Initial Page Content</p>";
    document.body.appendChild(hostContent);

    render(
      <Widget>
        <API.FontSizeController />
      </Widget>,
    );

    const trigger = screen.getByLabelText("Accessibility");
    fireEvent.click(trigger);

    expect(screen.getByRole("region")).toBeVisible();

    // Simulate route navigation / DOM mutation in host
    hostContent.innerHTML = "<p>New Page Content</p>";

    // Panel is still open and operable
    expect(screen.getByRole("region")).toBeVisible();
    const increaseBtn = screen.getByLabelText("Increase font size");
    fireEvent.click(increaseBtn);
    expect(screen.getByText("110%")).toBeVisible();
  });

  it("restores focus when panel unmounts while open", () => {
    function App({ show }: { show: boolean }) {
      return (
        <API.AccessibilityPlugin>
          <API.AccessibilityButton />
          {show && (
            <API.AccessibilityList>
              <API.FontSizeController />
            </API.AccessibilityList>
          )}
        </API.AccessibilityPlugin>
      );
    }

    const { rerender } = render(<App show={true} />);

    const trigger = screen.getByLabelText("Accessibility");
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole("region")).toHaveFocus();

    // Rerender with panel unmounted
    rerender(<App show={false} />);
    expect(screen.queryByRole("region")).toBeNull();
    expect(trigger).toHaveFocus();
  });
});
