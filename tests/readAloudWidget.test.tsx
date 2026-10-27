import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { AccessibilityPlugin } from "../src/core/AccessibilityPlugin";
import { ReadAloudController } from "../src/features/ReadAloudController";

describe("ReadAloudController integration (A11Y-401)", () => {
  let originalSpeechSynthesis: unknown;
  let originalSpeechSynthesisUtterance: unknown;

  class MockSpeechSynthesisUtterance {
    text: string;
    rate = 1;
    pitch = 1;
    lang = "en";
    voice: SpeechSynthesisVoice | null = null;
    onend: (() => void) | null = null;
    onerror: ((e: { error: string }) => void) | null = null;

    constructor(text = "") {
      this.text = text;
    }
  }

  const mockVoices: SpeechSynthesisVoice[] = [
    {
      name: "English Voice",
      lang: "en-US",
      voiceURI: "en-voice-uri",
      default: true,
      localService: true,
    } as SpeechSynthesisVoice,
    {
      name: "Sinhala Voice",
      lang: "si-LK",
      voiceURI: "si-voice-uri",
      default: false,
      localService: true,
    } as SpeechSynthesisVoice,
  ];

  let mockSpeechSynthesis: {
    speak: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    resume: ReturnType<typeof vi.fn>;
    cancel: ReturnType<typeof vi.fn>;
    getVoices: ReturnType<typeof vi.fn>;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    originalSpeechSynthesis = (
      window as unknown as { speechSynthesis?: unknown }
    ).speechSynthesis;
    originalSpeechSynthesisUtterance = (
      window as unknown as { SpeechSynthesisUtterance?: unknown }
    ).SpeechSynthesisUtterance;

    mockSpeechSynthesis = {
      speak: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      cancel: vi.fn(),
      getVoices: vi.fn(() => mockVoices),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    Object.defineProperty(window, "speechSynthesis", {
      value: mockSpeechSynthesis,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: MockSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });

    document.body.innerHTML = `
      <article>
        <h1>Accessible Architecture</h1>
        <p>This is readable content for testing the speech synthesis integration.</p>
      </article>
    `;
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(window, "speechSynthesis", {
      value: originalSpeechSynthesis,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "SpeechSynthesisUtterance", {
      value: originalSpeechSynthesisUtterance,
      writable: true,
      configurable: true,
    });
    document.body.innerHTML = "";
  });

  it("renders Read aloud card with controls and default settings", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    expect(
      screen.getByRole("group", { name: /Read aloud/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Read aloud" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Stop reading" })).toBeDisabled();
    expect(screen.getByText("1x")).toBeInTheDocument();
  });

  it("starts reading on play button click and switches to pause", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    const playBtn = screen.getByRole("button", { name: "Read aloud" });
    fireEvent.click(playBtn);

    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", { name: "Pause reading" })[0],
    ).toBeInTheDocument();

    // Floating player bar appears
    expect(
      screen.getByRole("region", { name: "Read aloud playback bar" }),
    ).toBeInTheDocument();
  });

  it("pauses and resumes playback cleanly", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read aloud" }));

    const pauseBtn = screen.getAllByRole("button", {
      name: "Pause reading",
    })[0];
    fireEvent.click(pauseBtn);
    expect(mockSpeechSynthesis.pause).toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", { name: "Resume reading" })[0],
    ).toBeInTheDocument();

    const resumeBtn = screen.getAllByRole("button", {
      name: "Resume reading",
    })[0];
    fireEvent.click(resumeBtn);
    expect(mockSpeechSynthesis.resume).toHaveBeenCalled();
    expect(
      screen.getAllByRole("button", { name: "Pause reading" })[0],
    ).toBeInTheDocument();
  });

  it("stops playback when stop button is clicked", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read aloud" }));
    const stopBtn = screen.getAllByRole("button", { name: "Stop reading" })[0];

    fireEvent.click(stopBtn);
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Read aloud" }),
    ).toBeInTheDocument();
    expect(stopBtn).toBeDisabled();
  });

  it("updates speed rate preference when speed button is clicked", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    const incBtn = screen.getByRole("button", {
      name: "Increase reading speed",
    });
    fireEvent.click(incBtn);

    expect(screen.getByText("1.25x")).toBeInTheDocument();
  });

  it("updates pitch preference when pitch button is clicked", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    const incPitch = screen.getByRole("button", { name: "Increase pitch" });
    fireEvent.click(incPitch);

    expect(screen.getByText("High")).toBeInTheDocument();
  });

  it("displays available voices in select dropdown and allows voice change", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    const select = screen.getByLabelText(/Voice/i);
    expect(select).toBeInTheDocument();

    fireEvent.change(select, { target: { value: "si-voice-uri" } });
    expect(select).toHaveValue("si-voice-uri");
  });

  it("stops playback on Escape key press", () => {
    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Read aloud" }));
    expect(
      screen.getByRole("region", { name: "Read aloud playback bar" }),
    ).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(
      screen.queryByRole("region", { name: "Read aloud playback bar" }),
    ).not.toBeInTheDocument();
  });

  it("shows unsupported notification when speechSynthesis is not available", () => {
    Object.defineProperty(window, "speechSynthesis", {
      value: undefined,
      writable: true,
      configurable: true,
    });

    render(
      <AccessibilityPlugin>
        <ReadAloudController />
      </AccessibilityPlugin>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Text-to-speech is not supported in this browser.",
    );
  });
});
