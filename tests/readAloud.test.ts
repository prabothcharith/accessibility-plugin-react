import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  isSpeechSynthesisSupported,
  getSpeechVoices,
  subscribeSpeechVoices,
  getActiveSelectionText,
  extractReadAloudText,
  splitTextIntoChunks,
  ReadAloudSession,
  READ_ALOUD_EXCLUDED_SELECTORS,
} from "../src/core/readAloud";

describe("readAloud core engine (A11Y-401)", () => {
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
      name: "Alex",
      lang: "en-US",
      voiceURI: "alex-voice-uri",
      default: true,
      localService: true,
    } as SpeechSynthesisVoice,
    {
      name: "Samantha",
      lang: "en-US",
      voiceURI: "samantha-voice-uri",
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
      speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
        // Trigger onend asynchronously in tests when needed
        setTimeout(() => {
          utterance.onend?.();
        }, 10);
      }),
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

    document.body.innerHTML = "";
  });

  afterEach(() => {
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

  describe("API Support & Voice Discovery", () => {
    it("detects Web Speech API support correctly", () => {
      expect(isSpeechSynthesisSupported()).toBe(true);
    });

    it("returns false when window.speechSynthesis is missing", () => {
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      expect(isSpeechSynthesisSupported()).toBe(false);
    });

    it("returns available voices from getSpeechVoices", () => {
      const voices = getSpeechVoices();
      expect(voices).toHaveLength(2);
      expect(voices[0].name).toBe("Alex");
    });

    it("subscribes to voice changes via subscribeSpeechVoices", () => {
      const listener = vi.fn();
      const unsubscribe = subscribeSpeechVoices(listener);

      expect(listener).toHaveBeenCalledWith(mockVoices);
      expect(mockSpeechSynthesis.addEventListener).toHaveBeenCalledWith(
        "voiceschanged",
        expect.any(Function),
      );

      unsubscribe();
      expect(mockSpeechSynthesis.removeEventListener).toHaveBeenCalledWith(
        "voiceschanged",
        expect.any(Function),
      );
    });
  });

  describe("Text Extraction and Sensitive Exclusions", () => {
    it("defines sensible excluded selectors covering sensitive fields and plugin UI", () => {
      expect(READ_ALOUD_EXCLUDED_SELECTORS).toContain("input");
      expect(READ_ALOUD_EXCLUDED_SELECTORS).toContain("[data-arap-ui]");
      expect(READ_ALOUD_EXCLUDED_SELECTORS).toContain(".arap-panel");
    });

    it("excludes passwords, credit cards, and plugin elements", () => {
      document.body.innerHTML = `
        <main>
          <h1>Welcome to our portal</h1>
          <p>This is accessible public article text.</p>
          <div data-arap-ui class="arap-panel">
            <p>Widget controls text should never be read aloud.</p>
          </div>
          <form>
            <input type="password" value="secret123" />
            <input type="text" autocomplete="cc-number" value="4111222233334444" />
            <input type="text" data-sensitive="true" value="personal SSN" />
          </form>
          <p>Conclusion paragraph here.</p>
        </main>
      `;

      const text = extractReadAloudText();
      expect(text).toContain("Welcome to our portal");
      expect(text).toContain("This is accessible public article text.");
      expect(text).toContain("Conclusion paragraph here.");
      expect(text).not.toContain("Widget controls text");
      expect(text).not.toContain("secret123");
      expect(text).not.toContain("4111222233334444");
      expect(text).not.toContain("personal SSN");
    });

    it("prioritizes highlighted text selection when available", () => {
      document.body.innerHTML = `<article><p id="p1">First sentence.</p><p id="p2">Second sentence.</p></article>`;
      const p1 = document.getElementById("p1")!;

      // Mock getSelection
      const mockSelection = {
        isCollapsed: false,
        rangeCount: 1,
        anchorNode: p1,
        toString: () => "First sentence.",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(
        mockSelection as unknown as Selection,
      );

      const text = extractReadAloudText();
      expect(text).toBe("First sentence.");
    });

    it("rejects text selection if inside sensitive or plugin container", () => {
      document.body.innerHTML = `
        <div class="arap-panel">
          <p id="panel-text">Selected widget text</p>
        </div>
      `;
      const panelText = document.getElementById("panel-text")!;

      const mockSelection = {
        isCollapsed: false,
        rangeCount: 1,
        anchorNode: panelText,
        toString: () => "Selected widget text",
      };
      vi.spyOn(window, "getSelection").mockReturnValue(
        mockSelection as unknown as Selection,
      );

      expect(getActiveSelectionText()).toBe("");
    });
  });

  describe("Text Chunking", () => {
    it("handles empty or whitespace strings", () => {
      expect(splitTextIntoChunks("")).toEqual([]);
      expect(splitTextIntoChunks("   ")).toEqual([]);
    });

    it("splits sentences cleanly on punctuation boundaries", () => {
      const text =
        "First sentence. Second sentence! Third sentence? Fourth sentence.";
      const chunks = splitTextIntoChunks(text, 50);

      expect(chunks.length).toBeGreaterThan(1);
      expect(chunks[0]).toContain("First sentence.");
    });

    it("splits long single sentences exceeding maxChunkLength", () => {
      const longSentence =
        "This is an exceptionally long sentence that exceeds the standard chunk boundary limit so that we can verify word-level splitting works without losing content or creating awkward breaks.";
      const chunks = splitTextIntoChunks(longSentence, 60);

      expect(chunks.length).toBeGreaterThan(1);
      const combined = chunks.join(" ");
      expect(combined).toContain("This is an exceptionally long sentence");
      expect(combined).toContain("awkward breaks.");
    });
  });

  describe("ReadAloudSession Playback and Lifecycle", () => {
    it("manages speak, pause, resume, and stop sequence", () => {
      const session = new ReadAloudSession();
      const stateListener = vi.fn();
      session.subscribe(stateListener);

      expect(session.getState().status).toBe("idle");

      session.speak("Hello world! Welcome to the accessibility plugin.", {
        rate: 1.25,
        pitch: 1.0,
      });

      expect(session.getState().status).toBe("playing");
      expect(mockSpeechSynthesis.speak).toHaveBeenCalled();

      session.pause();
      expect(session.getState().status).toBe("paused");
      expect(mockSpeechSynthesis.pause).toHaveBeenCalled();

      session.resume();
      expect(session.getState().status).toBe("playing");
      expect(mockSpeechSynthesis.resume).toHaveBeenCalled();

      session.stop();
      expect(session.getState().status).toBe("stopped");
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();

      session.destroy();
    });

    it("stops reading when Escape key is pressed", () => {
      const session = new ReadAloudSession();
      session.speak("Test sentence for keyboard escape dismissal.");
      expect(session.getState().status).toBe("playing");

      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

      expect(session.getState().status).toBe("stopped");
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();

      session.destroy();
    });

    it("stops reading on window pagehide / unload", () => {
      const session = new ReadAloudSession();
      session.speak("Testing pagehide cleanup.");
      expect(session.getState().status).toBe("playing");

      window.dispatchEvent(new Event("pagehide"));

      expect(session.getState().status).toBe("stopped");
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();

      session.destroy();
    });
  });
});
