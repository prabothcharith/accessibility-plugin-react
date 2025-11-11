import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AccessibilityState, AccessibilityAction, AccessibilityContextType } from '../types';
import { initialState, STORAGE_KEY } from '../constants';

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function accessibilityReducer(state: AccessibilityState, action: AccessibilityAction): AccessibilityState {
  switch (action.type) {
    case 'TOGGLE_BIG_CURSOR':
      return { ...state, bigCursor: !state.bigCursor };
    
    case 'TOGGLE_READING_MASK':
      return { ...state, readingMask: !state.readingMask, readingGuide: false };
    
    case 'TOGGLE_READING_GUIDE':
      return { ...state, readingGuide: !state.readingGuide, readingMask: false };
    
    case 'SET_FONT_SIZE':
      return { ...state, fontSize: action.payload };
    
    case 'SET_LINE_HEIGHT':
      return { ...state, lineHeight: action.payload };
    
    case 'SET_LETTER_SPACING':
      return { ...state, letterSpacing: action.payload };
    
    case 'SET_TEXT_ALIGN':
      return { ...state, textAlign: action.payload };
    
    case 'TOGGLE_INVERT_COLORS':
      return { ...state, invertColors: !state.invertColors };
    
    case 'TOGGLE_GRAYSCALE':
      return { ...state, grayscale: !state.grayscale };
    
    case 'TOGGLE_LOW_SATURATION':
      return { ...state, lowSaturation: !state.lowSaturation, highSaturation: false };
    
    case 'TOGGLE_HIGH_SATURATION':
      return { ...state, highSaturation: !state.highSaturation, lowSaturation: false };
    
    case 'SET_CONTRAST':
      return {
        ...state,
        lowContrast: action.payload === 'low',
        highContrast: action.payload === 'high',
        extraContrast: action.payload === 'extra',
      };
    
    case 'TOGGLE_HIDE_IMAGES':
      return { ...state, hideImages: !state.hideImages };
    
    case 'TOGGLE_HIDE_VIDEOS':
      return { ...state, hideVideos: !state.hideVideos };
    
    case 'TOGGLE_LINK_HIGHLIGHT':
      return { ...state, linkHighlight: !state.linkHighlight };
    
    case 'RESET_ALL':
      return initialState;
    
    case 'LOAD_STATE':
      return action.payload;
    
    default:
      return state;
  }
}

interface AccessibilityProviderProps {
  children: ReactNode;
  storageKey?: string;
}

export function AccessibilityProvider({ children, storageKey = STORAGE_KEY }: AccessibilityProviderProps) {
  const [state, dispatch] = useReducer(accessibilityReducer, initialState, (initial: AccessibilityState) => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
    return initial;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (error) {
        console.error('Failed to save accessibility settings:', error);
      }
    }
  }, [state, storageKey]);

  const value: AccessibilityContextType = {
    state,
    dispatch,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}
