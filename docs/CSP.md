# Content Security Policy (CSP) Guidance

This guide explains how `accessibility-plugin-react` operates under Content Security Policy (CSP), the specific directives involved, and copy-pasteable recipes for strict environments in Next.js, Vite, and static deployments.

---

## 1. How the Library Works Under CSP

`accessibility-plugin-react` is designed to be lightweight, modular, and dependency-free. However, because it dynamically adapts host pages according to user accessibility preferences, several CSP directives are relevant:

### A. Scoped Stylesheet Injection (`style-src`)

- **Default behavior:** Importing `accessibility-plugin-react` automatically injects its scoped stylesheet (`.arap-root { ... }`) into `document.head` via a runtime `<style>` element.
- **Strict CSP (`style-src 'self'` without `'unsafe-inline'`):** If your CSP policy disallows inline `<style>` tags, you should import the standalone stylesheet directly in your build or application entry point instead of relying on runtime injection:
  ```tsx
  // app/layout.tsx (Next.js) or main.tsx (Vite)
  import "accessibility-plugin-react/style.css";
  ```
  Because `style.css` is processed by your bundler (webpack, Vite, Turbopack) as a static asset, it is served from `'self'` and requires no inline script or style permissions.

### B. Element Style Mutations (`style-src-attr`)

- **How effects are applied:** The scoped effect manager applies display preferences (such as font scaling, line height, letter spacing, contrast, saturation, and color filters) directly to DOM elements via the CSSOM (e.g., `element.style.fontSize = "120%"`).
- **CSP Level 3 considerations:** In modern browsers enforcing CSP Level 3, mutations to an element's `.style` attribute are governed by `style-src-attr`.
- **Recommended directive:**
  ```text
  style-src-attr 'unsafe-inline';
  ```
  Note that `style-src-attr 'unsafe-inline'` does not allow arbitrary `<style>` tags; it only permits direct style property mutations on DOM elements.

### C. Big Cursor and High-Contrast Overlays (`img-src`)

- **How cursor enlargement works:** The `BigCursorController` dynamically generates an SVG data URI cursor (`data:image/svg+xml,...`) to provide high-visibility, high-contrast pointer cursors without requiring external network requests.
- **Recommended directive:**
  ```text
  img-src 'self' data:;
  ```
  If `data:` is omitted from `img-src`, the browser will fall back to native system cursors.

---

## 2. Next.js App Router Strict CSP Recipe

In Next.js App Router, you can set CSP headers in `next.config.mjs` or dynamically in `middleware.ts` with nonces.

### Option 1: Static Headers via `next.config.mjs` (Recommended)

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  style-src-attr 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

When using `'self'` without `'unsafe-inline'` in `style-src`, ensure you import the stylesheet in `app/layout.tsx`:

```tsx
// app/layout.tsx
import "accessibility-plugin-react/style.css";
```

### Option 2: Dynamic Nonce via `middleware.ts`

If your organization requires cryptographic nonces for script and style execution:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    style-src-attr 'unsafe-inline';
    img-src 'self' data:;
    font-src 'self';
    base-uri 'self';
    form-action 'self';
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set("Content-Security-Policy", cspHeader);
  return response;
}

export const config = {
  matcher: [
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
```

---

## 3. Vite / Single Page App Strict CSP Recipe

For Vite applications, configure CSP headers either through your production web server (nginx, Apache, Caddy, Cloudflare) or directly in `index.html`:

```html
<!-- index.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="
        default-src 'self';
        script-src 'self';
        style-src 'self' 'unsafe-inline';
        style-src-attr 'unsafe-inline';
        img-src 'self' data:;
        font-src 'self';
      "
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Accessible App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 4. Verification Checklist

| Requirement                   | Directive                                           | Why It Is Needed                                                                                         |
| :---------------------------- | :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Widget UI Styles**          | `style-src 'self'` (with static `style.css` import) | Renders the Clean light widget panel, trigger, and control cards                                         |
| **Dynamic Host Effects**      | `style-src-attr 'unsafe-inline'`                    | Applies runtime font-size, line-height, and filter adjustments to host elements                          |
| **Big High-Contrast Cursor**  | `img-src 'self' data:`                              | Allows SVG data URI pointer rendering                                                                    |
| **No External Font Requests** | `font-src 'self'`                                   | The plugin does not load external web fonts; all font-legibility features use local and system fallbacks |
| **No Network Calls**          | No special `connect-src`                            | All preferences, state persistence, and effects operate 100% locally on the client                       |
