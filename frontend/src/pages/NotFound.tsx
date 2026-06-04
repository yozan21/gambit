import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function NotFound() {
  const navigate = useNavigate();

  usePageTitle("Not Found");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gradient orbs */}
        <motion.div
          className="absolute top-1/4 -left-48 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 168, 76, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(201, 168, 76, 0.3) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(var(--border-gold) 1px, transparent 1px),
              linear-gradient(90deg, var(--border-gold) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {/* 404 Number with floating animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-8"
        >
          <motion.h1
            className="font-display text-[12rem] leading-none font-bold sm:text-[16rem]"
            style={{
              background:
                "linear-gradient(135deg, #e2c46a 0%, #c9a84c 50%, #8a6f32 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            404
          </motion.h1>

          {/* Glow effect behind number */}
          <motion.div
            className="absolute inset-0 -z-10 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(201, 168, 76, 0.3) 0%, transparent 70%)",
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-12 space-y-4"
        >
          <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
            Page Not Found
          </h2>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            The page you're looking for doesn't exist or has been moved to
            another dimension.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {/* Go Home Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 rounded-lg px-6 py-3 text-base font-medium transition-all"
            style={{
              background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
              color: "var(--bg-base)",
              boxShadow: "var(--shadow-glow)",
            }}
          >
            <Home className="h-5 w-5" />
            Go Home
          </motion.button>

          {/* Go Back Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-3 rounded-lg px-6 py-3 text-base font-medium transition-all"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-gold)",
              color: "var(--gold)",
            }}
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </motion.button>
        </motion.div>

        {/* Decorative chess pieces */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 flex items-center justify-center gap-8 text-6xl opacity-10"
        >
          <motion.span
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            ♔
          </motion.span>
          <motion.span
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            ♕
          </motion.span>
          <motion.span
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 2 }}
          >
            ♖
          </motion.span>
        </motion.div>

        {/* Search suggestion */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="glass-card mx-auto mt-12 max-w-md p-6"
        >
          <div className="flex items-start gap-3">
            <Search className="mt-1 h-5 w-5" style={{ color: "var(--gold)" }} />
            <div className="text-left">
              <h3 className="mb-1 font-semibold text-foreground">
                Looking for something?
              </h3>
              <p className="text-sm text-muted-foreground">
                Try going back to the homepage or check out your profile.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
