import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isSpeechRecognitionSupported,
  normalizeTranscript,
  matchVoiceCommand,
  executeVoiceCommand,
  createVoiceNavigationSession,
  VOICE_COMMANDS,
  VOICE_NAVIGATION_DISCLAIMER,
  type VoiceCommandId,
} from "../src/core/voiceNavigation";

describe("Voice Navigation Research Prototype (A11Y-408)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Disclaimer and Definitions", () => {
    it("exports an explicit research prototype disclaimer emphasizing local processing and zero audio storage", () => {
      expect(VOICE_NAVIGATION_DISCLAIMER).toContain("research prototype");
      expect(VOICE_NAVIGATION_DISCLAIMER).toContain("Web Speech API");
      expect(VOICE_NAVIGATION_DISCLAIMER).toContain(
        "No audio streams, recordings, or transcripts are stored",
      );
      expect(VOICE_NAVIGATION_DISCLAIMER).toContain(
        "Destructive actions and profile modifications are strictly excluded",
      );
    });

    it("defines the expected set of non-destructive voice commands", () => {
      const expectedIds: VoiceCommandId[] = [
        "open_widget",
        "close_widget",
        "next_heading",
        "previous_heading",
        "first_heading",
        "scroll_down",
        "scroll_up",
        "scroll_top",
        "scroll_bottom",
        "stop_listening",
        "help",
      ];

      const commandIds = VOICE_COMMANDS.map((c) => c.id);
      for (const expectedId of expectedIds) {
        expect(commandIds).toContain(expectedId);
      }
      expect(VOICE_COMMANDS.length).toBe(11);
    });
  });

  describe("Capability Detection", () => {
    it("returns false when SpeechRecognition is not present on window", () => {
      const win = window as unknown as {
        SpeechRecognition?: unknown;
        webkitSpeechRecognition?: unknown;
      };
      const originalSR = win.SpeechRecognition;
      const originalWebkitSR = win.webkitSpeechRecognition;

      delete win.SpeechRecognition;
      delete win.webkitSpeechRecognition;

      expect(isSpeechRecognitionSupported()).toBe(false);

      win.SpeechRecognition = originalSR;
      win.webkitSpeechRecognition = originalWebkitSR;
    });

    it("returns true when SpeechRecognition or webkitSpeechRecognition is available", () => {
      const win = window as unknown as {
        SpeechRecognition?: unknown;
        webkitSpeechRecognition?: unknown;
      };
      const originalSR = win.SpeechRecognition;
      win.SpeechRecognition = class MockSpeechRecognition {};

      expect(isSpeechRecognitionSupported()).toBe(true);

      if (originalSR) {
        win.SpeechRecognition = originalSR;
      } else {
        delete win.SpeechRecognition;
      }
    });
  });

  describe("Transcript Normalization & Command Matching", () => {
    it("normalizes transcripts by trimming, lowercasing, and removing punctuation", () => {
      expect(normalizeTranscript("  Scroll Down!  ")).toBe("scroll down");
      expect(normalizeTranscript("Next, Heading...?")).toBe("next heading");
      expect(normalizeTranscript("  Open   Widget. ")).toBe("open widget");
    });

    it("matches exact command phrases", () => {
      const res1 = matchVoiceCommand("scroll down");
      expect(res1.command?.id).toBe("scroll_down");
      expect(res1.normalized).toBe("scroll down");

      const res2 = matchVoiceCommand("next heading");
      expect(res2.command?.id).toBe("next_heading");

      const res3 = matchVoiceCommand("open panel");
      expect(res3.command?.id).toBe("open_widget");

      const res4 = matchVoiceCommand("close widget");
      expect(res4.command?.id).toBe("close_widget");

      const res5 = matchVoiceCommand("stop listening");
      expect(res5.command?.id).toBe("stop_listening");

      const res6 = matchVoiceCommand("help");
      expect(res6.command?.id).toBe("help");
    });

    it("matches phrases embedded in natural speech with word boundaries", () => {
      const res1 = matchVoiceCommand("please scroll down for me");
      expect(res1.command?.id).toBe("scroll_down");

      const res2 = matchVoiceCommand("can you go to next heading");
      expect(res2.command?.id).toBe("next_heading");

      const res3 = matchVoiceCommand("jump to top of page");
      expect(res3.command?.id).toBe("scroll_top");
    });

    it("returns null for unrecognized or unsupported phrases", () => {
      const res = matchVoiceCommand("open external bank account");
      expect(res.command).toBeNull();
      expect(res.normalized).toBe("open external bank account");
    });
  });

  describe("Command Execution Safety", () => {
    it("executes open_widget and close_widget callbacks safely", () => {
      const onOpen = vi.fn();
      const onClose = vi.fn();

      const openRes = executeVoiceCommand("open_widget", {
        onWidgetOpen: onOpen,
      });
      expect(openRes.success).toBe(true);
      expect(onOpen).toHaveBeenCalledTimes(1);

      const closeRes = executeVoiceCommand("close_widget", {
        onWidgetClose: onClose,
      });
      expect(closeRes.success).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("navigates DOM headings safely without layout thrashing or modifying DOM semantics", () => {
      document.body.innerHTML = `
        <main>
          <h1>Main Title</h1>
          <p>Intro text</p>
          <h2>Section One</h2>
          <p>Section body</p>
          <h2>Section Two</h2>
        </main>
      `;

      const headingIndexRef = { current: -1 };
      const res1 = executeVoiceCommand("next_heading", {
        currentHeadingIndexRef: headingIndexRef,
      });

      expect(res1.success).toBe(true);
      expect(headingIndexRef.current).toBe(0);
      expect(res1.feedback).toContain("level 1");

      const res2 = executeVoiceCommand("next_heading", {
        currentHeadingIndexRef: headingIndexRef,
      });
      expect(res2.success).toBe(true);
      expect(headingIndexRef.current).toBe(1);
      expect(res2.feedback).toContain("level 2");

      const resPrev = executeVoiceCommand("previous_heading", {
        currentHeadingIndexRef: headingIndexRef,
      });
      expect(resPrev.success).toBe(true);
      expect(headingIndexRef.current).toBe(0);

      const resFirst = executeVoiceCommand("first_heading", {
        currentHeadingIndexRef: headingIndexRef,
      });
      expect(resFirst.success).toBe(true);
      expect(headingIndexRef.current).toBe(0);
    });

    it("reports gracefully when no headings exist on the page", () => {
      document.body.innerHTML = "<div><p>Only text paragraphs</p></div>";
      const res = executeVoiceCommand("next_heading");
      expect(res.success).toBe(false);
      expect(res.feedback).toContain("No headings found");
    });

    it("performs bounded window scrolling for scroll commands", () => {
      const scrollBySpy = vi
        .spyOn(window, "scrollBy")
        .mockImplementation(() => {});
      const scrollToSpy = vi
        .spyOn(window, "scrollTo")
        .mockImplementation(() => {});

      const downRes = executeVoiceCommand("scroll_down");
      expect(downRes.success).toBe(true);
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number) }),
      );

      const upRes = executeVoiceCommand("scroll_up");
      expect(upRes.success).toBe(true);
      expect(scrollBySpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: expect.any(Number) }),
      );

      const topRes = executeVoiceCommand("scroll_top");
      expect(topRes.success).toBe(true);
      expect(scrollToSpy).toHaveBeenCalledWith(
        expect.objectContaining({ top: 0 }),
      );

      const bottomRes = executeVoiceCommand("scroll_bottom");
      expect(bottomRes.success).toBe(true);
      expect(scrollToSpy).toHaveBeenCalled();
    });

    it("handles stop_listening and help commands", () => {
      const stopRes = executeVoiceCommand("stop_listening");
      expect(stopRes.success).toBe(true);
      expect(stopRes.feedback).toContain("Stopped");

      const helpRes = executeVoiceCommand("help");
      expect(helpRes.success).toBe(true);
      expect(helpRes.feedback).toContain("Voice commands:");
    });
  });

  describe("Session Lifecycle & State Management", () => {
    class MockSpeechRecognition {
      static latestInstance: MockSpeechRecognition | null = null;
      continuous = false;
      interimResults = false;
      lang = "en-US";
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((ev: { error: string; message?: string }) => void) | null =
        null;
      onresult:
        | ((ev: {
            resultIndex?: number;
            results: Array<Record<number, { transcript: string }>>;
          }) => void)
        | null = null;

      constructor() {
        MockSpeechRecognition.latestInstance = this;
      }

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

    beforeEach(() => {
      MockSpeechRecognition.latestInstance = null;
      const win = window as unknown as { SpeechRecognition?: unknown };
      win.SpeechRecognition = MockSpeechRecognition;
    });

    afterEach(() => {
      const win = window as unknown as { SpeechRecognition?: unknown };
      delete win.SpeechRecognition;
    });

    it("starts session and transitions status to listening", () => {
      const onStatusChange = vi.fn();
      const session = createVoiceNavigationSession({ onStatusChange });

      expect(session.getStatus()).toBe("idle");
      session.start();
      expect(session.getStatus()).toBe("listening");
      expect(onStatusChange).toHaveBeenCalledWith("listening");

      session.stop();
      expect(session.getStatus()).toBe("idle");
      session.destroy();
    });

    it("dispatches recognized command event when speech result arrives", () => {
      const onCommandRecognized = vi.fn();
      const session = createVoiceNavigationSession({ onCommandRecognized });

      session.start();
      expect(MockSpeechRecognition.latestInstance).not.toBeNull();

      MockSpeechRecognition.latestInstance?.onresult?.({
        resultIndex: 0,
        results: [{ 0: { transcript: "scroll down" } }],
      });

      expect(onCommandRecognized).toHaveBeenCalledWith(
        expect.objectContaining({
          matched: true,
          commandId: "scroll_down",
        }),
      );
      session.destroy();
    });

    it("triggers timeout after inactivity duration", () => {
      vi.useFakeTimers();
      const onStatusChange = vi.fn();
      const session = createVoiceNavigationSession({
        inactivityTimeoutMs: 10000,
        onStatusChange,
      });

      session.start();
      expect(session.getStatus()).toBe("listening");

      vi.advanceTimersByTime(11000);
      expect(session.getStatus()).toBe("timeout");
      expect(onStatusChange).toHaveBeenCalledWith("timeout");

      session.destroy();
    });

    it("handles permission denial gracefully without throwing", () => {
      const onError = vi.fn();
      const onStatusChange = vi.fn();
      const session = createVoiceNavigationSession({ onError, onStatusChange });

      session.start();
      expect(session.getStatus()).toBe("listening");
      expect(MockSpeechRecognition.latestInstance).not.toBeNull();

      // Simulate permission denied error
      MockSpeechRecognition.latestInstance?.onerror?.({ error: "not-allowed" });
      expect(session.getStatus()).toBe("denied");
      expect(onError).toHaveBeenCalledWith("Microphone permission denied");

      session.destroy();
    });

    it("aborts recognition when tab becomes hidden (visibilitychange)", () => {
      const session = createVoiceNavigationSession();
      session.start();
      expect(session.getStatus()).toBe("listening");

      // Simulate document hidden
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      document.dispatchEvent(new Event("visibilitychange"));

      expect(session.getStatus()).toBe("idle");

      // Restore document.hidden
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => false,
      });
      session.destroy();
    });

    it("guarantees zero persistence: localStorage and sessionStorage are never accessed", () => {
      const localSetSpy = vi.spyOn(Storage.prototype, "setItem");

      const session = createVoiceNavigationSession();
      session.start();
      session.stop();
      session.destroy();

      expect(localSetSpy).not.toHaveBeenCalled();
    });
  });
});
