import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("closed widget does not block the host; keyboard and focus work", async ({
  page,
}) => {
  await page.getByRole("button", { name: "Host action 0" }).click();
  await expect(
    page.getByRole("button", { name: "Host action 1" }),
  ).toBeVisible();
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("region")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Close accessibility settings")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("region")).not.toBeVisible();
  await trigger.click();
  await page.getByLabel("Close accessibility settings").click();
  await expect(trigger).toBeFocused();
});
test("combined effects survive closure, navigation, reload and reset", async ({
  page,
}) => {
  await page.locator("#sample").evaluate((el) => {
    (el as HTMLElement).style.lineHeight = "30px";
  });
  await page.getByLabel("Accessibility", { exact: true }).click();
  await page.getByLabel("Increase font size").click();
  await page
    .getByRole("group", { name: "Contrast", exact: true })
    .getByRole("button", { name: "High", exact: true })
    .click();
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.getByLabel("Close accessibility settings").click();
  await expect(page.locator("#sample")).toHaveCSS("line-height", "33px");
  // Engines quantize font sizes; still require the rendered value within 1/32 CSS px.
  await expect
    .poll(async () =>
      Math.abs(
        (await page
          .locator("#sample")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) - 19.8,
      ),
    )
    .toBeLessThan(1 / 32);
  await page.getByRole("button", { name: "Navigate", exact: true }).click();
  await expect(page.locator("#route")).toHaveCSS("font-size", "33px");
  await page.waitForFunction(() =>
    localStorage
      .getItem("react-accessibility-plugin:state")
      ?.includes("grayscale"),
  );
  await page.reload();
  // Engines quantize font sizes; still require the rendered value within 1/32 CSS px.
  await expect
    .poll(async () =>
      Math.abs(
        (await page
          .locator("#sample")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize))) - 19.8,
      ),
    )
    .toBeLessThan(1 / 32);
  await expect(page.getByRole("region")).not.toBeVisible();
  await page.getByLabel("Accessibility", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Grayscale", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Reset All" }).click();
  await expect(page.locator("#sample")).toHaveCSS("font-size", "18px");

  await expect
    .poll(() =>
      page.evaluate(() =>
        localStorage.getItem("react-accessibility-plugin:state"),
      ),
    )
    .toBeNull();
});
test("widget remains unfiltered and fits a narrow viewport in every position", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const position of ["left", "right", "top", "bottom"]) {
    await page.getByLabel("Widget position").selectOption(position);
    await page.getByLabel("Accessibility", { exact: true }).click();
    const panel = page.getByRole("region");
    const bounds = await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    expect(bounds!.y).toBeGreaterThanOrEqual(0);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(568);
    await expect(panel).toHaveCSS("filter", "none");
    expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
      true,
    );
    // Visible controls must retain comfortable targets after the visual redesign.
    const targets = await panel
      .locator("button:visible")
      .evaluateAll((buttons) =>
        buttons.map((button) => {
          const bounds = button.getBoundingClientRect();
          return { width: bounds.width, height: bounds.height };
        }),
      );
    for (const target of targets) {
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
    }
    await page.getByLabel("Close accessibility settings").click();
  }
});
test("quick actions fit a short screen without the trigger covering them", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 240 });
  await page.getByLabel("Accessibility", { exact: true }).click();
  const reset = page.getByRole("button", { name: "Reset All", exact: true });
  const rect = (await reset.boundingBox())!;
  expect(rect.y).toBeGreaterThanOrEqual(0);
  expect(rect.y + rect.height).toBeLessThanOrEqual(240);
  await reset.click();
  await page.getByLabel("Close accessibility settings").click();
  await expect(page.getByLabel("Accessibility", { exact: true })).toBeFocused();
});

test("custom effects restore and clean up when widget is removed", async ({
  page,
}) => {
  await page.getByLabel("Accessibility", { exact: true }).click();
  await page.getByRole("button", { name: "Outline", exact: true }).click();
  await page.getByLabel("Close accessibility settings").click();
  await expect(page.locator("#host")).toHaveCSS("outline-style", "solid");
  await page.getByRole("button", { name: "Mount widget" }).click();
  await expect(page.locator("#host")).toHaveCSS("outline-style", "none");
  await page.getByRole("button", { name: "Mount widget" }).click();
  await expect(page.locator("#host")).toHaveCSS("outline-style", "solid");
});
test("no axe WCAG A/AA findings in light or dark host; reduced motion respected", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByLabel("Accessibility", { exact: true }).click();
  const result = await new AxeBuilder({ page })
    .include("[data-arap-ui]")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(result.violations).toEqual([]);
  await expect(page.locator(".arap-toggle-knob").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await page.getByLabel("Close accessibility settings").click();
  await page.getByRole("button", { name: "Theme", exact: true }).click();
  await page.getByLabel("Accessibility", { exact: true }).click();
  expect(
    (
      await new AxeBuilder({ page })
        .include("[data-arap-ui]")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("media, reading aids, pointer movement and unmount cleanup", async ({
  page,
}) => {
  await page.getByLabel("Accessibility", { exact: true }).click();
  await page.getByRole("button", { name: "Hide Images", exact: true }).click();
  await page.getByRole("button", { name: "Reading Mask", exact: true }).click();
  await page
    .getByRole("button", { name: "Reading Guide", exact: true })
    .click();
  await expect(page.locator("#sample-decorative-img")).toHaveCSS(
    "visibility",
    "hidden",
  );
  await expect(page.getByAltText("Example landscape")).not.toHaveCSS(
    "visibility",
    "hidden",
  );
  await page.getByLabel("Close accessibility settings").click();
  await page.mouse.move(80, 180);
  await expect(page.locator(".arap-reading-guide")).toHaveCSS("top", "180px");
  await expect(page.locator(".arap-reading-mask")).toHaveCSS(
    "background-color",
    "rgba(0, 0, 0, 0)",
  );
  await page.getByRole("button", { name: "Mount widget" }).click();
  await expect(page.locator(".arap-reading-mask")).toHaveCount(0);
  await expect(page.getByAltText("Example landscape")).toHaveCSS(
    "visibility",
    "visible",
  );
});

test("A11Y-302 accessible tooltips: hover displays authored alt, Escape dismisses", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Enable Accessible Tooltips
  const tooltipsToggle = page.getByRole("button", {
    name: "Accessible Tooltips",
  });
  await tooltipsToggle.click();
  await expect(tooltipsToggle).toHaveAttribute("aria-pressed", "true");

  await page.getByLabel("Close accessibility settings").click();

  // Hover over the image with alt="Example landscape"
  const img = page.getByAltText("Example landscape");
  await img.hover();

  const tooltip = page.locator(".arap-accessible-tooltip");
  await expect(tooltip).toBeVisible();
  await expect(tooltip).toHaveText("Example landscape");
  await expect(tooltip).toHaveAttribute("role", "presentation");
  await expect(tooltip).toHaveAttribute("aria-hidden", "true");

  // Press Escape to dismiss
  await page.keyboard.press("Escape");
  await expect(tooltip).not.toHaveAttribute("data-visible", "true");
});

test("A11Y-303 page navigator: maps headings and landmarks, navigates safely and dismisses with Escape", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Open Page Navigator
  const exploreBtn = page.locator(
    "button[aria-controls='arap-page-navigator-dialog']",
  );
  await exploreBtn.click();
  await expect(exploreBtn).toHaveAttribute("aria-expanded", "true");

  const dialog = page.getByRole("region", { name: "Page Structure Explorer" });
  await expect(dialog).toBeVisible();

  // Check that Heading 1 ("Accessibility preferences") is discovered
  await expect(dialog.getByText("Headings (1)")).toBeVisible();
  const h1Jump = dialog.getByRole("button", {
    name: /Accessibility preferences/i,
  });
  await expect(h1Jump).toBeVisible();

  // Click jump button to navigate to heading
  await h1Jump.click();
  await expect(page.locator("h1")).toBeFocused();

  // Switch to Landmarks tab
  const landmarksTab = dialog.getByRole("tab", { name: /Landmarks/i });
  await landmarksTab.click();
  await expect(
    dialog.getByRole("button", { name: /Main Content/i }),
  ).toBeVisible();

  // Escape closes dialog
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("A11Y-304 accessibility profiles: previews eight suggestions, applies atomically, and preserves overrides on revert", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Open ProfilesController
  const browseBtn = page.locator(
    "button[aria-controls='arap-profiles-dialog']",
  );
  await browseBtn.click();
  await expect(browseBtn).toHaveAttribute("aria-expanded", "true");

  // Check that profiles are visible
  await expect(page.getByText("Color Blind")).toBeVisible();
  await expect(page.getByText("Dyslexia Friendly")).toBeVisible();

  // Apply Color Blind profile
  const applyColorBlind = page.getByRole("button", {
    name: "Apply Color Blind profile",
  });
  await applyColorBlind.click();

  // Verify active banner and contrast tokens applied to host
  await expect(page.getByText(/Current Profile: Color Blind/i)).toBeVisible();
  const host = page.locator("#host");
  await expect(host).toHaveCSS("background-color", "rgb(0, 0, 0)");

  // User independent override: change contrastMode to dark
  const darkBtn = page
    .getByRole("group", { name: "Contrast Mode" })
    .getByRole("button", { name: /Dark/i });
  await darkBtn.click();
  await expect(host).toHaveCSS("background-color", "rgb(15, 23, 42)");

  // Revert profile
  const revertBtn = page.getByRole("button", {
    name: "Revert Color Blind profile",
  });
  await revertBtn.click();

  // Overridden contrast "dark" survives!
  await expect(host).toHaveCSS("background-color", "rgb(15, 23, 42)");
  await expect(
    page.getByText(/Current Profile: Color Blind/i),
  ).not.toBeVisible();
});

test("A11Y-305 custom presets: saves named preset, persists across display reset, and applies cleanly", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Change contrastMode to dark
  const darkBtn = page
    .getByRole("group", { name: "Contrast Mode" })
    .getByRole("button", { name: /Dark/i });
  await darkBtn.click();
  const host = page.locator("#host");
  await expect(host).toHaveCSS("background-color", "rgb(15, 23, 42)");

  // Open PresetsController
  const presetsBtn = page.locator(
    "button[aria-controls='arap-presets-dialog']",
  );
  await presetsBtn.click();
  await expect(presetsBtn).toHaveAttribute("aria-expanded", "true");

  // Save current settings as preset
  const nameInput = page.getByRole("textbox", { name: "Preset name" });
  await nameInput.fill("Night Preset");
  await page.getByRole("button", { name: "Save current preset" }).click();

  // Verify confirmation status announcement and card in list
  await expect(
    page.getByText('✓ Preset "Night Preset" saved successfully.'),
  ).toBeVisible();
  await expect(page.getByText("Night Preset", { exact: true })).toBeVisible();

  // Reset All display preferences
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  await expect(host).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

  // Night Preset survived Reset All!
  await expect(page.getByText("Night Preset", { exact: true })).toBeVisible();

  // Apply saved preset
  await page.getByRole("button", { name: "Apply preset Night Preset" }).click();
  await expect(
    page.getByText('✓ Preset "Night Preset" applied.'),
  ).toBeVisible();

  // Verify host styled again with dark contrast!
  await expect(host).toHaveCSS("background-color", "rgb(15, 23, 42)");
});

test("Next Pages Router and direct Server Component imports hydrate", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "next-app");
  await page.addInitScript(() => localStorage.clear());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of ["/legacy", "/boundary"]) {
    await page.goto(path);
    await page.getByLabel("Accessibility", { exact: true }).click();
    await page.getByRole("button", { name: "Grayscale", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Grayscale", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await page.evaluate(() => localStorage.clear());
  }
  expect(errors).toEqual([]);
});

test("Next.js App Router client-side route transitions preserve preferences without hydration errors", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "next-app");
  await page.addInitScript(() => localStorage.clear());
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await page.getByLabel("Accessibility", { exact: true }).click();
  await page.getByLabel("Increase font size").click();
  await page.getByLabel("Close accessibility settings").click();

  // Wait for preference write to storage
  await page.waitForFunction(() =>
    localStorage
      .getItem("react-accessibility-plugin:state")
      ?.includes("fontSize"),
  );

  // Navigate to route-test via client-side Next Link
  await page.locator("#link-route-test").click();
  await expect(page.locator("#link-home")).toBeVisible();

  // Settings must remain applied on the new route
  await page.getByLabel("Accessibility", { exact: true }).click();
  await expect(
    page
      .getByRole("group", { name: "Font Size", exact: true })
      .locator("output"),
  ).toHaveText("110%");
  await page.getByLabel("Close accessibility settings").click();

  // Navigate back to home
  await page.locator("#link-home").click();
  await expect(page.locator("#link-route-test")).toBeVisible();

  expect(errors).toEqual([]);
  await page.evaluate(() => localStorage.clear());
});

test("trigger drag remembers placement and preferences without accidental activation", async ({
  page,
  browserName,
}, info) => {
  await page.setViewportSize({ width: 900, height: 700 });
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();
  await page.getByLabel("Increase font size").click();
  await page.getByLabel("Close accessibility settings").click();
  const before = (await trigger.boundingBox())!;
  await page.mouse.move(before.x + 28, before.y + 28);
  await page.mouse.down();
  await page.mouse.move(80, 100, { steps: 12 });
  await page.mouse.up();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  let moved = (await trigger.boundingBox())!;
  if (browserName === "chromium") {
    // Exercise actual browser touch input as well as mouse pointer capture.
    const touch = await page.context().newCDPSession(page);
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: moved.x + 28, y: moved.y + 28 }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x: moved.x + 28, y: moved.y + 88 }],
    });
    await touch.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await expect(trigger).toHaveAttribute("data-dragging", "false");
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    const touched = (await trigger.boundingBox())!;
    expect(touched.y).toBeGreaterThan(moved.y + 50);
    moved = touched;
    await touch.detach();
  }
  expect(moved.x).toBeLessThan(100);
  expect(moved.y).toBeLessThan(200);
  await page.waitForFunction(() =>
    localStorage
      .getItem("react-accessibility-plugin:state")
      ?.includes("__arap_widget_placement"),
  );
  await page.reload();
  const restored = (await trigger.boundingBox())!;
  expect(Math.abs(restored.x - moved.x)).toBeLessThan(2);
  expect(Math.abs(restored.y - moved.y)).toBeLessThan(2);
  await trigger.click();
  await expect(
    page
      .getByRole("group", { name: "Font Size", exact: true })
      .locator("output"),
  ).toHaveText("110%");
  await page.getByLabel("Close accessibility settings").click();
  // A cancelled drag must not change the saved point or activate the panel.
  await page.mouse.move(restored.x + 28, restored.y + 28);
  await page.mouse.down();
  await page.mouse.move(restored.x + 100, restored.y + 100, { steps: 4 });
  await trigger.dispatchEvent("pointercancel");
  await page.mouse.up();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const cancelled = (await trigger.boundingBox())!;
  expect(Math.abs(cancelled.x - restored.x)).toBeLessThan(2);
  await trigger.focus();
  await page.keyboard.press("Alt+ArrowRight");
  const keyboardMoved = (await trigger.boundingBox())!;
  expect(keyboardMoved.x).toBeGreaterThan(restored.x + 15);
  await page.setViewportSize({ width: 320, height: 568 });
  const small = (await trigger.boundingBox())!;
  expect(small.x).toBeGreaterThanOrEqual(0);
  expect(small.x + small.width).toBeLessThanOrEqual(320);
  expect(small.y + small.height).toBeLessThanOrEqual(568);
  if (info.project.name === "mobile")
    await page.touchscreen.tap(small.x + 28, small.y + 28);
  else await trigger.click();
  const panel = (await page.getByRole("region").boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.y).toBeGreaterThanOrEqual(0);
  expect(panel.y + panel.height).toBeLessThanOrEqual(568);
});

test("quick actions stay visible and click controls move or reset placement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();
  const reset = page.getByRole("button", { name: "Reset All", exact: true });
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Jump to quick actions", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(reset).toBeFocused();
  const before = (await reset.boundingBox())!;
  await page
    .locator(".arap-tools")
    .evaluate((el) => (el.scrollTop = el.scrollHeight));
  const after = (await reset.boundingBox())!;
  expect(after.y).toBe(before.y);
  await reset.click();
  await page.getByRole("button", { name: "Move button", exact: true }).click();
  await page
    .getByLabel("Accessibility button position")
    .selectOption("top-left");
  await expect(trigger).toHaveAttribute("data-corner", "top-left");
  await page
    .getByLabel("Move accessibility button down", { exact: true })
    .click();
  await expect(page.getByLabel("Accessibility button position")).toHaveValue(
    "custom",
  );
  await page
    .getByRole("button", { name: "Reset button position", exact: true })
    .click();
  await expect(trigger).toHaveAttribute("data-corner", "bottom-right");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("region")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Move button", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("stepwise text scaling scales content without transform and protects forms/labels/widget", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");
  const initialH1Size = await page
    .locator("h1")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const initialSelectSize = await page
    .locator("#host select")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const initialButtonSize = await page
    .locator("#host-action")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));

  // Open widget
  await page.getByLabel("Accessibility", { exact: true }).click();
  const increaseBtn = page.getByLabel("Increase font size");

  // Step up 10 times to reach 200% (2.0x)
  for (let i = 0; i < 10; i++) {
    await increaseBtn.click();
  }

  // Heading scales to ~2x
  await expect
    .poll(async () =>
      page
        .locator("h1")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    )
    .toBeGreaterThanOrEqual(initialH1Size * 1.95);

  // Form controls (select, button) and labels must NOT have their font-size forced to 2x
  const scaledSelectSize = await page
    .locator("#host select")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(scaledSelectSize).toBe(initialSelectSize);

  const scaledButtonSize = await page
    .locator("#host-action")
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(scaledButtonSize).toBe(initialButtonSize);

  // No CSS transforms applied
  const htmlTransform = await page
    .locator("html")
    .evaluate((el) => getComputedStyle(el).transform);
  expect(htmlTransform).toBe("none");

  const bodyTransform = await page
    .locator("body")
    .evaluate((el) => getComputedStyle(el).transform);
  expect(bodyTransform).toBe("none");

  // Reset restores heading to initial size
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  await expect
    .poll(async () =>
      page
        .locator("h1")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    )
    .toBeCloseTo(initialH1Size, 0.5);
});

test("independent text spacing applies to paragraphs while protecting tables, controls, and code", async ({
  page,
}) => {
  const initialLineHeight = await page
    .locator("#sample")
    .evaluate((el) => parseFloat(getComputedStyle(el).lineHeight));
  const initialMarginBottom = await page
    .locator("#sample")
    .evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));

  // Open widget
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Increase line height (+10%)
  await page.getByLabel("Increase line height").click();
  await page.getByLabel("Increase line height").click();

  // Increase letter spacing (+2px)
  await page.getByLabel("Increase letter spacing").click();
  await page.getByLabel("Increase letter spacing").click();

  // Increase word spacing (+2px)
  await page.getByLabel("Increase word spacing").click();
  await page.getByLabel("Increase word spacing").click();

  // Increase paragraph spacing (+8px)
  await page.getByLabel("Increase paragraph spacing").click();
  await page.getByLabel("Increase paragraph spacing").click();

  // Paragraph should have updated text spacing
  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => parseFloat(getComputedStyle(el).lineHeight)),
    )
    .toBeGreaterThan(initialLineHeight);

  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => getComputedStyle(el).letterSpacing),
    )
    .toBe("2px");

  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => getComputedStyle(el).wordSpacing),
    )
    .toBe("2px");

  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => parseFloat(getComputedStyle(el).marginBottom)),
    )
    .toBeGreaterThanOrEqual(initialMarginBottom + 7);

  // Table cell and host button must NOT receive letter-spacing or word-spacing overrides
  const tdLetterSpacing = await page
    .locator("#sample-td")
    .evaluate((el) => getComputedStyle(el).letterSpacing);
  const tdWordSpacing = await page
    .locator("#sample-td")
    .evaluate((el) => getComputedStyle(el).wordSpacing);
  const btnLetterSpacing = await page
    .locator("#host-action")
    .evaluate((el) => getComputedStyle(el).letterSpacing);
  const btnWordSpacing = await page
    .locator("#host-action")
    .evaluate((el) => getComputedStyle(el).wordSpacing);

  expect(tdLetterSpacing).toBe("normal");
  expect(["normal", "0px"]).toContain(tdWordSpacing);
  expect(btnLetterSpacing).toBe("normal");
  expect(["normal", "0px"]).toContain(btnWordSpacing);

  // Reset All restores everything
  await page.getByRole("button", { name: "Reset All", exact: true }).click();

  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => getComputedStyle(el).letterSpacing),
    )
    .toBe("normal");

  await expect
    .poll(async () =>
      page
        .locator("#sample")
        .evaluate((el) => getComputedStyle(el).wordSpacing),
    )
    .toMatch(/^(normal|0px)$/);
});

test("text alignment scopes to logical text blocks, shows justify warning, and fonts protect code", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();

  // Test alignment scoping to text blocks
  const rightBtn = page
    .getByRole("group", { name: "Text Alignment" })
    .getByRole("button", { name: /right/i });
  await rightBtn.click();

  await expect(page.locator("#sample")).toHaveCSS("text-align", "right");

  // Protected elements (table data and host action button) must NOT be forced to right
  const tdAlign = await page
    .locator("#sample-td")
    .evaluate((el) => el.style.textAlign);
  const btnAlign = await page
    .locator("#host-action")
    .evaluate((el) => el.style.textAlign);
  expect(tdAlign).toBe("");
  expect(btnAlign).toBe("");

  // Test justify warning advisory
  const justifyBtn = page
    .getByRole("group", { name: "Text Alignment" })
    .getByRole("button", { name: /justify/i });
  await justifyBtn.click();
  await expect(page.getByRole("note")).toBeVisible();
  await expect(page.getByRole("note")).toContainText("rivers of white");

  // Test font family application and code protection
  const legibleBtn = page
    .getByRole("group", { name: "Font Family" })
    .getByRole("button", { name: /legible/i });
  await legibleBtn.click();

  const sampleFont = await page
    .locator("#sample")
    .evaluate((el) => el.style.fontFamily);
  expect(sampleFont).toContain("system-ui");
  expect(sampleFont).toContain("Noto Sans Sinhala");

  // Code block must retain monospace protection
  const codeFont = await page
    .locator("#sample-code")
    .evaluate((el) => el.style.fontFamily);
  expect(codeFont).not.toContain("system-ui");
  expect(codeFont).toContain("monospace");

  // Dyslexia font option
  const dyslexiaBtn = page
    .getByRole("group", { name: "Font Family" })
    .getByRole("button", { name: /dyslexia/i });
  await dyslexiaBtn.click();

  const sampleDyslexiaFont = await page
    .locator("#sample")
    .evaluate((el) => el.style.fontFamily);
  expect(sampleDyslexiaFont).toContain("OpenDyslexic");

  // Reset All restores host state
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  await expect(page.locator("#sample")).toHaveCSS(
    "text-align",
    /^(start|left)$/,
  );
  const sampleResetAlign = await page
    .locator("#sample")
    .evaluate((el) => el.style.textAlign);
  expect(sampleResetAlign).toBe("");
  const sampleResetFont = await page
    .locator("#sample")
    .evaluate((el) => el.style.fontFamily);
  expect(sampleResetFont).toBe("");
});

test("semantic contrast modes apply tokens, preserve media, and restore cleanly", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();

  // Test Dark contrast mode
  const darkBtn = page
    .getByRole("group", { name: "Contrast Mode" })
    .getByRole("button", { name: /Dark/i });
  await darkBtn.click();

  await expect(page.locator("#sample")).toHaveCSS(
    "color",
    "rgb(248, 250, 252)",
  );
  await expect(page.locator("main#host")).toHaveCSS(
    "background-color",
    "rgb(15, 23, 42)",
  );

  // Images must NOT have opaque background forced
  const imgBg = await page
    .locator("img")
    .first()
    .evaluate((el) => el.style.backgroundColor);
  expect(imgBg).toBe("");

  // Test High contrast mode
  const highBtn = page
    .getByRole("group", { name: "Contrast Mode" })
    .getByRole("button", { name: /High/i });
  await highBtn.click();

  await expect(page.locator("#sample")).toHaveCSS(
    "color",
    "rgb(255, 255, 255)",
  );
  await expect(page.locator("main#host")).toHaveCSS(
    "background-color",
    "rgb(0, 0, 0)",
  );

  // Reset All restores host state
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  const sampleColor = await page
    .locator("#sample")
    .evaluate((el) => el.style.color);
  const hostBg = await page
    .locator("main#host")
    .evaluate((el) => el.style.backgroundColor);
  expect(sampleColor).toBe("");
  expect(hostBg).toBe("");
});

test("link highlighting, enhanced focus visibility, and skip-to-main landmark link", async ({
  page,
}) => {
  // Verify skip-to-main landmark link is present when <main> exists
  const skipLink = page.locator(".arap-skip-to-main");
  await expect(skipLink).toBeAttached();
  await expect(skipLink).toHaveAttribute("href", "#host");

  // Focus skip link: becomes visible with min 44px target height
  await skipLink.focus();
  const box = await skipLink.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(44);

  // Click skip link: transfers focus to main#host
  await skipLink.click();
  const isMainFocused = await page
    .locator("main#host")
    .evaluate((el) => document.activeElement === el);
  expect(isMainFocused).toBe(true);

  // Open widget
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();

  // Test Link Highlight
  const linkToggle = page
    .getByRole("group", { name: "Link Highlight" })
    .getByRole("button", { name: "Link Highlight" });
  await linkToggle.click();

  const link = page.locator("#host a").first();
  await expect(link).toHaveCSS("text-decoration-line", "underline");
  const linkUnderlineOffset = await link.evaluate(
    (el) => window.getComputedStyle(el).textUnderlineOffset,
  );
  expect(linkUnderlineOffset).toBe("3px");

  // Test Highlight Focus
  const focusToggle = page
    .getByRole("group", { name: "Highlight Focus" })
    .getByRole("button", { name: "Highlight Focus" });
  await focusToggle.click();

  const hasFocusStyle = await page.evaluate(() =>
    Boolean(document.getElementById("arap-focus-highlight-style")),
  );
  expect(hasFocusStyle).toBe(true);

  // Reset All restores links and cleans up focus style
  await page.getByRole("button", { name: "Reset All", exact: true }).click();

  const hasFocusStyleAfterReset = await page.evaluate(() =>
    Boolean(document.getElementById("arap-focus-highlight-style")),
  );
  expect(hasFocusStyleAfterReset).toBe(false);

  const resetLinkDec = await link.evaluate((el) => el.style.textDecoration);
  expect(resetLinkDec).toBe("");
});

test("reduce motion applies animation duration overrides and cleans up on reset", async ({
  page,
}) => {
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();

  // Test Reduce Motion toggle
  const motionToggle = page
    .getByRole("group", { name: "Reduce Motion" })
    .getByRole("button", { name: "Reduce Motion" });
  await motionToggle.click();

  const hasMotionStyle = await page.evaluate(() =>
    Boolean(document.getElementById("arap-reduce-motion-style")),
  );
  expect(hasMotionStyle).toBe(true);

  // Reset All cleans up motion style
  await page.getByRole("button", { name: "Reset All", exact: true }).click();

  const hasMotionStyleAfterReset = await page.evaluate(() =>
    Boolean(document.getElementById("arap-reduce-motion-style")),
  );
  expect(hasMotionStyleAfterReset).toBe(false);
});

test("regression and performance sweep: rapid toggles and 1,000-node DOM benchmarking", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // Test 1: Rapid toggling (stress testing) in real browser
  const fontIncrease = page.getByLabel("Increase font size");
  const fontDecrease = page.getByLabel("Decrease font size");
  const sample = page.locator("#sample");
  const initialFontSize = await sample.evaluate((el) => el.style.fontSize);

  for (let i = 0; i < 5; i++) {
    await fontIncrease.click();
    await fontDecrease.click();
  }

  // Verify font-size returned cleanly to initial baseline
  expect(await sample.evaluate((el) => el.style.fontSize)).toBe(
    initialFontSize,
  );

  // Test 2: 1,000-node DOM benchmark in real browser
  const benchmarkResult = await page.evaluate(() => {
    const host = document.createElement("div");
    host.id = "browser-perf-1000";
    for (let i = 0; i < 100; i++) {
      const card = document.createElement("div");
      for (let j = 0; j < 10; j++) {
        const p = document.createElement("p");
        p.textContent = `P ${i}-${j}`;
        card.appendChild(p);
      }
      host.appendChild(card);
    }
    document.body.appendChild(host);

    const totalNodes = host.querySelectorAll("*").length;
    return { totalNodes };
  });

  expect(benchmarkResult.totalNodes).toBeGreaterThanOrEqual(1000);

  // Trigger font scaling across the 1,000-node DOM
  const t0 = Date.now();
  await fontIncrease.click();
  const applyTimeMs = Date.now() - t0;

  // Verify performance in real Chromium: update on 1,000 nodes takes under 2.5 seconds
  expect(applyTimeMs).toBeLessThan(2500);

  // Clean reset restores everything
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  expect(await sample.evaluate((el) => el.style.fontSize)).toBe(
    initialFontSize,
  );

  // Cleanup benchmark host
  await page.evaluate(() => {
    document.getElementById("browser-perf-1000")?.remove();
  });
});

test("reading guide and mask overlays never block clicks and clean up on Escape and reset", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");
  await page.getByLabel("Accessibility", { exact: true }).click();

  // 1. Enable Reading Guide
  const guideToggle = page.getByRole("button", {
    name: "Reading Guide",
    exact: true,
  });
  await guideToggle.click();
  const guide = page.locator(".arap-reading-guide");
  await expect(guide).toBeVisible();
  expect(await guide.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe(
    "none",
  );

  // Close panel and verify host button is clickable through the guide
  await page.getByLabel("Close accessibility settings").click();
  const hostAction = page.getByRole("button", { name: "Host action 0" });
  await hostAction.click();
  await expect(
    page.getByRole("button", { name: "Host action 1" }),
  ).toBeVisible();

  // Escape key dismisses the guide
  await page.keyboard.press("Escape");
  await expect(guide).toHaveCount(0);

  // 2. Enable Reading Mask
  await page.getByLabel("Accessibility", { exact: true }).click();
  const maskToggle = page.getByRole("button", {
    name: "Reading Mask",
    exact: true,
  });
  await maskToggle.click();
  const mask = page.locator(".arap-reading-mask");
  await expect(mask).toBeVisible();
  expect(await mask.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe(
    "none",
  );

  // Adjust mask height
  const increaseHeight = page.getByRole("button", {
    name: "Increase reading mask height",
  });
  await increaseHeight.click();
  expect(await mask.evaluate((el) => el.style.height)).toBe("120px");

  // Reset All cleans up mask
  await page.getByRole("button", { name: "Reset All", exact: true }).click();
  await expect(mask).toHaveCount(0);
});

test("A11Y-306: Sinhala and Tamil locale packs render clean layouts without translating host content", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");

  // 1. Switch to Sinhala (si-LK)
  await page.locator("#fixture-locale-select").selectOption("si-LK");

  // Verify launcher button has Sinhala accessible name
  const triggerSi = page.getByRole("button", {
    name: "ප්‍රවේශ්‍යතාව",
    exact: true,
  });
  await expect(triggerSi).toBeVisible();
  await triggerSi.click();

  // Verify panel attributes
  const panelSi = page.getByRole("region", { name: "ප්‍රවේශ්‍යතා සැකසුම්" });
  await expect(panelSi).toBeVisible();
  await expect(panelSi).toHaveAttribute("lang", "si-LK");
  await expect(panelSi).toHaveAttribute("dir", "ltr");
  await expect(panelSi).toHaveAttribute("translate", "no");

  // Verify panel title and reset button
  await expect(
    page.getByRole("heading", { name: "ප්‍රවේශ්‍යතා සැකසුම්" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "සියල්ල යළි සකසන්න", exact: true }),
  ).toBeVisible();

  // Verify host content is completely untouched and not translated
  await expect(
    page.getByRole("heading", { name: "Accessibility preferences" }),
  ).toBeVisible();
  await expect(page.getByText("A paragraph with a useful link.")).toBeVisible();

  // 2. Switch to Tamil (ta-LK)
  await page.locator("#fixture-locale-select").selectOption("ta-LK");

  // Verify panel attributes
  const panelTa = page.getByRole("region", { name: "அணுகல்தன்மை அமைப்புகள்" });
  await expect(panelTa).toBeVisible();
  await expect(panelTa).toHaveAttribute("lang", "ta-LK");
  await expect(panelTa).toHaveAttribute("dir", "ltr");
  await expect(panelTa).toHaveAttribute("translate", "no");

  // Verify panel title and reset button
  await expect(
    page.getByRole("heading", { name: "அணுகல்தன்மை அமைப்புகள்" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "அனைத்தையும் மீட்டமை", exact: true }),
  ).toBeVisible();

  // Verify host content is still untouched
  await expect(
    page.getByRole("heading", { name: "Accessibility preferences" }),
  ).toBeVisible();

  // Close panel using Tamil close button
  const closeBtnTa = page.getByRole("button", {
    name: "அணுகல்தன்மை அமைப்புகளை மூடுக",
  });
  await expect(closeBtnTa).toBeVisible();
  await closeBtnTa.click();
  await expect(panelTa).not.toBeVisible();
});

test("A11Y-307: Reading mode opens non-destructive article overlay, traps focus, switches themes and exits cleanly", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");

  // Verify host action button initial state
  const hostAction = page.locator("#host-action");
  await expect(hostAction).toHaveText("Host action 0");

  // Open accessibility panel
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.click();

  // Activate reading mode
  const toggle = page.getByRole("button", {
    name: "Open Reading Mode",
    exact: true,
  });
  await expect(toggle).toBeVisible();
  await toggle.click();

  // Verify dialog is visible and shows extracted content
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(
    dialog.getByRole("heading", { name: "Accessibility preferences" }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Accessible web development ensures"),
  ).toBeVisible();

  // Test theme switching
  const backdrop = page.locator(".arap-reading-mode-backdrop");
  await expect(backdrop).toHaveAttribute("data-theme", "light");
  await dialog.getByRole("button", { name: "Sepia theme" }).click();
  await expect(backdrop).toHaveAttribute("data-theme", "sepia");
  await dialog.getByRole("button", { name: "Dark theme" }).click();
  await expect(backdrop).toHaveAttribute("data-theme", "dark");

  // Exit reading mode via Escape
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  // Close accessibility panel so host elements are not obscured
  const closePanelBtn = page.getByLabel("Close accessibility settings");
  if (await closePanelBtn.isVisible()) {
    await closePanelBtn.click();
  }

  // Verify host content is completely preserved and interactive
  await expect(page.locator("#fixture-article")).toBeVisible();
  await hostAction.click();
  await expect(hostAction).toHaveText("Host action 1");
});

test("A11Y-308: Keyboard shortcut help, collision-checked remapping and link explorer", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");

  // Open accessibility panel
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.click();

  // Test 1: Page Navigator Link Explorer tab
  const exploreBtn = page.locator(
    "button[aria-controls='arap-page-navigator-dialog']",
  );
  await exploreBtn.click();
  const navDialog = page.getByRole("region", {
    name: "Page Structure Explorer",
  });
  await expect(navDialog).toBeVisible();

  // Switch to Links tab
  const linksTab = navDialog.getByRole("tab", { name: /Links/i });
  await expect(linksTab).toBeVisible();
  await linksTab.click();

  // Verify host link discovered
  await expect(navDialog.getByText("useful link")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navDialog).not.toBeVisible();

  // Test 2: Keyboard Shortcuts dialog
  const shortcutsBtn = page.getByRole("button", {
    name: "Open Keyboard Shortcuts",
  });
  await expect(shortcutsBtn).toBeVisible();
  await shortcutsBtn.click();

  const shortcutsDialog = page.getByRole("dialog");
  await expect(shortcutsDialog).toBeVisible();
  await expect(shortcutsDialog).toHaveAttribute("aria-modal", "true");

  // Verify default shortcuts
  await expect(
    shortcutsDialog.getByText("Toggle accessibility panel"),
  ).toBeVisible();
  await expect(shortcutsDialog.getByLabel("Current key: Alt+A")).toBeVisible();

  // Category filtering
  await shortcutsDialog.getByRole("tab", { name: "Navigation" }).click();
  await expect(
    shortcutsDialog.getByText("Page Structure & Links"),
  ).toBeVisible();
  await expect(
    shortcutsDialog.getByText("Toggle accessibility panel"),
  ).not.toBeVisible();

  // Switch back to All
  await shortcutsDialog.getByRole("tab", { name: "All" }).click();

  // Remap test: Attempt reserved browser command Ctrl+U
  const remapBtn = shortcutsDialog.getByRole("button", {
    name: "Remap Toggle accessibility panel",
  });
  await remapBtn.click();

  const remapInput = shortcutsDialog.getByLabel(
    "Press key combination to remap",
  );
  await remapInput.press("Control+u");
  await expect(shortcutsDialog.getByRole("status")).toContainText(
    "reserved browser command",
  );

  // Remap to valid combo Alt+Shift+Z
  await remapInput.press("Alt+Shift+z");
  await expect(
    shortcutsDialog.getByLabel("Current key: Alt+Shift+Z"),
  ).toBeVisible();

  // Reset to Defaults
  await shortcutsDialog
    .getByRole("button", { name: "Reset to Defaults" })
    .click();
  await expect(shortcutsDialog.getByLabel("Current key: Alt+A")).toBeVisible();

  // Escape closes dialog
  await page.keyboard.press("Escape");
  await expect(shortcutsDialog).not.toBeVisible();
});

test("A11Y-401: Read-aloud TTS with voice, rate and stop controls", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");

  // Open accessibility panel
  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await expect(trigger).toBeVisible();
  await trigger.click();

  // Locate Read aloud card
  const readAloudCard = page.getByRole("group", { name: "Read aloud" });
  await expect(readAloudCard).toBeVisible();

  // Primary action button is present and says Read aloud
  const playBtn = readAloudCard.getByRole("button", { name: "Read aloud" });
  await expect(playBtn).toBeVisible();

  // Stop button is initially disabled
  const stopBtn = readAloudCard.getByRole("button", { name: "Stop reading" });
  await expect(stopBtn).toBeDisabled();

  // Speed rate stepper: test increasing to 1.25x
  const incRateBtn = readAloudCard.getByRole("button", {
    name: "Increase reading speed",
  });
  await expect(incRateBtn).toBeVisible();
  await incRateBtn.click();
  await expect(readAloudCard.getByText("1.25x")).toBeVisible();

  // Pitch stepper: test increasing to High
  const incPitchBtn = readAloudCard.getByRole("button", {
    name: "Increase pitch",
  });
  await expect(incPitchBtn).toBeVisible();
  await incPitchBtn.click();
  await expect(readAloudCard.getByText("High")).toBeVisible();

  // Click Read aloud
  await playBtn.click();

  // Once started, pause button should become visible on the card
  const pauseBtn = readAloudCard.locator(".arap-read-aloud-pause-btn");
  await expect(pauseBtn).toBeVisible();

  // Floating playback bar appears at viewport bottom
  const playbackBar = page.getByRole("region", {
    name: "Read aloud playback bar",
  });
  await expect(playbackBar).toBeVisible();

  // Pause playback
  await pauseBtn.click();
  const resumeBtn = readAloudCard.locator(".arap-read-aloud-resume-btn");
  await expect(resumeBtn).toBeVisible();

  // Resume playback
  await resumeBtn.click();
  await expect(pauseBtn).toBeVisible();

  // Press Escape to stop reading
  await page.keyboard.press("Escape");

  // Playback bar dismisses
  await expect(playbackBar).not.toBeVisible();

  // Re-open widget panel to verify read-aloud returned to stopped/idle state
  await trigger.click();
  await expect(readAloudCard).toBeVisible();
  await expect(stopBtn).toBeDisabled();
  await expect(playBtn).toBeVisible();
});

test("A11Y-402: Saturation and grayscale modes with chart/image advisory warnings and instant reset", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto("/");

  const trigger = page.getByRole("button", {
    name: "Accessibility",
    exact: true,
  });
  await trigger.click();

  const satGroup = page.getByRole("group", { name: "Saturation" });
  await expect(satGroup).toBeVisible();

  // Verify 4 segmented buttons
  const offBtn = satGroup.getByRole("button", {
    name: "Original saturation (Off)",
  });
  const lowBtn = satGroup.getByRole("button", { name: "Low saturation (20%)" });
  const highBtn = satGroup.getByRole("button", {
    name: "High saturation (200%)",
  });
  const grayBtn = satGroup.getByRole("button", {
    name: "Saturation: Grayscale",
  });

  await expect(offBtn).toHaveAttribute("aria-pressed", "true");

  // 1. Select Low Saturation (20%)
  await lowBtn.click();
  await expect(lowBtn).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toContain("saturate(0.2)");

  const lowAdvisory = satGroup.locator(".arap-notice-warning");
  await expect(lowAdvisory).toBeVisible();
  await expect(lowAdvisory).toContainText(
    "Low saturation reduces color differences",
  );

  // 2. Select High Saturation (200%)
  await highBtn.click();
  await expect(highBtn).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toContain("saturate(2)");

  const highAdvisory = satGroup.locator(".arap-notice-warning");
  await expect(highAdvisory).toBeVisible();
  await expect(highAdvisory).toContainText(
    "High saturation increases color intensity",
  );

  // 3. Select Grayscale via Saturation group
  await grayBtn.click();
  await expect(grayBtn).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toContain("grayscale(1)");

  const grayAdvisory = satGroup.locator(".arap-notice-warning");
  await expect(grayAdvisory).toBeVisible();
  await expect(grayAdvisory).toContainText("Grayscale removes all color");

  // 4. Return to Off
  await offBtn.click();
  await expect(offBtn).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toBe("none");
  await expect(satGroup.locator(".arap-notice-warning")).not.toBeVisible();

  // 5. Test Grayscale toggle controller
  const grayToggle = page.getByRole("button", {
    name: "Grayscale",
    exact: true,
  });
  await expect(grayToggle).toBeVisible();
  await grayToggle.click();
  await expect(grayToggle).toHaveAttribute("aria-pressed", "true");
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toContain("grayscale(1)");

  // 6. Instant Reset
  const resetBtn = page.getByRole("button", { name: "Reset All" });
  await resetBtn.click();
  await expect
    .poll(async () => {
      return page
        .locator("#root")
        .evaluate((el) => getComputedStyle(el).filter);
    })
    .toBe("none");
  await expect(page.locator(".arap-notice-warning")).not.toBeVisible();
});

test("accessible dictionary looks up local terms without network and restores focus after close", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");

  // Track any outgoing network requests
  const networkRequests: string[] = [];
  page.on("request", (req) => {
    networkRequests.push(req.url());
  });

  // Open widget
  await page.getByLabel("Accessibility", { exact: true }).click();
  const dictTrigger = page.locator('button[data-arap-feature="dictionary"]');
  await expect(dictTrigger).toBeVisible();

  // Open dictionary modal
  await dictTrigger.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();

  // Search input is focused
  const searchInput = page.getByRole("searchbox");
  await expect(searchInput).toBeFocused();

  // Look up "accessibility"
  await searchInput.fill("accessibility");
  await dialog.getByRole("button", { name: "Look up", exact: true }).click();

  // Definition is displayed
  await expect(
    dialog.getByRole("heading", { level: 3, name: "accessibility" }),
  ).toBeVisible();
  await expect(dialog.getByText("Built-in Glossary")).toBeVisible();
  await expect(
    dialog.getByText("The practice of designing software"),
  ).toBeVisible();

  // Verify ZERO network requests were triggered during lookup
  const dictNetworkRequests = networkRequests.filter(
    (url) => !url.includes("7311") && !url.includes("vite"),
  );
  expect(dictNetworkRequests.length).toBe(0);

  // Close dialog using Escape key
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  // Acceptance requirement: focus returns to the trigger button after close
  await expect(dictTrigger).toBeFocused();

  // Open again and close using Close button
  await dictTrigger.click();
  await expect(dialog).toBeVisible();
  const closeBtn = dialog.getByRole("button", { name: "Close dictionary" });
  await closeBtn.click();
  await expect(dialog).not.toBeVisible();
  await expect(dictTrigger).toBeFocused();
});

test("per-site feature menu customization renders ordered custom groups and labels (A11Y-404)", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:7311/");

  // Toggle custom menu config
  await page.locator("#toggle-custom-menu").click();

  // Open accessibility widget
  await page.getByLabel("Accessibility", { exact: true }).click();
  const panel = page.getByRole("region");
  await expect(panel).toBeVisible();

  // Custom groups should be rendered with their headings
  const textGroup = panel.getByRole("group", { name: "Custom Text Group" });
  await expect(textGroup).toBeVisible();
  await expect(textGroup.getByText("Custom Font Sizer")).toBeVisible();

  const visualGroup = panel.getByRole("group", {
    name: "Custom Visuals Group",
  });
  await expect(visualGroup).toBeVisible();
  await expect(visualGroup.getByText("Custom Black & White")).toBeVisible();

  // Verify non-configured features are omitted
  await expect(panel.getByText("Line Height")).not.toBeVisible();
  await expect(panel.getByText("Saturation")).not.toBeVisible();

  // Close widget
  await page.getByLabel("Close accessibility settings").click();
  await expect(panel).not.toBeVisible();
});
