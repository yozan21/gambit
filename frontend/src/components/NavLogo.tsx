import { motion, type Variants } from "framer-motion";

const letters = "GAMBIT".split("");

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

interface NavLogoProps {
  animate?: boolean;
  size?: "sm" | "lg";
}

export default function NavLogo({
  animate = false,
  size = "sm",
}: NavLogoProps) {
  return (
    <motion.div layoutId="gambit-logo" className="flex items-center">
      <div className="flex items-center">
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            custom={i}
            variants={animate ? letterVariants : undefined}
            initial={animate ? "hidden" : false}
            animate={animate ? "visible" : false}
            className={
              size === "lg"
                ? "text-gradient-gold font-display text-5xl font-bold tracking-[0.25em] md:text-7xl"
                : "text-gradient-gold font-display text-xl font-bold tracking-[0.25em] sm:text-2xl"
            }
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}
