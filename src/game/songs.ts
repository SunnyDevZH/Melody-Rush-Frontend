/**
 * Song-Definitionen und Chart-Erzeugung.
 * Ausgelagert zur besseren Trennung von Rendering/Spiel-Loop und Daten.
 */
export interface SongConfig {
  /** Eindeutige ID */
  id: string;
  /** Anzeige-Titel */
  title: string;
  /** Beats per Minute */
  bpm: number;
  /** Anzahl erzeugter Noten (Pattern wird zyklisch wiederholt) */
  noteCount: number;
  /** Sekunden Vorlauf bis zur ersten Note (Lead-In) */
  leadIn: number;
  /** Muster der Lanes (0..3), wird über noteCount rotiert */
  pattern: number[];
}

/** Demo-Songs */
export const SONGS: SongConfig[] = [
  { id: 'demo-120', title: 'Demo – 120 BPM', bpm: 120, noteCount: 32, leadIn: 2, pattern: [0, 1, 2, 3, 2, 1, 0, 3] },
  { id: 'demo-140', title: 'Demo – 140 BPM', bpm: 140, noteCount: 40, leadIn: 2, pattern: [0, 2, 1, 3, 3, 1, 2, 0] },
];

export interface ChartNote {
  /** Zeitpunkt in Sekunden wann die Note die Hitline trifft */
  time: number;
  /** Lane 0..3 */
  lane: number;
}

/** Erzeugt die Chart für einen Song. */
export function buildChart(song: SongConfig): ChartNote[] {
  const notes: ChartNote[] = [];
  const beat = 60 / song.bpm;
  let t = song.leadIn;
  for (let i = 0; i < song.noteCount; i++) {
    notes.push({ time: t, lane: song.pattern[i % song.pattern.length] });
    t += beat;
  }
  return notes;
}
