import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  extractArticleContent,
  findArticleCandidate,
  countWords,
  estimateReadingTime,
} from "../src/core/readingMode";

describe("readingMode - extraction and safety", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("calculates word count and estimated reading time accurately", () => {
    expect(countWords("")).toBe(0);
    expect(countWords("   ")).toBe(0);
    expect(countWords("The quick brown fox jumps over the lazy dog.")).toBe(9);
    expect(estimateReadingTime(100)).toBe(1);
    expect(estimateReadingTime(400)).toBe(2);
    expect(estimateReadingTime(450)).toBe(3);
  });

  it("finds candidate article element correctly using findArticleCandidate", () => {
    document.body.innerHTML = `
      <header><nav><a href="/">Home</a></nav></header>
      <article id="target-article">
        <h1>Valid Article Title</h1>
        <p>This is a substantive article body with sufficient paragraphs and sentences to be scored as an article.</p>
        <p>A second paragraph reinforcing the readability and structural score.</p>
      </article>
    `;
    const candidate = findArticleCandidate(document.body);
    expect(candidate).not.toBeNull();
    expect(candidate?.id).toBe("target-article");
  });

  it("extracts primary content from an <article> element", () => {
    document.body.innerHTML = `
      <header>
        <nav><a href="/home">Home</a><a href="/about">About</a></nav>
      </header>
      <article>
        <h1>Accessible Web Architecture</h1>
        <p class="byline">By Jane Doe on October 27, 2026</p>
        <p>Web accessibility ensures that websites, tools, and technologies are designed and developed so that people with disabilities can use them.</p>
        <h2>Core Principles</h2>
        <p>The four core principles of accessibility are Perceivable, Operable, Understandable, and Robust (POUR).</p>
      </article>
      <footer>
        <p>&copy; 2026 Example Corp</p>
      </footer>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Accessible Web Architecture");
    expect(result?.byline).toBe("By Jane Doe on October 27, 2026");
    expect(result?.wordCount).toBeGreaterThan(20);
    expect(result?.readingTimeMinutes).toBeGreaterThanOrEqual(1);
    expect(result?.html).toContain("Web accessibility ensures that websites");
    expect(result?.html).toContain("<h2>Core Principles</h2>");
    // Ensure header, nav, and footer are excluded
    expect(result?.html).not.toContain("Home");
    expect(result?.html).not.toContain("Example Corp");
  });

  it("extracts from <main> when no explicit <article> is present", () => {
    document.body.innerHTML = `
      <div class="sidebar">Ads and navigation</div>
      <main id="main-content">
        <h1>Exploring Space Technology</h1>
        <p>Space exploration has fundamentally transformed our understanding of planetary science, satellite telecommunications, and earth observation.</p>
        <p>Modern reusable launch vehicles significantly reduce the cost of access to low earth orbit, enabling more scientific research missions.</p>
      </main>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.title).toBe("Exploring Space Technology");
    expect(result?.html).toContain("planetary science");
    expect(result?.html).not.toContain("Ads and navigation");
  });

  it("preserves headings, hyperlinks, lists, blockquotes, and code blocks", () => {
    document.body.innerHTML = `
      <article>
        <h1>Preservation Test</h1>
        <p>Here is an introduction with a <a href="https://example.com/spec">link to spec</a>.</p>
        <ul>
          <li>First item</li>
          <li>Second item</li>
        </ul>
        <blockquote>Universal design benefits everyone, not only people with disabilities.</blockquote>
        <pre><code>const a11y = true;</code></pre>
      </article>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.html).toContain(
      '<a href="https://example.com/spec" target="_blank" rel="noopener noreferrer">link to spec</a>',
    );
    expect(result?.html).toContain("<ul>");
    expect(result?.html).toContain("<li>First item</li>");
    expect(result?.html).toContain(
      "<blockquote>Universal design benefits everyone",
    );
    expect(result?.html).toContain(
      "<pre><code>const a11y = true;</code></pre>",
    );
  });

  it("preserves images with alt text while stripping dangerous inline handlers", () => {
    document.body.innerHTML = `
      <article>
        <h1>Image Preservation</h1>
        <p>Diagram of accessible focus indicators in web design.</p>
        <figure>
          <img src="https://example.com/diagram.png" alt="Focus ring diagram with 3px contrast outline" onclick="alert('xss')" />
          <figcaption>Figure 1: Accessible focus ring</figcaption>
        </figure>
      </article>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.html).toContain(
      'alt="Focus ring diagram with 3px contrast outline"',
    );
    expect(result?.html).toContain('src="https://example.com/diagram.png"');
    expect(result?.html).toContain(
      "<figcaption>Figure 1: Accessible focus ring</figcaption>",
    );
    // Ensure onclick event handler is completely stripped
    expect(result?.html).not.toContain("onclick");
    expect(result?.html).not.toContain("alert");
  });

  it("strictly removes forms, inputs, buttons, and sensitive fields", () => {
    document.body.innerHTML = `
      <article>
        <h1>Article with Subscription Form</h1>
        <p>Stay informed about digital accessibility updates and upcoming regulatory requirements across global markets.</p>
        <form action="/subscribe" method="POST">
          <label for="email">Email address</label>
          <input type="email" id="email" value="user@example.com" />
          <input type="password" name="pwd" value="SecretPassword123" autocomplete="current-password" />
          <input type="hidden" name="token" value="csrf_token_secret" />
          <button type="submit">Subscribe</button>
        </form>
        <p>Additional paragraph following the form discussing international standards and compliance timelines.</p>
      </article>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.html).toContain(
      "Stay informed about digital accessibility updates",
    );
    expect(result?.html).toContain("Additional paragraph following the form");
    // Ensure forms, inputs, passwords, and tokens are completely stripped
    expect(result?.html).not.toContain("<form");
    expect(result?.html).not.toContain("<input");
    expect(result?.html).not.toContain("<button");
    expect(result?.html).not.toContain("SecretPassword123");
    expect(result?.html).not.toContain("csrf_token_secret");
    expect(result?.html).not.toContain("user@example.com");
  });

  it("sanitizes unsafe javascript: URLs", () => {
    document.body.innerHTML = `
      <article>
        <h1>Link Sanitization</h1>
        <p>This is a safe paragraph with <a href="javascript:alert(1)">malicious script link</a> and <a href="https://safe.com">safe link</a>.</p>
      </article>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(result?.html).not.toContain("javascript:");
    expect(result?.html).toContain('href="https://safe.com"');
  });

  it("returns null when page lacks readable article content", () => {
    // Page with only navigation and login form, no substantive article text
    document.body.innerHTML = `
      <header>
        <nav><a href="/">Home</a></nav>
      </header>
      <div class="login-box">
        <form>
          <input type="text" placeholder="Username" />
          <input type="password" placeholder="Password" />
          <button type="submit">Sign in</button>
        </form>
      </div>
      <footer>&copy; 2026</footer>
    `;

    const result = extractArticleContent(document.body);
    expect(result).toBeNull();
  });

  it("never sends content externally over fetch or XMLHttpRequest", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    document.body.innerHTML = `
      <article>
        <h1>Offline Confidentiality</h1>
        <p>This document contains sensitive local notes that must never be sent over any network socket or telemetric API.</p>
        <p>Purely client-side execution ensures user privacy is upheld under all operating conditions.</p>
      </article>
    `;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("guarantees non-destructive behavior by leaving the original DOM intact", () => {
    document.body.innerHTML = `
      <main id="host-main">
        <article id="host-article">
          <h1>Original Host Heading</h1>
          <p id="p1">First paragraph with <a href="/test">link</a> explaining the non-destructive architecture of reading mode.</p>
          <p id="p2">Second paragraph ensuring the document has enough substantive sentences to exceed minimal content thresholds.</p>
          <input id="user-input" value="user entered data" />
        </article>
      </main>
    `;

    const originalInput = document.getElementById(
      "user-input",
    ) as HTMLInputElement;
    const originalP = document.getElementById("p1") as HTMLParagraphElement;

    const result = extractArticleContent(document.body);
    expect(result).not.toBeNull();

    // Verify host DOM nodes were NOT deleted, modified, or detached
    expect(document.getElementById("host-main")).not.toBeNull();
    expect(document.getElementById("host-article")).not.toBeNull();
    expect(document.getElementById("user-input")).toBe(originalInput);
    expect(originalInput.value).toBe("user entered data");
    expect(document.getElementById("p1")).toBe(originalP);
  });
});
