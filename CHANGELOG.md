# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-03

### Added
- Initial release of accessibility-plugin-react
- Main `AccessibilityPlugin` component that wraps applications
- Default accessibility tools included automatically:
  - `ContrastTool` - 8 color contrast modes (normal, invert, grayscale, low/high saturation, yellow-on-black, white-on-black, blue-on-yellow)
  - `FontSizeTool` - Adjustable font size (80% - 200%)
  - `LineHeightTool` - Adjustable line height (1.0 - 3.0)
  - `LetterSpacingTool` - Adjustable letter spacing (0 - 0.5em)
  - `TextAlignTool` - Text alignment options (left, center, right, initial)
  - `CursorTool` - Cursor enhancements (normal, big, reading guide)
  - `VisualTogglesTool` - Hide images and highlight links
- `useAccessibility` hook for building custom accessibility tools
- Draggable floating trigger button with smooth animations
- Side panel with tool grid layout
- Full TypeScript support with exported types
- CSS variables for easy theming and customization
- Comprehensive documentation and usage examples

### Features
- **Shadcn-style API**: Simple, composable, and customizable like shadcn/ui components
- **Default Tools**: All accessibility tools included by default - no need to import each one
- **Custom Tool Selection**: Optionally specify which tools to display via `tools` prop
- **Custom Trigger**: Provide custom trigger button icon
- **Framer Motion Animations**: Smooth entrance/exit animations and drag interactions
- **Tailwind CSS Styling**: Uses Tailwind utility classes for easy customization
- **Next.js Compatible**: Works with both App Router and Pages Router
- **React 18 & 19 Support**: Compatible with latest React versions
- **Peer Dependencies**: framer-motion and lucide-react are peer dependencies for better package size

### Technical
- Built with Vite for optimal bundling
- TypeScript type definitions included
- CSS properly bundled in dist/style.css
- UMD and ES module formats supported
- Zero security vulnerabilities (CodeQL verified)
- ESLint compliant

### Documentation
- Comprehensive README.md with installation and usage instructions
- EXAMPLES.md with usage patterns for React, Next.js, and custom implementations
- API reference for all components and hooks
- Tailwind configuration guide
- TypeScript usage examples
