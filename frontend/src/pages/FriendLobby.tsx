import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { Users, Plus, LogIn, MoveLeft } from "lucide-react";
import Navbar from "@/components/ui/NavBar";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function FriendLobby() {
  usePageTitle("Vs Friend Lobby");

  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen justify-center overflow-hidden pt-20 sm:items-center sm:pt-0">
      <Navbar />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center gap-8"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full"
              style={{
                background: "var(--gold-subtle)",
                border: "1px solid var(--border-gold)",
              }}
            >
              <Users className="h-6 w-6" style={{ color: "var(--gold)" }} />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Play with a Friend
            </h1>
            <p className="text-sm text-muted-foreground">
              Create a private server or join one with an invite code
            </p>
          </div>

          <div className="divider w-full" />

          {/* Options */}
          <div className="flex w-full flex-col gap-4">
            <motion.button
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              onClick={() => navigate("/play/friend/create")}
              className="glass-card group flex cursor-pointer items-center gap-4 border border-primary/30 transition-all duration-300 hover:scale-[1.01] sm:border-transparent sm:hover:border-primary"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors"
                style={{
                  background: "var(--gold-subtle)",
                }}
              >
                <Plus className="h-5 w-5" style={{ color: "var(--gold)" }} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">
                  Create Server
                </div>
                <div className="text-xs text-muted-foreground">
                  Generate an invite code to share with your friend
                </div>
              </div>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => navigate("/play/friend/join")}
              className="glass-card group flex cursor-pointer items-center gap-4 border border-primary/30 transition-all duration-300 hover:scale-[1.01] sm:border-transparent sm:hover:border-primary"
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                }}
              >
                <LogIn className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-foreground">Join Game</div>
                <div className="text-xs text-muted-foreground">
                  Enter an invite code to join your friend's game
                </div>
              </div>
            </motion.button>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex cursor-pointer items-center justify-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <MoveLeft size={16} />
            Back to Home
          </button>
        </motion.div>
      </div>
    </div>
  );
}
