import { Users, UserPlus, Bot } from "lucide-react";
import ModeCard from "./ModeCard";
import type { GameMode } from "../../types/chess.types";

const MODES = [
  {
    mode: "random" as GameMode,
    label: "Quick Match",
    description: "Get matched with a random opponent instantly",
    icon: Users,
    badge: "Popular",
  },
  {
    mode: "friend" as GameMode,
    label: "Play Friend",
    description: "Challenge a friend with a private game code",
    icon: UserPlus,
  },
  {
    mode: "bot" as GameMode,
    label: "vs Stockfish",
    description: "Test your skills against the world's strongest engine",
    icon: Bot,
    badge: "New",
  },
];

interface ModeCardsProps {
  onPlay: (mode: GameMode) => void;
}

export default function ModeCards({ onPlay }: ModeCardsProps) {
  return (
    <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
      {MODES.map((m, i) => (
        <ModeCard key={m.mode} {...m} index={i} onPlay={() => onPlay(m.mode)} />
      ))}
    </div>
  );
}
