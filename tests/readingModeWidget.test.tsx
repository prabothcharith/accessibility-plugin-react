import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React, { useState } from "react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { AccessibilityButton } from "../src/core/AccessibilityButton";
import { AccessibilityList } from "../src/core/AccessibilityList";
import { ReadingModeController } from "../src/features/ReadingModeController";
import { ResetController } from "../src/features/ResetController";

describe("ReadingModeController - widget integration", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("renders the controller with accessible name and toggle", () => {
    render(
      <AccessibilityPlugin>
        <AccessibilityButton />
        <AccessibilityList>
          <ReadingModeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    // Open panel first
    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("opens reading mode dialog when clicked, showing title, stats, and content", async () => {
    render(
      <div>
        <main>
          <article>
            <h1>Introduction to Web Accessibility</h1>
            <p>
              Digital accessibility provides equal access to information and
              interaction for people of all cognitive, visual, motor, and
              auditory capabilities.
            </p>
            <p>
              By adhering to WCAG technical standards, designers and developers
              create resilient digital experiences that work seamlessly across
              devices.
            </p>
          </article>
        </main>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    await waitFor(() => {
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", {
        level: 1,
        name: "Introduction to Web Accessibility",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Digital accessibility provides equal access/),
    ).toBeInTheDocument();
    expect(within(dialog).getByText(/words/)).toBeInTheDocument();
    expect(within(dialog).getByText(/min read/)).toBeInTheDocument();
  });

  it("closes reading mode and restores focus on Escape key", async () => {
    render(
      <div>
        <main>
          <article>
            <h1>Focus Restoration Test</h1>
            <p>
              This article tests whether focus safely returns to the triggering
              control after dismissing the reading mode dialog.
            </p>
            <p>
              Focus management is an essential criterion under WCAG 2.4.3 Focus
              Order and 2.1.2 No Keyboard Trap.
            </p>
          </article>
        </main>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    toggle.focus();
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Press Escape
    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("closes reading mode and restores focus when close button is clicked", async () => {
    render(
      <div>
        <main>
          <article>
            <h1>Close Button Test</h1>
            <p>
              Testing the explicit close button in the reading mode toolbar and
              footer exit button.
            </p>
            <p>
              Users should always have clear, discoverable mechanisms to dismiss
              modal views and resume context.
            </p>
          </article>
        </main>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const dialog = screen.getByRole("dialog");
    const closeBtn = within(dialog).getAllByRole("button", {
      name: "Close Reading Mode",
    })[0];
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("switches theme modes (light, sepia, dark) within the reader dialog", async () => {
    render(
      <div>
        <main>
          <article>
            <h1>Reader Themes Test</h1>
            <p>
              Reading mode provides customizable background and contrast themes
              tailored for long-form reading comfort.
            </p>
            <p>
              Sepia reduces blue light, while dark mode accommodates low-light
              viewing environments.
            </p>
          </article>
        </main>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const backdrop = document.querySelector(".arap-reading-mode-backdrop");
    expect(backdrop).toHaveAttribute("data-theme", "light");

    const sepiaBtn = screen.getByRole("button", { name: "Sepia theme" });
    fireEvent.click(sepiaBtn);
    expect(backdrop).toHaveAttribute("data-theme", "sepia");

    const darkBtn = screen.getByRole("button", { name: "Dark theme" });
    fireEvent.click(darkBtn);
    expect(backdrop).toHaveAttribute("data-theme", "dark");
  });

  it("handles empty or non-article pages honestly without crashing or trapping", async () => {
    render(
      <div>
        <nav>
          <a href="/">Home</a>
        </nav>
        <div className="login">
          <input type="password" value="secret" readOnly />
        </div>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    // Dialog should not open
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    // Polite announcement is displayed
    const status = screen.getByText(
      "No readable article content found on this page.",
    );
    expect(status).toHaveAttribute("role", "status");
  });

  it("preserves host interactive React state and event listeners across open and close", async () => {
    function HostApp() {
      const [count, setCount] = useState(10);
      const [text, setText] = useState("Important user note");

      return (
        <div>
          <main>
            <article>
              <h1>Host State Persistence Article</h1>
              <p>
                This article exists alongside active interactive host state like
                counters and form inputs.
              </p>
              <p>
                Reading mode must never detach, re-render destructively, or wipe
                client component state.
              </p>
            </article>
            <div id="host-interactive">
              <button
                type="button"
                id="host-counter-btn"
                onClick={() => setCount((c) => c + 1)}
              >
                Count: {count}
              </button>
              <input
                id="host-text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </main>
          <AccessibilityPlugin>
            <AccessibilityButton />
            <AccessibilityList>
              <ReadingModeController />
            </AccessibilityList>
          </AccessibilityPlugin>
        </div>
      );
    }

    render(<HostApp />);

    const counterBtn = screen.getByRole("button", { name: "Count: 10" });
    const textInput = screen.getByDisplayValue("Important user note");

    // Mutate host state before reading mode
    fireEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent("Count: 11");

    // Open reading mode
    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close reading mode
    const dialog = screen.getByRole("dialog");
    const closeBtn = within(dialog).getAllByRole("button", {
      name: "Close Reading Mode",
    })[0];
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Verify host state is completely intact!
    expect(counterBtn).toHaveTextContent("Count: 11");
    expect(textInput).toHaveValue("Important user note");

    // Verify host component event listeners still work
    fireEvent.click(counterBtn);
    expect(counterBtn).toHaveTextContent("Count: 12");
  });

  it("resets reading mode when resetAll is triggered", async () => {
    render(
      <div>
        <main>
          <article>
            <h1>Reset Test Article</h1>
            <p>
              Testing that triggering a master reset closes any active reading
              mode overlay cleanly.
            </p>
            <p>
              Resetting restores all display adjustments and returns the user to
              standard presentation.
            </p>
          </article>
        </main>
        <AccessibilityPlugin>
          <AccessibilityButton />
          <AccessibilityList>
            <ReadingModeController />
            <ResetController />
          </AccessibilityList>
        </AccessibilityPlugin>
      </div>,
    );

    const launcher = screen.getByRole("button", { name: "Accessibility" });
    fireEvent.click(launcher);

    const toggle = screen.getByRole("button", { name: "Open Reading Mode" });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    const resetBtn = screen.getByRole("button", { name: "Reset All" });
    fireEvent.click(resetBtn);

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(toggle).toHaveAttribute("aria-pressed", "false");
    });
  });

  it("renders localized Sinhala and Tamil strings", () => {
    const { unmount } = render(
      <AccessibilityPlugin locale="si-LK">
        <AccessibilityButton />
        <AccessibilityList>
          <ReadingModeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const launcherSi = screen.getByRole("button", { name: "ප්‍රවේශ්‍යතාව" });
    fireEvent.click(launcherSi);

    expect(screen.getByText("කියවීමේ මාදිලිය")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "කියවීමේ ප්‍රකාරය අරඹන්න" }),
    ).toBeInTheDocument();
    unmount();

    render(
      <AccessibilityPlugin locale="ta-LK">
        <AccessibilityButton />
        <AccessibilityList>
          <ReadingModeController />
        </AccessibilityList>
      </AccessibilityPlugin>,
    );

    const launcherTa = screen.getByRole("button", { name: "அணுகல்தன்மை" });
    fireEvent.click(launcherTa);

    expect(screen.getByText("வாசிப்பு முறை")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "வாசிப்பு பயன்முறையைத் திற" }),
    ).toBeInTheDocument();
  });
});
