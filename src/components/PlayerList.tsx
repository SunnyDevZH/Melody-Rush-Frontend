import React from 'react';
import type { Player } from '../types';
import playersStyles from '../css/players.module.scss';

interface PlayerListProps {
  players: Player[];
  activePlayerId: number | null;
  onSelect: (id: number) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, activePlayerId, onSelect }) => {
  if (!players.length) {
    return (
      <ul className={playersStyles.playersList}>
        <li className={playersStyles.muted}>Noch keine Spieler</li>
      </ul>
    );
  }
  return (
    <ul className={playersStyles.playersList}>
      {players.map(p => (
        <li
          key={p.id}
          className={`${playersStyles.playerItem} ${p.id === activePlayerId ? playersStyles.playerItemActive : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <span className={playersStyles.name}>{p.name}</span>
          <span className={playersStyles.score}>{p.score}</span>
        </li>
      ))}
    </ul>
  );
};

export default PlayerList;
