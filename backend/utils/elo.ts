export function calculateElo(
  winnerElo: number,
  loserElo: number,
  kFactor = 32,
) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const expectedLoser = 1 - expectedWinner;

  return {
    winnerChange: Math.round(kFactor * (1 - expectedWinner)),
    loserChange: Math.round(kFactor * (0 - expectedLoser)),
  };
}

export function calculateEloDraw(
  player1Elo: number,
  player2Elo: number,
  kFactor = 32,
) {
  const expected1 = 1 / (1 + Math.pow(10, (player2Elo - player1Elo) / 400));
  const expected2 = 1 - expected1;

  return {
    player1Change: Math.round(kFactor * (0.5 - expected1)),
    player2Change: Math.round(kFactor * (0.5 - expected2)),
  };
}
