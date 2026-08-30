import { useState, useEffect } from 'react';
import type { GameState, RoundResult } from './types/game';
import {
  createInitialGameState,
  saveGameState,
  loadGameState,
  clearGameState,
  loadGeminiApiKey,
  saveGeminiApiKey,
} from './utils/storage';
import { Header } from './components/Header';
import { Leaderboard } from './components/Leaderboard';
import { GameSetup } from './components/GameSetup';
import { ScoreRoundFlow } from './components/ScoreRoundFlow';
import { EndGameModal } from './components/EndGameModal';
import { HistoryModal } from './components/HistoryModal';
import { SettingsModal } from './components/SettingsModal';
import { RestartConfirmModal } from './components/RestartConfirmModal';
import { Award, Sparkles, RefreshCw } from 'lucide-react';
import './App.css';

export function App() {
  const [gameState, setGameState] = useState<GameState | null>(() => loadGameState());
  const [apiKey, setApiKey] = useState<string>(() => loadGeminiApiKey());

  const [isScoringRound, setIsScoringRound] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isEndGameOpen, setIsEndGameOpen] = useState<boolean>(false);
  const [isRestartOpen, setIsRestartOpen] = useState<boolean>(false);

  // Auto-save game state to localStorage whenever it changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
    }
  }, [gameState]);

  // Open End Game modal automatically once all 13 rounds are completed
  useEffect(() => {
    if (gameState?.gameCompleted) {
      setIsEndGameOpen(true);
    }
  }, [gameState?.gameCompleted]);

  const handleStartNewGame = (playerConfigs: { name: string; avatar: string }[]) => {
    const newState = createInitialGameState(playerConfigs);
    setGameState(newState);
    setIsScoringRound(false);
    setIsEndGameOpen(false);
    setIsRestartOpen(false);
  };

  const handleResetGame = () => {
    clearGameState();
    setGameState(null);
    setIsScoringRound(false);
    setIsEndGameOpen(false);
    setIsRestartOpen(false);
  };

  const handleCompleteRound = (result: RoundResult) => {
    if (!gameState) return;

    // Update player scores
    const updatedPlayers = gameState.players.map((player) => {
      const newScore = result.playerScoresAfterRound[player.id];
      return {
        ...player,
        totalScore: typeof newScore === 'number' ? newScore : player.totalScore,
      };
    });

    const isLastRound = gameState.currentRound >= 13;
    const nextRoundNumber = isLastRound ? 13 : gameState.currentRound + 1;
    // Next starter is the winner of this round
    const nextStarterId = result.winnerPlayerId;

    const updatedState: GameState = {
      ...gameState,
      players: updatedPlayers,
      roundResults: [...gameState.roundResults, result],
      currentRound: nextRoundNumber,
      gameCompleted: isLastRound,
      starterPlayerId: nextStarterId,
    };

    setGameState(updatedState);
    setIsScoringRound(false);

    if (isLastRound) {
      setIsEndGameOpen(true);
    }
  };

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    saveGeminiApiKey(newKey);
  };

  if (!gameState || !gameState.gameStarted) {
    return (
      <div className="app-layout">
        <GameSetup onStartGame={handleStartNewGame} />
        {isSettingsOpen && (
          <SettingsModal
            apiKey={apiKey}
            onSaveApiKey={handleSaveApiKey}
            onResetGame={handleResetGame}
            onClose={() => setIsSettingsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="app-layout">
      {/* Header */}
      <Header
        currentRound={gameState.currentRound}
        totalRounds={13}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenStats={() => setIsEndGameOpen(true)}
        onRestartGame={() => setIsRestartOpen(true)}
        gameCompleted={gameState.gameCompleted}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Leaderboard */}
        <Leaderboard
          players={gameState.players}
          starterPlayerId={gameState.starterPlayerId}
          currentRound={gameState.currentRound}
          gameCompleted={gameState.gameCompleted}
        />

        {/* Primary Action Button */}
        <div className="action-footer">
          {!gameState.gameCompleted ? (
            <button
              type="button"
              className="btn-score-round-main animate-pulse-glow"
              onClick={() => setIsScoringRound(true)}
            >
              <div className="btn-score-icon-wrap">
                <Sparkles size={24} className="spin-gold" />
              </div>
              <div className="btn-score-text">
                <span className="btn-score-title">SCORE ROUND {gameState.currentRound}</span>
                <span className="btn-score-sub">
                  Snap Losing Hand • Auto-Calculate Points
                </span>
              </div>
            </button>
          ) : (
            <div className="game-completed-actions">
              <button
                type="button"
                className="btn-view-awards animate-pulse-glow"
                onClick={() => setIsEndGameOpen(true)}
              >
                <Award size={20} />
                <span>VIEW FINAL AWARDS & STATISTICS</span>
              </button>
              <button
                type="button"
                className="btn-new-game-secondary"
                onClick={() => setIsRestartOpen(true)}
              >
                <RefreshCw size={16} />
                <span>Start New Game</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Active Round Scoring Modal Flow */}
      {isScoringRound && (
        <div className="scoring-overlay-modal animate-fade-in">
          <ScoreRoundFlow
            currentRound={gameState.currentRound}
            players={gameState.players}
            starterPlayerId={gameState.starterPlayerId}
            apiKey={apiKey}
            onCompleteRound={handleCompleteRound}
            onCancel={() => setIsScoringRound(false)}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        </div>
      )}

      {/* Modals */}
      {isHistoryOpen && (
        <HistoryModal
          roundResults={gameState.roundResults}
          players={gameState.players}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
          onResetGame={handleResetGame}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isEndGameOpen && (
        <EndGameModal
          players={gameState.players}
          roundResults={gameState.roundResults}
          onStartNewGame={handleResetGame}
          onClose={() => setIsEndGameOpen(false)}
        />
      )}

      {/* Restart Game Confirmation Modal */}
      <RestartConfirmModal
        isOpen={isRestartOpen}
        onConfirm={handleResetGame}
        onClose={() => setIsRestartOpen(false)}
      />
    </div>
  );
}

export default App;
