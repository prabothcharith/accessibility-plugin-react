import React, { useState, useEffect, useRef } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { useAccessibility } from "../core/useAccessibility";
import {
  type TranslationAdapter,
  type TranslationConsentRecord,
  type TranslationSession,
  TRANSLATION_DISCLAIMER,
  createGoogleTranslateAdapter,
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
  { code: "ar", label: "Arabic (العربية)" },
  { code: "hi", label: "Hindi (हिन्दी)" },
  { code: "pt", label: "Portuguese (Português)" },
  { code: "ru", label: "Russian (Русский)" },
  { code: "ko", label: "Korean (한국어)" },
  { code: "it", label: "Italian (Italiano)" },
  { code: "nl", label: "Dutch (Nederlands)" },
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
    return customProvider || createGoogleTranslateAdapter();
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
  const extraRestoresRef = useRef<Array<() => void>>([]);
  const isApplyingMutationRef = useRef<boolean>(false);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const restoreAllActive = () => {
    while (extraRestoresRef.current.length > 0) {
      const fn = extraRestoresRef.current.pop();
      fn?.();
    }
    if (sessionRef.current?.active) {
      sessionRef.current.restore();
    }
  };

  const displayLabel = label ?? "Page Translation";
  const displayDesc =
    description ??
    "Host-content translation adapter prototype with explicit consent, privacy boundaries, and DOM restoration.";

  // Teardown and restore on unmount
  useEffect(() => {
    return () => {
      restoreAllActive();
    };
  }, []);

  // Listen to external reset preference
  useEffect(() => {
    if (!isTranslationEnabled && sessionRef.current?.active) {
      restoreAllActive();
      setSession(null);
      setLiveStatus("Translations restored to original content.");
    }
  }, [isTranslationEnabled]);

  const runTranslation = async (
    nextLang: string,
    consentRecord: TranslationConsentRecord = consent,
  ) => {
    setErrorMessage(null);
    setIsTranslating(true);
    setLiveStatus(`Extracting and translating page text to ${nextLang}...`);

    try {
      isApplyingMutationRef.current = true;
      restoreAllActive();

      const newSession = await translateHostContent({
        provider,
        targetLanguage: nextLang,
        consentRecord,
      });

      setSession(newSession);
      sessionRef.current = newSession;
      setIsTranslationEnabled(true);
      const langLabel =
        DEFAULT_TARGET_LANGUAGES.find((l) => l.code === nextLang)?.label ??
        nextLang;
      setLiveStatus(
        `Translated ${newSession.translatedCount} text segments to ${langLabel}.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
      setLiveStatus(`Translation failed: ${msg}`);
    } finally {
      isApplyingMutationRef.current = false;
      setIsTranslating(false);
    }
  };

  // Observe newly inserted host DOM nodes while translation session is active
  useEffect(() => {
    if (
      !session?.active ||
      consent.status !== "granted" ||
      typeof MutationObserver === "undefined"
    ) {
      return;
    }

    let pendingTimer: number | null = null;
    const pendingRoots = new Set<Element>();

    const flushPending = async () => {
      const roots = Array.from(pendingRoots).filter(
        (el) =>
          el.isConnected &&
          !el.closest("[data-arap-ui], [data-arap-diagnostics], .arap-root"),
      );
      pendingRoots.clear();
      if (roots.length === 0 || !sessionRef.current?.active) return;

      isApplyingMutationRef.current = true;
      try {
        for (const rootEl of roots) {
          const addedSession = await translateHostContent({
            rootElement: rootEl,
            provider,
            targetLanguage: targetLang,
            consentRecord: consent,
          });
          if (addedSession.active) {
            extraRestoresRef.current.push(addedSession.restore);
          }
        }
      } catch {
        // Ignore transient dynamic DOM translation errors
      } finally {
        isApplyingMutationRef.current = false;
      }
    };

    const observer = new MutationObserver((mutations) => {
      if (isApplyingMutationRef.current) return;
      let queued = false;
      for (const m of mutations) {
        if (m.type !== "childList") continue;
        m.addedNodes.forEach((node) => {
          const el =
            node.nodeType === Node.ELEMENT_NODE
              ? (node as Element)
              : node.parentElement;
          if (
            el &&
            !el.closest("[data-arap-ui], [data-arap-diagnostics], .arap-root")
          ) {
            pendingRoots.add(el);
            queued = true;
          }
        });
      }
      if (queued) {
        if (pendingTimer !== null) window.clearTimeout(pendingTimer);
        pendingTimer = window.setTimeout(() => {
          void flushPending();
        }, 60);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      if (pendingTimer !== null) window.clearTimeout(pendingTimer);
      observer.disconnect();
    };
  }, [session?.active, consent, provider, targetLang]);

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
    restoreAllActive();
    setSession(null);
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

    await runTranslation(targetLang, consent);
  };

  const handleLanguageChange = (nextLang: string) => {
    setTargetLang(nextLang);
    if (session?.active && consent.status === "granted") {
      void runTranslation(nextLang, consent);
    }
  };

  const handleRestoreClick = () => {
    if (session?.active) {
      restoreAllActive();
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
            className="arap-btn-primary arap-consent-open-btn"
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
              className="arap-btn-primary arap-consent-grant-btn"
              onClick={handleGrantConsent}
            >
              Grant Consent
            </button>
            <button
              type="button"
              className="arap-btn-secondary arap-consent-deny-btn"
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
              className="arap-select arap-translation-select"
              value={targetLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
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
              className="arap-btn-primary arap-translate-btn"
              onClick={handleTranslateClick}
              disabled={isTranslating}
            >
              {isTranslating ? "Translating..." : "Translate Page"}
            </button>
            <button
              type="button"
              className="arap-btn-secondary arap-restore-btn"
              onClick={handleRestoreClick}
              disabled={!session?.active || isTranslating}
            >
              Restore Original
            </button>
          </div>

          <div className="arap-translation-revoke-row">
            <button
              type="button"
              className="arap-btn-ghost arap-translation-revoke-btn"
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

      {/* Visible & Screen-reader Live Status */}
      <div
        className={`arap-translation-status-banner ${session?.active ? "arap-is-active" : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {liveStatus}
      </div>
    </div>
  );
};
