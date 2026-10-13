import { beforeEach, afterEach, it, expect, vi } from "vitest";
import { StrictMode, useContext, useState, useEffect } from "react";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { hydrateRoot } from "react-dom/client";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  AccessibilityContext,
  FontSizeController,
  GrayscaleController,
  ResetController,
  useAccessibility,
} from "../src";
import { loadState, saveState } from "../src/core/storage";
import { Widget } from "./helpers";
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
  vi.useRealTimers();
});
function Custom() {
  const { value, setValue } = useAccessibility("custom", false, {
    apply: (value) => {
      document.body.dataset.custom = String(value);
      return () => {
        delete document.body.dataset.custom;
      };
    },
  });
  return (
    <button onClick={() => setValue(!value)}>Custom {String(value)}</button>
  );
}
it("opens a non-modal region, focuses it, closes with Escape and returns focus", () => {
  render(
    <Widget>
      <Custom />
    </Widget>,
  );
  const trigger = screen.getByLabelText("Accessibility");
  trigger.focus();
  fireEvent.click(trigger);
  expect(screen.getByRole("region")).toHaveFocus();
  expect(screen.getByRole("region")).not.toHaveAttribute("aria-modal");
  expect(trigger).toHaveAttribute(
    "aria-controls",
    screen.getByRole("region").id,
  );
  fireEvent.keyDown(screen.getByRole("region"), { key: "Escape" });
  expect(screen.queryByRole("region")).toBeNull();
  expect(trigger).toHaveFocus();
  expect(screen.getByText("Custom false")).not.toBeVisible();
});
it("restores preferences while initially closed and ignores invalid builtins", async () => {
  saveState({ grayscale: true, fontSize: "huge" });
  const host = document.createElement("main");
  document.body.appendChild(host);
  render(
    <Widget>
      <FontSizeController />
      <GrayscaleController />
    </Widget>,
  );
  await waitFor(() => expect(host.style.filter).toBe("grayscale(1)"));
  fireEvent.click(screen.getByLabelText("Accessibility"));
  expect(screen.getByText("100%")).toBeVisible();
});
it("custom effects outlive controls, restore, reset, and clean up", () => {
  saveState({ custom: true });
  function App() {
    const [visible, setVisible] = useState(true);
    return (
      <>
        <button onClick={() => setVisible(false)}>Remove control</button>
        <Widget>{visible && <Custom />}</Widget>
      </>
    );
  }
  const view = render(<App />);
  expect(document.body.dataset.custom).toBe("true");
  fireEvent.click(screen.getByText("Remove control"));
  expect(document.body.dataset.custom).toBe("true");
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByText("Reset All"));
  expect(document.body.dataset.custom).toBe("false");
  view.unmount();
  expect(document.body.dataset.custom).toBeUndefined();
});
it("reset cannot be undone by pending persistence, including unmount", () => {
  vi.useFakeTimers();
  const view = render(
    <Widget>
      <Custom />
    </Widget>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByText("Custom false"));
  act(() => vi.advanceTimersByTime(100));
  fireEvent.click(screen.getByText("Reset All"));
  view.unmount();
  act(() => vi.runAllTimers());
  expect(loadState()).toBeNull();
});
it("flushes pending settings on unmount and pagehide", () => {
  vi.useFakeTimers();
  const view = render(
    <Widget>
      <Custom />
    </Widget>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByText("Custom false"));
  fireEvent(window, new Event("pagehide"));
  expect(loadState()).toEqual({ custom: true });
  fireEvent.click(screen.getByText("Custom true"));
  view.unmount();
  expect(loadState()).toEqual({ custom: false });
});
it("persist=false never reads or writes settings", () => {
  const read = vi.spyOn(Storage.prototype, "getItem"),
    write = vi.spyOn(Storage.prototype, "setItem");
  const view = render(
    <AccessibilityPlugin persist={false}>
      <Custom />
    </AccessibilityPlugin>,
  );
  fireEvent.click(screen.getByText("Custom false"));
  view.unmount();
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
  read.mockRestore();
  write.mockRestore();
});
it("survives Strict Mode without duplicate reading or custom effects", () => {
  const view = render(
    <StrictMode>
      <Widget>
        <Custom />
      </Widget>
    </StrictMode>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  fireEvent.click(screen.getByText("Custom false"));
  expect(document.body.dataset.custom).toBe("true");
  expect(document.querySelectorAll(".arap-btn")).toHaveLength(1);
  view.unmount();
  expect(document.body.dataset.custom).toBeUndefined();
});
it("rejects concurrent document owners explicitly and allows subsequent mount", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  const a = render(
    <Widget>
      <Custom />
    </Widget>,
  );
  expect(() =>
    render(
      <Widget>
        <Custom />
      </Widget>,
    ),
  ).toThrow("Only one AccessibilityPlugin");
  a.unmount();
  expect(() =>
    render(
      <Widget>
        <Custom />
      </Widget>,
    ),
  ).not.toThrow();
  error.mockRestore();
});
it("validates custom structured state and programmatic writes", () => {
  saveState({ structured: { wrong: true } });
  function Structured() {
    const { value, setValue } = useAccessibility(
      "structured",
      { size: 2 },
      {
        validate: (v): v is { size: number } =>
          !!v &&
          typeof v === "object" &&
          "size" in v &&
          typeof v.size === "number",
      },
    );
    return (
      <button onClick={() => setValue({ size: 3 })}>Size {value.size}</button>
    );
  }
  render(
    <Widget>
      <Structured />
    </Widget>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  expect(screen.getByText("Size 2")).toBeVisible();
  fireEvent.click(screen.getByText("Size 2"));
  expect(screen.getByText("Size 3")).toBeVisible();
});
it("keeps legacy reset callbacks and context API", () => {
  function Legacy() {
    const ctx = useContext(AccessibilityContext)!;
    return (
      <button
        onClick={() => {
          ctx.registerReset("legacy", () => {
            document.body.dataset.reset = "yes";
          });
          ctx.resetAll();
        }}
      >
        Legacy reset
      </button>
    );
  }
  render(
    <AccessibilityPlugin>
      <Legacy />
    </AccessibilityPlugin>,
  );
  fireEvent.click(screen.getByText("Legacy reset"));
  expect(document.body.dataset.reset).toBe("yes");
  delete document.body.dataset.reset;
});
it("errors outside a provider", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(() => render(<Custom />)).toThrow("must be used within");
  error.mockRestore();
});
it("server renders and hydrates without mismatches", async () => {
  const ui = (
    <AccessibilityPlugin>
      <main>Server content</main>
      <AccessibilityButton />
      <AccessibilityList>
        <Custom />
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(ui);
  document.body.appendChild(container);
  expect(container.textContent).toBe("Server content");
  const errors: unknown[] = [];
  let root: ReturnType<typeof hydrateRoot>;
  await act(async () => {
    root = hydrateRoot(container, ui, {
      onRecoverableError: (error) => errors.push(error),
    });
  });
  expect(screen.getByLabelText("Accessibility")).toBeInTheDocument();
  expect(errors).toEqual([]);
  await act(async () => root.unmount());
});
it.each(["toString", "hasOwnProperty"])(
  "supports non-reserved inherited object key %s",
  (key) => {
    function Feature() {
      const { value, setValue } = useAccessibility(key, false);
      return (
        <button onClick={() => setValue(!value)}>Value {String(value)}</button>
      );
    }
    render(
      <Widget>
        <Feature />
      </Widget>,
    );
    fireEvent.click(screen.getByLabelText("Accessibility"));
    fireEvent.click(screen.getByText("Value false"));
    expect(screen.getByText("Value true")).toBeVisible();
  },
);
it("allows a custom control to synchronize state in its mount effect", () => {
  function Feature() {
    const { value, setValue } = useAccessibility("effect-initialized", false);
    useEffect(() => {
      setValue(true);
    }, [setValue]);
    return <button>Initialized {String(value)}</button>;
  }
  render(
    <Widget>
      <Feature />
    </Widget>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  expect(screen.getByText("Initialized true")).toBeVisible();
});
it("returns focus and retains the selected effect when the list is removed", () => {
  function App() {
    const [show, setShow] = useState(true);
    return (
      <AccessibilityPlugin>
        <AccessibilityButton />
        {show && (
          <AccessibilityList>
            <Custom />
            <button onClick={() => setShow(false)}>Remove list</button>
          </AccessibilityList>
        )}
      </AccessibilityPlugin>
    );
  }
  render(<App />);
  const trigger = screen.getByLabelText("Accessibility");
  fireEvent.click(trigger);
  fireEvent.click(screen.getByText("Custom false"));
  fireEvent.click(screen.getByText("Remove list"));
  expect(trigger).toHaveFocus();
  expect(document.body.dataset.custom).toBe("true");
});
it("restores nullable custom state before a mount effect initializes defaults", () => {
  saveState({ nullable: "saved choice" });
  function Feature() {
    const { value, setValue } = useAccessibility<string | null>(
      "nullable",
      null,
      {
        validate: (candidate): candidate is string | null =>
          candidate === null || typeof candidate === "string",
      },
    );
    useEffect(() => {
      if (value === null) setValue("fallback choice");
    }, [value, setValue]);
    return <span>Choice: {value}</span>;
  }
  render(
    <Widget>
      <Feature />
    </Widget>,
  );
  fireEvent.click(screen.getByLabelText("Accessibility"));
  expect(screen.getByText("Choice: saved choice")).toBeVisible();
});
