import type { GameState, Player } from '../types/game';

const GAME_STATE_KEY = 'ITS_A_9_THING_GAME_STATE_V1';
const API_KEY_KEY = 'ITS_A_9_THING_GEMINI_API_KEY';

export const DEFAULT_AVATARS = ['👑', '🦁', '🦊', '🐼', '🐯', '🦄', '🦅', '🐉', '⚡', '🍀', '🎯', '🔥'];

export function createInitialGameState(playerConfigs: { name: string; avatar: string }[]): GameState {
  const players: Player[] = playerConfigs.map((cfg, index) => ({
    id: `player-${index + 1}`,
    name: cfg.name.trim() || `Player ${index + 1}`,
    avatar: cfg.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
    totalScore: 0,
  }));

  // Random starter for round 1
  const randomStarterIndex = Math.floor(Math.random() * players.length);
  const starterPlayerId = players[randomStarterIndex]?.id || players[0].id;

  return {
    gameStarted: true,
    gameCompleted: false,
    currentRound: 1,
    players,
    roundResults: [],
    starterPlayerId,
  };
}

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save game state to localStorage:', err);
  }
}

export function loadGameState(): GameState | null {
  try {
    const data = localStorage.getItem(GAME_STATE_KEY);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  } catch (err) {
    console.error('Failed to load game state from localStorage:', err);
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(GAME_STATE_KEY);
  } catch (err) {
    console.error('Failed to clear game state from localStorage:', err);
  }
}

export function saveGeminiApiKey(apiKey: string): void {
  try {
    localStorage.setItem(API_KEY_KEY, apiKey.trim());
  } catch (err) {
    console.error('Failed to save API key:', err);
  }
}

export function loadGeminiApiKey(): string {
  try {
    const saved = localStorage.getItem(API_KEY_KEY);
    if (saved) return saved.trim();
  } catch (err) {
    console.error('Failed to load API key:', err);
  }
  // Fallback to Vite env if provided at build time
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}
