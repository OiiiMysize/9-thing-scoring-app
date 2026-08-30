import { strict as assert } from 'node:assert';
import {
  getBaseCardValue,
  isWildCard,
  calculateCardScore,
  calculateHandScore,
  computeRoundPointsWon,
  computeGameStats,
  calculatePointDifferences,
  ROUND_WILD_RANKS,
} from './scoring.js';

console.log('--- RUNNING SCORING ENGINE TESTS ---');

// 1. Base card values
assert.equal(getBaseCardValue('A'), 1, 'Ace must be 1 point');
assert.equal(getBaseCardValue('2'), 2, '2 must be 2 points');
assert.equal(getBaseCardValue('9'), 9, '9 must be 9 points');
assert.equal(getBaseCardValue('10'), 10, '10 must be 10 points');
assert.equal(getBaseCardValue('J'), 10, 'Jack must be 10 points');
assert.equal(getBaseCardValue('Q'), 10, 'Queen must be 10 points');
assert.equal(getBaseCardValue('K'), 10, 'King must be 10 points');
console.log('✓ Base card values passed');

// 2. Wild card per round
assert.equal(ROUND_WILD_RANKS[1], 'A', 'Round 1 is Aces wild');
assert.equal(ROUND_WILD_RANKS[5], '5', 'Round 5 is Fives wild');
assert.equal(ROUND_WILD_RANKS[11], 'J', 'Round 11 is Jacks wild');
assert.equal(ROUND_WILD_RANKS[12], 'Q', 'Round 12 is Queens wild');
assert.equal(ROUND_WILD_RANKS[13], 'K', 'Round 13 is Kings wild');
console.log('✓ Wild ranks sequence passed');

// 3. Card score with wild penalty
// Round 1 (Aces wild): Ace = 1 + 10 = 11 pts
const r1Ace = calculateCardScore('A', 1);
assert.equal(r1Ace.baseValue, 1);
assert.equal(r1Ace.isWild, true);
assert.equal(r1Ace.wildPenalty, 10);
assert.equal(r1Ace.totalValue, 11);

// Round 5 (Fives wild): 5 = 5 + 10 = 15 pts; 6 = 6 pts
const r5Five = calculateCardScore('5', 5);
assert.equal(r5Five.totalValue, 15);
const r5Six = calculateCardScore('6', 5);
assert.equal(r5Six.totalValue, 6);
assert.equal(r5Six.isWild, false);

// Round 13 (Kings wild): King = 10 + 10 = 20 pts
const r13King = calculateCardScore('K', 13);
assert.equal(r13King.totalValue, 20);
console.log('✓ Card score & wild penalties passed');

// 4. Hand calculation
const sampleHand = [
  { id: '1', rank: 'K', suit: '♠' }, // 10 pts
  { id: '2', rank: 'Q', suit: '♥' }, // 10 pts
  { id: '3', rank: '5', suit: '♦' }, // wild in R5: 5+10 = 15 pts
  { id: '4', rank: '5', suit: '♣' }, // wild in R5: 5+10 = 15 pts
  { id: '5', rank: '9', suit: '♠' }, // 9 pts
  { id: '6', rank: '8', suit: '♥' }, // 8 pts
  { id: '7', rank: '7', suit: '♦' }, // 7 pts
  { id: '8', rank: '2', suit: '♣' }, // 2 pts
  { id: '9', rank: 'A', suit: '♠' }, // 1 pt
]; // Total: 10+10+15+15+9+8+7+2+1 = 77 pts. (Base 57 + 20 penalty)

const handScored = calculateHandScore(sampleHand, 5, 'p1', 'Player 1');
assert.equal(handScored.handTotal, 77, 'Hand total in Round 5 with two 5s');
assert.equal(handScored.wildCardCount, 2, 'Wild count should be 2');
assert.equal(handScored.wildPenaltyPoints, 20, 'Wild penalty should be 20');
console.log('✓ 9-Card hand scoring with multiple wild cards passed');

// 5. Win Type Multiplier
// 2-Player Draw win -> 2x
const twoPlayerDraw = computeRoundPointsWon([handScored], 'draw', 2);
assert.equal(twoPlayerDraw.multiplier, 2);
assert.equal(twoPlayerDraw.roundPointsWon, 154);

// 2-Player Discard win -> 1x
const twoPlayerDiscard = computeRoundPointsWon([handScored], 'discard', 2);
assert.equal(twoPlayerDiscard.multiplier, 1);
assert.equal(twoPlayerDiscard.roundPointsWon, 77);

// 3-Player Draw win -> 1x
const threePlayerDraw = computeRoundPointsWon([handScored, handScored], 'draw', 3);
assert.equal(threePlayerDraw.multiplier, 1);
assert.equal(threePlayerDraw.roundPointsWon, 154);
console.log('✓ Win type & 2-player doubling multiplier passed');

// 6. Point difference
const players = [
  { id: 'p1', name: 'Alice', avatar: '👑', totalScore: 350 },
  { id: 'p2', name: 'Bob', avatar: '🦁', totalScore: 230 },
  { id: 'p3', name: 'Charlie', avatar: '🦊', totalScore: 200 },
];
const diffs = calculatePointDifferences(players);
assert.equal(diffs['p1'], 0, 'Leader diff is 0');
assert.equal(diffs['p2'], -120, 'Bob is 120 pts behind');
assert.equal(diffs['p3'], -150, 'Charlie is 150 pts behind');
console.log('✓ Final rounds point differences passed');

// 7. End-game stats & leaked points
const mockRounds = [
  {
    roundNumber: 1,
    wildRank: 'A',
    starterPlayerId: 'p1',
    winnerPlayerId: 'p1',
    winType: 'draw',
    scoredHands: [
      { playerId: 'p2', playerName: 'Bob', cards: [], handTotal: 50, wildCardCount: 1, wildPenaltyPoints: 10 },
      { playerId: 'p3', playerName: 'Charlie', cards: [], handTotal: 60, wildCardCount: 0, wildPenaltyPoints: 0 },
    ],
    multiplier: 1,
    roundPointsWon: 110,
    playerScoresAfterRound: { p1: 110, p2: 0, p3: 0 },
    timestamp: Date.now(),
  },
  {
    roundNumber: 2,
    wildRank: '2',
    starterPlayerId: 'p1',
    winnerPlayerId: 'p2',
    winType: 'discard',
    discarderPlayerId: 'p3',
    scoredHands: [
      { playerId: 'p3', playerName: 'Charlie', cards: [], handTotal: 80, wildCardCount: 2, wildPenaltyPoints: 20 },
    ],
    multiplier: 1,
    roundPointsWon: 80,
    playerScoresAfterRound: { p1: 110, p2: 80, p3: 0 },
    timestamp: Date.now(),
  }
];

const stats = computeGameStats(players, mockRounds);
assert.equal(stats.championId, 'p1');
assert.equal(stats.pointsLeaked['p2'], 50, 'Bob leaked 50 pts in R1');
assert.equal(stats.pointsLeaked['p3'], 140, 'Charlie leaked 60 in R1 + 80 in R2 = 140 pts');
assert.equal(stats.roundsWon['p1'], 1);
assert.equal(stats.roundsWon['p2'], 1);
assert.equal(stats.roundsWon['p3'], 0);
assert.equal(stats.wildCardsHeld['p3'], 2);
assert.equal(stats.biggestSingleRoundWin.points, 110);
assert.equal(stats.biggestSingleRoundWin.playerId, 'p1');
console.log('✓ End-game stats & points leaked calculations passed');

console.log('ALL TESTS PASSED SUCCESSFULLY! 🎉');
