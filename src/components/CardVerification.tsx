import React, { useState } from 'react';
import type { PlayingCard } from '../types/game';
import { calculateHandScore, calculateCardScore } from '../utils/scoring';
import { ManualCardPicker } from './ManualCardPicker';
import { Plus, Trash2, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CardVerificationProps {
  cards: PlayingCard[];
  roundNumber: number;
  playerName: string;
  playerId: string;
  onUpdateCards: (cards: PlayingCard[]) => void;
  expectedCardCount?: number;
}

export const CardVerification: React.FC<CardVerificationProps> = ({
  cards,
  roundNumber,
  playerName,
  playerId,
  onUpdateCards,
  expectedCardCount = 9,
}) => {
  const [editingCard, setEditingCard] = useState<PlayingCard | null>(null);
  const [isAddingCard, setIsAddingCard] = useState<boolean>(false);

  const handScore = calculateHandScore(cards, roundNumber, playerId, playerName);
  const countMatches = cards.length === expectedCardCount;

  const handleSaveCard = (card: PlayingCard) => {
    if (editingCard) {
      onUpdateCards(cards.map((c) => (c.id === editingCard.id ? card : c)));
      setEditingCard(null);
    } else if (isAddingCard) {
      onUpdateCards([...cards, card]);
      setIsAddingCard(false);
    }
  };

  const handleDeleteCard = (cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateCards(cards.filter((c) => c.id !== cardId));
  };

  return (
    <div className="card-verification-card">
      <div className="verification-header">
        <div className="player-summary-badge">
          <span className="scoring-for-label">Scoring Hand for:</span>
          <strong className="scoring-player-name">{playerName}</strong>
        </div>

        <div className={`card-count-indicator ${countMatches ? 'count-valid' : 'count-warning'}`}>
          {countMatches ? (
            <CheckCircle2 size={16} className="emerald-text" />
          ) : (
            <AlertTriangle size={16} className="amber-text" />
          )}
          <span>
            {cards.length} / {expectedCardCount} Cards
          </span>
        </div>
      </div>

      {!countMatches && (
        <div className="card-count-alert">
          <span>
            {cards.length < expectedCardCount
              ? `⚠️ Hand has ${cards.length} cards (expected ${expectedCardCount}). Tap '+ Add Card' to add missing cards.`
              : `⚠️ Hand has ${cards.length} cards (expected ${expectedCardCount}). Please verify cards.`}
          </span>
        </div>
      )}

      {/* Cards Grid */}
      <div className="cards-grid">
        {cards.map((card, idx) => {
          const scoreInfo = calculateCardScore(card.rank, roundNumber);
          const isRed = card.suit === '♥' || card.suit === '♦';

          return (
            <div
              key={card.id || idx}
              className={`playing-card-tile ${isRed ? 'suit-red' : 'suit-black'} ${scoreInfo.isWild ? 'is-wild-card' : ''}`}
              onClick={() => setEditingCard(card)}
              title="Tap to edit card"
            >
              <div className="card-tile-top">
                <span className="card-rank-display">{card.rank}</span>
                <span className="card-suit-display">{card.suit}</span>
              </div>

              <div className="card-center-symbol">{card.suit}</div>

              <div className="card-tile-bottom">
                {scoreInfo.isWild ? (
                  <span className="wild-tag">
                    <Sparkles size={10} /> +10 WILD ({scoreInfo.totalValue}pt)
                  </span>
                ) : (
                  <span className="pts-tag">{scoreInfo.baseValue} pt</span>
                )}
              </div>

              <button
                type="button"
                className="card-delete-corner"
                onClick={(e) => handleDeleteCard(card.id, e)}
                title="Remove Card"
              >
                <Trash2 size={12} />
              </button>
            </div>
          );
        })}

        {cards.length < 12 && (
          <button
            type="button"
            className="add-card-placeholder-btn"
            onClick={() => setIsAddingCard(true)}
          >
            <Plus size={24} />
            <span>Add Card</span>
          </button>
        )}
      </div>

      {/* Hand Score Live Breakdown */}
      <div className="hand-score-breakdown">
        <div className="breakdown-col">
          <span className="breakdown-label">Base Card Points</span>
          <span className="breakdown-val">
            {handScore.handTotal - handScore.wildPenaltyPoints} pts
          </span>
        </div>
        <div className="breakdown-col">
          <span className="breakdown-label">
            Wild Penalty ({handScore.wildCardCount} wild{handScore.wildCardCount === 1 ? '' : 's'})
          </span>
          <span className="breakdown-val gold-text">
            +{handScore.wildPenaltyPoints} pts
          </span>
        </div>
        <div className="breakdown-col total-col">
          <span className="breakdown-label">Hand Subtotal</span>
          <span className="breakdown-total-val">{handScore.handTotal} PTS</span>
        </div>
      </div>

      {/* Manual Card Picker Modal */}
      {(editingCard || isAddingCard) && (
        <ManualCardPicker
          roundNumber={roundNumber}
          initialCard={editingCard || undefined}
          onSaveCard={handleSaveCard}
          onClose={() => {
            setEditingCard(null);
            setIsAddingCard(false);
          }}
        />
      )}
    </div>
  );
};
