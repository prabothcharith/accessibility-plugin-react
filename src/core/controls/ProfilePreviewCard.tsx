"use client";

import type { CSSProperties } from "react";
import type {
  AccessibilityPreferences,
  ProfileDefinition,
} from "../preferences/types";

export interface ProfilePreviewCardProps {
  profile: ProfileDefinition;
  isActive: boolean;
  onApply: (profile: ProfileDefinition) => void;
  onRevert: () => void;
  largeControls?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function formatPreferenceKey(key: string): string {
  switch (key) {
    case "fontScale":
    case "fontSize":
      return "Font Size";
    case "fontFamily":
      return "Font Family";
    case "lineHeight":
      return "Line Height";
    case "letterSpacing":
      return "Letter Spacing";
    case "wordSpacing":
      return "Word Spacing";
    case "paragraphSpacing":
      return "Paragraph Spacing";
    case "contrastMode":
    case "contrast":
      return "Contrast";
    case "reduceMotion":
      return "Reduce Motion";
    case "textAlign":
      return "Text Align";
    case "highlightLinks":
    case "linkHighlight":
      return "Highlight Links";
    case "highlightFocus":
    case "focusOutline":
      return "Focus Outline";
    case "cursorSize":
    case "bigCursor":
      return "Big Cursor";
    case "readerMode":
    case "readingMode":
      return "Reading Mode";
    case "readingGuide":
      return "Reading Guide";
    case "readingMask":
      return "Reading Mask";
    case "saturation":
      return "Saturation";
    case "grayscale":
      return "Grayscale";
    case "hideDecorativeImages":
    case "hideImages":
      return "Hide Images";
    case "hideVideos":
      return "Hide Videos";
    case "tooltips":
    case "accessibleTooltips":
      return "Tooltips";
    default: {
      const spaced = key.replace(/([A-Z])/g, " $1").trim();
      return spaced.charAt(0).toUpperCase() + spaced.slice(1);
    }
  }
}

export function formatPreferenceValue(
  key: keyof AccessibilityPreferences,
  val: unknown,
): string {
  if (typeof val === "boolean") return val ? "On" : "Off";
  if (key === "fontScale" && typeof val === "number")
    return `${Math.round(val * 100)}%`;
  if (key === "lineHeight" && typeof val === "number")
    return `${Math.round(val * 100)}%`;
  if (val === null || val === undefined) return "Original";
  const str = String(val);
  if (str === "dyslexia-option" || str === "dyslexia") return "Dyslexia";
  return str.includes("-") ? str.replace(/-/g, " ") : str;
}

export function ProfilePreviewCard({
  profile,
  isActive,
  onApply,
  onRevert,
  largeControls = false,
  className = "",
  style,
}: ProfilePreviewCardProps) {
  const affectedKeys = Object.keys(
    profile.settings,
  ) as (keyof AccessibilityPreferences)[];

  return (
    <div
      role="group"
      aria-label={`${profile.label} profile`}
      className={`arap-profile-card ${isActive ? "arap-profile-card-active" : ""} ${largeControls ? "arap-large-controls" : ""} ${className}`}
      style={style}
    >
      <div className="arap-profile-header">
        <div className="arap-profile-title-row">
          <h4 className="arap-profile-title">{profile.label}</h4>
          {isActive && (
            <span
              className="arap-profile-active-badge"
              aria-label="Active profile"
            >
              ✓ Active
            </span>
          )}
        </div>
        <p className="arap-profile-desc">{profile.description}</p>
      </div>

      <div className="arap-profile-affected">
        <span className="arap-profile-affected-label">Affected settings:</span>
        <div className="arap-profile-chips">
          {affectedKeys.map((key) => {
            const val = profile.settings[key];
            return (
              <span key={key} className="arap-profile-chip">
                <strong>{formatPreferenceKey(key)}:</strong>{" "}
                {formatPreferenceValue(key, val)}
              </span>
            );
          })}
        </div>
      </div>

      <div className="arap-profile-actions">
        {isActive ? (
          <button
            type="button"
            className="arap-btn-secondary arap-profile-revert-btn"
            onClick={onRevert}
            aria-label={`Revert ${profile.label} profile`}
          >
            Revert to custom settings
          </button>
        ) : (
          <button
            type="button"
            className="arap-btn-primary arap-profile-apply-btn"
            onClick={() => onApply(profile)}
            aria-label={`Apply ${profile.label} profile`}
          >
            Apply Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfilePreviewCard;
