import React, { createContext, useContext, useState, useEffect } from "react";
import {
  type AccessibilityState,
  type ContrastMode,
  type CursorMode,
  type TextAlign,
} from "./types";

interface AccessibilityContextType extends AccessibilityState {
  setContrast: (mode: ContrastMode) => void;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setLetterSpacing: (spacing: number) => void;
  setTextAlign: (align: TextAlign) => void;
  setCursor: (mode: CursorMode) => void;
  setHideImages: (hide: boolean) => void;
  setHighlightLinks: (highlight: boolean) => void;
  toggleWidget: () => void;
  reset: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AccessibilityState>({
    contrast: "normal",
    fontSize: 1,
    lineHeight: 1,
    letterSpacing: 0,
    textAlign: "initial",
    cursor: "normal",
    hideImages: false,
    highlightLinks: false,
    isWidgetOpen: false,
  });

  const reset = () => {
    setState({
      contrast: "normal",
      fontSize: 1,
      lineHeight: 1,
      letterSpacing: 0,
      textAlign: "initial",
      cursor: "normal",
      hideImages: false,
      highlightLinks: false,
      isWidgetOpen: true, // Keep open
    });
  };

  // Apply side effects
  useEffect(() => {
    const root = document.documentElement;

    // Contrast - map mode names to CSS classes
    root.classList.remove(
      "acc-invert",
      "acc-grayscale",
      "acc-low-sat",
      "acc-high-sat",
      "acc-y-on-b",
      "acc-w-on-b",
      "acc-b-on-y"
    );
    
    if (state.contrast !== "normal") {
      // Map contrast mode to CSS class
      const classMap: Record<string, string> = {
        'invert': 'acc-invert',
        'grayscale': 'acc-grayscale',
        'low-saturation': 'acc-low-sat',
        'high-saturation': 'acc-high-sat',
        'yellow-on-black': 'acc-y-on-b',
        'white-on-black': 'acc-w-on-b',
        'blue-on-yellow': 'acc-b-on-y'
      };
      const className = classMap[state.contrast];
      if (className) root.classList.add(className);
    }

    // Font Size
    if (state.fontSize !== 1) {
      root.style.fontSize = `${state.fontSize * 100}%`;
    } else {
      root.style.fontSize = "";
    }

    // Line Height
    if (state.lineHeight !== 1) {
      root.style.lineHeight = `${state.lineHeight}`;
    } else {
      root.style.lineHeight = "";
    }

    // Letter Spacing
    if (state.letterSpacing !== 0) {
      root.style.letterSpacing = `${state.letterSpacing}em`;
    } else {
      root.style.letterSpacing = "";
    }

    // Text Align
    if (state.textAlign !== "initial") {
      root.style.textAlign = state.textAlign;
    } else {
      root.style.textAlign = "";
    }

    // Hide Images
    if (state.hideImages) root.classList.add("acc-hide-images");
    else root.classList.remove("acc-hide-images");

    // Highlight Links
    if (state.highlightLinks) root.classList.add("acc-highlight-links");
    else root.classList.remove("acc-highlight-links");

    // Cursor
    root.classList.remove("acc-cursor-big", "acc-cursor-guide");
    if (state.cursor === "big") root.classList.add("acc-cursor-big");
    if (state.cursor === "reading-guide")
      root.classList.add("acc-cursor-guide");
  }, [state]);

  const value = {
    ...state,
    setContrast: (contrast: ContrastMode) =>
      setState((s) => ({ ...s, contrast })),
    setFontSize: (fontSize: number) => setState((s) => ({ ...s, fontSize })),
    setLineHeight: (lineHeight: number) =>
      setState((s) => ({ ...s, lineHeight })),
    setLetterSpacing: (letterSpacing: number) =>
      setState((s) => ({ ...s, letterSpacing })),
    setTextAlign: (textAlign: TextAlign) =>
      setState((s) => ({ ...s, textAlign })),
    setCursor: (cursor: CursorMode) => setState((s) => ({ ...s, cursor })),
    setHideImages: (hideImages: boolean) =>
      setState((s) => ({ ...s, hideImages })),
    setHighlightLinks: (highlightLinks: boolean) =>
      setState((s) => ({ ...s, highlightLinks })),
    toggleWidget: () =>
      setState((s) => ({ ...s, isWidgetOpen: !s.isWidgetOpen })),
    reset,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context)
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider"
    );
  return context;
};
