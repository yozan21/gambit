import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";

interface ScrollTocurrentButtonProps {
  currentNodeState: "visible" | "below" | "above";
  scrollToCurrentNode: () => void;
}

function ScrollToCurrentButton({
  currentNodeState,
  scrollToCurrentNode,
}: ScrollTocurrentButtonProps) {
  return (
    <AnimatePresence>
      {currentNodeState !== "visible" && (
        <motion.button
          key="goto-current"
          initial={{
            opacity: 0,
            scale: 0.85,
            y: currentNodeState === "below" ? 12 : -12,
          }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.85,
            y: currentNodeState === "below" ? 12 : -12,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          onClick={scrollToCurrentNode}
          className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-full p-2.5 text-sm font-semibold shadow-lg"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            color: "var(--gold)",
          }}
        >
          {currentNodeState === "below" ? (
            <ArrowDown className="h-4 w-4" />
          ) : (
            <ArrowUp className="h-4 w-4" />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export default ScrollToCurrentButton;
