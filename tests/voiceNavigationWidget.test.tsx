import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  screen,
  fireEvent,
  cleanup,
  render,
  act,
} from "@testing-library/react";
import * as API from "../src";
import { Widget } from "./helpers";

describe("Voice Navigation Controller Widget (A11Y-408)", () => {
  let host: HTMLElement;

  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "test-host";
    host.innerHTML = `
      <h1>Main Document Heading</h1>
      <p>Introductory paragraph</p>
      <h2>First Section</h2>
      <p>Body copy</p>
    `;
    document.body.appendChild(host);
    window.scrollBy = vi.fn();
    window.scrollTo = vi.fn();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  it("renders voice navigation controller with prototype badge and accessible name", () => {
    renderWidget(<API.VoiceNavigationController />);

    expect(
      screen.getByRole("group", { name: "Voice Navigation" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Prototype")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Voice navigation is an experimental research prototype/i,
      ),
    ).toBeInTheDocument();
  });

  it("displays fallback state in environments without Web Speech Recognition", () => {
    renderWidget(<API.VoiceNavigationController />);

    const toggleBtn = screen.getByRole("button", { name: "Voice Unavailable" });
    expect(toggleBtn).toBeDisabled();
    expect(
      screen.getByText(/Web Speech Recognition is not supported/i),
    ).toBeInTheDocument();
  });

  it("provides functional keyboard alternatives even when voice recognition is unavailable", () => {
    renderWidget(<API.VoiceNavigationController />);

    const nextHeadingBtn = screen.getByRole("button", {
      name: "Next Heading",
    });
    expect(nextHeadingBtn).toBeInTheDocument();

    act(() => {
      fireEvent.click(nextHeadingBtn);
    });

    expect(
      screen.getByText(/Navigated to heading level 1: Main Document Heading/i),
    ).toBeInTheDocument();

    const scrollDownBtn = screen.getByRole("button", {
      name: "Scroll Down",
    });
    act(() => {
      fireEvent.click(scrollDownBtn);
    });

    expect(screen.getByText("Scrolled down")).toBeInTheDocument();
  });

  it("toggles command cheat sheet table display", () => {
    renderWidget(<API.VoiceNavigationController />);

    const commandsToggle = screen.getByRole("button", {
      name: "Show commands",
    });
    expect(commandsToggle).toHaveAttribute("aria-expanded", "false");

    act(() => {
      fireEvent.click(commandsToggle);
    });

    const region = screen.getByRole("region", {
      name: "Supported voice commands",
    });
    expect(region).toBeInTheDocument();
    expect(region).toHaveTextContent("Next Heading");
    expect(region).toHaveTextContent("Scroll Down");

    act(() => {
      fireEvent.click(commandsToggle);
    });
    expect(
      screen.queryByRole("region", { name: "Supported voice commands" }),
    ).not.toBeInTheDocument();
  });

  it("activates listening and updates button state when SpeechRecognition is supported", () => {
    class MockSpeechRecognition {
      continuous = false;
      interimResults = false;
      lang = "en-US";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((ev: { error: string }) => void) | null = null;
      onresult: ((ev: unknown) => void) | null = null;

      start = vi.fn(() => {
        this.onstart?.();
      });
      stop = vi.fn(() => {
        this.onend?.();
      });
      abort = vi.fn(() => {
        this.onend?.();
      });
    }

    const win = window as unknown as { SpeechRecognition?: unknown };
    win.SpeechRecognition = MockSpeechRecognition;

    try {
      renderWidget(<API.VoiceNavigationController />);

      const startBtn = screen.getByRole("button", { name: "Start Listening" });
      expect(startBtn).toBeInTheDocument();
      expect(startBtn).not.toBeDisabled();

      act(() => {
        fireEvent.click(startBtn);
      });

      expect(
        screen.getByRole("button", { name: "Stop Listening" }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Listening for voice commands/i),
      ).toBeInTheDocument();

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Stop Listening" }));
      });

      expect(
        screen.getByRole("button", { name: "Start Listening" }),
      ).toBeInTheDocument();
    } finally {
      delete win.SpeechRecognition;
    }
  });
});
