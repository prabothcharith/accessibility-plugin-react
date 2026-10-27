"use client";

export type DiagnosticCategory =
  | "provider"
  | "storage"
  | "csp"
  | "host-css"
  | "dom"
  | "boundaries"
  | "effects";

export type DiagnosticSeverity = "error" | "warning" | "info";

export interface DiagnosticIssue {
  id: string;
  category: DiagnosticCategory;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  recommendation: string;
  target?: string;
  docUrl?: string;
}

export interface DiagnosticsSummary {
  total: number;
  errors: number;
  warnings: number;
  info: number;
}

export interface DiagnosticsReport {
  timestamp: number;
  environment: "development" | "production" | "test";
  disclaimer: string;
  summary: DiagnosticsSummary;
  issues: DiagnosticIssue[];
}

export interface DiagnosticsConfig {
  /** Force diagnostics to run even when NODE_ENV is production. Defaults to false. */
  force?: boolean;
  /** Whether to log diagnostic findings to the browser developer console. Defaults to true in dev. */
  logToConsole?: boolean;
  /** Specific categories to inspect. If omitted, all categories are checked. */
  categories?: DiagnosticCategory[];
  /** Callback invoked when a diagnostics run completes. */
  onReport?: (report: DiagnosticsReport) => void;
  /** Document root to inspect (defaults to global document). */
  root?: Document | Element;
}

export const DIAGNOSTICS_DISCLAIMER =
  "Automated diagnostics evaluate host environment compatibility, DOM landmarks, and CSS boundaries. They do not constitute official WCAG 2.1/2.2 AA certification and cannot substitute for manual keyboard and screen-reader auditing.";

const DOC_BASE_URL =
  "https://github.com/prabothcharith/accessibility-react/blob/main/docs/DEVELOPMENT.md";

/**
 * Sanitizes element representation to prevent logging private data,
 * credentials, or sensitive URLs/content.
 */
function sanitizeElementTarget(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const className = el.className && typeof el.className === "string"
    ? `.${el.className.trim().split(/\s+/).slice(0, 2).join(".")}`
    : "";
  return `${tag}${id}${className}`;
}

/**
 * Validates single provider ownership and widget placement.
 */
export function checkProviderDiagnostics(root: Document | Element): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const doc = root.ownerDocument || (root as Document);

  // 1. Multiple widget DOM markers
  const widgetPanels = doc.querySelectorAll("[data-arap-ui], .arap-root");
  if (widgetPanels.length > 2) {
    issues.push({
      id: "provider-multiple-instances",
      category: "provider",
      severity: "warning",
      title: "Multiple AccessibilityPlugin instances detected",
      message: `Found ${widgetPanels.length} widget DOM containers. Only one AccessibilityPlugin should own a document.`,
      recommendation:
        "Mount a single AccessibilityPlugin near the root of your application above route boundaries.",
      docUrl: `${DOC_BASE_URL}#clean-checkout`,
    });
  }

  // 2. Fixed positioning trap (ancestor with transform, filter, perspective)
  const widgetTrigger = doc.querySelector("[data-arap-widget], .arap-btn");
  if (widgetTrigger && widgetTrigger.parentElement) {
    let current: HTMLElement | null = widgetTrigger.parentElement;
    let depth = 0;
    while (current && current !== doc.body && depth < 20) {
      if (typeof window !== "undefined" && window.getComputedStyle) {
        try {
          const style = window.getComputedStyle(current);
          const hasTransform = style.transform && style.transform !== "none";
          const hasFilter = style.filter && style.filter !== "none";
          const hasPerspective = style.perspective && style.perspective !== "none";
          const hasBackdrop =
            style.backdropFilter && style.backdropFilter !== "none";

          if (hasTransform || hasFilter || hasPerspective || hasBackdrop) {
            issues.push({
              id: "provider-fixed-position-trap",
              category: "provider",
              severity: "error",
              title: "Widget placed inside CSS transform/filter ancestor",
              message: `Widget ancestor (${sanitizeElementTarget(current)}) creates a CSS containing block which breaks 'position: fixed' viewport alignment.`,
              recommendation:
                "Ensure AccessibilityPlugin or its WidgetPortal renders directly as a child of <body> outside transformed containers.",
              target: sanitizeElementTarget(current),
              docUrl: `${DOC_BASE_URL}#clean-checkout`,
            });
            break;
          }
        } catch {
          // Ignore computed style access errors in restricted environments
        }
      }
      current = current.parentElement;
      depth++;
    }
  }

  return issues;
}

/**
 * Validates storage accessibility, quotas, and security boundaries.
 */
export function checkStorageDiagnostics(): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  if (typeof window === "undefined") return issues;

  const testKey = "__arap_diag_test__";

  // Check localStorage
  try {
    if (!window.localStorage) {
      issues.push({
        id: "storage-local-unavailable",
        category: "storage",
        severity: "info",
        title: "localStorage is unavailable",
        message:
          "localStorage is not present. Preferences will persist in-memory only.",
        recommendation:
          "If cross-session persistence is required, ensure browser storage is enabled.",
      });
    } else {
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
    }
  } catch (err) {
    issues.push({
      id: "storage-local-blocked",
      category: "storage",
      severity: "warning",
      title: "localStorage access blocked or quota exceeded",
      message: `Failed to access localStorage: ${err instanceof Error ? err.message : "SecurityError"}. The plugin will safely fall back to in-memory state.`,
      recommendation:
        "Verify third-party storage permissions, iframe sandbox flags (allow-same-origin), or user privacy settings.",
      docUrl: `${DOC_BASE_URL}#clean-checkout`,
    });
  }

  // Check sessionStorage
  try {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(testKey, "1");
      window.sessionStorage.removeItem(testKey);
    }
  } catch {
    // sessionStorage warning is informational
    issues.push({
      id: "storage-session-blocked",
      category: "storage",
      severity: "info",
      title: "sessionStorage is restricted",
      message: "sessionStorage is restricted in this environment.",
      recommendation: "Ensure session storage permissions are granted if using storage='session'.",
    });
  }

  return issues;
}

/**
 * Validates Content Security Policy (CSP) and style injection capability.
 */
export function checkCspDiagnostics(root: Document | Element): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const doc = root.ownerDocument || (root as Document);
  if (!doc || !doc.head) return issues;

  // Test dynamic stylesheet injection
  try {
    const testStyle = doc.createElement("style");
    testStyle.setAttribute("data-arap-csp-test", "true");
    testStyle.textContent = ".arap-csp-probe { opacity: 0.99; }";
    doc.head.appendChild(testStyle);

    // Verify sheet is accessible
    const sheetAccessible = Boolean(testStyle.sheet);
    doc.head.removeChild(testStyle);

    if (!sheetAccessible) {
      issues.push({
        id: "csp-style-injection-restricted",
        category: "csp",
        severity: "warning",
        title: "Style sheet injection restricted by CSP",
        message:
          "Dynamic <style> elements did not produce an active StyleSheet. Content Security Policy may restrict style-src.",
        recommendation:
          "Ensure CSP allows 'unsafe-inline' for styles or distribute plugin CSS via link tags.",
        docUrl: `${DOC_BASE_URL}#clean-checkout`,
      });
    }
  } catch (err) {
    issues.push({
      id: "csp-style-injection-blocked",
      category: "csp",
      severity: "error",
      title: "Inline stylesheet blocked by Content Security Policy",
      message: `Failed to inject temporary style element: ${err instanceof Error ? err.message : "CSP violation"}.`,
      recommendation:
        "Configure Content Security Policy (CSP) header with style-src 'self' or appropriate cryptographic nonces.",
      docUrl: `${DOC_BASE_URL}#clean-checkout`,
    });
  }

  // Test CSS Custom Property manipulation
  if (doc.documentElement && doc.documentElement.style) {
    try {
      doc.documentElement.style.setProperty("--arap-csp-probe", "1");
      const val = doc.documentElement.style.getPropertyValue("--arap-csp-probe");
      doc.documentElement.style.removeProperty("--arap-csp-probe");
      if (val !== "1") {
        issues.push({
          id: "csp-custom-properties-unsupported",
          category: "csp",
          severity: "warning",
          title: "CSS custom properties failed to apply",
          message: "Unable to read or write CSS custom properties on document.documentElement.",
          recommendation: "Ensure host document styling supports standard CSS custom properties.",
        });
      }
    } catch {
      // Ignore
    }
  }

  return issues;
}

/**
 * Validates host CSS conflicts: extreme z-indexes, overflow locks, preflight clashes.
 */
export function checkHostCssDiagnostics(root: Document | Element): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const doc = root.ownerDocument || (root as Document);
  if (!doc) return issues;

  // 1. Root overflow locking
  if (typeof window !== "undefined" && window.getComputedStyle) {
    try {
      const htmlStyle = window.getComputedStyle(doc.documentElement);
      const bodyStyle = doc.body ? window.getComputedStyle(doc.body) : null;

      if (
        htmlStyle.overflow === "hidden" &&
        bodyStyle &&
        bodyStyle.overflow === "hidden"
      ) {
        issues.push({
          id: "host-css-root-overflow-hidden",
          category: "host-css",
          severity: "warning",
          title: "Both <html> and <body> have overflow: hidden",
          message:
            "Root elements lock document scrolling. Reading aids, page navigator, and high-zoom layouts may clip content.",
          recommendation:
            "Avoid setting overflow: hidden on both html and body simultaneously.",
          target: "html, body",
          docUrl: `${DOC_BASE_URL}#manual-accessibility-acceptance-checklist`,
        });
      }
    } catch {
      // Ignore computed style errors
    }
  }

  // 2. High z-index stacking conflicts (> 2147483000)
  const candidateElements = doc.querySelectorAll(
    "header, nav, modal, dialog, [role='dialog'], [style*='z-index'], [class*='z-']",
  );
  let highZCount = 0;
  let maxZ = 0;
  candidateElements.forEach((el) => {
    if (el.closest("[data-arap-ui]")) return;
    if (typeof window !== "undefined" && window.getComputedStyle) {
      try {
        const style = window.getComputedStyle(el);
        const z = parseInt(style.zIndex, 10);
        if (!isNaN(z) && z >= 2147483000) {
          highZCount++;
          if (z > maxZ) maxZ = z;
        }
      } catch {
        // Ignore
      }
    }
  });

  if (highZCount > 0) {
    issues.push({
      id: "host-css-extreme-z-index",
      category: "host-css",
      severity: "warning",
      title: "Host elements exceed accessibility widget z-index layer",
      message: `Detected ${highZCount} host element(s) with z-index >= 2,147,483,000 (maximum found: ${maxZ}). This may obscure the accessibility launcher or modal panel.`,
      recommendation:
        "Keep host overlay z-indexes below 2,147,483,000 so the accessibility trigger remains accessible.",
      docUrl: `${DOC_BASE_URL}#clean-checkout`,
    });
  }

  return issues;
}

/**
 * Validates DOM landmarks, heading hierarchy, and image alt attributes.
 * NEVER logs private data, auth tokens, or sensitive image sources.
 */
export function checkDomDiagnostics(root: Document | Element): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const doc = root.ownerDocument || (root as Document);
  if (!doc) return issues;

  // 1. Main Landmark
  const mainLandmarks = doc.querySelectorAll("main, [role='main']");
  if (mainLandmarks.length === 0) {
    issues.push({
      id: "dom-missing-main-landmark",
      category: "dom",
      severity: "warning",
      title: "Missing <main> or role='main' landmark",
      message:
        "The document does not have a designated main landmark. Assistive technology users rely on landmarks to bypass repetitive navigation.",
      recommendation:
        "Wrap primary content inside a native <main> element or add role='main'.",
      docUrl: `${DOC_BASE_URL}#manual-accessibility-acceptance-checklist`,
    });
  } else if (mainLandmarks.length > 1) {
    issues.push({
      id: "dom-multiple-main-landmarks",
      category: "dom",
      severity: "info",
      title: "Multiple main landmarks detected",
      message: `Found ${mainLandmarks.length} main landmarks. Ensure only one main landmark is active at any time or use unique aria-label attributes.`,
      recommendation: "Provide a single top-level <main> landmark per document.",
    });
  }

  // 2. Heading hierarchy check
  const headings = Array.from(
    doc.querySelectorAll("h1, h2, h3, h4, h5, h6, [role='heading']"),
  ).filter((h) => !h.closest("[data-arap-ui]"));

  const hasH1 = headings.some((h) => {
    const tag = h.tagName.toLowerCase();
    const ariaLevel = h.getAttribute("aria-level");
    return tag === "h1" || ariaLevel === "1";
  });

  if (headings.length > 0 && !hasH1) {
    issues.push({
      id: "dom-missing-h1",
      category: "dom",
      severity: "warning",
      title: "Missing top-level <h1> heading",
      message:
        "Document contains headings but lacks an <h1>. A primary <h1> heading communicates the page purpose to screen readers.",
      recommendation: "Provide a descriptive <h1> as the document's primary title.",
      docUrl: `${DOC_BASE_URL}#manual-accessibility-acceptance-checklist`,
    });
  }

  // Heading level skipping (e.g. h1 directly to h3)
  let lastLevel = 0;
  let skipped = false;
  for (const h of headings) {
    let level = 0;
    const tagMatch = h.tagName.match(/^H([1-6])$/i);
    if (tagMatch) {
      level = parseInt(tagMatch[1], 10);
    } else {
      const ariaLevel = parseInt(h.getAttribute("aria-level") || "0", 10);
      if (ariaLevel >= 1 && ariaLevel <= 6) level = ariaLevel;
    }
    if (level > 0) {
      if (lastLevel > 0 && level > lastLevel + 1) {
        skipped = true;
        break;
      }
      lastLevel = level;
    }
  }

  if (skipped) {
    issues.push({
      id: "dom-skipped-heading-level",
      category: "dom",
      severity: "info",
      title: "Heading level skipped in outline",
      message:
        "Headings skip one or more structural levels (e.g. <h1> directly to <h3>). This can confuse screen-reader outline navigation.",
      recommendation: "Structure headings sequentially without skipping levels.",
      docUrl: `${DOC_BASE_URL}#manual-accessibility-acceptance-checklist`,
    });
  }

  // 3. Alt attributes on content images (Privacy Safe: no src URLs logged!)
  const images = Array.from(doc.querySelectorAll("img")).filter(
    (img) => !img.closest("[data-arap-ui]"),
  );
  let missingAltCount = 0;

  images.forEach((img) => {
    if (!img.hasAttribute("alt")) {
      missingAltCount++;
    }
  });

  if (missingAltCount > 0) {
    issues.push({
      id: "dom-missing-img-alt",
      category: "dom",
      severity: "warning",
      title: "Images missing alt attribute",
      message: `Detected ${missingAltCount} image(s) lacking an alt attribute. Screen readers may announce unhelpful file paths or raw identifiers.`,
      recommendation:
        "Add a descriptive alt attribute to informative images, or alt='' (with role='presentation') for decorative graphics.",
      docUrl: `${DOC_BASE_URL}#manual-accessibility-acceptance-checklist`,
    });
  }

  return issues;
}

/**
 * Validates boundaries: iframes, shadow DOM, and portal mount points.
 */
export function checkBoundariesDiagnostics(root: Document | Element): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const doc = root.ownerDocument || (root as Document);
  if (!doc) return issues;

  // 1. Iframes
  const iframes = Array.from(doc.querySelectorAll("iframe")).filter(
    (f) => !f.closest("[data-arap-ui]"),
  );
  if (iframes.length > 0) {
    issues.push({
      id: "boundary-iframes-present",
      category: "boundaries",
      severity: "info",
      title: "Embedded iframes detected",
      message: `Detected ${iframes.length} embedded iframe(s). Accessibility preferences (contrast, text scale, reading aids) apply to the top-level document and cannot style cross-origin iframes.`,
      recommendation:
        "Ensure embedded iframes provide their own accessible controls or match host site accessibility guidelines.",
      docUrl: `${DOC_BASE_URL}#clean-checkout`,
    });
  }

  // 2. Shadow DOM detection
  let shadowRootCount = 0;
  const allElements = doc.querySelectorAll("*");
  allElements.forEach((el) => {
    if (el.shadowRoot) shadowRootCount++;
  });

  if (shadowRootCount > 0) {
    issues.push({
      id: "boundary-shadow-dom-present",
      category: "boundaries",
      severity: "info",
      title: "Custom elements with Shadow DOM detected",
      message: `Detected ${shadowRootCount} element(s) with an active ShadowRoot. Scoped CSS custom properties and stylesheet injections will not penetrate closed shadow roots without adoptedStyleSheets.`,
      recommendation:
        "Reference plugin CSS custom properties (e.g. var(--arap-text-scale)) inside web component shadow DOM stylesheets.",
    });
  }

  // 3. Portal mount location
  const widgetPortal = doc.querySelector("[data-arap-portal]");
  if (widgetPortal && widgetPortal.parentElement !== doc.body) {
    issues.push({
      id: "boundary-portal-subnode",
      category: "boundaries",
      severity: "warning",
      title: "Widget portal mounted to sub-body container",
      message:
        "The widget portal is mounted inside an application container rather than directly to <body>. This increases risk of overflow clipping or CSS filter traps.",
      recommendation: "Mount the WidgetPortal directly into document.body.",
      target: sanitizeElementTarget(widgetPortal.parentElement || widgetPortal),
    });
  }

  return issues;
}

/**
 * Executes a full integration diagnostics audit.
 * In production mode, returns an empty report with 0 issues unless force is true.
 */
export function runDiagnostics(config: DiagnosticsConfig = {}): DiagnosticsReport {
  const isProduction =
    typeof process !== "undefined" &&
    process.env &&
    process.env.NODE_ENV === "production";

  if (isProduction && !config.force) {
    return {
      timestamp: Date.now(),
      environment: "production",
      disclaimer: DIAGNOSTICS_DISCLAIMER,
      summary: { total: 0, errors: 0, warnings: 0, info: 0 },
      issues: [],
    };
  }

  const root =
    config.root ||
    (typeof document !== "undefined" ? document : null);

  if (!root) {
    return {
      timestamp: Date.now(),
      environment: isProduction ? "production" : "test",
      disclaimer: DIAGNOSTICS_DISCLAIMER,
      summary: { total: 0, errors: 0, warnings: 0, info: 0 },
      issues: [],
    };
  }

  const requestedCategories = new Set(
    config.categories ?? [
      "provider",
      "storage",
      "csp",
      "host-css",
      "dom",
      "boundaries",
      "effects",
    ],
  );

  const allIssues: DiagnosticIssue[] = [];

  if (requestedCategories.has("provider")) {
    allIssues.push(...checkProviderDiagnostics(root));
  }
  if (requestedCategories.has("storage")) {
    allIssues.push(...checkStorageDiagnostics());
  }
  if (requestedCategories.has("csp")) {
    allIssues.push(...checkCspDiagnostics(root));
  }
  if (requestedCategories.has("host-css")) {
    allIssues.push(...checkHostCssDiagnostics(root));
  }
  if (requestedCategories.has("dom")) {
    allIssues.push(...checkDomDiagnostics(root));
  }
  if (requestedCategories.has("boundaries")) {
    allIssues.push(...checkBoundariesDiagnostics(root));
  }

  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warning").length;
  const info = allIssues.filter((i) => i.severity === "info").length;

  const report: DiagnosticsReport = {
    timestamp: Date.now(),
    environment: isProduction ? "production" : "development",
    disclaimer: DIAGNOSTICS_DISCLAIMER,
    summary: {
      total: allIssues.length,
      errors,
      warnings,
      info,
    },
    issues: allIssues,
  };

  if (config.logToConsole !== false && typeof console !== "undefined" && allIssues.length > 0) {
    logDiagnosticsToConsole(report);
  }

  if (config.onReport) {
    try {
      config.onReport(report);
    } catch {
      // Prevent callback exceptions from impacting application runtime
    }
  }

  return report;
}

/**
 * Developer console logging formatted in a collapsed group.
 */
function logDiagnosticsToConsole(report: DiagnosticsReport): void {
  if (typeof console === "undefined" || !console.groupCollapsed) return;

  const { total, errors, warnings } = report.summary;
  const badge = `[accessibility-plugin] Diagnostics: ${total} issue(s) (${errors} error(s), ${warnings} warning(s))`;

  console.groupCollapsed(badge);
  console.info(`%c${report.disclaimer}`, "color: #64748b; font-style: italic;");

  for (const issue of report.issues) {
    const prefix = `[${issue.category.toUpperCase()}] ${issue.title}:`;
    if (issue.severity === "error") {
      console.error(prefix, issue.message, `\n-> Fix: ${issue.recommendation}`);
    } else if (issue.severity === "warning") {
      console.warn(prefix, issue.message, `\n-> Fix: ${issue.recommendation}`);
    } else {
      console.info(prefix, issue.message, `\n-> Info: ${issue.recommendation}`);
    }
  }

  console.groupEnd();
}
