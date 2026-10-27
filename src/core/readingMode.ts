/**
 * Non-destructive article content extraction for Reading Mode.
 *
 * Extracts readable article content from candidate containers without mutating
 * or destroying host React DOM elements.
 *
 * Filters out:
 * - Forms, interactive inputs, buttons, and sensitive fields (passwords, cards, hidden tokens)
 * - Navigation menus, headers, footers, sidebars, cookie banners, advertisements
 * - Scripts, styles, iframes, embeds, and dialogs
 *
 * Preserves:
 * - Semantic headings (h1-h6), paragraphs (p), lists (ul, ol, li)
 * - Hyperlinks (a[href]) with safe URIs
 * - Images (img[src]) with alt text and captions (figure, figcaption)
 * - Blockquotes and code blocks
 *
 * Purely client-side: zero network requests or external transmissions.
 */

export interface ArticleContent {
  title: string;
  byline?: string;
  wordCount: number;
  readingTimeMinutes: number;
  html: string;
  text: string;
}

const EXCLUDED_SELECTORS = [
  "[data-arap-ui]",
  "script",
  "style",
  "noscript",
  "template",
  "iframe",
  "object",
  "embed",
  "canvas",
  "audio",
  "video",
  "form",
  "input",
  "select",
  "textarea",
  "button",
  "nav",
  '[role="navigation"]',
  "header",
  '[role="banner"]',
  "footer",
  '[role="contentinfo"]',
  "aside",
  '[role="complementary"]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  "[aria-modal='true']",
  "[hidden]",
  '[aria-hidden="true"]',
  ".ad",
  ".ads",
  ".advertisement",
  ".cookie-banner",
  ".cookie-consent",
  ".social-share",
  ".comments",
  ".sidebar",
];

const SENSITIVE_SELECTORS = [
  'input[type="password"]',
  'input[type="hidden"]',
  "[data-sensitive]",
  '[autocomplete*="password"]',
  '[autocomplete*="cc-"]',
  '[autocomplete*="credit-card"]',
];

const ALLOWED_TAGS = new Set([
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "p",
  "ul",
  "ol",
  "li",
  "blockquote",
  "pre",
  "code",
  "a",
  "img",
  "figure",
  "figcaption",
  "strong",
  "em",
  "b",
  "i",
  "mark",
  "time",
  "hr",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "div",
  "section",
  "article",
  "span",
  "br",
]);

/**
 * Validates link href to ensure no javascript: or unsafe protocols are included.
 */
function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:") || trimmed.startsWith("vbscript:")) {
    return false;
  }
  return (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../") ||
    trimmed.startsWith("data:image/")
  );
}

/**
 * Calculates word count from raw text string.
 */
export function countWords(text: string): number {
  const matches = text.trim().match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Estimates reading time in whole minutes (standard 200 wpm baseline).
 */
export function estimateReadingTime(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Computes readability score for candidate DOM element.
 * Higher score indicates higher likelihood of being the primary article body.
 */
function scoreElement(el: HTMLElement): number {
  let score = 0;
  const tagName = el.tagName.toLowerCase();

  // Semantic tag bonuses
  if (tagName === "article" || el.getAttribute("role") === "article")
    score += 50;
  if (tagName === "main" || el.getAttribute("role") === "main") score += 30;
  if (el.getAttribute("itemprop") === "articleBody") score += 60;
  if (el.id === "content" || el.id === "article" || el.id === "main-content")
    score += 20;

  // Paragraph and text density
  const paragraphs = el.querySelectorAll("p");
  score += paragraphs.length * 5;

  const text = el.textContent || "";
  const words = countWords(text);
  score += Math.min(words / 10, 50);

  // Link density penalty: navigation containers have high ratio of link text to total text
  const links = el.querySelectorAll("a");
  let linkTextLength = 0;
  links.forEach((a) => {
    linkTextLength += (a.textContent || "").length;
  });

  const totalTextLength = text.length;
  if (totalTextLength > 0) {
    const linkDensity = linkTextLength / totalTextLength;
    if (linkDensity > 0.5) {
      score -= 50;
    }
  }

  return score;
}

/**
 * Finds the primary article candidate element within a root.
 */
export function findArticleCandidate(
  root: HTMLElement | Document,
): HTMLElement | null {
  // If specific article element is present and has meaningful text, prefer it
  const articles = Array.from(
    root.querySelectorAll<HTMLElement>("article, [role='article']"),
  );
  const substantiveArticles = articles.filter(
    (a) =>
      !a.closest("[data-arap-ui]") && (a.textContent?.trim().length ?? 0) >= 60,
  );

  if (substantiveArticles.length === 1) {
    return substantiveArticles[0];
  }

  // Check main element
  const main = root.querySelector<HTMLElement>("main, [role='main']");
  if (
    main &&
    !main.closest("[data-arap-ui]") &&
    (main.textContent?.trim().length ?? 0) >= 60
  ) {
    // If the main has a single substantive article inside, use the article
    const innerArticle = main.querySelector<HTMLElement>("article");
    if (innerArticle && (innerArticle.textContent?.trim().length ?? 0) >= 60) {
      return innerArticle;
    }
    return main;
  }

  // Look for candidates among sections and containers
  const candidates = Array.from(
    root.querySelectorAll<HTMLElement>(
      "article, section, div.content, div.post, div.entry, #content, #article, div",
    ),
  ).filter((el) => {
    if (el.closest("[data-arap-ui]")) return false;
    const text = el.textContent?.trim() || "";
    return text.length >= 60 && el.querySelectorAll("p").length >= 1;
  });

  if (candidates.length === 0) return null;

  let bestCandidate: HTMLElement | null = null;
  let highestScore = -1;

  for (const candidate of candidates) {
    const score = scoreElement(candidate);
    if (score > highestScore) {
      highestScore = score;
      bestCandidate = candidate;
    }
  }

  return highestScore > 0 ? bestCandidate : null;
}

/**
 * Deep cleans an element clone by removing disallowed tags, attributes, and sensitive fields.
 */
function sanitizeClone(node: HTMLElement): void {
  // 1. Remove sensitive fields explicitly
  for (const selector of SENSITIVE_SELECTORS) {
    node.querySelectorAll(selector).forEach((el) => el.remove());
  }

  // 2. Remove excluded elements (forms, navigation, ads, dialogs, etc.)
  for (const selector of EXCLUDED_SELECTORS) {
    node.querySelectorAll(selector).forEach((el) => el.remove());
  }

  // 3. Clean remaining elements recursively
  const allElements = Array.from(node.querySelectorAll("*"));
  for (const el of allElements) {
    const tagName = el.tagName.toLowerCase();

    // If tag is not allowed, either unwrap it or remove it
    if (!ALLOWED_TAGS.has(tagName)) {
      el.remove();
      continue;
    }

    // Clean attributes: strip all on* handlers, style attributes, and non-whitelisted attributes
    const attributeNames = Array.from(el.attributes).map((attr) => attr.name);
    for (const attr of attributeNames) {
      const lower = attr.toLowerCase();
      if (lower.startsWith("on") || lower === "style") {
        el.removeAttribute(attr);
      } else if (tagName === "a") {
        if (lower === "href") {
          const href = el.getAttribute("href") || "";
          if (!isSafeUrl(href)) {
            el.removeAttribute("href");
          } else {
            // Safe target/rel
            el.setAttribute("target", "_blank");
            el.setAttribute("rel", "noopener noreferrer");
          }
        } else if (lower !== "title" && lower !== "id") {
          el.removeAttribute(attr);
        }
      } else if (tagName === "img") {
        if (lower === "src") {
          const src = el.getAttribute("src") || "";
          if (!isSafeUrl(src)) {
            el.removeAttribute("src");
          }
        } else if (
          lower !== "alt" &&
          lower !== "title" &&
          lower !== "width" &&
          lower !== "height"
        ) {
          el.removeAttribute(attr);
        }
      } else if (
        lower !== "id" &&
        lower !== "lang" &&
        lower !== "dir" &&
        lower !== "class"
      ) {
        el.removeAttribute(attr);
      }
    }

    // Ensure images have valid alt attribute (even if empty)
    if (tagName === "img" && !el.hasAttribute("alt")) {
      el.setAttribute("alt", "");
    }
  }
}

/**
 * Extracts article title from candidate or document.
 */
function extractTitle(candidate: HTMLElement, doc: Document): string {
  // First heading inside the candidate
  const firstHeading = candidate.querySelector("h1, h2");
  if (firstHeading && firstHeading.textContent?.trim()) {
    return firstHeading.textContent.trim();
  }

  // Document h1
  const docH1 = doc.querySelector("h1");
  if (docH1 && docH1.textContent?.trim()) {
    return docH1.textContent.trim();
  }

  // Document title
  return doc.title?.trim() || "Article";
}

/**
 * Extracts byline (author or publication date) if present.
 */
function extractByline(candidate: HTMLElement): string | undefined {
  const bylineEl = candidate.querySelector(
    "[rel='author'], .byline, .author, time, [itemprop='author'], [itemprop='datePublished']",
  );
  if (bylineEl && bylineEl.textContent?.trim()) {
    return bylineEl.textContent.trim();
  }
  return undefined;
}

/**
 * Non-destructive article content extractor.
 * Returns null if no sufficient readable content is found on the page.
 */
export function extractArticleContent(
  root?: HTMLElement | Document,
): ArticleContent | null {
  if (typeof document === "undefined") return null;

  const doc = root instanceof Document ? root : root?.ownerDocument || document;
  const targetRoot = root || doc.body;

  const candidate = findArticleCandidate(targetRoot);
  if (!candidate) return null;

  // Clone candidate node so the original DOM remains completely untouched
  const clone = candidate.cloneNode(true) as HTMLElement;
  sanitizeClone(clone);

  const text = (clone.textContent || "").trim();
  const wordCount = countWords(text);

  // Minimum threshold for readable article content: 20 words or 60 characters
  if (wordCount < 20 && text.length < 60) {
    return null;
  }

  const title = extractTitle(candidate, doc);
  const byline = extractByline(candidate);
  const readingTimeMinutes = estimateReadingTime(wordCount);

  // Remove top heading if it matches article title to avoid redundant duplicate headings
  const topHeading = clone.querySelector("h1, h2");
  if (
    topHeading &&
    topHeading.textContent?.trim().toLowerCase() === title.trim().toLowerCase()
  ) {
    topHeading.remove();
  }

  return {
    title,
    byline,
    wordCount,
    readingTimeMinutes,
    html: clone.innerHTML.trim(),
    text,
  };
}
