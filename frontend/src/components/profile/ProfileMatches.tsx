import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Clock, Calendar, Bot, Users, Globe } from "lucide-react";
import { useAppSelector } from "../../hooks/dispatch";
import { useGetMatchHistoryQuery } from "../../services/api";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { GameRecord } from "@/types/game.types";
import { usePageTitle } from "@/hooks/usePageTitle";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 2) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const ModeIcon = ({ mode }: { mode?: string }) => {
  if (mode === "bot") return <Bot className="h-3.5 w-3.5" />;
  if (mode === "friend") return <Users className="h-3.5 w-3.5" />;
  return <Globe className="h-3.5 w-3.5" />;
};

const modeLabel = (mode?: string) => {
  if (mode === "bot") return "vs Bot";
  if (mode === "friend") return "vs Friend";
  return "Ranked";
};

const resultStyles = {
  win: { bg: "rgba(76,175,130,0.12)", color: "#4caf82", label: "WIN" },
  loss: { bg: "rgba(224,82,82,0.12)", color: "#e05252", label: "LOSS" },
  draw: { bg: "rgba(201,168,76,0.12)", color: "#c9a84c", label: "DRAW" },
};

const EloChange = ({ change }: { change: number | null }) => {
  if (change === null) return null;
  const color = change > 0 ? "#4caf82" : change < 0 ? "#e05252" : "#c9a84c";
  const label = change > 0 ? `+${change}` : change === 0 ? "±0" : `${change}`;
  return (
    <span className="text-[11px] sm:text-xs" style={{ color }}>
      {label}
    </span>
  );
};

const ColorDot = ({ color }: { color: "w" | "b" }) => (
  <span
    className="inline-block h-1.75 w-1.75 shrink-0 rounded-full"
    style={{
      background: color === "w" ? "var(--board-light)" : "var(--board-dark)",
      border: color === "w" ? "0.5px solid var(--board-dark)" : "none",
    }}
  />
);

export default function ProfileMatches() {
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useGetMatchHistoryQuery(page);

  const games = data?.data?.games ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const getMyInfo = (game: GameRecord) => {
    const isWhite = game.whitePlayer?._id?.toString() === user?.id?.toString();
    const me = isWhite ? game.whitePlayer : game.blackPlayer;
    const opponent = isWhite ? game.blackPlayer : game.whitePlayer;
    const myColor = isWhite ? "w" : ("b" as "w" | "b");
    const myRating = isWhite ? game.whiteRating : game.blackRating;
    const myChange = isWhite ? game.whiteRatingChange : game.blackRatingChange;
    const opponentRating = isWhite ? game.blackRating : game.whiteRating;
    const result: "win" | "loss" | "draw" =
      game.winner === null ? "draw" : game.winner === myColor ? "win" : "loss";
    return {
      me,
      opponent,
      myColor,
      myRating,
      myChange,
      opponentRating,
      result,
    };
  };

  usePageTitle("Matches");

  return (
    <div className="glass-card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <h2 className="font-display text-xl font-bold text-foreground">
          Match History
        </h2>
        {!isLoading && (
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      <div className="min-h-100">
        {isError ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Swords className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">Failed to load matches</p>
            <button
              onClick={() => refetch()}
              className="text-xs underline underline-offset-2"
              style={{ color: "var(--gold-light)" }}
            >
              Try again
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse border-b border-border px-6 py-4 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-48 rounded bg-accent" />
                    <div className="h-3 w-32 rounded bg-accent" />
                  </div>
                  <div className="h-6 w-12 rounded bg-accent" />
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <Swords className="h-10 w-10 text-muted-foreground opacity-40" />
            <p className="text-muted-foreground">No matches played yet</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {games.map((game, index) => {
                const {
                  me,
                  opponent,
                  myColor,
                  myChange,
                  myRating,
                  opponentRating,
                  result,
                } = getMyInfo(game);
                const isRanked = !game.mode || game.mode === "ranked";
                const opponentChange = isRanked
                  ? myColor === "w"
                    ? game.blackRatingChange
                    : game.whiteRatingChange
                  : null;
                const rs = resultStyles[result];

                return (
                  <motion.div
                    key={game.gameId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="flex cursor-pointer items-center justify-between gap-3 border-b border-border px-3 py-4 transition-colors last:border-0 hover:bg-accent/40 sm:gap-4 sm:px-6"
                    style={{ borderLeft: `2px solid ${rs.color}` }}
                  >
                    <div className="flex min-w-0 flex-col gap-1 sm:gap-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <ColorDot color={myColor} />
                        <span className="font-semibold text-foreground sm:text-sm">
                          {me?.username ?? user?.username ?? "You"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {myRating}{" "}
                          <EloChange change={isRanked ? myChange : null} />
                        </span>
                        <Swords className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <ColorDot color={myColor === "w" ? "b" : "w"} />
                        <span className="truncate font-semibold text-foreground sm:text-sm">
                          {opponent?.username ?? "Unknown"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {opponentRating} <EloChange change={opponentChange} />
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground sm:gap-1.5 sm:text-xs">
                        <div className="flex items-center gap-0.5">
                          <ModeIcon mode={game.mode} />
                          <span>{modeLabel(game.mode)}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-0.5 text-[13px]">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span>{formatDuration(game.duration)}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-0.5">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          <span>{timeAgo(game.endedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div
                      className="shrink-0 rounded px-2 py-0.5 text-xs font-semibold sm:px-3 sm:py-1 sm:text-xs"
                      style={{ background: rs.bg, color: rs.color }}
                    >
                      {rs.label}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="border-t border-border px-6 py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  size="default"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-40"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
                .reduce<(number | "...")[]>((acc, p, i, arr) => {
                  if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <span className="px-3 text-muted-foreground">…</span>
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        size="default"
                        onClick={() => setPage(p as number)}
                        isActive={page === p}
                        className="cursor-pointer"
                        style={
                          page === p
                            ? {
                                background: "var(--gold-subtle)",
                                color: "var(--gold)",
                                borderColor: "var(--border-gold)",
                              }
                            : {}
                        }
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}
              <PaginationItem>
                <PaginationNext
                  size="default"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-40"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
