import React from 'react';
import overlayStyles from '../css/overlay.module.scss';

interface EndOverlayProps {
  visible: boolean;
  winnerName?: string;
  onRestart?: () => void;
}

/**
 * EndOverlay: Vollbild-Abschlussanzeige nach einer Session.
 * Zeigt Gewinner und bietet Neustart an.
 */
const EndOverlay: React.FC<EndOverlayProps> = ({ visible, winnerName, onRestart }) => {
  if (!visible) return null;

  const winnerLabel = winnerName ? `Gewinner: ${winnerName}` : 'Gewinner ermittelt';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Spiel beendet"
      className={overlayStyles.overlay}
    >
      <h2 className={overlayStyles.title}>Spiel beendet</h2>
      <div className={overlayStyles.winner}>{winnerLabel}</div>
      <button type="button" onClick={onRestart} className={overlayStyles.restartBtn}>Neues Spiel starten</button>
    </div>
  );
};

export default EndOverlay;
