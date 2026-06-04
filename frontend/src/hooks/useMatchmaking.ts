import type { GameMode } from "../types/chess.types";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { connectSocket, socket } from "../services/socket";
import { loggedOut } from "../store/auth/authSlice";
import {
  cancelledSearch,
  searchingForOpponent,
} from "../store/chess/chessSlice";
import { useAppDispatch, useAppSelector } from "./dispatch";

export function useMatchmaking(mode?: GameMode, gameId?: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, isRestored } = useAppSelector((state) => state.auth);
  const { gameStatus } = useAppSelector((state) => state.chess);

  const gameStatusRef = useRef(gameStatus);
  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    if (!isRestored || gameId || mode !== "ranked") return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    let cancelled = false;

    async function startRandomMatchmaking() {
      dispatch(searchingForOpponent({ gameMode: "ranked" }));
      const connected = await connectSocket();
      if (!connected) {
        dispatch(loggedOut());
        navigate("/login");
        return;
      }
      if (!cancelled) socket.emit("startGameRanked");
    }

    startRandomMatchmaking();

    return () => {
      cancelled = true;
      if (gameStatusRef.current === "searching") dispatch(cancelledSearch());
    };
  }, [dispatch, gameId, isAuthenticated, isRestored, mode, navigate]);
}
