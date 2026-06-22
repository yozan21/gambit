// hooks/useNodeInView.ts
import { useState, useEffect, useRef } from "react";

export function useNodeInView(
  nodeRef:
    | React.RefObject<HTMLButtonElement | null>
    | HTMLButtonElement
    | null
    | undefined,
  scrollRef: React.RefObject<HTMLDivElement | null>,
) {
  const [state, setState] = useState<"above" | "below" | "visible">("visible");
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const check = () => {
      const node = nodeRef && "current" in nodeRef ? nodeRef.current : nodeRef;
      if (!node) return;

      const containerRect = container.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();

      if (nodeRect.bottom < containerRect.top) {
        setState("above");
      } else if (nodeRect.top > containerRect.bottom) {
        setState("below");
      } else {
        setState("visible");
      }
    };

    const onScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        check();
      });
    };

    check();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [nodeRef, scrollRef]);

  return state;
}
