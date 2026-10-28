import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { isSensitiveElement } from "../src/core/translationAdapter";

describe("A11Y-504: Dependency, license and security audit", () => {
  it("verifies package.json has zero runtime dependencies and only peerDependencies", () => {
    const pkgJsonPath = path.resolve(__dirname, "../package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));

    // Library must have zero runtime dependencies
    expect(pkg.dependencies).toBeUndefined();

    // Must have React & React DOM as peer dependencies
    expect(pkg.peerDependencies).toBeDefined();
    expect(pkg.peerDependencies.react).toBeDefined();
    expect(pkg.peerDependencies["react-dom"]).toBeDefined();

    // License must be ISC
    expect(pkg.license).toBe("ISC");
  });

  it("verifies LICENSE and NOTICE files exist with correct copyright and terms", () => {
    const licensePath = path.resolve(__dirname, "../LICENSE");
    const noticePath = path.resolve(__dirname, "../NOTICE");

    expect(fs.existsSync(licensePath)).toBe(true);
    expect(fs.existsSync(noticePath)).toBe(true);

    const licenseContent = fs.readFileSync(licensePath, "utf8");
    const noticeContent = fs.readFileSync(noticePath, "utf8");

    expect(licenseContent).toContain("ISC License");
    expect(licenseContent).toContain("Praboth Charith");
    expect(noticeContent).toContain("Copyright (c) 2026 Praboth Charith");
    expect(noticeContent).toContain("Zero Runtime Dependencies");
  });

  it("scans all src/ source files to ensure zero eval, Function constructor, or remote network calls", () => {
    const srcDir = path.resolve(__dirname, "../src");

    function getAllFiles(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          results = results.concat(getAllFiles(fullPath));
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
          results.push(fullPath);
        }
      }
      return results;
    }

    const files = getAllFiles(srcDir);
    expect(files.length).toBeGreaterThan(10);

    for (const filePath of files) {
      const code = fs.readFileSync(filePath, "utf8");

      // Verify no dynamic script execution
      expect(code).not.toMatch(/\beval\s*\(/);
      expect(code).not.toMatch(/new\s+Function\s*\(/);

      // Verify no direct fetch() network requests
      expect(code).not.toMatch(/\bfetch\s*\(/);

      // Verify no direct XMLHttpRequest calls
      expect(code).not.toMatch(/new\s+XMLHttpRequest\s*\(/);

      // Verify no navigator.sendBeacon
      expect(code).not.toMatch(/navigator\.sendBeacon/);

      // Verify no WebSocket connections
      expect(code).not.toMatch(/new\s+WebSocket\s*\(/);
    }
  });

  it("validates isSensitiveElement accurately flags credentials, financial data, and code elements", () => {
    // Passwords
    const passwordInput = document.createElement("input");
    passwordInput.type = "password";
    expect(isSensitiveElement(passwordInput)).toBe(true);

    // Credit cards
    const ccInput = document.createElement("input");
    ccInput.setAttribute("autocomplete", "cc-number");
    expect(isSensitiveElement(ccInput)).toBe(true);

    // Code blocks
    const codeEl = document.createElement("code");
    expect(isSensitiveElement(codeEl)).toBe(true);

    const preEl = document.createElement("pre");
    expect(isSensitiveElement(preEl)).toBe(true);

    // Explicit opt-out
    const optOut = document.createElement("div");
    optOut.setAttribute("translate", "no");
    expect(isSensitiveElement(optOut)).toBe(true);

    // Standard readable paragraph
    const normalP = document.createElement("p");
    normalP.textContent = "Accessible website content";
    expect(isSensitiveElement(normalP)).toBe(false);
  });
});
