# Accessibility Plugin React

Composable React controls for website display preferences: text sizing, color adjustments, reading aids, media visibility and consumer-defined features. Choose the controls in JSX; preferences continue working when the panel closes.

**Version 2 beta; stable accessibility acceptance remains pending.** See [project status](docs/PROJECT_STATUS.md) for executed checks and release gates. An accessibility widget cannot repair inaccessible application markup or establish WCAG compliance.

![Clean light accessibility panel with remembered placement and fixed quick actions](https://raw.githubusercontent.com/prabothcharith/accessibility-react/d53b28a5b0a97cb9e88d55cda03dae5b03d2d13d/docs/assets/movable-desktop.png)

The new look uses white surfaces, blue accents, outline icons and responsive controls. Move the trigger by dragging, Alt+arrow keys or the corner/movement controls. Settings and placement are remembered; reset stays in the fixed action bar while tools scroll. Display reset preserves the trigger position.

## Quick start

This update continues the owner’s existing npm package, `accessibility-plugin-react`, as a new major version. The registry currently serves 1.0.0; version 2.0.0-beta.1 introduces the new design and compound API. See [migration guidance](docs/MIGRATION.md) before upgrading. To evaluate these changes, install the local tarball:

```sh
npm ci
npm run build
npm pack
# In your React application, use the actual archive path:
npm install /absolute/path/to/accessibility-plugin-react-2.0.0-beta.1.tgz
```

Install the beta with `npm install accessibility-plugin-react@beta`. `npm install accessibility-plugin-react` continues to select the 1.0.0 latest tag. React and React DOM are peers; no Tailwind, Motion, icon library or design system is required.

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  FontSizeController,
  ContrastController,
  GrayscaleController,
  ResetController,
} from "accessibility-plugin-react";
import "accessibility-plugin-react/style.css";

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
import { useAccessibility } from "accessibility-plugin-react";

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
- [Migration](docs/MIGRATION.md), [changelog](CHANGELOG.md), [npm release candidate](docs/RELEASE.md)
- [Status](docs/PROJECT_STATUS.md), [roadmap](docs/ROADMAP.md), [baseline](docs/BASELINE.md)

The original [vanilla JavaScript project](https://github.com/prabothcharith/accessibility-plugin) remains a separate repository. This version uses the [ISC license](LICENSE). On 2026-10-13 the owner confirmed authority to license all included code under ISC, resolving the prior GPL/ISC/MIT metadata conflict for this release.

The default visual foundation is [Clean light](docs/DESIGN.md): scoped plain CSS, reusable palette variables, outline icons and responsive control rows. See the design guide for actual desktop/mobile screenshots.
