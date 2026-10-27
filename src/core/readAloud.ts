/**
 * Read-aloud Text-to-Speech (TTS) engine, content extraction, and lifecycle manager.
 *
 * Implements A11Y-401:
 * - Purely client-side Web Speech API integration (`speechSynthesis`).
 * - Zero network requests: no transcripts, recordings, or telemetry leave the package.
 * - Extracts readable text from selections, articles, or main content.
 * - Strictly excludes passwords, credit card inputs, hidden fields, and plugin UI.
 * - Chunks long text to prevent Chromium 15-second utterance lockup.
 * - Provides start, pause, resume, stop, voice selection, rate, and pitch controls.
 * - Automatically stops on Escape, unmount, visibilitychange, and page navigation.
 */

export interface ReadAloudOptions {
  rate?: number;
  pitch?: number;
  voiceUri?: string | null;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: Error) => void;
  onProgress?: (
    chunkIndex: number,
    totalChunks: number,
    chunkText: string,
  ) => void;
}

export interface ReadAloudState {
  status: "idle" | "playing" | "paused" | "stopped" | "unsupported";
  currentChunkIndex: number;
  totalChunks: number;
  currentText: string;
}

export const READ_ALOUD_EXCLUDED_SELECTORS = [
  "[data-arap-ui]",
  ".arap-widget",
  ".arap-panel",
  ".arap-launcher",
  ".arap-shortcuts-backdrop",
  ".arap-shortcuts-dialog",
  ".arap-reading-overlay",
  ".arap-reading-bar",
  ".arap-read-aloud-bar",
  "#arap-page-navigator-dialog",
  "script",
  "style",
  "noscript",
  "template",
  "iframe",
  "object",
  "embed",
  "canvas",
  "audio",
  "video",
  "svg",
  "form",
  "input",
  "select",
  "textarea",
  "button",
  "[role='button']",
  "pre",
  "code",
  "[data-sensitive]",
  "[data-private]",
  ".sensitive",
  ".private",
  '[autocomplete*="password"]',
  '[autocomplete*="cc-"]',
  '[autocomplete*="credit-card"]',
  "[hidden]",
  '[aria-hidden="true"]',
  ".ad",
  ".ads",
  ".advertisement",
  ".cookie-banner",
  ".cookie-consent",
];

const EXCLUDED_SELECTOR_STRING = READ_ALOUD_EXCLUDED_SELECTORS.join(", ");

/**
 * Checks whether the current environment supports Web Speech API speech synthesis.
 */
export function isSpeechSynthesisSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    Boolean(window.speechSynthesis) &&
    typeof (window as unknown as { SpeechSynthesisUtterance?: unknown })
      .SpeechSynthesisUtterance !== "undefined"
  );
}

/**
 * Retrieves the available speech synthesis voices in the current browser.
 */
export function getSpeechVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) return [];
  try {
    return window.speechSynthesis.getVoices() || [];
  } catch {
    return [];
  }
}

/**
 * Subscribes to changes in available speech synthesis voices.
 */
export function subscribeSpeechVoices(
  callback: (voices: SpeechSynthesisVoice[]) => void,
): () => void {
  if (!isSpeechSynthesisSupported()) {
    callback([]);
    return () => {};
  }

  const synth =
    typeof window !== "undefined" ? window.speechSynthesis : undefined;
  if (!synth) {
    callback([]);
    return () => {};
  }

  const handleVoicesChanged = () => {
    callback(getSpeechVoices());
  };

  const initial = getSpeechVoices();
  if (initial.length > 0) {
    callback(initial);
  }

  if (typeof synth.addEventListener === "function") {
    synth.addEventListener("voiceschanged", handleVoicesChanged);
    return () => {
      try {
        if (typeof window !== "undefined" && window.speechSynthesis) {
          window.speechSynthesis.removeEventListener(
            "voiceschanged",
            handleVoicesChanged,
          );
        }
      } catch {
        // Ignore unmount cleanup error
      }
    };
  } else if ("onvoiceschanged" in synth) {
    synth.onvoiceschanged = handleVoicesChanged;
    return () => {
      try {
        if (
          typeof window !== "undefined" &&
          window.speechSynthesis &&
          window.speechSynthesis.onvoiceschanged === handleVoicesChanged
        ) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      } catch {
        // Ignore unmount cleanup error
      }
    };
  }

  return () => {};
}

/**
 * Retrieves currently selected text on the page, ensuring it is not inside
 * sensitive form fields, passwords, or plugin UI.
 */
export function getActiveSelectionText(): string {
  if (typeof window === "undefined" || !window.getSelection) return "";
  try {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || selection.rangeCount === 0)
      return "";

    const anchorNode = selection.anchorNode;
    const anchorEl =
      anchorNode instanceof Element ? anchorNode : anchorNode?.parentElement;
    if (anchorEl) {
      if (anchorEl.closest(EXCLUDED_SELECTOR_STRING)) {
        return "";
      }
    }

    const text = selection.toString().trim();
    return text;
  } catch {
    return "";
  }
}

/**
 * Extracts readable article or page text while strictly excluding sensitive,
 * hidden, form, and plugin elements.
 */
export function extractReadAloudText(options?: {
  root?: Element | Document;
  selectionOnly?: boolean;
}): string {
  if (typeof document === "undefined") return "";

  // 1. Check if user has highlighted text
  const selectionText = getActiveSelectionText();
  if (selectionText) return selectionText;
  if (options?.selectionOnly) return "";

  const root = options?.root ?? document;

  // 2. Locate best candidate content container
  let container: Element | null = null;
  if ("querySelector" in root) {
    container =
      root.querySelector("article") ||
      root.querySelector("[role='article']") ||
      root.querySelector("main") ||
      root.querySelector("[role='main']") ||
      root.querySelector("#content") ||
      root.querySelector(".content");
  }

  if (!container && root instanceof Document && root.body) {
    container = root.body;
  } else if (!container && root instanceof Element) {
    container = root;
  }

  if (!container) return "";

  // 3. Extract text nodes while skipping excluded subtrees
  const textBlocks: string[] = [];

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (node instanceof Element) {
          if (node.matches(EXCLUDED_SELECTOR_STRING)) {
            return NodeFilter.FILTER_REJECT;
          }
          const style =
            typeof window !== "undefined"
              ? window.getComputedStyle(node)
              : null;
          if (
            style &&
            (style.display === "none" || style.visibility === "hidden")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_SKIP;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const val = node.nodeValue?.trim();
          if (!val) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      },
    },
  );

  let currentNode = walker.nextNode();
  while (currentNode) {
    const text = currentNode.nodeValue?.trim();
    if (text) {
      textBlocks.push(text);
    }
    currentNode = walker.nextNode();
  }

  return textBlocks.join(" ").replace(/\s+/g, " ").trim();
}

/**
 * Splits continuous text into natural sentence or punctuation chunks (~60-200 chars).
 * Prevents Web Speech API timeouts on long continuous utterances.
 */
export function splitTextIntoChunks(
  text: string,
  maxChunkLength = 180,
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  // Split on sentence boundaries: period, exclamation, question mark, newline, or semicolon
  const rawSentences = trimmed
    .split(/(?<=[.!?;\n])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let current = "";

  for (const sentence of rawSentences) {
    if (!current) {
      if (sentence.length <= maxChunkLength) {
        current = sentence;
      } else {
        // Sentence itself is longer than maxChunkLength: split by comma or words
        const subParts = sentence.split(/(?<=[,])\s+/);
        for (const part of subParts) {
          if (part.length <= maxChunkLength) {
            if (!current) {
              current = part;
            } else if (current.length + part.length + 1 <= maxChunkLength) {
              current += " " + part;
            } else {
              chunks.push(current);
              current = part;
            }
          } else {
            // Split by words
            const words = part.split(/\s+/);
            for (const word of words) {
              if (!current) {
                current = word;
              } else if (current.length + word.length + 1 <= maxChunkLength) {
                current += " " + word;
              } else {
                chunks.push(current);
                current = word;
              }
            }
          }
        }
      }
    } else if (current.length + sentence.length + 1 <= maxChunkLength) {
      current += " " + sentence;
    } else {
      chunks.push(current);
      current = sentence;
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

/**
 * Session manager controlling speech playback, queueing, pausing, and lifecycle cleanup.
 */
export class ReadAloudSession {
  private chunks: string[] = [];
  private currentChunkIndex = 0;
  private status: "idle" | "playing" | "paused" | "stopped" | "unsupported" =
    "idle";
  private options: ReadAloudOptions = {};
  private listeners: Array<(state: ReadAloudState) => void> = [];
  private cleanupFns: Array<() => void> = [];
  private isDestroyed = false;

  constructor() {
    if (!isSpeechSynthesisSupported()) {
      this.status = "unsupported";
      return;
    }

    // Attach lifecycle listeners
    const handleStop = () => this.stop();
    const handleVisibilityChange = () => {
      if (typeof document !== "undefined" && document.hidden) {
        this.stop();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (this.status === "playing" || this.status === "paused")
      ) {
        this.stop();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("pagehide", handleStop);
      window.addEventListener("beforeunload", handleStop);
      window.addEventListener("keydown", handleKeyDown, true);
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibilityChange);
      }

      this.cleanupFns.push(() => {
        window.removeEventListener("pagehide", handleStop);
        window.removeEventListener("beforeunload", handleStop);
        window.removeEventListener("keydown", handleKeyDown, true);
        if (typeof document !== "undefined") {
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
        }
      });
    }
  }

  public getState(): ReadAloudState {
    return {
      status: this.status,
      currentChunkIndex: this.currentChunkIndex,
      totalChunks: this.chunks.length,
      currentText: this.chunks[this.currentChunkIndex] || "",
    };
  }

  public subscribe(listener: (state: ReadAloudState) => void): () => void {
    this.listeners.push(listener);
    listener(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    const state = this.getState();
    for (const listener of this.listeners) {
      listener(state);
    }
  }

  public speak(text: string, options: ReadAloudOptions = {}) {
    if (!isSpeechSynthesisSupported()) {
      this.status = "unsupported";
      this.notify();
      options.onError?.(
        new Error("Speech synthesis is not supported in this browser."),
      );
      return;
    }

    this.stop();
    this.options = { ...options };
    this.chunks = splitTextIntoChunks(text);
    this.currentChunkIndex = 0;

    if (this.chunks.length === 0) {
      this.status = "idle";
      this.notify();
      return;
    }

    this.status = "playing";
    this.notify();
    this.options.onStart?.();

    this.speakCurrentChunk();
  }

  private speakCurrentChunk() {
    if (this.isDestroyed || this.status !== "playing") return;
    if (this.currentChunkIndex >= this.chunks.length) {
      this.status = "idle";
      this.notify();
      this.options.onEnd?.();
      return;
    }

    const chunkText = this.chunks[this.currentChunkIndex];
    const utterance = new window.SpeechSynthesisUtterance(chunkText);

    if (typeof this.options.rate === "number")
      utterance.rate = this.options.rate;
    if (typeof this.options.pitch === "number")
      utterance.pitch = this.options.pitch;
    if (this.options.lang) utterance.lang = this.options.lang;

    if (this.options.voiceUri) {
      const voices = getSpeechVoices();
      const match = voices.find(
        (v) =>
          v.voiceURI === this.options.voiceUri ||
          v.name === this.options.voiceUri,
      );
      if (match) utterance.voice = match;
    }

    utterance.onend = () => {
      if (this.status === "playing") {
        this.currentChunkIndex++;
        this.notify();
        this.options.onProgress?.(
          this.currentChunkIndex,
          this.chunks.length,
          this.chunks[this.currentChunkIndex] || "",
        );
        this.speakCurrentChunk();
      }
    };

    utterance.onerror = (e) => {
      if (this.status === "playing") {
        // 'interrupted' or 'canceled' are expected when user stops
        if (e.error !== "interrupted" && e.error !== "canceled") {
          this.options.onError?.(
            new Error(`Speech synthesis error: ${e.error}`),
          );
        }
        if (e.error !== "canceled") {
          this.stop();
        }
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      this.status = "idle";
      this.notify();
      this.options.onError?.(
        err instanceof Error ? err : new Error(String(err)),
      );
    }
  }

  public pause() {
    if (this.status !== "playing" || !isSpeechSynthesisSupported()) return;
    try {
      window.speechSynthesis.pause();
      this.status = "paused";
      this.notify();
      this.options.onPause?.();
    } catch {
      // Ignore pause failure
    }
  }

  public resume() {
    if (this.status !== "paused" || !isSpeechSynthesisSupported()) return;
    try {
      window.speechSynthesis.resume();
      this.status = "playing";
      this.notify();
      this.options.onResume?.();
    } catch {
      // Ignore resume failure
    }
  }

  public stop() {
    if (!isSpeechSynthesisSupported()) {
      this.status = "unsupported";
      this.notify();
      return;
    }

    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cancel failure
    }

    const wasActive = this.status === "playing" || this.status === "paused";
    this.status = "stopped";
    this.currentChunkIndex = 0;
    this.notify();

    if (wasActive) {
      this.options.onEnd?.();
    }
  }

  public setRate(rate: number) {
    this.options.rate = rate;
  }

  public setPitch(pitch: number) {
    this.options.pitch = pitch;
  }

  public setVoice(voiceUri: string | null) {
    this.options.voiceUri = voiceUri;
  }

  public destroy() {
    this.isDestroyed = true;
    this.stop();
    for (const cleanup of this.cleanupFns) {
      cleanup();
    }
    this.cleanupFns = [];
    this.listeners = [];
  }
}
