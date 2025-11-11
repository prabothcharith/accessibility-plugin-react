import { AccessibilityState } from './types';

export const initialState: AccessibilityState = {
  bigCursor: false,
  readingMask: false,
  readingGuide: false,
  fontSize: 100,
  lineHeight: 100,
  letterSpacing: 0,
  textAlign: 'default',
  invertColors: false,
  grayscale: false,
  lowSaturation: false,
  highSaturation: false,
  lowContrast: false,
  highContrast: false,
  extraContrast: false,
  hideImages: false,
  hideVideos: false,
  linkHighlight: false,
};

export const STORAGE_KEY = 'accessibility-plugin-react-state';
