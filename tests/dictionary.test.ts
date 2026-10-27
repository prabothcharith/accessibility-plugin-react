import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  sanitizeLookupTerm,
  lookupLocalDictionary,
  lookupWord,
  type DictionaryProvider,
} from "../src/core/dictionary";

describe("A11Y-403: Dictionary Core & Sanitization", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Sanitization & Sensitive Data Rejection", () => {
    it("strips HTML tags and excessive whitespace", () => {
      const res = sanitizeLookupTerm("  <b>Accessibility</b>  ");
      expect(res.valid).toBe(true);
      expect(res.sanitized).toBe("accessibility");
    });

    it("rejects empty or whitespace-only terms", () => {
      const res = sanitizeLookupTerm("   ");
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/enter a (word|term)/i);
    });

    it("rejects terms exceeding 50 characters", () => {
      const longTerm = "a".repeat(55);
      const res = sanitizeLookupTerm(longTerm);
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/50 characters/i);
    });

    it("rejects credit card numbers", () => {
      const res = sanitizeLookupTerm("4532-1234-5678-9012");
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/sensitive/i);
    });

    it("rejects email addresses", () => {
      const res = sanitizeLookupTerm("user@example.com");
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/sensitive/i);
    });

    it("rejects bearer tokens and API keys", () => {
      const res = sanitizeLookupTerm("bearer eyJhbGciOi...");
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/sensitive/i);
    });

    it("rejects URLs", () => {
      const res = sanitizeLookupTerm("https://example.com/api");
      expect(res.valid).toBe(false);
      expect(res.error).toMatch(/sensitive/i);
    });

    it("normalizes punctuation around words", () => {
      const res = sanitizeLookupTerm('"contrast"!');
      expect(res.valid).toBe(true);
      expect(res.sanitized).toBe("contrast");
    });
  });

  describe("Local Glossary & Zero Network Guarantee", () => {
    it("guarantees ZERO network requests when looking up local terms", async () => {
      const result = await lookupWord("accessibility");
      expect(result.found).toBe(true);
      expect(result.entry?.word).toBe("accessibility");
      expect(result.entry?.source).toBe("local");
      expect(fetch).not.toHaveBeenCalled();
    });

    it("finds English terms accurately", () => {
      const res = lookupLocalDictionary("contrast", "en");
      expect(res.found).toBe(true);
      expect(res.entry?.definition).toContain("luminance");
      expect(res.entry?.source).toBe("local");
    });

    it("finds Sinhala terms or falls back to English when queried in Sinhala", () => {
      const resSi = lookupLocalDictionary("ප්‍රවේශ්‍යතාව", "si");
      expect(resSi.found).toBe(true);
      expect(resSi.entry?.definition).toBeDefined();

      const resFallback = lookupLocalDictionary("accessibility", "si");
      expect(resFallback.found).toBe(true);
      expect(resFallback.entry?.word).toBe("accessibility");
    });

    it("finds Tamil terms or falls back to English when queried in Tamil", () => {
      const resTa = lookupLocalDictionary("அணுகல்தன்மை", "ta");
      expect(resTa.found).toBe(true);
      expect(resTa.entry?.definition).toBeDefined();
    });

    it("truthfully returns found=false without hallucinating for unknown words", async () => {
      const result = await lookupWord("nonexistentwordxyz123");
      expect(result.found).toBe(false);
      expect(result.entry).toBeUndefined();
      expect(fetch).not.toHaveBeenCalled();
    });

    it("provides relevant suggestions when term is partially matched", () => {
      const result = lookupLocalDictionary("access");
      expect(result.found).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions).toContain("accessibility");
    });
  });

  describe("Provider Interface & Rate Limiting", () => {
    it("calls configured provider when supplied", async () => {
      const customProvider: DictionaryProvider = {
        id: "test-provider",
        name: "Test Remote Provider",
        lookup: vi.fn().mockResolvedValue({
          found: true,
          entry: {
            word: "customterm",
            definition: "A custom definition from remote API.",
            source: "provider",
          },
        }),
      };

      const result = await lookupWord("customterm", { provider: customProvider });
      expect(customProvider.lookup).toHaveBeenCalledWith("customterm", "en");
      expect(result.found).toBe(true);
      expect(result.entry?.definition).toBe("A custom definition from remote API.");
      expect(result.entry?.source).toBe("provider");
    });

    it("enforces rate limits on consecutive provider calls", async () => {
      const mockLookup = vi.fn().mockResolvedValue({
        found: true,
        entry: { word: "fast", definition: "Quick", source: "provider" },
      });

      const rateLimitedProvider: DictionaryProvider = {
        id: "rate-limited-provider",
        name: "Rate Limited Provider",
        rateLimitMs: 500,
        lookup: mockLookup,
      };

      // First call succeeds
      const res1 = await lookupWord("fast", { provider: rateLimitedProvider });
      expect(res1.found).toBe(true);

      // Immediate second call should be rate-limited
      const res2 = await lookupWord("fast", { provider: rateLimitedProvider });
      expect(res2.found).toBe(false);
      expect(res2.error).toMatch(/wait a moment/i);
    });

    it("falls back to local dictionary gracefully when provider throws error", async () => {
      const failingProvider: DictionaryProvider = {
        id: "failing-provider",
        name: "Failing Provider",
        lookup: vi.fn().mockRejectedValue(new Error("Network timeout")),
      };

      // "focus" exists in local dictionary
      const result = await lookupWord("focus", { provider: failingProvider });
      expect(result.found).toBe(true);
      expect(result.entry?.word).toBe("focus");
      expect(result.entry?.source).toBe("local");
    });
  });
});
