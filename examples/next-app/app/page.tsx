import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card">
      <h1>Next.js App Router Integration</h1>
      <p>
        This example demonstrates how to integrate{" "}
        <code>accessibility-plugin-react</code> into a Next.js App Router
        application with Server Components, client boundaries, and persistent
        root layouts.
      </p>
      <h2>Key Architectural Highlights</h2>
      <ul>
        <li>
          <strong>Client Boundary:</strong> The widget is isolated in a{" "}
          <code>&quot;use client&quot;</code> component (
          <code>AccessibilitySettings.tsx</code>), keeping the root layout a
          Server Component.
        </li>
        <li>
          <strong>No Hydration Mismatch:</strong> <code>WidgetPortal</code>{" "}
          defers DOM portal insertion to the client using{" "}
          <code>useSyncExternalStore</code>, avoiding SSR divergence.
        </li>
        <li>
          <strong>Route Resilience:</strong> Click{" "}
          <Link href="/about">About Page</Link> to navigate. Notice how your
          accessibility preferences (font size, contrast, spacing) persist
          across Next.js client-side route transitions without reset or
          flickering.
        </li>
        <li>
          <strong>Dark Mode Support:</strong> Toggle the theme button in the
          header. The Clean light widget maintains legible contrast against dark
          host backgrounds without being inverted.
        </li>
      </ul>
      <p>
        <Link href="/about" className="btn-primary">
          Visit About Page &rarr;
        </Link>
      </p>
    </div>
  );
}
