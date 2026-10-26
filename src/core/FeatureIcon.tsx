import type { ReactNode } from "react";

const drawings: Record<string, ReactNode> = {
  fontSize: (
    <>
      <path d="M3 18 8 5l5 13M5 13h6M15 18l3-8 3 8M16 15h4" />
    </>
  ),
  lineHeight: (
    <>
      <path d="M9 6h12M9 12h9M9 18h12M4 4v16m-2-2 2 2 2-2M2 6l2-2 2 2" />
    </>
  ),
  letterSpacing: (
    <>
      <path d="M3 13 7 3l4 10M4.5 9h5M14 13l4-10 4 10m-6.5-4h5M3 19h18m-3-2 3 2-3 2M6 17l-3 2 3 2" />
    </>
  ),
  wordSpacing: (
    <>
      <path d="M4 6v12M20 6v12M9 12h6m-2-3 3 3-3 3m-4-3-3-3 3 3" />
    </>
  ),
  paragraphSpacing: (
    <>
      <path d="M4 5h16M4 9h12M4 19h16M4 15h12M18 10v4m-2-2 2-2 2 2m-4 2 2 2 2-2" />
    </>
  ),
  contrast: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
    </>
  ),
  contrastMode: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
    </>
  ),
  saturation: (
    <>
      <path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z" />
      <path d="M8 15a4 4 0 0 0 4 4" />
    </>
  ),
  invertColors: (
    <>
      <path d="M12 3c-2 4-7 8-7 12a7 7 0 0 0 14 0c0-4-5-8-7-12Z" />
      <path d="M12 3v19" />
    </>
  ),
  grayscale: (
    <>
      <circle cx="8" cy="12" r="5" />
      <circle cx="16" cy="12" r="5" />
      <path d="M8 7v10M16 7v10" />
    </>
  ),
  linkHighlight: (
    <>
      <path d="m10 14 4-4M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0" />
    </>
  ),
  highlightFocus: (
    <>
      <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  focusHighlight: (
    <>
      <path d="M4 8V4h4M20 8V4h-4M4 16v4h4M20 16v4h-4" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  textAlign: (
    <>
      <path d="M3 5h18M3 10h12M3 15h18M3 20h12" />
    </>
  ),
  fontFamily: (
    <>
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </>
  ),
  hideImages: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8" cy="9" r="1" />
      <path d="m3 17 5-5 4 4 3-3 6 5M2 2l20 20" />
    </>
  ),
  hideVideos: (
    <>
      <rect x="3" y="5" width="13" height="14" rx="2" />
      <path d="m16 10 5-3v10l-5-3M2 2l20 20" />
    </>
  ),
  bigCursor: <path d="m5 3 14 11-7 1-3 6Z" />,
  readingMask: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18" />
      <path d="M6 12h12" />
    </>
  ),
  readingGuide: (
    <>
      <path d="M3 5h18M3 10h12M3 19h18" />
      <path d="M2 15h20" strokeWidth="3" />
    </>
  ),
  reset: (
    <>
      <path d="M3 10a9 9 0 1 1 1 7M3 4v6h6" />
    </>
  ),
};

/** Decorative only: each control keeps its existing visible and accessible name. */
export function FeatureIcon({ name }: { name: string }) {
  return (
    <svg
      className="arap-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {drawings[name]}
    </svg>
  );
}
