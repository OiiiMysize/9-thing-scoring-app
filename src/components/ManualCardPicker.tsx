import React, { useState } from 'react';
import type { Rank, Suit, PlayingCard } from '../types/game';
import { ROUND_WILD_RANKS, isWildCard } from '../utils/scoring';
import { Check, X, Sparkles } from 'lucide-react';

interface ManualCardPickerProps {
  roundNumber: number;
  initialCard?: PlayingCard;
  onSaveCard: (card: PlayingCard) => void;
  onClose: () => void;
}

const ALL_RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const ALL_SUITS: { suit: Suit; label: string; color: 'red' | 'black' }[] = [
  { suit: '♠', label: 'Spades', color: 'black' },
  { suit: '♥', label: 'Hearts', color: 'red' },
  { suit: '♦', label: 'Diamonds', color: 'red' },
  { suit: '♣', label: 'Clubs', color: 'black' },
];

export const ManualCardPicker: React.FC<ManualCardPickerProps> = ({
  roundNumber,
  initialCard,
  onSaveCard,
  onClose,
}) => {
  const [selectedRank, setSelectedRank] = useState<Rank>(initialCard?.rank || 'A');
  const [selectedSuit, setSelectedSuit] = useState<Suit>(initialCard?.suit || '♠');

  const wildRank = ROUND_WILD_RANKS[roundNumber];
  const isWild = isWildCard(selectedRank, roundNumber);

  const handleConfirm = () => {
    onSaveCard({
      id: initialCard?.id || `card-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      rank: selectedRank,
      suit: selectedSuit,
    });
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content card-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="picker-preview-box">
            <span className={`preview-card ${selectedSuit === '♥' || selectedSuit === '♦' ? 'suit-red' : 'suit-black'}`}>
              <span className="card-rank">{selectedRank}</span>
              <span className="card-suit">{selectedSuit}</span>
            </span>
            <div className="preview-meta">
              <h3 className="picker-title">{initialCard ? 'Edit Card' : 'Add Card'}</h3>
              {isWild ? (
                <span className="picker-wild-badge animate-pulse-glow">
                  <Sparkles size={12} /> Wild Card (+10 pts)
                </span>
              ) : (
                <span className="picker-normal-badge">Round {roundNumber} (Wild is {wildRank})</span>
              )}
            </div>
          </div>
          <button className="icon-btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="picker-body">
          {/* Suit Selector */}
          <div className="suit-selector-group">
            <label className="picker-label">Select Suit</label>
            <div className="suit-grid">
              {ALL_SUITS.map((s) => (
                <button
                  key={s.suit}
                  type="button"
                  className={`suit-btn ${s.color} ${selectedSuit === s.suit ? 'active' : ''}`}
                  onClick={() => setSelectedSuit(s.suit)}
                >
                  <span className="suit-symbol">{s.suit}</span>
                  <span className="suit-name">{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Rank Selector */}
          <div className="rank-selector-group">
            <label className="picker-label">Select Rank</label>
            <div className="rank-grid">
              {ALL_RANKS.map((r) => {
                const isThisWild = isWildCard(r, roundNumber);
                return (
                  <button
                    key={r}
                    type="button"
                    className={`rank-btn ${selectedRank === r ? 'active' : ''} ${isThisWild ? 'is-wild' : ''}`}
                    onClick={() => setSelectedRank(r)}
                  >
                    <span className="rank-text">{r}</span>
                    {isThisWild && <span className="rank-wild-star">★</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="picker-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleConfirm}>
            <Check size={18} />
            <span>{initialCard ? 'Update Card' : 'Add to Hand'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
