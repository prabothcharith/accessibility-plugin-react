import { describe, it, expect, beforeEach } from "vitest";
import {
  isSensitiveElement,
  extractTranslatableNodes,
  sanitizeTranslationOutput,
  applyTranslations,
  createOfflineMockTranslationAdapter,
  translateHostContent,
  TRANSLATION_ERROR_CODES,
  TranslationError,
  type TranslationConsentRecord,
} from "../src/core/translationAdapter";

describe("A11Y-409: Host-Content Translation Adapter Architecture", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  describe("Sensitive Element & Boundary Detection", () => {
    it("identifies technical and code elements as sensitive", () => {
      const codeEl = document.createElement("code");
      const preEl = document.createElement("pre");
      const scriptEl = document.createElement("script");
      const styleEl = document.createElement("style");
      const kbdEl = document.createElement("kbd");

      expect(isSensitiveElement(codeEl)).toBe(true);
      expect(isSensitiveElement(preEl)).toBe(true);
      expect(isSensitiveElement(scriptEl)).toBe(true);
      expect(isSensitiveElement(styleEl)).toBe(true);
      expect(isSensitiveElement(kbdEl)).toBe(true);
    });

    it("identifies media and cross-origin iframe boundaries as sensitive", () => {
      const iframeEl = document.createElement("iframe");
      const svgEl = document.createElement("svg");
      const canvasEl = document.createElement("canvas");
      const videoEl = document.createElement("video");

      expect(isSensitiveElement(iframeEl)).toBe(true);
      expect(isSensitiveElement(svgEl)).toBe(true);
      expect(isSensitiveElement(canvasEl)).toBe(true);
      expect(isSensitiveElement(videoEl)).toBe(true);
    });

    it("identifies form passwords, financial inputs, and credentials as sensitive", () => {
      const passwordInput = document.createElement("input");
      passwordInput.setAttribute("type", "password");

      const creditCardInput = document.createElement("input");
      creditCardInput.setAttribute("autocomplete", "cc-number");

      const hiddenInput = document.createElement("input");
      hiddenInput.setAttribute("type", "hidden");

      expect(isSensitiveElement(passwordInput)).toBe(true);
      expect(isSensitiveElement(creditCardInput)).toBe(true);
      expect(isSensitiveElement(hiddenInput)).toBe(true);
    });

    it("identifies explicit opt-out markers as sensitive", () => {
      const translateNo = document.createElement("div");
      translateNo.setAttribute("translate", "no");

      const dataSensitive = document.createElement("span");
      dataSensitive.setAttribute("data-sensitive", "true");

      const noTranslateClass = document.createElement("p");
      noTranslateClass.className = "notranslate";

      expect(isSensitiveElement(translateNo)).toBe(true);
      expect(isSensitiveElement(dataSensitive)).toBe(true);
      expect(isSensitiveElement(noTranslateClass)).toBe(true);
    });

    it("protects widget UI elements from host translation extraction", () => {
      const widgetContainer = document.createElement("div");
      widgetContainer.setAttribute("data-arap-portal", "true");
      const widgetChild = document.createElement("span");
      widgetContainer.appendChild(widgetChild);

      expect(isSensitiveElement(widgetChild)).toBe(true);
    });

    it("permits standard accessible article text and headings", () => {
      const p = document.createElement("p");
      const h1 = document.createElement("h1");
      const li = document.createElement("li");

      expect(isSensitiveElement(p)).toBe(false);
      expect(isSensitiveElement(h1)).toBe(false);
      expect(isSensitiveElement(li)).toBe(false);
    });
  });

  describe("extractTranslatableNodes", () => {
    it("extracts text nodes while ignoring sensitive and empty nodes", () => {
      const container = document.createElement("div");
      container.innerHTML = `
        <h1>Accessible Heading</h1>
        <p>First paragraph of text.</p>
        <pre><code>console.log("Ignore code");</code></pre>
        <p translate="no">Do not translate this.</p>
        <div>
          <span>Nested content item.</span>
        </div>
      `;
      document.body.appendChild(container);

      const nodes = extractTranslatableNodes(container);
      const texts = nodes.map((n) => n.originalText.trim());

      expect(texts).toContain("Accessible Heading");
      expect(texts).toContain("First paragraph of text.");
      expect(texts).toContain("Nested content item.");
      expect(texts).not.toContain('console.log("Ignore code");');
      expect(texts).not.toContain("Do not translate this.");
    });

    it("respects maxNodes limit", () => {
      const container = document.createElement("div");
      for (let i = 0; i < 20; i++) {
        const p = document.createElement("p");
        p.textContent = `Paragraph item number ${i}`;
        container.appendChild(p);
      }
      document.body.appendChild(container);

      const nodes = extractTranslatableNodes(container, 5);
      expect(nodes.length).toBe(5);
    });
  });

  describe("sanitizeTranslationOutput", () => {
    it("strips control characters and null bytes", () => {
      const raw = "Clean translated\u0000 text\u001F here";
      const sanitized = sanitizeTranslationOutput(raw);
      expect(sanitized).toBe("Clean translated text here");
    });

    it("returns empty string for falsy input", () => {
      expect(sanitizeTranslationOutput("")).toBe("");
    });
  });

  describe("applyTranslations & Teardown", () => {
    it("applies translations to text nodes and restores them cleanly", () => {
      const p1 = document.createElement("p");
      p1.textContent = "Welcome to our website";
      const p2 = document.createElement("p");
      p2.textContent = "Learn about our services";
      document.body.appendChild(p1);
      document.body.appendChild(p2);

      const node1 = p1.firstChild as Text;
      const node2 = p2.firstChild as Text;

      const translatableNodes = [
        {
          node: node1,
          originalText: "Welcome to our website",
          parentElement: p1,
        },
        {
          node: node2,
          originalText: "Learn about our services",
          parentElement: p2,
        },
      ];

      const restore = applyTranslations(translatableNodes, [
        "Bienvenido a nuestro sitio web",
        "Aprenda sobre nuestros servicios",
      ]);

      expect(p1.textContent).toBe("Bienvenido a nuestro sitio web");
      expect(p2.textContent).toBe("Aprenda sobre nuestros servicios");

      // Idempotent restoration
      restore();
      expect(p1.textContent).toBe("Welcome to our website");
      expect(p2.textContent).toBe("Learn about our services");

      restore(); // Second call has no negative effect
      expect(p1.textContent).toBe("Welcome to our website");
    });
  });

  describe("createOfflineMockTranslationAdapter", () => {
    it("translates without network requests using offline prefix", async () => {
      const adapter = createOfflineMockTranslationAdapter({
        prefix: "[TEST]",
        latencyMs: 0,
      });

      expect(adapter.id).toBe("offline-mock-adapter");
      expect(adapter.dataRetention).toBe("none");
      expect(adapter.dataResidency).toBe("client-only");

      const res = await adapter.translate({
        texts: ["Hello world", "Accessibility matters"],
        targetLanguage: "es",
      });

      expect(res.translations.length).toBe(2);
      expect(res.translations[0].translated).toBe("[TEST] Hello world");
      expect(res.translations[1].translated).toBe(
        "[TEST] Accessibility matters",
      );
    });

    it("aborts when AbortSignal is cancelled", async () => {
      const adapter = createOfflineMockTranslationAdapter({ latencyMs: 20 });
      const controller = new AbortController();
      controller.abort();

      await expect(
        adapter.translate({
          texts: ["Test text"],
          targetLanguage: "es",
          signal: controller.signal,
        }),
      ).rejects.toThrow(TranslationError);
    });
  });

  describe("translateHostContent coordinator", () => {
    it("throws CONSENT_REQUIRED if consent status is not granted", async () => {
      const adapter = createOfflineMockTranslationAdapter({ latencyMs: 0 });
      const consentRecord: TranslationConsentRecord = {
        status: "unprompted",
        userAcknowledgedRisks: false,
      };

      await expect(
        translateHostContent({
          provider: adapter,
          targetLanguage: "es",
          consentRecord,
        }),
      ).rejects.toThrow(TranslationError);

      try {
        await translateHostContent({
          provider: adapter,
          targetLanguage: "es",
          consentRecord,
        });
      } catch (err) {
        expect((err as TranslationError).code).toBe(
          TRANSLATION_ERROR_CODES.CONSENT_REQUIRED,
        );
      }
    });

    it("throws UNSUPPORTED_LANGUAGE if target language is not supported by provider", async () => {
      const adapter = createOfflineMockTranslationAdapter({
        latencyMs: 0,
        supportedLanguages: ["es", "fr"],
      });
      const consentRecord: TranslationConsentRecord = {
        status: "granted",
        userAcknowledgedRisks: true,
      };

      await expect(
        translateHostContent({
          provider: adapter,
          targetLanguage: "zh",
          consentRecord,
        }),
      ).rejects.toThrow(TranslationError);
    });

    it("translates DOM nodes and provides a functioning restore callback in session", async () => {
      const p = document.createElement("p");
      p.textContent = "Accessible web application";
      document.body.appendChild(p);

      const adapter = createOfflineMockTranslationAdapter({
        latencyMs: 0,
        prefix: "[ES]",
      });
      const consentRecord: TranslationConsentRecord = {
        status: "granted",
        userAcknowledgedRisks: true,
      };

      const session = await translateHostContent({
        rootElement: document.body,
        provider: adapter,
        targetLanguage: "es",
        consentRecord,
      });

      expect(session.active).toBe(true);
      expect(session.translatedCount).toBe(1);
      expect(p.textContent).toBe("[ES] Accessible web application");

      session.restore();
      expect(p.textContent).toBe("Accessible web application");
    });
  });
});
