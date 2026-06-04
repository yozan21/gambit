// hooks/game/useRestoreGame.ts
import { useEffect } from "react";
import { connectSocket, socket } from "../services/socket";
import type { AuthUser } from "../types/auth.types";
import type { GameMode } from "../types/chess.types";
import { useAppDispatch } from "./dispatch";
import { useNavigate } from "react-router";

export function useRestoreGame({
  user,
  gameId,
  mode,
  shouldRestore,
}: {
  shouldRestore: boolean;
  user: AuthUser | null;
  gameId?: string;
  mode: GameMode | undefined;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (!shouldRestore || !gameId || !mode || !user) return;

    // Check if this is a reload or fresh navigation
    const isReload = sessionStorage.getItem("gameId") === gameId;

    if (!isReload) {
      // Fresh navigation — store gameId and skip restore
      sessionStorage.setItem("gameId", gameId);
      return;
    }

    // Only reaches here on reload/network failure
    async function restoreHelper() {
      const connected = await connectSocket();
      if (!connected) {
        navigate("/");
        return;
      } else {
        if (gameId) socket.emit("restoreGame", gameId);
      }
    }
    restoreHelper();
  }, [user, gameId, mode, shouldRestore, dispatch, navigate]);
}
