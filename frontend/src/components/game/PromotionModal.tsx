import { motion, AnimatePresence } from "framer-motion";
import type { PlayerColor } from "../../types/socket.types";
import type { PromotionPiece } from "../../types/chess.types";
import { PROMOTION_ORDER, PROMOTION_LABELS } from "../../types/chess.types";

interface PromotionModalProps {
  isOpen: boolean;
  color: PlayerColor;
  onSelect: (piece: PromotionPiece) => void;
}

const PIECE_UNICODE: Record<PromotionPiece, string> = {
  q: "♕",
  r: "♖",
  b: "♗",
  n: "♘",
};

export default function PromotionModal({
  isOpen,
  // color,
  onSelect,
}: PromotionModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="space-y-6"
          >
            <h2 className="font-display text-center text-2xl font-bold text-foreground">
              Choose Promotion
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {PROMOTION_ORDER.map((piece, index) => (
                <motion.button
                  key={piece}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSelect(piece)}
                  autoFocus={piece === "q"} // Queen autofocus
                  className="glass-card hover:border-gold focus:ring-gold flex flex-col items-center gap-2 rounded-lg p-6 transition-all focus:ring-2 focus:outline-none"
                  style={{
                    borderColor: "var(--border-gold)",
                  }}
                >
                  <div className="text-6xl">{PIECE_UNICODE[piece]}</div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {PROMOTION_LABELS[piece]}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
