"use client";

import type { AccessibilityPreferences } from "./preferences/types";
import { normalizePreferenceValue } from "./preferences/registry";
import {
  mapFeaturesToProfileSettings,
  mapProfileSettingsToFeatures,
} from "./profiles";

export interface CustomPreset {
  id: string;
  name: string;
  createdAt: string;
  updatedAt?: string;
  settings: Partial<AccessibilityPreferences>;
}

export interface PresetsExportV1 {
  $schema?: string;
  version: 1;
  app: "accessibility-plugin-react";
  exportedAt: string;
  currentSettings?: Partial<AccessibilityPreferences>;
  presets: CustomPreset[];
}

export type ImportResult =
  | {
      success: true;
      presets: CustomPreset[];
      currentSettings?: Partial<AccessibilityPreferences>;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * List of allowed preference keys for privacy-safe storage and export.
 * Strictly excludes any private user data, page text, transcripts, credentials, or session metadata.
 */
export const ALLOWED_PREFERENCE_KEYS = Object.freeze([
  "fontScale",
  "lineHeight",
  "letterSpacingEm",
  "wordSpacingEm",
  "paragraphSpacingEm",
  "textAlign",
  "contrastMode",
  "highlightLinks",
  "highlightFocus",
  "reduceMotion",
  "hideDecorativeImages",
  "fontFamily",
  "cursorSize",
  "readerMode",
  "saturation",
  "tooltips",
] as const);

const FORBIDDEN_KEYS = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "token",
  "auth",
  "password",
  "email",
  "user",
  "userId",
  "session",
  "cookie",
  "transcript",
  "recording",
  "pageContent",
  "notes",
  "input",
]);

/**
 * Sanitizes and extracts only valid, privacy-safe accessibility preferences.
 * Discards any private, unknown, or extraneous fields.
 */
export function sanitizePreferences(
  raw: unknown,
): Partial<AccessibilityPreferences> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const clean: Partial<AccessibilityPreferences> = {};

  for (const key of ALLOWED_PREFERENCE_KEYS) {
    if (
      key in record &&
      record[key] !== undefined &&
      !FORBIDDEN_KEYS.has(key)
    ) {
      (clean as Record<string, unknown>)[key] = normalizePreferenceValue(
        key,
        record[key],
      );
    }
  }

  return clean;
}

/**
 * Generates a stable unique identifier for a custom preset.
 */
export function generatePresetId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 9);
  return `preset_${timestamp}_${randomPart}`;
}

/**
 * Creates a validated, privacy-safe CustomPreset.
 */
export function createCustomPreset(
  name: string,
  settings: Partial<AccessibilityPreferences>,
): CustomPreset {
  const trimmedName =
    (name || "").trim() || `Preset ${new Date().toLocaleDateString()}`;
  const sanitizedSettings = sanitizePreferences(settings);

  return {
    id: generatePresetId(),
    name: trimmedName.slice(0, 60), // clamp name length
    createdAt: new Date().toISOString(),
    settings: sanitizedSettings,
  };
}

/**
 * Validates a single CustomPreset object.
 */
export function isValidCustomPreset(item: unknown): item is CustomPreset {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return false;
  }
  const candidate = item as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.name === "string" &&
    candidate.name.length > 0 &&
    typeof candidate.createdAt === "string" &&
    typeof candidate.settings === "object" &&
    candidate.settings !== null &&
    !Array.isArray(candidate.settings)
  );
}

/**
 * Serializes custom presets and optional current settings into a versioned JSON string.
 */
export function exportPresetsToJson(options: {
  presets: CustomPreset[];
  currentSettings?: Partial<AccessibilityPreferences>;
}): string {
  const envelope: PresetsExportV1 = {
    $schema: "https://accessibility-plugin.org/schemas/presets-v1.json",
    version: 1,
    app: "accessibility-plugin-react",
    exportedAt: new Date().toISOString(),
    presets: options.presets.map((p) => ({
      id: p.id,
      name: p.name,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      settings: sanitizePreferences(p.settings),
    })),
  };

  if (options.currentSettings) {
    envelope.currentSettings = sanitizePreferences(options.currentSettings);
  }

  return JSON.stringify(envelope, null, 2);
}

/**
 * Triggers a browser download of the exported JSON file.
 */
export function downloadJsonFile(filename: string, jsonContent: string): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses an imported JSON string into custom presets and settings.
 * Handles valid v1 envelopes, legacy arrays of presets, legacy flat settings, and returns clear errors on malformed data.
 */
export function validateAndParseImport(jsonString: string): ImportResult {
  if (!jsonString || typeof jsonString !== "string" || !jsonString.trim()) {
    return {
      success: false,
      error: "Import file is empty.",
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(jsonString);
  } catch {
    return {
      success: false,
      error: "Invalid JSON format: syntax error in file.",
    };
  }

  if (!raw || typeof raw !== "object") {
    return {
      success: false,
      error: "Malformed import: file root must be an object or array.",
    };
  }

  // Case 1: Legacy or direct array of presets
  if (Array.isArray(raw)) {
    const validPresets: CustomPreset[] = [];
    for (const item of raw) {
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        const p = item as Record<string, unknown>;
        const name = typeof p.name === "string" ? p.name : "Imported Preset";
        const id = typeof p.id === "string" && p.id ? p.id : generatePresetId();
        const createdAt =
          typeof p.createdAt === "string"
            ? p.createdAt
            : new Date().toISOString();
        const settings = sanitizePreferences(p.settings || p);
        if (Object.keys(settings).length > 0) {
          validPresets.push({ id, name, createdAt, settings });
        }
      }
    }

    if (validPresets.length === 0) {
      return {
        success: false,
        error: "Array did not contain any valid accessibility presets.",
      };
    }

    return {
      success: true,
      presets: validPresets,
      message: `Successfully imported ${validPresets.length} preset(s).`,
    };
  }

  const obj = raw as Record<string, unknown>;

  // Check version support
  if ("version" in obj && typeof obj.version === "number") {
    if (obj.version > 1) {
      return {
        success: false,
        error: `Unsupported schema version: version ${obj.version} is newer than supported version 1.`,
      };
    }
    if (obj.version < 1) {
      return {
        success: false,
        error: `Unsupported schema version: version ${obj.version} is not recognized.`,
      };
    }
  }

  // Case 2: Version 1 envelope with `presets` and/or `currentSettings`
  const importedPresets: CustomPreset[] = [];
  if (Array.isArray(obj.presets)) {
    for (const item of obj.presets) {
      if (isValidCustomPreset(item)) {
        importedPresets.push({
          id: item.id,
          name: item.name,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          settings: sanitizePreferences(item.settings),
        });
      } else if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const name =
          typeof record.name === "string" ? record.name : "Imported Preset";
        const id =
          typeof record.id === "string" && record.id
            ? record.id
            : generatePresetId();
        const createdAt =
          typeof record.createdAt === "string"
            ? record.createdAt
            : new Date().toISOString();
        const settings = sanitizePreferences(record.settings || record);
        if (Object.keys(settings).length > 0) {
          importedPresets.push({ id, name, createdAt, settings });
        }
      }
    }
  }

  // Extract currentSettings if present, or if root is a flat settings object
  let currentSettings: Partial<AccessibilityPreferences> | undefined;
  if ("currentSettings" in obj && typeof obj.currentSettings === "object") {
    currentSettings = sanitizePreferences(obj.currentSettings);
  } else if (!("presets" in obj) && !("version" in obj)) {
    // Legacy flat settings object
    const flat = sanitizePreferences(obj);
    if (Object.keys(flat).length > 0) {
      currentSettings = flat;
    }
  }

  if (
    importedPresets.length === 0 &&
    (!currentSettings || Object.keys(currentSettings).length === 0)
  ) {
    return {
      success: false,
      error: "No valid presets or accessibility settings found in the file.",
    };
  }

  const parts: string[] = [];
  if (importedPresets.length > 0)
    parts.push(`${importedPresets.length} preset(s)`);
  if (currentSettings && Object.keys(currentSettings).length > 0)
    parts.push("current settings");

  return {
    success: true,
    presets: importedPresets,
    currentSettings,
    message: `Successfully imported ${parts.join(" and ")}.`,
  };
}

/**
 * Applies a custom preset's settings to the store.
 */
export function applyCustomPresetToStore(
  preset: CustomPreset,
  setFeatureState: <T>(key: string, value: T) => void,
): void {
  const mapped = mapProfileSettingsToFeatures(preset.settings);
  for (const [key, value] of Object.entries(mapped)) {
    try {
      setFeatureState(key, value);
    } catch {
      // Ignored if feature is not registered in current consumer
    }
  }
}

export { mapFeaturesToProfileSettings, mapProfileSettingsToFeatures };
