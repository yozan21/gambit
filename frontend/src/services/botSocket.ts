import { socket } from "./socket";
import { toast } from "sonner";
import {
  botGameCreated,
  botGameResumePrompted,
  botGameResumed,
  botMoveApplied,
  botThinking,
  botGameStalled,
  undoApplied,
  hintReceived,
  hintDenied,
  hintGranted,
  promotionRequested,
} from "../store/bot/botSlice";
import { playIllegalSound, playSound } from "../utils/sound";
import type { AppDispatch, RootState } from "../store";

/**
 * Registers bot-mode socket listeners. Call once alongside registerSocketListeners.
 * Shares the same `socket` instance — bot mode reuses the authenticated connection.
 */
export function registerBotSocketListeners({
  dispatch,
  getState,
}: {
  dispatch: AppDispatch;
  getState: () => RootState;
}) {
  socket.on("botGameCreated", ({ gameId, color, level, hintsRemaining }) => {
    const username = getState().auth.user?.username ?? "You";
    playSound("start");
    dispatch(
      botGameCreated({ gameId, color, level, hintsRemaining, username }),
    );
  });

  socket.on(
    "botGameResume",
    ({ gameId, fen, moves, turn, level, hintsRemaining, color }) => {
      // Server found an in-progress (or just-restored) game.
      // We treat this the same whether it's a fresh "you have an unfinished game" prompt
      // or a direct resume after continueBotGame — the lobby decides which UI to show
      // based on whether resumePrompt was already showing.
      const username = getState().auth.user?.username ?? "You";
      const state = getState().botChess;

      if (state.resumePrompt) {
        // Player already confirmed "Continue" — apply it directly
        dispatch(
          botGameResumed({
            gameId,
            fen,
            moves,
            turn,
            level,
            hintsRemaining,
            color,
            username,
          }),
        );
      } else {
        // First time we're hearing about this — show the resume prompt
        dispatch(botGameResumePrompted({ gameId, level, color }));
      }
    },
  );

  socket.on(
    "botMoveMade",
    ({ ok, fen, move, moves, turn, status, result, winner, soundType }) => {
      if (!ok) return;
      dispatch(
        botMoveApplied({ fen, move, moves, turn, status, result, winner }),
      );
      playSound(soundType);

      // Player's move didn't end the game — bot is about to think
      if (status !== "ended") {
        dispatch(botThinking(true));
      }
    },
  );

  socket.on(
    "botMove",
    ({ ok, fen, move, moves, turn, status, result, winner, soundType }) => {
      if (!ok) return;
      dispatch(
        botMoveApplied({ fen, move, moves, turn, status, result, winner }),
      );
      dispatch(botThinking(false));
      playSound(soundType);
    },
  );

  socket.on("botGameStalled", ({ result, winner, fen, move, moves }) => {
    dispatch(botGameStalled({ result, winner, fen, move, moves }));
    playSound("end");
  });

  socket.on("botGameOver", ({ message, levelUnlocked }) => {
    toast.info(message);
    if (levelUnlocked) {
      toast.success(`Level ${levelUnlocked} unlocked! 🎉`);
    }
  });

  socket.on("promotionRequest", ({ ok, promotionRequired, from, to }) => {
    if (ok && promotionRequired) dispatch(promotionRequested({ from, to }));
  });

  socket.on("hintResponse", ({ from, to, hintsRemaining }) => {
    dispatch(hintReceived({ from, to, hintsRemaining }));
  });

  socket.on("hintDenied", ({ reason }) => {
    dispatch(hintDenied());
    if (reason === "ad_required") {
      // Lobby/controls component listens for this via Redux state change
      // and shows the ad wall placeholder
    } else if (reason === "not_your_turn") {
      toast.warning("Wait for your turn to request a hint");
    }
  });

  socket.on("hintGranted", ({ hintsRemaining }) => {
    dispatch(hintGranted({ hintsRemaining }));
  });

  socket.on("undoConfirmed", ({ fen, moves, turn }) => {
    dispatch(undoApplied({ fen, moves, turn }));
    playSound("move");
  });

  socket.on("moveError", ({ message }) => {
    playIllegalSound();
    toast.error(message);
  });
}
