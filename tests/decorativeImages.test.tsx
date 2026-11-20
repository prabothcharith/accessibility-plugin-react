import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from "@testing-library/react";
import React from "react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  HideImagesController,
  HideDecorativeImagesController,
  HideVideosController,
  PresetsController,
  ResetController,
  isEligibleDecorativeImage,
  isFunctionalOrMeaningfulImage,
  mapProfileSettingsToFeatures,
} from "../src";

const injectedStyleTags: HTMLStyleElement[] = [];

function injectTestStyle(cssText: string): HTMLStyleElement {
  const style = document.createElement("style");
  style.textContent = cssText;
  document.head.appendChild(style);
  injectedStyleTags.push(style);
  return style;
}

beforeEach(() => {
  localStorage.clear();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  document.body.removeAttribute("style");
  document.documentElement.removeAttribute("style");
  while (injectedStyleTags.length > 0) {
    injectedStyleTags.pop()?.remove();
  }
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

    <!-- Meaningful / Editorial / Missing-alt images -->
    <img id="meaningful-alt" alt="Quarterly financial report" src="report.png" />
    <img id="meaningful-aria-label" aria-label="System architecture diagram" src="diagram.png" />
    <img id="meaningful-title" title="Founder portrait" src="founder.png" />
    <img id="missing-alt-img" src="photo.png" />
    <picture id="meaningful-picture"><img alt="Product preview" src="product.png" /></picture>
    <object id="image-object" type="image/svg+xml" data="graphic.svg"></object>
    <embed id="image-embed" type="image/png" src="banner.png" />
    <svg id="deco-svg" data-decorative="true" width="24" height="24"><circle cx="12" cy="12" r="10" /></svg>
    <svg id="inline-svg" width="24" height="24"><rect width="24" height="24" /></svg>

    <!-- Functional / Interactive controls -->
    <a href="#destination" id="linked-control"><img id="link-img" alt="" src="link-icon.png" /></a>
    <a href="#article" id="text-link-card">Read the full article <img id="text-link-img" alt="Article thumb" src="thumb.png" /></a>
    <button type="button" id="button-control"><img id="btn-img" alt="" src="btn-icon.png" /></button>
    <div role="button" id="role-button"><img id="role-btn-img" alt="" src="role-icon.png" /></div>

    <!-- Protected categories: CAPTCHA, charts, maps, QR codes, math, opt-out -->
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
    <div id="math-container" role="math">
      <img id="math-img" alt="Equation" src="eq.png" />
    </div>
    <div id="ignore-container" data-arap-ignore="true">
      <img id="ignored-img" alt="" src="ignored.png" />
    </div>
    <div id="exempt-container" data-arap-exempt="true" style="background-image: url('exempt.png')">Exempt</div>

    <!-- CSS background images & false-positive class name containers -->
    <div id="deco-bg" style="background-image: url('banner.png')">Decorative banner</div>
    <div id="shorthand-bg" style="background: #112233 url('shorthand.png') no-repeat">Shorthand banner</div>
    <section id="landmark-section" aria-label="Featured hero" style="background-image: url('section-hero.png')">Section</section>
    <div id="banner-role-div" role="banner" style="background-image: url('role-banner.png')">Role banner</div>
    <div id="role-img-bg" role="img" aria-label="Team backdrop" style="background-image: url('team-bg.png')">Team backdrop</div>
    <div id="paragraph-bg" class="paragraph typography photography roadmap sitemap charter aftermath faqRow" style="background-image: url('fp-ok.png')">Word tokens</div>
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

  it("protects CAPTCHA, charts, maps, and QR codes without false positives on ordinary words", () => {
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

    const falsePositiveContainer = document.createElement("img");
    falsePositiveContainer.className =
      "paragraph typography photography roadmap sitemap charter aftermath faqRow";
    falsePositiveContainer.setAttribute("alt", "");
    expect(isFunctionalOrMeaningfulImage(falsePositiveContainer)).toBe(false);
    expect(isEligibleDecorativeImage(falsePositiveContainer)).toBe(true);
  });
});

describe("HideImagesController (default all mode) & HideDecorativeImagesController (decorative mode)", () => {
  it("hides all host HTML & CSS images by default while preserving protected controls, CAPTCHAs, charts, maps, QR, math, and opt-outs", () => {
    const { host } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-pressed", "true");

    // Decorative & general images hidden
    for (const id of [
      "#deco-empty-alt",
      "#deco-whitespace-alt",
      "#deco-role-pres",
      "#deco-role-none",
      "#deco-aria-hidden",
      "#deco-data-attr",
      "#deco-picture",
      "#meaningful-alt",
      "#meaningful-aria-label",
      "#meaningful-title",
      "#missing-alt-img",
      "#meaningful-picture",
      "#image-object",
      "#image-embed",
      "#deco-svg",
      "#text-link-img",
    ]) {
      expect((host.querySelector(id) as HTMLElement).style.visibility).toBe(
        "hidden",
      );
    }

    // Non-decorative inline SVG stays visible
    expect(
      (host.querySelector("#inline-svg") as SVGElement).style.visibility,
    ).toBe("");

    // Icon-only link and button controls remain visible
    expect(
      (host.querySelector("#link-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#btn-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#role-btn-img") as HTMLElement).style.visibility,
    ).toBe("");

    // CAPTCHA, charts, maps, QR codes, math, and opt-out containers remain visible
    for (const id of [
      "#captcha-img",
      "#nested-captcha-img",
      "#chart-img",
      "#nested-chart-img",
      "#map-img",
      "#nested-map-img",
      "#qr-img",
      "#math-img",
      "#ignored-img",
    ]) {
      expect((host.querySelector(id) as HTMLElement).style.visibility).toBe("");
    }

    // CSS backgrounds hidden (including shorthand, landmarks, role="img", and word-token classes)
    for (const id of [
      "#deco-bg",
      "#shorthand-bg",
      "#landmark-section",
      "#banner-role-div",
      "#role-img-bg",
      "#paragraph-bg",
    ]) {
      expect(
        (host.querySelector(id) as HTMLElement).style.backgroundImage,
      ).toBe("none");
    }

    // Functional, protected, and exempt CSS background images preserved
    expect(
      (host.querySelector("#button-bg") as HTMLElement).style.backgroundImage,
    ).toContain("btn-bg.png");
    expect(
      (host.querySelector("#captcha-bg") as HTMLElement).style.backgroundImage,
    ).toContain("noise.png");
    expect(
      (host.querySelector("#exempt-container") as HTMLElement).style
        .backgroundImage,
    ).toContain("exempt.png");

    // Toggle OFF restores all
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-pressed", "false");

    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#missing-alt-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-picture") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toContain("banner.png");
    expect(
      (host.querySelector("#shorthand-bg") as HTMLElement).style
        .backgroundImage,
    ).toContain("shorthand.png");
  });

  it("HideDecorativeImagesController and mode='decorative' preserve informative images while hiding decorative ones and CSS backgrounds", () => {
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
      (host.querySelector("#deco-svg") as SVGElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#missing-alt-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-picture") as HTMLElement).style
        .visibility,
    ).toBe("");
    expect(
      (host.querySelector("#text-link-img") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#role-img-bg") as HTMLElement).style.backgroundImage,
    ).toContain("team-bg.png");

    // Decorative & section/word-class CSS backgrounds ARE hidden in decorative mode
    expect(
      (host.querySelector("#deco-bg") as HTMLElement).style.backgroundImage,
    ).toBe("none");
    expect(
      (host.querySelector("#landmark-section") as HTMLElement).style
        .backgroundImage,
    ).toBe("none");
    expect(
      (host.querySelector("#paragraph-bg") as HTMLElement).style
        .backgroundImage,
    ).toBe("none");

    fireEvent.click(toggleButton);
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#landmark-section") as HTMLElement).style
        .backgroundImage,
    ).toContain("section-hero.png");
  });

  it("supports <HideImagesController mode='decorative' /> prop explicitly", () => {
    const { host } = renderFixture(
      <HideImagesController label="Decorative Only" mode="decorative" />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Decorative Only" }));

    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
  });

  it("hides CSS stylesheet backgrounds, image-set, list-style-image, body/html backgrounds, and ::before/::after CSS images and restores cleanly", () => {
    injectTestStyle(`
      .sheet-bg { background-image: url("sheet.png"); }
      .sheet-imageset { background-image: image-set(url("set1.png") 1x, url("set2.png") 2x); }
      .pseudo-bg::before { content: ""; background-image: url("before.png"); }
      .pseudo-content::after { content: url("after.png"); }
      ul.img-list { list-style-image: url("bullet.png"); }
      .replaced-content { content: url("replaced.png"); }
    `);

    document.documentElement.style.backgroundImage = "url('html-bg.png')";
    document.body.style.backgroundImage = "url('body-bg.png')";

    const { host, unmount } = renderFixture(<HideImagesController />);

    const sheetEl = document.createElement("div");
    sheetEl.className = "sheet-bg";
    const imageSetEl = document.createElement("div");
    imageSetEl.className = "sheet-imageset";
    const pseudoBgEl = document.createElement("div");
    pseudoBgEl.className = "pseudo-bg";
    const pseudoContentEl = document.createElement("div");
    pseudoContentEl.className = "pseudo-content";
    const imgList = document.createElement("ul");
    imgList.className = "img-list";
    const replacedEl = document.createElement("div");
    replacedEl.className = "replaced-content";

    host.append(
      sheetEl,
      imageSetEl,
      pseudoBgEl,
      pseudoContentEl,
      imgList,
      replacedEl,
    );

    const toggle = screen.getByRole("button", { name: "Hide Images" });
    fireEvent.click(toggle);

    expect(document.getElementById("arap-hide-images-style")).not.toBeNull();
    expect(document.documentElement.style.backgroundImage).toBe("none");
    expect(document.body.style.backgroundImage).toBe("none");
    expect(sheetEl.style.backgroundImage).toBe("none");
    expect(imageSetEl.style.backgroundImage).toBe("none");
    expect(imgList.style.listStyleImage).toBe("none");
    expect(replacedEl.style.visibility).toBe("hidden");
    expect(pseudoBgEl.getAttribute("data-arap-hide-before-bg")).toBe("true");
    expect(pseudoContentEl.getAttribute("data-arap-hide-after-content")).toBe(
      "true",
    );

    // Toggle OFF restores everything
    fireEvent.click(toggle);
    expect(document.getElementById("arap-hide-images-style")).toBeNull();
    expect(document.documentElement.style.backgroundImage).toContain(
      "html-bg.png",
    );
    expect(document.body.style.backgroundImage).toContain("body-bg.png");
    expect(sheetEl.style.backgroundImage).toBe("");
    expect(imageSetEl.style.backgroundImage).toBe("");
    expect(imgList.style.listStyleImage).toBe("");
    expect(replacedEl.style.visibility).toBe("");
    expect(pseudoBgEl.hasAttribute("data-arap-hide-before-bg")).toBe(false);
    expect(pseudoContentEl.hasAttribute("data-arap-hide-after-content")).toBe(
      false,
    );

    unmount();
  });

  it("hides dynamically added nodes, toggled CSS classes, inline style mutations, and updated img attributes", async () => {
    injectTestStyle(`
      .dynamic-bg-class { background-image: url("dyn-class.png"); }
      .dynamic-pseudo-class::before { content: ""; background-image: url("dyn-before.png"); }
    `);

    const { host } = renderFixture(<HideImagesController />);
    const dynamicBox = document.createElement("div");
    const dynamicStyleBox = document.createElement("div");
    const lazyImg = document.createElement("img");
    lazyImg.alt = "Lazy chart";
    host.append(dynamicBox, dynamicStyleBox, lazyImg);

    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));

    // Existing img hidden immediately; dynamic boxes have no image yet
    expect(lazyImg.style.visibility).toBe("hidden");
    expect(dynamicBox.style.backgroundImage).toBe("");
    expect(dynamicStyleBox.style.backgroundImage).toBe("");

    // 1. Dynamically add a new img + bg subtree
    const appendedImg = document.createElement("img");
    appendedImg.alt = "Appended photo";
    appendedImg.src = "appended.png";
    host.appendChild(appendedImg);

    // 2. Dynamically toggle class adding CSS background and pseudo-element background
    dynamicBox.classList.add("dynamic-bg-class", "dynamic-pseudo-class");

    // 3. Dynamically mutate inline style.backgroundImage on existing node
    dynamicStyleBox.style.backgroundImage = "url('dyn-inline.png')";

    await waitFor(() => {
      expect(appendedImg.style.visibility).toBe("hidden");
      expect(dynamicBox.style.backgroundImage).toBe("none");
      expect(dynamicBox.getAttribute("data-arap-hide-before-bg")).toBe("true");
      expect(dynamicStyleBox.style.backgroundImage).toBe("none");
    });

    // Reset restores dynamically hidden inline style & attributes
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(appendedImg.style.visibility).toBe("");
    expect(dynamicBox.style.backgroundImage).toBe("");
    expect(dynamicBox.hasAttribute("data-arap-hide-before-bg")).toBe(false);
    expect(dynamicStyleBox.style.backgroundImage).toContain("dyn-inline.png");
  });

  it("restores all elements cleanly on reset", () => {
    const { host } = renderFixture(<HideImagesController />);
    const toggleButton = screen.getByRole("button", { name: "Hide Images" });

    fireEvent.click(toggleButton);
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
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
    const missingAltBefore = host
      .querySelector("#missing-alt-img")
      ?.hasAttribute("alt");

    fireEvent.click(toggleButton);

    expect(host.querySelector("#deco-empty-alt")?.getAttribute("alt")).toBe(
      decoAltBefore,
    );
    expect(host.querySelector("#meaningful-alt")?.getAttribute("alt")).toBe(
      meaningfulAltBefore,
    );
    expect(host.querySelector("#missing-alt-img")?.hasAttribute("alt")).toBe(
      missingAltBefore,
    );

    fireEvent.click(toggleButton);

    expect(host.querySelector("#deco-empty-alt")?.getAttribute("alt")).toBe(
      decoAltBefore,
    );
    expect(host.querySelector("#meaningful-alt")?.getAttribute("alt")).toBe(
      meaningfulAltBefore,
    );
    expect(host.querySelector("#missing-alt-img")?.hasAttribute("alt")).toBe(
      missingAltBefore,
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
    expect(document.getElementById("arap-hide-images-style")).toBeNull();
  });

  it("preserves CSS gradient backgrounds and widget UI icons while hiding <picture> and video embeds", () => {
    const { host } = renderFixture(
      <>
        <HideImagesController />
        <HideVideosController />
      </>,
    );

    const gradientBox = document.createElement("div");
    gradientBox.style.backgroundImage = "linear-gradient(to right, #fff, #000)";
    const pic = document.createElement("picture");
    const picImg = document.createElement("img");
    picImg.setAttribute("alt", "");
    pic.appendChild(picImg);

    const ytEmbed = document.createElement("iframe");
    ytEmbed.src = "https://youtu.be/dQw4w9WgXcQ";
    const mapEmbed = document.createElement("iframe");
    mapEmbed.src = "https://maps.google.com/maps?q=colombo";
    host.append(gradientBox, pic, ytEmbed, mapEmbed);

    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));
    expect(gradientBox.style.backgroundImage).toContain("linear-gradient");
    expect(pic.style.visibility).toBe("hidden");
    expect(picImg.style.visibility).toBe("hidden");

    const widgetIcon = document.querySelector("[data-arap-ui]");
    expect(isFunctionalOrMeaningfulImage(widgetIcon!)).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Hide Videos" }));
    expect(ytEmbed.style.visibility).toBe("hidden");
    expect(mapEmbed.style.visibility).toBe("");
  });

  it("hides images wrapped inside <figure> and preserves alt-labelled ones only in decorative mode (#201)", () => {
    const { host } = renderFixture(
      <>
        <HideImagesController />
        <HideDecorativeImagesController label="Hide Decorative Images" />
      </>,
    );

    const figure = document.createElement("figure");
    const emptyAltInFigure = document.createElement("img");
    emptyAltInFigure.setAttribute("alt", "");
    emptyAltInFigure.src = "banner.png";

    const markedWithAltInFigure = document.createElement("img");
    markedWithAltInFigure.setAttribute("alt", "Calm shoreline");
    markedWithAltInFigure.setAttribute("data-decorative", "true");
    markedWithAltInFigure.src = "shoreline.png";

    const meaningfulInFigure = document.createElement("img");
    meaningfulInFigure.setAttribute("alt", "Editorial figure");
    meaningfulInFigure.src = "editorial.png";

    figure.append(emptyAltInFigure, markedWithAltInFigure, meaningfulInFigure);
    host.appendChild(figure);

    // Decorative-only mode hides empty alt & data-decorative, preserves meaningfulInFigure
    const decoToggle = screen.getByRole("button", {
      name: "Hide Decorative Images",
    });
    fireEvent.click(decoToggle);
    expect(emptyAltInFigure.style.visibility).toBe("hidden");
    expect(markedWithAltInFigure.style.visibility).toBe("hidden");
    expect(meaningfulInFigure.style.visibility).toBe("");

    // Switching to Hide Images (all mode) hides meaningfulInFigure too
    const allToggle = screen.getByRole("button", { name: "Hide Images" });
    fireEvent.click(allToggle);
    expect(emptyAltInFigure.style.visibility).toBe("hidden");
    expect(markedWithAltInFigure.style.visibility).toBe("hidden");
    expect(meaningfulInFigure.style.visibility).toBe("hidden");

    // Toggle OFF restores all
    fireEvent.click(allToggle);
    expect(emptyAltInFigure.style.visibility).toBe("");
    expect(markedWithAltInFigure.style.visibility).toBe("");
    expect(meaningfulInFigure.style.visibility).toBe("");
  });

  it("maps hideDecorativeImages profile preference to decorative mode and preserves decorative-only behavior across preset round-trips", () => {
    expect(
      mapProfileSettingsToFeatures({ hideDecorativeImages: true }),
    ).toEqual({ hideImages: "decorative" });
    expect(
      mapProfileSettingsToFeatures({ hideDecorativeImages: false }),
    ).toEqual({ hideImages: false });

    const { host } = renderFixture(
      <>
        <HideDecorativeImagesController label="Hide Decorative Images" />
        <PresetsController />
      </>,
    );

    const decoToggle = screen.getByRole("button", {
      name: "Hide Decorative Images",
    });
    fireEvent.click(decoToggle);
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");

    // Save custom preset while Hide Decorative Images is active
    fireEvent.click(screen.getByRole("button", { name: "Presets" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Preset name" }), {
      target: { value: "Deco Only" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Save current preset" }),
    );

    // Reset All clears image hiding
    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("");

    // Reapplying the saved preset preserves decorative-only mode
    fireEvent.click(
      screen.getByRole("button", { name: "Apply preset Deco Only" }),
    );
    expect(
      (host.querySelector("#deco-empty-alt") as HTMLElement).style.visibility,
    ).toBe("hidden");
    expect(
      (host.querySelector("#meaningful-alt") as HTMLElement).style.visibility,
    ).toBe("");
  });

  it("reprocesses descendants beyond 200 nodes on dynamic class mutations", async () => {
    injectTestStyle(`
      .large-wrap.show-bg .late-descendant-bg {
        background-image: url("oversized-subtree.png");
      }
    `);

    const { host } = renderFixture(<HideImagesController />);
    const container = document.createElement("div");
    container.className = "large-wrap";
    for (let i = 0; i < 220; i++) {
      const child = document.createElement("div");
      if (i === 215) {
        child.id = "target-215";
        child.className = "late-descendant-bg";
      }
      container.appendChild(child);
    }
    host.appendChild(container);

    fireEvent.click(screen.getByRole("button", { name: "Hide Images" }));
    const target215 = host.querySelector("#target-215") as HTMLElement;
    expect(target215.style.backgroundImage).toBe("");

    // Trigger class mutation on oversized >200-node container
    container.classList.add("show-bg");

    await waitFor(() => {
      expect(target215.style.backgroundImage).toBe("none");
    });

    fireEvent.click(screen.getByRole("button", { name: /Reset All/i }));
    expect(target215.style.backgroundImage).toBe("");
  });
});
