# Usage Examples

## Basic Usage (React)

### Minimal Setup with Default Tools

```tsx
import { AccessibilityPlugin } from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

function App() {
  return (
    <AccessibilityPlugin>
      <div className="app">
        <h1>My Application</h1>
        <p>Content goes here...</p>
      </div>
    </AccessibilityPlugin>
  );
}

export default App;
```

### Custom Tool Selection

```tsx
import { 
  AccessibilityPlugin,
  ContrastTool,
  FontSizeTool,
  LineHeightTool
} from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

function App() {
  return (
    <AccessibilityPlugin
      tools={
        <>
          <ContrastTool />
          <FontSizeTool />
          <LineHeightTool />
        </>
      }
    >
      <div className="app">
        <h1>My Application</h1>
        <p>Content goes here...</p>
      </div>
    </AccessibilityPlugin>
  );
}
```

### Custom Trigger Icon

```tsx
import { AccessibilityPlugin } from 'accessibility-plugin-react';
import { Accessibility } from 'lucide-react';
import 'accessibility-plugin-react/style.css';

function App() {
  return (
    <AccessibilityPlugin trigger={<Accessibility className="w-6 h-6" />}>
      <div className="app">
        <h1>My Application</h1>
      </div>
    </AccessibilityPlugin>
  );
}
```

## Next.js App Router

### app/components/AccessibilityWrapper.tsx

```tsx
'use client';

import { AccessibilityPlugin } from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';

export default function AccessibilityWrapper({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <AccessibilityPlugin>
      {children}
    </AccessibilityPlugin>
  );
}
```

### app/layout.tsx

```tsx
import AccessibilityWrapper from './components/AccessibilityWrapper';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

## Next.js Pages Router

### pages/_app.tsx

```tsx
import { AccessibilityPlugin } from 'accessibility-plugin-react';
import 'accessibility-plugin-react/style.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AccessibilityPlugin>
      <Component {...pageProps} />
    </AccessibilityPlugin>
  );
}
```

## Creating Custom Tools

You can create your own accessibility tools using the `useAccessibility` hook:

```tsx
import { useAccessibility } from 'accessibility-plugin-react';

function CustomDarkModeTool() {
  const { contrast, setContrast } = useAccessibility();
  
  const toggleDarkMode = () => {
    setContrast(contrast === 'invert' ? 'normal' : 'invert');
  };
  
  return (
    <div className="col-span-2">
      <button
        onClick={toggleDarkMode}
        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        {contrast === 'invert' ? 'Light Mode' : 'Dark Mode'}
      </button>
    </div>
  );
}

// Use in your app
<AccessibilityPlugin
  tools={
    <>
      <CustomDarkModeTool />
      <FontSizeTool />
      <LineHeightTool />
    </>
  }
>
  <YourApp />
</AccessibilityPlugin>
```

## Customizing Styles

The plugin uses CSS variables from your Tailwind configuration. To customize colors:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%; /* Custom primary color */
  --primary-foreground: 210 40% 98%;
  /* ... other variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%; /* Custom primary color for dark mode */
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... other variables */
}
```

## TypeScript Usage

All components and hooks are fully typed. Use the exported types for custom implementations:

```tsx
import { 
  AccessibilityPlugin,
  useAccessibility,
  type ContrastMode,
  type TextAlign,
  type CursorMode
} from 'accessibility-plugin-react';

function CustomAccessibilityControl() {
  const { 
    fontSize, 
    setFontSize,
    contrast,
    setContrast 
  } = useAccessibility();
  
  const handleFontIncrease = () => {
    setFontSize(Math.min(fontSize + 0.1, 2));
  };
  
  return (
    <div>
      <button onClick={handleFontIncrease}>Increase Font</button>
      <span>Current size: {Math.round(fontSize * 100)}%</span>
    </div>
  );
}
```

## Vite Configuration

If you're using Vite, ensure your `vite.config.ts` includes the plugin in the content array for Tailwind:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No special configuration needed - just import the CSS
});
```

## Webpack Configuration (Create React App)

For Create React App or other Webpack-based setups, simply import the CSS in your main file:

```tsx
// index.tsx or main.tsx
import 'accessibility-plugin-react/style.css';
import { AccessibilityPlugin } from 'accessibility-plugin-react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <AccessibilityPlugin>
    <App />
  </AccessibilityPlugin>
);
```
