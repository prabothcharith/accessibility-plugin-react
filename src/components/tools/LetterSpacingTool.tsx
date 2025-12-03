import { useAccessibility } from "../AccessibilityContext";
import { MoveHorizontal, Minus, Plus } from "lucide-react";

export const LetterSpacingTool = () => {
  const { letterSpacing, setLetterSpacing } = useAccessibility();

  const increase = () => setLetterSpacing(Math.min(letterSpacing + 0.05, 0.5));
  const decrease = () => setLetterSpacing(Math.max(letterSpacing - 0.05, 0));

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MoveHorizontal className="w-4 h-4" />
        <span>Letter Spacing ({letterSpacing.toFixed(2)})</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrease}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={letterSpacing <= 0}
        >
          <Minus className="w-4 h-4" />
        </button>
        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(letterSpacing / 0.5) * 100}%` }}
          />
        </div>
        <button
          onClick={increase}
          className="p-2 border rounded-md hover:bg-muted"
          disabled={letterSpacing >= 0.5}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
