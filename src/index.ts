// Main component
export { AccessibilityMenu } from './components/AccessibilityMenu';

// Feature components
export { Cursor } from './components/Cursor';
export { Fonts } from './components/Fonts';
export { Text } from './components/Text';
export { Colors } from './components/Colors';
export { Contrast } from './components/Contrast';
export { Images } from './components/Images';
export { Videos } from './components/Videos';
export { LinkHighlight } from './components/LinkHighlight';
export { ReadingTools } from './components/ReadingTools';

// Context and hooks
export { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
export { useAccessibilityStyles } from './hooks/useAccessibilityStyles';
export { useReadingTools } from './hooks/useReadingTools';

// Types
export type { 
  AccessibilityState, 
  AccessibilityAction, 
  AccessibilityContextType,
  AccessibilityMenuProps
} from './types';
