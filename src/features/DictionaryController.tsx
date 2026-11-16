"use client";

import { useState, useRef, useCallback, useContext, useId } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { ModalDialog } from "../core/controls/ModalDialog";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
import {
  type DictionaryProvider,
  type DictionaryLookupResult,
  lookupWord,
  sanitizeLookupTerm,
} from "../core/dictionary";

export interface DictionaryControllerProps {
  className?: string;
  label?: string;
  description?: string;
  provider?: DictionaryProvider | null;
  defaultOpen?: boolean;
  initialTerm?: string;
}

/**
 * Accessible dictionary modal controller.
 * Implements A11Y-403:
 * - Explicit user action lookup (never looks up automatically on hover or selection)
 * - Zero network requests by default (100% offline static dictionary fallback)
 * - Strict sanitization and sensitive data rejection
 * - Truthful unknown responses (never hallucinates definitions)
 * - Focus returns to trigger button after close
 * - Modal focus trapping with Escape key support
 */
export function DictionaryController({
  className = "",
  label,
  description,
  provider,
  defaultOpen = false,
  initialTerm = "",
}: DictionaryControllerProps) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const locale = ctx?.locale ?? "en";

  const displayLabel = label ?? strings.dictionaryTitle ?? "Dictionary";
  const displayDesc =
    description ??
    strings.dictionaryDescription ??
    "Look up definitions and accessibility terminology";

  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<DictionaryLookupResult | null>(null);
  const [liveStatus, setLiveStatus] = useState<string>("");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchInputId = useId();

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const performLookup = useCallback(
    async (termToLookup: string) => {
      const sanitized = sanitizeLookupTerm(termToLookup);
      if (!sanitized.valid) {
        setResult({ found: false, error: sanitized.error });
        setLiveStatus(sanitized.error ?? "Invalid search term.");
        return;
      }

      setIsSearching(true);
      setLiveStatus(strings.dictionaryStatusSearching ?? "Searching...");

      try {
        const lookupRes = await lookupWord(sanitized.sanitized, {
          locale,
          provider,
        });
        setResult(lookupRes);

        if (lookupRes.found && lookupRes.entry) {
          const foundMsg = strings.dictionaryStatusFound
            ? strings.dictionaryStatusFound(lookupRes.entry.word)
            : `Definition found for "${lookupRes.entry.word}".`;
          setLiveStatus(foundMsg);
        } else if (lookupRes.error) {
          setLiveStatus(lookupRes.error);
        } else {
          const notFoundMsg = strings.dictionaryStatusNotFound
            ? strings.dictionaryStatusNotFound(sanitized.sanitized)
            : `No definition found for "${sanitized.sanitized}".`;
          setLiveStatus(notFoundMsg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : "Lookup failed. Please try again.";
        setResult({ found: false, error: errorMsg });
        setLiveStatus(errorMsg);
      } finally {
        setIsSearching(false);
      }
    },
    [locale, provider, strings],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = searchInputRef.current?.value ?? searchTerm;
    if (term.trim()) {
      setSearchTerm(term);
      void performLookup(term);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    setResult(null);
    setLiveStatus("");
    searchInputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    void performLookup(suggestion);
  };

  return (
    <div className={`arap-dictionary-control ${className}`}>
      {/* Trigger Button in Widget */}
      <button
        ref={triggerRef}
        type="button"
        className="arap-feature-btn"
        onClick={handleOpen}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? "arap-dictionary-dialog" : undefined}
        data-arap-feature="dictionary"
        aria-label={`${displayLabel}: ${displayDesc}`}
      >
        <span className="arap-feature-btn-icon" aria-hidden="true">
          <FeatureIcon name="dictionary" />
        </span>
        <span className="arap-feature-btn-content">
          <span className="arap-feature-btn-label">{displayLabel}</span>
          <span className="arap-feature-btn-desc">{displayDesc}</span>
        </span>
      </button>

      {/* Accessible Modal Dialog */}
      <ModalDialog
        isOpen={isOpen}
        onClose={handleClose}
        id="arap-dictionary-dialog"
        title={displayLabel}
        subtitle={displayDesc}
        icon={<FeatureIcon name="dictionary" />}
        closeLabel={strings.dictionaryCloseDialog ?? "Close dictionary"}
        size="full"
        lockScroll={false}
        initialFocusRef={searchInputRef}
        returnFocusTo={triggerRef}
      >
        <div className="arap-dict-dialog-body">
          {/* Live status announcements */}
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="arap-sr-only"
          >
            {liveStatus}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="arap-dict-search-form">
            <div className="arap-dict-search-wrapper">
              <input
                ref={searchInputRef}
                id={searchInputId}
                name="arap-dictionary-query"
                type="search"
                className="arap-dict-input"
                placeholder={
                  strings.dictionarySearchPlaceholder ??
                  "Type a word to look up..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label={
                  strings.dictionarySearchPlaceholder ??
                  "Type a word to look up..."
                }
                maxLength={50}
                autoComplete="off"
                spellCheck="false"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="arap-search-clear arap-dict-clear-btn"
                  onClick={handleClear}
                  aria-label={strings.dictionaryClearButton ?? "Clear word"}
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className="arap-btn-primary arap-dict-submit-btn"
              disabled={isSearching}
            >
              {isSearching
                ? (strings.dictionaryStatusSearching ?? "Searching...")
                : (strings.dictionaryLookupButton ?? "Look up")}
            </button>
          </form>

          {/* Content Area */}
          <div className="arap-dict-content">
            {result?.found && result.entry && (
              <article className="arap-dict-result" aria-live="polite">
                <header className="arap-dict-result-header">
                  <h3 className="arap-dict-word">{result.entry.word}</h3>
                  {result.entry.phonetic && (
                    <span className="arap-dict-phonetic">
                      {result.entry.phonetic}
                    </span>
                  )}
                  {result.entry.partOfSpeech && (
                    <span className="arap-dict-badge-pos">
                      {result.entry.partOfSpeech}
                    </span>
                  )}
                  <span className="arap-dict-source-badge">
                    {result.entry.source === "local"
                      ? (strings.dictionarySourceLocal ?? "Built-in Glossary")
                      : (provider?.name ??
                        strings.dictionarySourceProvider ??
                        "Configured Provider")}
                  </span>
                </header>

                <p className="arap-dict-definition">
                  {result.entry.definition}
                </p>

                {result.entry.example && (
                  <blockquote className="arap-dict-example">
                    <span className="arap-dict-example-label">
                      {strings.dictionaryExampleLabel ?? "Example"}:
                    </span>{" "}
                    “{result.entry.example}”
                  </blockquote>
                )}
              </article>
            )}

            {result && !result.found && (
              <div className="arap-dict-not-found" role="alert">
                <p className="arap-dict-not-found-msg">
                  {result.error ??
                    (strings.dictionaryStatusNotFound
                      ? strings.dictionaryStatusNotFound(
                          result.term ?? searchTerm,
                        )
                      : `No definition found for "${result.term ?? searchTerm}".`)}
                </p>

                {result.suggestions && result.suggestions.length > 0 && (
                  <div className="arap-dict-suggestions">
                    <h4 className="arap-dict-suggestions-heading">
                      {strings.dictionarySuggestionsTitle ?? "Did you mean:"}
                    </h4>
                    <div className="arap-dict-suggestions-list">
                      {result.suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="arap-dict-suggestion-chip"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!result && (
              <div className="arap-dict-intro">
                <p>
                  {strings.dictionaryDescription ??
                    "Look up definitions and accessibility terminology"}
                </p>
                <div className="arap-dict-suggestions arap-dict-starter-chips">
                  <h4 className="arap-dict-suggestions-heading">
                    Popular terms:
                  </h4>
                  <div className="arap-dict-suggestions-list">
                    {[
                      "accessibility",
                      "contrast",
                      "dyslexia",
                      "voice",
                      "wcag",
                      "screen reader",
                    ].map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className="arap-dict-suggestion-chip"
                        onClick={() => handleSuggestionClick(chip)}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="arap-dict-privacy-note">
                  {provider
                    ? `Using ${provider.name}. Queries are rate-limited and sanitized.`
                    : "Using local offline glossary. Zero network transmission."}
                </p>
              </div>
            )}
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}

export default DictionaryController;
