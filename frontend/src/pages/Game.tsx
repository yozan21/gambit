// pages/Game.tsx

import { useParams } from "react-router";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "../hooks/dispatch";

import SearchingScreen from "../components/game/SearchingScreen";
import GameLayout from "../components/game/GameLayout";
import LoadingScreen from "../components/ui/LoadingScreen";

import { useMatchmaking } from "../hooks/useMatchmaking";
import { useRestoreGame } from "../hooks/useRestoreGame";
import type { GameMode } from "../types/chess.types";
import { disconnectSocket } from "@/services/socket";
import { usePageTitle } from "@/hooks/usePageTitle";
import { cancelledSearch } from "@/store/chess/chessSlice";

export default function Game() {
  usePageTitle("Play");
  const dispatch = useAppDispatch();

  const { mode, gameId } = useParams<{ mode: GameMode; gameId?: string }>();
  const navigate = useNavigate();

  const { gameStatus, gameId: id } = useAppSelector((state) => state.chess);
  const { user } = useAppSelector((state) => state.auth);

  // Start matchmaking if needed
  useMatchmaking(mode, gameId);

  const shouldRestore = gameId !== id;

  // const { data, isLoading } = useGetGameQuery(gameId!, {
  //   skip: !gameId || !shouldRestore,
  //   refetchOnMountOrArgChange: true,
  // });

  // Restore game if page refreshed
  useRestoreGame({
    shouldRestore,
    user,
    gameId,
    mode,
  });

  if (!mode) {
    return <LoadingScreen />;
  }

  if (!gameId) {
    return (
      <SearchingScreen
        onCancel={() => {
          dispatch(cancelledSearch());
          disconnectSocket();
          navigate("/");
        }}
      />
    );
  }

  if (gameStatus === "playing" || gameStatus === "ended") {
    return <GameLayout />;
  }
  return <LoadingScreen />;
}
