import { describe, it, expect } from "vitest";
import React from "react";
import { renderToString } from "react-dom/server";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  LineHeightController,
  LetterSpacingController,
  ContrastController,
  SaturationController,
  InvertColorsController,
  GrayscaleController,
  LinkHighlightController,
  TextAlignController,
  HideImagesController,
  HideVideosController,
  BigCursorController,
  ReadingMaskController,
  ReadingGuideController,
  ResetController,
  FeatureCard,
  ToggleControl,
  ChoiceControl,
  StepperControl,
  ProfilePreviewCard,
  PROFILE_DEFINITIONS,
  SearchCount,
  EmptyState,
} from "../src";

describe("Server-Side Rendering (SSR) & Consumer Boundaries", () => {
  it("renders AccessibilityPlugin and all 15 controllers to string without errors or browser-global access", () => {
    // During SSR in Next.js Server Components, window/localStorage are either undefined or should never be accessed.
    const html = renderToString(
      <AccessibilityPlugin position="left" persistenceKey="test-ssr:prefs">
        <AccessibilityButton description="Display settings" />
        <AccessibilityList title="Settings">
          <FontSizeController />
          <LineHeightController />
          <LetterSpacingController />
          <ContrastController />
          <SaturationController />
          <InvertColorsController />
          <GrayscaleController />
          <LinkHighlightController />
          <TextAlignController />
          <HideImagesController />
          <HideVideosController />
          <BigCursorController />
          <ReadingMaskController />
          <ReadingGuideController />
          <ResetController />
        </AccessibilityList>
        <main>
          <h1>Server Content</h1>
          <p>Initial server rendered text</p>
        </main>
      </AccessibilityPlugin>,
    );

    // Host children must render
    expect(html).toContain("Server Content");
    expect(html).toContain("Initial server rendered text");

    // Client portal must return null on the server to prevent hydration mismatch
    expect(html).not.toContain("arap-root");
    expect(html).not.toContain("arap-panel");
  });

  it("renders control primitives and profile cards to string without errors", () => {
    const html = renderToString(
      <div>
        <FeatureCard
          title="Text Scaling"
          description="Adjust readable text dimensions"
          status="active"
        >
          <StepperControl
            id="test-stepper"
            label="Font Scale"
            value={120}
            min={50}
            max={200}
            step={10}
            unit="%"
            onChange={() => {}}
          />
        </FeatureCard>

        <FeatureCard title="High Contrast" description="Increase contrast">
          <ToggleControl
            id="test-toggle"
            label="High Contrast"
            checked={true}
            onChange={() => {}}
          />
        </FeatureCard>

        <ChoiceControl
          id="test-choice"
          label="Color Mode"
          value="dark"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
          onChange={() => {}}
        />

        <ProfilePreviewCard
          profile={PROFILE_DEFINITIONS["motor"]}
          isActive={false}
          onApply={() => {}}
          onRevert={() => {}}
        />

        <SearchCount matchedCount={3} totalCount={15} query="font" />
        <EmptyState
          title="No tools found"
          description="Try a different search query"
        />
      </div>,
    );

    expect(html).toContain("Text Scaling");
    expect(html).toContain("120%");
    expect(html).toContain(PROFILE_DEFINITIONS["motor"].label);
    expect(html).toContain("Showing 3 of 15 tools matching &quot;font&quot;");
    expect(html).toContain("No tools found");
  });

  it("renders correctly when rendered as child in Server Component layout", () => {
    function ServerLayout({ children }: { children: React.ReactNode }) {
      return (
        <html lang="en">
          <body>
            <header>Layout Header</header>
            <main>{children}</main>
            <AccessibilityPlugin>
              <AccessibilityButton />
              <AccessibilityList>
                <FontSizeController />
              </AccessibilityList>
            </AccessibilityPlugin>
          </body>
        </html>
      );
    }

    const html = renderToString(
      <ServerLayout>
        <h1>Page Content</h1>
      </ServerLayout>,
    );

    expect(html).toContain("Layout Header");
    expect(html).toContain("Page Content");
  });
});
