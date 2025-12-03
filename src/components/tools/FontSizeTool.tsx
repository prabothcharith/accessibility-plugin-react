import { useAccessibility } from "../AccessibilityContext";
import { Type, Minus, Plus } from "lucide-react";

export const FontSizeTool = () => {
  const { fontSize, setFontSize } = useAccessibility();

  const increase = () => setFontSize(Math.min(fontSize + 0.1, 2));
  const decrease = () => setFontSize(Math.max(fontSize - 0.1, 0.8));

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Type className="w-4 h-4" />
        <span>Font Size ({Math.round(fontSize * 100)}%)</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={fontSize <= 0.8}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((fontSize - 0.8) / 1.2) * 100}%` }}
          />
        </div>
        <button
          onClick={increase}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={fontSize >= 2}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
