import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../hooks/dispatch";
import NavLogo from "../NavLogo";
import NavUserInfo from "../NavUserInfo";
import NavActions from "../NavActions";
import { Link, useNavigate } from "react-router";
import { loggedOut } from "../../store/auth/authSlice";
import MobileNav from "../MobileNav";
import { useLogoutMutation } from "@/services/api";

export default function Navbar() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    await logout();
    dispatch(loggedOut());
    navigate("/");
  };
  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed top-0 right-0 left-0 z-40 flex items-center justify-between border-b px-2 py-3 md:px-6 md:py-4"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          background: "rgba(10, 9, 8, 0.8)",
          borderColor: "var(--border-subtle)",
        }}
      >
        <Link to="/">
          <NavLogo size="sm" />
        </Link>

        <div className="hidden items-center gap-1 md:flex md:gap-3">
          {isAuthenticated && user && <NavUserInfo user={user} />}
          <NavActions
            isLoading={isLoading}
            handleLogout={handleLogout}
            isAuthenticated={isAuthenticated}
            onLoginClick={() => navigate("/login")}
            onSignupClick={() => navigate("/signup")}
          />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          {!isAuthenticated && (
            <NavActions
              isLoading={isLoading}
              handleLogout={handleLogout}
              isAuthenticated={isAuthenticated}
              onLoginClick={() => navigate("/login")}
              onSignupClick={() => navigate("/signup")}
            />
          )}
          {isAuthenticated && (
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-accent"
              style={{ color: "var(--gold)" }}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          )}
        </div>
      </motion.nav>
      <MobileNav
        open={open}
        handleClose={handleClose}
        handleLogout={handleLogout}
        user={user}
      />
    </>
  );
}
