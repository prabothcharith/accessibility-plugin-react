"use client";

import { createContext } from "react";
import type { AccessibilityContextValue } from "./types";

export const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);
