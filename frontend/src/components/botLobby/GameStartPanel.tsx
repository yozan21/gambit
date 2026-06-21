// components/botLobby/GameStartPanel.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, ChevronRight, X, ChessKing, Dice5 } from "lucide-react";

interface GameStartPanelProps {
  level: number | null;
  tierName: string;
  onStart: (color: "w" | "b" | "random") => void;
  onClose: () => void;
  starting: boolean;
}

const COLORS = [
  {
    id: "w" as const,
    label: "White",
    icon: <ChessKing />,
    description: "You move first",
    advantage: "Initiative",
  },
  {
    id: "random" as const,
    label: "Random",
    icon: <Dice5 />,
    description: "Let fate decide",
    advantage: "Surprise",
  },
  {
    id: "b" as const,
    label: "Black",
    icon: <ChessKing />,
    description: "Bot moves first",
    advantage: "Counter-play",
  },
];

export function GameStartPanel({
  level,
  tierName,
  onStart,
  onClose,
  starting,
}: GameStartPanelProps) {
  const [selectedColor, setSelectedColor] = useState<"w" | "b" | "random">(
    "random",
  );
  const [showTooltip, setShowTooltip] = useState(false);

  const open = level !== null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — visually separates modal from map, intentionally
              NOT clickable to close (per spec: only X / Close button). */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-6"
          >
            <div
              className="glass-card relative flex w-full max-w-sm flex-col gap-5 p-5 lg:w-80"
              style={{
                borderLeft: "1px solid var(--border-gold)",
                boxShadow: "var(--shadow-glass), var(--shadow-glow)",
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                    style={{
                      background: "var(--gold-subtle)",
                      color: "var(--gold)",
                    }}
                  >
                    {level}
                  </div>
                  <div>
                    <div className="text-xs tracking-wide text-muted-foreground uppercase">
                      {tierName}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Level {level}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="divider" />

              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    Choose Color
                  </span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                    <AnimatePresence>
                      {showTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute top-6 left-0 z-50 w-48 rounded-lg p-3 text-xs text-muted-foreground"
                          style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-default)",
                            boxShadow: "var(--shadow-lg)",
                          }}
                        >
                          White moves first. Black responds. Random picks for
                          you.
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {COLORS.map((color) => (
                    <motion.button
                      key={color.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedColor(color.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-all"
                      style={{
                        background:
                          selectedColor === color.id
                            ? "var(--gold-subtle)"
                            : "var(--bg-elevated)",
                        border:
                          selectedColor === color.id
                            ? "1.5px solid var(--gold)"
                            : "1px solid var(--border-default)",
                      }}
                    >
                      <span
                        className={`text-2xl ${color.id === "b" ? "text-muted-foreground" : color.id === "random" ? "text-accent-foreground" : "text-foreground"}`}
                      >
                        {color.icon}
                      </span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color:
                              selectedColor === color.id
                                ? "var(--gold-light)"
                                : "var(--text-secondary)",
                          }}
                        >
                          {color.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {color.description}
                        </div>
                      </div>
                      {selectedColor === color.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex h-5 w-5 items-center justify-center rounded-full"
                          style={{ background: "var(--gold)" }}
                        >
                          <ChevronRight
                            className="h-3 w-3"
                            style={{ color: "var(--primary-foreground)" }}
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-lg p-3"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Strategic advantage
                  </span>
                  <span
                    className="text-xs font-medium"
                    style={{ color: "var(--gold)" }}
                  >
                    {COLORS.find((c) => c.id === selectedColor)?.advantage}
                  </span>
                </div>
              </motion.div>

              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStart(selectedColor)}
                  disabled={starting}
                  className="font-display flex cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-center text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
                    color: "var(--bg-base)",
                    boxShadow: "var(--shadow-glow-md)",
                  }}
                >
                  {starting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                      />
                      Starting...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Start Game
                    </>
                  )}
                </motion.button>

                <button
                  onClick={onClose}
                  className="cursor-pointer rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  style={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                  }}
                >
                  Close
                </button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                💡 3 free hints • Watch ads for more
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
