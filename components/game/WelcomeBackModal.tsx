"use client";

import { useGameStore } from '@/lib/store';
import { useState } from 'react';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function WelcomeBackModal() {
  const resume = useGameStore(state => state.resume);
  const [earnings, setEarnings] = useState<number>(() => {
    const earned = resume();
    return earned > 0 ? earned : 0;
  });

  if (earnings <= 0) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-xs overflow-hidden rounded-2xl border-2 border-[#00F0FF] bg-[#0B1026] text-center shadow-[0_0_50px_rgba(0,240,255,0.3)]"
        >
          <div className="bg-[#00F0FF]/20 p-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00F0FF]/20 border border-[#00F0FF]">
              <Clock className="h-8 w-8 text-[#00F0FF]" />
            </div>
            <h2 className="font-orbitron text-2xl font-bold text-white">WELCOME BACK</h2>
            <p className="text-xs text-[#00F0FF]">Your miners worked while you were away!</p>
          </div>

          <div className="p-6">
             <div className="mb-6 flex flex-col items-center gap-1">
                 <span className="text-sm text-gray-400">Offline Earnings</span>
                 <span className="font-orbitron text-3xl font-bold text-[#FFD700]">
                     +{earnings >= 1000 ? (earnings/1000).toFixed(1) + 'k' : Math.floor(earnings)}
                 </span>
                 <span className="text-xs font-bold text-[#FFD700]">TLM</span>
             </div>

             <button 
                onClick={() => setEarnings(0)}
                className="w-full rounded-xl bg-[#00F0FF] py-3 font-bold text-black shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:bg-[#00C0CC]"
             >
                 COLLECT
             </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
