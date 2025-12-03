import { useAccessibility } from "../AccessibilityContext";
import { ImageOff, Link } from "lucide-react";
import { cn } from "@/lib/utils";

export const VisualTogglesTool = () => {
  const { hideImages, setHideImages, highlightLinks, setHighlightLinks } =
    useAccessibility();

  return (
    <div className="col-span-2 grid grid-cols-2 gap-2">
      <button
        onClick={() => setHideImages(!hideImages)}
        className={cn(
          "p-3 border rounded-md flex flex-col items-center gap-2 hover:bg-muted transition-colors",
          hideImages && "bg-primary text-primary-foreground border-primary"
        )}
      >
        <ImageOff className="w-5 h-5" />
        <span className="text-sm">Hide Images</span>
      </button>
      <button
        onClick={() => setHighlightLinks(!highlightLinks)}
        className={cn(
          "p-3 border rounded-md flex flex-col items-center gap-2 hover:bg-muted transition-colors",
          highlightLinks && "bg-primary text-primary-foreground border-primary"
        )}
      >
        <Link className="w-5 h-5" />
        <span className="text-sm">Highlight Links</span>
      </button>
    </div>
  );
};
