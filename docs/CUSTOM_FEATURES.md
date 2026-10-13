# Custom feature development

A consumer can implement a normal React component in its own application and place it beside built-in controllers. No private imports, fork or registration configuration is required.

## A complete JavaScript example

```jsx
import { useAccessibility } from "react-accessibility-plugin";

export function OutlineFeature() {
  const { value, setValue } = useAccessibility("example:outline", false, {
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
    <div className="arap-feature">
      <button
        type="button"
        className="arap-segment"
        aria-pressed={value}
        onClick={() => setValue(!value)}
      >
        Page outline
      </button>
    </div>
  );
}
```

Include `<OutlineFeature />` inside `<AccessibilityList>`. `apply` runs on restored state without clicking the control; reset reverts to false and runs cleanup. Closing or removing the control does not remove the chosen effect. Provider unmount does. The example changes a property the built-in engine does not own.

## Structured TypeScript state

```tsx
import {
  useAccessibility,
  type FeatureOptions,
} from "react-accessibility-plugin";
type Preference = { enabled: boolean; color: string };
const options: FeatureOptions<Preference> = {
  validate(value): value is Preference {
    if (!value || typeof value !== "object") return false;
    const candidate = value as Partial<Preference>;
    return (
      typeof candidate.enabled === "boolean" &&
      ["#164e63", "#1d4ed8"].includes(candidate.color ?? "")
    );
  },
  apply(value) {
    if (!value.enabled) return;
    const previous = document.body.style.outline;
    document.body.style.outline = `3px solid ${value.color}`;
    return () => {
      document.body.style.outline = previous;
    };
  },
};
export function CustomOutline() {
  const { value, setValue, reset } = useAccessibility<Preference>(
    "example:custom-outline",
    { enabled: false, color: "#164e63" },
    options,
  );
  return (
    <div className="arap-feature">
      <button
        type="button"
        aria-pressed={value.enabled}
        onClick={() => setValue({ ...value, enabled: !value.enabled })}
      >
        Outline
      </button>
      <button type="button" onClick={reset}>
        Reset outline
      </button>
    </div>
  );
}
```

## Contract

- Use stable namespaced keys and JSON-compatible defaults. Built-in keys are reserved. First definition wins; keep definitions/defaults stable and avoid prop-dependent captured callbacks. Remount the provider when changing the definition itself.
- `apply` may return cleanup. Cleanup runs before reapplying a changed value and on provider removal. It must restore every owned DOM property/listener/node, be idempotent under Strict Mode and not undo unrelated host updates.
- The provider applies default values too; default effects should usually do nothing. Never use an event handler as the only place that applies DOM changes.
- If a custom effect needs dynamic route targets, attach a correctly cleaned observer/listener or apply to a stable application root. Provider ownership does not automatically rerun arbitrary custom callbacks when unrelated DOM changes.
- Avoid writing `filter` on html/body or properties already owned by built-ins. There is no public custom filter-composition API; use a separate target or an independent feature rather than racing the built-in engine.
- Custom code is trusted application code: validators are not a security sandbox, and thrown apply errors propagate to the app's React error boundary. No HTML strings from persisted values should be inserted.
- Use native named buttons, `aria-pressed` for toggles, grouped labels for segments, visible focus and understandable values. Decorative icons should be hidden from assistive technology.

The original two-argument hook still works with ordinary React effects. Such effects stay active when the built-in list is hidden because its children remain mounted, but they end when the custom control actually unmounts. Prefer the third argument when effects must survive actual control removal.

See `examples/custom-feature/main.tsx`, unit custom lifecycle tests and the packed browser fixture for executable examples.
