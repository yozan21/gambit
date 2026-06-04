import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router";
import {
  X,
  Home,
  User,
  Swords,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import type { AuthUser } from "../types/auth.types";

interface MobileNavProps {
  open: boolean;
  handleClose: () => void;
  handleLogout: () => void;
  user: AuthUser | null;
}

const navLinks = [
  { label: "Home", to: "/", icon: Home },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Matches", to: "/profile/matches", icon: Swords },
  { label: "Statistics", to: "/profile/stats", icon: BarChart2 },
  { label: "Settings", to: "/profile/settings", icon: Settings },
];

export default function MobileNav({
  open,
  handleClose,
  handleLogout,
  user,
}: MobileNavProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={() => handleClose()}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 flex h-full w-64 flex-col border-l md:hidden"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-gold)",
            }}
          >
            <div
              className="flex items-center justify-between border-b px-4 py-4"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              {user && (
                <div>
                  <p className="font-semibold text-foreground">
                    {user.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {user.elo} ELO
                  </p>
                </div>
              )}
              <button
                onClick={() => handleClose()}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-accent"
                style={{ color: "var(--gold)" }}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-3">
              {navLinks.map(({ label, to, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => handleClose()}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-accent"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: "var(--gold)" }}
                  />
                  {label}
                </Link>
              ))}
            </nav>

            <div
              className="mt-auto border-t p-3"
              style={{ borderColor: "var(--border-subtle)" }}
            >
              <button
                onClick={() => {
                  handleLogout();
                  handleClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 font-medium transition-colors hover:bg-accent"
                style={{ color: "var(--danger)" }}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                Logout
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
