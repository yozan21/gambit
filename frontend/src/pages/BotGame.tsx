import { useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useAppSelector } from "@/hooks/dispatch";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useRestoreBotGame } from "@/hooks/useRestoreBotGame";
import BotGameLayout from "@/components/botGame/BotGameLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";

export default function BotGame() {
  usePageTitle("Play vs Bot");
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const reduxGameId = useAppSelector((s) => s.botChess.gameId);
  const gameStatus = useAppSelector((s) => s.botChess.gameStatus);

  useRestoreBotGame(gameId);

  useEffect(() => {
    if (!gameId) navigate("/play/bot", { replace: true });
  }, [gameId, navigate]);

  if (!gameId) return <LoadingScreen />;

  if (
    (gameStatus === "playing" || gameStatus === "ended") &&
    reduxGameId === gameId
  ) {
    return <BotGameLayout />;
  }

  return <LoadingScreen />;
}
