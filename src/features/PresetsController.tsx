"use client";

import { useId, useRef, useState, type ChangeEvent } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { EmptyState } from "../core/controls/FeatureStatusState";
import { usePresets } from "../core/usePresets";
import type { CustomPreset } from "../core/presets";
import type { AccessibilityPreferences } from "../core/preferences/types";

export interface PresetsControllerProps {
  className?: string;
  label?: string;
  description?: string;
  largeControls?: boolean;
}

export function PresetsController({
  className = "",
  label = "Custom Presets",
  description = "Save, restore, and transfer your settings",
  largeControls = false,
}: PresetsControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dialogId = "arap-presets-dialog";
  const nameInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const {
    presets,
    saveCurrentAsPreset,
    applyPreset,
    deletePreset,
    downloadExport,
    importFromFile,
  } = usePresets();

  const handleSave = () => {
    const trimmed = presetName.trim();
    if (!trimmed) {
      setErrorMessage("Please enter a name for your preset.");
      setStatusMessage("");
      return;
    }
    const created = saveCurrentAsPreset(trimmed);
    setPresetName("");
    setErrorMessage("");
    setStatusMessage(`Preset "${created.name}" saved successfully.`);
  };

  const handleApply = (preset: CustomPreset) => {
    const success = applyPreset(preset.id);
    if (success) {
      setErrorMessage("");
      setStatusMessage(`Preset "${preset.name}" applied.`);
    }
  };

  const handleDelete = (preset: CustomPreset) => {
    const success = deletePreset(preset.id);
    if (success) {
      setErrorMessage("");
      setStatusMessage(`Preset "${preset.name}" deleted.`);
    }
  };

  const handleExport = () => {
    downloadExport();
    setErrorMessage("");
    setStatusMessage("Settings and presets exported to JSON file.");
  };

  const handleFileInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importFromFile(file);
    if (result.success) {
      setErrorMessage("");
      setStatusMessage(result.message);
    } else {
      setStatusMessage("");
      setErrorMessage(result.error);
    }

    // Reset input so same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatKeyName = (key: string): string => {
    switch (key) {
      case "fontScale":
        return "Font Size";
      case "lineHeight":
        return "Line Height";
      case "contrastMode":
        return "Contrast";
      case "reduceMotion":
        return "Reduce Motion";
      case "textAlign":
        return "Text Align";
      case "highlightLinks":
        return "Highlight Links";
      case "highlightFocus":
        return "Highlight Focus";
      case "cursorSize":
        return "Cursor Size";
      case "readerMode":
        return "Reading Mode";
      case "saturation":
        return "Saturation";
      case "hideDecorativeImages":
        return "Hide Images";
      default:
        return key.replace(/([A-Z])/g, " $1").trim();
    }
  };

  const formatSettingValue = (
    key: keyof AccessibilityPreferences,
    val: unknown,
  ): string => {
    if (typeof val === "boolean") return val ? "On" : "Off";
    if (key === "fontScale" && typeof val === "number")
      return `${Math.round(val * 100)}%`;
    if (key === "lineHeight" && typeof val === "number")
      return `${Math.round(val * 100)}%`;
    if (val === null || val === undefined) return "Original";
    return String(val);
  };

  return (
    <div
      className={`arap-feature arap-feature-expandable ${largeControls ? "arap-large-controls" : ""} ${className}`}
      role="group"
      aria-label={label}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <span className="arap-label">
          <FeatureIcon name="presets" />
          <span>
            <span style={{ display: "block" }}>{label}</span>
            {description && (
              <span
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 400,
                  color: "var(--arap-muted, #64748b)",
                  marginTop: "1px",
                }}
              >
                {presets.length > 0
                  ? `${presets.length} custom preset${presets.length === 1 ? "" : "s"} saved`
                  : description}
              </span>
            )}
          </span>
        </span>
        <button
          ref={triggerRef}
          className="arap-btn-sm"
          type="button"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Presets"}
        </button>
      </div>

      {isOpen && (
        <div
          id={dialogId}
          role="region"
          aria-label="Custom Presets and Settings"
          tabIndex={-1}
          style={{
            marginTop: "12px",
            padding: "12px",
            borderRadius: "6px",
            backgroundColor: "var(--arap-card-bg, #f8fafc)",
            border: "1px solid var(--arap-border, #e2e8f0)",
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.stopPropagation();
              setIsOpen(false);
              triggerRef.current?.focus();
            }
          }}
        >
          {/* Live Status and Error Announcements */}
          <div
            role="status"
            aria-live="polite"
            className="arap-presets-status"
            style={{
              minHeight: statusMessage || errorMessage ? "24px" : "0",
              marginBottom: statusMessage || errorMessage ? "8px" : "0",
            }}
          >
            {statusMessage && (
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--arap-success, #16a34a)",
                  padding: "4px 8px",
                  backgroundColor: "rgba(22, 163, 74, 0.1)",
                  borderRadius: "4px",
                }}
              >
                ✓ {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div
                role="alert"
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "var(--arap-error, #dc2626)",
                  padding: "4px 8px",
                  backgroundColor: "rgba(220, 38, 38, 0.1)",
                  borderRadius: "4px",
                }}
              >
                ⚠ {errorMessage}
              </div>
            )}
          </div>

          {/* Save Current Configuration as New Preset */}
          <div
            className="arap-presets-save-section"
            style={{ marginBottom: "14px" }}
          >
            <label
              htmlFor={nameInputId}
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "4px",
                color: "var(--arap-text, #1e293b)",
              }}
            >
              Save current settings as preset:
            </label>
            <div style={{ display: "flex", gap: "6px" }}>
              <input
                id={nameInputId}
                type="text"
                className="arap-search-input"
                style={{ flex: 1, padding: "6px 10px", fontSize: "13px" }}
                value={presetName}
                onChange={(e) => {
                  setPresetName(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
                placeholder="Preset name (e.g. My Reading Setup)"
                aria-label="Preset name"
              />
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleSave}
                aria-label="Save current preset"
              >
                Save
              </button>
            </div>
          </div>

          {/* Backup & Transfer (Export / Import) */}
          <div
            className="arap-presets-transfer-section"
            style={{
              display: "flex",
              gap: "8px",
              marginBottom: "14px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--arap-border, #e2e8f0)",
            }}
          >
            <button
              type="button"
              className="arap-btn-sm"
              style={{ flex: 1 }}
              onClick={handleExport}
              aria-label="Export settings and presets to JSON file"
            >
              Export JSON
            </button>
            <button
              type="button"
              className="arap-btn-sm"
              style={{ flex: 1 }}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import settings and presets from JSON file"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              aria-label="Upload JSON settings file"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Saved Presets List */}
          <div className="arap-presets-list-section">
            <h4
              style={{
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "6px",
                color: "var(--arap-text, #1e293b)",
              }}
            >
              Saved Presets ({presets.length}):
            </h4>

            {presets.length === 0 ? (
              <EmptyState
                title="No saved presets yet"
                description="Configure your preferences and save them above for quick 1-click access."
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {presets.map((p) => {
                  const affectedKeys = Object.keys(
                    p.settings,
                  ) as (keyof AccessibilityPreferences)[];

                  return (
                    <div
                      key={p.id}
                      className="arap-preset-card"
                      role="group"
                      aria-label={`${p.name} preset`}
                      style={{
                        padding: "8px 10px",
                        borderRadius: "6px",
                        backgroundColor: "var(--arap-bg, #ffffff)",
                        border: "1px solid var(--arap-border, #e2e8f0)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                        }}
                      >
                        <div>
                          <strong
                            style={{
                              fontSize: "13px",
                              color: "var(--arap-text, #1e293b)",
                            }}
                          >
                            {p.name}
                          </strong>
                          <span
                            style={{
                              display: "block",
                              fontSize: "10px",
                              color: "var(--arap-muted, #64748b)",
                            }}
                          >
                            Saved {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "6px",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            className="arap-btn-sm"
                            onClick={() => handleApply(p)}
                            aria-label={`Apply preset ${p.name}`}
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            className="arap-btn-sm"
                            onClick={() => handleDelete(p)}
                            aria-label={`Delete preset ${p.name}`}
                            style={{
                              color: "var(--arap-error, #dc2626)",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {affectedKeys.length > 0 && (
                        <div
                          className="arap-profile-chips"
                          style={{ marginTop: "4px" }}
                        >
                          {affectedKeys.map((key) => {
                            const val = p.settings[key];
                            return (
                              <span key={key} className="arap-profile-chip">
                                <strong>{formatKeyName(key)}:</strong>{" "}
                                {formatSettingValue(key, val)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Aliases for compatibility
export const CustomPresetsController = PresetsController;
export const SettingsImportExportController = PresetsController;
export const PresetsBackupController = PresetsController;
