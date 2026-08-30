import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Player, RoundResult } from '../types/game';
import { computeGameStats, ROUND_WILD_RANKS } from '../utils/scoring';
import { Trophy, Award, Flame, Sparkles, TrendingDown, RefreshCw, X, Zap } from 'lucide-react';

interface EndGameModalProps {
  players: Player[];
  roundResults: RoundResult[];
  onStartNewGame: () => void;
  onClose: () => void;
}

export const EndGameModal: React.FC<EndGameModalProps> = ({
  players,
  roundResults,
  onStartNewGame,
  onClose,
}) => {
  const stats = computeGameStats(players, roundResults);
  const sortedPlayers = [...players].sort((a, b) => b.totalScore - a.totalScore);
  const champion = sortedPlayers[0];

  // Fire confetti on launch
  useEffect(() => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f6c445', '#10b981', '#ffffff', '#ff4757'],
      });

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#f6c445', '#10b981'],
        });
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#f6c445', '#ff4757'],
        });
      }, 500);

      return () => clearTimeout(timeout);
    } catch {
      // ignore if confetti fails
    }
  }, []);

  // Calculate most rounds won player
  const mostRoundsWonPlayer = [...players].sort(
    (a, b) => (stats.roundsWon[b.id] || 0) - (stats.roundsWon[a.id] || 0)
  )[0];

  // Calculate most points leaked (giver)
  const mostLeakedPlayer = [...players].sort(
    (a, b) => (stats.pointsLeaked[b.id] || 0) - (stats.pointsLeaked[a.id] || 0)
  )[0];

  // Calculate wild magnet
  const wildMagnetPlayer = [...players].sort(
    (a, b) => (stats.wildCardsHeld[b.id] || 0) - (stats.wildCardsHeld[a.id] || 0)
  )[0];

  const biggestWinPlayer = stats.biggestSingleRoundWin
    ? players.find((p) => p.id === stats.biggestSingleRoundWin?.playerId)
    : null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content endgame-modal" onClick={(e) => e.stopPropagation()}>
        <div className="endgame-header">
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>

          <div className="endgame-trophy-banner animate-float">
            <div className="trophy-glow-circle">
              <Trophy size={48} className="gold-text" />
            </div>
            <span className="endgame-sub-title">13-ROUND CHAMPIONSHIP COMPLETED</span>
            <h2 className="endgame-champion-name">
              👑 {champion?.name} Wins!
            </h2>
            <div className="champion-final-score">
              <span className="champ-pts">{champion?.totalScore}</span>
              <span className="champ-label">TOTAL POINTS</span>
            </div>
          </div>
        </div>

        <div className="endgame-body">
          {/* Final Standings Podium */}
          <div className="standings-podium-card">
            <h3 className="section-heading">
              <Award size={18} className="gold-text" />
              <span>Final Standings</span>
            </h3>
            <div className="podium-list">
              {sortedPlayers.map((player, idx) => {
                const medals = ['🥇', '🥈', '🥉', '4️⃣'];
                return (
                  <div key={player.id} className={`podium-row place-${idx + 1}`}>
                    <span className="podium-medal">{medals[idx] || `${idx + 1}th`}</span>
                    <span className="podium-avatar">{player.avatar}</span>
                    <div className="podium-info">
                      <strong className="podium-name">{player.name}</strong>
                      <span className="podium-sub">
                        Won {stats.roundsWon[player.id] || 0} / 13 rounds
                      </span>
                    </div>
                    <div className="podium-score">
                      <span className="podium-score-val">{player.totalScore}</span>
                      <span className="podium-score-unit">PTS</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Special Game Awards & Statistics */}
          <div className="awards-grid">
            {/* Points Leaked Card */}
            <div className="award-card leak-card">
              <div className="award-icon-wrap ruby-bg">
                <TrendingDown size={22} className="ruby-text" />
              </div>
              <div className="award-meta">
                <span className="award-tag">POINTS GIVEN AWAY</span>
                <strong className="award-winner">
                  {mostLeakedPlayer?.avatar} {mostLeakedPlayer?.name}
                </strong>
                <span className="award-detail">
                  Surrendered {stats.pointsLeaked[mostLeakedPlayer?.id || ''] || 0} pts from losing hands
                </span>
              </div>
            </div>

            {/* Biggest Single Round Win */}
            {stats.biggestSingleRoundWin && biggestWinPlayer && (
              <div className="award-card biggest-win-card">
                <div className="award-icon-wrap gold-bg">
                  <Flame size={22} className="gold-text" />
                </div>
                <div className="award-meta">
                  <span className="award-tag">BIGGEST SINGLE ROUND WIN</span>
                  <strong className="award-winner">
                    {biggestWinPlayer.avatar} {biggestWinPlayer.name}
                  </strong>
                  <span className="award-detail">
                    Scored <strong>+{stats.biggestSingleRoundWin.points} pts</strong> in Round {stats.biggestSingleRoundWin.roundNumber} ({ROUND_WILD_RANKS[stats.biggestSingleRoundWin.roundNumber]}s Wild)
                  </span>
                </div>
              </div>
            )}

            {/* Rounds Champion */}
            <div className="award-card rounds-card">
              <div className="award-icon-wrap emerald-bg">
                <Zap size={22} className="emerald-text" />
              </div>
              <div className="award-meta">
                <span className="award-tag">MOST ROUNDS WON</span>
                <strong className="award-winner">
                  {mostRoundsWonPlayer?.avatar} {mostRoundsWonPlayer?.name}
                </strong>
                <span className="award-detail">
                  Won {stats.roundsWon[mostRoundsWonPlayer?.id || ''] || 0} of 13 rounds
                </span>
              </div>
            </div>

            {/* Wild Card Magnet */}
            {wildMagnetPlayer && (stats.wildCardsHeld[wildMagnetPlayer.id] || 0) > 0 && (
              <div className="award-card wild-magnet-card">
                <div className="award-icon-wrap purple-bg">
                  <Sparkles size={22} className="purple-text" />
                </div>
                <div className="award-meta">
                  <span className="award-tag">WILD CARD MAGNET</span>
                  <strong className="award-winner">
                    {wildMagnetPlayer.avatar} {wildMagnetPlayer.name}
                  </strong>
                  <span className="award-detail">
                    Caught with {stats.wildCardsHeld[wildMagnetPlayer.id]} wild cards (+{stats.wildPenaltiesIncurred[wildMagnetPlayer.id]} penalty pts)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Points Leaked Breakdown for All Players */}
          <div className="points-leaked-summary-table">
            <h4 className="table-heading">Points Surrendered (Leaked) Breakdown:</h4>
            <div className="leaked-rows">
              {sortedPlayers.map((p) => (
                <div key={p.id} className="leaked-row">
                  <span className="leaked-p-name">{p.avatar} {p.name}</span>
                  <div className="leaked-bar-container">
                    <div
                      className="leaked-bar-fill"
                      style={{
                        width: `${Math.min(
                          100,
                          ((stats.pointsLeaked[p.id] || 0) /
                            Math.max(...Object.values(stats.pointsLeaked), 1)) *
                            100
                        )}%`,
                      }}
                    />
                  </div>
                  <span className="leaked-pts-val">-{stats.pointsLeaked[p.id] || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="endgame-footer">
          <button type="button" className="btn-new-game animate-pulse-glow" onClick={onStartNewGame}>
            <RefreshCw size={18} />
            <span>START A NEW 13-ROUND GAME</span>
          </button>
        </div>
      </div>
    </div>
  );
};
