import React from "react";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { Widget } from "./helpers";
import { TranslationController } from "../src/features/TranslationController";
import { createOfflineMockTranslationAdapter } from "../src/core/translationAdapter";

describe("A11Y-409: TranslationController Widget Integration", () => {
  let hostPara: HTMLParagraphElement;

  beforeEach(() => {
    cleanup();
    document.body.innerHTML = "";
    hostPara = document.createElement("p");
    hostPara.id = "host-para";
    hostPara.textContent = "Accessible website content";
    document.body.appendChild(hostPara);
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = "";
  });

  function renderWidget(children: React.ReactNode) {
    const result = render(<Widget>{children}</Widget>);
    fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
    return result;
  }

  it("renders TranslationController with prototype badge and accessible name", () => {
    renderWidget(<TranslationController />);

    expect(screen.getByTestId("translation-controller")).toBeInTheDocument();
    expect(screen.getByText("Page Translation")).toBeInTheDocument();
    expect(
      screen.getByText(/Research Prototype: Host content translation/i),
    ).toBeInTheDocument();
  });

  it("requires consent before displaying active translation controls", () => {
    renderWidget(<TranslationController />);

    // Initial state: consent banner is displayed
    expect(
      screen.getByText(
        /explicit user consent is required before transmitting host content/i,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /review & grant consent/i }),
    ).toBeInTheDocument();

    // Active translation controls should not yet be visible
    expect(
      screen.queryByRole("button", { name: /^translate page$/i }),
    ).not.toBeInTheDocument();
  });

  it("opens consent dialog, allows user to grant consent, and reveals translation controls", async () => {
    renderWidget(<TranslationController />);

    // Open consent dialog
    const reviewBtn = screen.getByRole("button", {
      name: /review & grant consent/i,
    });
    fireEvent.click(reviewBtn);

    expect(
      screen.getByRole("region", { name: /translation consent agreement/i }),
    ).toBeInTheDocument();

    // Click Grant Consent
    const grantBtn = screen.getByRole("button", { name: /^grant consent$/i });
    fireEvent.click(grantBtn);

    // Active translation controls should now be visible
    expect(
      screen.getByRole("button", { name: /^translate page$/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/target language/i)).toBeInTheDocument();
  });

  it("translates host document on Translate Page click and restores on Restore Original", async () => {
    const mockAdapter = createOfflineMockTranslationAdapter({
      latencyMs: 0,
      prefix: "[ES]",
    });

    renderWidget(<TranslationController provider={mockAdapter} />);

    // Review & grant consent
    fireEvent.click(
      screen.getByRole("button", { name: /^review & grant consent$/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^grant consent$/i }));

    // Click Translate Page
    const translateBtn = screen.getByRole("button", {
      name: /^translate page$/i,
    });
    await act(async () => {
      fireEvent.click(translateBtn);
    });

    // Content should now be translated
    expect(hostPara.textContent).toContain("[ES] Accessible website content");

    // Click Restore Original
    const restoreBtn = screen.getByRole("button", {
      name: /restore original/i,
    });
    expect(restoreBtn).not.toBeDisabled();

    act(() => {
      fireEvent.click(restoreBtn);
    });

    // Content should be restored
    expect(hostPara.textContent).toBe("Accessible website content");
  });

  it("revoking consent restores content and returns to unconsented state", async () => {
    const mockAdapter = createOfflineMockTranslationAdapter({
      latencyMs: 0,
      prefix: "[FR]",
    });

    renderWidget(<TranslationController provider={mockAdapter} />);

    // Grant consent
    fireEvent.click(
      screen.getByRole("button", { name: /^review & grant consent/i }),
    );
    fireEvent.click(screen.getByRole("button", { name: /^grant consent$/i }));

    // Translate
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /^translate page$/i }),
      );
    });
    expect(hostPara.textContent).toContain("[FR]");

    // Revoke consent
    const revokeBtn = screen.getByRole("button", {
      name: /revoke translation consent/i,
    });
    act(() => {
      fireEvent.click(revokeBtn);
    });

    // Content restored
    expect(hostPara.textContent).toBe("Accessible website content");
    // Banner returns
    expect(
      screen.getByText("Consent revoked. No translations will be performed."),
    ).toBeInTheDocument();
  });
});
