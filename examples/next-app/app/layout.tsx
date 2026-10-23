import type { ReactNode } from "react";
import Link from "next/link";
import { AccessibilitySettings } from "./components/AccessibilitySettings";
import { ThemeToggle } from "./components/ThemeToggle";
import "./host.css";

export const metadata = {
  title: "Next.js App Router — Accessibility Plugin Example",
  description:
    "Next.js App Router integration with client boundary, route transitions, and strict CSP guidance",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <nav className="nav">
            <Link href="/" className="nav-link">
              Home
            </Link>
            <Link href="/about" className="nav-link">
              About
            </Link>
          </nav>
          <ThemeToggle />
        </header>
        <main id="main-content" className="content">
          {children}
        </main>
        {/* Mount one provider per document in the persistent root layout */}
        <AccessibilitySettings />
      </body>
    </html>
  );
}
