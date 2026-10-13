import { useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
export function WidgetPortal({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    subscribe,
    clientSnapshot,
    serverSnapshot,
  );
  return mounted
    ? createPortal(
        <div data-arap-ui="" className="arap-root">
          {children}
        </div>,
        document.body,
      )
    : null;
}
