"use client";

import {
  useState,
  useEffect,
  useRef,
  useId,
  useContext,
  useCallback,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
import {
  isSpeechSynthesisSupported,
  subscribeSpeechVoices,
  extractReadAloudText,
  getActiveSelectionText,
  ReadAloudSession,
  type ReadAloudState,
} from "../core/readAloud";

const emptySubscribe = () => () => {};
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export interface ReadAloudControllerProps {
  className?: string;
  label?: string;
  description?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

const SPEED_STEPS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
const PITCH_STEPS = [0.8, 1.0, 1.2];

export function ReadAloudController({
  className = "",
  label,
  description,
  onStart,
  onEnd,
  onError,
}: ReadAloudControllerProps = {}) {
  const context = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(context?.locale);

  const { value: rate, setValue: setRate } = useAccessibility<number>(
    "readAloudRate",
    1.0,
  );
  const { value: pitch, setValue: setPitch } = useAccessibility<number>(
    "readAloudPitch",
    1.0,
  );
  const { value: voiceUri, setValue: setVoiceUri } = useAccessibility<
    string | null
  >("readAloudVoice", null);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [sessionState, setSessionState] = useState<ReadAloudState>({
    status: "idle",
    currentChunkIndex: 0,
    totalChunks: 0,
    currentText: "",
  });
  const [selectedText, setSelectedText] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const sessionRef = useRef<ReadAloudSession | null>(null);
  const mounted = useMounted();
  const titleId = useId();
  const voiceSelectId = useId();

  const isSupported = isSpeechSynthesisSupported();

  // Initialize or get persistent session
  useEffect(() => {
    const session = new ReadAloudSession();
    sessionRef.current = session;

    const unsubscribe = session.subscribe((state) => {
      setSessionState(state);
    });

    return () => {
      unsubscribe();
      session.destroy();
      sessionRef.current = null;
    };
  }, []);

  // Subscribe to system voices
  useEffect(() => {
    const unsubscribe = subscribeSpeechVoices((v) => {
      setVoices(v);
    });
    return unsubscribe;
  }, []);

  // Update session options when preferences change
  useEffect(() => {
    if (sessionRef.current) {
      sessionRef.current.setRate(rate);
      sessionRef.current.setPitch(pitch);
      sessionRef.current.setVoice(voiceUri);
    }
  }, [rate, pitch, voiceUri]);

  // Track text selection
  useEffect(() => {
    if (typeof document === "undefined") return;

    const checkSelection = () => {
      const text = getActiveSelectionText();
      setSelectedText(text);
    };

    document.addEventListener("selectionchange", checkSelection);
    document.addEventListener("mouseup", checkSelection);
    document.addEventListener("keyup", checkSelection);

    return () => {
      document.removeEventListener("selectionchange", checkSelection);
      document.removeEventListener("mouseup", checkSelection);
      document.removeEventListener("keyup", checkSelection);
    };
  }, []);

  const featureLabel = label ?? strings.features?.readAloud ?? "Read aloud";
  const featureDescription =
    description ??
    strings.readAloudDescription ??
    "Listen to page content or selected text using text-to-speech";

  const handlePlay = useCallback(() => {
    if (!sessionRef.current) return;
    setStatusMessage(null);

    const textToSpeak = extractReadAloudText();
    if (!textToSpeak) {
      setStatusMessage(
        strings.readAloudNoText ?? "No readable content found on this page.",
      );
      return;
    }

    sessionRef.current.speak(textToSpeak, {
      rate,
      pitch,
      voiceUri,
      onStart: () => onStart?.(),
      onEnd: () => onEnd?.(),
      onError: (err) => {
        setStatusMessage(err.message);
        onError?.(err);
      },
    });
  }, [rate, pitch, voiceUri, onStart, onEnd, onError, strings]);

  const handlePause = useCallback(() => {
    sessionRef.current?.pause();
  }, []);

  const handleResume = useCallback(() => {
    sessionRef.current?.resume();
  }, []);

  const handleStop = useCallback(() => {
    sessionRef.current?.stop();
    setStatusMessage(null);
  }, []);

  const isPlaying = sessionState.status === "playing";
  const isPaused = sessionState.status === "paused";
  const isActive = isPlaying || isPaused;

  const currentSpeedIdx = SPEED_STEPS.findIndex(
    (s) => Math.abs(s - rate) < 0.05,
  );
  const handleDecreaseRate = () => {
    const idx = currentSpeedIdx !== -1 ? currentSpeedIdx : 2;
    if (idx > 0) setRate(SPEED_STEPS[idx - 1]);
  };
  const handleIncreaseRate = () => {
    const idx = currentSpeedIdx !== -1 ? currentSpeedIdx : 2;
    if (idx < SPEED_STEPS.length - 1) setRate(SPEED_STEPS[idx + 1]);
  };

  const currentPitchIdx = PITCH_STEPS.findIndex(
    (p) => Math.abs(p - pitch) < 0.05,
  );
  const handleDecreasePitch = () => {
    const idx = currentPitchIdx !== -1 ? currentPitchIdx : 1;
    if (idx > 0) setPitch(PITCH_STEPS[idx - 1]);
  };
  const handleIncreasePitch = () => {
    const idx = currentPitchIdx !== -1 ? currentPitchIdx : 1;
    if (idx < PITCH_STEPS.length - 1) setPitch(PITCH_STEPS[idx + 1]);
  };

  return (
    <div
      className={`arap-read-aloud-card ${className}`}
      role="group"
      aria-labelledby={titleId}
    >
      <div className="arap-read-aloud-header">
        <div className="arap-read-aloud-title-row">
          <FeatureIcon name="readAloud" />
          <h3 id={titleId} className="arap-read-aloud-title">
            {featureLabel}
          </h3>
        </div>
        <p className="arap-read-aloud-desc">{featureDescription}</p>
      </div>

      {!isSupported ? (
        <div className="arap-read-aloud-unsupported" role="alert">
          <p>
            {strings.readAloudUnsupported ??
              "Text-to-speech is not supported in this browser."}
          </p>
        </div>
      ) : (
        <div className="arap-read-aloud-body">
          {/* Status Message */}
          {statusMessage && (
            <div
              className="arap-read-aloud-status-banner"
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </div>
          )}

          {/* Active Status Badge */}
          {isActive && (
            <div
              className="arap-read-aloud-badge"
              role="status"
              aria-live="polite"
            >
              <span className="arap-read-aloud-pulse" />
              <span>
                {isPlaying
                  ? (strings.readAloudStatusReading ?? "Reading...")
                  : (strings.readAloudStatusPaused ?? "Paused")}
                {sessionState.totalChunks > 0 &&
                  ` (${sessionState.currentChunkIndex + 1}/${sessionState.totalChunks})`}
              </span>
            </div>
          )}

          {/* Playback Controls */}
          <div className="arap-read-aloud-controls">
            {!isActive ? (
              <button
                type="button"
                className="arap-btn-action arap-read-aloud-play-btn"
                onClick={handlePlay}
                aria-label={
                  selectedText
                    ? (strings.readAloudPlaySelection ?? "Read selection")
                    : (strings.readAloudPlay ?? "Read aloud")
                }
              >
                <FeatureIcon name="play" />
                <span>
                  {selectedText
                    ? (strings.readAloudPlaySelection ?? "Read selection")
                    : (strings.readAloudPlay ?? "Read aloud")}
                </span>
              </button>
            ) : isPlaying ? (
              <button
                type="button"
                className="arap-btn-action arap-read-aloud-pause-btn"
                onClick={handlePause}
                aria-label={strings.readAloudPause ?? "Pause reading"}
              >
                <FeatureIcon name="pause" />
                <span>{strings.readAloudPause ?? "Pause"}</span>
              </button>
            ) : (
              <button
                type="button"
                className="arap-btn-action arap-read-aloud-resume-btn"
                onClick={handleResume}
                aria-label={strings.readAloudResume ?? "Resume reading"}
              >
                <FeatureIcon name="play" />
                <span>{strings.readAloudResume ?? "Resume"}</span>
              </button>
            )}

            <button
              type="button"
              className="arap-btn-secondary arap-read-aloud-stop-btn"
              onClick={handleStop}
              disabled={!isActive}
              aria-label={strings.readAloudStop ?? "Stop reading"}
            >
              <FeatureIcon name="stop" />
              <span>{strings.readAloudStop ?? "Stop"}</span>
            </button>
          </div>

          {/* Rate Controls */}
          <div className="arap-read-aloud-setting-row">
            <span className="arap-read-aloud-label">
              {strings.readAloudRate ?? "Speed"}
            </span>
            <div className="arap-controls">
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleDecreaseRate}
                disabled={rate <= SPEED_STEPS[0]}
                aria-label="Decrease reading speed"
              >
                −
              </button>
              <output className="arap-value" aria-live="polite">
                {rate}x
              </output>
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleIncreaseRate}
                disabled={rate >= SPEED_STEPS[SPEED_STEPS.length - 1]}
                aria-label="Increase reading speed"
              >
                +
              </button>
            </div>
          </div>

          {/* Pitch Controls */}
          <div className="arap-read-aloud-setting-row">
            <span className="arap-read-aloud-label">
              {strings.readAloudPitch ?? "Pitch"}
            </span>
            <div className="arap-controls">
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleDecreasePitch}
                disabled={pitch <= PITCH_STEPS[0]}
                aria-label="Decrease pitch"
              >
                −
              </button>
              <output className="arap-value" aria-live="polite">
                {pitch === 0.8 ? "Low" : pitch === 1.0 ? "Normal" : "High"}
              </output>
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleIncreasePitch}
                disabled={pitch >= PITCH_STEPS[PITCH_STEPS.length - 1]}
                aria-label="Increase pitch"
              >
                +
              </button>
            </div>
          </div>

          {/* Voice Selection */}
          {voices.length > 0 && (
            <div className="arap-read-aloud-setting-row arap-read-aloud-voice-row">
              <label htmlFor={voiceSelectId} className="arap-read-aloud-label">
                {strings.readAloudVoice ?? "Voice"}
              </label>
              <select
                id={voiceSelectId}
                className="arap-read-aloud-select"
                value={voiceUri ?? ""}
                onChange={(e) => setVoiceUri(e.target.value || null)}
              >
                <option value="">
                  {strings.readAloudDefaultVoice ?? "Default voice"}
                </option>
                {voices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Floating Read-Aloud Mini-Player Bar (shown when active) */}
      {mounted &&
        isActive &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="arap-read-aloud-bar"
            role="region"
            aria-label="Read aloud playback bar"
          >
            <div className="arap-read-aloud-bar-inner">
              <div className="arap-read-aloud-bar-icon">
                <FeatureIcon name="readAloud" />
              </div>

              <div className="arap-read-aloud-bar-text" aria-live="polite">
                <span className="arap-read-aloud-bar-chunk">
                  {sessionState.currentText
                    ? sessionState.currentText.length > 60
                      ? sessionState.currentText.slice(0, 57) + "..."
                      : sessionState.currentText
                    : (strings.readAloudStatusReading ?? "Reading...")}
                </span>
                <span className="arap-read-aloud-bar-meta">
                  {sessionState.currentChunkIndex + 1} /{" "}
                  {sessionState.totalChunks}
                </span>
              </div>

              <div className="arap-read-aloud-bar-actions">
                {isPlaying ? (
                  <button
                    type="button"
                    className="arap-read-aloud-bar-btn"
                    onClick={handlePause}
                    aria-label={strings.readAloudPause ?? "Pause"}
                  >
                    <FeatureIcon name="pause" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="arap-read-aloud-bar-btn"
                    onClick={handleResume}
                    aria-label={strings.readAloudResume ?? "Resume"}
                  >
                    <FeatureIcon name="play" />
                  </button>
                )}

                <button
                  type="button"
                  className="arap-read-aloud-bar-btn astop"
                  onClick={handleStop}
                  title="Stop reading (Esc)"
                  aria-label={strings.readAloudStop ?? "Stop reading"}
                >
                  <FeatureIcon name="stop" />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default ReadAloudController;
