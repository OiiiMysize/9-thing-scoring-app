import React from 'react';
import type { Player } from '../types/game';
import { calculatePointDifferences } from '../utils/scoring';
import { Flame, Crown, Target, AlertCircle } from 'lucide-react';

interface LeaderboardProps {
  players: Player[];
  starterPlayerId: string;
  currentRound: number;
  gameCompleted: boolean;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  players,
  starterPlayerId,
  currentRound,
  gameCompleted,
}) => {
  // Sort players by totalScore descending to determine ranks
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const highestScore = sortedPlayers[0]?.totalScore || 0;
  const isFinalRounds = currentRound >= 11 || gameCompleted;
  const pointDiffs = calculatePointDifferences(players);

  const getRankBadge = (index: number, score: number) => {
    if (index === 0 && score > 0) return { label: '1st', icon: '👑', color: 'gold' };
    if (index === 1 && score > 0) return { label: '2nd', icon: '🥈', color: 'silver' };
    if (index === 2 && score > 0) return { label: '3rd', icon: '🥉', color: 'bronze' };
    return { label: `${index + 1}th`, icon: null, color: 'default' };
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <div className="leaderboard-title">
          <Crown size={18} className="gold-text" />
          <h2>Leaderboard</h2>
        </div>
        {isFinalRounds && (
          <div className="final-rounds-tag">
            <Flame size={14} className="fire-icon" />
            <span>FINAL STRETCH • PTS GAP ACTIVE</span>
          </div>
        )}
      </div>

      <div className="player-list">
        {sortedPlayers.map((player, index) => {
          const isLeader = index === 0 && player.totalScore > 0;
          const isStarter = player.id === starterPlayerId && !gameCompleted;
          const rankInfo = getRankBadge(index, player.totalScore);
          const diff = pointDiffs[player.id] || 0;

          return (
            <div
              key={player.id}
              className={`player-card ${isLeader ? 'is-leader' : ''}`}
            >
              <div className="player-rank">
                <span className={`rank-pill rank-${rankInfo.color}`}>
                  {rankInfo.icon || rankInfo.label}
                </span>
              </div>

              <div className="player-avatar-wrap">
                <span className="player-avatar">{player.avatar}</span>
                {isStarter && (
                  <span className="starter-badge" title="Starting Player for this round">
                    <Target size={12} />
                  </span>
                )}
              </div>

              <div className="player-details">
                <div className="player-name-row">
                  <span className="player-name">{player.name}</span>
                  {isStarter && <span className="starter-label">Starts Turn</span>}
                </div>

                {isFinalRounds && (
                  <div className="point-diff-row">
                    {diff === 0 ? (
                      <span className="diff-tag leader-diff">
                        👑 Leader (+{highestScore} pts)
                      </span>
                    ) : (
                      <span className="diff-tag trailing-diff">
                        <AlertCircle size={12} />
                        {Math.abs(diff)} pts behind
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="player-score-box">
                <span className="score-value">{player.totalScore}</span>
                <span className="score-unit">PTS</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
