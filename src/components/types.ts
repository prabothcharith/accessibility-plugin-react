export type ContrastMode = 'normal' | 'invert' | 'grayscale' | 'low-saturation' | 'high-saturation' | 'yellow-on-black' | 'white-on-black' | 'blue-on-yellow';
export type CursorMode = 'normal' | 'big' | 'reading-guide';
export type TextAlign = 'initial' | 'left' | 'center' | 'right';

export interface AccessibilityState {
  contrast: ContrastMode;
  fontSize: number; // 1 = 100%
  lineHeight: number; // 1 = normal
  letterSpacing: number; // 0 = normal
  textAlign: TextAlign;
  cursor: CursorMode;
  hideImages: boolean;
  highlightLinks: boolean;
  isWidgetOpen: boolean;
}
