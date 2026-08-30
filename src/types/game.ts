export type Suit = '♠' | '♥' | '♦' | '♣';

export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface PlayingCard {
  id: string;
  rank: Rank;
  suit: Suit;
}

export type WinType = 'discard' | 'draw';

export interface Player {
  id: string;
  name: string;
  avatar: string; // Emoji or avatar identifier
  totalScore: number;
}

export interface HandScoring {
  playerId: string;
  playerName: string;
  cards: PlayingCard[];
  handTotal: number;
  wildCardCount: number;
  wildPenaltyPoints: number;
}

export interface RoundResult {
  roundNumber: number;
  wildRank: Rank;
  starterPlayerId: string;
  winnerPlayerId: string;
  winType: WinType;
  discarderPlayerId?: string; // Only applicable when winType === 'discard'
  scoredHands: HandScoring[];
  multiplier: number; // 2 for 2-player draw wins, 1 otherwise
  roundPointsWon: number;
  playerScoresAfterRound: Record<string, number>; // snapshot of cumulative scores
  timestamp: number;
}

export interface GameStats {
  championId: string;
  pointsLeaked: Record<string, number>; // Total points given away from each player's losing hands
  roundsWon: Record<string, number>;    // Total rounds won by each player
  wildCardsHeld: Record<string, number>;// Total wild cards held by each player
  wildPenaltiesIncurred: Record<string, number>;
  biggestSingleRoundWin: {
    playerId: string;
    points: number;
    roundNumber: number;
  } | null;
}

export interface GameState {
  gameStarted: boolean;
  gameCompleted: boolean;
  currentRound: number; // 1 to 13
  players: Player[];
  roundResults: RoundResult[];
  starterPlayerId: string; // active round starter
}
