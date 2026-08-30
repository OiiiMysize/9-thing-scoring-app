import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Scan, AlertCircle, Sparkles, KeyRound, RefreshCw, PenTool } from 'lucide-react';
import { detectCardsWithGemini } from '../utils/gemini';
import type { CardDetectionResult } from '../utils/gemini';
import type { PlayingCard } from '../types/game';

interface HandScannerProps {
  apiKey: string;
  roundNumber: number;
  playerName: string;
  onCardsDetected: (cards: PlayingCard[]) => void;
  onOpenManualEntry: () => void;
  onOpenSettings: () => void;
}

export const HandScanner: React.FC<HandScannerProps> = ({
  apiKey,
  playerName,
  onCardsDetected,
  onOpenManualEntry,
  onOpenSettings,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      // Automatically trigger scan once image is loaded if API key is present
      if (apiKey && apiKey.trim()) {
        triggerGeminiScan(base64, file.type || 'image/jpeg');
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerGeminiScan = async (base64Img: string, mimeType: string = 'image/jpeg') => {
    if (!apiKey || !apiKey.trim()) {
      setErrorMessage('Please add your Gemini API Key in Settings first, or use Manual Entry.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const result: CardDetectionResult = await detectCardsWithGemini(base64Img, apiKey, mimeType);
      if (!result.cards || result.cards.length === 0) {
        throw new Error('No playing cards detected in the photo. Please make sure the cards are visible and spread out.');
      }
      onCardsDetected(result.cards);
    } catch (err: any) {
      console.error('Hand scan error:', err);
      setErrorMessage(err.message || 'Failed to scan hand with Gemini Vision.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="scanner-container">
      {/* Hidden File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden-file-input"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden-file-input"
        onChange={handleFileChange}
      />

      <div className="scanner-target-banner">
        <span>Photographing hand of:</span>
        <strong className="gold-text">{playerName} (9 Cards)</strong>
      </div>

      {/* Image Preview & Scanning Overlay */}
      {selectedImage ? (
        <div className="preview-container">
          <img src={selectedImage} alt="Losing Hand" className="captured-preview-img" />
          {isScanning && (
            <div className="scanning-overlay">
              <div className="scan-laser-line" />
              <div className="scanning-indicator">
                <Sparkles size={24} className="spin-gold" />
                <span>Gemini Vision Scanning Cards...</span>
              </div>
            </div>
          )}

          {!isScanning && (
            <div className="preview-actions">
              <button
                type="button"
                className="btn-rescan"
                onClick={() => fileInputRef.current?.click()}
              >
                <RefreshCw size={16} />
                <span>Retake Photo</span>
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => triggerGeminiScan(selectedImage)}
              >
                <Scan size={18} />
                <span>Rescan with AI</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="scanner-action-panel">
          <div className="scanner-buttons-grid">
            <button
              type="button"
              className="action-card-btn camera-btn animate-pulse-glow"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="action-btn-icon-wrap">
                <Camera size={32} />
              </div>
              <div className="action-btn-text">
                <strong className="action-btn-title">Take Photo with Camera</strong>
                <span className="action-btn-sub">Spread cards flat on table</span>
              </div>
            </button>

            <button
              type="button"
              className="action-card-btn gallery-btn"
              onClick={() => galleryInputRef.current?.click()}
            >
              <div className="action-btn-icon-wrap">
                <ImageIcon size={26} />
              </div>
              <div className="action-btn-text">
                <strong className="action-btn-title">Upload Photo</strong>
                <span className="action-btn-sub">From photo gallery</span>
              </div>
            </button>
          </div>

          <div className="scanner-or-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="manual-entry-trigger-btn"
            onClick={onOpenManualEntry}
          >
            <PenTool size={18} />
            <span>Select Cards Manually (Quick Offline Mode)</span>
          </button>
        </div>
      )}

      {/* Error / API Key Missing Notification */}
      {errorMessage && (
        <div className="scanner-error-card animate-fade-in">
          <AlertCircle size={20} className="ruby-text error-icon" />
          <div className="error-content">
            <p className="error-msg">{errorMessage}</p>
            {!apiKey && (
              <button
                type="button"
                className="btn-link-gold"
                onClick={onOpenSettings}
              >
                <KeyRound size={14} /> Open Settings to enter Gemini Key
              </button>
            )}
          </div>
        </div>
      )}

      <div className="scan-tips-card">
        <span className="tips-title">💡 Pro-Tip for Best AI Accuracy:</span>
        <p className="tips-text">
          Spread the 9 cards out on the table so the corner numbers and suits are clearly visible!
        </p>
      </div>
    </div>
  );
};
