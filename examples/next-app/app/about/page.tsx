import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="card">
      <h1>About This Integration</h1>
      <p>
        You are now on the <code>/about</code> route.
      </p>
      <p>
        Because the <code>AccessibilityPlugin</code> provider is mounted in the
        root <code>layout.tsx</code>, it maintains persistent effect management
        and state across route navigations.
      </p>
      <p>
        When you navigate to this route, any active accessibility preferences
        (such as enlarged text, custom line height, or contrast palettes) are
        automatically and safely applied to this newly rendered page content.
      </p>
      <p>
        <Link href="/" className="btn-primary">
          &larr; Return to Home
        </Link>
      </p>
    </div>
  );
}
