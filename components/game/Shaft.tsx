"use client";

import { useEffect, useState } from 'react';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { ManagerSlot } from './ManagerSlot';
import { PRODUCTION_GROWTH_FACTOR } from '@/lib/constants';
import { Miner } from './Miner';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';

interface ShaftProps {
  id: number;
}

export function Shaft({ id }: ShaftProps) {
  const shaft = useGameStore(state => state.shafts.find(s => s.id === id));
  const upgradeShaft = useGameStore(state => state.upgradeShaft);
  const tlm = useGameStore(state => state.tlm);
  const managers = useGameStore(state => state.managers);
  const currentPlanetId = useGameStore(state => state.currentPlanet);
  const bottleneck = useGameStore(state => state.bottleneck);
  const minerSkins = useGameStore(state => state.minerSkins);
  const equippedSkinId = useGameStore(state => state.equippedSkinId);
  const manager = managers.find(m => m.id === shaft?.managerId);
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

  if (!shaft) {
    return null;
  }

  const canAfford = tlm >= shaft.cost;
  const baseDuration = 2 / Math.log(shaft.level + 2);
  const rotationDuration = managerActive ? baseDuration / 1.5 : baseDuration;
  const workerCount = Math.max(1, Math.min(4, shaft.workerCount));
  const elevatorClogged = bottleneck === 'elevator';

  const equippedSkin = minerSkins.find(s => s.id === equippedSkinId);

  const getMinerColor = () => {
    switch (currentPlanetId) {
      case 'base_world': return '#00F0FF';
      case 'farcaster_world': return '#A855F7';
      case 'x_miners_world': return '#9CA3AF';
      case 'satoshi_world': return '#F59E0B';
      case 'voiddrillers_world': return '#38BDF8';
      default: return '#00F0FF';
    }
  };
  const baseColor = getMinerColor();
  const minerColor = baseColor;

  const getMinerVariant = (): 'base' | 'farcaster' | 'xminer' | 'satoshi' | 'neon' | 'cyber' | 'quantum' | 'mech' | 'astro' | 'dark_matter' | 'cyberpunk' | 'plasma' | 'satoshi_comet' | 'satoshi_rocket' => {
    switch (currentPlanetId) {
      case 'base_world': return 'base';
      case 'farcaster_world': return 'farcaster';
      case 'x_miners_world': return 'xminer';
      case 'satoshi_world': return 'satoshi';
      default: return 'base';
    }
  };
  const minerVariant = getMinerVariant();

  const renderWorldBadge = () => {
    switch (currentPlanetId) {
      case 'voiddrillers_world':
        return (
          <motion.div
            className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -3, 0], scale: [1, 1.03, 1] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <svg width="46" height="46" viewBox="0 0 32 32">
              <defs>
                <radialGradient id="vdrGlow" cx="50%" cy="35%" r="65%">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
                  <stop offset="50%" stopColor="#4C1D95" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="15" fill="url(#vdrGlow)" />
              <path
                d="M16 6L20 14L16 22L12 14L16 6Z"
                fill="#E5E7EB"
                stroke="#38BDF8"
                strokeWidth="1.4"
              />
              <path
                d="M13 22L16 27L19 22"
                fill="#38BDF8"
                stroke="#0EA5E9"
                strokeWidth="1.2"
              />
            </svg>
          </motion.div>
        );
      case 'satoshi_world':
        return (
          <motion.div
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <svg width="44" height="44" viewBox="0 0 32 32">
              <defs>
                <radialGradient id="btcGlow" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#FACC15" stopOpacity="1" />
                  <stop offset="100%" stopColor="#92400E" stopOpacity="0.7" />
                </radialGradient>
              </defs>
              <circle cx="16" cy="16" r="14" fill="url(#btcGlow)" />
              <text
                x="16"
                y="19"
                textAnchor="middle"
                fontSize="12"
                fontWeight="bold"
                fill="#111827"
              >
                ₿
              </text>
            </svg>
          </motion.div>
        );
      case 'farcaster_world':
        return (
          <motion.div
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -2, 0], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="14" fill="#4C1D95" />
              <circle cx="16" cy="16" r="10" fill="#A855F7" />
              <text
                x="16"
                y="19"
                textAnchor="middle"
                fontSize="10"
                fontWeight="bold"
                fill="#F9FAFB"
              >
                F
              </text>
            </svg>
          </motion.div>
        );
      case 'x_miners_world':
        return (
          <motion.div
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            <svg width="40" height="40" viewBox="0 0 32 32">
              <rect
                x="4"
                y="4"
                width="24"
                height="24"
                rx="6"
                fill="#020617"
                stroke="#9CA3AF"
                strokeWidth="2"
              />
              <path
                d="M9 9L23 23M23 9L9 23"
                stroke="#F9FAFB"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        );
      case 'base_world':
      default:
        return (
          <motion.div
            className="pointer-events-none absolute -top-1 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -2, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity }}
          >
            <svg width="36" height="36" viewBox="0 0 32 32">
              <path
                d="M16 4L26 16L16 28L6 16L16 4Z"
                fill="#022C44"
                stroke="#0EA5E9"
                strokeWidth="2"
              />
              <circle cx="16" cy="16" r="4" fill="#0EA5E9" />
            </svg>
          </motion.div>
        );
    }
  };

  return (
    <div
      className={cn(
        'relative flex h-28 w-full border-b border-[#00F0FF]/20 bg-[#0B1026]',
        managerActive && 'shadow-[0_0_18px_rgba(255,215,0,0.4)]',
        equippedSkin &&
          'border-[#FACC15]/60 bg-gradient-to-r from-[#020617] via-[#0B1026] to-[#111827] shadow-[0_0_26px_rgba(250,204,21,0.45)]',
      )}
    >
      {elevatorClogged && (
        <div className="absolute right-2 top-1 z-20 flex items-center gap-1 rounded-full border border-amber-400/70 bg-amber-500/20 px-2 py-0.5 text-[9px] font-semibold text-amber-100 animate-pulse">
          <AlertTriangle className="h-3 w-3" />
          <span>Clogs</span>
        </div>
      )}
      {/* Left: Shaft ID/Level */}
      <div className="flex w-16 flex-col items-center justify-center border-r border-[#00F0FF]/20 bg-[#162044] gap-1">
        <span className="font-orbitron text-xl font-bold text-white">{shaft.id}</span>
        <div className="flex items-center gap-1 rounded bg-black/50 px-1">
          <span className="text-[10px] text-[#00F0FF]">Lvl {shaft.level}</span>
        </div>
        <ManagerSlot sectorId={`shaft_${shaft.id}`} currentManagerId={shaft.managerId} />
      </div>

      <div className="flex flex-1 items-end justify-center pb-2 relative overflow-hidden">
        <motion.div
          className="absolute inset-x-4 bottom-3 h-4 rounded-full bg-black/60 blur-sm"
          animate={{ opacity: managerActive ? [0.2, 0.6, 0.2] : [0.1, 0.3, 0.1], y: [0, -2, 0] }}
          transition={{ duration: managerActive ? 0.8 : 1.4, repeat: Infinity }}
        />
        {equippedSkin && (
          <motion.div
            className="absolute inset-x-6 bottom-1 h-6 rounded-full bg-gradient-to-r from-yellow-400/10 via-amber-500/25 to-yellow-400/10 blur-md"
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
        )}
        <div className="relative flex items-end justify-center gap-2">
          {renderWorldBadge()}
          {Array.from({ length: workerCount }).map((_, index) => (
            <Miner 
              key={index} 
              color={minerColor} 
              duration={rotationDuration} 
              delay={index * 0.15}
              variant={minerVariant}
              styleIndex={index}
            />
          ))}
        </div>
      </div>

      {/* Right: Upgrade Button */}
      <div className="flex w-24 flex-col items-center justify-center border-l border-[#00F0FF]/20 p-1">
        <div className="relative group w-full">
          <button
            onClick={() => {
              upgradeShaft(id);
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
              {shaft.cost >= 1000 ? `${(shaft.cost / 1000).toFixed(1)}k` : shaft.cost}
            </span>
          </button>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1 hidden w-40 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-[9px] text-gray-100 shadow-lg group-hover:block">
            <ShaftTooltipContent shaftId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ShaftTooltipContent({ shaftId }: { shaftId: number }) {
  const shaft = useGameStore(state => state.shafts.find(s => s.id === shaftId));
  if (!shaft) return null;
  const workers = Math.max(1, shaft.workerCount);
  const currentProd = shaft.level * workers * 10 * Math.pow(PRODUCTION_GROWTH_FACTOR, shaft.level - 1);
  const nextLevel = shaft.level + 1;
  const nextProd = nextLevel * workers * 10 * Math.pow(PRODUCTION_GROWTH_FACTOR, nextLevel - 1);
  const delta = nextProd - currentProd;

  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-[#00F0FF]">Shaft Upgrade</span>
      <span>Production +{delta.toFixed(0)} TLM/s</span>
      <span>Cost {shaft.cost >= 1000 ? `${(shaft.cost / 1000).toFixed(1)}k` : shaft.cost} TLM</span>
    </div>
  );
}
