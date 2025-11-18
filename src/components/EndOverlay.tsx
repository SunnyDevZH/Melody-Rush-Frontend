import React from 'react';
import overlayStyles from '../css/overlay.module.scss';

interface EndOverlayProps {
  visible: boolean;
  winnerName?: string;
  winnerScore?: number;
  playerCount?: number;
  onRestart?: () => void;
}

/**
 * EndOverlay: Vollbild-Abschlussanzeige nach einer Session.
 * Zeigt Gewinner (bei 2+ Teams) oder Score (bei 1 Team) und bietet Neustart an.
 */
const EndOverlay: React.FC<EndOverlayProps> = ({ visible, winnerName, winnerScore, playerCount = 0, onRestart }) => {
  if (!visible) return null;

  const showWinner = playerCount >= 2;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Spiel beendet"
      className={overlayStyles.overlay}
    >
      <h2 className={overlayStyles.title}>Spiel beendet</h2>
      
      {showWinner ? (
        <div className={overlayStyles.result}>
          <div className={overlayStyles.trophy}>🏆</div>
          <div className={overlayStyles.winnerText}>Gewinner: {winnerName}</div>
          <div className={overlayStyles.scoreText}>Score: {winnerScore}</div>
        </div>
      ) : (
        <div className={overlayStyles.result}>
          <div className={overlayStyles.scoreText}>Score: {winnerScore}</div>
        </div>
      )}

      <button type="button" onClick={onRestart} className={overlayStyles.restartBtn}>Neues Spiel starten</button>
    </div>
  );
};

export default EndOverlay;
