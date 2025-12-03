import { useAccessibility } from "../AccessibilityContext";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { cn } from "@/lib/utils";
import { type TextAlign } from "../types";
import { type ReactNode } from "react";

export const TextAlignTool = () => {
  const { textAlign, setTextAlign } = useAccessibility();

  const options: { align: TextAlign; icon: ReactNode }[] = [
    { align: "left", icon: <AlignLeft className="w-4 h-4" /> },
    { align: "center", icon: <AlignCenter className="w-4 h-4" /> },
    { align: "right", icon: <AlignRight className="w-4 h-4" /> },
    { align: "initial", icon: <AlignJustify className="w-4 h-4" /> },
  ];

  return (
    <div className="col-span-2 space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <AlignLeft className="w-4 h-4" />
        <span>Text Align</span>
      </div>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.align}
            onClick={() => setTextAlign(opt.align)}
            className={cn(
              "p-2 border rounded-md flex-1 flex justify-center hover:bg-muted",
              textAlign === opt.align &&
                "bg-primary text-primary-foreground border-primary"
            )}
            title={opt.align}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    </div>
  );
};
