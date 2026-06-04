import { NavLink, Outlet } from "react-router";
import { motion } from "framer-motion";
import { useAppSelector } from "../hooks/dispatch";
import { User, History, BarChart3, Settings, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "@/components/ui/NavBar";

const tabs = [
  { id: "overview", path: "/profile", label: "Overview", icon: User },
  {
    id: "matches",
    path: "/profile/matches",
    label: "Match History",
    icon: History,
  },
  { id: "stats", path: "/profile/stats", label: "Statistics", icon: BarChart3 },
  {
    id: "settings",
    path: "/profile/settings",
    label: "Settings",
    icon: Settings,
  },
  {
    id: "home",
    path: "/",
    label: "Home",
    icon: Home,
  },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) navigate("/login");
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="relative min-h-screen px-1 pt-20 pb-8 sm:py-4">
      <div className="sm:hidden">
        <Navbar />
      </div>
      <div className="max-w-6xl sm:mx-auto">
        <motion.nav
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card scrollbar-hide relative mb-8 hidden gap-2 overflow-x-auto rounded-sm p-2 sm:flex"
          onMouseLeave={() => setHoveredTab(null)}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.id === "overview"}
                className="relative z-10 flex items-center gap-2 rounded-sm px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors sm:px-4 sm:text-sm"
                style={({ isActive }) => ({
                  color: isActive ? "var(--gold)" : "var(--text-secondary)",
                })}
                onMouseEnter={() => setHoveredTab(tab.id)}
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ")[0]}</span>

                    {hoveredTab === tab.id ||
                    (hoveredTab === null && isActive) ? (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 -z-10 rounded-sm"
                        style={{
                          border: "1px solid var(--border-gold)",
                          background: "rgba(201, 168, 76, 0.05)",
                        }}
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.4,
                        }}
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </motion.nav>

        <Outlet />
      </div>
    </div>
  );
}
