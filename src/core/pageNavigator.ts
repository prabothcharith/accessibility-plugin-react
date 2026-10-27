"use client";

export interface HeadingItem {
  id: string;
  level: number;
  text: string;
  element: HTMLElement;
}

export interface LandmarkItem {
  id: string;
  type: string;
  label: string;
  element: HTMLElement;
}

export interface LinkItem {
  id: string;
  text: string;
  href: string;
  target?: string;
  isExternal: boolean;
  isHash: boolean;
  isAmbiguous: boolean;
  element: HTMLElement;
}

const EXCLUDED_TAGS = new Set([
  "SCRIPT",
  "STYLE",
  "LINK",
  "META",
  "NOSCRIPT",
  "TEMPLATE",
]);

function isElementVisible(el: HTMLElement): boolean {
  if (el.getAttribute("aria-hidden") === "true") return false;
  if (el.getAttribute("hidden") !== null) return false;
  if (el.closest("[aria-hidden='true']")) return false;

  // In non-DOM or testing environments without layout engines, styles may be empty
  if (el.style.display === "none" || el.style.visibility === "hidden") {
    return false;
  }
  return true;
}

/**
 * Discovers all visible headings (h1-h6 or role="heading") in true DOM tree order,
 * strictly excluding elements within the plugin UI.
 */
export function scanHeadings(root?: Document | Element): HeadingItem[] {
  const doc = root || (typeof document !== "undefined" ? document : null);
  if (!doc) return [];

  const candidates = doc.querySelectorAll(
    "h1, h2, h3, h4, h5, h6, [role='heading']",
  );
  const items: HeadingItem[] = [];
  let index = 0;

  candidates.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (EXCLUDED_TAGS.has(node.tagName)) return;
    if (node.closest("[data-arap-ui]")) return;
    if (!isElementVisible(node)) return;

    let level = 2;
    const match = node.tagName.match(/^H([1-6])$/i);
    if (match) {
      level = parseInt(match[1], 10);
    } else if (node.getAttribute("role") === "heading") {
      const ariaLevel = parseInt(node.getAttribute("aria-level") || "2", 10);
      level = Math.max(1, Math.min(6, isNaN(ariaLevel) ? 2 : ariaLevel));
    }

    const text =
      node.getAttribute("aria-label")?.trim() || node.textContent?.trim() || "";

    // Truthful extraction: do not invent artificial headings for empty containers
    if (!text) return;

    items.push({
      id: node.id || `arap-heading-${++index}`,
      level,
      text,
      element: node,
    });
  });

  return items;
}

const LANDMARK_TAGS: Record<string, string> = {
  HEADER: "banner",
  NAV: "navigation",
  MAIN: "main",
  ASIDE: "complementary",
  FOOTER: "contentinfo",
  FORM: "form",
  SECTION: "region",
};

const LANDMARK_TITLES: Record<string, string> = {
  banner: "Header (Banner)",
  navigation: "Navigation",
  main: "Main Content",
  complementary: "Sidebar (Complementary)",
  contentinfo: "Footer (Content Info)",
  search: "Search",
  region: "Region",
  form: "Form",
};

function isScopedHeaderOrFooter(el: HTMLElement): boolean {
  // <header> and <footer> are only top-level landmarks if not scoped inside article/aside/main/nav/section
  const parentSection = el.parentElement?.closest(
    "article, aside, main, nav, section",
  );
  return Boolean(parentSection && !parentSection.closest("[data-arap-ui]"));
}

/**
 * Discovers all visible landmarks and named navigation anchors in true DOM tree order,
 * strictly excluding elements within the plugin UI.
 */
export function scanLandmarks(root?: Document | Element): LandmarkItem[] {
  const doc = root || (typeof document !== "undefined" ? document : null);
  if (!doc) return [];

  const candidates = doc.querySelectorAll(
    "header, nav, main, aside, footer, form[role='search'], [role='banner'], [role='navigation'], [role='main'], [role='complementary'], [role='contentinfo'], [role='search'], [role='region'][aria-label], [role='region'][aria-labelledby], section[aria-label], section[aria-labelledby], a[id]:not([href]), a[name]",
  );

  const items: LandmarkItem[] = [];
  let index = 0;

  candidates.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (EXCLUDED_TAGS.has(node.tagName)) return;
    if (node.closest("[data-arap-ui]")) return;
    if (!isElementVisible(node)) return;

    let type = "";
    const explicitRole = node.getAttribute("role");

    if (
      explicitRole &&
      [
        "banner",
        "navigation",
        "main",
        "complementary",
        "contentinfo",
        "search",
        "region",
        "form",
      ].includes(explicitRole)
    ) {
      type = explicitRole;
    } else if (node.tagName in LANDMARK_TAGS) {
      if (
        (node.tagName === "HEADER" || node.tagName === "FOOTER") &&
        isScopedHeaderOrFooter(node)
      ) {
        return; // Scoped header/footer inside section/article is not a global landmark
      }
      type = LANDMARK_TAGS[node.tagName];
    } else if (node.tagName === "A" && (node.id || node.getAttribute("name"))) {
      type = "anchor";
    }

    if (!type) return;

    // Determine label
    let label = node.getAttribute("aria-label")?.trim() || "";
    if (!label && node.getAttribute("aria-labelledby")) {
      const labelId = node.getAttribute("aria-labelledby")!.trim();
      const labelEl = document.getElementById(labelId);
      if (labelEl) {
        label = labelEl.textContent?.trim() || "";
      }
    }

    if (!label) {
      if (type === "anchor") {
        label =
          node.textContent?.trim() ||
          node.id ||
          node.getAttribute("name") ||
          "Named Anchor";
      } else {
        label =
          LANDMARK_TITLES[type] || type.charAt(0).toUpperCase() + type.slice(1);
      }
    }

    items.push({
      id: node.id || `arap-landmark-${++index}`,
      type,
      label,
      element: node,
    });
  });

  return items;
}

const AMBIGUOUS_TEXT_PATTERNS =
  /^(click\s*here|here|read\s*more|more|learn\s*more|link|details|view|go|continue|open|arrow)$/i;

/**
 * Discovers all visible links (a[href] or [role='link']) in true DOM tree order,
 * strictly excluding elements within the plugin UI.
 * Identifies external destinations, hash jumps, and uninformative / ambiguous link text.
 */
export function scanLinks(root?: Document | Element): LinkItem[] {
  const doc = root || (typeof document !== "undefined" ? document : null);
  if (!doc) return [];

  const candidates = doc.querySelectorAll("a[href], [role='link'][href]");
  const items: LinkItem[] = [];
  let index = 0;

  const currentOrigin =
    typeof window !== "undefined" && window.location
      ? window.location.origin
      : "";

  candidates.forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    if (EXCLUDED_TAGS.has(node.tagName)) return;
    if (node.closest("[data-arap-ui]")) return;
    if (!isElementVisible(node)) return;

    const href = node.getAttribute("href")?.trim() || "";
    if (!href || href.startsWith("javascript:")) {
      return;
    }

    // Accessible name calculation
    let text =
      node.getAttribute("aria-label")?.trim() ||
      node.getAttribute("title")?.trim() ||
      "";

    if (!text) {
      const img = node.querySelector<HTMLImageElement>("img[alt]");
      if (img && img.alt.trim()) {
        text = img.alt.trim();
      } else {
        text = node.textContent?.trim() || "";
      }
    }

    const isHash = href.startsWith("#");
    let isExternal = false;
    const target = node.getAttribute("target") || undefined;

    if (target === "_blank") {
      isExternal = true;
    } else if (href.startsWith("http://") || href.startsWith("https://")) {
      try {
        const url = new URL(href, currentOrigin || "http://localhost");
        if (currentOrigin && url.origin !== currentOrigin) {
          isExternal = true;
        }
      } catch {
        // Fallback for relative or malformed URLs
      }
    }

    const isAmbiguous =
      !text || AMBIGUOUS_TEXT_PATTERNS.test(text.toLowerCase());

    items.push({
      id: node.id || `arap-link-${++index}`,
      text: text || href,
      href,
      target,
      isExternal,
      isHash,
      isAmbiguous,
      element: node,
    });
  });

  return items;
}

/**
 * Safely scrolls to and focuses a target element.
 * If the element is not naturally focusable, assigns a temporary tabindex="-1"
 * and cleans it up on blur, preventing permanent mutation of host DOM semantics.
 */
export function navigateToElement(
  element: HTMLElement,
  options: {
    behavior?: ScrollBehavior;
    onComplete?: () => void;
  } = {},
): void {
  if (!element || !element.isConnected) return;

  const isNaturallyFocusable =
    element instanceof HTMLAnchorElement ||
    element instanceof HTMLButtonElement ||
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement ||
    element.hasAttribute("tabindex");

  const hadTabIndex = element.hasAttribute("tabindex");
  const previousTabIndex = element.getAttribute("tabindex");

  if (!isNaturallyFocusable) {
    element.setAttribute("tabindex", "-1");
  }

  const isReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const behavior: ScrollBehavior =
    options.behavior ?? (isReduced ? "auto" : "smooth");

  element.scrollIntoView({ behavior, block: "start" });
  element.focus();

  if (!isNaturallyFocusable) {
    const handleBlur = () => {
      if (hadTabIndex && previousTabIndex !== null) {
        element.setAttribute("tabindex", previousTabIndex);
      } else {
        element.removeAttribute("tabindex");
      }
      element.removeEventListener("blur", handleBlur);
    };
    element.addEventListener("blur", handleBlur, { once: true });
  }

  options.onComplete?.();
}

/**
 * Subscribes to DOM tree mutations outside the plugin UI without observer loops,
 * refreshing headings/landmarks on dynamic client-side SPA route transitions.
 */
export function subscribePageStructure(callback: () => void): () => void {
  if (
    typeof MutationObserver === "undefined" ||
    typeof document === "undefined" ||
    !document.body
  ) {
    return () => {};
  }

  let timer: ReturnType<typeof setTimeout> | null = null;

  const observer = new MutationObserver((mutations) => {
    const isExternal = mutations.some((m) => {
      const target = m.target;
      if (target instanceof Element && target.closest("[data-arap-ui]")) {
        return false;
      }
      return [...m.addedNodes, ...m.removedNodes].some((node) => {
        return !(node instanceof Element && node.closest("[data-arap-ui]"));
      });
    });

    if (!isExternal) return;

    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      callback();
    }, 100);
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    if (timer) clearTimeout(timer);
    observer.disconnect();
  };
}
