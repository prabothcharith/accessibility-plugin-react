# React Accessibility Plugin

Composable React controls for website display preferences: text sizing, color adjustments, reading aids, media visibility and consumer-defined features. Choose the controls in JSX; preferences continue working when the panel closes.

**Development build, not a published stable release.** See [project status](docs/PROJECT_STATUS.md) for executed checks and release gates. An accessibility widget cannot repair inaccessible application markup or establish WCAG compliance.

## Quick start

The selected branch uses the package name `react-accessibility-plugin`. The npm registry version may differ from this checkout. To evaluate these changes, install the local tarball:

```sh
npm ci
npm run build
npm pack
# In your React application, use the actual archive path:
npm install /absolute/path/to/react-accessibility-plugin-0.1.0.tgz
```

Once an owner-approved release is available, registry installation is `npm install react-accessibility-plugin`. React and React DOM are peers; no Tailwind, Motion, icon library or design system is required.

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ContrastController,
  GrayscaleController,
  ResetController,
} from "react-accessibility-plugin";
import "react-accessibility-plugin/style.css";

export default function App() {
  return (
    <>
      <main>
        <h1>My website</h1>
        <p>Your application goes here.</p>
      </main>
      <AccessibilityPlugin position="right">
        <AccessibilityButton description="Adjust display preferences" />
        <AccessibilityList>
          <FontSizeController />
          <ContrastController />
          <GrayscaleController />
          <ResetController />
        </AccessibilityList>
      </AccessibilityPlugin>
    </>
  );
}
```

Mount one provider above route changes. The panel is a non-modal region: Enter/Space activates native controls, opening focuses the panel, Tab follows ordinary document order, and Escape or Close returns focus to the opener. The host page remains interactive.

## Custom features

Keep custom side effects in the provider's lifecycle, not in click handlers:

```tsx
import { useAccessibility } from "react-accessibility-plugin";

export function OutlineFeature() {
  const { value, setValue } = useAccessibility("my-site:outline", false, {
    apply(enabled) {
      if (!enabled) return;
      const previous = document.body.style.outline;
      document.body.style.outline = "3px solid blue";
      return () => {
        document.body.style.outline = previous;
      };
    },
  });
  return (
    <button type="button" aria-pressed={value} onClick={() => setValue(!value)}>
      Page outline
    </button>
  );
}
```

Place `<OutlineFeature />` inside `<AccessibilityList>`. Its state restores from localStorage, global reset returns it to `false`, and cleanup runs before reapplication and on provider removal. Definitions are immutable for a provider lifetime. [Full custom feature contract](docs/CUSTOM_FEATURES.md).

## Documentation

- [Installation and Next.js](docs/INSTALLATION.md)
- [Feature behavior and original parity](docs/FEATURES.md)
- [Public API and customization](docs/API.md)
- [Architecture and decisions](docs/ARCHITECTURE.md)
- [Development, testing and release procedure](docs/DEVELOPMENT.md)
- [Troubleshooting and limitations](docs/TROUBLESHOOTING.md)
- [Migration](docs/MIGRATION.md), [changelog](CHANGELOG.md)
- [Status](docs/PROJECT_STATUS.md), [roadmap](docs/ROADMAP.md), [baseline](docs/BASELINE.md)

The original [vanilla JavaScript project](https://github.com/prabothcharith/accessibility-plugin) remains a separate repository. This branch retains its existing GPL-3.0 declaration and includes [LICENSE](LICENSE). Historical ISC metadata conflicts are recorded in the status document; the owner must resolve release licensing and package identity before publication.
