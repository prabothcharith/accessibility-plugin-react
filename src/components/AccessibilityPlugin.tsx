import { type ReactNode } from "react";
import {
  AccessibilityProvider,
  useAccessibility,
} from "./AccessibilityContext";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, RotateCcw } from "lucide-react";

// Internal Widget Component
const AccessibilityWidget = ({
  children,
  trigger,
}: {
  children: ReactNode;
  trigger?: ReactNode;
}) => {
  const { isWidgetOpen, toggleWidget, reset } = useAccessibility();

  return (
    <div className="fixed z-[9999] font-sans text-base">
      {/* Trigger Button */}
      {!isWidgetOpen && (
        <motion.button
          drag
          dragMomentum={false}
          dragElastic={0.1}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.2, cursor: "grabbing" }}
          onClick={toggleWidget}
          className="fixed right-5 bottom-5 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-shadow z-[10000] cursor-grab"
        >
          {trigger || <Settings2 className="w-8 h-8" />}
          <span className="sr-only">Open Accessibility Menu</span>
        </motion.button>
      )}

      {/* Panel */}
      <AnimatePresence>
        {isWidgetOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-2xl overflow-y-auto"
          >
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-background/95 backdrop-blur z-10">
              <h2 className="text-lg font-semibold">Accessibility</h2>
              <div className="flex gap-2">
                <button
                  onClick={reset}
                  className="p-2 hover:bg-muted rounded-md"
                  title="Reset All"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={toggleWidget}
                  className="p-2 hover:bg-muted rounded-md"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface AccessibilityPluginProps {
  children?: ReactNode;
  trigger?: ReactNode;
}

export const AccessibilityPlugin = ({
  children,
  trigger,
}: AccessibilityPluginProps) => {
  return (
    <AccessibilityProvider>
      <AccessibilityWidget trigger={trigger}>{children}</AccessibilityWidget>
    </AccessibilityProvider>
  );
};
