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
  await page.getByLabel("Accessibility", { exact: true }).click();
  await page.getByLabel("Increase font size").click();
  await page
    .getByRole("group", { name: "Contrast", exact: true })
    .getByRole("button", { name: "High", exact: true })
    .click();
  await page.getByRole("button", { name: "Grayscale", exact: true }).click();
  await page.getByLabel("Close accessibility settings").click();
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
    await page.getByLabel("Close accessibility settings").click();
  }
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
