import { motion } from "framer-motion";
import NavLogo from "../NavLogo";

export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
      exit={{
        opacity: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
      }}
    >
      {/* Ambient glow */}
      <motion.div
        className="pointer-events-none absolute"
        animate={{
          opacity: [0.5, 1, 0.5],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: "400px",
          height: "200px",
          background:
            "radial-gradient(ellipse, rgba(201, 168, 76, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Logo */}
      <NavLogo animate size="lg" />

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-4 text-sm tracking-[0.3em] text-muted-foreground uppercase"
      >
        Play. Think. Conquer.
      </motion.p>

      {/* Loading bar */}
      <motion.div
        className="absolute bottom-12 w-30 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <div
          className="h-px w-full overflow-hidden rounded-full"
          style={{ background: "var(--border-default)" }}
        >
          <motion.div
            className="h-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--gold), transparent)",
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
