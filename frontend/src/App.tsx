import { memo, useEffect, useState } from "react";
import { RouterProvider, useLocation, Outlet } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useGetMeQuery } from "./services/api";
import { useAppDispatch, useAppSelector } from "./hooks/dispatch";
import { sessionRestored, sessionNotFound } from "./store/auth/authSlice";
import LoadingScreen from "./components/ui/LoadingScreen";
import { router } from "./main";

/* =====================
   Session Check
===================== */
const SessionCheck = memo(function SessionCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const { data, isError, isSuccess } = useGetMeQuery();
  console.log(data);

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(
        sessionRestored({
          user: data.data.user,
          token: "",
        }),
      );
    }
    if (isError) {
      dispatch(sessionNotFound());
    }
  }, [isSuccess, isError, data, dispatch]);

  return <>{children}</>;
});

/* =====================
   Page Transition
===================== */
function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 400); // match LoadingScreen exit duration
      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return (
    <>
      <AnimatePresence>
        {isTransitioning && <LoadingScreen key="page-transition" />}
      </AnimatePresence>

      <motion.div
        key={displayLocation.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: isTransitioning ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </>
  );
}

/* =====================
   App Shell
===================== */
export function AppShell() {
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  return (
    <SessionCheck>
      {/* Loading screen */}
      <AnimatePresence>{isLoading && <LoadingScreen />}</AnimatePresence>

      {/* App */}
      {!isLoading && (
        <>
          <PageTransition>
            <Outlet />
          </PageTransition>

          {/* Toaster */}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-gold)",
                color: "var(--text-gold)",
                fontFamily: "Inter, sans-serif",
              },
            }}
          />
        </>
      )}
    </SessionCheck>
  );
}

/* =====================
   Root
===================== */
export default function App() {
  return <RouterProvider router={router} />;
}
