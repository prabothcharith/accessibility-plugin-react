import type { CSSProperties, ReactNode } from "react";
import type { MenuCustomizationConfig } from "./menuCustomization";

export interface AccessibilityState {
  isOpen: boolean;
  features: Record<string, unknown>;
}
export interface FeatureOptions<T> {
  /** Validate restored and programmatic values. Required for structured custom state. */
  validate?: (value: unknown) => value is T;
  /** Owned by the provider, including while the control is unmounted. Return cleanup. */
  apply?: (value: T) => void | (() => void);
}
export interface FeatureRegistration extends FeatureOptions<unknown> {
  defaultValue: unknown;
}
export interface AccessibilityContextValue {
  state: AccessibilityState;
  isOpen: boolean;
  panelId: string;
  position: PluginPosition;
  widgetPlacement: WidgetPlacement | null;
  setWidgetPlacement: (next: WidgetPlacement | null) => void;
  toggleOpen: () => void;
  closeMenu: () => void;
  getFeatureState: <T>(key: string, defaultValue: T) => T;
  setFeatureState: <T>(key: string, value: T) => void;
  registerFeature: (key: string, definition: FeatureRegistration) => void;
  resetAll: () => void;
  registerReset: (key: string, resetFn: () => void) => void;
  unregisterReset: (key: string) => void;
  locale?: string;
  statementUrl?: string;
  largeControls?: boolean;
}
export type WidgetPlacement =
  | {
      kind: "corner";
      corner: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    }
  | { kind: "point"; x: number; y: number };
import type {
  AccessibilityPreferences,
  ContrastMode,
  CursorSizePreference,
  FontFamilyPreference,
  ProfileDefinition,
  ProfilePresetId,
  ReaderMode,
  SaturationPreference,
  StorageMode,
  TextAlignPreference,
} from "./preferences";
import type { FeatureLocaleLabels, LocaleStrings } from "./i18n";

import type { DiagnosticsConfig } from "./diagnostics";
import type { FeatureEventListener } from "./events";

export type PluginPosition = "left" | "right" | "top" | "bottom";
export interface AccessibilityPluginProps {
  children: ReactNode;
  position?: PluginPosition;
  persistenceKey?: string;
  /** Disable storage completely (backward-compatible alias for storage="none"). */
  persist?: boolean;
  /** Storage mode: 'none' | 'session' | 'local'. Defaults to 'local'. */
  storage?: StorageMode;
  /** Preferred UI language locale (defaults to html lang or 'en'). */
  locale?: string;
  /** Real URL to site owner's accessibility statement (W-22). */
  statementUrl?: string;
  /** Oversized widget controls mode (>=48px touch targets, W-21). */
  largeControls?: boolean;
  /**
   * Development-only integration diagnostics (A11Y-405).
   * Runs non-invasive checks for CSP, host CSS, portals, storage, and landmarks.
   * Inactive in production unless explicitly forced.
   */
  diagnostics?: boolean | DiagnosticsConfig;
  /**
   * Optional privacy-safe feature event lifecycle callback (A11Y-406).
   * Strictly local, opt-in, and disabled by default. Excludes page text, selections,
   * inputs, transcripts, and identifiers.
   */
  onFeatureEvent?: FeatureEventListener;
}
export interface AccessibilityButtonProps {
  /** Pointer dragging and Alt+Arrow movement. Defaults to true. */
  draggable?: boolean;
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  style?: CSSProperties;
  largeControls?: boolean;
}
export interface AccessibilityListProps {
  /** Additional always-visible actions next to ResetController. */
  footer?: ReactNode;
  /** Supporting panel text. Pass an empty string to omit it. */
  description?: string;
  /** Explicit controller children or custom markup. Optional if menuConfig is supplied. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  closeLabel?: string;
  /** Real URL to site owner's accessibility statement (W-22). */
  statementUrl?: string;
  /** Oversized widget controls mode (>=48px touch targets, W-21). */
  largeControls?: boolean;
  /** Preferred UI language locale. */
  locale?: string;
  /** Declarative per-site feature menu customization and reordering (A11Y-404). */
  menuConfig?: MenuCustomizationConfig;
}

export type {
  AccessibilityPreferences,
  ContrastMode,
  CursorSizePreference,
  FontFamilyPreference,
  FeatureLocaleLabels,
  LocaleStrings,
  ProfileDefinition,
  ProfilePresetId,
  ReaderMode,
  SaturationPreference,
  StorageMode,
  TextAlignPreference,
};

export type {
  ToggleControlProps,
  ChoiceControlProps,
  ChoiceOption,
  ChoiceGroup,
  StepperControlProps,
  FeatureCardProps,
  FeatureStatus,
  SearchCountProps,
  EmptyStateProps,
  ErrorStateProps,
  ProfilePreviewCardProps,
} from "./controls";

export type {
  DiagnosticCategory,
  DiagnosticIssue,
  DiagnosticSeverity,
  DiagnosticsConfig,
  DiagnosticsReport,
  DiagnosticsSummary,
} from "./diagnostics";

export type {
  AccessibilityEventType,
  EventTriggerSource,
  BaseAccessibilityEvent,
  FeatureChangeEvent,
  FeatureResetEvent,
  PanelToggleEvent,
  PlacementChangeEvent,
  ProfileApplyEvent,
  PresetApplyEvent,
  AccessibilityFeatureEvent,
  FeatureEventListener,
} from "./events";
