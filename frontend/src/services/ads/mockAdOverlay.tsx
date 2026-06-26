// services/ads/MockAdOverlay.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2 } from "lucide-react";

interface MockAdOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const AD_DURATION = 30; // seconds — reward only granted if watched fully
const SKIP_AFTER = 5; // seconds before skip button appears

export function MockAdOverlay({ onComplete, onSkip }: MockAdOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION);
  const [canSkip, setCanSkip] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    const total = AD_DURATION * 1000;

    const tick = (now: number) => {
      if (startRef.current === null) startRef.current = now;
      const elapsed = now - startRef.current;
      const pct = Math.min(elapsed / total, 1);

      setProgress(pct);
      setSecondsLeft(Math.max(0, Math.ceil((total - elapsed) / 1000)));

      if (elapsed >= SKIP_AFTER * 1000) setCanSkip(true);

      if (pct >= 1) {
        // Full 30s watched — mark complete, auto-resolve after brief pause
        setCompleted(true);
        setTimeout(onComplete, 800);
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete]);

  // Visibility change — pause the timer if user tabs away (honest tracking)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      } else {
        // Adjust start so elapsed time doesn't count time spent hidden
        if (startRef.current !== null) {
          startRef.current = performance.now() - AD_DURATION * 1000 * progress;
        }
        const total = AD_DURATION * 1000;
        const tick = (now: number) => {
          if (startRef.current === null) return;
          const elapsed = now - startRef.current;
          const pct = Math.min(elapsed / total, 1);
          setProgress(pct);
          setSecondsLeft(Math.max(0, Math.ceil((total - elapsed) / 1000)));
          if (elapsed >= SKIP_AFTER * 1000) setCanSkip(true);
          if (pct >= 1) {
            setCompleted(true);
            setTimeout(onComplete, 800);
            return;
          }
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, [onComplete, progress]);

  const handleSkip = useCallback(() => {
    if (!canSkip) return;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    onSkip();
  }, [canSkip, onSkip]);

  const skipSecondsLeft = Math.max(0, SKIP_AFTER - (AD_DURATION - secondsLeft));

  return (
    <motion.div
      className="fixed inset-0 z-999 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "#000" }}
    >
      {/* Ad creative */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-6 px-8">
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex w-full max-w-md flex-col items-center gap-4 rounded-2xl p-8 text-center"
          style={{
            background:
              "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            className="font-display flex flex-col items-center justify-center rounded-2xl text-4xl"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <img src="/Gambit.png" alt="Gambit" />
            <p className="tracking-widest text-primary">GAMBIT</p>
          </div>
          <div>
            <p className="text-xs font-medium tracking-widest text-white/40 uppercase">
              Advertisement
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              Master Your Chess Techniques
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Train with grandmaster-level puzzles and take your game to the
              next level.
            </p>
          </div>
          <div
            className="mt-2 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
            style={{ background: "var(--gold)", color: "#000" }}
          >
            Learn More
          </div>
        </motion.div>

        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <Volume2 className="h-3 w-3" />
          Ad audio muted
        </div>
      </div>

      {/* HUD */}
      <div className="shrink-0 px-4 pb-8">
        {/* Reward label */}
        <div className="mb-3 flex items-center justify-center gap-2">
          <AnimatePresence mode="wait">
            {completed ? (
              <motion.p
                key="done"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold"
                style={{ color: "var(--gold)" }}
              >
                ✓ Reward unlocked!
              </motion.p>
            ) : (
              <motion.p
                key="watching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-white/40"
              >
                Watch the full ad to earn your reward
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div
          className="h-1.5 w-full overflow-hidden rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              width: `${progress * 100}%`,
              background: completed
                ? "var(--gold)"
                : `linear-gradient(90deg, var(--gold) ${progress * 100}%, rgba(255,255,255,0.3) 100%)`,
              transition: "background 0.3s",
            }}
          />
        </div>

        {/* Timer + skip */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-white/40">
            {completed
              ? `${AD_DURATION}s watched`
              : `${secondsLeft}s remaining`}
          </p>

          <AnimatePresence mode="wait">
            {canSkip ? (
              <motion.button
                key="skip"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleSkip}
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold text-white/60 transition-colors hover:text-white"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <X className="h-3 w-3" />
                Skip Ad
                <span className="text-white/30">(no reward)</span>
              </motion.button>
            ) : (
              <motion.div
                key="timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-full px-4 py-1.5 text-xs text-white/25"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                Skip in {skipSecondsLeft}s
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
