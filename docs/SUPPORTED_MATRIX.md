# Supported browser, device, and assistive-technology matrix

This document details the compatibility matrix, verification methods, responsive and display modes, touch and pointer specifications, assistive technology semantics, and explicit boundaries for `accessibility-plugin-react`.

> **Important**: Automated test suites (Playwright, Axe Core, Vitest) verify technical compliance, DOM contracts, and baseline accessibility semantics. Automated audits **do not establish full WCAG compliance or substitute for human assistive technology acceptance**. Human testing with physical devices, screen readers, and actual users remains required for host applications.

---

## 1. Browser engine and environment matrix

All browser environments are tested using real browser engines in clean, packed-consumer production builds (React 18, React 19 with Tailwind CSS, Next.js App Router, and Vite).

| Platform / Engine | Tested Versions | Automated Status | Known Behaviors & Safeguards |
| :--- | :--- | :--- | :--- |
| **Chromium** (Chrome, Edge, Brave, Opera) | Chromium 120+ (Playwright 1.64.0 / Chromium 156) | **Verified (CI & Local)** | Full support for all filter pipelines, CSS variables, `forced-colors`, pointer capture, and Web Speech API. |
| **Gecko / Firefox** (Firefox Desktop) | Firefox 120+ (Playwright Linux CI & Desktop) | **Verified (CI)** | Full CSS filter, zoom, and font replacement support. Web Speech synthesis in headless Linux CI requires graceful degradation due to absence of system audio sinks. |
| **WebKit** (Safari Desktop) | WebKit 17+ (Playwright WebKit 27.2) | **Verified (CI & Local)** | WebKit requires programmatic focus transfer targets (such as `<main id="host">`) to have `tabIndex={-1}` when navigating via landmark skip links. Non-standard subpixel fractional geometry is handled with tolerance assertions. |
| **Mobile WebKit** (iOS Safari) | iOS 16+, iPhone 13/14 emulation | **Verified (CI & Local)** | Full touch target compliance ($\ge 44\text{px} \times 44\text{px}$). Respects `env(safe-area-inset-*)`. Pointer drag events use pointer capture and prevent unwanted page scrolling during widget repositioning. |
| **Chromium for Android** | Chrome Mobile emulation (Pixel 5/7) | **Verified (Local)** | Full touch target compliance ($\ge 44\text{px} \times 44\text{px}$). Safe area support. |

---

## 2. React and framework compatibility

The package ships pre-bundled ESM, CommonJS, TypeScript declarations (`.d.ts`), and scoped CSS without requiring external styling dependencies or build-time transforms.

| Framework / Runtime | Versions Tested | Verification Scope | Status |
| :--- | :--- | :--- | :--- |
| **React 18** | 18.3.1 | Clean packed npm tarball, Vite CSR, Vitest unit suite | **Verified** |
| **React 19** | 19.0.0, 19.2.0 | Clean packed npm tarball, Vite CSR, Tailwind CSS 3/4 integration | **Verified** |
| **Next.js (App Router)** | 14.x, 15.x, 16.x (`next@16.2.10`) | Production webpack build, Server Component imports, SSR hydration, client boundary | **Verified** |
| **Next.js (Pages Router)** | 14.x, 15.x, 16.x | Production SSR and client-side navigation | **Verified** |
| **Node.js** | >= 22.13.0 (Node 22 LTS, Node 24) | `npm ci`, `npm pack`, build scripts, consumer installations | **Verified** |

---

## 3. Responsive viewports and zoom modes

The plugin is designed to withstand aggressive browser zoom and extreme viewport reflow without layout breakage, clipping, or loss of functionality.

### 400% Zoom Reflow (WCAG 1.4.10)
- **Standard Baseline**: A desktop viewport of 1280px zoomed to 400% scales CSS layout down to a **320px viewport width**.
- **Panel Reflow**: The accessibility panel constrains its maximum width to `100vw` (clamped to `min(360px, calc(100vw - 32px))`), preventing horizontal viewport scrollbars on the host page (`el.scrollWidth <= el.clientWidth + 1`).
- **Internal Scrolling**: The control tools list (`.arap-tools-list`) scrolls independently with smooth vertical overflow, keeping header titles, close buttons, and footer reset actions fixed and immediately reachable.

### 200% Text Zoom / Font Scaling
- Font scale controls step smoothly between 100% and 200% using scalable `rem` / proportional calculations without truncating button text or causing overlapping elements.

### Safe Areas (`env(safe-area-inset-*)`)
- The floating launcher button and open panel respect device notches, home indicator bars, and display cutouts by padding bounds with:
  ```css
  top: max(16px, env(safe-area-inset-top));
  bottom: max(16px, env(safe-area-inset-bottom));
  left: max(16px, env(safe-area-inset-left));
  right: max(16px, env(safe-area-inset-right));
  ```

---

## 4. High contrast and system color schemes

### Forced Colors / Windows High Contrast Mode (`forced-colors: active`)
- **Filter Suppression**: When `forced-colors: active` is detected, the core filter composition engine (`composeFilter()`) automatically returns an empty string `""`. This guarantees that CSS filters (`invert()`, `contrast()`, `saturate()`, `grayscale()`) **never distort or override the user's high-contrast operating system colors**.
- **System Palette Keywords**: Controls, borders, and focus rings utilize system color tokens such as `CanvasText`, `LinkText`, `ButtonBorder`, and `Highlight` to integrate seamlessly with OS color choices.
- **Explicit Borders**: Interactive elements feature solid CSS borders so that controls remain distinctly outlined even when background colors are overridden by the user agent.

### Dark, Light, and System Themes
- Built-in Clean Light theme uses CSS variables scoped under `.arap-root` and `.arap-panel`.
- Adapts smoothly when embedded in dark-themed host applications without bleeding host styles into the widget or widget styles into the host application.

### Reduced Motion (`prefers-reduced-motion: reduce`)
- All panel transitions, accordion expansions, and reading guide smooth scrolling are disabled or instantaneous when the user requests reduced motion:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 5. Touch and pointer target specifications

### Minimum Target Size (WCAG 2.5.5 / WCAG 2.5.8)
- Every interactive button within the launcher, panel, control cards, stepper controls, choice selectors, and quick-action footers satisfies a minimum clickable/tappable bounding box of **$44\text{px} \times 44\text{px}$**.
- Continuous Playwright browser tests assert that all visible buttons maintain `box.width >= 44` and `box.height >= 44` under both desktop and mobile viewports.

### Pointer and Drag Interactions
- **Pointer Capture**: Widget repositioning uses pointer events (`onPointerDown`, `setPointerCapture`, `onPointerUp`) rather than HTML5 drag-and-drop, guaranteeing smooth movement across touchscreens, trackpads, and mice.
- **Cancellation**: Pressing the `Escape` key during an active drag operation immediately cancels the drag and restores the widget to its prior persisted coordinates.
- **Boundary Clamping**: The widget cannot be dragged off-screen or hidden behind browser chrome or taskbars.
- **Non-Drag Position Controls**: For users unable to drag, dedicated positioning controls in the panel allow relocating the widget to any screen corner or resetting position via standard keyboard clicks.

---

## 6. Assistive technology and semantic structure

### Screen Reader Support
The widget's controls are tested with standard screen reading technologies:
- **NVDA** (Windows) with Chrome / Firefox / Edge
- **JAWS** (Windows) with Chrome / Edge
- **VoiceOver** (macOS & iOS) with Safari
- **TalkBack** (Android) with Chrome

### Semantic DOM & ARIA Landmarks
- **Launcher**: Native `<button type="button">` with descriptive `aria-label="Accessibility"` and `aria-expanded="true|false"`.
- **Panel Container**: Non-modal `<section>` or `<div>` with `role="region"` and `aria-label="Accessibility settings"`. Does not trap focus or block interaction with the underlying page.
- **Controls**:
  - Toggles: Semantic switches with `role="switch"` and `aria-checked="true|false"`.
  - Radios / Choices: Native radio inputs or `role="radiogroup"` with keyboard arrow-key navigation.
  - Steppers: Increment and decrement buttons with explicit accessible labels and current value announcements.
- **Live Announcements**: Polite live regions (`role="status"`, `aria-live="polite"`, `aria-atomic="true"`) announce state changes, search filter counts, and reset confirmations without interrupting speech.
- **Focus Management**:
  - Opening the panel focuses the close button or first interactive element.
  - Closing the panel returns focus cleanly to the launcher trigger button.
  - If the widget is unmounted dynamically, focus safely falls back to `document.body` or host layout without throwing errors.

---

## 7. Explicit boundaries and architectural limits

To avoid overpromising or compromising host application stability, the following boundaries are explicitly defined:

1. **No Universal WCAG Compliance Claim**:
   Installing this plugin does not automatically make an inaccessible website compliant. It provides assistive display preferences for end users.
2. **Shadow DOM**:
   CSS variables and filter effects applied to `document.documentElement` or host containers do not pierce closed Shadow DOM roots.
3. **Cross-Origin Iframes**:
   Browsers enforce the Same-Origin Policy. The plugin cannot inspect, style, or translate content hosted inside cross-origin `<iframe>` elements.
4. **Platform Speech Synthesis Constraints**:
   Native Text-to-Speech (TTS) relies on the browser's `window.speechSynthesis` API. In environments lacking audio drivers or speech synthesis services (e.g., headless Linux servers without mock audio sinks), audio playback cannot be synthesized.
5. **Zero Data Transmission**:
   All user preferences, profiles, and state remain purely local in `localStorage` under `react-accessibility-plugin:state`. No analytics, telemetry, or user inputs are ever transmitted over the network.
