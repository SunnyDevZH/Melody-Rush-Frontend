import { useEffect, useRef, useState, useCallback } from 'react';
import { PREPARE_DURATION } from './config';

/** Countdown & Vorbereitung Ablauf steuern. */
export function usePreparationAndCountdown(sessionFinished: boolean) {
  const [isRunning, setIsRunning] = useState(false);
  const prepareRef = useRef<number>(0);
  const countdownRef = useRef<number>(0);

  const startPreparation = useCallback(() => {
    prepareRef.current = PREPARE_DURATION;
    countdownRef.current = 0;
    setIsRunning(false);
  }, []);

  // Exponierte Refs (nur lesen außen):
  const getPrepare = () => prepareRef.current;
  const getCountdown = () => countdownRef.current;

  /** Loop-Update für Zeiten, gibt true zurück sobald Spiel gestartet wird. */
  const tick = (dt: number): boolean => {
    let started = false;
    if (prepareRef.current > 0 && dt > 0) {
      prepareRef.current = Math.max(0, prepareRef.current - dt);
      if (prepareRef.current <= 0 && countdownRef.current === 0 && !sessionFinished) {
        countdownRef.current = 3; // Countdown beginnt
      }
    }
    if (countdownRef.current > 0 && dt > 0) {
      countdownRef.current = Math.max(0, countdownRef.current - dt);
      if (countdownRef.current <= 0 && !isRunning) {
        setIsRunning(true);
        started = true;
      }
    }
    return started;
  };

  return { isRunning, setIsRunning, startPreparation, getPrepare, getCountdown, tick };
}

/** Simpler GameLoop Hook mit requestAnimationFrame. */
export function useGameLoop(callback: (dt: number, nowMs: number) => void, deps: unknown[] = []) {
  const rafRef = useRef<number | null>(null);
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    const loop = (t: number) => {
      let dt = 0;
      if (prevRef.current == null) prevRef.current = t; else { dt = (t - prevRef.current) / 1000; prevRef.current = t; }
      callback(dt, t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Keyboard-Lane Eingabe Hook: verwaltet gedrückte Lanes und triggert Hit-Callback. */
export function useLaneInput(isRunning: boolean, laneKeys: readonly string[], onHit: (lane: number) => void) {
  const laneActiveRef = useRef<boolean[]>(Array.from({ length: laneKeys.length }, () => false));

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const idx = laneKeys.indexOf(key);
      if (idx === -1) return;
      laneActiveRef.current[idx] = true;
      if (isRunning) onHit(idx);
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const idx = laneKeys.indexOf(key);
      if (idx === -1) return;
      laneActiveRef.current[idx] = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [isRunning, laneKeys, onHit]);

  return laneActiveRef;
}
