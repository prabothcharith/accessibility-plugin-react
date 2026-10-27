import React from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  DiagnosticsHarness,
  useDiagnostics,
  AccessibilityPlugin,
  DIAGNOSTICS_DISCLAIMER,
} from "../src";

function TestConsumerWithHook() {
  const report = useDiagnostics({ force: true, logToConsole: false });
  return (
    <div data-testid="diagnostics-consumer">
      <span data-testid="total-count">{report.summary.total}</span>
      <span data-testid="disclaimer">{report.disclaimer}</span>
    </div>
  );
}

describe("DiagnosticsHarness and Widget Integration (A11Y-405)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  describe("DiagnosticsHarness Component", () => {
    it("renders trigger badge with issue count in dev/force mode", () => {
      render(
        <div>
          <main>
            <h1>Test Header</h1>
            <p>Some text</p>
          </main>
          <DiagnosticsHarness force={true} />
        </div>,
      );

      const badgeBtn = screen.getByRole("button", {
        name: /open accessibility diagnostics/i,
      });
      expect(badgeBtn).toBeInTheDocument();
      expect(screen.getByText("Diagnostics")).toBeInTheDocument();
    });

    it("opens diagnostics panel when trigger badge is clicked", async () => {
      render(
        <div>
          <main>
            <h1>Test Header</h1>
          </main>
          <DiagnosticsHarness force={true} />
        </div>,
      );

      const badgeBtn = screen.getByRole("button", {
        name: /open accessibility diagnostics/i,
      });
      fireEvent.click(badgeBtn);

      expect(
        screen.getByRole("region", { name: /integration diagnostics panel/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(DIAGNOSTICS_DISCLAIMER)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /close diagnostics panel/i }),
      ).toBeInTheDocument();
    });

    it("allows category tab switching", async () => {
      render(
        <div>
          <main>
            <h1>Heading</h1>
            <img src="avatar.jpg" />
          </main>
          <DiagnosticsHarness force={true} defaultOpen={true} />
        </div>,
      );

      // Re-run diagnostics after full DOM render
      fireEvent.click(
        screen.getByRole("button", { name: /re-run diagnostics/i }),
      );

      const domTab = screen.getByRole("tab", { name: /^dom$/i });
      fireEvent.click(domTab);
      expect(domTab).toHaveAttribute("aria-selected", "true");

      await waitFor(() => {
        expect(
          screen.getByText(/images missing alt attribute/i),
        ).toBeInTheDocument();
      });
    });

    it("closes panel when close button is clicked", () => {
      render(
        <div>
          <main>
            <h1>Header</h1>
          </main>
          <DiagnosticsHarness force={true} defaultOpen={true} />
        </div>,
      );

      const closeBtn = screen.getByRole("button", {
        name: /close diagnostics panel/i,
      });
      fireEvent.click(closeBtn);

      expect(
        screen.queryByRole("region", {
          name: /integration diagnostics panel/i,
        }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /open accessibility diagnostics/i }),
      ).toBeInTheDocument();
    });
  });

  describe("useDiagnostics Hook", () => {
    it("returns diagnostics report with disclaimer and summary", () => {
      render(<TestConsumerWithHook />);
      expect(screen.getByTestId("disclaimer").textContent).toBe(
        DIAGNOSTICS_DISCLAIMER,
      );
    });
  });

  describe("AccessibilityPlugin diagnostics prop", () => {
    it("runs diagnostics callback when diagnostics prop object is passed", async () => {
      const onReport = vi.fn();
      render(
        <AccessibilityPlugin
          diagnostics={{ force: true, logToConsole: false, onReport }}
        >
          <main>
            <h1>Accessible Header</h1>
            <p>Main content</p>
          </main>
        </AccessibilityPlugin>,
      );

      await waitFor(() => {
        expect(onReport).toHaveBeenCalled();
      });

      const report = onReport.mock.calls[0][0];
      expect(report.disclaimer).toBe(DIAGNOSTICS_DISCLAIMER);
      expect(report.summary).toBeDefined();
    });
  });
});
