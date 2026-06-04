import type { QueuedPlayer } from "../utils/types.js";

const ELO_RANGE_INITIAL = 100;
const ELO_RANGE_INCREMENT = 50;
const ELO_EXPAND_INTERVAL = 10000;

export default class MatchmakingQueue {
  private queue: QueuedPlayer[] = [];

  enqueue(player: QueuedPlayer) {
    this.remove(player.socketId);
    this.queue.push({ ...player, queuedAt: new Date() });
  }

  dequeue(): QueuedPlayer | undefined {
    return this.queue.shift();
  }

  remove(socketId: string) {
    this.queue = this.queue.filter((p) => p.socketId !== socketId);
  }

  removeByUserId(userId: string) {
    this.queue = this.queue.filter((p) => p.userId !== userId);
  }

  findByUserId(userId: string): QueuedPlayer | undefined {
    return this.queue.find((p) => p.userId === userId);
  }

  findBySocketId(socketId: string): QueuedPlayer | undefined {
    return this.queue.find((p) => p.socketId === socketId);
  }

  size() {
    return this.queue.length;
  }

  findMatch(player: QueuedPlayer): QueuedPlayer | undefined {
    const waitTime = Date.now() - player.queuedAt.getTime();
    const intervals = Math.floor(waitTime / ELO_EXPAND_INTERVAL);
    const eloRange = ELO_RANGE_INITIAL + intervals * ELO_RANGE_INCREMENT;

    const candidates = this.queue.filter(
      (p) =>
        p.userId !== player.userId && Math.abs(p.elo - player.elo) <= eloRange,
    );

    if (candidates.length === 0) return undefined;

    return candidates.reduce((best, current) =>
      Math.abs(current.elo - player.elo) < Math.abs(best.elo - player.elo)
        ? current
        : best,
    );
  }

  matchAll(): Array<[QueuedPlayer, QueuedPlayer]> {
    const matches: Array<[QueuedPlayer, QueuedPlayer]> = [];
    const matched = new Set<string>();

    for (const player of this.queue) {
      if (matched.has(player.socketId)) continue;
      const opponent = this.findMatch(player);
      if (!opponent || matched.has(opponent.socketId)) continue;

      matches.push([player, opponent]);
      matched.add(player.socketId);
      matched.add(opponent.socketId);
    }

    for (const [p1, p2] of matches) {
      this.remove(p1.socketId);
      this.remove(p2.socketId);
    }

    return matches;
  }
}
