import { useContext, useEffect, useRef, useState } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { corners, defaultCorner, pointFromPixels } from "./widgetPlacement";

export function PositionControls() {
  const ctx = useContext(AccessibilityContext)!;
  const [open, setOpen] = useState(false);
  const select = useRef<HTMLSelectElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) select.current?.focus();
  }, [open]);
  const close = () => {
    setOpen(false);
    opener.current?.focus();
  };
  const move = (dx: number, dy: number) => {
    const trigger = document.getElementById(`${ctx.panelId}-trigger`);
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    ctx.setWidgetPlacement(
      pointFromPixels(rect.left + dx, rect.top + dy, rect.width, rect.height),
    );
  };
  return (
    <div className="arap-position-tools">
      <button
        ref={opener}
        className="arap-position-button"
        type="button"
        aria-expanded={open}
        aria-controls={`${ctx.panelId}-position`}
        onClick={(event) => {
          event.currentTarget.focus();
          setOpen(!open);
        }}
      >
        Move button
      </button>
      <div
        id={`${ctx.panelId}-position`}
        className="arap-position-popover"
        hidden={!open}
        role="group"
        aria-label="Move accessibility button"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            close();
          }
        }}
      >
        <label
          className="arap-position-label"
          htmlFor={`${ctx.panelId}-corner`}
        >
          Button position
        </label>
        <select
          ref={select}
          id={`${ctx.panelId}-corner`}
          aria-label="Accessibility button position"
          value={
            ctx.widgetPlacement?.kind === "point"
              ? "custom"
              : (ctx.widgetPlacement?.corner ?? defaultCorner(ctx.position))
          }
          onChange={(event) =>
            ctx.setWidgetPlacement({
              kind: "corner",
              corner: event.target.value as (typeof corners)[number],
            })
          }
        >
          <option value="custom" disabled>
            Custom position
          </option>
          {corners.map((corner) => (
            <option key={corner} value={corner}>
              {corner.split("-").join(" ")}
            </option>
          ))}
        </select>
        <div className="arap-position-arrows">
          {(
            [
              ["left", -20, 0, "←"],
              ["up", 0, -20, "↑"],
              ["down", 0, 20, "↓"],
              ["right", 20, 0, "→"],
            ] as const
          ).map(([direction, dx, dy, label]) => (
            <button
              type="button"
              key={direction}
              aria-label={`Move accessibility button ${direction}`}
              onClick={(event) => {
                event.currentTarget.focus();
                move(dx, dy);
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          className="arap-position-default"
          type="button"
          onClick={(event) => {
            event.currentTarget.focus();
            ctx.setWidgetPlacement(null);
          }}
        >
          Reset button position
        </button>
        <button className="arap-position-default" type="button" onClick={close}>
          Done moving
        </button>
      </div>
    </div>
  );
}
