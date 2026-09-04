"use client";

import {
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type KeyboardEvent,
} from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import type { AccessibilityListProps } from "./types";

export function AccessibilityList({
  children,
  className = "",
}: AccessibilityListProps) {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "AccessibilityList must be used within an <AccessibilityPlugin> provider."
    );
  }

  const { isOpen, closeMenu } = ctx;
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus trap
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the panel when it opens
      requestAnimationFrame(() => {
        panelRef.current?.focus();
      });
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        closeMenu();
        return;
      }

      // Basic focus trap: Tab cycles within the panel
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    },
    [closeMenu]
  );

  if (!isOpen) return null;

  const panelStyle: React.CSSProperties = {
    padding: "16px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  return (
    <div
      ref={panelRef}
      id="arap-panel"
      className={`arap-panel ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Accessibility settings"
      tabIndex={-1}
      style={panelStyle}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}

export default AccessibilityList;
