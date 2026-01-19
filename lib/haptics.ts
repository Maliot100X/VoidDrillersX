export const vibrate = (pattern: number | number[]) => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

export const HAPTIC_PATTERNS = {
  DRILL_HIT: 10, // Very short tick
  SOFT_IMPACT: 20,
  LEVEL_UP: [40, 50, 40], // Double bump
  SUCCESS: [40, 50, 40, 50, 100],
  ERROR: [50, 100, 50]
};
