"use client";

import { ReactNode } from "react";

export interface AccessibilityState {
  isOpen: boolean;
  features: Record<string, unknown>;
}

export interface AccessibilityContextValue {
  state: AccessibilityState;
  isOpen: boolean;
  toggleOpen: () => void;
  closeMenu: () => void;
  getFeatureState: <T>(key: string, defaultValue: T) => T;
  setFeatureState: <T>(key: string, value: T) => void;
  resetAll: () => void;
  registerReset: (key: string, resetFn: () => void) => void;
  unregisterReset: (key: string) => void;
}

export type PluginPosition = "left" | "right" | "top" | "bottom";

export interface AccessibilityPluginProps {
  children: ReactNode;
  position?: PluginPosition;
  persistenceKey?: string;
}

export interface AccessibilityButtonProps {
  icon: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export interface AccessibilityListProps {
  children: ReactNode;
  className?: string;
}
