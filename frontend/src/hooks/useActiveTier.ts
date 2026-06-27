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
  threshold: "center" | "top" = "center",
) {
  const [active, setActive] = useState(initial);
  const boundsRef = useRef<{ index: number; top: number }[]>([]);
  const rafRef = useRef<number | null>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tracks whether the user has scrolled at least once — prevents
  // ResizeObserver's immediate mount-time fire from overwriting the
  // correct `initial` state before the page's own scroll-to-node settles.
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const sections = Array.from(
        container.querySelectorAll<HTMLElement>("[data-tier-index]"),
      );
      boundsRef.current = sections
        .map((el) => ({
          index: Number(el.dataset.tierIndex),
          top: el.offsetTop,
        }))
        .sort((a, b) => a.top - b.top);
    };

    const updateActive = () => {
      const triggerLine =
        threshold === "center"
          ? container.scrollTop + container.clientHeight / 2
          : container.scrollTop + 80;

      const bounds = boundsRef.current;
      let match = bounds[0]?.index ?? 0;
      for (const b of bounds) {
        if (b.top <= triggerLine) match = b.index;
        else break;
      }

      setActive((prev) => (prev === match ? prev : match));
    };

    measure();

    const handleScroll = () => {
      hasScrolledRef.current = true;

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        updateActive(); // uses existing bounds — fast, no re-measure
      });

      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      scrollEndTimerRef.current = setTimeout(() => {
        measure(); // re-measure before final authoritative check
        updateActive();
      }, 300);
    };

    const handleScrollEnd = () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
      measure(); // re-measure here too
      updateActive();
    };

    const handleResize = () => {
      measure();
      // Skip updateActive on resize until the user has actually scrolled —
      // ResizeObserver fires on mount (initial layout observation) which
      // would call updateActive with scrollTop=0, showing the wrong tier
      // before the page's own scroll-to-node effect has a chance to run.
      if (hasScrolledRef.current) updateActive();
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd, { passive: true });
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    container
      .querySelectorAll<HTMLElement>("[data-tier-index]")
      .forEach((el) => ro.observe(el));

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("scrollend", handleScrollEnd);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    };
  }, [count, threshold, containerRef]);

  return active;
}
