"use client";

import { useContext, useId, useRef, useState, type ChangeEvent } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { EmptyState } from "../core/controls/FeatureStatusState";
import { ModalDialog } from "../core/controls/ModalDialog";
import {
  formatPreferenceKey,
  formatPreferenceValue,
} from "../core/controls/ProfilePreviewCard";
import { usePresets } from "../core/usePresets";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
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
  label,
  description = "Save, restore, and transfer your settings",
  largeControls = false,
}: PresetsControllerProps = {}) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const effectiveLabel = label ?? strings.features?.presets ?? "Custom Presets";

  const [isOpen, setIsOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const dialogId = "arap-presets-dialog";
  const nameInputId = useId();
  const fileInputId = useId();
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
    setStatusMessage(
      strings.formatPresetSaved
        ? strings.formatPresetSaved(created.name)
        : `Preset "${created.name}" saved successfully.`,
    );
  };

  const handleApply = (preset: CustomPreset) => {
    const success = applyPreset(preset.id);
    if (success) {
      setErrorMessage("");
      setStatusMessage(
        strings.formatPresetApplied
          ? strings.formatPresetApplied(preset.name)
          : `Preset "${preset.name}" applied.`,
      );
    }
  };

  const handleDelete = (preset: CustomPreset) => {
    const success = deletePreset(preset.id);
    if (success) {
      setErrorMessage("");
      setStatusMessage(
        strings.formatPresetDeleted
          ? strings.formatPresetDeleted(preset.name)
          : `Preset "${preset.name}" deleted.`,
      );
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

  return (
    <div
      className={`arap-feature arap-feature-expandable ${largeControls ? "arap-large-controls" : ""} ${className}`}
      role="group"
      aria-label={effectiveLabel}
    >
      <div className="arap-feature-row-between">
        <span className="arap-label">
          <FeatureIcon name="presets" />
          <span>
            <span className="arap-label-title">{effectiveLabel}</span>
            {description && (
              <span className="arap-label-sub">
                {presets.length > 0
                  ? `${presets.length} custom preset${presets.length === 1 ? "" : "s"} saved`
                  : description}
              </span>
            )}
          </span>
        </span>
        <button
          ref={triggerRef}
          className="arap-btn-secondary arap-btn-compact"
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={dialogId}
          onClick={() => setIsOpen(!isOpen)}
          title="Manage saved presets and JSON import/export"
        >
          {isOpen ? "Close" : "Presets"}
        </button>
      </div>

      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        id="arap-presets-modal"
        title={effectiveLabel}
        subtitle={description}
        icon={<FeatureIcon name="presets" />}
        closeLabel="Close presets dialog"
        size="full"
        lockScroll={false}
        returnFocusTo={triggerRef}
      >
        <div
          id={dialogId}
          role="region"
          aria-label="Custom Presets and Settings"
          className="arap-presets-panel"
          tabIndex={-1}
        >
          {/* Live Status and Error Announcements */}
          <div role="status" aria-live="polite" className="arap-presets-status">
            {statusMessage && (
              <div className="arap-presets-status-success">
                ✓ {statusMessage}
              </div>
            )}
            {errorMessage && (
              <div role="alert" className="arap-presets-status-error">
                ⚠ {errorMessage}
              </div>
            )}
          </div>

          {/* Save Current Configuration as New Preset */}
          <div className="arap-presets-save-section">
            <label htmlFor={nameInputId} className="arap-field-label">
              Save current settings as preset:
            </label>
            <div className="arap-presets-save-row">
              <input
                id={nameInputId}
                type="text"
                className="arap-input arap-search-input"
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
                className="arap-btn-primary arap-btn-compact"
                onClick={handleSave}
                aria-label="Save current preset"
              >
                Save
              </button>
            </div>
          </div>

          {/* Backup & Transfer (Export / Import) */}
          <div className="arap-presets-transfer-section">
            <button
              type="button"
              className="arap-btn-secondary"
              onClick={handleExport}
              aria-label="Export settings and presets to JSON file"
            >
              Export JSON
            </button>
            <button
              type="button"
              className="arap-btn-secondary"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Import settings and presets from JSON file"
            >
              Import JSON
            </button>
            <input
              ref={fileInputRef}
              id={fileInputId}
              name="arap-preset-import"
              type="file"
              accept=".json,application/json"
              style={{ display: "none" }}
              aria-label="Upload JSON settings file"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Saved Presets List */}
          <div className="arap-presets-list-section">
            <h4 className="arap-presets-list-heading">
              Saved Presets ({presets.length}):
            </h4>

            {presets.length === 0 ? (
              <EmptyState
                title="No saved presets yet"
                description="Configure your preferences and save them above for quick 1-click access."
              />
            ) : (
              <div className="arap-presets-grid">
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
                    >
                      <div className="arap-preset-card-top">
                        <div className="arap-preset-card-meta">
                          <strong className="arap-preset-card-title">
                            {p.name}
                          </strong>
                          <span className="arap-preset-card-date">
                            Saved {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="arap-preset-card-actions">
                          <button
                            type="button"
                            className="arap-btn-primary arap-btn-compact"
                            onClick={() => handleApply(p)}
                            aria-label={`Apply preset ${p.name}`}
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            className="arap-btn-danger arap-btn-compact"
                            onClick={() => handleDelete(p)}
                            aria-label={`Delete preset ${p.name}`}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {affectedKeys.length > 0 && (
                        <div className="arap-profile-chips">
                          {affectedKeys.map((key) => {
                            const val = p.settings[key];
                            return (
                              <span key={key} className="arap-profile-chip">
                                <strong>{formatPreferenceKey(key)}:</strong>{" "}
                                {formatPreferenceValue(key, val)}
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
      </ModalDialog>
    </div>
  );
}

// Aliases for compatibility
export const CustomPresetsController = PresetsController;
export const SettingsImportExportController = PresetsController;
export const PresetsBackupController = PresetsController;
