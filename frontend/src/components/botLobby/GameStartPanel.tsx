import { memo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Info,
  ChevronRight,
  X,
  ChessKing,
  Zap,
  Dices,
} from "lucide-react";
import type { Tier } from "@/utils/tiers";

interface GameStartPanelProps {
  level: number | null;
  tier: Tier | null;
  isSkipGate?: boolean;
  onStart: (color: "w" | "b" | "random") => void;
  onSelect: (color: "w" | "b" | "random") => void;
  onClose: () => void;
  starting: boolean;
  selectedColor: "w" | "b" | "random";
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
    icon: <Dices />,
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

function GameStartPanelFn({
  level,
  tier,
  isSkipGate,
  onStart,
  onSelect,
  onClose,
  starting,
  selectedColor,
}: GameStartPanelProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const open = level !== null && tier !== null;
  const primary = tier?.theme.primary ?? "var(--gold)";
  const primarySubtle = `${primary}22`;
  const primaryBorder = `${primary}55`;

  return (
    <AnimatePresence>
      {open && (
        <>
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
                borderLeft: `1px solid ${primaryBorder}`,
                boxShadow: `var(--shadow-glass), 0 0 24px ${primary}22`,
              }}
            >
              <button
                onClick={onClose}
                className="absolute top-3 right-3 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>

              {isSkipGate ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: primarySubtle, color: primary }}
                    >
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <div
                        className="text-xs font-semibold tracking-wide uppercase"
                        style={{ color: primary }}
                      >
                        Tier Skip Challenge
                      </div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {tier?.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="rounded-lg px-3 py-2 text-xs"
                    style={{
                      background: primarySubtle,
                      border: `1px solid ${primaryBorder}`,
                      color: primary,
                    }}
                  >
                    ⚡ Beat this level to jump in{" "}
                    <strong>{tier?.name} tier</strong> and skip all previous
                    levels.
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
                    style={{ background: primarySubtle, color: primary }}
                  >
                    {level}
                  </div>
                  <div>
                    <div className="text-xs tracking-wide text-muted-foreground uppercase">
                      {tier?.name}
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">
                      Level {level}
                    </h3>
                  </div>
                </div>
              )}

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
                      onClick={() => onSelect(color.id)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-left transition-all"
                      style={{
                        background:
                          selectedColor === color.id
                            ? primarySubtle
                            : "var(--bg-elevated)",
                        border:
                          selectedColor === color.id
                            ? `1.5px solid ${primary}`
                            : "1px solid var(--border-default)",
                      }}
                    >
                      <span
                        className="text-2xl"
                        style={{
                          color:
                            color.id === "b"
                              ? "var(--muted-foreground)"
                              : color.id === "random"
                                ? primary
                                : "var(--foreground)",
                        }}
                      >
                        {color.icon}
                      </span>
                      <div className="flex-1">
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color:
                              selectedColor === color.id
                                ? primary
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
                          style={{ background: primary }}
                        >
                          <ChevronRight
                            className="h-3 w-3"
                            style={{ color: "var(--bg-base)" }}
                          />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div
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
                    style={{ color: primary }}
                  >
                    {COLORS.find((c) => c.id === selectedColor)?.advantage}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onStart(selectedColor)}
                  disabled={starting}
                  className="font-display flex cursor-pointer items-center justify-center gap-2 rounded-lg py-3.5 text-center text-base font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60"
                  style={{
                    background: `linear-gradient(135deg, ${primary}dd 0%, ${primary}aa 100%)`,
                    color: "var(--bg-base)",
                    boxShadow: `0 0 20px ${primary}44`,
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
                  ) : isSkipGate ? (
                    <>
                      <Zap className="h-4 w-4" />
                      Challenge
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
                💡 5 free hints
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export const GameStartPanel = memo(GameStartPanelFn);
