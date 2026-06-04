// import { motion } from "framer-motion";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useAppSelector } from "../../hooks/dispatch";

export default function ProfileStats() {
  usePageTitle("Statistics");

  const user = useAppSelector((state) => state.auth.user);

  if (!user) return null;

  return (
    <div className="glass-card p-8">
      <h2 className="font-display mb-8 text-2xl font-bold text-foreground">
        Detailed Statistics
      </h2>

      <div className="space-y-6">
        <div
          className="rounded-lg p-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            ELO Progress
          </h3>
          <div className="flex h-64 items-center justify-center text-muted-foreground">
            Chart coming soon...
          </div>
        </div>

        <div
          className="rounded-lg p-6"
          style={{ background: "var(--bg-surface)" }}
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Favorite Openings
          </h3>
          <div className="flex h-32 items-center justify-center text-muted-foreground">
            Opening statistics coming soon...
          </div>
        </div>
      </div>
    </div>
  );
}
