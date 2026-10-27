import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  screen,
  fireEvent,
  cleanup,
  act,
  within,
} from "@testing-library/react";
import * as API from "../src";
import { renderFeatures } from "./helpers";

describe("A11Y-303: Page Headings and Landmarks Navigator", () => {
  beforeEach(() => {
    localStorage.clear();
    cleanup();
    document.body.innerHTML = "";
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("scanHeadings discovers h1-h6 and role='heading' in exact DOM order and excludes plugin UI", () => {
    document.body.innerHTML = `
      <main>
        <h1>Main Page Title</h1>
        <div>
          <h2>Section One</h2>
          <div role="heading" aria-level="3">Sub Section 1.1</div>
          <p>Text</p>
          <h4>Deep Header</h4>
        </div>
        <div data-arap-ui="true">
          <h2>Plugin Internal Heading</h2>
        </div>
        <h2 aria-hidden="true">Hidden Header</h2>
        <h3 style="display: none">Display None Header</h3>
        <h3></h3>
      </main>
    `;

    const headings = API.scanHeadings();
    expect(headings).toHaveLength(4);
    expect(headings.map((h) => ({ level: h.level, text: h.text }))).toEqual([
      { level: 1, text: "Main Page Title" },
      { level: 2, text: "Section One" },
      { level: 3, text: "Sub Section 1.1" },
      { level: 4, text: "Deep Header" },
    ]);
  });

  it("scanLandmarks discovers semantic landmarks and authored labels in DOM order", () => {
    document.body.innerHTML = `
      <header>Global Banner</header>
      <nav aria-label="Primary Nav">Links</nav>
      <main id="content">
        <h1 id="title-lbl">Accessible Region</h1>
        <section aria-labelledby="title-lbl">Content</section>
        <aside>Related Links</aside>
        <article>
          <header>Article Header (Scoped - Not Top Landmark)</header>
          <p>Text</p>
        </article>
      </main>
      <div role="search" aria-label="Site Search">Search</div>
      <footer>Site Footer</footer>
      <div data-arap-ui="true">
        <nav>Plugin Internal Nav</nav>
      </div>
    `;

    const landmarks = API.scanLandmarks();
    expect(landmarks.map((l) => ({ type: l.type, label: l.label }))).toEqual([
      { type: "banner", label: "Header (Banner)" },
      { type: "navigation", label: "Primary Nav" },
      { type: "main", label: "Main Content" },
      { type: "region", label: "Accessible Region" },
      { type: "complementary", label: "Sidebar (Complementary)" },
      { type: "search", label: "Site Search" },
      { type: "contentinfo", label: "Footer (Content Info)" },
    ]);
  });

  it("truthfully reports empty lists when page lacks headings or landmarks", () => {
    document.body.innerHTML = `<div><p>Simple content with no headings or landmarks.</p></div>`;
    expect(API.scanHeadings()).toHaveLength(0);
    expect(API.scanLandmarks()).toHaveLength(0);
  });

  it("navigateToElement sets temporary tabindex on unfocusable elements and cleans up on blur", () => {
    const heading = document.createElement("h2");
    heading.textContent = "Jump Target";
    document.body.appendChild(heading);

    const scrollIntoViewSpy = vi.fn();
    heading.scrollIntoView = scrollIntoViewSpy;

    expect(heading.hasAttribute("tabindex")).toBe(false);

    API.navigateToElement(heading);

    expect(scrollIntoViewSpy).toHaveBeenCalledWith({
      behavior: "smooth",
      block: "start",
    });
    expect(heading.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(heading);

    // On blur, the temporary tabindex is completely removed
    fireEvent.blur(heading);
    expect(heading.hasAttribute("tabindex")).toBe(false);

    heading.remove();
  });

  it("navigateToElement preserves pre-existing tabindex on focusable targets", () => {
    const btn = document.createElement("button");
    btn.textContent = "Focusable Button";
    btn.setAttribute("tabindex", "0");
    document.body.appendChild(btn);

    btn.scrollIntoView = vi.fn();

    API.navigateToElement(btn);
    expect(btn.getAttribute("tabindex")).toBe("0");

    fireEvent.blur(btn);
    expect(btn.getAttribute("tabindex")).toBe("0");

    btn.remove();
  });

  it("renders PageNavigatorController, toggles dialog, and displays truthful empty states", async () => {
    const { host } = renderFeatures(<API.PageNavigatorController />);
    const div = document.createElement("div");
    div.innerHTML = `<p>Plain page</p>`;
    await act(async () => {
      host.replaceWith(div);
      await Promise.resolve();
    });

    const exploreBtn = screen.getByRole("button", { name: "Explore" });
    expect(exploreBtn).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(exploreBtn);
    expect(exploreBtn).toHaveAttribute("aria-expanded", "true");

    const dialog = screen.getByRole("region", {
      name: "Page Structure Explorer",
    });
    expect(dialog).not.toBeNull();

    // Default tab is Headings
    expect(
      screen.getByText("No headings found on this page."),
    ).toBeInTheDocument();

    // Switch to Landmarks tab
    const landmarksTab = screen.getByRole("tab", { name: /Landmarks/i });
    fireEvent.click(landmarksTab);
    expect(
      screen.getByText("No landmarks found on this page."),
    ).toBeInTheDocument();

    // Press Escape to close and return focus
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(
      screen.queryByRole("region", { name: "Page Structure Explorer" }),
    ).toBeNull();
    expect(document.activeElement).toBe(exploreBtn);
  });

  it("renders discovered headings and navigates safely on activation", () => {
    const { host } = renderFeatures(<API.PageNavigatorController />);
    host.innerHTML = `
      <div>
        <h1>Welcome</h1>
        <h2>Getting Started</h2>
        <h3>Installation</h3>
      </div>
    `;

    // Mock scrollIntoView
    host.querySelectorAll("h1, h2, h3").forEach((el) => {
      el.scrollIntoView = vi.fn();
    });

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    expect(screen.getByText("Headings (3)")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Welcome/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Getting Started/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Installation/i }),
    ).toBeInTheDocument();

    // Click heading item
    const jumpBtn = screen.getByRole("button", { name: /Getting Started/i });
    fireEvent.click(jumpBtn);

    const h2 = host.querySelector("h2")!;
    expect(h2.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(h2);

    // Verify temporary tabindex cleanup on blur
    fireEvent.blur(h2);
    expect(h2.hasAttribute("tabindex")).toBe(false);
  });

  it("updates structure dynamically on SPA route mutations without observer loops", async () => {
    const { host } = renderFeatures(<API.PageNavigatorController />);
    host.innerHTML = `<div><h1>Initial Route</h1></div>`;

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    expect(screen.getByText("Headings (1)")).toBeInTheDocument();

    // Simulate SPA route change
    host.innerHTML = `
      <section>
        <h1>New Route</h1>
        <h2>Sub Route</h2>
      </section>
    `;
    await Promise.resolve();
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.getByText("Headings (2)")).toBeInTheDocument();
    const list = screen.getByRole("list");
    expect(within(list).getByText("New Route")).toBeInTheDocument();
    expect(within(list).getByText("Sub Route")).toBeInTheDocument();
  });

  it("supports keyboard tab switching with Left and Right arrow keys", () => {
    renderFeatures(<API.PageNavigatorController />);
    fireEvent.click(screen.getByRole("button", { name: "Explore" }));

    const headingsTab = screen.getByRole("tab", { name: /Headings/i });
    const landmarksTab = screen.getByRole("tab", { name: /Landmarks/i });

    headingsTab.focus();
    fireEvent.keyDown(headingsTab, { key: "ArrowRight" });

    expect(landmarksTab).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(landmarksTab, { key: "ArrowLeft" });
    expect(headingsTab).toHaveAttribute("aria-selected", "true");
  });

  it("filters items using the search input", () => {
    const { host } = renderFeatures(<API.PageNavigatorController />);
    host.innerHTML = `
      <div>
        <h2>Alpha Topic</h2>
        <h2>Beta Topic</h2>
        <h2>Gamma Topic</h2>
      </div>
    `;

    fireEvent.click(screen.getByRole("button", { name: "Explore" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(3);

    const searchInput = screen.getByPlaceholderText("Filter headings...");
    fireEvent.change(searchInput, { target: { value: "beta" } });

    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    const list = screen.getByRole("list");
    expect(within(list).getByText("Beta Topic")).toBeInTheDocument();
    expect(within(list).queryByText("Alpha Topic")).toBeNull();
  });
});
