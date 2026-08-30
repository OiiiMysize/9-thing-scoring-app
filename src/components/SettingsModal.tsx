import React, { useState } from 'react';
import { saveGeminiApiKey } from '../utils/storage';
import { KeyRound, Eye, EyeOff, Save, Check, RotateCcw, HelpCircle, X, ExternalLink, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  onResetGame: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  apiKey,
  onSaveApiKey,
  onResetGame,
  onClose,
}) => {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    saveGeminiApiKey(inputKey);
    onSaveApiKey(inputKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleConfirmReset = () => {
    onResetGame();
    setConfirmReset(false);
    onClose();
  };

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="settings-title-wrap">
            <KeyRound size={20} className="gold-text" />
            <h3 className="modal-title">Settings & AI Vision Key</h3>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body settings-body">
          {/* API Key Form */}
          <div className="settings-section">
            <div className="section-header-row">
              <label className="section-label">
                <ShieldCheck size={16} className="emerald-text" />
                <span>Gemini API Key (For Camera Hand Scanning)</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="get-key-link"
              >
                <span>Get Free Key</span>
                <ExternalLink size={12} />
              </a>
            </div>

            <form onSubmit={handleSaveKey} className="api-key-form">
              <div className="input-with-button">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste AI Studio API Key (AIzaSy...)"
                  className="key-input"
                />
                <button
                  type="button"
                  className="toggle-vis-btn"
                  onClick={() => setShowKey(!showKey)}
                  title={showKey ? 'Hide key' : 'Show key'}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="key-actions-row">
                <button type="submit" className="btn-save-key">
                  {saveSuccess ? <Check size={16} className="emerald-text" /> : <Save size={16} />}
                  <span>{saveSuccess ? 'Saved to Device!' : 'Save Key'}</span>
                </button>
              </div>
            </form>
            <p className="settings-hint">
              🔒 Key is saved locally in your phone's browser storage. It is never transmitted anywhere except directly to Google's official Gemini API for card recognition.
            </p>
          </div>

          {/* Game Rules Quick Reference */}
          <div className="settings-section">
            <label className="section-label">
              <HelpCircle size={16} className="gold-text" />
              <span>Quick Rules Cheat-Sheet</span>
            </label>
            <div className="rules-cheatsheet">
              <div className="rule-item">
                <strong>13 Rounds:</strong> Round 1 = Aces wild ... Round 13 = Kings wild.
              </div>
              <div className="rule-item">
                <strong>Card Values:</strong> Ace = 1, 2-10 = Face value, J/Q/K = 10 pts.
              </div>
              <div className="rule-item">
                <strong>Wild Penalty:</strong> Wild cards held in losing hands = Face value + <strong>10 penalty pts</strong>!
              </div>
              <div className="rule-item">
                <strong>Discard Pile Win:</strong> Scores only the player who discarded the winning card.
              </div>
              <div className="rule-item">
                <strong>Draw Pile Win:</strong> Scores all other players' hands (Doubled 2x in 2-player games).
              </div>
            </div>
          </div>

          {/* Reset Game Section */}
          <div className="settings-section danger-section">
            <label className="section-label ruby-text">
              <RotateCcw size={16} />
              <span>Reset Game</span>
            </label>
            {!confirmReset ? (
              <button
                type="button"
                className="btn-danger-outline"
                onClick={() => setConfirmReset(true)}
              >
                Reset Current Game & Start Over
              </button>
            ) : (
              <div className="confirm-reset-box animate-fade-in">
                <p className="warning-text">Are you sure? This will erase current round progress!</p>
                <div className="confirm-buttons">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setConfirmReset(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleConfirmReset}
                  >
                    Yes, Reset Game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-primary full-width" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
