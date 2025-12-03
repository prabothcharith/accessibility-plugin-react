import { useAccessibility } from "../AccessibilityContext";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ContrastMode } from "../types";

const modes: { mode: ContrastMode; label: string }[] = [
  { mode: "normal", label: "Normal" },
  { mode: "invert", label: "Invert" },
  { mode: "grayscale", label: "Grayscale" },
  { mode: "low-saturation", label: "Low Saturation" },
  { mode: "high-saturation", label: "High Saturation" },
  { mode: "yellow-on-black", label: "Yellow on Black" },
  { mode: "white-on-black", label: "White on Black" },
  { mode: "blue-on-yellow", label: "Blue on Yellow" },
];

export const ContrastTool = () => {
  const { contrast, setContrast } = useAccessibility();

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Palette className="w-4 h-4" />
        <span>Contrast & Color</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {modes.map((m) => (
          <button
            key={m.mode}
            onClick={() => setContrast(m.mode)}
            className={cn(
              "px-3 py-2 text-sm border rounded-md transition-colors text-left",
              contrast === m.mode
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-muted"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
};
