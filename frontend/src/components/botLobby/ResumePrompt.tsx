// components/botLobby/ResumePrompt.tsx
import { motion, AnimatePresence } from "framer-motion";
import { Swords } from "lucide-react";

interface ResumePromptProps {
  level: number | null;
  open: boolean;
  onContinue: () => void;
  onStartFresh: () => void;
}

export function ResumePrompt({
  level,
  open,
  onContinue,
  onStartFresh,
}: ResumePromptProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="glass-card flex w-full max-w-sm flex-col items-center gap-4 p-6 text-center"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: "var(--gold-subtle)",
                border: "1px solid var(--border-gold)",
              }}
            >
              <Swords className="h-5 w-5" style={{ color: "var(--gold)" }} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-foreground">
                Unfinished Game
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You have a game in progress at Level {level}. Continue or start
                fresh?
              </p>
            </div>
            <div className="flex w-full flex-col gap-2">
              <button
                onClick={onContinue}
                className="cursor-pointer rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: "var(--gold)",
                  color: "var(--primary-foreground)",
                }}
              >
                Continue Game
              </button>
              <button
                onClick={onStartFresh}
                className="cursor-pointer rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                Start Fresh
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
