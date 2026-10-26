"use client";

import { useContext, useSyncExternalStore } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { resolveLocaleStrings } from "./i18n";

/**
 * Searches the host document for an authentic main landmark:
 * native `<main>` element or element with explicit `role="main"`.
 * Returns null if no authentic main landmark exists.
 */
export function findMainLandmark(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const main = document.querySelector("main, [role='main']");
  return main instanceof HTMLElement ? main : null;
}

export interface SkipToMainLinkProps {
  className?: string;
  label?: string;
}

function subscribeLandmark(callback: () => void): () => void {
  if (
    typeof MutationObserver === "undefined" ||
    typeof document === "undefined" ||
    !document.body
  ) {
    return () => {};
  }
  const observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getMainTargetId(): string | null {
  if (typeof document === "undefined") return null;
  const main = findMainLandmark();
  if (main) {
    if (!main.id) {
      main.id = "arap-main-content";
    }
    if (!main.hasAttribute("tabindex")) {
      main.setAttribute("tabindex", "-1");
    }
    return main.id;
  }
  return null;
}

/**
 * Accessible Skip to Main Content link.
 * Only renders when a real `<main>` or `[role="main"]` landmark exists in the document,
 * preventing broken or unreachable skip links in partial views or embedded layouts.
 */
export function SkipToMainLink({ className = "", label }: SkipToMainLinkProps) {
  const ctx = useContext(AccessibilityContext);
  const strings = resolveLocaleStrings(ctx?.locale);
  const text = label ?? strings.skipToMain ?? "Skip to main content";
  const targetId = useSyncExternalStore(
    subscribeLandmark,
    getMainTargetId,
    () => null,
  );

  if (!targetId) return null;

  return (
    <a
      href={`#${targetId}`}
      className={`arap-skip-to-main ${className}`}
      onClick={(e) => {
        const main = document.getElementById(targetId);
        if (main) {
          e.preventDefault();
          if (!main.hasAttribute("tabindex")) {
            main.setAttribute("tabindex", "-1");
          }
          main.focus();
          main.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }}
    >
      {text}
    </a>
  );
}

export default SkipToMainLink;
