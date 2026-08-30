import React, { useState } from 'react';
import type { RoundResult, Player } from '../types/game';
import { X, History, ChevronDown, ChevronUp, Trophy } from 'lucide-react';

interface HistoryModalProps {
  roundResults: RoundResult[];
  players: Player[];
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  roundResults,
  players,
  onClose,
}) => {
  const [expandedRoundIdx, setExpandedRoundIdx] = useState<number | null>(null);

  const getPlayer = (id: string) => players.find((p) => p.id === id);

  const toggleExpand = (idx: number) => {
    setExpandedRoundIdx(expandedRoundIdx === idx ? null : idx);
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content history-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="history-title-wrap">
            <History size={20} className="gold-text" />
            <h3 className="modal-title">Game Scoreboard History</h3>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body history-body">
          {roundResults.length === 0 ? (
            <div className="empty-history">
              <span className="empty-icon">🎴</span>
              <p>No rounds completed yet. Score a round to view history!</p>
            </div>
          ) : (
            <div className="rounds-history-list">
              {roundResults.map((round, idx) => {
                const winner = getPlayer(round.winnerPlayerId);
                const discarder = round.discarderPlayerId ? getPlayer(round.discarderPlayerId) : null;
                const isExpanded = expandedRoundIdx === idx;

                return (
                  <div key={idx} className="history-round-card">
                    <div className="history-round-summary" onClick={() => toggleExpand(idx)}>
                      <div className="round-badge-col">
                        <span className="hr-num">R{round.roundNumber}</span>
                        <span className="hr-wild">Wild: {round.wildRank}</span>
                      </div>

                      <div className="round-winner-col">
                        <div className="winner-row">
                          <Trophy size={14} className="gold-text" />
                          <strong>{winner?.name}</strong>
                        </div>
                        <span className="win-type-label">
                          {round.winType === 'draw' ? '🎴 Draw Win' : `🃏 Discard Win (from ${discarder?.name || 'Player'})`}
                        </span>
                      </div>

                      <div className="round-points-col">
                        <span className="hr-points">+{round.roundPointsWon} pts</span>
                        {round.multiplier > 1 && <span className="hr-multi">2x</span>}
                      </div>

                      <button className="icon-expand" aria-label="Toggle details">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>

                    {/* Expandable Hand Details */}
                    {isExpanded && (
                      <div className="history-hand-details animate-fade-in">
                        <span className="details-heading">Scored Losing Hands:</span>
                        {round.scoredHands.map((sh) => (
                          <div key={sh.playerId} className="details-hand-row">
                            <div className="dh-player-info">
                              <strong>{sh.playerName}</strong>
                              <span className="dh-pts">{sh.handTotal} pts</span>
                            </div>
                            <div className="dh-cards-list">
                              {sh.cards.map((c, cIdx) => (
                                <span
                                  key={cIdx}
                                  className={`mini-card-badge ${
                                    c.suit === '♥' || c.suit === '♦' ? 'suit-red' : 'suit-black'
                                  } ${c.rank === round.wildRank ? 'is-wild' : ''}`}
                                >
                                  {c.rank}{c.suit}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary full-width" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
