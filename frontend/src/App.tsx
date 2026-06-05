import { memo, useEffect } from "react";
import {
  RouterProvider,
  useLocation,
  Outlet,
  useNavigation,
} from "react-router";
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

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* =====================
   App Shell
===================== */
export function AppShell() {
  const navigation = useNavigation();
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const isNavigating = navigation.state === "loading";

  return (
    <SessionCheck>
      {/* Loading screen */}
      <AnimatePresence>
        {isLoading || (isNavigating && <LoadingScreen />)}
      </AnimatePresence>

      {/* App */}
      {!isLoading && !isNavigating && (
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
