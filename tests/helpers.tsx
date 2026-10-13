import { type ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  AccessibilityPlugin,
  AccessibilityButton,
  AccessibilityList,
  ResetController,
} from "../src";
export function Widget({ children }: { children: ReactNode }) {
  return (
    <AccessibilityPlugin>
      <AccessibilityButton />
      <AccessibilityList>
        {children}
        <ResetController />
      </AccessibilityList>
    </AccessibilityPlugin>
  );
}
export function renderFeatures(children: ReactNode) {
  const host = document.createElement("main");
  host.id = "host";
  host.innerHTML =
    '<h1 style="font-size:20px;line-height:30px">Heading</h1><p>Text</p><a href="#">Link</a><img alt="Test image"/><video title="Test video"></video><iframe title="Map" src="about:blank"></iframe>';
  document.body.appendChild(host);
  const result = render(<Widget>{children}</Widget>);
  fireEvent.click(screen.getByRole("button", { name: "Accessibility" }));
  return { ...result, host };
}
