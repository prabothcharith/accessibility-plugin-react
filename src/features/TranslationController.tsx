import React, { useState, useEffect, useRef } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import {
  type TranslationAdapter,
  type TranslationConsentRecord,
  type TranslationSession,
  TRANSLATION_DISCLAIMER,
  createOfflineMockTranslationAdapter,
  translateHostContent,
} from "../core/translationAdapter";

export interface TranslationControllerProps {
  className?: string;
  label?: string;
  description?: string;
  provider?: TranslationAdapter;
  defaultTargetLanguage?: string;
}

const DEFAULT_TARGET_LANGUAGES = [
  { code: "es", label: "Spanish (Español)" },
  { code: "fr", label: "French (Français)" },
  { code: "de", label: "German (Deutsch)" },
  { code: "si", label: "Sinhala (සිංහල)" },
  { code: "ta", label: "Tamil (தமிழ்)" },
  { code: "ja", label: "Japanese (日本語)" },
  { code: "zh", label: "Chinese (中文)" },
];

export const TranslationController: React.FC<TranslationControllerProps> = ({
  className = "",
  label,
  description,
  provider: customProvider,
  defaultTargetLanguage = "es",
}) => {
  const { value: isTranslationEnabled, setValue: setIsTranslationEnabled } =
    useAccessibility<boolean>("translation", false);
  const [provider] = useState<TranslationAdapter>(() => {
    return customProvider || createOfflineMockTranslationAdapter();
  });

  const [targetLang, setTargetLang] = useState<string>(defaultTargetLanguage);
  const [consent, setConsent] = useState<TranslationConsentRecord>({
    status: "unprompted",
    userAcknowledgedRisks: false,
  });

  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [session, setSession] = useState<TranslationSession | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>(
    "Host content translation is ready. User consent required prior to translation.",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<boolean>(false);

  const sessionRef = useRef<TranslationSession | null>(null);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const displayLabel = label ?? "Page Translation";
  const displayDesc =
    description ??
    "Host-content translation adapter prototype with explicit consent, privacy boundaries, and DOM restoration.";

  // Teardown and restore on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current?.active) {
        sessionRef.current.restore();
      }
    };
  }, []);

  // Listen to external reset preference
  useEffect(() => {
    if (!isTranslationEnabled && sessionRef.current?.active) {
      sessionRef.current.restore();
      setSession(null);
      setLiveStatus("Translations restored to original content.");
    }
  }, [isTranslationEnabled]);

  const handleGrantConsent = () => {
    setConsent({
      status: "granted",
      grantedAt: Date.now(),
      providerId: provider.id,
      targetLanguage: targetLang,
      userAcknowledgedRisks: true,
    });
    setShowConsentModal(false);
    setLiveStatus("Consent granted. Ready to translate page content.");
  };

  const handleDenyConsent = () => {
    setConsent({
      status: "denied",
      userAcknowledgedRisks: false,
    });
    setShowConsentModal(false);
    setLiveStatus("Translation consent was declined.");
  };

  const handleRevokeConsent = () => {
    if (session?.active) {
      session.restore();
      setSession(null);
    }
    setConsent({
      status: "revoked",
      userAcknowledgedRisks: false,
    });
    setIsTranslationEnabled(false);
    setLiveStatus("Translation consent revoked and page content restored.");
  };

  const handleTranslateClick = async () => {
    if (consent.status !== "granted") {
      setShowConsentModal(true);
      return;
    }

    setErrorMessage(null);
    setIsTranslating(true);
    setLiveStatus(`Extracting and translating page text to ${targetLang}...`);

    try {
      // Revert previous session if active
      if (session?.active) {
        session.restore();
      }

      const newSession = await translateHostContent({
        provider,
        targetLanguage: targetLang,
        consentRecord: consent,
      });

      setSession(newSession);
      setIsTranslationEnabled(true);
      setLiveStatus(
        `Successfully translated ${newSession.translatedCount} elements to ${targetLang}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setLiveStatus(`Translation failed: ${msg}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRestoreClick = () => {
    if (session?.active) {
      session.restore();
      setSession(null);
      setIsTranslationEnabled(false);
      setLiveStatus("Page content restored to original text.");
    }
  };

  return (
    <div
      className={`arap-feature-item arap-translation-control ${className}`}
      data-testid="translation-controller"
    >
      <div className="arap-feature-header">
        <div className="arap-feature-title-row">
          <FeatureIcon name="translation" />
          <span className="arap-feature-name">{displayLabel}</span>
          <span
            className="arap-prototype-pill"
            aria-label="Research Prototype Feature"
          >
            Prototype
          </span>
        </div>
        <p className="arap-feature-desc">{displayDesc}</p>
      </div>

      <p className="arap-prototype-notice">{TRANSLATION_DISCLAIMER}</p>

      {/* Provider Details & Threat Model Boundary */}
      <div className="arap-translation-provider-meta">
        <span className="arap-provider-title">
          Adapter: <strong>{provider.name}</strong>
        </span>
        <span className="arap-provider-meta-item">
          Retention: {provider.dataRetention || "none"} | Residency:{" "}
          {provider.dataResidency || "client-only"}
        </span>
        {provider.privacyPolicyUrl && (
          <a
            href={provider.privacyPolicyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="arap-provider-privacy-link"
          >
            Privacy Policy
          </a>
        )}
      </div>

      {/* Consent Notice / Trigger */}
      {consent.status !== "granted" && (
        <div className="arap-translation-consent-banner" role="status">
          <p className="arap-consent-prompt">
            {consent.status === "denied"
              ? "Consent denied. Page text will not be transmitted."
              : consent.status === "revoked"
                ? "Consent revoked. No translations will be performed."
                : "Explicit user consent is required before transmitting host content."}
          </p>
          <button
            type="button"
            className="arap-action-btn arap-consent-open-btn"
            onClick={() => setShowConsentModal(true)}
            aria-expanded={showConsentModal}
          >
            Review & Grant Consent
          </button>
        </div>
      )}

      {/* Consent Review Modal / Panel */}
      {showConsentModal && (
        <div
          className="arap-translation-consent-dialog"
          role="region"
          aria-label="Translation Consent Agreement"
        >
          <h4 className="arap-consent-dialog-title">
            Host Content Translation Consent
          </h4>
          <ul className="arap-consent-points">
            <li>
              Visible text in the main document will be read and sent to the
              configured translation adapter (<strong>{provider.name}</strong>).
            </li>
            <li>
              Sensitive fields (passwords, auth tokens, credit cards, PII
              inputs, and iframes) are strictly excluded.
            </li>
            <li>
              Translations are machine-assisted and convenience-only; they do
              not guarantee legal or WCAG compliance accuracy.
            </li>
            <li>
              Translations can be reverted at any time, restoring original host
              text immediately.
            </li>
          </ul>
          <div className="arap-action-grid">
            <button
              type="button"
              className="arap-action-btn arap-consent-grant-btn"
              onClick={handleGrantConsent}
            >
              Grant Consent
            </button>
            <button
              type="button"
              className="arap-action-btn arap-consent-deny-btn"
              onClick={handleDenyConsent}
            >
              Deny
            </button>
          </div>
        </div>
      )}

      {/* Translation Controls (Available once consent is granted) */}
      {consent.status === "granted" && (
        <div className="arap-translation-active-panel">
          <div className="arap-translation-lang-row">
            <label
              htmlFor="arap-target-lang-select"
              className="arap-translation-lang-label"
            >
              Target Language:
            </label>
            <select
              id="arap-target-lang-select"
              className="arap-translation-select"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              disabled={isTranslating}
            >
              {DEFAULT_TARGET_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div className="arap-action-grid">
            <button
              type="button"
              className="arap-action-btn arap-translate-btn"
              onClick={handleTranslateClick}
              disabled={isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate Page"}
            </button>
            <button
              type="button"
              className="arap-action-btn arap-restore-btn"
              onClick={handleRestoreClick}
              disabled={!session?.active || isTranslating}
            >
              Restore Original
            </button>
          </div>

          <div className="arap-translation-revoke-row">
            <button
              type="button"
              className="arap-unsupported-toggle"
              onClick={handleRevokeConsent}
            >
              Revoke Translation Consent
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMessage && (
        <div className="arap-translation-error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Screen-reader Live Status */}
      <div
        className="arap-sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveStatus}
      </div>
    </div>
  );
};
