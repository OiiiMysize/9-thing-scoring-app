import React from 'react';
import { Settings, History, Sparkles, Award, RotateCcw } from 'lucide-react';
import { ROUND_WILD_RANKS } from '../utils/scoring';

interface HeaderProps {
  currentRound: number;
  totalRounds?: number;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onOpenStats?: () => void;
  onRestartGame?: () => void;
  gameCompleted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentRound,
  totalRounds = 13,
  onOpenSettings,
  onOpenHistory,
  onOpenStats,
  onRestartGame,
  gameCompleted,
}) => {
  const wildRank = ROUND_WILD_RANKS[currentRound] || 'A';

  const rankFullName: Record<string, string> = {
    A: 'Aces',
    '2': 'Twos',
    '3': 'Threes',
    '4': 'Fours',
    '5': 'Fives',
    '6': 'Sixes',
    '7': 'Sevens',
    '8': 'Eights',
    '9': 'Nines',
    '10': 'Tens',
    J: 'Jacks',
    Q: 'Queens',
    K: 'Kings',
  };

  return (
    <header className="app-header">
      <div className="header-top">
        <div className="brand-badge">
          <span className="brand-emblem">🃏</span>
          <div className="brand-titles">
            <h1 className="brand-name">IT'S A 9 THING!</h1>
            <span className="brand-subtitle">Card Game Scorer</span>
          </div>
        </div>

        <div className="header-actions">
          {onRestartGame && (
            <button
              className="icon-btn hover-ruby"
              onClick={onRestartGame}
              title="Restart Game"
              aria-label="Restart Game"
            >
              <RotateCcw size={18} />
            </button>
          )}
          {gameCompleted && onOpenStats && (
            <button
              className="icon-btn highlight-gold"
              onClick={onOpenStats}
              title="End Game Awards"
              aria-label="View Awards"
            >
              <Award size={20} />
            </button>
          )}
          <button
            className="icon-btn"
            onClick={onOpenHistory}
            title="Round History"
            aria-label="View Round History"
          >
            <History size={20} />
          </button>
          <button
            className="icon-btn"
            onClick={onOpenSettings}
            title="Settings & API Key"
            aria-label="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {!gameCompleted ? (
        <div className="round-banner">
          <div className="round-progress">
            <span className="round-label">ROUND {currentRound} / {totalRounds}</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${(currentRound / totalRounds) * 100}%` }}
              />
            </div>
          </div>

          <div className="wild-badge animate-pulse-glow">
            <Sparkles size={16} className="wild-icon" />
            <div className="wild-info">
              <span className="wild-title">WILD CARD</span>
              <span className="wild-value">
                <strong>{wildRank}</strong> ({rankFullName[wildRank] || wildRank})
              </span>
            </div>
            <span className="wild-penalty">+10 pt penalty</span>
          </div>
        </div>
      ) : (
        <div className="game-over-banner">
          <Award size={22} className="trophy-gold" />
          <span>Game Completed (All 13 Rounds Played)</span>
        </div>
      )}
    </header>
  );
};
