import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  HideImagesController,
  HideDecorativeImagesController,
  ResetController,
  isEligibleDecorativeImage,
  isFunctionalOrMeaningfulImage,
} from "../src";

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

function renderFixture(children: React.ReactNode) {
  const host = document.createElement("main");
  host.id = "host";
  host.innerHTML = `
    <!-- Decorative images -->
    <img id="deco-empty-alt" alt="" src="deco1.png" />
    <img id="deco-whitespace-alt" alt="   " src="deco2.png" />
    <img id="deco-role-pres" role="presentation" src="deco3.png" />
    <img id="deco-role-none" role="none" src="deco4.png" />
    <img id="deco-aria-hidden" aria-hidden="true" src="deco5.png" />
    <img id="deco-data-attr" data-decorative="true" src="deco6.png" />
    <picture id="deco-picture"><img alt="" src="deco7.png" /></picture>

    <!-- Meaningful / Informative images -->
    <img id="meaningful-alt" alt="Quarterly financial report" src="report.png" />
    <img id="meaningful-aria-label" aria-label="System architecture diagram" src="diagram.png" />
    <img id="meaningful-title" title="Founder portrait" src="founder.png" />
    <picture id="meaningful-picture"><img alt="Product preview" src="product.png" /></picture>

    <!-- Functional / Interactive controls -->
    <a href="#destination" id="linked-control"><img id="link-img" alt="" src="link-icon.png" /></a>
    <button type="button" id="button-control"><img id="btn-img" alt="" src="btn-icon.png" /></button>
    <div role="button" id="role-button"><img id="role-btn-img" alt="" src="role-icon.png" /></div>

    <!-- Protected categories: CAPTCHA, charts, maps, QR codes -->
    <img id="captcha-img" class="captcha-challenge" src="captcha.png" />
    <div id="captcha-container" class="security-captcha">
      <img id="nested-captcha-img" alt="" src="challenge.png" />
    </div>
    <img id="chart-img" class="sales-chart" alt="" src="chart.png" />
    <div id="chart-container" role="graphics-document">
      <img id="nested-chart-img" alt="" src="graph.png" />
    </div>
    <img id="map-img" class="leaflet-map-tile" alt="" src="https://tile.openstreetmap.org/1/2/3.png" />
    <div id="map-container" role="region" aria-label="Store locator map">
      <img id="nested-map-img" alt="" src="map-view.png" />
    </div>
    <img id="qr-img" class="qr-code-payment" alt="" src="qr.png" />

    <!-- CSS background images -->
    <div id="deco-bg" style="background-image: url('banner.png')">Decorative banner</div>
    <button id="button-bg" style="background-image: url('btn-bg.png')">Button with BG</button>
    <div id="captcha-bg" class="captcha-box" style="background-image: url('noise.png')">CAPTCHA BG</div>
  `;
  document.body.appendChild(host);

  const result = render(
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        {children}
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
  return { ...result, host };
}

describe("Decorative image classification predicates", () => {
  it("correctly identifies decorative images", () => {
    const emptyAlt = document.createElement("img");
    emptyAlt.setAttribute("alt", "");
    expect(isEligibleDecorativeImage(emptyAlt)).toBe(true);
    expect(isFunctionalOrMeaningfulImage(emptyAlt)).toBe(false);

    const wsAlt = document.createElement("img");
    wsAlt.setAttribute("alt", "   ");
    expect(isEligibleDecorativeImage(wsAlt)).toBe(true);

    const presRole = document.createElement("img");
    presRole.setAttribute("role", "presentation");
    expect(isEligibleDecorativeImage(presRole)).toBe(true);

    const noneRole = document.createElement("img");
    noneRole.setAttribute("role", "none");
    expect(isEligibleDecorativeImage(noneRole)).toBe(true);

    const ariaHidden = document.createElement("img");
    ariaHidden.setAttribute("aria-hidden", "true");
    expect(isEligibleDecorativeImage(ariaHidden)).toBe(true);

    const decoData = document.createElement("img");
    decoData.setAttribute("data-decorative", "true");
    expect(isEligibleDecorativeImage(decoData)).toBe(true);
  });

  it("protects meaningful, informative, and labelled images", () => {
    const meaningfulAlt = document.createElement("img");
    meaningfulAlt.setAttribute("alt", "Company logo");
    expect(isEligibleDecorativeImage(meaningfulAlt)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(meaningfulAlt)).toBe(true);

    const ariaLabel = document.createElement("img");
    ariaLabel.setAttribute("aria-label", "Infographic");
    expect(isEligibleDecorativeImage(ariaLabel)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(ariaLabel)).toBe(true);

    const titleImg = document.createElement("img");
    titleImg.setAttribute("title", "Portrait");
    expect(isEligibleDecorativeImage(titleImg)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(titleImg)).toBe(true);
  });

  it("protects images in interactive and functional controls", () => {
    const link = document.createElement("a");
    link.href = "#";
    const linkImg = document.createElement("img");
    linkImg.setAttribute("alt", "");
    link.appendChild(linkImg);
    document.body.appendChild(link);

    expect(isEligibleDecorativeImage(linkImg)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(linkImg)).toBe(true);

    const button = document.createElement("button");
    const btnImg = document.createElement("img");
    btnImg.setAttribute("alt", "");
    button.appendChild(btnImg);
    document.body.appendChild(button);

    expect(isEligibleDecorativeImage(btnImg)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(btnImg)).toBe(true);
  });

  it("protects CAPTCHA, charts, maps, and QR codes", () => {
    const captcha = document.createElement("img");
    captcha.className = "captcha-verification";
    captcha.setAttribute("alt", "");
    expect(isEligibleDecorativeImage(captcha)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(captcha)).toBe(true);

    const chart = document.createElement("img");
    chart.className = "analytics-chart";
    chart.setAttribute("alt", "");
    expect(isEligibleDecorativeImage(chart)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(chart)).toBe(true);

    const map = document.createElement("img");
    map.setAttribute("src", "https://maps.googleapis.com/maps/api/staticmap");
    map.setAttribute("alt", "");
    expect(isEligibleDecorativeImage(map)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(map)).toBe(true);

    const qr = document.createElement("img");
    qr.className = "payment-qr-code";
    qr.setAttribute("alt", "");
    expect(isEligibleDecorativeImage(qr)).toBe(false);
    expect(isFunctionalOrMeaningfulImage(qr)).toBe(true);
  });
});

describe("HideImagesController & HideDecorativeImagesController integration", () => {
  it("hides only eligible decorative images and preserves meaningful/functional content", () => {
    const { host } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    // Initial state: all visible
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");

    // Toggle ON
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-pressed", "true");

    // Decorative images are hidden
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-whitespace-alt") as HTMLElement).style
        .visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-role-pres") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-role-none") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-aria-hidden") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-data-attr") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-picture") as HTMLElement).style.visibility,
    ).toBe("hidden");

    // Meaningful images remain visible
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-aria-label") as HTMLElement).style
        .visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-title") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-picture") as HTMLElement).style
        .visibility,
    ).toBe("");

    // Functional controls remain visible
    expect(
      (host.querySelector("#link-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#btn-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#role-btn-img") as HTMLElement).style.visibility,
    ).toBe("");

    // CAPTCHA, charts, maps, and QR codes remain visible
    expect(
      (host.querySelector("#captcha-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#nested-captcha-img") as HTMLElement).style
        .visibility,
    ).toBe("");
    expect(
      (host.querySelector("#chart-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#nested-chart-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#map-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#nested-map-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#qr-img") as HTMLElement).style.visibility,
    ).toBe("");

    // Decorative background image removed
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toBe("none");

    // Functional background images preserved
    expect(
      (host.querySelector("#button-bg") as HTMLElement).style.backgroundImage,
    ).toContain("btn-bg.png");
    expect(
      (host.querySelector("#captcha-bg") as HTMLElement).style.backgroundImage,
    ).toContain("noise.png");

    // Toggle OFF restores all
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-picture") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toContain("banner.png");
  });

  it("works identically via HideDecorativeImagesController alias", () => {
    const { host } = renderFixture(
      <HideDecorativeImagesController label="Hide Decorative Images" />,
    );
    const toggleButton = screen.getByRole("button", {
      name: "Hide Decorative Images",
    });

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-pressed", "true");

    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
  });

  it("restores all elements cleanly on reset", () => {
    const { host } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    fireEvent.click(toggleButton);
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toContain("banner.png");
  });

  it("never mutates or fabricates synthetic alt text on images", () => {
    const { host } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    const decoAltBefore = host
      .querySelector("#deco-empty-alt")
      ?.getAttribute("alt");
    const meaningfulAltBefore = host
      .querySelector("#meaningful-alt")
      ?.getAttribute("alt");

    fireEvent.click(toggleButton);

    expect(host.querySelector("#deco-empty-alt")?.getAttribute("alt")).toBe(
      decoAltBefore,
    );
    expect(host.querySelector("#meaningful-alt")?.getAttribute("alt")).toBe(
      meaningfulAltBefore,
    );

    fireEvent.click(toggleButton);

    expect(host.querySelector("#deco-empty-alt")?.getAttribute("alt")).toBe(
      decoAltBefore,
    );
    expect(host.querySelector("#meaningful-alt")?.getAttribute("alt")).toBe(
      meaningfulAltBefore,
    );
  });

  it("restores all styles on unmount", () => {
    const { host, unmount } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    fireEvent.click(toggleButton);
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toBe("none");

    unmount();
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toContain("banner.png");
  });
});
