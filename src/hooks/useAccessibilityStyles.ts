import { useEffect } from 'react';
import { useAccessibility } from '../context/AccessibilityContext';

export function useAccessibilityStyles() {
  const { state } = useAccessibility();

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Font Size
    root.style.fontSize = `${state.fontSize}%`;

    // Line Height
    if (state.lineHeight !== 100) {
      body.style.lineHeight = `${state.lineHeight}%`;
    } else {
      body.style.lineHeight = '';
    }

    // Letter Spacing
    if (state.letterSpacing !== 0) {
      body.style.letterSpacing = `${state.letterSpacing}px`;
    } else {
      body.style.letterSpacing = '';
    }

    // Text Align
    if (state.textAlign !== 'default') {
      body.style.textAlign = state.textAlign;
    } else {
      body.style.textAlign = '';
    }

    // Build filter string
    const filters: string[] = [];
    
    if (state.invertColors) {
      filters.push('invert(1)');
    }
    
    if (state.grayscale) {
      filters.push('grayscale(1)');
    }
    
    if (state.lowSaturation) {
      filters.push('saturate(0.5)');
    }
    
    if (state.highSaturation) {
      filters.push('saturate(2)');
    }

    if (state.lowContrast) {
      filters.push('contrast(0.7)');
    } else if (state.highContrast) {
      filters.push('contrast(1.5)');
    } else if (state.extraContrast) {
      filters.push('contrast(2)');
    }

    body.style.filter = filters.join(' ') || '';

    // Hide Images
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (state.hideImages) {
        img.style.display = 'none';
      } else {
        img.style.display = '';
      }
    });

    // Hide Videos
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      if (state.hideVideos) {
        video.style.display = 'none';
      } else {
        video.style.display = '';
      }
    });

    // Link Highlight
    const links = document.querySelectorAll('a');
    links.forEach((link) => {
      if (state.linkHighlight) {
        link.style.backgroundColor = 'yellow';
        link.style.color = 'black';
        link.style.padding = '2px 4px';
        link.style.textDecoration = 'underline';
      } else {
        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.padding = '';
        link.style.textDecoration = '';
      }
    });

    // Big Cursor
    if (state.bigCursor) {
      body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ccircle cx=\'16\' cy=\'16\' r=\'14\' fill=\'rgba(255,0,0,0.5)\' stroke=\'black\' stroke-width=\'2\'/%3E%3C/svg%3E") 16 16, auto';
    } else {
      body.style.cursor = '';
    }

  }, [state]);
}
