import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

interface NavActionsProps {
  handleLogout: () => void;
  isAuthenticated: boolean;
  onLoginClick: () => void;
  onSignupClick: () => void;
  isLoading: boolean;
}

export default function NavActions({
  handleLogout,
  isAuthenticated,
  onLoginClick,
  onSignupClick,
  isLoading,
}: NavActionsProps) {
  if (isAuthenticated) {
    return (
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          size="sm"
          onClick={handleLogout}
          disabled={isLoading}
          className="cursor-pointer gap-2 bg-transparent p-2 text-accent-foreground shadow-(--shadow-glow) hover:border-primary hover:text-accent"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div whileTap={{ scale: 0.98 }}>
        <Button
          size="sm"
          onClick={onLoginClick}
          className="cursor-pointer bg-linear-to-br from-accent-foreground to-primary font-medium hover:bg-linear-to-tl hover:shadow-(--shadow-glow)"
          style={{
            color: "var(--bg-base)",
            boxShadow: "var(--shadow-glow)",
            border: "none",
          }}
        >
          Login
        </Button>
      </motion.div>
      <motion.div whileTap={{ scale: 0.98 }} className="hidden sm:block">
        <Button
          size="sm"
          onClick={onSignupClick}
          className="cursor-pointer bg-transparent from-accent-foreground to-primary font-medium text-primary hover:bg-linear-to-tl hover:text-accent"
          style={{
            boxShadow: "var(--shadow-glow)",
            border: "1px solid var(--primary)",
          }}
        >
          Signup
        </Button>
      </motion.div>
    </>
  );
}
