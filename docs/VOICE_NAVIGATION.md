# Voice Navigation Research Prototype (A11Y-408)

## Overview

The Voice Navigation Research Prototype introduces user-initiated, browser-native voice commands for navigating page landmarks, controlling the accessibility panel, and scrolling page content. Built on the browser's native Web Speech Recognition API (`window.SpeechRecognition` or `window.webkitSpeechRecognition`), it executes entirely on the client side with strict privacy boundaries and zero persistent transcript or audio storage.

> [!WARNING]
> **Research Prototype Disclaimer**:
> Voice navigation is an experimental research prototype. Audio is processed solely through your browser's native Web Speech API during active listening sessions. No audio streams, recordings, or transcripts are stored locally or transmitted to external servers. Destructive actions, profile modifications, and form submissions are strictly excluded.

---

## Architectural & Privacy Principles

### 1. Zero Audio Storage & Transmission

- **No recording persistence**: No audio streams, audio buffers, or media blobs are captured, recorded, or written to `localStorage`, `sessionStorage`, `IndexedDB`, or cookies.
- **No network requests**: The library makes zero external HTTP, WebSocket, or RPC calls. Speech recognition is handled exclusively by the client platform's built-in speech engine.
- **Ephemeral transcripts**: Recognized interim or final transcripts are processed in memory and immediately discarded. No history of spoken commands is retained.

### 2. Strict User-Initiated Consent

- **No auto-listen**: Microphone listening never activates automatically or on page load.
- **Explicit controls**: The user must explicitly click "Start Listening" to begin a session.
- **High-visibility listening status**: When listening is active, a pulsating microphone badge and polite ARIA live region (`aria-live="polite"`) inform the user that speech recognition is active.

### 3. Inactivity Watchdog Timeout

- **30-second silence watchdog**: If no speech command is detected for 30 consecutive seconds, listening automatically deactivates with a `timeout` state, preventing forgotten open microphones.

### 4. Background Tab Protection & Unmount Cleanup

- **Visibility change handling**: If the browser tab loses focus or visibility (`document.hidden`), speech recognition immediately aborts to protect acoustic privacy in shared environments.
- **Unload cleanup**: Session resources, timers, and listeners are cleanly destroyed on `beforeunload`, `pagehide`, and component unmount.

### 5. Safe Action Boundaries

- **Non-destructive only**: Only safe navigation (heading jump, viewport scrolling, menu open/close) is permitted. Form submissions, page reloads, profile changes, and arbitrary DOM interactions are strictly blocked.

### 6. Full Keyboard Alternatives

- **Universal access**: Every voice command is accompanied by a native, accessible keyboard button within the controller ("Next Heading", "Prev Heading", "Scroll Down", "Scroll Up", "Scroll Top", "Scroll Bottom").
- **Unsupported/Denied safety**: If the user's browser lacks speech recognition or if microphone permissions are denied, all keyboard alternatives remain 100% operational.

---

## Supported Voice Command Set

The prototype recognizes an explicit, finite vocabulary of navigation and control commands:

| Command Identifier | Canonical Label  | Recognized Spoken Phrases                                                                             | Executed Action                                                                |
| :----------------- | :--------------- | :---------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------- |
| `open_widget`      | Open Widget      | `"open"`, `"open widget"`, `"open panel"`, `"show widget"`, `"show panel"`, `"open menu"`             | Opens the accessibility panel                                                  |
| `close_widget`     | Close Widget     | `"close"`, `"close widget"`, `"close panel"`, `"hide widget"`, `"hide panel"`, `"close menu"`         | Closes the accessibility panel                                                 |
| `next_heading`     | Next Heading     | `"next heading"`, `"heading down"`, `"forward heading"`, `"go to next heading"`                       | Advances visual focus and smoothly scrolls to next DOM heading (`<h1>`–`<h6>`) |
| `previous_heading` | Previous Heading | `"previous heading"`, `"prior heading"`, `"heading up"`, `"back heading"`, `"go to previous heading"` | Moves focus and scrolls to previous DOM heading                                |
| `first_heading`    | First Heading    | `"first heading"`, `"top heading"`, `"start heading"`, `"main heading"`                               | Jumps directly to first DOM heading on the page                                |
| `scroll_down`      | Scroll Down      | `"scroll down"`, `"page down"`, `"down"`, `"move down"`                                               | Scrolls window down by 75% of viewport height                                  |
| `scroll_up`        | Scroll Up        | `"scroll up"`, `"page up"`, `"up"`, `"move up"`                                                       | Scrolls window up by 75% of viewport height                                    |
| `scroll_top`       | Scroll to Top    | `"scroll top"`, `"top of page"`, `"go to top"`, `"scroll to top"`, `"jump to top"`                    | Scrolls smoothly to top of page (`top: 0`)                                     |
| `scroll_bottom`    | Scroll to Bottom | `"scroll bottom"`, `"bottom of page"`, `"go to bottom"`, `"scroll to bottom"`, `"jump to bottom"`     | Scrolls smoothly to bottom of page                                             |
| `stop_listening`   | Stop Listening   | `"stop"`, `"stop listening"`, `"cancel"`, `"turn off"`, `"exit voice"`, `"quit voice"`                | Stops speech recognition and sets state to idle                                |
| `help`             | Help / Commands  | `"help"`, `"what can i say"`, `"commands"`, `"voice commands"`, `"list commands"`                     | Announces available voice commands via live feedback                           |

---

## Reduced Motion & Scrolling Behavior

When executing scroll commands or heading jumps:

- If `prefers-reduced-motion: reduce` is active in the user's operating system, or if the `reduceMotion` preference is enabled in the widget, scroll animations use `behavior: "auto"` (instant jump) instead of `"smooth"`.

---

## Component Integration

### Default Rendering

`VoiceNavigationController` is included in the accessibility menu by default:

```tsx
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  VoiceNavigationController,
} from "accessibility-plugin-react";

export function App() {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        <VoiceNavigationController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
```

### Custom Event Callbacks

When optional privacy-safe event callbacks are configured on the provider, voice actions dispatch structured `feature-change` events without revealing spoken text or audio:

```tsx
<AccessibilityPlugin
  onFeatureEvent={(event) => {
    if (event.type === "feature-change" && event.feature === "voiceNavigation") {
      console.log("Voice navigation state:", event.value);
    }
  }}
>
```

---

## Browser Support & Fallback Matrix

| Engine / Browser                   | Native Web Speech Support              | Fallback Behavior                                                      |
| :--------------------------------- | :------------------------------------- | :--------------------------------------------------------------------- |
| **Chromium** (Chrome, Edge, Brave) | Supported (`webkitSpeechRecognition`)  | Full voice recognition and keyboard buttons                            |
| **Safari / WebKit**                | Supported (`webkitSpeechRecognition`)  | Full voice recognition and keyboard buttons                            |
| **Firefox (Gecko)**                | Disabled by default in desktop Firefox | Disabled toggle with "Voice Unavailable" notice; full keyboard buttons |
| **Mobile WebKit / Chrome Mobile**  | Supported with microphone consent      | Full voice recognition and touch/keyboard buttons                      |
