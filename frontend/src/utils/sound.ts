import moveSelf from "../sounds/move-self.mp3";
import capture from "../sounds/capture.mp3";
import promote from "../sounds/promote.mp3";
import castle from "../sounds/castle.mp3";
import check from "../sounds/check.mp3";
import start from "../sounds/game-start.mp3";
import end from "../sounds/game-end.mp3";
import illegal from "../sounds/illegal.mp3";

import type { SoundType } from "../types/chess.types";

const moveSound = new Audio(moveSelf);
const captureSound = new Audio(capture);
const checkSound = new Audio(check);
const promoteSound = new Audio(promote);
const startSound = new Audio(start);
const endSound = new Audio(end);
const castleSound = new Audio(castle);
const illegalSound = new Audio(illegal);

function play(sound: HTMLAudioElement) {
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

export const playMoveSound = () => play(moveSound);
export const playCaptureSound = () => play(captureSound);
export const playCheckSound = () => play(checkSound);
export const playGameEndSound = () => play(endSound);
export const playPromoteSound = () => play(promoteSound);
export const playCastleSound = () => play(castleSound);
export const playStartSound = () => play(startSound);
export const playIllegalSound = () => play(illegalSound);

// ✅ Single function to play any sound by type
const soundMap: Record<NonNullable<SoundType>, () => void> = {
  move: playMoveSound,
  capture: playCaptureSound,
  check: playCheckSound,
  end: playGameEndSound,
  promote: playPromoteSound,
  castle: playCastleSound,
  start: playStartSound,
};

export const playSound = (type: SoundType) => {
  if (!type) return;
  soundMap[type]?.();
};
