// pages/ComingSoon.tsx
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Bot, ArrowLeft } from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ComingSoon() {
  const navigate = useNavigate();
  usePageTitle("Coming Soon");

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden pt-20 sm:items-center sm:pt-0">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-6 text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "var(--gold-subtle)",
              border: "1px solid var(--border-gold)",
            }}
          >
            <Bot className="h-9 w-9" style={{ color: "var(--gold)" }} />
          </motion.div>

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-widest uppercase"
            style={{
              background: "var(--gold-subtle)",
              border: "1px solid var(--border-gold)",
              color: "var(--gold)",
            }}
          >
            <span
              className="h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: "var(--gold)" }}
            />
            In Development
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-bold text-foreground">
              Bot Mode
              <br />
              <span className="text-gradient-gold">Coming Soon</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We're integrating Stockfish engine to give you a worthy opponent.
              Stay tuned.
            </p>
          </div>

          <div className="divider w-full" />

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
