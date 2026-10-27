# Read-Aloud Text-to-Speech (TTS) Architecture (A11Y-401)

The Read-Aloud Text-to-Speech module provides accessible, user-initiated text-to-speech reading for articles, page content, or user-selected text blocks.

## Key Design Principles & WCAG Conformance

1. **User Initiation Required**: Speech synthesis is strictly opt-in and initiated by the user clicking the "Read aloud" action button. It is never triggered automatically on page load, route transition, or profile activation (respecting WCAG 1.4.2 Audio Control).
2. **Zero Network Transmission / Absolute Privacy**: All audio rendering is performed 100% locally by the browser's native Web Speech API (`window.speechSynthesis`). No text, transcripts, recordings, user identifiers, or telemetry leave the package.
3. **Sensitive & Form Field Exclusions**: Form inputs (`<input>`, `<textarea>`, `<select>`), password fields (`input[type="password"]`), credit card inputs (`[autocomplete*="cc-"]`), elements marked `[data-sensitive="true"]`, elements marked `[aria-hidden="true"]` or `[hidden]`, and the plugin's own UI (`[data-arap-ui]`, `.arap-widget`, `.arap-panel`, etc.) are strictly excluded from speech extraction.
4. **Resilient Sentence Chunking**: Continuous text is segmented into natural sentence and breath-group chunks (~60–180 characters) at punctuation boundaries (`. `, `! `, `? `, `; `, `\n`). This completely prevents the well-known Chromium bug where utterances exceeding 15 seconds stall indefinitely.
5. **Lifecycle Safety & Keyboard Dismissal**:
   - Pressing **Escape** immediately cancels playback and dismisses the floating mini-player bar.
   - Speech synthesis is immediately aborted on `window.beforeunload`, `window.pagehide`, and `document.visibilitychange` (when hidden).
   - Component unmounting safely tears down all speech synthesis instances and event listeners.
6. **Accessible Controls & Touch Targets**:
   - Every interactive control meets or exceeds the 44px by 44px touch target requirement (WCAG 2.5.5 / 2.5.8).
   - Controls provide full status announcements via `role="status"` and `aria-live="polite"`.
   - Floating mini-player bar renders via portal at viewport bottom with Play/Pause and Stop controls.

---

## API Summary

### Component

```tsx
import { ReadAloudController } from "accessibility-plugin-react";

<AccessibilityList>
  <ReadAloudController />
</AccessibilityList>;
```

### Options & Props

```ts
export interface ReadAloudControllerProps {
  className?: string;
  label?: string;
  description?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}
```

### Core Functions & Types

- `isSpeechSynthesisSupported(): boolean`
- `getSpeechVoices(): SpeechSynthesisVoice[]`
- `subscribeSpeechVoices(callback: (voices: SpeechSynthesisVoice[]) => void): () => void`
- `extractReadAloudText(options?: { root?: Element | Document; selectionOnly?: boolean }): string`
- `getActiveSelectionText(): string`
- `splitTextIntoChunks(text: string, maxChunkLength?: number): string[]`
- `class ReadAloudSession`: Manages state machine (`idle`, `playing`, `paused`, `stopped`, `unsupported`), sequential chunk playback, rate, pitch, and voice overrides.
