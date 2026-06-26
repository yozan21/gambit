// services/ads/mockAdProvider.ts
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { AnimatePresence } from "framer-motion";
import { MockAdOverlay } from "./mockAdOverlay";
import type { AdProvider, AdResult } from "./adProvider.interface";

function mountOverlay(resolve: (result: AdResult) => void) {
  const container = document.createElement("div");
  container.id = "mock-ad-root";
  document.body.appendChild(container);

  const root = createRoot(container);

  const unmount = (result: AdResult) => {
    // Render with visible=false to trigger AnimatePresence exit animation
    root.render(createElement(AnimatePresence, { mode: "wait" }, null));
    setTimeout(() => {
      root.unmount();
      container.remove();
      resolve(result);
    }, 300);
  };

  root.render(
    createElement(
      AnimatePresence,
      { mode: "wait" },
      createElement(MockAdOverlay, {
        key: "mock-ad",
        onComplete: () => unmount("completed"),
        onSkip: () => unmount("skipped"),
      }),
    ),
  );
}

export const mockAdProvider: AdProvider = {
  isReady: () => true,

  showRewardedAd: () =>
    new Promise<AdResult>((resolve) => {
      // Simulate network fetch before showing
      setTimeout(() => mountOverlay(resolve), 350);
    }),

  preload: () => {
    // No-op for mock — real providers use this to pre-cache video
  },

  destroy: () => {
    const el = document.getElementById("mock-ad-root");
    el?.remove();
  },
};
