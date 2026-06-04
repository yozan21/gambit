import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Swords, type LucideIcon } from "lucide-react";

interface ModeCardProps {
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  index: number;
  onPlay: () => void;
}

export default function ModeCard({
  label,
  description,
  icon: Icon,
  badge,
  index,
  onPlay,
}: ModeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.5 + index * 0.1,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      whileHover={{
        y: -4,
        borderColor: "rgba(201, 168, 76, 0.6)",
        boxShadow: "0 0 20px rgba(201, 168, 76, 0.15)",
      }}
      className="relative flex cursor-pointer flex-col gap-5 rounded-2xl border p-6"
      style={{
        background: "var(--bg-elevated)",
        borderColor: "var(--border-default)",
      }}
      onClick={onPlay}
    >
      {/* Icon + badge */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{
            background: "var(--gold-subtle)",
            border: "1px solid var(--border-gold)",
          }}
        >
          <Icon className="h-5 w-5" style={{ color: "var(--gold)" }} />
        </div>

        {badge && (
          <Badge
            variant="outline"
            className="text-xs"
            style={{
              borderColor: "var(--border-gold)",
              color: "var(--gold)",
              background: "var(--gold-subtle)",
            }}
          >
            {badge}
          </Badge>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-display text-base font-semibold text-foreground">
          {label}
        </h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* Button */}
      <Button
        className="mt-auto w-full gap-2"
        style={{
          background: "linear-gradient(135deg, #e2c46a 0%, #c9a84c 100%)",
          color: "var(--bg-base)",
          border: "none",
          boxShadow: "var(--shadow-glow)",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onPlay();
        }}
      >
        <Swords className="h-4 w-4" />
        Play Now
      </Button>
    </motion.div>
  );
}
