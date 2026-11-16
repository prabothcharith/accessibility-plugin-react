"use client";

import { useContext, useId, useMemo, useRef, useState } from "react";
import { FeatureIcon } from "../core/FeatureIcon";
import { ModalDialog } from "../core/controls/ModalDialog";
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
      <div className="arap-feature-row-between">
        <span className="arap-label">
          <FeatureIcon name="profiles" />
          <span>
            <span className="arap-label-title">{effectiveLabel}</span>
            {description && (
              <span className="arap-label-sub">
                {activeProfile ? (
                  <span className="arap-profile-inline-active">
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
        <div className="arap-nav-actions">
          {activeProfile && (
            <button
              type="button"
              className="arap-btn-secondary arap-btn-compact"
              onClick={handleRevert}
              aria-label="Revert active profile to custom settings"
              title="Revert to custom settings"
            >
              Revert
            </button>
          )}
          <button
            ref={triggerRef}
            className="arap-btn-secondary arap-btn-compact"
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-controls={dialogId}
            onClick={() => setIsOpen(!isOpen)}
            title="Browse 8 curated accessibility profiles"
          >
            {isOpen ? "Close" : "Browse"}
          </button>
        </div>
      </div>

      <ModalDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        id={dialogId}
        title={effectiveLabel}
        subtitle={description}
        icon={<FeatureIcon name="profiles" />}
        closeLabel="Close profiles dialog"
        size="full"
        lockScroll={false}
        returnFocusTo={triggerRef}
      >
        <div className="arap-profiles-panel">
          {activeProfile && (
            <div className="arap-profile-active-banner" role="status">
              <div>
                <span className="arap-profile-active-banner-title">
                  ✓ Current Profile: {activeProfile.label}
                </span>
                <span className="arap-profile-active-banner-sub">
                  {hasOverrides
                    ? "Your custom adjustments survive alongside this profile."
                    : "Neutral suggestion applied. Adjust any setting freely, or revert below."}
                </span>
              </div>
            </div>
          )}

          <div className="arap-navigator-search">
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

          <div className="arap-profiles-grid">
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
      </ModalDialog>
    </div>
  );
}

// Aliases for compatibility
export const ProfileController = ProfilesController;
export const AccessibilityProfilesController = ProfilesController;
