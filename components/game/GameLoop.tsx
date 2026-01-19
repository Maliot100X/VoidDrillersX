"use client";

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store';

export function GameLoop() {
  const tick = useGameStore(state => state.tick);
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const loop = (time: number) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
      }

      const dt = (time - lastTimeRef.current) / 1000;

      if (dt >= 0.1) {
        tick(dt);
        lastTimeRef.current = time;
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [tick]);

  return null;
}
