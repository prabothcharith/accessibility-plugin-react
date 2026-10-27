import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { scanLinks } from "../src/core/pageNavigator";


describe("A11Y-308: Link explorer and semantic scanning", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("discovers links with accurate text and destinations", () => {
    document.body.innerHTML = `
      <div>
        <a id="link-docs" href="/docs/api">API Documentation</a>
        <a id="link-home" href="https://example.com/home">Home Page</a>
        <a id="link-contact" href="#contact">Contact Section</a>
      </div>
    `;

    const links = scanLinks(document);
    expect(links).toHaveLength(3);

    expect(links[0].id).toBe("link-docs");
    expect(links[0].text).toBe("API Documentation");
    expect(links[0].href).toBe("/docs/api");
    expect(links[0].isHash).toBe(false);

    expect(links[1].id).toBe("link-home");
    expect(links[1].text).toBe("Home Page");
    expect(links[1].href).toBe("https://example.com/home");

    expect(links[2].id).toBe("link-contact");
    expect(links[2].text).toBe("Contact Section");
    expect(links[2].isHash).toBe(true);
  });

  it("identifies ambiguous uninformative link text", () => {
    document.body.innerHTML = `
      <div>
        <a id="link-1" href="/article/1">Click here</a>
        <a id="link-2" href="/article/2">Read more</a>
        <a id="link-3" href="/article/3">Learn more</a>
        <a id="link-4" href="/article/4">More</a>
        <a id="link-5" href="/article/5">Understanding Digital Accessibility</a>
      </div>
    `;

    const links = scanLinks(document);
    expect(links).toHaveLength(5);

    expect(links[0].isAmbiguous).toBe(true);
    expect(links[1].isAmbiguous).toBe(true);
    expect(links[2].isAmbiguous).toBe(true);
    expect(links[3].isAmbiguous).toBe(true);
    expect(links[4].isAmbiguous).toBe(false);
  });

  it("extracts accessible name from nested image alt text", () => {
    document.body.innerHTML = `
      <div>
        <a id="link-img" href="/products/1">
          <img src="/img/sample.png" alt="Wireless Noise-Canceling Headphones" />
        </a>
      </div>
    `;

    const links = scanLinks(document);
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe("Wireless Noise-Canceling Headphones");
    expect(links[0].isAmbiguous).toBe(false);
  });

  it("ignores javascript: links and elements inside plugin UI", () => {
    document.body.innerHTML = `
      <div>
        <a id="link-valid" href="/safe">Safe Link</a>
        <a id="link-js" href="javascript:void(0)">JS Void</a>
        <div data-arap-ui="">
          <a id="link-ui" href="/plugin-internal">Plugin UI Link</a>
        </div>
      </div>
    `;

    const links = scanLinks(document);
    expect(links).toHaveLength(1);
    expect(links[0].id).toBe("link-valid");
  });

  it("identifies target='_blank' links as external", () => {
    document.body.innerHTML = `
      <div>
        <a id="link-ext" href="/somewhere" target="_blank">Opens in new tab</a>
        <a id="link-same" href="/somewhere">Same tab</a>
      </div>
    `;

    const links = scanLinks(document);
    expect(links[0].isExternal).toBe(true);
    expect(links[1].isExternal).toBe(false);
  });
});
