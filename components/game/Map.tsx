"use client";

import { useGameStore } from '@/lib/store';
import { PLANETS } from '@/lib/constants';
import { Lock, Globe, Rocket } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';

export function Map() {
  const netWorth = useGameStore(state => state.netWorth);
  const unlockedPlanets = useGameStore(state => state.unlockedPlanets);
  const currentPlanet = useGameStore(state => state.currentPlanet);
  const unlockPlanet = useGameStore(state => state.unlockPlanet);
  const travelToPlanet = useGameStore(state => state.travelToPlanet);

  return (
    <div 
      className="flex flex-col space-y-4 p-4 pb-24 min-h-full bg-cover bg-center bg-fixed rounded-xl"
      style={{
        backgroundImage: "url('/assets/map-bg.svg')",
      }}
    >
      <div className="flex items-center gap-2 mb-4 bg-black/40 p-2 rounded-lg backdrop-blur-sm">
        <Globe className="h-6 w-6 text-[#00F0FF]" />
        <h2 className="font-orbitron text-xl font-bold text-white">Star Map</h2>
      </div>

      <div className="grid gap-4">
        {PLANETS.map((planet) => {
          const isUnlocked = unlockedPlanets.includes(planet.id);
          const isCurrent = currentPlanet === planet.id;
          const canUnlock = netWorth >= planet.unlockCost;
          const isVoidDrillers = planet.id === 'voiddrillers_world';

          return (
            <div 
                key={planet.id} 
                className={cn(
                    "relative flex flex-col rounded-xl border p-4 transition-all overflow-hidden",
                    isCurrent ? "border-[#00F0FF] bg-[#00F0FF]/10" : "border-[#00F0FF]/20 bg-[#162044]",
                    !isUnlocked && !canUnlock && "opacity-50 grayscale"
                )}
            >
              {/* Background Glow */}
              <div 
                className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: planet.color }} 
              />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div 
                      className="h-16 w-16 rounded-full border-2 shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center"
                      style={{ 
                          borderColor: planet.color,
                          backgroundColor: planet.color + '20' // 20% opacity
                      }}
                   >
                       {isVoidDrillers ? (
                         <Rocket className="h-8 w-8" style={{ color: planet.color }} />
                       ) : (
                         <Globe className="h-8 w-8" style={{ color: planet.color }} />
                       )}
                   </div>
                   
                   <div>
                       <h3 className="font-orbitron text-lg font-bold text-white">{planet.name}</h3>
                       <p className="text-[10px] text-gray-400 max-w-[150px]">{planet.description}</p>
                       <div className="mt-1 inline-flex items-center rounded bg-black/50 px-2 py-0.5 text-[10px] font-bold" style={{ color: planet.color }}>
                          x{planet.multiplier} Production
                       </div>
                       {isVoidDrillers && (
                         <div className="mt-1 inline-flex items-center rounded bg-[#020617]/80 px-2 py-0.5 text-[10px] font-semibold text-sky-300">
                           Coming Soon · Mainnet
                         </div>
                       )}
                   </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col items-end gap-2">
                   {isCurrent ? (
                       <span className="flex items-center gap-1 text-xs font-bold text-[#00F0FF]">
                           <Rocket className="h-3 w-3" /> Mining Here
                       </span>
                   ) : isUnlocked ? (
                       <button 
                         onClick={() => travelToPlanet(planet.id)}
                         className="rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-gray-200"
                       >
                           Travel
                       </button>
                   ) : canUnlock ? (
                        <button 
                            onClick={() => unlockPlanet(planet.id)}
                            className="rounded bg-[#00F0FF] px-3 py-1 text-xs font-bold text-black hover:bg-[#00C0CC]"
                        >
                            Unlock
                        </button>
                   ) : (
                       <div className="flex items-center gap-1 text-gray-500">
                           <Lock className="h-3 w-3" />
                           <span className="font-orbitron text-xs">
                               {formatNumber(planet.unlockCost)} NW
                           </span>
                       </div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
