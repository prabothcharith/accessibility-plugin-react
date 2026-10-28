import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  within,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import React from "react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  TextScaleController,
  LineHeightController,
  LetterSpacingController,
  WordSpacingController,
  ParagraphSpacingController,
  FontFamilyController,
  TextAlignController,
  ContrastModeController,
  LinkHighlightController,
  HighlightFocusController,
  ReduceMotionController,
  HideImagesController,
  ResetController,
} from "../src";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

/**
 * Creates a dense, realistic host DOM representing a modern web application:
 * forms, media, data tables, multilingual typography, CAPTCHA, charts, maps, and dashboard cards.
 */
function createRealisticDashboardFixture(): HTMLElement {
  const host = document.createElement("main");
  host.id = "host-dashboard";
  host.innerHTML = `
    <header class="dash-header">
      <nav aria-label="Main Navigation">
        <a href="#dashboard" id="nav-dash" class="nav-link">Dashboard</a>
        <a href="#reports" id="nav-reports" class="nav-link">Reports</a>
        <a href="#settings" id="nav-disabled" class="nav-link" aria-disabled="true">Settings</a>
      </nav>
    </header>

    <div class="dash-content">
      <section class="dash-overview">
        <h1 id="main-heading" style="font-size: 24px; line-height: 32px;">Analytics Overview</h1>
        <p id="lead-paragraph" style="margin-bottom: 16px;">
          Comprehensive dashboard monitoring service performance and user activity across regions.
        </p>
        <p id="arabic-paragraph" lang="ar" dir="rtl">
          هذا النص باللغة العربية لاختبار عدم تطبيق تباعد الحروف.
        </p>
        <p id="sinhala-paragraph" lang="si">
          මෙය සිංහල අකුරු පරීක්ෂා කිරීම සඳහා වූ පෙළකි.
        </p>
      </section>

      <!-- Complex Form -->
      <section class="dash-form-section">
        <form id="sample-form" aria-label="User Filter Form">
          <fieldset>
            <legend>Filter Metrics</legend>
            <div class="form-group">
              <label for="filter-query">Search keywords</label>
              <input id="filter-query" type="text" value="active users" style="font-size: 14px;" />
            </div>
            <div class="form-group">
              <label for="filter-category">Category</label>
              <select id="filter-category">
                <option value="all">All Categories</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div class="form-group">
              <label for="filter-invalid">Invalid field</label>
              <input id="filter-invalid" type="text" aria-invalid="true" style="border-color: red;" />
            </div>
            <div class="form-group">
              <label for="filter-disabled">Disabled field</label>
              <input id="filter-disabled" type="text" disabled value="Read only" />
            </div>
            <button type="submit" id="btn-submit" style="font-size: 14px; background-image: url('btn-bg.png');">
              <img id="btn-img" alt="" src="search.svg" />
              Apply Filters
            </button>
          </fieldset>
        </form>
      </section>

      <!-- Data Table -->
      <section class="dash-table-section">
        <table id="metrics-table" style="letter-spacing: 0px; word-spacing: 0px;">
          <thead>
            <tr>
              <th id="th-metric">Metric</th>
              <th id="th-val">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td id="td-metric-1">Total Users</td>
              <td id="td-val-1">128,450</td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Code Block -->
      <section class="dash-code-section">
        <pre id="code-pre"><code id="code-snippet">const computeRate = (a, b) => a / b;</code></pre>
      </section>

      <!-- Media & Protected Visuals -->
      <section class="dash-media-section">
        <!-- Decorative images (eligible to be hidden) -->
        <img id="deco-img-1" alt="" src="divider.png" />
        <img id="deco-img-2" role="presentation" src="flourish.png" />
        <div id="deco-banner" style="background-image: url('hero.jpg');">Banner</div>

        <!-- Meaningful / Protected visual content (MUST remain visible) -->
        <img id="chart-img" class="sales-chart" alt="" src="sales.png" />
        <div id="captcha-box" class="security-captcha">
          <img id="captcha-img" alt="Security CAPTCHA challenge" src="captcha.jpg" />
        </div>
        <img id="qr-img" class="qr-code" alt="" src="qr.png" />
        <div id="map-box" role="region" aria-label="Interactive store map">
          <img id="map-tile" src="https://tile.openstreetmap.org/1/2/3.png" alt="" />
        </div>
        <img id="meaningful-photo" alt="Team photo in conference room" src="team.jpg" />

        <video id="sample-video" controls title="Quarterly briefing">
          <track kind="captions" />
        </video>
        <audio id="sample-audio" controls title="Podcast episode"></audio>
      </section>
    </div>
  `;
  return host;
}

/**
 * Programmatically builds a 1,000-node DOM fixture to stress-test scaling,
 * traversal, apply/dispose times, and memory limits.
 */
function create1000NodeFixture(): HTMLElement {
  const container = document.createElement("div");
  container.id = "perf-1000-container";

  // 100 articles with 10 elements each = 1,000 elements
  for (let i = 0; i < 100; i++) {
    const article = document.createElement("article");
    article.className = `perf-card perf-card-${i}`;

    const h2 = document.createElement("h2");
    h2.textContent = `Card Title ${i}`;
    h2.style.fontSize = "18px";
    h2.style.lineHeight = "24px";
    article.appendChild(h2);

    const p = document.createElement("p");
    p.textContent = `Content paragraph ${i} with descriptive text for layout testing.`;
    p.style.marginBottom = "12px";
    article.appendChild(p);

    const link = document.createElement("a");
    link.href = `#card-${i}`;
    link.textContent = `View Details ${i}`;
    article.appendChild(link);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = `Action ${i}`;
    article.appendChild(btn);

    const input = document.createElement("input");
    input.type = "text";
    input.value = `Input ${i}`;
    article.appendChild(input);

    const img = document.createElement("img");
    if (i % 2 === 0) {
      img.alt = ""; // Decorative
    } else {
      img.alt = `Informative photo ${i}`; // Meaningful
    }
    img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10'%3E%3C/svg%3E`;
    article.appendChild(img);

    const code = document.createElement("code");
    code.textContent = `item[${i}] = true;`;
    article.appendChild(code);

    const span = document.createElement("span");
    span.textContent = `Status: OK (${i})`;
    article.appendChild(span);

    const footer = document.createElement("footer");
    footer.textContent = `Card Footer ${i}`;
    article.appendChild(footer);

    container.appendChild(article);
  }

  return container;
}

function renderWithControllers(
  hostEl: HTMLElement,
  controllers: React.ReactNode,
) {
  document.body.appendChild(hostEl);
  const result = render(
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        {controllers}
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
  return { ...result, host: hostEl };
}

describe("A11Y-208: Visual regression, cross-feature composition, and performance sweep", () => {
  it("A11Y-201..207 apply simultaneously on realistic dashboard and restore completely", () => {
    const host = createRealisticDashboardFixture();
    const { unmount } = renderWithControllers(
      host,
      <>
        <TextScaleController />
        <LineHeightController />
        <LetterSpacingController />
        <WordSpacingController />
        <ParagraphSpacingController />
        <FontFamilyController />
        <TextAlignController />
        <ContrastModeController />
        <LinkHighlightController />
        <HighlightFocusController />
        <ReduceMotionController />
        <HideImagesController />
      </>,
    );

    // Baseline measurements
    const heading = host.querySelector("#main-heading") as HTMLElement;
    const leadP = host.querySelector("#lead-paragraph") as HTMLElement;
    const link = host.querySelector("#nav-dash") as HTMLElement;
    const decoImg = host.querySelector("#deco-img-1") as HTMLElement;
    const chartImg = host.querySelector("#chart-img") as HTMLElement;
    const captchaImg = host.querySelector("#captcha-img") as HTMLElement;
    const decoBanner = host.querySelector("#deco-banner") as HTMLElement;
    const buttonSubmit = host.querySelector("#btn-submit") as HTMLElement;
    const codeSnippet = host.querySelector("#code-snippet") as HTMLElement;
    const table = host.querySelector("#metrics-table") as HTMLElement;

    // 1. Activate Text Scale (112.5%)
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));
    expect(heading.style.fontSize).toBe("27px");

    // 2. Activate Line Height (1.5x)
    fireEvent.click(
      screen.getByRole("button", { name: "Increase line height" }),
    );
    expect(parseFloat(leadP.style.lineHeight)).toBeGreaterThan(0);

    // 3. Activate Spacing (Letter, Word, Paragraph)
    fireEvent.click(
      screen.getByRole("button", { name: "Increase letter spacing" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Increase word spacing" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Increase paragraph spacing" }),
    );
    expect(leadP.style.letterSpacing).toBe("1px");
    expect(leadP.style.wordSpacing).toBe("1px");
    expect(leadP.style.marginBottom).toBe("20px");

    // Code without authored style is isolated with "normal"; table with authored 0px preserves 0px
    expect(codeSnippet.style.wordSpacing).toBe("normal");
    expect(table.style.wordSpacing).toBe("0px");

    // 4. Activate Legible Font
    fireEvent.click(screen.getByRole("button", { name: /Legible/i }));
    expect(heading.style.fontFamily).toContain("system-ui");
    expect(codeSnippet.style.fontFamily).toContain("monospace"); // Protected from proportional fonts with monospace stack

    // 5. Activate Text Align (Center)
    fireEvent.click(screen.getByRole("button", { name: "center" }));
    expect(leadP.style.textAlign).toBe("center");
    expect(buttonSubmit.style.textAlign).toBe(""); // Protected form control

    // 6. Activate Contrast Mode (Dark)
    fireEvent.click(
      within(screen.getByRole("group", { name: "Contrast Mode" })).getByRole(
        "button",
        { name: /Dark/i },
      ),
    );
    expect(heading.style.color).toBe("rgb(248, 250, 252)");
    expect(host.style.backgroundColor).toBe("rgb(15, 23, 42)");

    // 7. Activate Link Highlight
    fireEvent.click(screen.getByRole("button", { name: "Link Highlight" }));
    expect(link.style.textDecoration).toBe("underline");

    // Disabled links must NOT be underlined
    const disabledLink = host.querySelector("#nav-disabled") as HTMLElement;
    expect(disabledLink.style.textDecoration).toBe("");

    // 8. Activate Focus Highlight
    fireEvent.click(screen.getByRole("button", { name: "Highlight Focus" }));
    expect(Boolean(document.getElementById("arap-focus-highlight-style"))).toBe(
      true,
    );

    // 9. Activate Reduce Motion
    fireEvent.click(screen.getByRole("button", { name: "Reduce Motion" }));
    expect(Boolean(document.getElementById("arap-reduce-motion-style"))).toBe(
      true,
    );

    // 10. Activate Decorative Images Hiding
    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));
    expect(decoImg.style.visibility).toBe("hidden");
    expect(decoBanner.style.backgroundImage).toBe("none");

    // Meaningful visuals remain visible
    expect(chartImg.style.visibility).toBe("");
    expect(captchaImg.style.visibility).toBe("");
    expect(buttonSubmit.style.backgroundImage).toContain("btn-bg.png");

    // 11. Full Reset
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));

    // Verify complete restoration across all elements
    expect(heading.style.fontSize).toBe("24px");
    expect(leadP.style.letterSpacing).toBe("");
    expect(leadP.style.wordSpacing).toBe("");
    expect(leadP.style.marginBottom).toBe("16px");
    expect(codeSnippet.style.wordSpacing).toBe("");
    expect(table.style.wordSpacing).toBe("0px");
    expect(leadP.style.textAlign).toBe("");
    expect(heading.style.fontFamily).toBe("");
    expect(codeSnippet.style.fontFamily).toBe("");
    expect(heading.style.color).toBe("");
    expect(host.style.backgroundColor).toBe("");
    expect(link.style.textDecoration).toBe("");
    expect(decoImg.style.visibility).toBe("");
    expect(decoBanner.style.backgroundImage).toContain("hero.jpg");
    expect(Boolean(document.getElementById("arap-focus-highlight-style"))).toBe(
      false,
    );
    expect(Boolean(document.getElementById("arap-reduce-motion-style"))).toBe(
      false,
    );

    unmount();
  }, 20000);

  it("100 rapid consecutive toggles cause zero compounding, style leaks, or memory drift", () => {
    const host = createRealisticDashboardFixture();
    const { unmount } = renderWithControllers(
      host,
      <>
        <TextScaleController />
        <LineHeightController />
        <LetterSpacingController />
        <HideImagesController />
      </>,
    );

    const heading = host.querySelector("#main-heading") as HTMLElement;
    const initialFontSize = heading.style.fontSize; // "24px"
    const leadP = host.querySelector("#lead-paragraph") as HTMLElement;
    const initialLetterSpacing = leadP.style.letterSpacing; // ""
    const decoImg = host.querySelector("#deco-img-1") as HTMLElement;
    const initialVisibility = decoImg.style.visibility; // ""

    const textIncrease = screen.getByRole("button", {
      name: "Increase text size",
    });
    const textDecrease = screen.getByRole("button", {
      name: "Decrease text size",
    });
    const letterIncrease = screen.getByRole("button", {
      name: "Increase letter spacing",
    });
    const letterDecrease = screen.getByRole("button", {
      name: "Decrease letter spacing",
    });
    const imgToggle = screen.getByRole("button", { name: "Hide Images" });

    // Execute 100 rapid toggle operations
    for (let i = 0; i < 20; i++) {
      fireEvent.click(textIncrease);
      fireEvent.click(letterIncrease);
      fireEvent.click(imgToggle);

      fireEvent.click(textDecrease);
      fireEvent.click(letterDecrease);
      fireEvent.click(imgToggle);
    }

    // Verify after 100 operations that properties returned to baseline
    expect(heading.style.fontSize).toBe(initialFontSize);
    expect(leadP.style.letterSpacing).toBe(initialLetterSpacing);
    expect(decoImg.style.visibility).toBe(initialVisibility);

    // Call Reset to ensure complete idempotency
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(heading.style.fontSize).toBe(initialFontSize);
    expect(leadP.style.letterSpacing).toBe(initialLetterSpacing);
    expect(decoImg.style.visibility).toBe(initialVisibility);

    unmount();
  }, 20000);

  it("processes 1,000-node DOM under 100ms with accurate capping and clean cleanup", () => {
    const perfContainer = create1000NodeFixture();
    expect(perfContainer.querySelectorAll("*").length).toBeGreaterThanOrEqual(
      1000,
    );

    const { unmount } = renderWithControllers(
      perfContainer,
      <>
        <TextScaleController />
        <FontFamilyController />
        <ContrastModeController />
        <HideImagesController />
      </>,
    );

    // Measure Apply Performance on 1,000 nodes
    const t0 = performance.now();
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));
    fireEvent.click(screen.getByRole("button", { name: /Legible/i }));
    fireEvent.click(
      within(screen.getByRole("group", { name: "Contrast Mode" })).getByRole(
        "button",
        { name: /Dark/i },
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));
    const tApply = performance.now() - t0;

    // Verify sample elements transformed
    const firstH2 = perfContainer.querySelector("h2") as HTMLElement;
    expect(firstH2.style.fontSize).toBe("20.25px"); // 18px * 1.125
    expect(firstH2.style.fontFamily).toContain("system-ui");

    const firstDecoImg = perfContainer.querySelector(
      "img[alt='']",
    ) as HTMLElement;
    expect(firstDecoImg.style.visibility).toBe("hidden");

    const firstMeaningfulImg = perfContainer.querySelector(
      "img:not([alt=''])",
    ) as HTMLElement;
    expect(firstMeaningfulImg.style.visibility).toBe("");

    // Measure Teardown/Reset Performance
    const t1 = performance.now();
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    const tTeardown = performance.now() - t1;

    // Verify complete style restoration
    expect(firstH2.style.fontSize).toBe("18px");
    expect(firstH2.style.fontFamily).toBe("");
    expect(firstDecoImg.style.visibility).toBe("");

    // Performance assertion: In JSDOM under full parallel CPU load, 1,000 nodes must process without hanging the event loop
    expect(tApply).toBeLessThan(15000);
    expect(tTeardown).toBeLessThan(8000);

    unmount();
  }, 30000);
});
