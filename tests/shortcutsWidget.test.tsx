import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  within,
  cleanup,
} from "@testing-library/react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { AccessibilityButton } from "../src/core/AccessibilityButton";
import { AccessibilityList } from "../src/core/AccessibilityList";
import { KeyboardShortcutsController } from "../src/features/KeyboardShortcutsController";
import { PageNavigatorController } from "../src/features/PageNavigatorController";

describe("KeyboardShortcutsController & Link Explorer widget integration", () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    document.body.innerHTML = "";
  });

  it("renders the controller, opens modal dialog, and exposes cheat sheet", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));

    // Find Open button
    const openBtn = screen.getByRole("button", {
      name: "Open Keyboard Shortcuts",
    });
    expect(openBtn).toBeInTheDocument();
    fireEvent.click(openBtn);

    // Verify dialog
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-modal", "true");

    // Headings and description
    expect(
      within(dialog).getByRole("heading", { name: "Keyboard Shortcuts" }),
    ).toBeInTheDocument();

    // Verify default shortcuts are listed
    expect(
      within(dialog).getByText("Toggle accessibility panel"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Reset all display settings"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByLabelText("Current key: Alt+A"),
    ).toBeInTheDocument();
  });

  it("filters shortcuts by category pills and search input", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Open Keyboard Shortcuts" }),
    );

    const dialog = screen.getByRole("dialog");

    // Filter by Navigation category
    const navPill = within(dialog).getByRole("tab", { name: "Navigation" });
    fireEvent.click(navPill);

    expect(
      within(dialog).getByText("Page Structure & Links"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Toggle accessibility panel"),
    ).not.toBeInTheDocument();

    // Switch back to All
    fireEvent.click(within(dialog).getByRole("tab", { name: "All" }));

    // Search filter
    const searchInput = within(dialog).getByLabelText("Filter shortcuts");
    fireEvent.change(searchInput, { target: { value: "reset" } });

    expect(
      within(dialog).getByText("Reset all display settings"),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByText("Toggle accessibility panel"),
    ).not.toBeInTheDocument();
  });

  it("toggles global shortcuts switch", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Open Keyboard Shortcuts" }),
    );

    const dialog = screen.getByRole("dialog");
    const checkbox = within(dialog).getByRole("checkbox");
    expect(checkbox).not.toBeChecked();

    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it("prevents hijacking Ctrl+U and reserved browser shortcuts in remap mode", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Open Keyboard Shortcuts" }),
    );

    const dialog = screen.getByRole("dialog");

    // Click Remap on "Reset all display settings"
    const remapBtn = within(dialog).getByRole("button", {
      name: "Remap Reset all display settings",
    });
    fireEvent.click(remapBtn);

    const remapInput = within(dialog).getByLabelText(
      "Press key combination to remap",
    );
    expect(remapInput).toBeInTheDocument();

    // Attempt to remap to Ctrl+U (reserved)
    fireEvent.keyDown(remapInput, { key: "u", ctrlKey: true });

    // Status message reports error
    const status = within(dialog).getByRole("status");
    expect(status).toHaveTextContent(/reserved browser command/i);
  });

  it("allows valid remapping and resets to defaults", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Open Keyboard Shortcuts" }),
    );

    const dialog = screen.getByRole("dialog");

    // Click Remap on "Toggle accessibility panel"
    const remapBtn = within(dialog).getByRole("button", {
      name: "Remap Toggle accessibility panel",
    });
    fireEvent.click(remapBtn);

    const remapInput = within(dialog).getByLabelText(
      "Press key combination to remap",
    );

    // Remap to Alt+Shift+Z
    fireEvent.keyDown(remapInput, { key: "z", altKey: true, shiftKey: true });

    // Status message confirms update
    expect(within(dialog).getByRole("status")).toHaveTextContent(
      /Shortcut updated to Alt\+Shift\+Z/i,
    );
    expect(
      within(dialog).getByLabelText("Current key: Alt+Shift+Z"),
    ).toBeInTheDocument();

    // Click Reset to Defaults
    const resetBtn = within(dialog).getByRole("button", {
      name: "Reset to Defaults",
    });
    fireEvent.click(resetBtn);

    expect(
      within(dialog).getByLabelText("Current key: Alt+A"),
    ).toBeInTheDocument();
  });

  it("dismisses with Escape key and restores focus", () => {
    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    const openBtn = screen.getByRole("button", {
      name: "Open Keyboard Shortcuts",
    });
    fireEvent.click(openBtn);

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Links tab in PageNavigatorController with search and jump button", () => {
    // Add sample host links
    const container = document.createElement("div");
    container.innerHTML = `
      <main>
        <a id="host-link-1" href="https://example.com/about">About Us</a>
        <a id="host-link-2" href="#team">Our Team</a>
        <a id="host-link-3" href="/blog">Read more</a>
      </main>
    `;
    document.body.appendChild(container);

    render(
      <AccessibilityPlugin persist={false}>
        <AccessibilityButton />
        <AccessibilityList>
          <PageNavigatorController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    const navDialog = screen.getByRole("region", {
      name: "Page Structure Explorer",
    });

    // Switch to Links tab
    const linksTab = within(navDialog).getByRole("tab", { name: /Links/i });
    expect(linksTab).toBeInTheDocument();
    fireEvent.click(linksTab);

    // Verify discovered links
    expect(within(navDialog).getByText("About Us")).toBeInTheDocument();
    expect(within(navDialog).getByText("Our Team")).toBeInTheDocument();
    expect(within(navDialog).getByText("Read more")).toBeInTheDocument();

    // Verify Ambiguous warning on "Read more"
    expect(within(navDialog).getByText("Ambiguous")).toBeInTheDocument();
  });

  it("renders in Sinhala and Tamil with localized strings", () => {
    const { unmount } = render(
      <AccessibilityPlugin persist={false} locale="si-LK">
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Open panel
    fireEvent.click(screen.getByRole("button", { name: "ප්‍රවේශ්‍යතාව" }));
    expect(
      screen.getByRole("button", { name: "යතුරුපුවරු කෙටිමං අරඹන්න" }),
    ).toBeInTheDocument();
    unmount();

    render(
      <AccessibilityPlugin persist={false} locale="ta-LK">
        <AccessibilityButton />
        <AccessibilityList>
          <KeyboardShortcutsController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "அணுகல்தன்மை" }));
    expect(
      screen.getByRole("button", { name: "குறுக்குவழிகளைத் திற" }),
    ).toBeInTheDocument();
  });
});
