# npm release candidate — 2026-10-13

## Identity and current state

- Owner-selected package: `accessibility-plugin-react` (same existing npm package).
- Registry snapshot: `latest=1.0.0`; sole published version 1.0.0; maintainer `praboth`.
- Owner-approved candidate: `2.0.0-beta.1`, npm tag `beta`. Publication of this beta is authorized.
- Source branch: `codex/npm-v2-release`, based on the movement/fixed-actions PR #17 head. No publication, release tag or main merge performed by this preparation.
- ISC is owner-approved for all included code as of 2026-10-13; LICENSE and package/lock metadata agree. Published 1.0.0 metadata says ISC and its README says MIT; historical inconsistency is retained in migration evidence.
- npm CLI authentication as package maintainer `praboth` is verified. Credentials/2FA remain outside repository files and chat.

The API changes warrant a new major version: explicit button/list/controllers replace the old implicit widget/tools/trigger API. See MIGRATION.md. React18/19 peers, ESM/CJS, usable declarations, both CSS paths, provider-owned effects, Clean light styling and saved movement are included. No styling framework is required. The historical storage key remains unchanged to preserve compound-development preferences.

## Preparation and verification

Run source checks and validate the actual archive:

```sh
npm ci
npm run validate
npm run format:check
npm run test:consumers
npx playwright install --with-deps chromium firefox webkit
npm run test:browser
npm audit
```

Use the hosted Linux matrix for Firefox when this Mac's profile launch fails. Record results for the exact candidate commit, not an earlier PR. Local artifacts and dry runs do not indicate registry publication. Human accessibility/device/zoom/host-integration acceptance remains required before stable promotion.

Build and inspect a reviewable archive outside the checkout:

```sh
npm run build
npm pack --pack-destination /tmp
npm publish /tmp/accessibility-plugin-react-2.0.0-beta.1.tgz --dry-run --tag beta --access public
```

## Executed candidate checks

On this preparation branch, the locked install, source/test/config type checks, zero-warning lint, 66 unit tests, JS/types/CSS builds, formatting and archive checks passed. Clean packed React18/React19/Next consumers passed ESM/CJS, SSR, strict declarations and production builds using the new package name. Local Chromium/desktop and mobile WebKit browser checks passed 46 tests with four intentional Next-only skips, including axe and movement/fixed-action regressions. npm audit reported zero vulnerabilities. Tarball publication dry-run passed with the beta tag; it warned that real publication requires authentication.

The archive contains the expected package name/version, declarations, both client JS formats, CSS, license, README and documentation. The final archive uses the owner-approved ISC license. [Hosted renamed-package validation](https://github.com/prabothcharith/accessibility-react/actions/runs/38355795578) passed all jobs on 9f48dc3, including Linux Firefox. Final ISC metadata/documentation validation is tracked by PR #18 checks. Human acceptance remains pending.

## Publication after the required decisions

Log in with the account that has publish rights:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami
```

The owner selected the candidate version/channel, resolved licensing and authorized beta publication on 2026-10-13. Upload the exact verified archive using:

```sh
npm publish /tmp/accessibility-plugin-react-2.0.0-beta.1.tgz --tag beta --access public
```

The package's approved publishConfig also uses beta. This keeps `latest` on 1.0.0; beta consumers explicitly install `accessibility-plugin-react@beta`. Do not promote to latest or create a release tag unless authorized. If the owner chooses stable, update the version, publishConfig and notes and complete stable release gates first.

After upload, verify registry name/version/license, beta and latest tags, archive integrity, and clean registry installations in the React/Next consumers. Record the published version and source commit only after those checks succeed.
