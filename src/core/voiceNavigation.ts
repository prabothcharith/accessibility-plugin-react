"use client";

import { scanHeadings, navigateToElement } from "./pageNavigator";

/**
 * Voice Navigation Research Prototype
 *
 * Implements A11Y-408:
 * - Explicit, finite voice-command set: open/close widget, heading navigation, scrolling, stop, help.
 * - Strict user-initiated permission and consent.
 * - Prominent visual listening indicator and accessible live status announcements.
 * - Zero audio recording storage, zero transcript persistence, zero network transmission.
 * - Automatic inactivity timeout (30 seconds) and tab/unmount cleanup.
 * - No destructive host actions, no form inputs, no profile activation.
 * - Full accessible keyboard alternatives for all voice commands.
 */

export const VOICE_NAVIGATION_DISCLAIMER =
  "Voice navigation is an experimental research prototype. Audio is processed solely through your browser's native Web Speech API during active listening sessions. No audio streams, recordings, or transcripts are stored locally or transmitted to external servers. Destructive actions and profile modifications are strictly excluded.";

export type VoiceNavigationStatus =
  | "idle"
  | "listening"
  | "processing"
  | "unsupported"
  | "denied"
  | "timeout"
  | "error";

export type VoiceCommandId =
  | "open_widget"
  | "close_widget"
  | "next_heading"
  | "previous_heading"
  | "first_heading"
  | "scroll_down"
  | "scroll_up"
  | "scroll_top"
  | "scroll_bottom"
  | "stop_listening"
  | "help";

export interface VoiceCommandDefinition {
  id: VoiceCommandId;
  label: string;
  phrases: string[];
  description: string;
  category: "widget" | "navigation" | "scroll" | "system";
}

export interface VoiceNavigationResult {
  commandId?: VoiceCommandId;
  rawTranscript: string;
  normalizedTranscript: string;
  matched: boolean;
  feedback: string;
  timestamp: number;
}

export interface VoiceNavigationOptions {
  lang?: string;
  inactivityTimeoutMs?: number;
  onStatusChange?: (status: VoiceNavigationStatus) => void;
  onCommandRecognized?: (result: VoiceNavigationResult) => void;
  onError?: (error: Error | string) => void;
  onWidgetOpen?: () => void;
  onWidgetClose?: () => void;
  onAction?: (actionName: string, detail: Record<string, unknown>) => void;
}

export const VOICE_COMMANDS: VoiceCommandDefinition[] = [
  {
    id: "open_widget",
    label: "Open Widget",
    phrases: [
      "open",
      "open widget",
      "open panel",
      "show widget",
      "show panel",
      "open menu",
    ],
    description: "Opens the accessibility widget panel",
    category: "widget",
  },
  {
    id: "close_widget",
    label: "Close Widget",
    phrases: [
      "close",
      "close widget",
      "close panel",
      "hide widget",
      "hide panel",
      "close menu",
    ],
    description: "Closes the accessibility widget panel",
    category: "widget",
  },
  {
    id: "next_heading",
    label: "Next Heading",
    phrases: [
      "next heading",
      "heading down",
      "forward heading",
      "go to next heading",
    ],
    description: "Navigates to the next DOM heading on the page",
    category: "navigation",
  },
  {
    id: "previous_heading",
    label: "Previous Heading",
    phrases: [
      "previous heading",
      "prior heading",
      "heading up",
      "back heading",
      "go to previous heading",
    ],
    description: "Navigates to the previous DOM heading on the page",
    category: "navigation",
  },
  {
    id: "first_heading",
    label: "First Heading",
    phrases: ["first heading", "top heading", "start heading", "main heading"],
    description: "Navigates to the first DOM heading on the page",
    category: "navigation",
  },
  {
    id: "scroll_down",
    label: "Scroll Down",
    phrases: ["scroll down", "page down", "down", "move down"],
    description: "Scrolls the page downward by 75% of the viewport",
    category: "scroll",
  },
  {
    id: "scroll_up",
    label: "Scroll Up",
    phrases: ["scroll up", "page up", "up", "move up"],
    description: "Scrolls the page upward by 75% of the viewport",
    category: "scroll",
  },
  {
    id: "scroll_top",
    label: "Scroll to Top",
    phrases: [
      "scroll top",
      "top of page",
      "go to top",
      "scroll to top",
      "jump to top",
    ],
    description: "Scrolls directly to the top of the page",
    category: "scroll",
  },
  {
    id: "scroll_bottom",
    label: "Scroll to Bottom",
    phrases: [
      "scroll bottom",
      "bottom of page",
      "go to bottom",
      "scroll to bottom",
      "jump to bottom",
    ],
    description: "Scrolls directly to the bottom of the page",
    category: "scroll",
  },
  {
    id: "stop_listening",
    label: "Stop Listening",
    phrases: [
      "stop",
      "stop listening",
      "cancel",
      "turn off",
      "exit voice",
      "quit voice",
    ],
    description: "Deactivates voice recognition and stops listening",
    category: "system",
  },
  {
    id: "help",
    label: "Help / Commands",
    phrases: [
      "help",
      "what can i say",
      "commands",
      "voice commands",
      "list commands",
    ],
    description: "Announces available voice commands",
    category: "system",
  },
];

/**
 * Checks whether native Web Speech Recognition API is supported in the current environment.
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  const win = window as unknown as {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };
  return Boolean(win.SpeechRecognition || win.webkitSpeechRecognition);
}

/**
 * Normalizes speech recognition transcript string for deterministic matching.
 */
export function normalizeTranscript(transcript: string): string {
  return transcript
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Matches a transcript against the defined voice commands.
 */
export function matchVoiceCommand(rawTranscript: string): {
  command: VoiceCommandDefinition | null;
  normalized: string;
} {
  const normalized = normalizeTranscript(rawTranscript);
  if (!normalized) {
    return { command: null, normalized: "" };
  }

  // 1. Exact phrase match
  for (const cmd of VOICE_COMMANDS) {
    for (const phrase of cmd.phrases) {
      if (normalized === phrase) {
        return { command: cmd, normalized };
      }
    }
  }

  // 2. Multi-word phrase boundary match (e.g., "please scroll down", "can you open widget")
  // Only boundary-match phrases with 2 or more words to avoid false triggers on single common words
  for (const cmd of VOICE_COMMANDS) {
    for (const phrase of cmd.phrases) {
      const words = phrase.split(" ");
      if (words.length >= 2) {
        const regex = new RegExp(`(^|\\s)${phrase}(\\s|$)`, "i");
        if (regex.test(normalized)) {
          return { command: cmd, normalized };
        }
      }
    }
  }

  return { command: null, normalized };
}

export interface VoiceExecutionContext {
  onWidgetOpen?: () => void;
  onWidgetClose?: () => void;
  currentHeadingIndexRef?: { current: number };
  onAction?: (actionName: string, detail: Record<string, unknown>) => void;
}

/**
 * Safely executes a matched voice command without destructive side-effects.
 */
export function executeVoiceCommand(
  commandId: VoiceCommandId,
  context: VoiceExecutionContext = {},
): { success: boolean; feedback: string } {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return { success: false, feedback: "Window or document unavailable" };
  }

  const isReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const scrollBehavior: ScrollBehavior = isReducedMotion ? "auto" : "smooth";

  switch (commandId) {
    case "open_widget": {
      if (context.onWidgetOpen) {
        context.onWidgetOpen();
        context.onAction?.("open_widget", { command: "open_widget" });
        return { success: true, feedback: "Opened accessibility menu" };
      }
      return {
        success: false,
        feedback: "Open widget callback not configured",
      };
    }

    case "close_widget": {
      if (context.onWidgetClose) {
        context.onWidgetClose();
        context.onAction?.("close_widget", { command: "close_widget" });
        return { success: true, feedback: "Closed accessibility menu" };
      }
      return {
        success: false,
        feedback: "Close widget callback not configured",
      };
    }

    case "next_heading": {
      const headings = scanHeadings(document);
      if (headings.length === 0) {
        return { success: false, feedback: "No headings found on this page" };
      }
      const ref = context.currentHeadingIndexRef || { current: -1 };
      let nextIndex = ref.current + 1;
      if (nextIndex >= headings.length) {
        nextIndex = 0; // wrap to first heading
      }
      ref.current = nextIndex;
      const target = headings[nextIndex];
      navigateToElement(target.element, { behavior: scrollBehavior });
      context.onAction?.("navigate_heading", {
        headingIndex: nextIndex,
        totalHeadings: headings.length,
        level: target.level,
      });
      return {
        success: true,
        feedback: `Navigated to heading level ${target.level}: ${target.text.slice(0, 30)}`,
      };
    }

    case "previous_heading": {
      const headings = scanHeadings(document);
      if (headings.length === 0) {
        return { success: false, feedback: "No headings found on this page" };
      }
      const ref = context.currentHeadingIndexRef || { current: 0 };
      const prevIndex =
        ref.current <= 0 ? headings.length - 1 : ref.current - 1;
      ref.current = prevIndex;
      const target = headings[prevIndex];
      navigateToElement(target.element, { behavior: scrollBehavior });
      context.onAction?.("navigate_heading", {
        headingIndex: prevIndex,
        totalHeadings: headings.length,
        level: target.level,
      });
      return {
        success: true,
        feedback: `Navigated to heading level ${target.level}: ${target.text.slice(0, 30)}`,
      };
    }

    case "first_heading": {
      const headings = scanHeadings(document);
      if (headings.length === 0) {
        return { success: false, feedback: "No headings found on this page" };
      }
      const ref = context.currentHeadingIndexRef || { current: 0 };
      ref.current = 0;
      const target = headings[0];
      navigateToElement(target.element, { behavior: scrollBehavior });
      context.onAction?.("navigate_heading", {
        headingIndex: 0,
        totalHeadings: headings.length,
        level: target.level,
      });
      return {
        success: true,
        feedback: `Navigated to first heading level ${target.level}: ${target.text.slice(0, 30)}`,
      };
    }

    case "scroll_down": {
      const scrollAmount = Math.max(200, window.innerHeight * 0.75);
      window.scrollBy({ top: scrollAmount, behavior: scrollBehavior });
      context.onAction?.("scroll", { direction: "down", amount: scrollAmount });
      return { success: true, feedback: "Scrolled down" };
    }

    case "scroll_up": {
      const scrollAmount = Math.max(200, window.innerHeight * 0.75);
      window.scrollBy({ top: -scrollAmount, behavior: scrollBehavior });
      context.onAction?.("scroll", { direction: "up", amount: scrollAmount });
      return { success: true, feedback: "Scrolled up" };
    }

    case "scroll_top": {
      window.scrollTo({ top: 0, behavior: scrollBehavior });
      context.onAction?.("scroll", { target: "top" });
      return { success: true, feedback: "Scrolled to top of page" };
    }

    case "scroll_bottom": {
      const bottom =
        document.documentElement.scrollHeight ||
        document.body.scrollHeight ||
        0;
      window.scrollTo({ top: bottom, behavior: scrollBehavior });
      context.onAction?.("scroll", { target: "bottom" });
      return { success: true, feedback: "Scrolled to bottom of page" };
    }

    case "stop_listening": {
      context.onAction?.("stop_listening", {});
      return { success: true, feedback: "Stopped voice listening" };
    }

    case "help": {
      context.onAction?.("help", {});
      return {
        success: true,
        feedback:
          "Voice commands: open widget, close widget, next heading, previous heading, scroll down, scroll up, scroll top, scroll bottom, stop.",
      };
    }

    default:
      return { success: false, feedback: "Unrecognized command" };
  }
}

export interface SpeechRecognitionResultItemLike {
  transcript: string;
}

export interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results: {
    length: number;
    [index: number]: {
      [index: number]: SpeechRecognitionResultItemLike;
    };
  };
}

/**
 * Minimal interface representing the browser's native SpeechRecognition.
 */
export interface NativeSpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: unknown, ev: Event) => unknown) | null;
  onend: ((this: unknown, ev: Event) => unknown) | null;
  onerror:
    | ((this: unknown, ev: { error: string; message?: string }) => unknown)
    | null;
  onresult: ((this: unknown, ev: SpeechRecognitionEventLike) => unknown) | null;
}

export interface VoiceNavigationSession {
  start: () => void;
  stop: () => void;
  abort: () => void;
  destroy: () => void;
  getStatus: () => VoiceNavigationStatus;
  getLastResult: () => VoiceNavigationResult | null;
}

/**
 * Factory creating an active voice navigation session with lifecycle, timeout,
 * and privacy management.
 */
export function createVoiceNavigationSession(
  options: VoiceNavigationOptions = {},
): VoiceNavigationSession {
  let status: VoiceNavigationStatus = isSpeechRecognitionSupported()
    ? "idle"
    : "unsupported";
  let lastResult: VoiceNavigationResult | null = null;
  let recognition: NativeSpeechRecognitionInstance | null = null;
  let inactivityTimer: ReturnType<typeof setTimeout> | null = null;
  let isExplicitlyStopped = false;
  const timeoutMs = options.inactivityTimeoutMs ?? 30000;
  const headingIndexRef = { current: -1 };

  const updateStatus = (newStatus: VoiceNavigationStatus) => {
    if (status !== newStatus) {
      status = newStatus;
      options.onStatusChange?.(newStatus);
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
    }
    inactivityTimer = setTimeout(() => {
      if (status === "listening" || status === "processing") {
        updateStatus("timeout");
        stopSession();
      }
    }, timeoutMs);
  };

  const clearInactivityTimer = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  };

  // Visibility / Tab change listener: stops microphone immediately if tab loses visibility
  const handleVisibilityChange = () => {
    if (typeof document !== "undefined" && document.hidden) {
      if (status === "listening" || status === "processing") {
        stopSession();
      }
    }
  };

  const handlePageUnload = () => {
    abortSession();
  };

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }
  if (typeof window !== "undefined") {
    window.addEventListener("pagehide", handlePageUnload);
    window.addEventListener("beforeunload", handlePageUnload);
  }

  const initRecognition = () => {
    if (!isSpeechRecognitionSupported()) {
      updateStatus("unsupported");
      return null;
    }

    try {
      const win = window as unknown as {
        SpeechRecognition?: new () => NativeSpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => NativeSpeechRecognitionInstance;
      };
      const RecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;

      if (!RecognitionConstructor) {
        updateStatus("unsupported");
        return null;
      }

      const instance = new RecognitionConstructor();
      instance.continuous = true;
      instance.interimResults = false;
      instance.lang =
        options.lang ||
        (typeof navigator !== "undefined" ? navigator.language : "en-US") ||
        "en-US";

      instance.onstart = () => {
        isExplicitlyStopped = false;
        updateStatus("listening");
        resetInactivityTimer();
      };

      instance.onend = () => {
        clearInactivityTimer();
        // If not explicitly stopped and status was listening, attempt clean restart
        // (Chrome terminates continuous speech after ~60s of silence)
        if (!isExplicitlyStopped && status === "listening") {
          try {
            instance.start();
          } catch {
            updateStatus("idle");
          }
        } else if (
          status !== "denied" &&
          status !== "timeout" &&
          status !== "error"
        ) {
          updateStatus("idle");
        }
      };

      instance.onerror = (event: { error: string; message?: string }) => {
        clearInactivityTimer();
        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          updateStatus("denied");
          options.onError?.("Microphone permission denied");
        } else if (event.error === "no-speech") {
          // Normal silence, keep listening unless timeout occurs
          resetInactivityTimer();
        } else if (event.error === "aborted") {
          // Normal abort on user stop
          if (status !== "denied" && status !== "timeout") {
            updateStatus("idle");
          }
        } else {
          updateStatus("error");
          options.onError?.(`Speech recognition error: ${event.error}`);
        }
      };

      instance.onresult = (event: SpeechRecognitionEventLike) => {
        resetInactivityTimer();
        if (!event || !event.results) return;

        const lastResultIndex =
          event.resultIndex !== undefined
            ? event.resultIndex
            : event.results.length - 1;
        const resultItem = event.results[lastResultIndex];
        if (!resultItem || !resultItem[0]) return;

        const rawTranscript = resultItem[0].transcript || "";
        const { command, normalized } = matchVoiceCommand(rawTranscript);

        if (command) {
          updateStatus("processing");
          const execution = executeVoiceCommand(command.id, {
            onWidgetOpen: options.onWidgetOpen,
            onWidgetClose: options.onWidgetClose,
            currentHeadingIndexRef: headingIndexRef,
            onAction: options.onAction,
          });

          lastResult = {
            commandId: command.id,
            rawTranscript,
            normalizedTranscript: normalized,
            matched: true,
            feedback: execution.feedback,
            timestamp: Date.now(),
          };

          options.onCommandRecognized?.(lastResult);

          if (command.id === "stop_listening") {
            stopSession();
          } else {
            updateStatus("listening");
          }
        } else {
          lastResult = {
            rawTranscript,
            normalizedTranscript: normalized,
            matched: false,
            feedback: `Unrecognized command: "${normalized}". Say "help" for a list of commands.`,
            timestamp: Date.now(),
          };
          options.onCommandRecognized?.(lastResult);
        }
      };

      return instance;
    } catch (err) {
      updateStatus("unsupported");
      options.onError?.(err instanceof Error ? err : String(err));
      return null;
    }
  };

  const startSession = () => {
    if (!isSpeechRecognitionSupported()) {
      updateStatus("unsupported");
      return;
    }
    isExplicitlyStopped = false;
    if (!recognition) {
      recognition = initRecognition();
    }
    if (recognition) {
      try {
        recognition.start();
        updateStatus("listening");
        resetInactivityTimer();
      } catch (err: unknown) {
        // Recognition already started or error
        if ((err as { name?: string })?.name === "InvalidStateError") {
          // Already running
          updateStatus("listening");
        } else {
          updateStatus("error");
          options.onError?.(err instanceof Error ? err : String(err));
        }
      }
    }
  };

  const stopSession = () => {
    isExplicitlyStopped = true;
    clearInactivityTimer();
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        // Ignore stop error if already stopped
      }
    }
    if (
      status !== "denied" &&
      status !== "timeout" &&
      status !== "unsupported"
    ) {
      updateStatus("idle");
    }
  };

  const abortSession = () => {
    isExplicitlyStopped = true;
    clearInactivityTimer();
    if (recognition) {
      try {
        recognition.abort();
      } catch {
        // Ignore abort error
      }
    }
    updateStatus("idle");
  };

  const destroy = () => {
    abortSession();
    clearInactivityTimer();
    recognition = null;
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("pagehide", handlePageUnload);
      window.removeEventListener("beforeunload", handlePageUnload);
    }
  };

  return {
    start: startSession,
    stop: stopSession,
    abort: abortSession,
    destroy,
    getStatus: () => status,
    getLastResult: () => lastResult,
  };
}
