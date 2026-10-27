"use client";

import {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useId,
} from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { AccessibilityContext } from "../core/AccessibilityContext";
import {
  isSpeechRecognitionSupported,
  createVoiceNavigationSession,
  executeVoiceCommand,
  VOICE_COMMANDS,
  VOICE_NAVIGATION_DISCLAIMER,
  type VoiceNavigationStatus,
  type VoiceNavigationResult,
  type VoiceNavigationSession,
  type VoiceCommandId,
} from "../core/voiceNavigation";

export interface VoiceNavigationControllerProps {
  className?: string;
  onCommandRecognized?: (result: VoiceNavigationResult) => void;
  onError?: (error: Error | string) => void;
}

export function VoiceNavigationController({
  className = "",
  onCommandRecognized,
  onError,
}: VoiceNavigationControllerProps = {}) {
  const context = useContext(AccessibilityContext);
  const headingIndexRef = useRef<number>(-1);
  const sessionRef = useRef<VoiceNavigationSession | null>(null);

  const [status, setStatus] = useState<VoiceNavigationStatus>(() =>
    isSpeechRecognitionSupported() ? "idle" : "unsupported",
  );
  const [lastResult, setLastResult] = useState<VoiceNavigationResult | null>(
    null,
  );
  const [showCommands, setShowCommands] = useState(false);
  const isSupported = isSpeechRecognitionSupported();

  const statusId = useId();
  const feedbackId = useId();

  const handleWidgetOpen = useCallback(() => {
    if (context && !context.isOpen) {
      context.toggleOpen();
    }
  }, [context]);

  const handleWidgetClose = useCallback(() => {
    if (context && context.isOpen) {
      context.closeMenu();
    }
  }, [context]);

  // Clean up voice session on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.destroy();
        sessionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setStatus("unsupported");
      return;
    }

    if (!sessionRef.current) {
      sessionRef.current = createVoiceNavigationSession({
        onStatusChange: (newStatus) => setStatus(newStatus),
        onCommandRecognized: (res) => {
          setLastResult(res);
          onCommandRecognized?.(res);
        },
        onError: (err) => {
          onError?.(err);
        },
        onWidgetOpen: handleWidgetOpen,
        onWidgetClose: handleWidgetClose,
      });
    }

    sessionRef.current.start();
  };

  const stopListening = () => {
    if (sessionRef.current) {
      sessionRef.current.stop();
    }
    setStatus("idle");
  };

  const toggleListening = () => {
    if (status === "listening" || status === "processing") {
      stopListening();
    } else {
      startListening();
    }
  };

  // Keyboard alternative executor for direct button clicks
  const handleManualAction = (commandId: VoiceCommandId) => {
    const execution = executeVoiceCommand(commandId, {
      onWidgetOpen: handleWidgetOpen,
      onWidgetClose: handleWidgetClose,
      currentHeadingIndexRef: headingIndexRef,
    });
    setLastResult({
      commandId,
      rawTranscript: `[Keyboard] ${commandId}`,
      normalizedTranscript: commandId,
      matched: true,
      feedback: execution.feedback,
      timestamp: Date.now(),
    });
  };

  const isListening = status === "listening" || status === "processing";

  return (
    <div
      className={`arap-feature arap-voice-nav ${className}`.trim()}
      role="group"
      aria-label="Voice Navigation"
    >
      <div className="arap-label">
        <FeatureIcon name="voiceNavigation" />
        <span>Voice Navigation</span>
        <span
          className="arap-prototype-pill"
          title="Research prototype - evaluates explicit voice commands safely"
        >
          Prototype
        </span>
      </div>

      <p className="arap-description">
        Navigate landmarks, control widget open/close, and scroll using native
        voice commands with local processing and zero audio storage.
      </p>

      {/* Primary Toggle / Trigger Control */}
      <div className="arap-voice-toggle-row">
        {isSupported ? (
          <button
            type="button"
            className={`arap-button arap-voice-toggle-btn ${
              isListening ? "arap-voice-btn-active" : ""
            }`}
            onClick={toggleListening}
            aria-pressed={isListening}
            aria-describedby={statusId}
          >
            <span
              className={`arap-voice-mic-dot ${
                isListening ? "arap-voice-mic-pulsing" : ""
              }`}
              aria-hidden="true"
            />
            {isListening ? "Stop Listening" : "Start Listening"}
          </button>
        ) : (
          <button
            type="button"
            className="arap-button arap-voice-toggle-btn"
            disabled
            aria-disabled="true"
            aria-describedby={statusId}
          >
            Voice Unavailable
          </button>
        )}

        <button
          type="button"
          className="arap-unsupported-toggle"
          onClick={() => setShowCommands((prev) => !prev)}
          aria-expanded={showCommands}
        >
          {showCommands ? "Hide commands" : "Show commands"}
        </button>
      </div>

      {/* Live Status and Announcements */}
      <div
        id={statusId}
        className="arap-voice-status"
        role="status"
        aria-live="polite"
      >
        {status === "listening" && (
          <span className="arap-voice-status-text arap-status-listening">
            <span className="arap-pulse-ring" aria-hidden="true" />
            Listening for voice commands... (Say &quot;help&quot; for options)
          </span>
        )}
        {status === "processing" && (
          <span className="arap-voice-status-text arap-status-processing">
            Processing command...
          </span>
        )}
        {status === "idle" && isSupported && (
          <span className="arap-voice-status-text">
            Voice listening is idle. Click start to activate.
          </span>
        )}
        {status === "unsupported" && (
          <span className="arap-voice-status-text arap-status-warning">
            Web Speech Recognition is not supported in this browser. Use the
            keyboard buttons below.
          </span>
        )}
        {status === "denied" && (
          <div className="arap-voice-denied-box">
            <span className="arap-status-warning">
              Microphone permission was denied. Please allow microphone access
              in your browser settings to use voice navigation.
            </span>
            <button
              type="button"
              className="arap-button arap-retry-btn"
              onClick={startListening}
            >
              Retry Permission
            </button>
          </div>
        )}
        {status === "timeout" && (
          <span className="arap-voice-status-text">
            Listening timed out after 30 seconds of inactivity. Click start to
            resume.
          </span>
        )}
        {status === "error" && (
          <span className="arap-voice-status-text arap-status-warning">
            A speech recognition error occurred. Click start to try again.
          </span>
        )}
      </div>

      {/* Feedback on Last Heard Command */}
      {lastResult && (
        <div
          id={feedbackId}
          className="arap-voice-feedback"
          role="status"
          aria-live="polite"
        >
          <div className="arap-feedback-row">
            <span className="arap-feedback-badge">
              {lastResult.matched ? "Matched" : "Unrecognized"}
            </span>
            <span className="arap-feedback-transcript">
              &quot;{lastResult.rawTranscript}&quot;
            </span>
          </div>
          <p className="arap-feedback-detail">{lastResult.feedback}</p>
        </div>
      )}

      {/* Accessible Keyboard Alternatives */}
      <div className="arap-voice-keyboard-alternatives">
        <span className="arap-keyboard-heading">Keyboard Alternatives:</span>
        <div
          className="arap-action-grid"
          role="toolbar"
          aria-label="Voice command keyboard alternatives"
        >
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("next_heading")}
            title="Jump to the next heading on the page"
          >
            Next Heading
          </button>
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("previous_heading")}
            title="Jump to the previous heading on the page"
          >
            Prev Heading
          </button>
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("scroll_down")}
            title="Scroll down 75% of viewport"
          >
            Scroll Down
          </button>
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("scroll_up")}
            title="Scroll up 75% of viewport"
          >
            Scroll Up
          </button>
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("scroll_top")}
            title="Scroll to top of page"
          >
            Scroll Top
          </button>
          <button
            type="button"
            className="arap-button arap-action-btn"
            onClick={() => handleManualAction("scroll_bottom")}
            title="Scroll to bottom of page"
          >
            Scroll Bottom
          </button>
        </div>
      </div>

      {/* Collapsible Supported Commands Cheat Sheet */}
      {showCommands && (
        <div
          className="arap-voice-commands-list"
          role="region"
          aria-label="Supported voice commands"
        >
          <table className="arap-commands-table">
            <thead>
              <tr>
                <th scope="col">Command</th>
                <th scope="col">Spoken Phrases</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {VOICE_COMMANDS.map((cmd) => (
                <tr key={cmd.id}>
                  <th scope="row" className="arap-cmd-label">
                    {cmd.label}
                  </th>
                  <td className="arap-cmd-phrases">
                    {cmd.phrases.map((p, idx) => (
                      <code key={idx} className="arap-phrase-tag">
                        {p}
                      </code>
                    ))}
                  </td>
                  <td className="arap-cmd-desc">{cmd.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Privacy and Prototype Disclaimer */}
      <div className="arap-disclaimer-notice">
        {VOICE_NAVIGATION_DISCLAIMER}
      </div>
    </div>
  );
}
