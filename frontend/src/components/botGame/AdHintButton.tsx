import { Gift, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdHintButton({
  onHint,
  isBotThinking,
}: {
  onHint: () => void;
  isBotThinking: boolean;
}) {
  const [isSweeping, setIsSweeping] = useState(false);

  useEffect(() => {
    const initial = setTimeout(() => {
      setIsSweeping(true);
      const interval = setInterval(() => {
        setIsSweeping(true);
      }, 4000);
      return () => clearInterval(interval);
    }, 1500);

    return () => clearTimeout(initial);
  }, []);

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onHint}
      disabled={isBotThinking}
      className="group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-3 py-2.5 transition-all disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: "linear-gradient(135deg, #1a1508 0%, #2a1f06 100%)",
        border: "1px solid rgba(201,168,76,0.5)",
      }}
    >
      <motion.div
        className="absolute"
        style={{
          width: "200%",
          height: "200%",
          top: 0,
          left: 0,
          background:
            "linear-gradient(135deg, transparent 47%, rgba(201,168,76,0.12) 50%, transparent 53%)",
        }}
        animate={isSweeping ? { x: "50%", y: "50%" } : { x: "-51%", y: "-51%" }}
        transition={{
          duration: isSweeping ? 1.2 : 0,
          ease: "linear",
        }}
        onAnimationComplete={() => setIsSweeping(false)}
      />
      <div
        className="relative z-10 flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-[7px]"
        style={{ background: "rgba(201,168,76,0.14)" }}
      >
        <Play className="h-3.5 w-3.5 text-primary" fill="currentColor" />
      </div>
      <div className="relative z-10 flex flex-col items-start leading-none">
        <span className="text-[10px] font-medium" style={{ color: "#e2c46a" }}>
          Get a free hint
        </span>
      </div>
      <span
        className="relative z-10 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-primary transition-colors duration-200 group-hover:bg-[rgba(201,168,76,0.28)]"
        style={{ background: "rgba(201,168,76,0.18)" }}
      >
        <Gift className="h-2.5 w-2.5" />
        Free
      </span>
    </motion.button>
  );
}
