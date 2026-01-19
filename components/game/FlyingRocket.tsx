"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function FlyingRocket() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Initial delay or check?
    // User wants "every 2 min".
    const interval = setInterval(() => {
      setIsVisible(true);
      // Hide after animation completes (e.g., 5 seconds)
      setTimeout(() => setIsVisible(false), 5000);
    }, 120000); // 2 minutes

    // Trigger once shortly after mount for demonstration/verification? 
    // The user said "show in game every 2 min". 
    // Maybe I should trigger it once after a few seconds so the user sees it immediately?
    // Let's stick to the interval, but maybe start one immediately if desired.
    // I'll set a timeout for the first appearance to be 2 minutes from now.
    // Or maybe I should make it appear soon for testing.
    // I'll add a short delay for the first one so I can verify it.
    const initialTimeout = setTimeout(() => {
       setIsVisible(true);
       setTimeout(() => setIsVisible(false), 5000);
    }, 5000); // 5 seconds after mount

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -100, y: 0, opacity: 0 }}
          animate={{ 
            x: '120vw', 
            y: [0, -20, 10, -10, 0], // Slight wave motion
            opacity: 1 
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 4, 
            ease: "easeInOut",
            y: { repeat: Infinity, duration: 2 } 
          }}
          className="fixed left-0 top-1/2 z-50 flex items-center gap-2 pointer-events-none"
          style={{ top: '40%' }} // Adjust vertical position to fly "through the miner" area roughly
        >
          {/* Rocket SVG */}
          <div className="relative">
             <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F7931A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_15px_rgba(247,147,26,0.8)] rotate-45"
            >
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
              <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
            </svg>
            {/* Engine Flame */}
            <motion.div 
                className="absolute -left-2 top-4 w-4 h-4 bg-orange-500 rounded-full blur-sm"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 0.2, repeat: Infinity }}
            />
          </div>

          {/* Text Bubble */}
          <div className="flex flex-col">
            <div className="rounded-lg border border-[#F7931A]/50 bg-black/80 px-3 py-1 backdrop-blur-sm">
                <span className="font-orbitron text-sm font-bold text-[#F7931A] whitespace-nowrap">
                Satoshi BTC
                </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
