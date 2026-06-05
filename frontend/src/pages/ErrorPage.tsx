// pages/ErrorPage.tsx
import { useNavigate, useRouteError } from "react-router";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import Navbar from "@/components/ui/NavBar";

export default function ErrorPage() {
  const navigate = useNavigate();
  const error = useRouteError() as any;

  const message =
    error?.statusText || error?.message || "Something went wrong.";
  const status = error?.status;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20 sm:pt-0">
      <Navbar />

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(224,82,82,0.04) 0%, transparent 70%)",
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
            animate={{ rotate: [0, -5, 5, -5, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex h-20 w-20 items-center justify-center rounded-full"
            style={{
              background: "rgba(224,82,82,0.1)",
              border: "1px solid rgba(224,82,82,0.3)",
            }}
          >
            <AlertTriangle
              className="h-9 w-9"
              style={{ color: "var(--danger)" }}
            />
          </motion.div>

          {/* Status */}
          {status && (
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-widest uppercase"
              style={{
                background: "rgba(224,82,82,0.1)",
                border: "1px solid rgba(224,82,82,0.3)",
                color: "var(--danger)",
              }}
            >
              Error {status}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <h1 className="font-display text-4xl font-bold text-foreground">
              Oops, something
              <br />
              <span style={{ color: "var(--danger)" }}>went wrong</span>
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {message}
            </p>
          </div>

          <div className="divider w-full" />

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-sm transition-colors hover:text-foreground"
              style={{ color: "var(--gold)" }}
            >
              Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
