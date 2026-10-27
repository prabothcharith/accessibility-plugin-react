"use client";

import { useContext, useId, useMemo, useRef, useState } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { ProfilePreviewCard } from "../core/controls/ProfilePreviewCard";
import { EmptyState, SearchCount } from "../core/controls/FeatureStatusState";
import { useProfiles } from "../core/useProfiles";
import { AccessibilityContext } from "../core/AccessibilityContext";
import { resolveLocaleStrings } from "../core/i18n";
import type { ProfilePresetId } from "../core/preferences/types";

export interface ProfilesControllerProps {
  className?: string;
  label?: string;
  description?: string;
  largeControls?: boolean;
  onProfileChange?: (profileId: ProfilePresetId | null) => void;
}

/**
 * Controller to preview, apply, and revert eight neutral accessibility profile suggestions.
 * Follows a deterministic override model where user explicit choices survive profile reversal.
 * Guaranteed zero implicit audio, speech synthesis, or microphone activation.
 */
export function ProfilesController({
  className = "",
  label,
  description = "Explore suggested preference combinations",
  largeControls = false,
  onProfileChange,
}: ProfilesControllerProps) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const effectiveLabel =
    label ?? strings.features?.profiles ?? "Accessibility Profiles";

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dialogId = "arap-profiles-dialog";
  const searchInputId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);

  const {
    profiles,
    activeProfile,
    activeProfileState,
    applyProfile,
    revertProfile,
    isProfileActive,
  } = useProfiles();

  const handleApply = (profileId: ProfilePresetId) => {
    applyProfile(profileId);
    onProfileChange?.(profileId);
  };

  const handleRevert = () => {
    revertProfile();
    onProfileChange?.(null);
  };

  const filteredProfiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter((p) => {
      const nameMatch = p.label.toLowerCase().includes(q);
      const descMatch = p.description.toLowerCase().includes(q);
      const settingMatch = Object.keys(p.settings).some((k) =>
        k.toLowerCase().includes(q),
      );
      return nameMatch || descMatch || settingMatch;
    });
  }, [profiles, search]);

  const hasOverrides =
    Boolean(activeProfileState?.overrides) &&
    Object.keys(activeProfileState?.overrides ?? {}).length > 0;

  return (
    <div
      className={`arap-feature arap-feature-expandable ${largeControls ? "arap-large-controls" : ""} ${className}`}
      role="group"
      aria-label={effectiveLabel}
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
          <FeatureIcon name="profiles" />
          <span>
            <span style={{ display: "block" }}>{effectiveLabel}</span>
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
                {activeProfile ? (
                  <span
                    style={{
                      color: "var(--arap-primary, #2563eb)",
                      fontWeight: 500,
                    }}
                  >
                    Active: {activeProfile.label}
                    {hasOverrides && " (Customized)"}
                  </span>
                ) : (
                  description
                )}
              </span>
            )}
          </span>
        </span>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {activeProfile && (
            <button
              type="button"
              className="arap-btn-sm"
              onClick={handleRevert}
              aria-label="Revert active profile to custom settings"
              title="Revert to custom settings"
            >
              Revert
            </button>
          )}
          <button
            ref={triggerRef}
            className="arap-btn-sm"
            type="button"
            aria-expanded={isOpen}
            aria-controls={dialogId}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Close" : "Browse"}
          </button>
        </div>
      </div>

      {isOpen && (
        <div
          id={dialogId}
          className="arap-profiles-panel"
          style={{
            marginTop: "12px",
            paddingTop: "12px",
            borderTop: "1px solid var(--arap-divider, #e2e8f0)",
          }}
        >
          {activeProfile && (
            <div
              className="arap-profile-active-banner"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                marginBottom: "12px",
                background: "rgba(37, 99, 235, 0.08)",
                border: "1px solid rgba(37, 99, 235, 0.2)",
                borderRadius: "6px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "block",
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "var(--arap-primary, #2563eb)",
                  }}
                >
                  ✓ Current Profile: {activeProfile.label}
                </span>
                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    color: "var(--arap-muted, #64748b)",
                  }}
                >
                  {hasOverrides
                    ? "Your custom adjustments survive alongside this profile."
                    : "Neutral suggestion applied. Adjust any setting freely."}
                </span>
              </div>
              <button
                type="button"
                className="arap-btn-sm"
                onClick={handleRevert}
                aria-label="Revert active profile"
              >
                Revert to Custom
              </button>
            </div>
          )}

          <div
            className="arap-navigator-search"
            style={{ marginBottom: "10px" }}
          >
            <label htmlFor={searchInputId} className="arap-sr-only">
              Filter profiles
            </label>
            <input
              id={searchInputId}
              type="search"
              className="arap-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                strings.searchPlaceholder ??
                "Search 8 accessibility profiles..."
              }
              aria-label="Filter profiles"
            />
            {search && (
              <button
                type="button"
                className="arap-search-clear"
                onClick={() => setSearch("")}
                aria-label={strings.searchClearLabel ?? "Clear profile filter"}
              >
                ×
              </button>
            )}
          </div>

          <SearchCount
            totalCount={profiles.length}
            matchedCount={filteredProfiles.length}
            query={search}
          />

          <div
            className="arap-profiles-list"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            {filteredProfiles.length === 0 ? (
              <EmptyState
                title="No profiles found"
                description={`No accessibility profiles match "${search}".`}
                actionLabel="Clear filter"
                onAction={() => setSearch("")}
              />
            ) : (
              filteredProfiles.map((p) => (
                <ProfilePreviewCard
                  key={p.id}
                  profile={p}
                  isActive={isProfileActive(p.id)}
                  onApply={() => handleApply(p.id)}
                  onRevert={handleRevert}
                  largeControls={largeControls}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Aliases for compatibility
export const ProfileController = ProfilesController;
export const AccessibilityProfilesController = ProfilesController;
