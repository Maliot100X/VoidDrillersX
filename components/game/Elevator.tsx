"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Box, Package } from 'lucide-react';
import { ManagerSlot } from './ManagerSlot';
import { PRODUCTION_GROWTH_FACTOR } from '@/lib/constants';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';

export function Elevator() {
  const elevator = useGameStore(state => state.elevator);
  const shafts = useGameStore(state => state.shafts);
  const shaftCount = shafts.length;
  const upgradeElevator = useGameStore(state => state.upgradeElevator);
  const tlm = useGameStore(state => state.tlm);
  const managers = useGameStore(state => state.managers);
  const bottleneck = useGameStore(state => state.bottleneck);

  const canAfford = tlm >= elevator.cost;
  const manager = managers.find(m => m.id === elevator.managerId);
  const [managerActive, setManagerActive] = useState(false);
  const isBottleneck = bottleneck === 'elevator';

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (!manager) {
        setManagerActive(false);
        return;
      }

      const now = Date.now();
      const active =
        manager.type === 'Junior' ||
        now - manager.lastUsed < manager.activeDuration * 1000;
      setManagerActive(active);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [manager]);

  const carDuration = managerActive ? 3 : 5;
  const trackHeight = 260;

  const shaftStops =
    shaftCount > 0
      ? Array.from(
          { length: shaftCount },
          (_, index) => ((index + 1) / (shaftCount + 1)) * trackHeight,
        )
      : [trackHeight * 0.6];

  let targetIndex = 0;
  if (shaftCount > 0) {
    let bestScore = -1;
    shafts.forEach((shaft, index) => {
      if (!shaft.unlocked) return;
      const workers = Math.max(1, shaft.workerCount);
      const score = shaft.level * workers;
      if (score > bestScore) {
        bestScore = score;
        targetIndex = index;
      }
    });
  }

  const targetStop = shaftStops[targetIndex] ?? shaftStops[0];

  const carKeyframes = [0, targetStop, targetStop, 0];
  
  return (
    <div
      className={cn(
        'flex h-full w-24 flex-col border-r border-[#00F0FF]/20 bg-[#0B1026] relative z-10',
        managerActive && 'shadow-[0_0_18px_rgba(255,215,0,0.4)]',
        isBottleneck && 'shadow-[0_0_30px_rgba(239,68,68,0.4)] border-red-500/30'
      )}
    >
      <div className={cn(
        "flex h-16 flex-col items-center justify-center border-b border-[#00F0FF]/20 bg-[#162044] gap-1 transition-colors",
        isBottleneck && "bg-red-900/20 border-red-500/30"
      )}>
        <span className={cn("text-xs font-bold", isBottleneck ? "text-red-400" : "text-[#00F0FF]")}>
          ELEVATOR
        </span>
        <div className="flex items-center gap-1">
          <span className="font-orbitron text-sm text-white">Lvl {elevator.level}</span>
        </div>
        <ManagerSlot sectorId="elevator" currentManagerId={elevator.managerId} />
      </div>

      <div className="relative flex-1 bg-black/40 overflow-hidden">
        {/* Track */}
        <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-[#111827] border-x border-[#00F0FF]/10">
          <div className="w-full h-full bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,240,255,0.2)_50%,transparent_100%)] bg-[length:100%_20px]" />
        </div>
        
        {/* Shaft Connectors */}
        {shaftStops.map((stop, index) => (
          <div
            key={index}
            className="absolute left-1/2 h-0.5 w-8 -translate-x-1/2 bg-[#00F0FF]/20"
            style={{ top: stop + 30 }}
          />
        ))}

        {/* Elevator Car */}
        <motion.div
          animate={{ y: carKeyframes }}
          transition={{
            duration: carDuration,
            repeat: Infinity,
            ease: 'linear',
            times: [0, 0.45, 0.75, 1],
          }}
          className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center z-10"
        >
          {/* Cable */}
          <div className="absolute bottom-full left-1/2 w-0.5 h-[500px] -translate-x-1/2 bg-[#00F0FF]/40" />
          
          {/* Cage */}
          <div className={cn(
            "relative flex h-14 w-12 flex-col items-center justify-end rounded-sm border-2 bg-[#0B1026]/90 backdrop-blur-sm transition-colors",
            isBottleneck 
              ? "border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" 
              : "border-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          )}>
            {/* Loading Indicator */}
            <motion.div 
              className={cn("absolute top-1 right-1 w-1.5 bg-gray-800 rounded-full overflow-hidden h-8")}
            >
               <motion.div 
                 className={cn("w-full bg-gradient-to-t", isBottleneck ? "from-red-500 to-orange-500" : "from-[#00F0FF] to-white")}
                 animate={{ height: ["0%", "100%", "0%"] }}
                 transition={{ duration: carDuration, times: [0.45, 0.75, 1], repeat: Infinity }}
               />
            </motion.div>

            {/* Inner Content (Ore) */}
            <div className="mb-2 flex gap-0.5">
               <motion.div 
                 animate={{ opacity: [0, 1, 0], y: [5, 0, -5] }}
                 transition={{ duration: carDuration, times: [0.4, 0.5, 0.9], repeat: Infinity }}
               >
                 <Box className="h-3 w-3 text-[#F97316]" />
               </motion.div>
               <motion.div 
                 animate={{ opacity: [0, 1, 0], y: [5, 0, -5] }}
                 transition={{ duration: carDuration, times: [0.5, 0.6, 0.9], repeat: Infinity }}
               >
                 <Package className="h-3 w-3 text-[#FFD700]" />
               </motion.div>
            </div>

            {/* Door Grid */}
            <div className="absolute inset-0 flex justify-between px-1 opacity-30 pointer-events-none">
               <div className={cn("w-0.5 h-full", isBottleneck ? "bg-red-500" : "bg-[#00F0FF]")} />
               <div className={cn("w-0.5 h-full", isBottleneck ? "bg-red-500" : "bg-[#00F0FF]")} />
               <div className={cn("w-0.5 h-full", isBottleneck ? "bg-red-500" : "bg-[#00F0FF]")} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upgrade Footer */}
      <div className="border-t border-[#00F0FF]/20 p-2 bg-[#0B1026]">
        <div className="relative group">
          <button
            onClick={() => {
              upgradeElevator();
              vibrate(HAPTIC_PATTERNS.LEVEL_UP);
            }}
            disabled={!canAfford}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded border p-1 transition-all active:scale-95",
              canAfford 
                ? "border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20" 
                : "cursor-not-allowed border-gray-700 bg-gray-900 text-gray-500"
            )}
          >
            <span className="text-[10px] font-bold uppercase">Upgrade</span>
            <span className="font-orbitron text-xs">
              {elevator.cost >= 1000 ? `${(elevator.cost / 1000).toFixed(1)}k` : elevator.cost}
            </span>
          </button>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-40 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-[9px] text-gray-100 shadow-lg group-hover:block">
            <ElevatorTooltipContent />
          </div>
        </div>
        <div className="mt-1 text-center text-[9px] text-gray-400">
           Load: {elevator.loadCapacity}
        </div>
      </div>
    </div>
  );
}

function ElevatorTooltipContent() {
  const elevator = useGameStore(state => state.elevator);
  const current = elevator.level * 20 * Math.pow(PRODUCTION_GROWTH_FACTOR, elevator.level - 1);
  const nextLevel = elevator.level + 1;
  const next = nextLevel * 20 * Math.pow(PRODUCTION_GROWTH_FACTOR, nextLevel - 1);
  const delta = next - current;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-[#00F0FF]">Elevator Upgrade</span>
      <span>Throughput +{delta.toFixed(0)} TLM/s</span>
      <span>Cost {elevator.cost >= 1000 ? `${(elevator.cost / 1000).toFixed(1)}k` : elevator.cost} TLM</span>
    </div>
  );
}
