// utils/groupPieces.ts
export function groupPieces(pieces: string[]) {
  const map: Record<string, number> = {};

  for (const p of pieces) {
    map[p] = (map[p] || 0) + 1;
  }

  return Object.entries(map)
    .map(([piece, count]) => ({ piece, count }))
    .sort((a, b) => {
      const order = ["q", "r", "b", "n", "p"];
      return order.indexOf(a.piece) - order.indexOf(b.piece);
    });
}
