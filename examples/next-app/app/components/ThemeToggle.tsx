"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      onClick={() => setDark((prev) => !prev)}
      aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
    >
      {dark ? "☀️ Switch to Light Theme" : "🌙 Switch to Dark Theme"}
    </button>
  );
}
