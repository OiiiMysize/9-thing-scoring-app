import React, { useState } from 'react';
import { DEFAULT_AVATARS } from '../utils/storage';
import { Users, Play } from 'lucide-react';

interface GameSetupProps {
  onStartGame: (players: { name: string; avatar: string }[]) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [playerList, setPlayerList] = useState<Array<{ name: string; avatar: string }>>([
    { name: 'Player 1', avatar: '👑' },
    { name: 'Player 2', avatar: '🦁' },
    { name: 'Player 3', avatar: '🦊' },
  ]);

  const [avatarPickerIdx, setAvatarPickerIdx] = useState<number | null>(null);

  const handlePlayerCountChange = (count: number) => {
    if (count < 2 || count > 4) return;
    if (count > playerList.length) {
      const newPlayers = [...playerList];
      for (let i = playerList.length; i < count; i++) {
        newPlayers.push({
          name: `Player ${i + 1}`,
          avatar: DEFAULT_AVATARS[i % DEFAULT_AVATARS.length],
        });
      }
      setPlayerList(newPlayers);
    } else {
      setPlayerList(playerList.slice(0, count));
    }
  };

  const handleNameChange = (index: number, name: string) => {
    const updated = [...playerList];
    updated[index].name = name;
    setPlayerList(updated);
  };

  const handleAvatarSelect = (index: number, avatar: string) => {
    const updated = [...playerList];
    updated[index].avatar = avatar;
    setPlayerList(updated);
    setAvatarPickerIdx(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartGame(playerList);
  };

  return (
    <div className="setup-container animate-fade-in">
      <div className="setup-hero">
        <div className="hero-emblem animate-float">🃏</div>
        <h1 className="setup-title">IT'S A 9 THING!</h1>
        <p className="setup-tagline">13 Rounds • Wild Cards • Smart Camera Scorer</p>
      </div>

      <form onSubmit={handleSubmit} className="setup-card">
        <div className="setup-section">
          <label className="section-label">
            <Users size={18} className="gold-text" />
            <span>Select Number of Players</span>
          </label>
          <div className="player-count-buttons">
            {[2, 3, 4].map((count) => (
              <button
                key={count}
                type="button"
                className={`count-btn ${playerList.length === count ? 'active' : ''}`}
                onClick={() => handlePlayerCountChange(count)}
              >
                {count} Players
              </button>
            ))}
          </div>
          {playerList.length === 2 && (
            <p className="rule-note">
              ✨ <strong>2-Player Rule:</strong> Draw pile wins award <strong>2x Double Points</strong>!
            </p>
          )}
        </div>

        <div className="setup-section">
          <label className="section-label">
            <span>Player Names & Avatars</span>
          </label>
          <div className="player-inputs">
            {playerList.map((player, index) => (
              <div key={index} className="player-input-row">
                <button
                  type="button"
                  className="avatar-select-btn"
                  onClick={() => setAvatarPickerIdx(avatarPickerIdx === index ? null : index)}
                  title="Click to choose avatar"
                >
                  <span className="avatar-icon">{player.avatar}</span>
                  <span className="avatar-edit-tag">edit</span>
                </button>

                <input
                  type="text"
                  value={player.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder={`Player ${index + 1}`}
                  className="name-input"
                  maxLength={18}
                  required
                />
              </div>
            ))}
          </div>
        </div>

        {/* Avatar Picker Modal Overlay */}
        {avatarPickerIdx !== null && (
          <div className="avatar-picker-panel animate-fade-in">
            <span className="picker-title">Choose Avatar for {playerList[avatarPickerIdx].name}</span>
            <div className="avatar-grid">
              {DEFAULT_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="avatar-choice-btn"
                  onClick={() => handleAvatarSelect(avatarPickerIdx, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="picker-close-btn"
              onClick={() => setAvatarPickerIdx(null)}
            >
              Done
            </button>
          </div>
        )}

        <button type="submit" className="start-game-btn animate-pulse-glow">
          <Play size={20} fill="currentColor" />
          <span>START 13-ROUND GAME</span>
        </button>
      </form>
    </div>
  );
};
