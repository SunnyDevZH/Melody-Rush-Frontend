// Gemeinsame Game-Konstanten und Konfiguration
export const LANES = 4 as const;
export const LANE_KEYS = ['a', 's', 'd', 'f'] as const;
export const LANE_COLORS = ['#e74c3c', '#f39c12', '#2ecc71', '#3498db'] as const;
export const SPEED_PX_PER_SEC = 220; // bewusst verlangsamt
export const NOTE_HEIGHT = 60;
export const LANE_PADDING = 10;
export const TIMING_WINDOWS = {PERFECT: 0.07, GOOD: 0.14, LATE: 0.18,} as const;
export const HIT_FLASH_DURATION = 0.25;
export const PREPARE_DURATION = 5.0;
