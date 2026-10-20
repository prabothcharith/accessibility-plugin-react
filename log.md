# Change log

## 2026-10-16

- 12:33 +05:30 — Updated package and consumer validation scripts to invoke npm and local package CLIs through Node, fixing Windows process-spawn failures while preserving Unix behavior.
- 12:33 +05:30 — Made archive inspection accept both npm 11 array output and npm 12 package-keyed `npm pack --json` output.
- 12:33 +05:30 — Moved browser-fixture ports from Windows-reserved 4311–4313 to 7311–7313 so the full browser matrix can start on Windows and hosted Linux.
- 12:33 +05:30 — Added repository line-ending rules so fresh Windows checkouts retain the LF format expected by the Prettier validation gate.
- 12:41 +05:30 — Published `accessibility-plugin-react@2.0.0` under `latest` through the trusted GitHub OIDC workflow; npm accepted the tested archive from main commit `1d4ab1c`.
- 12:41 +05:30 — Added retry handling for npm metadata and tarball scan/propagation so a successful future publication is not reported as failed by an immediate 404 verification response.
- 12:48 +05:30 — Verified npm metadata, ISC license, `latest=2.0.0`, tarball availability and published integrity after npm's publish-time scan completed.
- 12:48 +05:30 — Installed version 2 from the public registry into clean React 18, React 19/Tailwind and Next.js consumers; declarations, ESM/CommonJS, SSR and production builds passed.
- 12:48 +05:30 — Ran the registry-installed Chromium, Firefox, desktop WebKit and mobile WebKit matrix: 55 passed and five intentional Next-only scenarios were skipped.
- 12:48 +05:30 — Updated changelog, status, roadmap, release and handover documentation with the actual publication outcome and remaining manual acceptance/tag gates.
- 12:33 +05:30 — Began fresh validation of the approved `accessibility-plugin-react@2.0.0` release candidate before the authorized npm publication retry.
