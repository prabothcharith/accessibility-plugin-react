# Milestone 5 Release Proposal & Semantic Version Recommendation

**Date:** 2026-10-28  
**Scope:** Milestone 5 — Launch readiness and package hardening (Issues #66, #67, #68, #69, #70, #71)  
**Parent Trackers:** [Issue #27](https://github.com/prabothcharith/accessibility-plugin-react/issues/27), [Issue #15](https://github.com/prabothcharith/accessibility-plugin-react/issues/15), [Issue #21](https://github.com/prabothcharith/accessibility-plugin-react/issues/21)  
**Current Registry State:** `accessibility-plugin-react@2.28.0` on npm under tag `latest`  

---

## 1. Executive Summary

Milestone 5 focused on comprehensive package hardening, multi-browser and device matrix verification, runtime profiling, security and dependency auditing, documentation synchronization, and clean consumer publish rehearsals.

All six Milestone 5 sub-issues have completed all functional, programmatic, and integration requirements:
- **A11Y-501 (Issue #66):** Full supported-browser, device, and assistive-technology matrix (`docs/SUPPORTED_MATRIX.md`).
- **A11Y-502 (Issue #67):** Performance, bundle, listener, and leak profiling (`docs/PERFORMANCE_PROFILING.md`).
- **A11Y-503 (Issue #68):** Documentation website, API reference, and interactive examples (`CONTRIBUTING.md`, `docs/API.md`, `docs/FEATURES.md`, examples).
- **A11Y-504 (Issue #69):** Dependency, license, CSP, and security audit (`NOTICE`, `docs/SECURITY_AUDIT.md`, `tests/securityAudit.test.ts`).
- **A11Y-505 (Issue #70):** Packed publish rehearsal and clean consumer smoke testing (`docs/PUBLISH_REHEARSAL.md`).
- **A11Y-506 (Issue #71):** Version recommendation, changelog, and owner-approved release proposal (this document).

This document reviews the complete verification evidence, evaluates semantic versioning options, reconciles legacy release trackers, and provides an owner decision checklist. In accordance with repository governance rules, **no publish, tag, or default-branch merge is performed without explicit owner authorization**.

---

## 2. Milestone 5 Verification Evidence

| Issue | Area | Verification Artifacts | Status | Results & Key Metrics |
|---|---|---|---|---|
| **#66 (A11Y-501)** | Supported Matrix & AT | `docs/SUPPORTED_MATRIX.md`<br>`tests/browser/widget.spec.ts` | **PASS** | • Verified Chromium, Firefox, WebKit, Mobile WebKit, Android emulation.<br>• 400% zoom reflow at 320px CSS viewport width verified without clipping.<br>• Forced-colors protection (`forced-colors: active`) verified.<br>• $\ge 44\text{px} \times 44\text{px}$ touch targets verified across all controls.<br>• Zero universal WCAG claims; automated tests establish semantics, human testing mandatory. |
| **#67 (A11Y-502)** | Performance & Leaks | `docs/PERFORMANCE_PROFILING.md`<br>`tests/performanceProfiling.test.tsx` | **PASS** | • Distribution bundle: ESM `index.mjs` 603 KB raw / 111 KB gzip; CSS 71 KB raw / 11 KB gzip.<br>• React 18 consumer application bundle: 130 KB gzip.<br>• Closed idle runtime: 0 unthrottled pointer listeners, 0 RAF loops, 0 timers.<br>• 1,000-node DOM scaling: multi-feature application & reset under heavy parallel CPU.<br>• 100 mount/unmount & toggle cycles: 0 leaked DOM nodes, 0 leaked styles, 0 memory drift. |
| **#68 (A11Y-503)** | Documentation & Examples | `CONTRIBUTING.md`<br>`docs/API.md`<br>`docs/FEATURES.md`<br>`examples/*` | **PASS** | • Added `CONTRIBUTING.md` with PR guidelines, coding conventions, and a11y bounds.<br>• Synchronized `docs/API.md` with complete components table and exported types.<br>• Synchronized `docs/FEATURES.md` with Smart Contrast prototype documentation.<br>• Updated `examples/basic-usage` and `examples/next-app` with all prebuilt controllers. |
| **#69 (A11Y-504)** | Security & Licenses | `NOTICE`<br>`docs/SECURITY_AUDIT.md`<br>`tests/securityAudit.test.ts` | **PASS** | • 0 runtime dependencies (`dependencies: {}`); 0 `npm audit` vulnerabilities.<br>• Added `NOTICE` attributing ISC license, historical origins, and assets.<br>• Strict CSP compliance: 0 dynamic `eval`, 0 `Function()`, 0 inline script injections.<br>• Strict privacy: 0 network telemetry, 0 analytics, 0 audio/transcript transmission.<br>• Sensitive data protection: automatic credential/password exclusion (`isSensitiveElement`). |
| **#70 (A11Y-505)** | Publish Rehearsal | `docs/PUBLISH_REHEARSAL.md`<br>`scripts/check-package.mjs` | **PASS** | • Exact tarball `.consumers/package.tgz`: 61 files, 1.18 MB unpacked; includes `NOTICE`.<br>• Clean consumer installations passed in React 18.3.1, React 19.2.0, and Next.js 16.0.0.<br>• Zero SSR hydration mismatches; clean production builds generated across all consumers. |

---

## 3. Semantic Versioning Analysis & Recommendation

### Contract & Scope Evaluation

1. **Backwards Compatibility:**
   - All public contracts established in version 2.0.0 remain 100% backwards-compatible.
   - Zero deprecated APIs were removed; zero existing prop types, function signatures, or CSS custom properties were altered in breaking ways.
   - Therefore, a major version bump (`3.0.0`) is **not warranted**.

2. **Milestone 5 Additions:**
   - Milestone 5 added legal packaging (`NOTICE` bundled into the npm archive), extensive documentation (`docs/SUPPORTED_MATRIX.md`, `docs/PERFORMANCE_PROFILING.md`, `docs/SECURITY_AUDIT.md`, `docs/PUBLISH_REHEARSAL.md`, `CONTRIBUTING.md`), new regression and profiling test suites (`tests/performanceProfiling.test.tsx`, `tests/securityAudit.test.ts`), and package verification scripts (`scripts/check-package.mjs`).
   - The underlying library runtime code remains identical to the stabilized v2.28.0 release.

### Version Recommendation

We present two valid options for the owner's authorization:

- **Option A (Recommended): Version `2.29.0` (Minor Release)**
  - *Rationale:* SemVer convention often treats milestone completion and legal attribution additions (`NOTICE` in tarball files) as a minor increment signifying a hardened, launch-ready milestone milestone release. It clearly demarcates the pre-hardening releases (2.28.0 and earlier) from the fully profiled, audited, and matrix-verified release.
  - *Publish target:* npm tag `latest`.

- **Option B: Version `2.28.1` (Patch Release)**
  - *Rationale:* If the owner strictly interprets SemVer to require new public runtime API functions for a minor bump. Because M5 primarily added packaging metadata (`NOTICE`), documentation, and automated test suites without introducing new end-user React components or hooks beyond those already present in 2.28.0, `2.28.1` accurately reflects a hardening patch.
  - *Publish target:* npm tag `latest`.

---

## 4. Reconciliation of Legacy Release Trackers

### Issue #15 ("First stable release: acceptance and publication tracker")

Issue #15 was created early in the repository lifecycle to track the initial stable release sequence. Its child issues are reconciled as follows:

1. **Issue #4 (Licensing conflict):** Closed. Owner confirmed ISC for all code; `LICENSE` and `NOTICE` are verified.
2. **Issue #5 (Package identity):** Closed. Owner selected `accessibility-plugin-react`; published under `latest`.
3. **Issue #6 (Screen-reader accessibility acceptance):**
   - *Status:* Programmatic accessibility semantics verified via automated axe-core audits and Playwright tests in `tests/browser/widget.spec.ts`.
   - *Documentation:* `docs/DEVELOPMENT.md` and `docs/SUPPORTED_MATRIX.md` document detailed manual VoiceOver, NVDA, and TalkBack protocols.
   - *Policy:* Automated tests do not certify WCAG compliance; continuous human assistive technology testing remains an active operational discipline.
4. **Issue #7 (Physical devices, actual zoom, visual accessibility):**
   - *Status:* Verified in automated browser matrix (Mobile WebKit emulation, 320px reflow, 400% zoom reflow, forced-colors mode).
   - *Documentation:* Manual physical device touch testing protocol documented in `docs/DEVELOPMENT.md`.
5. **Issue #8 (Representative host-application acceptance):**
   - *Status:* Verified via packed clean consumer test suite (`npm run test:consumers`) in React 18 (Vite), React 19 (Tailwind), and Next.js 16 (Webpack/App Router/SSR).
6. **Issue #9 (Documentation update):** Closed. All documentation synchronized.
7. **Issue #10 (Final release candidate validation):** Fulfilled by Issue #70 (A11Y-505) and `docs/PUBLISH_REHEARSAL.md`.
8. **Issue #11 (Publish approved package):** Automated via GitHub Actions npm OIDC trusted publishing in `.github/workflows/publish.yml`.

### Milestone 5 Tracker (Issue #27)

With the completion of Issue #71, all child issues of Milestone 5 (#66, #67, #68, #69, #70, #71) are complete. Issue #27 may now be closed upon owner approval of this proposal.

---

## 5. Owner Decision Checklist

To proceed with releasing Milestone 5, the repository owner must authorize:

- [ ] **1. Release Version Choice:** Select either **Option A (`2.29.0`)** or **Option B (`2.28.1`)**.
- [ ] **2. Default Branch Merge:** Authorize merge of `feature/a11y-506-release-proposal` into `development`, and synchronization of `development` into `main`.
- [ ] **3. Publication Authorization:** Confirm whether the merge to `main` should automatically trigger publication to npm via `.github/workflows/publish.yml` (OIDC), or if a manual dry-run inspection should precede registry upload.
- [ ] **4. Git Release Tag:** Authorize creating the matching Git tag (e.g., `v2.29.0` or `v2.28.1`) and GitHub Release upon successful npm registry verification.
