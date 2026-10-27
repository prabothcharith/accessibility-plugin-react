"use client";

import {
  useState,
  useEffect,
  useRef,
  useContext,
  useId,
  type ReactNode,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { FeatureIcon } from "../core/FeatureIcon";
import { resolveLocaleStrings } from "../core/i18n";
import { useAccessibility } from "../core/useAccessibility";
import {
  DEFAULT_SHORTCUTS,
  validateShortcutRemap,
  resolveActiveShortcut,
  parseKeyboardEventToCombo,
  isFormFieldOrEditable,
  type ShortcutDefinition,
} from "../core/shortcuts";

export interface KeyboardShortcutsControllerProps {
  className?: string;
  label?: string;
  description?: string;
}

const emptySubscribe = () => () => {};

export function KeyboardShortcutsController({
  className = "",
  label,
  description,
}: KeyboardShortcutsControllerProps) {
  const context = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(context?.locale);
  const stringMap = strings as unknown as Record<string, string | undefined>;


  const { value: shortcutsEnabled, setValue: setShortcutsEnabled } =
    useAccessibility<boolean>("shortcutsEnabled", false);

  const { value: customShortcuts, setValue: setCustomShortcuts } =
    useAccessibility<Record<string, string>>("customShortcuts", {});

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [remapTargetId, setRemapTargetId] = useState<string | null>(null);
  const [remapDraft, setRemapDraft] = useState<string>("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const remapInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const titleId = useId();
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const controllerLabel =
    label ?? strings.shortcutsTitle ?? "Keyboard Shortcuts";
  const controllerDescription =
    description ??
    strings.shortcutsDescription ??
    "Discover and customize accessibility keyboard shortcuts";
  const openLabel = strings.shortcutsOpen ?? "Open Keyboard Shortcuts";
  const closeLabel = strings.shortcutsClose ?? "Close Keyboard Shortcuts";

  const handleOpen = () => {
    if (typeof document !== "undefined") {
      previousActiveElement.current =
        document.activeElement as HTMLElement | null;
    }
    setStatusMessage(null);
    setRemapTargetId(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setRemapTargetId(null);
    setStatusMessage(null);
    if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    } else {
      triggerRef.current?.focus();
    }
  };

  const handleCloseRef = useRef(handleClose);
  useEffect(() => {
    handleCloseRef.current = handleClose;
  });

  // Focus management and Escape key in dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    dialogRef.current.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (remapTargetId) {
          setRemapTargetId(null);
          setStatusMessage("Remapping cancelled.");
          setIsError(false);
        } else {
          handleCloseRef.current();
        }
        return;
      }

      if (event.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, [isOpen, remapTargetId]);

  // Focus remap input when remap mode activates
  useEffect(() => {
    if (remapTargetId && remapInputRef.current) {
      remapInputRef.current.focus();
    }
  }, [remapTargetId]);

  // Global shortcuts listener when enabled
  useEffect(() => {
    if (!shortcutsEnabled || typeof window === "undefined") return;

    const onGlobalKeyDown = (e: KeyboardEvent) => {
      if (isFormFieldOrEditable(e.target)) return;

      const combo = parseKeyboardEventToCombo(e);
      if (!combo) return;

      const normCombo = combo.toLowerCase();

      for (const item of DEFAULT_SHORTCUTS) {
        const activeCombo = resolveActiveShortcut(
          item.id,
          customShortcuts || {},
        ).toLowerCase();
        if (normCombo === activeCombo) {
          e.preventDefault();
          e.stopPropagation();

          // Dispatch corresponding action
          if (item.id === "toggleWidget") {
            const btn = document.querySelector<HTMLButtonElement>(
              'button[aria-label="Accessibility"], button[aria-label="ප්‍රවේශ්‍යතාව"], button[aria-label="அணுகல்தன்மை"]',
            );
            btn?.click();
          } else if (item.id === "resetAll") {
            context?.resetAll();
          } else if (item.id === "shortcutsHelp") {
            handleOpen();
          } else if (item.id === "dictionary") {
            const dictBtn = document.querySelector<HTMLButtonElement>(
              'button[data-arap-feature="dictionary"]',
            );
            dictBtn?.click();
          } else if (item.id === "skipToMain") {
            const main = document.querySelector<HTMLElement>(
              "main, [role='main']",
            );
            if (main) {
              main.setAttribute("tabindex", "-1");
              main.scrollIntoView({ behavior: "smooth" });
              main.focus();
            }
          }
          break;
        }
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", onGlobalKeyDown);
    };
  }, [shortcutsEnabled, customShortcuts, context]);

  const handleStartRemap = (shortcut: ShortcutDefinition) => {
    setRemapTargetId(shortcut.id);
    setRemapDraft("");
    setStatusMessage(
      `Press desired key combination for ${stringMap[shortcut.labelKey] ?? shortcut.id}...`,
    );
    setIsError(false);
  };

  const handleRemapKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.key === "Escape") {
      setRemapTargetId(null);
      setStatusMessage("Remapping cancelled.");
      setIsError(false);
      return;
    }

    if (["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      return;
    }

    const combo = parseKeyboardEventToCombo(e.nativeEvent);
    if (!combo) return;

    setRemapDraft(combo);

    if (!remapTargetId) return;

    const validation = validateShortcutRemap(
      remapTargetId,
      combo,
      customShortcuts,
    );

    if (!validation.valid) {
      setIsError(true);
      setStatusMessage(validation.error || "Invalid shortcut.");
    } else {
      const updated = {
        ...(customShortcuts || {}),
        [remapTargetId]: validation.normalizedCombo!,
      };
      setCustomShortcuts(updated);
      setIsError(false);
      setStatusMessage(`Shortcut updated to ${validation.normalizedCombo}.`);
      setRemapTargetId(null);
    }
  };

  const handleResetShortcuts = () => {
    setCustomShortcuts({});
    setRemapTargetId(null);
    setIsError(false);
    setStatusMessage(strings.shortcutsReset ?? "Shortcuts reset to defaults.");
  };

  const filteredShortcuts = DEFAULT_SHORTCUTS.filter((s) => {
    if (activeCategory !== "all" && s.category !== activeCategory) {
      return false;
    }
    if (!search.trim()) return true;

    const query = search.toLowerCase();
    const labelText = (stringMap[s.labelKey] ?? s.id).toLowerCase();
    const descText = (stringMap[s.descriptionKey] ?? "").toLowerCase();
    const keyText = resolveActiveShortcut(s.id, customShortcuts).toLowerCase();

    return (
      labelText.includes(query) ||
      descText.includes(query) ||
      keyText.includes(query)
    );
  });

  const categories = [
    { id: "all", label: "All" },
    { id: "widget", label: "Widget" },
    { id: "navigation", label: "Navigation" },
    { id: "reading", label: "Reading" },
    { id: "tools", label: "Tools" },
  ];

  const dialogPortal: ReactNode =
    isClient && isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className="arap-shortcuts-backdrop"
            data-arap-ui=""
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleClose();
              }
            }}
          >
            <div
              ref={dialogRef}
              className="arap-shortcuts-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
            >
              <div className="arap-shortcuts-header">
                <div>
                  <h2 id={titleId} className="arap-shortcuts-title">
                    <FeatureIcon name="keyboardShortcuts" />
                    <span>{controllerLabel}</span>
                  </h2>
                  <p className="arap-shortcuts-subtitle">
                    {controllerDescription}
                  </p>
                </div>
                <button
                  type="button"
                  className="arap-shortcuts-close-btn"
                  onClick={handleClose}
                  aria-label={closeLabel}
                >
                  ×
                </button>
              </div>

              {/* Global shortcut toggle switch */}
              <div className="arap-shortcuts-global-toggle">
                <label className="arap-shortcuts-toggle-label">
                  <input
                    type="checkbox"
                    checked={Boolean(shortcutsEnabled)}
                    onChange={(e) => setShortcutsEnabled(e.target.checked)}
                    className="arap-checkbox"
                  />
                  <span>
                    <strong>
                      {strings.shortcutsEnabledLabel ??
                        "Enable Global Keyboard Shortcuts"}
                    </strong>
                    <span className="arap-shortcuts-toggle-desc">
                      Allows triggering accessibility tools with keyboard keys
                      from anywhere on the page
                    </span>
                  </span>
                </label>
              </div>

              {/* Filter controls */}
              <div className="arap-shortcuts-toolbar">
                <div
                  className="arap-shortcuts-categories"
                  role="tablist"
                  aria-label="Shortcut categories"
                >
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      role="tab"
                      aria-selected={activeCategory === c.id}
                      className={`arap-category-pill ${activeCategory === c.id ? "arap-category-pill-active" : ""}`}
                      onClick={() => setActiveCategory(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>

                <div className="arap-shortcuts-search">
                  <input
                    type="search"
                    className="arap-search-input"
                    placeholder={
                      strings.shortcutsSearchPlaceholder ??
                      "Filter shortcuts..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Filter shortcuts"
                  />
                </div>
              </div>

              {/* Status announcement */}
              {statusMessage && (
                <div
                  className={`arap-shortcuts-status ${isError ? "arap-shortcuts-status-error" : ""}`}
                  role="status"
                  aria-live="polite"
                >
                  {statusMessage}
                </div>
              )}

              {/* Remap Active Input Card */}
              {remapTargetId && (
                <div className="arap-shortcuts-remap-card">
                  <div className="arap-shortcuts-remap-header">
                    <strong>
                      Remapping:{" "}
                      {stringMap[
                        DEFAULT_SHORTCUTS.find((s) => s.id === remapTargetId)
                          ?.labelKey || ""
                      ] ?? remapTargetId}
                    </strong>
                    <button
                      type="button"
                      className="arap-btn-link"
                      onClick={() => setRemapTargetId(null)}
                    >
                      {strings.shortcutsCancel ?? "Cancel"}
                    </button>
                  </div>
                  <input
                    ref={remapInputRef}
                    type="text"
                    className="arap-remap-input"
                    value={
                      remapDraft || "Press combination (e.g. Alt+Shift+Z)..."
                    }
                    readOnly
                    onKeyDown={handleRemapKeyDown}
                    aria-label="Press key combination to remap"
                  />
                  <small className="arap-shortcuts-remap-help">
                    Press your new combination or Escape to cancel. Reserved
                    browser keys (e.g. Ctrl+U, Ctrl+R) are protected.
                  </small>
                </div>
              )}

              {/* Shortcuts List */}
              <div className="arap-shortcuts-list-container">
                {filteredShortcuts.length === 0 ? (
                  <div className="arap-navigator-empty" role="status">
                    No shortcuts match your search.
                  </div>
                ) : (
                  <ul className="arap-shortcuts-list" role="list">
                    {filteredShortcuts.map((shortcut) => {
                      const activeKey = resolveActiveShortcut(
                        shortcut.id,
                        customShortcuts,
                      );
                      const keyParts = activeKey.split("+");
                      const isCustom = Boolean(customShortcuts?.[shortcut.id]);

                      return (
                        <li key={shortcut.id} className="arap-shortcut-item">
                          <div className="arap-shortcut-info">
                            <span className="arap-shortcut-label">
                              {stringMap[shortcut.labelKey] ?? shortcut.id}
                              {isCustom && (
                                <span
                                  className="arap-badge-custom"
                                  title="Custom remapped shortcut"
                                >
                                  Custom
                                </span>
                              )}
                            </span>
                            <span className="arap-shortcut-desc">
                              {stringMap[shortcut.descriptionKey] ?? ""}
                            </span>
                          </div>

                          <div className="arap-shortcut-actions">
                            <div
                              className="arap-shortcut-keys"
                              aria-label={`Current key: ${activeKey}`}
                            >
                              {keyParts.map((kp, idx) => (
                                <span key={idx}>
                                  <kbd className="arap-kbd">{kp}</kbd>
                                  {idx < keyParts.length - 1 && " + "}
                                </span>
                              ))}
                            </div>

                            {shortcut.allowRemap && (
                              <button
                                type="button"
                                className="arap-btn-sm"
                                onClick={() => handleStartRemap(shortcut)}
                                aria-label={`Remap ${stringMap[shortcut.labelKey] ?? shortcut.id}`}
                              >
                                {strings.shortcutsRemap ?? "Remap"}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Footer */}
              <div className="arap-shortcuts-footer">
                <button
                  type="button"
                  className="arap-btn-secondary"
                  onClick={handleResetShortcuts}
                >
                  {strings.shortcutsReset ?? "Reset to Defaults"}
                </button>
                <button
                  type="button"
                  className="arap-btn-primary"
                  onClick={handleClose}
                >
                  {closeLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div
        className={`arap-feature arap-feature-expandable ${className}`}
        role="group"
        aria-label={controllerLabel}
      >
        <span className="arap-label">
          <FeatureIcon name="keyboardShortcuts" />
          <span>
            <span style={{ display: "block" }}>{controllerLabel}</span>
            <span
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 400,
                color: "var(--arap-muted, #64748b)",
                marginTop: "1px",
              }}
            >
              {controllerDescription}
            </span>
          </span>
        </span>
        <button
          ref={triggerRef}
          type="button"
          className="arap-btn-sm"
          onClick={handleOpen}
          aria-expanded={isOpen}
          aria-label={openLabel}
        >
          {openLabel}
        </button>
      </div>

      {dialogPortal}
    </>
  );
}

export default KeyboardShortcutsController;
