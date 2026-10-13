import type { CSSProperties, ReactNode } from "react";

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
}
export type WidgetPlacement =
  | {
      kind: "corner";
      corner: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    }
  | { kind: "point"; x: number; y: number };
export type PluginPosition = "left" | "right" | "top" | "bottom";
export interface AccessibilityPluginProps {
  children: ReactNode;
  position?: PluginPosition;
  persistenceKey?: string;
  /** Disable storage completely. */
  persist?: boolean;
}
export interface AccessibilityButtonProps {
  /** Pointer dragging and Alt+Arrow movement. Defaults to true. */
  draggable?: boolean;
  icon?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  style?: CSSProperties;
}
export interface AccessibilityListProps {
  /** Additional always-visible actions next to ResetController. */
  footer?: ReactNode;
  /** Supporting panel text. Pass an empty string to omit it. */
  description?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
  closeLabel?: string;
}
