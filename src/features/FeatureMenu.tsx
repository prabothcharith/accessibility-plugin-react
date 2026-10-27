"use client";

import React, { useMemo } from "react";
import {
  type MenuCustomizationConfig,
  type NormalizedMenuItem,
  validateMenuConfig,
  getMenuConfigSignature,
} from "../core/menuCustomization";

// Import all built-in feature controllers
import { TextScaleController } from "./TextScaleController";
import { FontSizeController } from "./FontSizeController";
import { LineHeightController } from "./LineHeightController";
import { LetterSpacingController } from "./LetterSpacingController";
import { WordSpacingController } from "./WordSpacingController";
import { ParagraphSpacingController } from "./ParagraphSpacingController";
import { ContrastController } from "./ContrastController";
import { ContrastModeController } from "./ContrastModeController";
import { SmartContrastController } from "./SmartContrastController";
import { SaturationController } from "./SaturationController";
import { InvertColorsController } from "./InvertColorsController";
import { GrayscaleController } from "./GrayscaleController";
import { LinkHighlightController } from "./LinkHighlightController";
import { HighlightFocusController } from "./HighlightFocusController";
import { ReduceMotionController } from "./ReduceMotionController";
import { TextAlignController } from "./TextAlignController";
import { FontFamilyController } from "./FontFamilyController";
import { HideImagesController } from "./HideImagesController";
import { HideVideosController } from "./HideVideosController";
import { BigCursorController } from "./BigCursorController";
import { ReadingMaskController } from "./ReadingMaskController";
import { ReadingGuideController } from "./ReadingGuideController";
import { TooltipsController } from "./TooltipsController";
import { PageNavigatorController } from "./PageNavigatorController";
import { ProfilesController } from "./ProfilesController";
import { PresetsController } from "./PresetsController";
import { ReadingModeController } from "./ReadingModeController";
import { KeyboardShortcutsController } from "./KeyboardShortcutsController";
import { ReadAloudController } from "./ReadAloudController";
import { DictionaryController } from "./DictionaryController";
import { ResetController } from "./ResetController";

type ControllerComponent = React.ComponentType<Record<string, unknown>>;

/** Mapping of built-in feature IDs to their controller components */
const CONTROLLER_COMPONENT_MAP: Record<string, ControllerComponent> = {
  textScale: TextScaleController,
  fontSize: FontSizeController,
  lineHeight: LineHeightController,
  letterSpacing: LetterSpacingController,
  wordSpacing: WordSpacingController,
  paragraphSpacing: ParagraphSpacingController,
  contrast: ContrastController,
  contrastMode: ContrastModeController,
  smartContrast: SmartContrastController,
  saturation: SaturationController,
  invertColors: InvertColorsController,
  grayscale: GrayscaleController,
  linkHighlight: LinkHighlightController,
  highlightFocus: HighlightFocusController,
  reduceMotion: ReduceMotionController,
  textAlign: TextAlignController,
  fontFamily: FontFamilyController,
  hideImages: HideImagesController,
  hideVideos: HideVideosController,
  bigCursor: BigCursorController,
  readingMask: ReadingMaskController,
  readingGuide: ReadingGuideController,
  tooltips: TooltipsController,
  pageNavigator: PageNavigatorController,
  profiles: ProfilesController,
  presets: PresetsController,
  readingMode: ReadingModeController,
  keyboardShortcuts: KeyboardShortcutsController,
  readAloud: ReadAloudController,
  dictionary: DictionaryController,
  reset: ResetController,
};

export interface FeatureMenuProps {
  /** Menu customization configuration. */
  config?: MenuCustomizationConfig;
  /** Whether to render items in categorized visual groups. Defaults to false (flat list). */
  grouped?: boolean;
  /** Custom wrapper CSS class. */
  className?: string;
}

/**
 * Renders a validated, ordered, and optionally grouped accessibility menu.
 * Implements A11Y-404:
 * - Diagnoses invalid configuration without crashing
 * - Guarantees stable rerenders with persistent keys
 * - Supports custom labels, ordering, and feature visibility
 */
export function FeatureMenu({
  config,
  grouped = false,
  className = "",
}: FeatureMenuProps) {
  // Memoize validation and normalization based on config signature
  const signature = getMenuConfigSignature(config);
  const validation = useMemo(() => {
    return validateMenuConfig(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  const { items, groups } = validation.normalizedConfig;

  // Render a single feature item using its registered or custom component
  const renderItem = (item: NormalizedMenuItem) => {
    if (!item.enabled) return null;

    const Component =
      (item.component as ControllerComponent | undefined) ||
      CONTROLLER_COMPONENT_MAP[item.id];

    if (!Component) {
      return null;
    }

    const itemProps: Record<string, unknown> = {
      ...(item.props || {}),
    };

    if (item.label !== undefined) {
      itemProps.label = item.label;
      itemProps.title = item.label;
    }
    if (item.description !== undefined) {
      itemProps.description = item.description;
    }

    return <Component key={item.id} {...itemProps} />;
  };

  // Grouped layout rendering
  if (grouped && groups.length > 0) {
    const itemMap = new Map<string, NormalizedMenuItem>(
      items.map((i) => [i.id, i]),
    );

    return (
      <div className={`arap-menu-customized arap-menu-grouped ${className}`}>
        {groups.map((group) => {
          const groupItems = group.itemIds
            .map((id) => itemMap.get(id))
            .filter((i): i is NormalizedMenuItem => Boolean(i && i.enabled));

          if (groupItems.length === 0) return null;

          const headingId = `arap-grp-${group.id}`;

          return (
            <section
              key={group.id}
              role="group"
              aria-labelledby={group.title ? headingId : undefined}
              className="arap-menu-group"
              data-group={group.id}
            >
              {group.title && (
                <div className="arap-menu-group-header">
                  <h3 id={headingId} className="arap-menu-group-heading">
                    {group.title}
                  </h3>
                  {group.description && (
                    <p className="arap-menu-group-desc">{group.description}</p>
                  )}
                </div>
              )}
              <div className="arap-menu-group-items">
                {groupItems.map((item) => renderItem(item))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  // Flat list rendering (ordered by explicit order weight)
  return (
    <div className={`arap-menu-customized arap-menu-flat ${className}`}>
      {items.map((item) => renderItem(item))}
    </div>
  );
}

export default FeatureMenu;
