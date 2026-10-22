import { useContext, useEffect, useRef, useState } from "react";
import { AccessibilityContext } from "./AccessibilityContext";
import { corners, defaultCorner, pointFromPixels } from "./widgetPlacement";
import { resolveLocaleStrings } from "./i18n";

export function PositionControls() {
  const ctx = useContext(AccessibilityContext)!;
  const strings = resolveLocaleStrings(ctx.locale);
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
        {strings.moveButton}
      </button>
      <div
        id={`${ctx.panelId}-position`}
        className="arap-position-popover"
        hidden={!open}
        role="group"
        aria-label={strings.moveButtonLabel}
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
          {strings.positionLabel}
        </label>
        <select
          ref={select}
          id={`${ctx.panelId}-corner`}
          aria-label={strings.buttonPositionSelectLabel}
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
            {strings.customPosition}
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
              ["left", -20, 0, "←", strings.moveLeft],
              ["up", 0, -20, "↑", strings.moveUp],
              ["down", 0, 20, "↓", strings.moveDown],
              ["right", 20, 0, "→", strings.moveRight],
            ] as const
          ).map(([direction, dx, dy, arrowChar, label]) => (
            <button
              type="button"
              key={direction}
              aria-label={label}
              onClick={(event) => {
                event.currentTarget.focus();
                move(dx, dy);
              }}
            >
              {arrowChar}
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
          {strings.resetPosition}
        </button>
        <button className="arap-position-default" type="button" onClick={close}>
          {strings.doneMoving}
        </button>
      </div>
    </div>
  );
}
