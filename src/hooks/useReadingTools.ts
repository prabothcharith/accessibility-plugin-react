import { useEffect, useCallback } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export function useReadingTools() {
  const { state } = useAccessibility();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const mask = document.getElementById('accessibility-reading-mask');
    const guide = document.getElementById('accessibility-reading-guide');

    if (mask && state.readingMask) {
      mask.style.top = `${e.clientY - 30}px`;
    }

    if (guide && state.readingGuide) {
      guide.style.top = `${e.clientY}px`;
    }
  }, [state.readingMask, state.readingGuide]);

  useEffect(() => {
    if (state.readingMask || state.readingGuide) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [state.readingMask, state.readingGuide, handleMouseMove]);

  return null;
}
