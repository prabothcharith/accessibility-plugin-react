"use client";

import { useCallback, useContext, useMemo } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { useAccessibility } from "./useAccessibility";
import {
  CustomPreset,
  ImportResult,
  applyCustomPresetToStore,
  createCustomPreset,
  downloadJsonFile,
  exportPresetsToJson,
  mapFeaturesToProfileSettings,
  validateAndParseImport,
} from "./presets";
import type { AccessibilityPreferences } from "./preferences/types";

export interface UsePresetsResult {
  /** List of all saved user presets. */
  presets: CustomPreset[];
  /** Current active settings mapped to AccessibilityPreferences. */
  currentSettings: Partial<AccessibilityPreferences>;
  /** Saves current configuration as a new named preset. */
  saveCurrentAsPreset: (name: string) => CustomPreset;
  /** Applies a preset by its unique ID. Returns true if found and applied. */
  applyPreset: (presetId: string) => boolean;
  /** Deletes a preset by its unique ID. Returns true if deleted. */
  deletePreset: (presetId: string) => boolean;
  /** Generates a version 1 JSON export of presets and optionally current settings. */
  exportPresets: () => string;
  /** Downloads the exported JSON file to the user's computer. */
  downloadExport: (filename?: string) => void;
  /** Validates and imports presets and settings from a JSON string. */
  importFromJson: (jsonStr: string) => ImportResult;
  /** Reads a File object and imports presets and settings. */
  importFromFile: (file: File) => Promise<ImportResult>;
}

/**
 * Hook to manage custom presets and versioned JSON settings import/export.
 */
export function usePresets(): UsePresetsResult {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "usePresets must be used within an <AccessibilityPlugin> provider.",
    );
  }

  const { value: rawPresets, setValue: setPresets } = useAccessibility<
    CustomPreset[]
  >("customPresets", []);

  const presets = useMemo(
    () => (Array.isArray(rawPresets) ? rawPresets : []),
    [rawPresets],
  );

  const currentSettings = useMemo(
    () => mapFeaturesToProfileSettings(ctx.state.features),
    [ctx.state.features],
  );

  const saveCurrentAsPreset = useCallback(
    (name: string): CustomPreset => {
      const newPreset = createCustomPreset(name, currentSettings);
      setPresets([...presets, newPreset]);
      return newPreset;
    },
    [currentSettings, presets, setPresets],
  );

  const applyPreset = useCallback(
    (presetId: string): boolean => {
      const found = presets.find((p) => p.id === presetId);
      if (!found) return false;
      applyCustomPresetToStore(found, ctx.setFeatureState);
      return true;
    },
    [ctx.setFeatureState, presets],
  );

  const deletePreset = useCallback(
    (presetId: string): boolean => {
      const next = presets.filter((p) => p.id !== presetId);
      if (next.length === presets.length) return false;
      setPresets(next);
      return true;
    },
    [presets, setPresets],
  );

  const exportPresets = useCallback((): string => {
    return exportPresetsToJson({ presets, currentSettings });
  }, [currentSettings, presets]);

  const downloadExport = useCallback(
    (filename?: string): void => {
      const json = exportPresetsToJson({ presets, currentSettings });
      const dateStr = new Date().toISOString().split("T")[0];
      const targetName =
        filename || `accessibility-preferences-${dateStr}.json`;
      downloadJsonFile(targetName, json);
    },
    [currentSettings, presets],
  );

  const importFromJson = useCallback(
    (jsonStr: string): ImportResult => {
      const result = validateAndParseImport(jsonStr);
      if (!result.success) {
        return result;
      }

      // Merge newly imported presets, deduping by id
      if (result.presets.length > 0) {
        const existingMap = new Map(presets.map((p) => [p.id, p]));
        for (const p of result.presets) {
          existingMap.set(p.id, p);
        }
        setPresets(Array.from(existingMap.values()));
      }

      // If currentSettings are included in the file, apply them
      if (
        result.currentSettings &&
        Object.keys(result.currentSettings).length > 0
      ) {
        applyCustomPresetToStore(
          {
            id: "temp_import",
            name: "Imported Settings",
            createdAt: new Date().toISOString(),
            settings: result.currentSettings,
          },
          ctx.setFeatureState,
        );
      }

      return result;
    },
    [ctx.setFeatureState, presets, setPresets],
  );

  const importFromFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      try {
        const text = await file.text();
        return importFromJson(text);
      } catch (err) {
        return {
          success: false,
          error: `Failed to read file: ${err instanceof Error ? err.message : String(err)}`,
        };
      }
    },
    [importFromJson],
  );

  return {
    presets,
    currentSettings,
    saveCurrentAsPreset,
    applyPreset,
    deletePreset,
    exportPresets,
    downloadExport,
    importFromJson,
    importFromFile,
  };
}
