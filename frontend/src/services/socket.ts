import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "../types/socket.types";
import { toast } from "sonner";
import { loggedOut } from "../store/auth/authSlice";
import {
  gameEnded,
  gameRestored,
  gameStarted,
  moveApplied,
  promotionRequested,
  timerUpdated,
} from "../store/chess/chessSlice";
import { playIllegalSound, playSound } from "../utils/sound";
import type { AppDispatch, RootState } from "../store";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
  {
    autoConnect: false,
    withCredentials: true,
    reconnection: false,
  },
);

async function refreshToken() {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api/v1/auth/refresh`,
    { method: "POST", credentials: "include" },
  );
  const data = await res.json();
  return data?.success;
}

export async function connectSocket() {
  if (socket.connected || socket.active) return true;
  const refreshed = await refreshToken();
  if (!refreshed) return false;
  socket.connect();
  return true;
}

export function disconnectSocket() {
  if (socket.connected) socket.disconnect();
}

export function registerSocketListeners({
  dispatch,
  getState,
  navigate,
}: {
  dispatch: AppDispatch;
  getState: () => RootState;
  navigate: (path: string) => void;
}) {
  socket.removeAllListeners();

  socket.on("connect", () => console.log("Socket connected:", socket.id));

  socket.on("gameJoined", (data) => {
    // console.log(data);
    playSound("start");
    dispatch(
      gameStarted({
        gameId: data.gameId,
        gameMode: data.mode,
        me: { ...data.me, timeLeft: 600000 },
        opponent: { ...data.opponent, timeLeft: 600000 },
        fen: data.fen,
        turn: "w",
      }),
    );
    navigate(`/play/${data.mode}/${data.gameId}`);
  });

  socket.on(
    "moveMade",
    ({ ok, fen, move, moves, turn, status, result, winner, soundType }) => {
      if (!ok) return;
      dispatch(moveApplied({ fen, move, turn, status, result, winner, moves }));
      const myColor = getState().chess.me?.color;
      playSound(
        soundType === "move" && move.color !== myColor ? "move" : soundType,
      );
    },
  );

  socket.on("promotionRequest", ({ ok, from, to, promotionRequired }) => {
    if (ok && promotionRequired) dispatch(promotionRequested({ from, to }));
  });

  socket.on("timerUpdate", (data) => {
    dispatch(timerUpdated(data));
  });

  socket.on("gameRejoined", ({ gameId, me, opponent, fen, turn, clocks }) => {
    dispatch(
      gameRestored({
        gameId,
        me: { ...me, timeLeft: clocks[me.color] },
        opponent: { ...opponent, timeLeft: clocks[opponent.color] },
        fen,
        turn,
        clocks,
        moves: [],
        gameMode: "ranked",
      }),
    );
  });

  socket.on("kicked", ({ message }) => {
    toast.warning(message);
    dispatch({ type: "RESET_STORE" });
    disconnectSocket();
    navigate("/");
  });

  socket.on("connect_error", async (err) => {
    switch (err.message) {
      case "AT_EXPIRED": {
        const refreshed = await refreshToken();
        if (refreshed) {
          socket.connect();
        } else {
          dispatch(loggedOut());
          toast.error("Session Expired");
          disconnectSocket();
          navigate("/");
        }
        break;
      }
      case "RT_EXPIRED":
      case "UNAUTHORIZED":
      case "INVALID_TOKEN":
        dispatch(loggedOut());
        toast.error("Session Expired 6767");
        disconnectSocket();
        navigate("/");
        break;
    }
  });

  socket.on("error", ({ message }) => {
    toast.error(message);
    navigate("/");
  });

  socket.on("moveError", ({ message }) => {
    playIllegalSound();
    toast.error(message);
  });

  socket.on("inGame", ({ gameId, message, mode }) => {
    toast.info(message);
    window.location.href = `/play/${mode}/${gameId}`;
  });

  socket.on("opponent:disconnected", ({ message }) => {
    toast.warning(message);
  });

  socket.on("gameOver", ({ winner, result, message }) => {
    playSound("end");
    dispatch(gameEnded({ winner, result }));
    toast.info(message);
    disconnectSocket();
  });

  socket.on("disconnect", (reason) => {
    console.log("Disconnected:", reason);
  });
}
