import { useAccessibility } from "../AccessibilityContext";
import { MousePointer2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { type CursorMode } from "../types";

export const CursorTool = () => {
  const { cursor, setCursor } = useAccessibility();

  const options: { mode: CursorMode; label: string }[] = [
    { mode: "normal", label: "Normal" },
    { mode: "big", label: "Big Cursor" },
    { mode: "reading-guide", label: "Reading Guide" },
  ];

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MousePointer2 className="w-4 h-4" />
        <span>Cursor</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.mode}
            onClick={() => setCursor(opt.mode)}
            className={cn(
              "px-3 py-2 text-sm border rounded-md flex-1 hover:bg-muted",
              cursor === opt.mode &&
                "bg-primary text-primary-foreground border-primary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};
