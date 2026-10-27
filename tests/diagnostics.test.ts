import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  runDiagnostics,
  checkProviderDiagnostics,
  checkStorageDiagnostics,
  checkCspDiagnostics,
  checkHostCssDiagnostics,
  checkDomDiagnostics,
  checkBoundariesDiagnostics,
  DIAGNOSTICS_DISCLAIMER,
} from "../src/core/diagnostics";

describe("Integration Diagnostics Engine (A11Y-405)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-host-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    // Clean up any rogue elements
    document.body.innerHTML = "";
  });

  describe("Disclaimer and Privacy Guarantees", () => {
    it("includes standard compliance disclaimer on every report", () => {
      const report = runDiagnostics({ force: true, logToConsole: false });
      expect(report.disclaimer).toBe(DIAGNOSTICS_DISCLAIMER);
      expect(report.disclaimer).toContain("do not constitute official WCAG");
    });

    it("does not leak private query parameters or sensitive data in image alt diagnostics", () => {
      container.innerHTML = `
        <main>
          <h1>Test Title</h1>
          <img src="https://example.com/avatar.jpg?token=secret123&user=john_doe" />
        </main>
      `;

      const issues = checkDomDiagnostics(document);
      const altIssue = issues.find((i) => i.id === "dom-missing-img-alt");
      expect(altIssue).toBeDefined();
      expect(altIssue?.message).not.toContain("secret123");
      expect(altIssue?.message).not.toContain("john_doe");
      expect(altIssue?.message).not.toContain("token=");
    });
  });

  describe("Provider and Widget Placement Diagnostics", () => {
    it("reports warning when multiple widget instances exist", () => {
      container.innerHTML = `
        <div data-arap-ui="1">Widget 1</div>
        <div data-arap-ui="2">Widget 2</div>
        <div data-arap-ui="3">Widget 3</div>
      `;
      const issues = checkProviderDiagnostics(document);
      const multiIssue = issues.find(
        (i) => i.id === "provider-multiple-instances",
      );
      expect(multiIssue).toBeDefined();
      expect(multiIssue?.severity).toBe("warning");
    });

    it("reports error when widget is trapped inside a transformed/filtered ancestor", () => {
      const trap = document.createElement("div");
      trap.id = "hero-trap";
      // Mock computed style by applying style properties
      trap.style.transform = "translate3d(0, 0, 0)";
      trap.innerHTML = `
        <div class="arap-btn" data-arap-widget="true">Trigger</div>
      `;
      container.appendChild(trap);

      // jsdom getComputedStyle returns style properties
      const issues = checkProviderDiagnostics(document);
      const trapIssue = issues.find(
        (i) => i.id === "provider-fixed-position-trap",
      );
      expect(trapIssue).toBeDefined();
      expect(trapIssue?.severity).toBe("error");
      expect(trapIssue?.target).toContain("#hero-trap");
    });
  });

  describe("Storage Diagnostics", () => {
    it("validates accessible localStorage without errors", () => {
      const issues = checkStorageDiagnostics();
      const storageBlocked = issues.find(
        (i) => i.id === "storage-local-blocked",
      );
      expect(storageBlocked).toBeUndefined();
    });

    it("catches blocked localStorage gracefully", () => {
      const spy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementation(() => {
          throw new Error("QuotaExceededError or SecurityError");
        });

      try {
        const issues = checkStorageDiagnostics();
        const storageBlocked = issues.find(
          (i) => i.id === "storage-local-blocked",
        );
        expect(storageBlocked).toBeDefined();
        expect(storageBlocked?.severity).toBe("warning");
        expect(storageBlocked?.recommendation).toContain("third-party storage");
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe("CSP and Style Injection Diagnostics", () => {
    it("verifies stylesheet injection succeeds in normal environment", () => {
      const issues = checkCspDiagnostics(document);
      const cspBlocked = issues.find(
        (i) => i.id === "csp-style-injection-blocked",
      );
      expect(cspBlocked).toBeUndefined();
    });

    it("detects blocked style injection when createElement throws or rejects append", () => {
      const origAppendChild = document.head.appendChild;
      document.head.appendChild = () => {
        throw new Error("Refused to apply inline style because of CSP");
      };

      try {
        const issues = checkCspDiagnostics(document);
        const cspIssue = issues.find(
          (i) => i.id === "csp-style-injection-blocked",
        );
        expect(cspIssue).toBeDefined();
        expect(cspIssue?.severity).toBe("error");
        expect(cspIssue?.title).toContain("Content Security Policy");
      } finally {
        document.head.appendChild = origAppendChild;
      }
    });
  });

  describe("Host CSS Diagnostics", () => {
    it("detects root overflow:hidden on both html and body", () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";

      try {
        const issues = checkHostCssDiagnostics(document);
        const overflowIssue = issues.find(
          (i) => i.id === "host-css-root-overflow-hidden",
        );
        expect(overflowIssue).toBeDefined();
        expect(overflowIssue?.severity).toBe("warning");
      } finally {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      }
    });

    it("detects extreme z-index on host elements that obscure widget", () => {
      const overlay = document.createElement("div");
      overlay.id = "bad-overlay";
      overlay.style.zIndex = "2147483647";
      container.appendChild(overlay);

      const issues = checkHostCssDiagnostics(document);
      const zIssue = issues.find((i) => i.id === "host-css-extreme-z-index");
      expect(zIssue).toBeDefined();
      expect(zIssue?.severity).toBe("warning");
      expect(zIssue?.message).toContain("2,147,483,000");
    });
  });

  describe("DOM Landmark and Structure Diagnostics", () => {
    it("reports warning when main landmark is missing", () => {
      container.innerHTML = `<div><p>No main here</p></div>`;
      const issues = checkDomDiagnostics(document);
      const mainIssue = issues.find(
        (i) => i.id === "dom-missing-main-landmark",
      );
      expect(mainIssue).toBeDefined();
      expect(mainIssue?.severity).toBe("warning");
    });

    it("passes when a valid <main> landmark exists", () => {
      container.innerHTML = `<main><h1>Heading</h1><p>Content</p></main>`;
      const issues = checkDomDiagnostics(document);
      const mainIssue = issues.find(
        (i) => i.id === "dom-missing-main-landmark",
      );
      expect(mainIssue).toBeUndefined();
    });

    it("reports warning when <h1> is missing in document with headings", () => {
      container.innerHTML = `<main><h2>Subtitle</h2><h3>Section</h3></main>`;
      const issues = checkDomDiagnostics(document);
      const h1Issue = issues.find((i) => i.id === "dom-missing-h1");
      expect(h1Issue).toBeDefined();
    });

    it("reports info when heading levels are skipped (e.g. h1 to h3)", () => {
      container.innerHTML = `<main><h1>Title</h1><h3>Skipped h2</h3></main>`;
      const issues = checkDomDiagnostics(document);
      const skipIssue = issues.find(
        (i) => i.id === "dom-skipped-heading-level",
      );
      expect(skipIssue).toBeDefined();
    });

    it("reports warning for images lacking alt attribute", () => {
      container.innerHTML = `
        <main>
          <h1>Title</h1>
          <img src="pic1.jpg" alt="Valid alt" />
          <img src="pic2.jpg" />
        </main>
      `;
      const issues = checkDomDiagnostics(document);
      const altIssue = issues.find((i) => i.id === "dom-missing-img-alt");
      expect(altIssue).toBeDefined();
      expect(altIssue?.message).toContain("1 image(s)");
    });
  });

  describe("Boundaries: Iframes, Shadow DOM, and Portals", () => {
    it("detects embedded iframes and notes boundaries", () => {
      container.innerHTML = `
        <main>
          <h1>Title</h1>
          <iframe title="Widget frame" src="about:blank"></iframe>
        </main>
      `;
      const issues = checkBoundariesDiagnostics(document);
      const iframeIssue = issues.find(
        (i) => i.id === "boundary-iframes-present",
      );
      expect(iframeIssue).toBeDefined();
      expect(iframeIssue?.message).toContain("1 embedded iframe(s)");
    });

    it("detects elements with active Shadow DOM", () => {
      const customEl = document.createElement("div");
      if (customEl.attachShadow) {
        customEl.attachShadow({ mode: "open" });
        container.appendChild(customEl);

        const issues = checkBoundariesDiagnostics(document);
        const shadowIssue = issues.find(
          (i) => i.id === "boundary-shadow-dom-present",
        );
        expect(shadowIssue).toBeDefined();
        expect(shadowIssue?.title).toContain("Shadow DOM");
      }
    });

    it("warns if widget portal is mounted to a non-body container", () => {
      const nestedWrapper = document.createElement("div");
      nestedWrapper.id = "sub-root";
      const portal = document.createElement("div");
      portal.setAttribute("data-arap-portal", "true");
      nestedWrapper.appendChild(portal);
      container.appendChild(nestedWrapper);

      const issues = checkBoundariesDiagnostics(document);
      const portalIssue = issues.find(
        (i) => i.id === "boundary-portal-subnode",
      );
      expect(portalIssue).toBeDefined();
      expect(portalIssue?.severity).toBe("warning");
    });
  });

  describe("runDiagnostics Options and Execution", () => {
    it("returns summary counts matching issues array", () => {
      container.innerHTML = `
        <div>
          <h2>No H1</h2>
          <img src="pic.jpg" />
        </div>
      `;
      const report = runDiagnostics({ force: true, logToConsole: false });
      expect(report.summary.total).toBe(report.issues.length);
      expect(report.summary.errors).toBe(
        report.issues.filter((i) => i.severity === "error").length,
      );
      expect(report.summary.warnings).toBe(
        report.issues.filter((i) => i.severity === "warning").length,
      );
    });

    it("invokes onReport callback when provided", () => {
      let called = false;
      runDiagnostics({
        force: true,
        logToConsole: false,
        onReport: (rep) => {
          called = true;
          expect(rep.disclaimer).toBeDefined();
        },
      });
      expect(called).toBe(true);
    });

    it("respects category filter when requested", () => {
      container.innerHTML = `
        <div>
          <img src="no-alt.jpg" />
          <iframe src="about:blank"></iframe>
        </div>
      `;
      const report = runDiagnostics({
        force: true,
        logToConsole: false,
        categories: ["dom"],
      });
      expect(report.issues.every((i) => i.category === "dom")).toBe(true);
    });
  });
});
