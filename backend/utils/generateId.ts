import { randomBytes } from "crypto";

export const generateGameId = (): string => {
  return randomBytes(4).toString("hex").toUpperCase();
};
