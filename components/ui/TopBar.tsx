"use client";

import { useGameStore } from '@/lib/store';
import { Globe, Trophy } from 'lucide-react';
import { PLANETS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export function TopBar() {
  const tlm = useGameStore(state => state.tlm);
  const netWorth = useGameStore(state => state.netWorth);
  const currentPlanetId = useGameStore(state => state.currentPlanet);
  const productionRate = useGameStore(state => state.productionRate);
  const hasExecutivePass = useGameStore(state => state.hasExecutivePass);
  const isVerified = useGameStore(state => state.isVerified);
  const currentPlanet = PLANETS.find(p => p.id === currentPlanetId);

  return (
    <div 
      className="absolute top-0 left-0 right-0 z-50 flex h-14 items-center justify-between bg-[#0B1026]/90 px-3 backdrop-blur-md border-b border-[#00F0FF]/20"
      style={{ backgroundImage: "url('/assets/hud-frame.svg')", backgroundSize: '100% 100%' }}
    >
      {/* Left: Planet */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1 text-[#00F0FF]">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">{currentPlanet?.name ?? currentPlanetId}</span>
        </div>
        <div className="text-[10px] text-gray-400">
           {productionRate.toFixed(1)} TLM/s
        </div>
      </div>

      {/* Center: Balance */}
      <div className="flex flex-col items-center">
        <div className="rounded-2xl border border-[#00F0FF]/40 bg-white/5/0 bg-gradient-to-br from-white/10 to-white/5 px-3 py-1 shadow-[0_0_20px_rgba(0,240,255,0.4)] backdrop-blur-xl flex items-center gap-2">
          <div className="flex flex-col leading-tight">
            <span className="font-orbitron text-xl font-bold text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              {formatNumber(tlm)}
            </span>
            <span className="text-[9px] uppercase tracking-[0.2em] text-gray-300">
              Trilium
            </span>
          </div>
          {hasExecutivePass && (
            <div className="flex items-center gap-1 rounded-full border border-[#FFD700]/60 bg-[#1F2933]/80 px-2 py-0.5 shadow-[0_0_12px_rgba(255,215,0,0.6)]">
              <span className="h-4 w-4 rounded-full bg-gradient-to-br from-[#FFE38A] to-[#F59E0B] border border-yellow-500 flex items-center justify-center text-[8px] font-bold text-black">
                VIP
              </span>
              <span className="text-[9px] font-semibold text-yellow-300 tracking-wide">
                Executive
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-1 text-orange-400">
          <Trophy className="h-4 w-4" />
          <span className="text-xs font-bold">
            {isVerified ? 'Verified Legend' : 'Guest'}
          </span>
        </div>
        <div className="text-[10px] text-gray-400">
          NW: {formatNumber(netWorth)}
        </div>
      </div>
    </div>
  );
}
