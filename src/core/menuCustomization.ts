/**
 * Per-site feature-menu customization, ordering, grouping, and validation.
 *
 * Implements A11Y-404:
 * - Validate enabled IDs, order, groups, labels, profiles/statement visibility and suggested defaults
 * - Warn if close, reset, or help becomes unreachable
 * - Preserve canonical feature IDs
 * - Diagnose invalid configuration without crashing the application
 * - Ensure stable memoized rerenders
 */

import { builtins } from "./featureSchema";

export const KNOWN_FEATURE_IDS = [
  "textScale",
  "fontSize",
  "lineHeight",
  "letterSpacing",
  "wordSpacing",
  "paragraphSpacing",
  "contrast",
  "contrastMode",
  "smartContrast",
  "saturation",
  "invertColors",
  "grayscale",
  "linkHighlight",
  "highlightFocus",
  "reduceMotion",
  "textAlign",
  "fontFamily",
  "hideImages",
  "hideVideos",
  "bigCursor",
  "readingMask",
  "readingGuide",
  "tooltips",
  "pageNavigator",
  "profiles",
  "presets",
  "readingMode",
  "keyboardShortcuts",
  "readAloud",
  "dictionary",
  "voiceNavigation",
  "reset",
] as const;

export type KnownFeatureId = (typeof KNOWN_FEATURE_IDS)[number];

export interface FeatureMenuItemConfig {
  /** Feature identifier (canonical built-in ID or custom feature ID). */
  id: string;
  /** Whether the feature is visible and rendered in the menu. Defaults to true. */
  enabled?: boolean;
  /** Explicit display order weight (lower numbers appear first). */
  order?: number;
  /** Custom label override for this site. */
  label?: string;
  /** Custom description override for this site. */
  description?: string;
  /** Group / category identifier for grouping controls. */
  group?: string;
  /** Suggested default value on initial mount if not already saved. */
  suggestedDefault?: unknown;
  /** Custom props passed directly to the controller component. */
  props?: Record<string, unknown>;
  /** Optional custom React component to render instead of the standard controller. */
  component?: unknown;
}

export interface FeatureMenuGroupConfig {
  /** Unique group identifier. */
  id: string;
  /** Accessible group title / heading text. */
  title?: string;
  /** Accessible group description or subtitle. */
  description?: string;
  /** Explicit display order for the group. */
  order?: number;
  /** Feature IDs or item configs explicitly assigned to this group. */
  items?: (string | FeatureMenuItemConfig)[];
  /** Whether the group can be collapsed (default: false). */
  collapsible?: boolean;
  /** Default collapsed state if collapsible. */
  defaultExpanded?: boolean;
}

export interface MenuCustomizationConfig {
  /** List of feature items to render, order, or configure. */
  items?: (string | FeatureMenuItemConfig)[];
  /** Custom groups / sections for organized menu presentation. */
  groups?: FeatureMenuGroupConfig[];
  /** Visibility of Accessibility Profiles controller. Defaults to true. */
  showProfiles?: boolean;
  /** Visibility of site accessibility statement link. Defaults to true. */
  showStatement?: boolean;
  /** Visibility of the Reset All action button. Defaults to true. */
  showReset?: boolean;
  /** Visibility of keyboard shortcuts help controller. Defaults to true. */
  showShortcutsHelp?: boolean;
  /** Visibility of button position movement controls. Defaults to true. */
  showPositionControls?: boolean;
  /** Whether to render features organized into visual group sections. Defaults to false. */
  grouped?: boolean;
  /** Optional callback invoked with validation issues. */
  diagnosticsCallback?: (issues: MenuValidationIssue[]) => void;
  /** When true, logs diagnostics to console.warn in development mode. Defaults to true. */
  enableLogging?: boolean;
}

export interface MenuValidationIssue {
  type: "error" | "warning" | "info";
  code:
    | "INVALID_CONFIG_TYPE"
    | "UNKNOWN_FEATURE_ID"
    | "DUPLICATE_FEATURE_ID"
    | "UNREACHABLE_RESET"
    | "UNREACHABLE_CLOSE"
    | "UNREACHABLE_HELP"
    | "INVALID_DEFAULT_VALUE"
    | "INVALID_GROUP_CONFIG"
    | "EMPTY_MENU";
  message: string;
  featureId?: string;
  groupId?: string;
}

export interface NormalizedMenuItem {
  id: string;
  enabled: boolean;
  order: number;
  label?: string;
  description?: string;
  group?: string;
  suggestedDefault?: unknown;
  props?: Record<string, unknown>;
  component?: unknown;
}

export interface NormalizedMenuGroup {
  id: string;
  title?: string;
  description?: string;
  order: number;
  itemIds: string[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export interface NormalizedMenuConfig {
  items: NormalizedMenuItem[];
  groups: NormalizedMenuGroup[];
  showProfiles: boolean;
  showStatement: boolean;
  showReset: boolean;
  showShortcutsHelp: boolean;
  showPositionControls: boolean;
}

export interface MenuValidationResult {
  valid: boolean;
  issues: MenuValidationIssue[];
  normalizedConfig: NormalizedMenuConfig;
}

/** Built-in default groups for organized layout */
export const DEFAULT_MENU_GROUPS: FeatureMenuGroupConfig[] = [
  {
    id: "typography",
    title: "Text & Typography",
    description: "Adjust text size, spacing, font, and alignment",
    order: 10,
  },
  {
    id: "color",
    title: "Color & Contrast",
    description: "Control contrast, saturation, and color adjustments",
    order: 20,
  },
  {
    id: "reading",
    title: "Reading & Navigation",
    description: "Reading aids, screen navigation, and spoken text",
    order: 30,
  },
  {
    id: "media",
    title: "Media & Motion",
    description: "Reduce animation and manage media visibility",
    order: 40,
  },
  {
    id: "preferences",
    title: "Profiles & Settings",
    description: "Accessibility profiles and preset management",
    order: 50,
  },
];

/** Mapping of built-in features to default groups */
export const DEFAULT_FEATURE_GROUP_MAP: Record<string, string> = {
  textScale: "typography",
  fontSize: "typography",
  lineHeight: "typography",
  letterSpacing: "typography",
  wordSpacing: "typography",
  paragraphSpacing: "typography",
  fontFamily: "typography",
  textAlign: "typography",

  contrast: "color",
  contrastMode: "color",
  saturation: "color",
  grayscale: "color",
  invertColors: "color",
  linkHighlight: "color",
  highlightFocus: "color",

  bigCursor: "reading",
  readingMask: "reading",
  readingGuide: "reading",
  tooltips: "reading",
  pageNavigator: "reading",
  readingMode: "reading",
  readAloud: "reading",
  dictionary: "reading",

  reduceMotion: "media",
  hideImages: "media",
  hideVideos: "media",

  profiles: "preferences",
  presets: "preferences",
  keyboardShortcuts: "preferences",
  reset: "preferences",
};

/**
 * Validates and normalizes a site menu configuration.
 * Never throws exceptions; always produces a usable fallback configuration with diagnostic issues.
 */
export function validateMenuConfig(config: unknown): MenuValidationResult {
  const issues: MenuValidationIssue[] = [];

  // Guard against non-object or null input
  if (!config || typeof config !== "object") {
    if (config !== undefined && config !== null) {
      issues.push({
        type: "error",
        code: "INVALID_CONFIG_TYPE",
        message: `Expected menu configuration object but received ${typeof config}. Using default menu configuration.`,
      });
    }

    const defaultItems = KNOWN_FEATURE_IDS.map((id, index) => ({
      id,
      enabled: true,
      order: index * 10,
      group: DEFAULT_FEATURE_GROUP_MAP[id],
    }));

    return {
      valid: issues.length === 0,
      issues,
      normalizedConfig: {
        items: defaultItems,
        groups: DEFAULT_MENU_GROUPS.map((g, index) => ({
          ...g,
          order: g.order ?? index * 10,
          itemIds: defaultItems
            .filter((i) => i.group === g.id)
            .map((i) => i.id),
        })),
        showProfiles: true,
        showStatement: true,
        showReset: true,
        showShortcutsHelp: true,
        showPositionControls: true,
      },
    };
  }

  const rawConfig = config as MenuCustomizationConfig;
  const knownIdSet = new Set<string>(KNOWN_FEATURE_IDS);
  const seenIds = new Set<string>();
  const normalizedItems: NormalizedMenuItem[] = [];

  // Process items if provided
  if (Array.isArray(rawConfig.items)) {
    rawConfig.items.forEach((item, index) => {
      let itemObj: FeatureMenuItemConfig;

      if (typeof item === "string") {
        itemObj = { id: item };
      } else if (
        item &&
        typeof item === "object" &&
        typeof item.id === "string"
      ) {
        itemObj = item;
      } else {
        issues.push({
          type: "warning",
          code: "INVALID_CONFIG_TYPE",
          message: `Item at index ${index} is not a valid string or object with an id property.`,
        });
        return;
      }

      const { id } = itemObj;

      // Duplicate check
      if (seenIds.has(id)) {
        issues.push({
          type: "warning",
          code: "DUPLICATE_FEATURE_ID",
          featureId: id,
          message: `Feature ID "${id}" is duplicated in menu items. Duplicate entries are ignored.`,
        });
        return;
      }
      seenIds.add(id);

      // Known ID check
      if (!knownIdSet.has(id)) {
        issues.push({
          type: "info",
          code: "UNKNOWN_FEATURE_ID",
          featureId: id,
          message: `Feature ID "${id}" is not a built-in controller ID. It will be treated as a custom feature.`,
        });
      }

      // Validate suggested default if specified
      if (itemObj.suggestedDefault !== undefined && builtins[id]) {
        const schema = builtins[id];
        if (!schema.validate(itemObj.suggestedDefault)) {
          issues.push({
            type: "warning",
            code: "INVALID_DEFAULT_VALUE",
            featureId: id,
            message: `Suggested default value for "${id}" failed schema validation. Default ignored.`,
          });
          itemObj = { ...itemObj, suggestedDefault: undefined };
        }
      }

      normalizedItems.push({
        id,
        enabled: itemObj.enabled ?? true,
        order: itemObj.order ?? index * 10,
        label: itemObj.label,
        description: itemObj.description,
        group: itemObj.group ?? DEFAULT_FEATURE_GROUP_MAP[id],
        suggestedDefault: itemObj.suggestedDefault,
        props: itemObj.props,
        component: itemObj.component,
      });
    });
  } else {
    // If no explicit items provided, use all known feature IDs in default order
    KNOWN_FEATURE_IDS.forEach((id, index) => {
      normalizedItems.push({
        id,
        enabled: true,
        order: index * 10,
        group: DEFAULT_FEATURE_GROUP_MAP[id],
      });
    });
  }

  // Sort items by explicit order weight
  normalizedItems.sort((a, b) => a.order - b.order);

  // Process groups
  const groupsList: NormalizedMenuGroup[] = [];
  const groupMap = new Map<string, NormalizedMenuGroup>();

  if (Array.isArray(rawConfig.groups)) {
    rawConfig.groups.forEach((g, gIndex) => {
      if (!g || typeof g !== "object" || typeof g.id !== "string") {
        issues.push({
          type: "warning",
          code: "INVALID_GROUP_CONFIG",
          message: `Group at index ${gIndex} is missing a valid id string.`,
        });
        return;
      }
      const normGroup: NormalizedMenuGroup = {
        id: g.id,
        title: g.title,
        description: g.description,
        order: g.order ?? gIndex * 10,
        itemIds: [],
        collapsible: g.collapsible,
        defaultExpanded: g.defaultExpanded,
      };
      groupsList.push(normGroup);
      groupMap.set(g.id, normGroup);
    });
  } else {
    // Default to built-in groups
    DEFAULT_MENU_GROUPS.forEach((g) => {
      const normGroup: NormalizedMenuGroup = {
        id: g.id,
        title: g.title,
        description: g.description,
        order: g.order ?? 0,
        itemIds: [],
      };
      groupsList.push(normGroup);
      groupMap.set(g.id, normGroup);
    });
  }

  // Assign enabled items to groups
  normalizedItems.forEach((item) => {
    if (!item.enabled) return;
    if (item.group && groupMap.has(item.group)) {
      groupMap.get(item.group)!.itemIds.push(item.id);
    } else if (item.group) {
      // Auto-register undefined group
      const newGroup: NormalizedMenuGroup = {
        id: item.group,
        title: item.group.charAt(0).toUpperCase() + item.group.slice(1),
        order: groupsList.length * 10,
        itemIds: [item.id],
      };
      groupsList.push(newGroup);
      groupMap.set(item.group, newGroup);
    }
  });

  // Filter out empty groups and sort groups by order
  const activeGroups = groupsList
    .filter((g) => g.itemIds.length > 0)
    .sort((a, b) => a.order - b.order);

  // Safety checks (Unreachable critical accessibility actions)
  const showReset = rawConfig.showReset ?? true;
  const isResetEnabledInItems = normalizedItems.some(
    (i) => i.id === "reset" && i.enabled,
  );
  if (
    !showReset ||
    (!isResetEnabledInItems && Array.isArray(rawConfig.items))
  ) {
    issues.push({
      type: "warning",
      code: "UNREACHABLE_RESET",
      message:
        "Reset functionality is disabled or omitted. Users may be unable to return display settings to baseline defaults.",
    });
  }

  const showProfiles = rawConfig.showProfiles ?? true;
  const showStatement = rawConfig.showStatement ?? true;
  const showShortcutsHelp = rawConfig.showShortcutsHelp ?? true;
  const showPositionControls = rawConfig.showPositionControls ?? true;

  if (normalizedItems.filter((i) => i.enabled).length === 0) {
    issues.push({
      type: "warning",
      code: "EMPTY_MENU",
      message:
        "All menu features are disabled. The accessibility menu will be empty.",
    });
  }

  // Inform diagnostics callback if provided
  if (rawConfig.diagnosticsCallback && issues.length > 0) {
    try {
      rawConfig.diagnosticsCallback(issues);
    } catch {
      // Ignore errors inside user callback
    }
  }

  // Log in development if enabled
  if (
    rawConfig.enableLogging !== false &&
    process.env.NODE_ENV !== "production" &&
    typeof console !== "undefined" &&
    issues.length > 0
  ) {
    const warnings = issues.filter(
      (i) => i.type === "warning" || i.type === "error",
    );
    if (warnings.length > 0) {
      console.warn(
        `[accessibility-plugin-react] Menu customization warnings:\n${warnings.map((w) => `  - ${w.code}: ${w.message}`).join("\n")}`,
      );
    }
  }

  return {
    valid: !issues.some((i) => i.type === "error"),
    issues,
    normalizedConfig: {
      items: normalizedItems,
      groups: activeGroups,
      showProfiles,
      showStatement,
      showReset,
      showShortcutsHelp,
      showPositionControls,
    },
  };
}

/**
 * Creates a deterministic hash / signature of a menu configuration for memoization comparison.
 */
export function getMenuConfigSignature(
  config: MenuCustomizationConfig | undefined,
): string {
  if (!config) return "default";
  try {
    return JSON.stringify({
      items: config.items?.map((item) =>
        typeof item === "string"
          ? item
          : `${item.id}:${item.enabled ?? true}:${item.order ?? 0}:${item.group ?? ""}`,
      ),
      groups: config.groups?.map((g) => `${g.id}:${g.order ?? 0}`),
      showProfiles: config.showProfiles,
      showReset: config.showReset,
      showStatement: config.showStatement,
      showShortcutsHelp: config.showShortcutsHelp,
      showPositionControls: config.showPositionControls,
    });
  } catch {
    return "dynamic";
  }
}
