# npm release and verification — updated 2026-10-16

## Identity and current state

- Owner-selected package: `accessibility-plugin-react` (same existing npm package).
- Registry state: `latest=2.0.0`; published versions 1.0.0 and 2.0.0; maintainer `praboth`.
- Owner-approved candidate: `2.0.0`, npm tag `latest`. The owner explicitly selected publication without beta.
- Published source: main commit `1d4ab1c`, containing the merged movement/fixed-actions and version 2 release work. No Git release tag was created.
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

Use the hosted Linux matrix for Firefox when this Mac's profile launch fails. Record results for the exact candidate commit, not an earlier PR. Local artifacts and dry runs do not indicate registry publication. Human accessibility/device/zoom/host-integration acceptance remains pending; the owner selected version 2 publication while those checks remain documented.

Build and inspect a reviewable archive outside the checkout:

```sh
npm run build
npm pack --pack-destination /tmp
npm publish /tmp/accessibility-plugin-react-2.0.0.tgz --dry-run --tag latest --access public
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

The owner selected the candidate version/channel, resolved licensing and authorized version 2 publication on 2026-10-13. Upload the exact verified archive using:

```sh
npm publish /tmp/accessibility-plugin-react-2.0.0.tgz --tag latest --access public
```

The package's approved publishConfig uses latest. Successful publication makes 2.0.0 the default npm install target. The major API requires migration; see MIGRATION.md. No Git release tag or main merge is authorized by this preparation.

After upload, verify registry name/version/license and latest tag, archive integrity, and clean registry installations in the React/Next consumers. Record the published version and source commit only after those checks succeed.

## Historical beta publication attempt

On 2026-10-13 the owner-approved source `cf4348b` passed [all hosted jobs](https://github.com/prabothcharith/accessibility-react/actions/runs/38356642128): 66 unit tests on Node22/24, packed React18/React19/Next consumers, and 55 browser passes with five intentional Next-only skips including Linux Firefox. Local final ISC source checks and packed consumers also passed.

The exact archive was inspected before upload. Its SHA512 integrity is `sha512-zqDaTtbv+3cGpgZlqp1TPmuUs4/R/sczLGUOiuTh34HooAcwqJan7wXvS0CSQTvfa12wYgXybLO7/8ClNl5R+Q==`.

After npm browser authentication, publication was rejected with E403: the maintainer account is temporarily suspended after a recent security-sensitive action. Registry verification found only 1.0.0, with latest=1.0.0 and no beta tag/version. **2.0.0-beta.1 is not published.** Registry consumer verification cannot run until publication succeeds. No Git release tag or main merge was made.

The owner subsequently selected 2.0.0 under latest. The registry account hold is independent of release version; record the version 2 retry result separately. The hold duration is unknown; no automatic retry is scheduled. License/identity issues #4 and #5 are resolved; publication and stable human acceptance remain open.

## Version 2 retry

The owner requested export/publication as 2.0.0 without beta on 2026-10-13. Package/lock metadata and publishConfig were changed to 2.0.0/latest, and a new archive is prepared for verification and upload. The earlier beta integrity above applies only to that unpublished beta artifact. Until successful registry verification, 2.0.0 is not claimed as published.

## GitHub Actions publication

The owner requested a GitHub Actions publishing route for 2.0.0/latest. `.github/workflows/publish.yml` is manually dispatched, defaults to dry-run, validates the exact committed name/version/ISC/latest metadata, runs source/packed-consumer/full Linux browser/audit checks, and uploads the tested archive with its SHA512 checksum. The publishing job downloads that archive and uses npm trusted publishing (OIDC), then verifies registry integrity/latest and clean React18/React19/Next registry consumers. No npm token or automatic push/tag publication is configured.

Configure npm’s trusted publisher for package accessibility-plugin-react:

- GitHub organization/user: `prabothcharith`
- Repository: `accessibility-react`
- Workflow filename: `publish.yml` (without the directory)
- Environment: leave blank; this workflow does not use a named environment
- Allowed action: direct `npm publish`

Authenticated maintainers can configure it through npm package settings or:

```sh
npm trust github accessibility-plugin-react --file publish.yml --repo prabothcharith/accessibility-react --allow-publish --yes
```

Browser/2FA authorization may be required. Trusted publishing requires compatible npm/Node; the workflow uses Node24 and npm11.21.0. The prior npm account hold may still reject setup or publishing; OIDC is not evidence that it is cleared.

GitHub requires workflow_dispatch workflows to exist on the default branch. PR #17 supplies movement and PR #18 supplies the npm identity/release workflow; merge #17, retarget #18 to main, and merge it after owner authorization. Then run:

```sh
gh workflow run publish.yml --ref main -f version=2.0.0 -f dry_run=true
# Authorized real publication:
gh workflow run publish.yml --ref main -f version=2.0.0 -f dry_run=false
```

References: [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/), [npm trust CLI](https://docs.npmjs.com/cli/v11/commands/npm-trust/), [GitHub manual workflow requirements](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). Do not report successful publication until the registry and consumer steps succeed.

Local version 2 preparation checks passed: 66 unit tests, type/lint/format/build/archive validation, and packed React18/React19/Next consumer builds. The publication workflow passed actionlint 1.7.12; malformed registry-consumer versions are rejected before installation. The workflow itself has not been dispatched; main-branch availability and npm trusted-publisher setup are still required.

## GitHub Actions attempt — 2026-10-13

PR #17 and PR #18 were merged with owner authorization; main is 1d4ab1c. [Publication Action 38359604307](https://github.com/prabothcharith/accessibility-react/actions/runs/38359604307) ran with version=2.0.0 and dry_run=false. Its validate job passed, preserved the tested archive, and the publishing job verified the archive checksum. Upload then failed with npm E404/permission denial. The trusted-publisher connection had not been saved: both CLI and browser setup were rejected, with the browser explicitly showing the temporary account-suspension notice. Registry checks still found only 1.0.0/latest; version 2.0.0 is not published.

At the owner's request, a fresh GitHub trusted-publisher form was filled in Chrome with user prabothcharith, repository accessibility-react, workflow publish.yml, no environment and Allow npm publish enabled. It is awaiting the owner's Set up connection/security-key authorization. A filled form is not a saved trusted connection. Once the connection is successfully saved and npm permits publication, rerun the failed publishing job to reuse the validated artifact:

```sh
gh run rerun 38359604307 --failed
```

Verify registry metadata/integrity/latest and registry consumers before reporting success. No further retry is automatic.

## Successful version 2 publication — 2026-10-16

The owner saved the npm trusted-publisher connection for `prabothcharith/accessibility-react` and `publish.yml`, then authorized the publication retry. The failed publish job in [Action 38359604307](https://github.com/prabothcharith/accessibility-react/actions/runs/38359604307) reused the archive previously validated from main commit `1d4ab1c`. Its SHA512 checksum check passed and npm accepted `accessibility-plugin-react@2.0.0` through OIDC under `latest`.

The workflow queried the registry immediately and received a temporary 404 while npm's publish-time malware scan was still processing the tarball. After the scan completed, independent checks confirmed version/latest/ISC metadata and integrity `sha512-CQFzF0pNl/bb+YVauI35+GNK2PIgk4qoh8+PnEkj1HAeW2lLMM/LTV5fq0tigNRnmPVX0M7rpYR4XPo820CQWw==`. Clean installs from the public registry passed React18, React19/Tailwind and Next16 declaration checks, ESM/CommonJS loading, SSR and production builds. The installed-package browser matrix passed 55 tests with five intentional Next-only skips across Chromium, Firefox, desktop WebKit and mobile WebKit.

The workflow follow-up retries registry verification for the expected npm scan delay and supports Windows validation. Human screen-reader, physical-device, actual-zoom, forced-colors and representative host acceptance remain pending. Publication did not authorize or create a Git tag/GitHub release.

## GitHub Packages and GitHub release

The public npm package remains `accessibility-plugin-react`. The same 2.0.0
archive is also published to GitHub Packages under the required scoped name
`@prabothcharith/accessibility-react` through
`.github/workflows/publish-github-package.yml`. The workflow creates a scoped
manifest only in its release staging directory, so the repository package name
and public npm package are unchanged.

The GitHub release is tagged `v2.0.0` from the validated `main` commit after
the GitHub Packages verification succeeds.
