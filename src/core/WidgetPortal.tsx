import { useContext, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AccessibilityContext } from "./AccessibilityContext";
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export function WidgetPortal({ children }: { children: ReactNode }) {
  const ctx = useContext(AccessibilityContext);
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  return mounted
    ? createPortal(
        <div
          data-arap-ui=""
          data-arap-font={ctx?.activeFont ?? "default"}
          className="arap-root"
        >
          {children}
        </div>,
        document.body,
      )
    : null;
}
