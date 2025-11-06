import { TIMING_WINDOWS, HIT_FLASH_DURATION } from './config';
import type { ChartNote } from './songs';

export type Judgement = 'perfect' | 'good' | 'miss';

export interface RuntimeNote extends ChartNote {
  judged?: Judgement;
  hitFlash?: number;
}

export interface HitResult {
  note?: RuntimeNote;
  judgement?: Judgement;
  delta?: number;
}

/** Findet die passendste noch nicht bewertete Note in einer Lane innerhalb des LATE Fensters. */
export function findCandidate(notes: RuntimeNote[], lane: number, now: number): RuntimeNote | undefined {
  let best: { note: RuntimeNote; delta: number } | null = null;
  for (const n of notes) {
    if (n.lane !== lane || n.judged) continue;
    const delta = Math.abs(n.time - now);
    if (delta <= TIMING_WINDOWS.LATE) {
      if (!best || delta < best.delta) best = { note: n, delta };
    }
  }
  return best?.note;
}

/** Wendet Judgement auf eine Note an und liefert Score-Zuwachs sowie Text-Feedback. */
export function judgeNote(note: RuntimeNote, now: number, combo: { current: number }): { addScore: number; feedback: string } {
  const delta = Math.abs(note.time - now);
  if (delta <= TIMING_WINDOWS.PERFECT) {
    note.judged = 'perfect'; note.hitFlash = HIT_FLASH_DURATION; combo.current += 1; return { addScore: 100 + combo.current * 2, feedback: 'PERFECT' };
  }
  if (delta <= TIMING_WINDOWS.GOOD) {
    note.judged = 'good'; note.hitFlash = HIT_FLASH_DURATION; combo.current += 1; return { addScore: 70 + combo.current, feedback: 'GOOD' };
  }
  note.judged = 'miss'; combo.current = 0; return { addScore: 0, feedback: 'MISS' };
}

/** Markiert verspätete Noten als Miss. */
export function markLateMisses(notes: RuntimeNote[], now: number, combo: { current: number }, flash: (f: string) => void) {
  for (const n of notes) {
    if (!n.judged && now - n.time > TIMING_WINDOWS.LATE) { n.judged = 'miss'; combo.current = 0; flash('MISS'); }
  }
}
