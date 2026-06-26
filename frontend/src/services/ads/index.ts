// services/ads/index.ts
import { socket } from "../socket";
import type { AdProvider } from "./adProvider.interface";
import { mockAdProvider } from "./mockAdProvider";

// Swap this one line when going to production:
// import { googleAdProvider } from "./googleAdProvider";
// import { unityAdProvider } from "./unityAdProvider";
const activeProvider: AdProvider = mockAdProvider;

export const adService = {
  isReady: () => activeProvider.isReady(),
  showRewardedAd: async (gameId: string, adToken: string) => {
    // Mock: client reports completion itself
    const result = await mockAdProvider.showRewardedAd();
    if (result === "completed") {
      socket.emit("grantAdHint", { gameId, adToken });
      return result;
    }
  },

  preload: () => activeProvider.preload?.(),
  destroy: () => activeProvider.destroy?.(),
};

export type { AdResult } from "./adProvider.interface";
