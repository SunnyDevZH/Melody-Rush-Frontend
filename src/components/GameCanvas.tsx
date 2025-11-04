import React, { useRef, useEffect, useMemo, useState } from 'react';

interface GameCanvasProps {
  width?: number;
  height?: number;
}

interface ChartNote {
  time: number; // Sekunden, wann die Note die Hitline treffen soll
  lane: number; // 0..3
}

interface RuntimeNote extends ChartNote {
  judged?: 'perfect' | 'good' | 'miss';
}

// Neu: Song-Definitionen und Chart-Builder
interface SongConfig {
  id: string;
  title: string;
  bpm: number;
  noteCount: number;
  leadIn: number; // Sekunden Vorlauf
  pattern: number[]; // Lanes 0..3
}

const SONGS: SongConfig[] = [
  { id: 'demo-120', title: 'Demo – 120 BPM', bpm: 120, noteCount: 32, leadIn: 2, pattern: [0, 1, 2, 3, 2, 1, 0, 3] },
  { id: 'demo-140', title: 'Demo – 140 BPM', bpm: 140, noteCount: 40, leadIn: 2, pattern: [0, 2, 1, 3, 3, 1, 2, 0] },
];

function buildChart(song: SongConfig): ChartNote[] {
  const notes: ChartNote[] = [];
  const beat = 60 / song.bpm;
  let t = song.leadIn;
  for (let i = 0; i < song.noteCount; i++) {
    notes.push({ time: t, lane: song.pattern[i % song.pattern.length] });
    t += beat;
  }
  return notes;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null); // performance.now() Start
  const timeRef = useRef<number>(0); // aktuelle Spielzeit in Sekunden
  const pausedTimeRef = useRef<number>(0); // gemerkte Zeit beim Pausieren

  // UI/Score/State
  const [score, setScore] = useState(0);
  const comboRef = useRef<number>(0);
  const lastJudgementRef = useRef<string>('');
  const feedbackTimerRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const [songId, setSongId] = useState<string>(SONGS[0].id);

  // Konstanten
  const LANES = 4;
  const LANE_KEYS = ['1', '2', '3', '4'];
  const LANE_COLORS = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'];
  const SPEED_PX_PER_SEC = 320; // Fallgeschwindigkeit
  const NOTE_HEIGHT = 60;
  const LANE_PADDING = 10;
  const HITLINE_Y = height - 140; // Position der Ziellinie

  // Timing Windows (Sekunden)
  const PERFECT_WINDOW = 0.07;
  const GOOD_WINDOW = 0.14;
  const LATE_WINDOW = 0.18; // danach Miss

  // Erzeuge Chart abhängig vom ausgewählten Song
  const chart: ChartNote[] = useMemo(() => {
    const song = SONGS.find((s) => s.id === songId)!;
    return buildChart(song);
  }, [songId]);

  const notesRef = useRef<RuntimeNote[]>([]);
  // Initialisiere Runtime-Noten und resette Status bei Songwechsel
  useEffect(() => {
    notesRef.current = chart.map((n) => ({ ...n }));
    comboRef.current = 0;
    setScore(0);
    timeRef.current = 0;
    pausedTimeRef.current = 0;
    startTimeRef.current = null;
    setIsRunning(false);
  }, [chart]);

  // Keyboard Handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const idx = LANE_KEYS.indexOf(e.key);
      if (idx === -1) return;
      handleHit(idx);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleHit = (lane: number) => {
    if (!isRunning) return;
    const now = timeRef.current;
    // Finde die beste (zeitlich nächste) unbewertete Note in der Lane im aktiven Fenster
    let best: { note: RuntimeNote; delta: number } | null = null;
    for (const n of notesRef.current) {
      if (n.lane !== lane || n.judged) continue;
      const delta = Math.abs(n.time - now);
      if (delta <= LATE_WINDOW) {
        if (!best || delta < best.delta) best = { note: n, delta };
      }
    }

    if (!best) return; // keine Note im Fenster

    const { note, delta } = best;
    if (delta <= PERFECT_WINDOW) {
      note.judged = 'perfect';
      comboRef.current += 1;
      setScore((s) => s + 100 + comboRef.current * 2);
      flashFeedback('PERFECT');
    } else if (delta <= GOOD_WINDOW) {
      note.judged = 'good';
      comboRef.current += 1;
      setScore((s) => s + 70 + comboRef.current);
      flashFeedback('GOOD');
    } else {
      note.judged = 'miss';
      comboRef.current = 0;
      flashFeedback('MISS');
    }
  };

  const flashFeedback = (text: string) => {
    lastJudgementRef.current = text;
    feedbackTimerRef.current = 0.5; // Sekunden anzeigen
  };

  // Miss-Erkennung für Noten, die vorbei sind
  const updateMisses = (now: number) => {
    for (const n of notesRef.current) {
      if (!n.judged && now - n.time > LATE_WINDOW) {
        n.judged = 'miss';
        comboRef.current = 0;
        flashFeedback('MISS');
      }
    }
  };

  const draw = (ctx: CanvasRenderingContext2D, now: number) => {
    const laneWidth = width / LANES;
    // Hintergrund
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1f2937');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Lanes + Separatoren
    for (let i = 0; i < LANES; i++) {
      const x = i * laneWidth;
      // Lane Hintergrund
      ctx.fillStyle = LANE_COLORS[i] + '20';
      ctx.fillRect(x, 0, laneWidth, height);
      // Separator
      if (i > 0) {
        ctx.strokeStyle = '#6b7280';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
    }

    // Hitline
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 3;
    ctx.strokeRect(6, HITLINE_Y - NOTE_HEIGHT / 2, width - 12, NOTE_HEIGHT);

    // Noten zeichnen
    for (const n of notesRef.current) {
      if (n.judged === 'miss') continue; // verpasste Note ausblenden
      // Position: bei now == n.time ist die Note zentriert auf der Hitline
      const y = HITLINE_Y - (n.time - now) * SPEED_PX_PER_SEC - NOTE_HEIGHT / 2;
      const x = n.lane * laneWidth + LANE_PADDING;
      const w = laneWidth - LANE_PADDING * 2;

      if (y < -NOTE_HEIGHT || y > height + NOTE_HEIGHT) continue; // außerhalb

      // Schatten
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x + 3, y + 3, w, NOTE_HEIGHT);
      // Körper
      ctx.fillStyle = LANE_COLORS[n.lane];
      ctx.fillRect(x, y, w, NOTE_HEIGHT);
      // Glanz
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x, y, w, NOTE_HEIGHT / 3);
      // Rand
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, NOTE_HEIGHT);

      // Getroffene Noten leicht transparent
      if (n.judged === 'perfect' || n.judged === 'good') {
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.fillRect(x, y, w, NOTE_HEIGHT);
      }
    }

    // HUD
    ctx.fillStyle = '#f9fafb';
    ctx.font = 'bold 26px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Piano Hero – 4 Tasten', width / 2, 36);

    ctx.font = '18px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillText(`Score: ${score}   Combo: ${comboRef.current}`, width / 2, 64);

    // Feedback
    if (feedbackTimerRef.current > 0) {
      ctx.fillStyle = lastJudgementRef.current === 'MISS' ? '#ef4444' : '#22c55e';
      ctx.font = 'bold 28px system-ui, -apple-system, Segoe UI, Roboto, Arial';
      ctx.fillText(lastJudgementRef.current, width / 2, HITLINE_Y - 20);
    }

    // Key Labels unten
    ctx.font = 'bold 16px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.fillStyle = '#e5e7eb';
    for (let i = 0; i < LANES; i++) {
      const x = i * laneWidth + laneWidth / 2;
      ctx.fillText(LANE_KEYS[i], x, height - 12);
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Zeit aktualisieren nur wenn laufend
    if (isRunning) {
      if (startTimeRef.current === null) {
        startTimeRef.current = performance.now() - pausedTimeRef.current * 1000;
      }
      const nowSec = (performance.now() - startTimeRef.current) / 1000;
      timeRef.current = nowSec;
      updateMisses(nowSec);
    }

    // Feedback abklingen lassen (auch im Pause-Bild leicht runterzählen)
    if (feedbackTimerRef.current > 0) {
      const dt = 1 / 60; // näherungsweise
      feedbackTimerRef.current = Math.max(0, feedbackTimerRef.current - dt);
    }

    // Zeichnen mit aktueller Zeit
    draw(ctx, timeRef.current);

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial draw
    draw(ctx, 0);

    // Start loop
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, isRunning]);

  // Start/Stop und Songwechsel
  const onStart = () => {
    if (isRunning) return;
    // Beim Start die Startzeit relativ zur pausierten Zeit setzen
    startTimeRef.current = performance.now() - pausedTimeRef.current * 1000;
    setIsRunning(true);
  };
  const onStop = () => {
    if (!isRunning) return;
    // Zeit merken und stoppen
    pausedTimeRef.current = timeRef.current;
    setIsRunning(false);
  };
  const onChangeSong = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSongId(e.target.value);
  };

  return (
    <div style={{ maxWidth: width + 40, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap'
      }}>
        <label style={{ color: '#e5e7eb' }}>
          Song:
          <select value={songId} onChange={onChangeSong} style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6 }}>
            {SONGS.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </label>
        <button onClick={onStart} disabled={isRunning} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#22c55e', color: '#fff', cursor: isRunning ? 'not-allowed' : 'pointer' }}>Start</button>
        <button onClick={onStop} disabled={!isRunning} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', cursor: !isRunning ? 'not-allowed' : 'pointer' }}>Stop</button>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          margin: '0 auto',
          borderRadius: 12,
          border: '2px solid #374151',
          background: '#111827',
        }}
      />
    </div>
  );
};

export { GameCanvas };
export default GameCanvas;
