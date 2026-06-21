import { useEffect, useRef } from "react";
import { socket, connectSocket } from "@/services/socket";
import { useAppSelector } from "@/hooks/dispatch";

export function useRestoreBotGame(urlGameId: string | undefined) {
  const reduxGameId = useAppSelector((s) => s.botChess.gameId);
  const gameStatus = useAppSelector((s) => s.botChess.gameStatus);
  const attemptedForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!urlGameId) return;
    // Already have this exact game loaded — nothing to restore (covers the
    // normal lobby → game navigation, where Redux is already populated).
    if (reduxGameId === urlGameId && gameStatus === "playing") return;
    if (attemptedForRef.current === urlGameId) return;
    attemptedForRef.current = urlGameId;

    (async () => {
      const ok = await connectSocket();
      if (!ok) return;
      socket.emit("continueBotGame", { gameId: urlGameId });
    })();
  }, [urlGameId, reduxGameId, gameStatus]);
}
