// components/game/HintPieceAnimation.tsx
import { useEffect, useRef, useCallback, useReducer } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HintPieceAnimationProps {
  boardRef: React.RefObject<HTMLDivElement | null>;
  hintSquares: { from: string; to: string } | null;
  orientation: "white" | "black";
  cancelSignal: number;
}

interface AnimState {
  visible: boolean;
  pieceSvgHtml: string;
  animKey: number;
  from: { x: number; y: number };
  to: { x: number; y: number };
  sq: number;
}

type AnimAction =
  | { type: "START"; payload: Omit<AnimState, "visible"> }
  | { type: "CANCEL" }
  | { type: "DONE" };

const INIT: AnimState = {
  visible: false,
  pieceSvgHtml: "",
  animKey: 0,
  from: { x: 0, y: 0 },
  to: { x: 0, y: 0 },
  sq: 0,
};

function reducer(state: AnimState, action: AnimAction): AnimState {
  switch (action.type) {
    case "START":
      return { ...action.payload, visible: true };
    case "CANCEL":
    case "DONE":
      return { ...state, visible: false };
    default:
      return state;
  }
}

function squareToXY(
  square: string,
  boardSize: number,
  orientation: "white" | "black",
): { x: number; y: number } {
  const sq = boardSize / 8;
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  return orientation === "white"
    ? { x: file * sq + sq / 2, y: (7 - rank) * sq + sq / 2 }
    : { x: (7 - file) * sq + sq / 2, y: rank * sq + sq / 2 };
}

// Finds the SVG piece element at a given square and returns its outer HTML.
// react-chessboard renders pieces as <svg> or wraps them in a div with an svg
// child — we grab whichever is present on the source square.
function findPieceSvgHtml(
  board: HTMLDivElement,
  square: string,
): string | null {
  // react-chessboard marks squares with data-square attribute
  const squareEl = board.querySelector(`[data-square="${square}"]`);
  if (!squareEl) {
    // Fallback: scan all [data-square] elements
    console.warn("[HintAnim] data-square not found for", square);
    return null;
  }

  const svg = squareEl.querySelector("svg");
  if (!svg) {
    console.warn("[HintAnim] No SVG found inside square", square);
    return null;
  }

  // Clone so we can safely mutate attributes without touching the live board
  const clone = svg.cloneNode(true) as SVGElement;

  // Make it fill whatever container we put it in
  clone.setAttribute("width", "100%");
  clone.setAttribute("height", "100%");
  clone.style.width = "100%";
  clone.style.height = "100%";
  clone.style.overflow = "visible";

  return clone.outerHTML;
}

export function HintPieceAnimation({
  boardRef,
  hintSquares,
  orientation,
  cancelSignal,
}: HintPieceAnimationProps) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const prevKeyRef = useRef<string | null>(null);
  const rafRef = useRef<number | null>(null);
  const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const boardSizeRef = useRef(0);

  // Track board size
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    boardSizeRef.current = el.offsetWidth;
    const ro = new ResizeObserver(([e]) => {
      boardSizeRef.current = e.contentRect.width;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [boardRef]);

  // Cancel from outside
  useEffect(() => {
    if (cancelSignal === 0) return;
    rafRef.current = requestAnimationFrame(() => {
      dispatch({ type: "CANCEL" });
    });
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [cancelSignal]);

  // New hint arriving
  useEffect(() => {
    if (!hintSquares) {
      rafRef.current = requestAnimationFrame(() => {
        dispatch({ type: "CANCEL" });
        prevKeyRef.current = null;
      });
      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    const key = `${hintSquares.from}-${hintSquares.to}`;
    if (key === prevKeyRef.current) return;
    prevKeyRef.current = key;

    rafRef.current = requestAnimationFrame(() => {
      const board = boardRef.current;
      if (!board) return;

      const pieceSvgHtml = findPieceSvgHtml(board, hintSquares.from);
      if (!pieceSvgHtml) return;

      const boardSize = boardSizeRef.current || board.offsetWidth || 0;
      if (!boardSize) return;

      const sq = boardSize / 8;
      const from = squareToXY(hintSquares.from, boardSize, orientation);
      const to = squareToXY(hintSquares.to, boardSize, orientation);

      dispatch({
        type: "START",
        payload: {
          pieceSvgHtml,
          animKey: Date.now(),
          from,
          to,
          sq,
        },
      });
    });

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [hintSquares, boardRef, orientation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (doneTimerRef.current !== null) clearTimeout(doneTimerRef.current);
    };
  }, []);

  const handleAnimationComplete = useCallback(() => {
    doneTimerRef.current = setTimeout(() => {
      dispatch({ type: "DONE" });
    }, 600);
  }, []);

  const { visible, pieceSvgHtml, animKey, from, to, sq } = state;

  if (!sq) return null;

  const pieceSize = sq * 0.9;
  const midX = (to.x - from.x) / 2;
  const midY = (to.y - from.y) / 2 - sq * 1.2;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={animKey}
          className="pointer-events-none absolute inset-0 z-50"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
        >
          {/* Source square pulse */}
          <motion.div
            className="absolute"
            style={{
              width: sq,
              height: sq,
              left: from.x - sq / 2,
              top: from.y - sq / 2,
              background: "var(--gold)",
              borderRadius: 4,
            }}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />

          {/* Target square ring */}
          <motion.div
            className="absolute"
            style={{
              width: sq,
              height: sq,
              left: to.x - sq / 2,
              top: to.y - sq / 2,
              border: "3px solid var(--gold)",
              borderRadius: 4,
            }}
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 0.22, delay: 0.28 }}
          />

          {/* Cloned SVG piece — identical to what the board renders */}
          <motion.div
            style={{
              position: "absolute",
              width: pieceSize,
              height: pieceSize,
              left: from.x - pieceSize / 2,
              top: from.y - pieceSize / 2,
              filter:
                "drop-shadow(0 4px 12px rgba(0,0,0,0.7)) drop-shadow(0 0 10px rgba(255,200,80,0.45))",
            }}
            animate={{
              x: [0, midX, to.x - from.x],
              y: [0, midY, to.y - from.y],
              scale: [1, 1.22, 1],
            }}
            transition={{
              duration: 0.65,
              ease: [0.22, 0.68, 0.35, 1.0],
              times: [0, 0.42, 1],
            }}
            onAnimationComplete={handleAnimationComplete}
            dangerouslySetInnerHTML={{ __html: pieceSvgHtml }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
