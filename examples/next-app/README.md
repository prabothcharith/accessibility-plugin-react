# Next.js App Router Consumer Example

This example demonstrates how to integrate `accessibility-plugin-react` into a Next.js App Router application with Server Components, client boundaries, persistent layouts, dark themes, and strict Content Security Policy (CSP).

---

## Key Integration Patterns

### 1. Client Boundary

Keep the widget inside a Client Component:

```tsx
// app/components/AccessibilitySettings.tsx
"use client";

import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ResetController,
} from "accessibility-plugin-react";

export function AccessibilitySettings() {
  return (
    <AccessibilityPlugin position="right">
      <AccessibilityButton />
      <AccessibilityList>
        <FontSizeController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### 2. Persistent Layout

Mount the `<AccessibilitySettings />` component once inside `app/layout.tsx`. Because `layout.tsx` persists across route transitions, preferences and effect lifecycles are preserved when navigating between pages.

### 3. Strict CSP Guidance

See `next.config.mjs` for a working strict CSP header configuration. When `style-src 'unsafe-inline'` is restricted, import the static stylesheet:

```tsx
import "accessibility-plugin-react/style.css";
```

For complete CSP guidance, consult [docs/CSP.md](../../docs/CSP.md).

---

## Running this Example

```sh
# First, ensure the parent library is built
npm run build --prefix ../..

# Install and start the Next.js dev server
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.
