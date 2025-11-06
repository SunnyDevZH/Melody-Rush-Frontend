import React from 'react';
import PlayerList from './PlayerList';
import type { Player } from '../types';
import { SONGS } from '../game/songs';
import sidebarStyles from '../css/sidebar.module.scss';
import playersStyles from '../css/players.module.scss';

interface SidebarProps {
  players: Player[];
  activePlayerId: number | null;
  onSelectPlayer: (id: number) => void;
  newPlayerName: string;
  setNewPlayerName: (v: string) => void;
  addPlayer: () => void;
  songId: string;
  setSongId: (id: string) => void;
  activePlayerName?: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ players, activePlayerId, onSelectPlayer, newPlayerName, setNewPlayerName, addPlayer, songId, setSongId, activePlayerName }) => {
  return (
    <aside className={`${sidebarStyles.sidebar} right`}>
      <h3>Spieler</h3>
      <div className={playersStyles.addPlayer}>
        <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="Name hinzufügen" />
        <button onClick={addPlayer}>+</button>
      </div>
      <PlayerList players={players} activePlayerId={activePlayerId} onSelect={onSelectPlayer} />
      {activePlayerName && <div className={sidebarStyles.activeHint}>Aktiv: {activePlayerName}</div>}
      <div>
        <h3>Songs</h3>
        <select className={sidebarStyles.songSelect} value={songId} onChange={e => setSongId(e.target.value)}>
          {SONGS.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        <p className={sidebarStyles.hint}>Wähle einen Song und starte im Spiel.</p>
      </div>
    </aside>
  );
};

export default Sidebar;
