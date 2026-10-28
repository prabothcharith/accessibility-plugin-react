# Contributing to accessibility-plugin-react

Thank you for contributing to `accessibility-plugin-react`. We welcome pull requests, bug reports, and improvements that align with our core design principles and stability requirements.

---

## 1. Core architecture & design principles

Before proposing code changes, please review the documentation in `docs/`:
- [Architecture & lifecycle decisions](docs/ARCHITECTURE.md)
- [Design principles](docs/DESIGN.md)
- [Feature behavior and bounds](docs/FEATURES.md)
- [Development and testing guidelines](docs/DEVELOPMENT.md)

### Foundational Rules
1. **Core Owns State & Effects**: The provider (`<AccessibilityPlugin>`) owns all state, persistence, and persistent effect lifetimes. Controllers only render controls and dispatch state updates. Never create controller-owned persistent effects that outlive the controller.
2. **One Provider per Document**: One provider per document; definitions persist across control unmount.
3. **Outside Host Application Layout**: The widget must remain outside host CSS filters, transforms, and overflow containers using the built-in portal boundary (`#arap-portal`).
4. **Zero Compliance Overclaims**: We build assistive display preferences. We never make legal or universal WCAG compliance claims. Automated audits (axe-core, Playwright) do not certify full compliance.
5. **Strict Privacy**:
   - All state is stored locally under `react-accessibility-plugin:state`.
   - Never transmit user selections, inputs, audio recordings, transcripts, or telemetry over the network.
   - Any external provider interfaces (such as translation) require explicit, affirmative user consent and strict exclusion of sensitive fields (passwords, credit cards, PII).

---

## 2. Development workflow

### Prerequisites
- Node.js >= 22.13.0
- npm >= 10.0.0

### Setup
```sh
git clone https://github.com/prabothcharith/accessibility-plugin-react.git
cd accessibility-plugin-react
npm ci
```

### Validation Suite
Always verify your changes against the entire validation suite:
```sh
npm run validate
```
This runs:
- `npm run typecheck`: TypeScript verification of `src/`, `tests/`, and build scripts.
- `npm run lint`: ESLint rules with 0 max-warnings tolerance.
- `npm test`: Vitest unit and integration test suite across all 48 test files.
- `npm run build`: Production build with `tsup` producing ESM, CommonJS, TypeScript declarations, and scoped CSS.

### Consumer & Browser Testing
To verify the exact packed npm tarball in clean consumer environments:
```sh
npm run pack:check
npm run test:consumers
npm run test:browser
```

---

## 3. Pull request requirements

- **Focused PRs**: Keep pull requests focused on a single issue or objective.
- **Regression Tests**: Every behavior change, bug fix, or feature enhancement requires corresponding unit, integration, and/or browser tests.
- **Documentation**: Update `docs/API.md`, `docs/FEATURES.md`, `README.md`, and `CHANGELOG.md` for any user-visible changes.
- **Commit Messages**: Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `perf:`).
- **Branch Strategy**: Branch from `development`, submit PRs to `development`. Production releases are synchronized from `development` to `main` by repository maintainers.
