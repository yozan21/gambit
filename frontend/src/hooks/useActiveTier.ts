// hooks/useActiveTier.ts
import { useEffect, useRef, useState } from "react";

/**
 * Tracks which tier section currently spans the vertical center of
 * `containerRef`. Computed directly from scroll position on every frame
 * (RAF-throttled) rather than via IntersectionObserver — a zero-height
 * "center line" root is geometrically degenerate (always zero overlap
 * area), which makes IntersectionObserver's own intersecting/not-
 * intersecting firing unreliable at exactly that line during slow,
 * oscillating scroll. Direct math has no such edge case: it's a plain
 * number comparison, recomputed fresh every scroll event, so it can't
 * get "stuck" on a missed notification.
 */
export function useActiveTier(
  containerRef: React.RefObject<HTMLDivElement | null>,
  count: number,
  initial = 0,
) {
  const [active, setActive] = useState(initial);
  const boundsRef = useRef<{ index: number; top: number }[]>([]);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const sections = Array.from(
        container.querySelectorAll<HTMLElement>("[data-tier-index]"),
      );
      const containerRect = container.getBoundingClientRect();
      boundsRef.current = sections
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            index: Number(el.dataset.tierIndex),
            top: rect.top - containerRect.top + container.scrollTop,
          };
        })
        .sort((a, b) => a.top - b.top);
    };

    const updateActive = () => {
      const centerLine = container.scrollTop + container.clientHeight / 2;
      const bounds = boundsRef.current;

      // Last section whose top has been crossed by the center line. Since
      // sections are contiguous and sorted, this is always exactly one
      // unambiguous answer — including graceful clamping during overscroll
      // bounce past the first/last section.
      let match = bounds[0]?.index ?? 0;
      for (const b of bounds) {
        if (b.top <= centerLine) match = b.index;
        else break;
      }

      setActive((prev) => (prev === match ? prev : match));
    };

    measure();
    updateActive();

    const handleScroll = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateActive();
      });
    };

    const handleResize = () => {
      measure();
      updateActive();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    container
      .querySelectorAll<HTMLElement>("[data-tier-index]")
      .forEach((el) => ro.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return active;
}
