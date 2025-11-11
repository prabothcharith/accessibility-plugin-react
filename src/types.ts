import { Dispatch, ReactNode } from 'react';

export interface AccessibilityState {
  // Cursor
  bigCursor: boolean;
  readingMask: boolean;
  readingGuide: boolean;
  
  // Font
  fontSize: number; // percentage
  
  // Text
  lineHeight: number; // percentage
  letterSpacing: number; // pixels
  textAlign: 'left' | 'center' | 'right' | 'justify' | 'default';
  
  // Colors
  invertColors: boolean;
  grayscale: boolean;
  lowSaturation: boolean;
  highSaturation: boolean;
  
  // Contrast
  lowContrast: boolean;
  highContrast: boolean;
  extraContrast: boolean;
  
  // Content
  hideImages: boolean;
  hideVideos: boolean;
  linkHighlight: boolean;
}

export type AccessibilityAction =
  | { type: 'TOGGLE_BIG_CURSOR' }
  | { type: 'TOGGLE_READING_MASK' }
  | { type: 'TOGGLE_READING_GUIDE' }
  | { type: 'SET_FONT_SIZE'; payload: number }
  | { type: 'SET_LINE_HEIGHT'; payload: number }
  | { type: 'SET_LETTER_SPACING'; payload: number }
  | { type: 'SET_TEXT_ALIGN'; payload: AccessibilityState['textAlign'] }
  | { type: 'TOGGLE_INVERT_COLORS' }
  | { type: 'TOGGLE_GRAYSCALE' }
  | { type: 'TOGGLE_LOW_SATURATION' }
  | { type: 'TOGGLE_HIGH_SATURATION' }
  | { type: 'SET_CONTRAST'; payload: 'low' | 'high' | 'extra' | 'default' }
  | { type: 'TOGGLE_HIDE_IMAGES' }
  | { type: 'TOGGLE_HIDE_VIDEOS' }
  | { type: 'TOGGLE_LINK_HIGHLIGHT' }
  | { type: 'RESET_ALL' }
  | { type: 'LOAD_STATE'; payload: AccessibilityState };

export interface AccessibilityContextType {
  state: AccessibilityState;
  dispatch: Dispatch<AccessibilityAction>;
}

export interface AccessibilityMenuProps {
  children?: ReactNode;
  position?: 'left' | 'right' | 'top' | 'bottom';
  storageKey?: string;
}
