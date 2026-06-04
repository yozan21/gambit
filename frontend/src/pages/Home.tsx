import { useNavigate } from "react-router";
import { useAppSelector } from "../hooks/dispatch";
import FloatingPieces from "../components/home/FloatingPieces";
import AnimatedBoard from "../components/home/AnimatedBoard";
import HeroText from "../components/home/HeroText";
import type { GameMode } from "../types/chess.types";
import Navbar from "@/components/ui/NavBar";
import { useCallback, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const handlePlay = useCallback(
    (mode: GameMode) => {
      if (!isAuthenticated) {
        navigate("/login");
        return;
      }
      navigate(`/play/${mode}`);
    },
    [isAuthenticated, navigate],
  );

  useEffect(() => {
    document.title = `Gambit`;
  }, []);

  return (
    <div className="relative flex min-h-screen overflow-hidden pt-20 sm:items-center sm:pt-0">
      <Navbar />
      {/* Background */}
      <FloatingPieces />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(201,168,76,0.04) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:pt-24">
        <div className="grid grid-cols-1 gap-20 lg:grid-cols-2">
          {/* Left */}
          <div className="flex flex-col gap-5 sm:gap-10">
            <HeroText onPlay={handlePlay} />
          </div>

          {/* Right */}
          <div className="hidden justify-center lg:flex">
            <AnimatedBoard />
          </div>
        </div>
      </div>
    </div>
  );
}
