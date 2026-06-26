// services/ads/adProvider.interface.ts

export type AdResult = "completed" | "skipped" | "error";

export interface AdProvider {
  /** True when an ad is loaded and ready to show */
  isReady(): boolean;
  /** Show a rewarded ad. Resolves with the outcome. */
  showRewardedAd(): Promise<AdResult>;
  /** Optional: preload the next ad in the background */
  preload?(): void;
  /** Optional: clean up SDK resources */
  destroy?(): void;
}
