# Accessibility Plugin React

A customizable, accessible, and easy-to-integrate React accessibility widget built with shadcn/ui components, Framer Motion animations, and Tailwind CSS.

## Features

- **Contrast & Color Modes**: Normal, Invert, Grayscale, Low/High Saturation, Yellow on Black, White on Black, Blue on Yellow.
- **Text Adjustments**: Font Size, Line Height, Letter Spacing, Text Alignment.
- **Cursor Enhancements**: Big Cursor, Reading Guide.
- **Visual Toggles**: Hide Images, Highlight Links.
- **Drag & Drop**: Draggable trigger button with smooth animations.
- **Customizable**: All components can be customized or replaced.
- **Reset**: Easily reset all settings to default.

## Installation

```bash
npm install accessibility-plugin-react framer-motion lucide-react
# or
yarn add accessibility-plugin-react framer-motion lucide-react
# or
pnpm add accessibility-plugin-react framer-motion lucide-react
```

## Usage

### Basic Usage

Wrap your application (or the part you want to be accessible) with the `AccessibilityPlugin` component and include the CSS file.

```tsx
import { AccessibilityPlugin } from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

function App() {
  return (
    <AccessibilityPlugin>
      <YourAppContent />
    </AccessibilityPlugin>
  );
}

export default App;
```

### With All Default Tools

```tsx
import { 
  AccessibilityPlugin,
  ContrastTool,
  FontSizeTool,
  LineHeightTool,
  LetterSpacingTool,
  TextAlignTool,
  CursorTool,
  VisualTogglesTool
} from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

function App() {
  return (
    <AccessibilityPlugin>
      <ContrastTool />
      <FontSizeTool />
      <LineHeightTool />
      <LetterSpacingTool />
      <TextAlignTool />
      <CursorTool />
      <VisualTogglesTool />
    </AccessibilityPlugin>
  );
}
```

### Custom Trigger

You can provide a custom trigger button if you don't want to use the default one.

```tsx
<AccessibilityPlugin
  trigger={
    <button className="px-4 py-2 bg-blue-600 text-white rounded">
      Open Accessibility
    </button>
  }
>
  <ContrastTool />
  <FontSizeTool />
  {/* ... other tools */}
</AccessibilityPlugin>
```

### Using with Next.js

In Next.js 13+ (App Router), make sure to mark the component as a client component:

```tsx
'use client';

import { AccessibilityPlugin, ContrastTool, FontSizeTool } from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

export default function AccessibilityWrapper({ children }) {
  return (
    <AccessibilityPlugin>
      <ContrastTool />
      <FontSizeTool />
      {/* Add other tools as needed */}
    </AccessibilityPlugin>
  );
}
```

Then use it in your layout:

```tsx
import AccessibilityWrapper from './AccessibilityWrapper';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AccessibilityWrapper>
          {children}
        </AccessibilityWrapper>
      </body>
    </html>
  );
}
```

## Tailwind CSS Configuration

If you're using Tailwind CSS in your project, ensure your `tailwind.config.js` includes the theme variables for proper styling:

```js
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/accessibility-plugin-react/dist/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        border: "hsl(var(--border))",
      },
    },
  },
  plugins: [],
};
```

## API Reference

### Components

#### `AccessibilityPlugin`

Main wrapper component that provides accessibility context.

**Props:**
- `children`: ReactNode - The content to wrap (can be your app content or tool components)
- `trigger`: ReactNode (optional) - Custom trigger button component

#### Tool Components

All tool components are optional and can be used independently:

- `ContrastTool` - Color and contrast adjustments
- `FontSizeTool` - Font size adjustments (80% - 200%)
- `LineHeightTool` - Line height adjustments (1.0 - 3.0)
- `LetterSpacingTool` - Letter spacing adjustments (0 - 0.5em)
- `TextAlignTool` - Text alignment (left, center, right, initial)
- `CursorTool` - Cursor enhancements (normal, big, reading guide)
- `VisualTogglesTool` - Hide images and highlight links

### Hooks

#### `useAccessibility()`

Access the accessibility context directly to build custom tools.

```tsx
import { useAccessibility } from 'accessibility-plugin-react';

function CustomTool() {
  const { fontSize, setFontSize, reset } = useAccessibility();
  
  return (
    <div>
      <button onClick={() => setFontSize(fontSize + 0.1)}>Increase Font</button>
      <button onClick={reset}>Reset All</button>
    </div>
  );
}
```

## Customization

The plugin is designed to be customizable like shadcn/ui components. You can:

1. **Copy and modify tool components** - All tool components are exported and can be copied to your project for customization
2. **Create new tools** - Use the `useAccessibility()` hook to build entirely new accessibility tools
3. **Style with Tailwind** - All components use Tailwind CSS classes and can be easily styled
4. **Replace the trigger** - Provide your own custom trigger button design

## Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Run the development server: `npm run dev`.
4. Build the package: `npm run build`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

