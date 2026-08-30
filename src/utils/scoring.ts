import type { Rank, PlayingCard, HandScoring, RoundResult, Player, GameStats, WinType } from '../types/game';

export const ROUND_WILD_RANKS: Record<number, Rank> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
};

export const WILD_PENALTY = 10;

/**
 * Returns the base face value of a card according to game rules:
 * - Ace = 1
 * - 2-10 = Face value (2 to 10)
 * - J, Q, K = 10
 */
export function getBaseCardValue(rank: Rank): number {
  switch (rank) {
    case 'A':
      return 1;
    case '2':
      return 2;
    case '3':
      return 3;
    case '4':
      return 4;
    case '5':
      return 5;
    case '6':
      return 6;
    case '7':
      return 7;
    case '8':
      return 8;
    case '9':
      return 9;
    case '10':
    case 'J':
    case 'Q':
    case 'K':
      return 10;
  }
}

/**
 * Checks if a card rank is wild for a given round.
 */
export function isWildCard(rank: Rank, roundNumber: number): boolean {
  const wildRank = ROUND_WILD_RANKS[roundNumber];
  return rank === wildRank;
}

/**
 * Calculates the score of a single card for the given round.
 * If the card is wild, adds the 10-point penalty on top of its face value.
 */
export function calculateCardScore(rank: Rank, roundNumber: number): {
  baseValue: number;
  isWild: boolean;
  wildPenalty: number;
  totalValue: number;
} {
  const baseValue = getBaseCardValue(rank);
  const isWild = isWildCard(rank, roundNumber);
  const wildPenalty = isWild ? WILD_PENALTY : 0;
  const totalValue = baseValue + wildPenalty;

  return {
    baseValue,
    isWild,
    wildPenalty,
    totalValue,
  };
}

/**
 * Calculates the total score and wild penalties for a player's hand of cards in a specific round.
 */
export function calculateHandScore(
  cards: PlayingCard[],
  roundNumber: number,
  playerId: string,
  playerName: string
): HandScoring {
  let handTotal = 0;
  let wildCardCount = 0;
  let wildPenaltyPoints = 0;

  for (const card of cards) {
    const scored = calculateCardScore(card.rank, roundNumber);
    handTotal += scored.totalValue;
    if (scored.isWild) {
      wildCardCount += 1;
      wildPenaltyPoints += WILD_PENALTY;
    }
  }

  return {
    playerId,
    playerName,
    cards,
    handTotal,
    wildCardCount,
    wildPenaltyPoints,
  };
}

/**
 * Computes the round score awarded to the winner:
 * - Discard win: Sum of only the discarder's hand (multiplier = 1).
 * - Draw win: Sum of all losing players' hands. In a 2-player game, multiplied by 2.
 */
export function computeRoundPointsWon(
  scoredHands: HandScoring[],
  winType: WinType,
  playerCount: number
): { multiplier: number; roundPointsWon: number } {
  const baseSum = scoredHands.reduce((acc, h) => acc + h.handTotal, 0);
  const multiplier = (winType === 'draw' && playerCount === 2) ? 2 : 1;
  const roundPointsWon = baseSum * multiplier;

  return {
    multiplier,
    roundPointsWon,
  };
}

/**
 * Computes all end-game statistics and awards.
 */
export function computeGameStats(players: Player[], roundResults: RoundResult[]): GameStats {
  const pointsLeaked: Record<string, number> = {};
  const roundsWon: Record<string, number> = {};
  const wildCardsHeld: Record<string, number> = {};
  const wildPenaltiesIncurred: Record<string, number> = {};

  // Initialize for all players
  players.forEach((p) => {
    pointsLeaked[p.id] = 0;
    roundsWon[p.id] = 0;
    wildCardsHeld[p.id] = 0;
    wildPenaltiesIncurred[p.id] = 0;
  });

  let biggestWin: { playerId: string; points: number; roundNumber: number } | null = null;

  for (const round of roundResults) {
    // Winner stats
    roundsWon[round.winnerPlayerId] = (roundsWon[round.winnerPlayerId] || 0) + 1;

    if (!biggestWin || round.roundPointsWon > biggestWin.points) {
      biggestWin = {
        playerId: round.winnerPlayerId,
        points: round.roundPointsWon,
        roundNumber: round.roundNumber,
      };
    }

    // Hand-by-hand stats for losing players
    for (const hand of round.scoredHands) {
      pointsLeaked[hand.playerId] = (pointsLeaked[hand.playerId] || 0) + hand.handTotal;
      wildCardsHeld[hand.playerId] = (wildCardsHeld[hand.playerId] || 0) + hand.wildCardCount;
      wildPenaltiesIncurred[hand.playerId] = (wildPenaltiesIncurred[hand.playerId] || 0) + hand.wildPenaltyPoints;
    }
  }

  // Champion: highest cumulative score
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const championId = sortedPlayers[0]?.id || '';

  return {
    championId,
    pointsLeaked,
    roundsWon,
    wildCardsHeld,
    wildPenaltiesIncurred,
    biggestSingleRoundWin: biggestWin,
  };
}

/**
 * Calculates point differences from the leader for all players.
 */
export function calculatePointDifferences(players: Player[]): Record<string, number> {
  const maxScore = Math.max(...players.map((p) => p.totalScore), 0);
  const diffs: Record<string, number> = {};

  players.forEach((p) => {
    diffs[p.id] = p.totalScore - maxScore;
  });

  return diffs;
}
