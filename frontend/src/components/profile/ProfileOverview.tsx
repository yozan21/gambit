import { motion } from "framer-motion";
import { Trophy, Target, Flame, Calendar } from "lucide-react";
import { useAppSelector } from "../../hooks/dispatch";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function ProfileOverview() {
  usePageTitle("Profile Overview");
  const { user } = useAppSelector((state) => state.auth);

  if (!user) return null;

  const winRate =
    user.stats.gamesPlayed > 0
      ? ((user.stats.wins / user.stats.gamesPlayed) * 100).toFixed(1)
      : "0.0";

  const stats = [
    { label: "ELO Rating", value: user.elo, icon: Target, color: "#e2c46a" },
    {
      label: "Games Played",
      value: user.stats.gamesPlayed,
      icon: Trophy,
      color: "#4ade80",
    },
    { label: "Win Rate", value: `${winRate}%`, icon: Flame, color: "#f97316" },
    {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(),
      icon: Calendar,
      color: "#60a5fa",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card flex items-center justify-between p-6 md:col-span-2 lg:col-span-4"
      >
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-2xl font-bold text-foreground">
            {user.fullName}
          </h2>
          <span className="text-sm text-muted-foreground">
            @{user.username}
          </span>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>

        <Avatar
          className="h-20 w-20"
          style={{ border: "2px solid var(--border-gold)" }}
        >
          <AvatarImage src={user.avatar} />
          <AvatarFallback
            className="text-2xl font-bold"
            style={{
              background: "rgba(201, 168, 76, 0.15)",
              color: "var(--gold)",
            }}
          >
            {user.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </motion.div>
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card flex flex-col gap-4 p-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {stat.label}
              </span>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{ background: `${stat.color}20` }}
              >
                <Icon className="h-5 w-5" style={{ color: stat.color }} />
              </div>
            </div>
            <div
              className="font-display text-3xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
          </motion.div>
        );
      })}

      {/* Win/Loss/Draw Stats */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 md:col-span-2 lg:col-span-4"
      >
        <h3 className="mb-4 text-lg font-semibold text-foreground">
          Performance
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-bold text-(--success)">
              {user.stats.wins}
            </div>
            <div className="text-sm text-muted-foreground">Wins</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-bold text-destructive">
              {user.stats.losses}
            </div>
            <div className="text-sm text-muted-foreground">Losses</div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-3xl font-bold text-(--warning)">
              {user.stats.draws}
            </div>
            <div className="text-sm text-muted-foreground">Draws</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
