"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { loadState, saveState, clearState } from "./storage";
import type { PluginPosition } from "./types";

interface AccessibilityPluginProps {
  children: ReactNode;
  position?: PluginPosition;
  persistenceKey?: string;
}

const POSITION_STYLES: Record<PluginPosition, React.CSSProperties> = {
  right: { top: 0, right: 0, bottom: 0, width: "380px" },
  left: { top: 0, left: 0, bottom: 0, width: "380px" },
  top: { top: 0, left: 0, right: 0, height: "100vh" },
  bottom: { bottom: 0, left: 0, right: 0, height: "100vh" },
};

const POSITION_PANEL_STYLES: Record<PluginPosition, React.CSSProperties> = {
  right: {
    top: "70px",
    right: "16px",
    bottom: "16px",
    width: "348px",
  },
  left: {
    top: "70px",
    left: "16px",
    bottom: "16px",
    width: "348px",
  },
  top: {
    top: "70px",
    left: "16px",
    right: "16px",
    maxHeight: "calc(100vh - 86px)",
  },
  bottom: {
    bottom: "16px",
    left: "16px",
    right: "16px",
    maxHeight: "calc(100vh - 86px)",
  },
};

export function AccessibilityPlugin({
  children,
  position = "right",
  persistenceKey,
}: AccessibilityPluginProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [features, setFeatures] = useState<Record<string, unknown>>({});
  const resetFnsRef = useRef<Map<string, () => void>>(new Map());
  const hydratedRef = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const saved = loadState(persistenceKey);
    if (saved && typeof saved === "object") {
      setFeatures((prev) => ({ ...prev, ...saved }));
    }
  }, [persistenceKey]);

  // Persist to localStorage on feature changes (after hydration)
  useEffect(() => {
    if (!hydratedRef.current) return;
    saveState(features, persistenceKey);
  }, [features, persistenceKey]);

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);
  const closeMenu = useCallback(() => setIsOpen(false), []);

  const getFeatureState = useCallback(
    <T,>(key: string, defaultValue: T): T => {
      return (features[key] as T) ?? defaultValue;
    },
    [features]
  );

  const setFeatureState = useCallback(
    <T,>(key: string, value: T) => {
      setFeatures((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetAll = useCallback(() => {
    // Call all registered reset functions
    resetFnsRef.current.forEach((fn) => fn());
    // Clear features state
    setFeatures({});
    // Clear localStorage
    clearState(persistenceKey);
  }, [persistenceKey]);

  const registerReset = useCallback((key: string, resetFn: () => void) => {
    resetFnsRef.current.set(key, resetFn);
  }, []);

  const unregisterReset = useCallback((key: string) => {
    resetFnsRef.current.delete(key);
  }, []);

  const value = useMemo(
    () => ({
      state: { isOpen, features },
      isOpen,
      toggleOpen,
      closeMenu,
      getFeatureState,
      setFeatureState,
      resetAll,
      registerReset,
      unregisterReset,
    }),
    [
      isOpen,
      features,
      toggleOpen,
      closeMenu,
      getFeatureState,
      setFeatureState,
      resetAll,
      registerReset,
      unregisterReset,
    ]
  );

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 999999,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: "14px",
    color: "#1f2937",
    ...POSITION_STYLES[position],
  };

  const panelStyle: React.CSSProperties = {
    position: "absolute",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    ...POSITION_PANEL_STYLES[position],
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <div className="arap-root" style={containerStyle}>
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export default AccessibilityPlugin;
