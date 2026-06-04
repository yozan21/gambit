import { motion, type Variants, easeInOut } from "framer-motion";

const text = "Play Now";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // stagger each letter
      delayChildren: 0.1, // start delay
    },
  },
};

const letter: Variants = {
  hidden: { y: 0, scale: 1, opacity: 0 },
  show: {
    y: [0, -10, 0], // move up then back
    scale: [1, 1.2, 1], // scale up then back
    opacity: [0, 1, 1], // fade in
    transition: {
      y: { duration: 0.8, ease: easeInOut },
      scale: { duration: 0.8, ease: easeInOut },
      opacity: { duration: 0.8, ease: easeInOut },
    },
  },
};

export default function PlayNowAnimated() {
  return (
    <motion.h1
      className="font-display bg-clip-text text-3xl font-extrabold text-transparent sm:text-center md:text-5xl"
      style={{
        background:
          "linear-gradient(120deg, var(--gold-light), var(--gold), var(--gold-light))",
        WebkitBackgroundClip: "text",
        textShadow: "0 0 2px var(--gold), 0 0 0px var(--gold)",
      }}
      variants={container}
      initial="hidden"
      animate="show" // runs once on mount
    >
      {text.split("").map((char, i) => (
        <motion.span key={i} variants={letter} className="inline-block">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.h1>
  );
}
