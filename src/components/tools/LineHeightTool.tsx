import { useAccessibility } from "../AccessibilityContext";
import { ArrowUpDown, Minus, Plus } from "lucide-react";

export const LineHeightTool = () => {
  const { lineHeight, setLineHeight } = useAccessibility();

  const increase = () => setLineHeight(Math.min(lineHeight + 0.1, 3));
  const decrease = () => setLineHeight(Math.max(lineHeight - 0.1, 1));

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ArrowUpDown className="w-4 h-4" />
        <span>Line Height ({lineHeight.toFixed(1)})</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={lineHeight <= 1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${((lineHeight - 1) / 2) * 100}%` }}
          />
        </div>
        <button
          onClick={increase}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={lineHeight >= 3}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
