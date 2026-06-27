// pages/BotLobby.tsx
import {
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate, useSearchParams } from "react-router";
import Navbar from "@/components/ui/NavBar";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useActiveTier } from "@/hooks/useActiveTier";
import { useAppDispatch, useAppSelector } from "@/hooks/dispatch";
import { connectSocket, socket } from "@/services/socket";
import { resetBotGame } from "@/store/bot/botSlice";
import { GATE_LEVELS, TIERS, tierForLevel } from "@/utils/tiers";
import {
  buildSvgPath,
  computePath,
  MOBILE_SVG_WIDTH,
  NODE_SPACING,
  SVG_WIDTH,
  type PathNode,
} from "@/utils/pathLayout";
import { TierSectionTitle } from "@/components/botLobby/TierSectionTitle";
import { TierBackground } from "@/components/botLobby/TierBackground";
import { GameStartPanel } from "@/components/botLobby/GameStartPanel";
import { ResumePrompt } from "@/components/botLobby/ResumePrompt";
import { TierTimelineRail } from "@/components/botLobby/TierTimelineRail";
import { MapPathLayer } from "@/components/botLobby/MapPathLayout";
import { useNodeInView } from "@/hooks/useNodeInView";
import ScrollToCurrentButton from "@/components/botLobby/ScrollToCurrentButton";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MobileTierBar } from "@/components/botLobby/MobileTierBar";

export default function BotLobby() {
  usePageTitle("Play vs Bot");
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const user = useAppSelector((s) => s.auth.user);
  const resumePrompt = useAppSelector((s) => s.botChess.resumePrompt);
  // const gameId = useAppSelector((s) => s.botChess.gameId);
  // const gameStatus = useAppSelector((s) => s.botChess.gameStatus);

  const unlockedLevel = user?.unlockedBotLevel ?? 1;
  const completedLevels = user?.completedBotLevels ?? [];

  const [panelLevel, setPanelLevel] = useState<number | null>(null);
  const [starting, setStarting] = useState(false);
  const [isInitialScrollDone, setIsInitialScrollDone] = useState(false);
  const [selectedColor, setSelectedColor] = useState<"w" | "b" | "random">(
    "random",
  );
  const mapScrollRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const currentNodeRef = useRef<HTMLButtonElement | null>(null);
  const currentNodeState = useNodeInView(currentNodeRef, mapScrollRef);

  const isMobile = useMediaQuery("(max-width: 768px)");
  const svgWidth = isMobile ? MOBILE_SVG_WIDTH : SVG_WIDTH;

  // Update computePath call:

  // Reset scroll when layout switches:
  useEffect(() => {
    setTimeout(() => setIsInitialScrollDone(false), 0);
  }, [isMobile]);

  const setNodeRef = useCallback(
    (level: number) => (el: HTMLButtonElement | null) => {
      if (el) nodeRefs.current.set(level, el);
      else nodeRefs.current.delete(level);
      // keep a direct ref to the current (frontier) node for the go-to button
      if (level === unlockedLevel) currentNodeRef.current = el;
    },
    [unlockedLevel],
  );

  const { nodes, totalHeight } = useMemo(
    () => computePath(TIERS, svgWidth, isMobile),
    [svgWidth, isMobile],
  );
  const fullHeight = totalHeight + 100;

  const tierSections = useMemo(() => {
    return TIERS.map((tier, tierIndex) => {
      const tierNodes = nodes.filter((n) => n.tierIndex === tierIndex);
      if (tierNodes.length === 0) return null;

      const firstNode = tierNodes[0];
      const lastNode = tierNodes[tierNodes.length - 1];
      const ys = tierNodes.map((n) => n.y);
      const minY = Math.min(...ys); // ← always the top of the section
      const sectionHeight = lastNode.y - firstNode.y + NODE_SPACING + 40;

      return {
        tier,
        tierIndex,
        nodes: tierNodes,
        firstNode,
        lastNode,
        minY, // ← new
        sectionHeight: Math.abs(sectionHeight), // ← abs since can be negative after invert
      };
    }).filter(Boolean) as Array<{
      tier: (typeof TIERS)[0];
      tierIndex: number;
      nodes: PathNode[];
      firstNode: PathNode;
      lastNode: PathNode;
      minY: number;
      sectionHeight: number;
    }>;
  }, [nodes]);

  const svgPath = useMemo(() => buildSvgPath(nodes), [nodes]);
  const scrollToCurrentNode = useCallback(() => {
    const target = nodeRefs.current.get(unlockedLevel);
    if (!target || !mapScrollRef.current) return;
    const containerRect = mapScrollRef.current.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const offset =
      targetRect.top -
      containerRect.top +
      mapScrollRef.current.scrollTop -
      containerRect.height / 2;
    mapScrollRef.current.scrollTo({ top: offset, behavior: "smooth" });
  }, [unlockedLevel]);

  // Drives the sticky titles' `top` to the container's true vertical center
  // in real pixels — kept current via ResizeObserver on window resize.
  useLayoutEffect(() => {
    const el = mapScrollRef.current;
    if (!el) return;
    const update = () => {
      el.style.setProperty("--map-center", `${el.clientHeight / 2}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Whichever section currently spans the center line.
  const activeTierIndex = useActiveTier(
    mapScrollRef,
    TIERS.length,
    Math.max(0, tierForLevel(unlockedLevel)),
  );

  useEffect(() => {
    dispatch(resetBotGame());
  }, [dispatch]);

  // useEffect(() => {
  //   if (gameId && gameStatus === "playing") {
  //     navigate(`/play/bot/game/${gameId}`);
  //   }
  // }, [gameId, gameStatus, navigate]);

  useEffect(() => {
    if (isInitialScrollDone || nodes.length === 0) return;

    const raf = requestAnimationFrame(() => {
      const target = nodeRefs.current.get(unlockedLevel);
      if (target && mapScrollRef.current) {
        const containerRect = mapScrollRef.current.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const offset =
          targetRect.top -
          containerRect.top +
          mapScrollRef.current.scrollTop -
          containerRect.height / 2;
        mapScrollRef.current.scrollTo({
          top: offset,
          behavior: "instant" as ScrollBehavior,
        });
        setIsInitialScrollDone(true);
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [isInitialScrollDone, unlockedLevel, nodes.length]);

  const handleNodeClick = useCallback(
    (level: number) => {
      // Allow gate levels through even if ahead of unlockedLevel
      const isGate = GATE_LEVELS.has(level);
      if (level > unlockedLevel && !isGate) return;
      setPanelLevel((prev) => (prev === level ? null : level));
    },
    [unlockedLevel],
  );

  const handleStart = useCallback(
    async (color: "w" | "b" | "random") => {
      if (panelLevel === null) return;
      setStarting(true);
      try {
        const ok = await connectSocket();
        if (!ok) {
          setStarting(false);
          return;
        }
        socket.emit("startBotGame", {
          level: panelLevel,
          color: color,
        });
      } catch {
        setStarting(false);
      }
    },
    [panelLevel],
  );

  const handleSelect = (color: "w" | "b" | "random") => {
    setSelectedColor(color);
  };

  const handleClose = useCallback(() => {
    setPanelLevel(null);
    setStarting(false);
    if (searchParams.get("open")) {
      navigate("/play/bot", { replace: true });
    }
  }, [navigate, searchParams]);

  const handleContinue = useCallback(() => {
    if (!resumePrompt || !panelLevel) return;
    socket.emit("continueBotGame", {
      gameId: resumePrompt.gameId,
    });
    navigate(`/play/bot/game/${resumePrompt.gameId}`);
  }, [resumePrompt, navigate, panelLevel]);

  const restart = useCallback(() => {
    if (!resumePrompt || !panelLevel) return;
    socket.emit("restartBotGame", {
      gameId: resumePrompt.gameId,
      color: selectedColor,
      level: resumePrompt.level,
    });
    // navigate(`/play/bot/game/${resumePrompt.gameId}`);
  }, [resumePrompt, panelLevel, selectedColor]);

  const panelTier =
    panelLevel !== null ? TIERS[tierForLevel(panelLevel)] : null;
  const isSkipPanel =
    panelLevel !== null &&
    GATE_LEVELS.has(panelLevel) &&
    panelLevel > unlockedLevel;

  useEffect(() => {
    if (!isInitialScrollDone) return;

    const levelParam = searchParams.get("level");
    const openParam = searchParams.get("open");

    if (!levelParam || openParam !== "true") return;

    const level = parseInt(levelParam);
    if (isNaN(level)) return;

    const isGate = TIERS.some((t) => t.range[0] === level);
    const isAccessible = level <= unlockedLevel || isGate;

    if (!isAccessible) return;

    setTimeout(() => {
      setPanelLevel(level);
    }, 0);
  }, [isInitialScrollDone, searchParams, unlockedLevel, navigate]);

  return (
    <div className="relative h-screen overflow-hidden pt-10 sm:pt-15">
      <Navbar />

      {isMobile && (
        <MobileTierBar
          tier={TIERS[activeTierIndex] ?? null}
          tierIndex={activeTierIndex}
        />
      )}
      <div
        className="relative h-full transition-all duration-300"
        style={{
          ...(isMobile && { paddingTop: "36px" }),
          ...(panelLevel !== null && {
            transform: "scale(0.99)",
            filter: "blur(1px)",
            opacity: 0.55,
            pointerEvents: "none",
          }),
        }}
      >
        <div
          ref={mapScrollRef}
          className="relative h-full overflow-x-hidden [&::-webkit-scrollbar]:hidden"
          style={{
            overflowY: panelLevel !== null ? "hidden" : "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Tiers Background */}
          <div
            className="pointer-events-none absolute top-0 left-0 w-full"
            style={{ height: fullHeight }}
          >
            {tierSections.map((section) => (
              <div
                key={`bg-${section.tier.id}`}
                className="absolute inset-x-0"
                style={{
                  top: section.minY, // ← was section.firstNode.y
                  height: section.sectionHeight,
                }}
              >
                <TierBackground
                  tier={section.tier}
                  isActive={section.tierIndex === activeTierIndex}
                />
              </div>
            ))}
          </div>

          {/* Full-width layer — purely for sticky titles + the
              IntersectionObserver markers. Spans the exact same scroll
              range as the node column below via an explicit height, but as
              a true viewport-width box, so "left-8" lands near the real
              screen edge instead of the narrow path column's edge.
              Hides on smaller screens */}
          {!isMobile && (
            <div
              className="pointer-events-none absolute top-0 left-0 z-20 w-full"
              style={{ height: fullHeight }}
            >
              {tierSections.map((section) => (
                <div
                  key={`title-${section.tier.id}`}
                  data-tier-index={section.tierIndex}
                  className="absolute inset-x-0"
                  style={{
                    top: section.minY, // ← was section.firstNode.y
                    height: section.sectionHeight,
                  }}
                >
                  <TierTimelineRail
                    tier={section.tier}
                    isActive={section.tierIndex === activeTierIndex}
                  />
                  <TierSectionTitle
                    tier={section.tier}
                    isActive={section.tierIndex === activeTierIndex}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Centered path column — now owned by MapPathLayer. */}
          <MapPathLayer
            nodes={nodes}
            svgWidth={svgWidth}
            tierSections={tierSections}
            svgPath={svgPath}
            fullHeight={fullHeight}
            unlockedLevel={unlockedLevel}
            completedLevels={completedLevels}
            panelLevel={panelLevel}
            onNodeClick={handleNodeClick}
            setNodeRef={setNodeRef}
          />
        </div>
      </div>
      {/* Go-to-current button — outside the blur wrapper so it stays sharp */}
      <ScrollToCurrentButton
        currentNodeState={currentNodeState}
        scrollToCurrentNode={scrollToCurrentNode}
      />

      <GameStartPanel
        level={panelLevel}
        tier={panelTier}
        isSkipGate={isSkipPanel}
        onStart={handleStart}
        onClose={handleClose}
        starting={starting}
        selectedColor={selectedColor}
        onSelect={handleSelect}
      />

      <ResumePrompt
        level={resumePrompt?.level ?? null}
        open={!!resumePrompt}
        onContinue={handleContinue}
        onStartFresh={restart}
      />
    </div>
  );
}
