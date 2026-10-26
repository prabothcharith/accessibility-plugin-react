# Reduce Motion and Best-Effort Media Controls

This document details the architecture, animation pausing mechanics, media autoplay controls, and technical limitations implemented under **[A11Y-206]**.

---

## 1. Overview and Standards Alignment

Vestibular disorders, epilepsy, motion sickness, and attention deficit conditions can be severely triggered by unexpected motion, parallax scrolling, flashing effects, and unprompted video/audio playback.

- **WCAG SC 2.2.2 (Pause, Stop, Hide - Level A)**: Any moving, blinking, or scrolling information that starts automatically and lasts more than five seconds must have a mechanism to pause, stop, or hide it.
- **WCAG SC 2.3.3 (Animation from Interactions - Level AAA)**: Motion animation triggered by interaction can be disabled unless the animation is essential to the functionality or the information being conveyed.

---

## 2. Technical Implementation

### A. Scoped CSS Overrides

When `reduceMotion` is active, an isolated style sheet (`#arap-reduce-motion-style`) is injected:

```css
*:not([data-arap-ui]):not([data-arap-ui] *),
*:not([data-arap-ui]):not([data-arap-ui] *)::before,
*:not([data-arap-ui]):not([data-arap-ui] *)::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}
```

- **0.001ms vs. 0s**: Setting durations to `0.001ms` ensures that standard JavaScript transition/animation lifecycle callbacks (`transitionend`, `animationend`) still dispatch, preventing JavaScript framework state machines from freezing.
- **Scroll Behavior**: `scroll-behavior: auto !important` instantly terminates animated smooth scrolling.
- **Widget Boundary Protection**: Elements within `[data-arap-ui]` are excluded so widget open/close and placement operations remain smooth and predictable.

### B. Tracked Web Animations API (WAAPI)

- Active animations running via `document.getAnimations()` on host elements are identified and paused:
  ```ts
  if (anim.playState === "running") {
    anim.pause();
    trackedAnimations.add(anim);
  }
  ```
- **Selective Teardown**: Upon reset or disabling `reduceMotion`, only animations that were originally running and explicitly paused by this plugin are resumed. Animations independently paused by the host application remain paused.

### C. Explicit Media Autoplay Pausing

- Host HTML5 `<video>` and `<audio>` elements are queried and paused (`media.pause()`).
- **Never Autoplay on Reset**: Crucially, when `reduceMotion` is disabled or reset, media playback is **never automatically resumed**. Triggering unexpected sound or video upon resetting accessibility preferences or navigating routes violates user intent.

### D. Operating System Motion Preference

- `isReducedMotionActive()` detects whether the host OS has `prefers-reduced-motion: reduce` configured.
- `subscribeReducedMotion()` listens reactively to changes in the operating system preference.
- `ReduceMotionController` renders an accessible, polite notice when OS reduced motion is active.

---

## 3. Known Limitations

- **Animated GIFs & APNGs**: Standard CSS and DOM APIs cannot halt frame playback within bitmap-encoded animated images without canvas re-rendering or DOM rewriting. Authors should provide static alternatives or use CSS video/animation formats.
- **Cross-Origin iframes**: Media players embedded inside cross-origin iframes (e.g., standard YouTube, Vimeo, or Spotify embeds) cannot be paused directly via cross-document scripts due to the browser's Same-Origin Policy.
