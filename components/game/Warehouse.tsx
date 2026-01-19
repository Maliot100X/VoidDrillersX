"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Container, Coins } from 'lucide-react';
import { ManagerSlot } from './ManagerSlot';
import { PRODUCTION_GROWTH_FACTOR } from '@/lib/constants';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';

export function Warehouse() {
  const warehouse = useGameStore(state => state.warehouse);
  const upgradeWarehouse = useGameStore(state => state.upgradeWarehouse);
  const tlm = useGameStore(state => state.tlm);
  const managers = useGameStore(state => state.managers);

  const canAfford = tlm >= warehouse.cost;
  const manager = managers.find(m => m.id === warehouse.managerId);
  const [managerActive, setManagerActive] = useState(false);

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

  return (
    <motion.div
      className={cn(
        'relative flex h-24 w-full items-center border-b border-[#00F0FF]/20 bg-[#0B1026] overflow-hidden',
        managerActive && 'shadow-[0_0_18px_rgba(255,215,0,0.4)]',
      )}
      animate={managerActive ? { x: [-2, 2, -2, 2, 0], y: [1, -1, 0] } : {}}
      transition={{ duration: 0.2, repeat: managerActive ? 4 : 0 }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="z-10 flex w-24 flex-col items-center justify-center border-r border-[#00F0FF]/20 bg-[#162044] h-full gap-1">
        <span className="text-xs font-bold text-[#00F0FF]">WAREHOUSE</span>
        <span className="font-orbitron text-sm text-white">Lvl {warehouse.level}</span>
        <div className="flex items-center gap-1">
          <Container className="h-3 w-3 text-gray-400" />
          <span className="text-[10px] text-gray-300">{warehouse.transporterCount} Units</span>
        </div>
        <ManagerSlot sectorId="warehouse" currentManagerId={warehouse.managerId} />
      </div>

      <div className="relative flex flex-1 items-center justify-center px-4">
        <div className="flex gap-4">
          {[...Array(Math.min(3, warehouse.transporterCount))].map((_, i) => (
            <motion.div
              key={i}
              animate={{ x: [0, 20, 0], rotate: [-4, 4, -4] }}
              transition={{
                duration: managerActive ? 1.8 : 3,
                repeat: Infinity,
                delay: i * 0.4,
              }}
            >
              <Coins className="h-6 w-6 text-[#00F0FF]" />
            </motion.div>
          ))}
        </div>
        <motion.div
          animate={{ x: [-40, 40, -40], rotate: [-2, 2, -2] }}
          transition={{ duration: managerActive ? 3 : 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-3 left-4 right-20 mx-auto flex max-w-[120px] items-center gap-2 rounded-lg border border-[#00F0FF]/40 bg-black/60 px-3 py-1"
        >
          <div className="h-4 w-6 rounded bg-[#1D2A4A] border border-[#00F0FF]/60" />
          <div className="flex gap-0.5">
            {Array.from({
              length: Math.min(5, Math.max(1, warehouse.transporterCount)),
            }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-2 w-2 rounded-sm',
                  i < warehouse.transporterCount ? 'bg-[#22C55E]' : 'bg-gray-600',
                )}
              />
            ))}
          </div>
        </motion.div>
        <div className="absolute bottom-2 right-6 flex flex-col items-center z-20">
        </div>
      </div>

      <div className="z-10 flex w-24 flex-col items-center justify-center border-l border-[#00F0FF]/20 p-2 h-full bg-[#0B1026]">
        <div className="relative group w-full">
          <button
            onClick={() => {
              upgradeWarehouse();
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
              {warehouse.cost >= 1000 ? `${(warehouse.cost / 1000).toFixed(1)}k` : warehouse.cost}
            </span>
          </button>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-40 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-[9px] text-gray-100 shadow-lg group-hover:block">
            <WarehouseTooltipContent />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function WarehouseTooltipContent() {
  const warehouse = useGameStore(state => state.warehouse);
  const current = warehouse.level * 30 * Math.pow(PRODUCTION_GROWTH_FACTOR, warehouse.level - 1);
  const nextLevel = warehouse.level + 1;
  const next = nextLevel * 30 * Math.pow(PRODUCTION_GROWTH_FACTOR, nextLevel - 1);
  const delta = next - current;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-[#00F0FF]">Warehouse Upgrade</span>
      <span>Capacity +{delta.toFixed(0)} TLM/s</span>
      <span>Cost {warehouse.cost >= 1000 ? `${(warehouse.cost / 1000).toFixed(1)}k` : warehouse.cost} TLM</span>
    </div>
  );
}
