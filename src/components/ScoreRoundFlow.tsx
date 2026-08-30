import React, { useState } from 'react';
import type { Player, WinType, PlayingCard, HandScoring, RoundResult } from '../types/game';
import { ROUND_WILD_RANKS, computeRoundPointsWon, calculateHandScore } from '../utils/scoring';
import { HandScanner } from './HandScanner';
import { CardVerification } from './CardVerification';
import { Trophy, ArrowRight, ArrowLeft, Check, Layers, UserCheck, Flame } from 'lucide-react';

interface ScoreRoundFlowProps {
  currentRound: number;
  players: Player[];
  starterPlayerId: string;
  apiKey: string;
  onCompleteRound: (result: RoundResult) => void;
  onCancel: () => void;
  onOpenSettings: () => void;
}

export const ScoreRoundFlow: React.FC<ScoreRoundFlowProps> = ({
  currentRound,
  players,
  starterPlayerId,
  apiKey,
  onCompleteRound,
  onCancel,
  onOpenSettings,
}) => {
  const [step, setStep] = useState<'select-winner' | 'select-wintype' | 'scoring-hands' | 'summary'>('select-winner');
  const [winnerId, setWinnerId] = useState<string>('');
  const [winType, setWinType] = useState<WinType>('draw');
  const [discarderId, setDiscarderId] = useState<string>('');

  // Losing players whose hands need scoring
  const [losingHandsCards, setLosingHandsCards] = useState<Record<string, PlayingCard[]>>({});
  const [activeScoringPlayerIndex, setActiveScoringPlayerIndex] = useState<number>(0);

  const wildRank = ROUND_WILD_RANKS[currentRound];
  const isTwoPlayer = players.length === 2;

  // Determine list of player IDs that must be scored
  const getRequiredLosingPlayerIds = (): string[] => {
    if (winType === 'discard') {
      return discarderId ? [discarderId] : [];
    } else {
      return players.filter((p) => p.id !== winnerId).map((p) => p.id);
    }
  };

  const requiredLosingPlayerIds = getRequiredLosingPlayerIds();
  const currentScoringPlayerId = requiredLosingPlayerIds[activeScoringPlayerIndex] || '';
  const currentScoringPlayer = players.find((p) => p.id === currentScoringPlayerId);

  const handleWinnerSelected = (pId: string) => {
    setWinnerId(pId);
    if (discarderId === pId) setDiscarderId('');
    setStep('select-wintype');
  };

  const handleWinTypeSelected = (type: WinType) => {
    setWinType(type);
    if (type === 'draw') {
      setDiscarderId('');
      const initHands: Record<string, PlayingCard[]> = {};
      players.filter((p) => p.id !== winnerId).forEach((p) => {
        initHands[p.id] = losingHandsCards[p.id] || [];
      });
      setLosingHandsCards(initHands);
      setActiveScoringPlayerIndex(0);
      setStep('scoring-hands');
    }
  };

  const handleDiscarderSelected = (dId: string) => {
    setDiscarderId(dId);
    const initHands: Record<string, PlayingCard[]> = {
      [dId]: losingHandsCards[dId] || [],
    };
    setLosingHandsCards(initHands);
    setActiveScoringPlayerIndex(0);
    setStep('scoring-hands');
  };

  const handleCardsDetectedForActivePlayer = (cards: PlayingCard[]) => {
    if (!currentScoringPlayerId) return;
    setLosingHandsCards((prev) => ({
      ...prev,
      [currentScoringPlayerId]: cards,
    }));
  };

  const handleUpdateCardsForActivePlayer = (cards: PlayingCard[]) => {
    if (!currentScoringPlayerId) return;
    setLosingHandsCards((prev) => ({
      ...prev,
      [currentScoringPlayerId]: cards,
    }));
  };

  const handleNextHandOrSummary = () => {
    if (activeScoringPlayerIndex < requiredLosingPlayerIds.length - 1) {
      setActiveScoringPlayerIndex((prev) => prev + 1);
    } else {
      setStep('summary');
    }
  };

  const handlePrevHand = () => {
    if (activeScoringPlayerIndex > 0) {
      setActiveScoringPlayerIndex((prev) => prev - 1);
    } else {
      setStep('select-wintype');
    }
  };

  // Compile final hand scorings
  const scoredHands: HandScoring[] = requiredLosingPlayerIds.map((pId) => {
    const p = players.find((pl) => pl.id === pId);
    const cards = losingHandsCards[pId] || [];
    return calculateHandScore(cards, currentRound, pId, p?.name || 'Player');
  });

  const { multiplier, roundPointsWon } = computeRoundPointsWon(
    scoredHands,
    winType,
    players.length
  );

  const handleFinalConfirm = () => {
    const playerScoresAfterRound: Record<string, number> = {};
    players.forEach((p) => {
      if (p.id === winnerId) {
        playerScoresAfterRound[p.id] = p.totalScore + roundPointsWon;
      } else {
        playerScoresAfterRound[p.id] = p.totalScore;
      }
    });

    const result: RoundResult = {
      roundNumber: currentRound,
      wildRank,
      starterPlayerId,
      winnerPlayerId: winnerId,
      winType,
      discarderPlayerId: winType === 'discard' ? discarderId : undefined,
      scoredHands,
      multiplier,
      roundPointsWon,
      playerScoresAfterRound,
      timestamp: Date.now(),
    };

    onCompleteRound(result);
  };

  const winner = players.find((p) => p.id === winnerId);

  return (
    <div className="flow-container animate-fade-in">
      <div className="flow-header">
        <div className="flow-title-row">
          <h2 className="flow-title">Score Round {currentRound}</h2>
          <span className="flow-wild-tag">Wild: {wildRank}s (+10)</span>
        </div>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>

      {/* STEP 1: Select Round Winner */}
      {step === 'select-winner' && (
        <div className="step-card animate-fade-in">
          <div className="step-badge">
            <Trophy size={18} className="gold-text" />
            <span>Step 1: Who won this round?</span>
          </div>
          <p className="step-instruction">
            Select the player who successfully completed their 10-card winning hand:
          </p>

          <div className="player-selection-grid">
            {players.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`player-choice-card ${winnerId === p.id ? 'selected' : ''}`}
                onClick={() => handleWinnerSelected(p.id)}
              >
                <span className="choice-avatar">{p.avatar}</span>
                <span className="choice-name">{p.name}</span>
                <span className="choice-score">{p.totalScore} pts</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Select Win Type */}
      {step === 'select-wintype' && (
        <div className="step-card animate-fade-in">
          <div className="step-badge">
            <Layers size={18} className="gold-text" />
            <span>Step 2: How did {winner?.name} win?</span>
          </div>

          <div className="wintype-grid">
            <button
              type="button"
              className={`wintype-card ${winType === 'draw' ? 'active' : ''}`}
              onClick={() => handleWinTypeSelected('draw')}
            >
              <div className="wintype-icon">🎴</div>
              <strong className="wintype-title">Draw Pile Win</strong>
              <p className="wintype-desc">
                Winner completed hand from the draw deck. Scores from <strong>all other players'</strong> hands.
              </p>
              {isTwoPlayer && (
                <div className="multiplier-badge animate-pulse-glow">
                  <Flame size={14} /> 2-Player Game: 2x Double Points!
                </div>
              )}
            </button>

            <button
              type="button"
              className={`wintype-card ${winType === 'discard' ? 'active' : ''}`}
              onClick={() => handleWinTypeSelected('discard')}
            >
              <div className="wintype-icon">🃏</div>
              <strong className="wintype-title">Discard Pile Win</strong>
              <p className="wintype-desc">
                Winner took an opponent's discarded card. Only scores that <strong>specific opponent's</strong> hand.
              </p>
            </button>
          </div>

          {/* If Discard win selected, pick discarder */}
          {winType === 'discard' && (
            <div className="discarder-selection-section animate-fade-in">
              <label className="section-label">
                <UserCheck size={16} className="gold-text" />
                <span>Which player discarded the winning card?</span>
              </label>
              <div className="player-selection-grid">
                {players
                  .filter((p) => p.id !== winnerId)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`player-choice-card ${discarderId === p.id ? 'selected' : ''}`}
                      onClick={() => handleDiscarderSelected(p.id)}
                    >
                      <span className="choice-avatar">{p.avatar}</span>
                      <span className="choice-name">{p.name}</span>
                      <span className="choice-sub">Discarded Card</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          <div className="step-nav-buttons">
            <button type="button" className="btn-secondary" onClick={() => setStep('select-winner')}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Scan / Verify Hands */}
      {step === 'scoring-hands' && currentScoringPlayer && (
        <div className="step-card animate-fade-in">
          <div className="hand-progress-banner">
            <span className="hand-step-label">
              Hand {activeScoringPlayerIndex + 1} of {requiredLosingPlayerIds.length}
            </span>
            <div className="hand-progress-dots">
              {requiredLosingPlayerIds.map((id, idx) => (
                <div
                  key={id}
                  className={`progress-dot ${
                    idx === activeScoringPlayerIndex
                      ? 'current'
                      : (losingHandsCards[id] || []).length > 0
                      ? 'done'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>

          {(losingHandsCards[currentScoringPlayerId] || []).length === 0 ? (
            <HandScanner
              apiKey={apiKey}
              roundNumber={currentRound}
              playerName={currentScoringPlayer.name}
              onCardsDetected={handleCardsDetectedForActivePlayer}
              onOpenManualEntry={() => handleCardsDetectedForActivePlayer([])}
              onOpenSettings={onOpenSettings}
            />
          ) : (
            <CardVerification
              cards={losingHandsCards[currentScoringPlayerId] || []}
              roundNumber={currentRound}
              playerName={currentScoringPlayer.name}
              playerId={currentScoringPlayer.id}
              onUpdateCards={handleUpdateCardsForActivePlayer}
              expectedCardCount={9}
            />
          )}

          <div className="step-nav-buttons">
            <button type="button" className="btn-secondary" onClick={handlePrevHand}>
              <ArrowLeft size={16} /> Previous
            </button>

            <button
              type="button"
              className="btn-primary"
              onClick={handleNextHandOrSummary}
              disabled={(losingHandsCards[currentScoringPlayerId] || []).length === 0}
            >
              <span>
                {activeScoringPlayerIndex < requiredLosingPlayerIds.length - 1
                  ? 'Next Losing Hand'
                  : 'Review & Confirm Score'}
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Summary & Confirm */}
      {step === 'summary' && (
        <div className="step-card summary-card animate-fade-in">
          <div className="summary-banner">
            <Trophy size={28} className="gold-text animate-float" />
            <div className="summary-title-wrap">
              <span className="summary-subtitle">Round {currentRound} Result</span>
              <h3 className="summary-winner-heading">
                {winner?.avatar} {winner?.name} Wins!
              </h3>
            </div>
          </div>

          <div className="points-award-box animate-pulse-glow">
            <span className="points-award-label">TOTAL POINTS AWARDED</span>
            <div className="points-big-number">
              <span className="number-val">+{roundPointsWon}</span>
              <span className="number-unit">PTS</span>
            </div>
            {multiplier > 1 && (
              <span className="multiplier-tag">
                🔥 2-Player Draw Win Multiplier (2x Applied)
              </span>
            )}
          </div>

          <div className="summary-breakdown-list">
            <h4 className="breakdown-heading">Hands Scored in this Round:</h4>
            {scoredHands.map((sh) => (
              <div key={sh.playerId} className="summary-hand-item">
                <div className="summary-hand-player">
                  <span className="sh-name">{sh.playerName}</span>
                  <span className="sh-cards-count">{sh.cards.length} cards</span>
                </div>
                <div className="summary-hand-points">
                  <span className="sh-pts">{sh.handTotal} pts</span>
                  {sh.wildCardCount > 0 && (
                    <span className="sh-wild-badge">
                      ({sh.wildCardCount} wild = +{sh.wildPenaltyPoints} penalty)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="step-nav-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setActiveScoringPlayerIndex(requiredLosingPlayerIds.length - 1);
                setStep('scoring-hands');
              }}
            >
              <ArrowLeft size={16} /> Edit Hands
            </button>

            <button
              type="button"
              className="btn-confirm-round animate-pulse-glow"
              onClick={handleFinalConfirm}
            >
              <Check size={20} />
              <span>CONFIRM & ADVANCE TO NEXT ROUND</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
