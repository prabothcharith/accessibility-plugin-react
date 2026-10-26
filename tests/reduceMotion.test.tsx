import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { screen, fireEvent, cleanup, render } from "@testing-library/react";
import * as API from "../src";
import { isReducedMotionActive } from "../src";
import { Widget } from "./helpers";

describe("Reduce Motion and Best-Effort Media Controls (A11Y-206)", () => {
  let host: HTMLElement;

  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = "";
    host = document.createElement("main");
    host.id = "main-landmark";
    host.innerHTML = `
      <h1>Reduce Motion Test</h1>
      <div id="animated-box" style="transition: transform 0.5s">Animated Content</div>
      <video id="test-video" src="test.mp4"></video>
      <audio id="test-audio" src="test.mp3"></audio>
    `;
    document.body.appendChild(host);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    const style = document.getElementById("arap-reduce-motion-style");
    if (style) style.remove();
    vi.restoreAllMocks();
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  it("ReduceMotionController toggles reduce motion, injects scoped CSS, and cleans up on toggle and reset", () => {
    renderWidget(<API.ReduceMotionController />);

    const toggle = screen.getByRole("button", { name: "Reduce Motion" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.getElementById("arap-reduce-motion-style")).toBeNull();

    // Toggle ON
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");

    const styleEl = document.getElementById(
      "arap-reduce-motion-style",
    ) as HTMLStyleElement;
    expect(styleEl).not.toBeNull();
    expect(styleEl.textContent).toContain(
      "animation-duration: 0.001ms !important",
    );
    expect(styleEl.textContent).toContain(
      "transition-duration: 0.001ms !important",
    );
    expect(styleEl.textContent).toContain("scroll-behavior: auto !important");
    expect(styleEl.textContent).toContain(":not([data-arap-ui])");

    // Toggle OFF
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(document.getElementById("arap-reduce-motion-style")).toBeNull();

    // Toggle ON again, then test Reset All
    fireEvent.click(toggle);
    expect(document.getElementById("arap-reduce-motion-style")).not.toBeNull();

    const resetBtn = screen.getByRole("button", { name: /reset all/i });
    fireEvent.click(resetBtn);
    expect(document.getElementById("arap-reduce-motion-style")).toBeNull();
  });

  it("pauses running WAAPI animations and resumes only tracked ones on teardown", () => {
    const hostAnim = {
      playState: "running",
      pause: vi.fn(function (this: { playState: string }) {
        this.playState = "paused";
      }),
      play: vi.fn(function (this: { playState: string }) {
        this.playState = "running";
      }),
      effect: {
        target: document.getElementById("animated-box")!,
      },
    } as unknown as Animation;

    const widgetAnim = {
      playState: "running",
      pause: vi.fn(),
      play: vi.fn(),
      effect: {
        target: document.createElement("div"),
      },
    } as unknown as Animation;
    (widgetAnim.effect as KeyframeEffect).target?.setAttribute(
      "data-arap-ui",
      "",
    );

    document.getAnimations = vi.fn().mockReturnValue([hostAnim, widgetAnim]);

    renderWidget(<API.ReduceMotionController />);
    const toggle = screen.getByRole("button", { name: "Reduce Motion" });

    // Enable reduce motion: host animation should be paused, widget animation untouched
    fireEvent.click(toggle);
    expect(hostAnim.pause).toHaveBeenCalled();
    expect(widgetAnim.pause).not.toHaveBeenCalled();

    // Disable reduce motion: tracked host animation should resume
    fireEvent.click(toggle);
    expect(hostAnim.play).toHaveBeenCalled();
  });

  it("pauses playing media and NEVER autoplays on reset or teardown", () => {
    const video = document.getElementById("test-video") as HTMLVideoElement;
    const audio = document.getElementById("test-audio") as HTMLAudioElement;

    // Simulate playing media
    Object.defineProperty(video, "paused", { value: false, writable: true });
    Object.defineProperty(audio, "paused", { value: false, writable: true });

    const videoPauseSpy = vi.spyOn(video, "pause").mockImplementation(() => {
      Object.defineProperty(video, "paused", {
        value: true,
        configurable: true,
      });
    });
    const audioPauseSpy = vi.spyOn(audio, "pause").mockImplementation(() => {
      Object.defineProperty(audio, "paused", {
        value: true,
        configurable: true,
      });
    });
    const videoPlaySpy = vi.spyOn(video, "play");
    const audioPlaySpy = vi.spyOn(audio, "play");

    renderWidget(<API.ReduceMotionController />);
    const toggle = screen.getByRole("button", { name: "Reduce Motion" });

    // Enable reduce motion: media is paused
    fireEvent.click(toggle);
    expect(videoPauseSpy).toHaveBeenCalled();
    expect(audioPauseSpy).toHaveBeenCalled();

    // Reset All: media MUST NOT be automatically played back
    const resetBtn = screen.getByRole("button", { name: /reset all/i });
    fireEvent.click(resetBtn);

    expect(videoPlaySpy).not.toHaveBeenCalled();
    expect(audioPlaySpy).not.toHaveBeenCalled();
  });

  it("displays advisory notice when operating system prefers-reduced-motion is active", () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderWidget(<API.ReduceMotionController />);

    expect(isReducedMotionActive()).toBe(true);
    expect(
      screen.getByText(/operating system prefers-reduced-motion is active/i),
    ).toBeInTheDocument();
  });
});
