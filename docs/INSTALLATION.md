# Installation and integration

## Requirements

Development: Node.js 22.13 or newer, npm, Git. Library peers: React/React DOM 18.3.1 or 19.x. Keep React and React DOM on the same version. There are no application environment variables, API keys, backend services or mandatory network access at runtime. Storage is optional (`persist={false}`).

The owner selected the existing registry identity `accessibility-plugin-react`. The registry currently has 1.0.0; this checkout prepares an unreleased 2.0.0-beta.1 candidate. The API changes require migration (see MIGRATION.md). After beta publication, use `npm install accessibility-plugin-react@beta`; plain `npm install accessibility-plugin-react` continues to select the registry's latest tag. For this checkout:

```sh
npm ci
npm run build
npm pack
# From an independent application:
npm install /absolute/path/to/accessibility-plugin-react-2.0.0-beta.1.tgz
```

Import `accessibility-plugin-react/style.css` once near the app entry. Do not add the library to a Tailwind content scan. No shadcn, icon or Motion dependency is needed. See README for complete React/Vite JSX.

## Next.js App Router

Keep custom hooks and custom apply callbacks in a Client Component. The built library preserves its own client boundary. The root layout may remain a Server Component.

```tsx
// app/preferences.tsx
"use client";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  GrayscaleController,
  ResetController,
} from "accessibility-plugin-react";
export default function Preferences() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <FontSizeController />
        <GrayscaleController />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

```tsx
// app/layout.tsx
import type { ReactNode } from "react";
import "accessibility-plugin-react/style.css";
import Preferences from "./preferences";
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Preferences />
      </body>
    </html>
  );
}
```

Mount the widget in the persistent root layout, not each route. Do not place document reads inside render. Do not disable SSR merely to mask hydration problems. Effects and portals appear on the client after hydration; a brief default-style paint can occur.

## Next.js Pages Router

```tsx
// pages/_app.tsx
import type { AppProps } from "next/app";
import "accessibility-plugin-react/style.css";
import Preferences from "../components/preferences"; // same component as above
export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <Preferences />
    </>
  );
}
```

## Custom global CSS, Tailwind and themes

Load library CSS after a host reset and load intentional widget overrides afterward. There is no library global preflight. Portals are independent of application layout and filter effects. Global host styles can still affect inherited properties or override selectors, especially with `!important`; inspect computed styles if controls differ.

Filters create a containing block for fixed host descendants. Test sticky/fixed headers, modals, menus, images and third-party overlays in your real application. Text measurement does not enter iframe documents or Shadow DOM. Hiding videos is visual only and is not a playback-control feature. See troubleshooting for CSP and font-loading considerations.

## Verified consumers

Automated scripts install the packed archive into separate directories rather than importing repository source. They exercise ESM, CommonJS, declarations, SSR, production Vite builds, and production Next App/Pages routes. Exact framework/browser versions and actual results are in PROJECT_STATUS.md. Broader versions allowed by peer ranges are compatibility targets, not individually verified claims.
