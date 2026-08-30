import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface RestartConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const RestartConfirmModal: React.FC<RestartConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="modal-content restart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="restart-title-wrap">
            <RotateCcw size={20} className="ruby-text" />
            <h3 className="modal-title">Restart Game?</h3>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="restart-warning-card">
            <AlertTriangle size={24} className="ruby-text" />
            <div className="restart-warning-text">
              <strong>Are you sure you want to restart?</strong>
              <p>This will erase the current game progress, reset all round scores to 0, and return you to the player setup screen.</p>
            </div>
          </div>
        </div>

        <div className="modal-footer restart-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger-restart"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <RotateCcw size={16} />
            <span>Yes, Restart Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
