# Optional Privacy-Safe Feature Event Callbacks (A11Y-406)

The `accessibility-plugin-react` library includes an optional, local-only lifecycle callback system designed to help site owners observe accessibility feature engagement, profile adoption, and widget visibility in compliance with privacy regulations (GDPR, CCPA, HIPAA).

## Core Privacy Principles

1. **Disabled by Default**:
   The library never emits events, telemetry, or analytics unless a host application explicitly provides an `onFeatureEvent` prop to `<AccessibilityPlugin>`.
2. **Zero Network Transmission**:
   The library never performs HTTP/network requests, analytics pings, or third-party tracking. All event dispatching is strictly local within the consumer's React runtime.
3. **No Private Data, Content, or PII**:
   The event payload model is strictly restricted to coarse categorical identifiers, numerical step values, and timestamps.
   - **Never Included**:
     - Page text, paragraph content, or DOM strings.
     - User text selections or clipboard data.
     - Form input values, emails, or credentials.
     - User IDs, session IDs, cookies, or device fingerprints.
     - Web Speech TTS transcripts or audio recordings.
     - Search terms or full query URLs with auth tokens.
4. **Sanitized and Frozen Payloads**:
   All emitted events are validated against a strict allowlist and deep-frozen (`Object.freeze`) via `sanitizeFeatureEvent` to prevent mutation.

---

## Event Types and Payload Reference

```ts
export type AccessibilityEventType =
  | "feature-change"
  | "feature-reset"
  | "panel-toggle"
  | "placement-change"
  | "profile-apply"
  | "preset-apply";

export type EventTriggerSource =
  | "ui"
  | "shortcut"
  | "profile"
  | "preset"
  | "reset"
  | "api";
```

### 1. `feature-change`
Emitted when a user adjusts an individual accessibility preference:
```json
{
  "type": "feature-change",
  "timestamp": 1730000000000,
  "source": "ui",
  "featureId": "fontSize",
  "value": 120,
  "previousValue": 100
}
```

### 2. `panel-toggle`
Emitted when the accessibility settings panel opens or closes:
```json
{
  "type": "panel-toggle",
  "timestamp": 1730000000000,
  "source": "ui",
  "isOpen": true
}
```

### 3. `feature-reset`
Emitted when the user resets settings to baseline defaults:
```json
{
  "type": "feature-reset",
  "timestamp": 1730000000000,
  "source": "reset",
  "clearedFeaturesCount": 3
}
```

### 4. `placement-change`
Emitted when the widget button position is moved:
```json
{
  "type": "placement-change",
  "timestamp": 1730000000000,
  "source": "ui",
  "placement": "corner"
}
```

### 5. `profile-apply`
Emitted when an accessibility profile is activated:
```json
{
  "type": "profile-apply",
  "timestamp": 1730000000000,
  "source": "profile",
  "profileId": "motor-impaired"
}
```

---

## Usage Example

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  type AccessibilityFeatureEvent,
} from "accessibility-plugin-react";

export function App() {
  const handleFeatureEvent = (event: AccessibilityFeatureEvent) => {
    // Forward coarse metadata to your privacy-compliant in-house analytics
    console.log(`[A11y Event] ${event.type}:`, event);
  };

  return (
    <AccessibilityPlugin onFeatureEvent={handleFeatureEvent}>
      <AccessibilityButton />
      <AccessibilityList />
    </AccessibilityPlugin>
  );
}
```

---

## Developer Guidance: Consent & Retention

- **User Consent**: If your application forwards accessibility preference events to an external analytics or observability pipeline, ensure your site's privacy policy discloses aggregate accessibility metrics collection.
- **Data Minimization**: Store only aggregated counts (e.g. "8% of visitors utilize High Contrast mode") rather than tying preference events to individual user profiles or IP addresses.
- **Error Boundary Protection**: The plugin catches exceptions thrown inside consumer callbacks so faulty logging backends will never break the widget UI or interrupt user preferences.
