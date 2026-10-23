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
  await expect(page.getByAltText("Example landscape")).toHaveCSS(
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
