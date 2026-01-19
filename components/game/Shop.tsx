"use client";

import { useState } from 'react';
import { useSendTransaction, useAccount, useConnect, useDisconnect } from 'wagmi';
import { parseEther } from 'viem';
import { Loader2, ShoppingBag, Zap, Clock, Wallet, Crown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';

const PAYMENT_ROUTER = "0x980E5F15E788Cb653C77781099Fb739d7A1aEEd0";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  costEth: string;
  costGameAssets?: number;
  icon: LucideIcon;
  effect: () => void;
}

export function Shop() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransaction, isPending } = useSendTransaction();
  const instantWarp = useGameStore(state => state.instantWarp);
  const activateGlobalBoost = useGameStore(state => state.activateGlobalBoost);
  const setHasExecutivePass = useGameStore(state => state.setHasExecutivePass);
  const hasExecutivePass = useGameStore(state => state.hasExecutivePass);
  const minerSkins = useGameStore(state => state.minerSkins);
  const ownedSkinIds = useGameStore(state => state.ownedSkinIds);
  const mintSkin = useGameStore(state => state.mintSkin);
  const equipSkin = useGameStore(state => state.equipSkin);

  const boostItems: ShopItem[] = [
    {
      id: 'warp_1h',
      name: '1 Hour Warp',
      description: 'Instantly gain 1 hour of production.',
      costEth: '0.0003',
      icon: Clock,
      effect: () => instantWarp(3600),
    },
    {
      id: 'warp_4h',
      name: '4 Hour Warp',
      description: 'Instantly gain 4 hours of production.',
      costEth: '0.0006',
      icon: Clock,
      effect: () => instantWarp(3600 * 4),
    },
    {
      id: 'boost_x2',
      name: 'x2 Boost (24h)',
      description: 'Double all production for 24 hours.',
      costEth: '0.001',
      icon: Zap,
      effect: () => activateGlobalBoost(2, 24 * 3600),
    },
    {
      id: 'super_drills',
      name: 'Super Drills Pack',
      description: 'Temporarily boost all shafts with high-power drills.',
      costEth: '0.002',
      icon: Zap,
      effect: () => activateGlobalBoost(2.5, 6 * 3600),
    },
    {
      id: 'executive_pass',
      name: 'Executive Mining Pass',
      description: 'Permanent premium badge and priority for future rewards.',
      costEth: '0.0033',
      icon: Zap,
      effect: () => setHasExecutivePass(),
    },
  ];

  const skinShopItems: ShopItem[] = minerSkins.map(skin => ({
    id: `skin_${skin.id}`,
    name: skin.name,
    description: `Unlock this miner skin effect (x${skin.multiplier.toFixed(0)} aura).`,
    costEth: (skin.priceUsd / 3000).toFixed(4),
    costGameAssets: skin.priceGameAssets,
    icon: Zap,
    effect: () => {
      mintSkin(skin.id);
      equipSkin(skin.id);
    },
  }));

  const items: ShopItem[] = [...boostItems, ...skinShopItems];

  const getBaseConnector = () =>
    connectors.find(
      c =>
        c.id.toLowerCase().includes('coinbase') ||
        c.name.toLowerCase().includes('coinbase'),
    ) ?? connectors[0];

  const getMetaMaskConnector = () =>
    connectors.find(
      c =>
        c.id.toLowerCase().includes('injected') ||
        c.name.toLowerCase().includes('metamask'),
    );

  const handlePurchase = (item: ShopItem, useGameAssets = false) => {
    if (useGameAssets && item.costGameAssets) {
      const state = useGameStore.getState();
      if (state.tlm < item.costGameAssets) {
        alert("Not enough Game Assets!");
        return;
      }
      useGameStore.setState({ tlm: state.tlm - item.costGameAssets });
      item.effect();
      vibrate(HAPTIC_PATTERNS.SUCCESS);
      alert(`Unlocked ${item.name} with game assets!`);
      return;
    }

    if (item.id === 'executive_pass' && hasExecutivePass) {
      return;
    }
    if (!isConnected) {
      const baseConnector = getBaseConnector();
      if (baseConnector) {
        connect({ connector: baseConnector });
      }
      return;
    }

    sendTransaction(
      {
        to: PAYMENT_ROUTER,
        value: parseEther(item.costEth),
        data: "0x",
      },
      {
        onSuccess: () => {
          item.effect();
          vibrate(HAPTIC_PATTERNS.SUCCESS);
          alert(`Purchased ${item.name}!`);
        },
      },
    );
  };

  return (
    <div className="flex flex-col space-y-3 p-3 pb-20">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-[#00F0FF]" />
            <h2 className="font-orbitron text-xl font-bold text-white">Supply Depot</h2>
        </div>
        
        {/* Wallet Status */}
        {isConnected ? (
             <div className="flex items-center gap-2">
                 <span className="text-[10px] font-mono text-gray-400">
                     {address?.slice(0,6)}...{address?.slice(-4)}
                 </span>
                 <button onClick={() => disconnect()} className="text-[10px] text-red-500 hover:text-red-400">
                     Disconnect
                 </button>
             </div>
        ) : (
             <div className="flex gap-2">
                 <button 
                     onClick={() => {
                       const baseConnector = getBaseConnector();
                       if (baseConnector) connect({ connector: baseConnector });
                     }}
                     className="flex items-center gap-1 rounded bg-[#0052FF] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#0040DD]"
                 >
                     <Wallet className="h-3 w-3" /> Connect
                 </button>
                 <button 
                     onClick={() => {
                       const mm = getMetaMaskConnector();
                       if (mm) connect({ connector: mm });
                     }}
                     disabled={!getMetaMaskConnector()}
                     className="flex items-center gap-1 rounded bg-[#F6851B] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#E2761B]"
                 >
                     MetaMask
                 </button>
             </div>
        )}
      </div>

      <div className="mb-2 rounded-2xl border border-[#FFD700]/40 bg-gradient-to-br from-[#1F2937] via-[#111827] to-[#78350F] p-3 shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE38A] to-[#F59E0B] shadow-[0_0_20px_rgba(245,158,11,0.7)]">
            <Crown className="h-5 w-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-orbitron text-xs font-bold text-yellow-300 uppercase tracking-wide">
              Executive Mining Pass
            </span>
            <span className="text-[9px] text-yellow-100/80">
              Unlock VIP badge next to your name across the app.
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="font-orbitron text-xs font-bold text-[#FFE38A]">
            $10 USD
          </span>
          <button
            onClick={() => {
              const execItem = items.find(i => i.id === 'executive_pass');
              if (execItem) handlePurchase(execItem);
            }}
            disabled={isPending || hasExecutivePass}
            className={cn(
              'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95',
              hasExecutivePass
                ? 'bg-gray-700 text-gray-300 cursor-default'
                : 'bg-[#00F0FF] text-black hover:bg-[#00C0CC] shadow-[0_0_16px_rgba(0,240,255,0.6)]'
            )}
          >
            {hasExecutivePass ? 'Owned' : 'Unlock VIP'}
          </button>
        </div>
      </div>

      <ShopTabs
        items={items}
        isPending={isPending}
        hasExecutivePass={hasExecutivePass}
        ownedSkinIds={ownedSkinIds}
        onPurchase={handlePurchase}
      />
    </div>
  );
}

interface ShopTabsProps {
  items: ShopItem[];
  isPending: boolean;
  hasExecutivePass: boolean;
  ownedSkinIds: string[];
  onPurchase: (item: ShopItem, useGameAssets?: boolean) => void;
}

function ShopTabs({ items, isPending, hasExecutivePass, ownedSkinIds, onPurchase }: ShopTabsProps) {
  const [activeTab, setActiveTab] = useState<'boosts' | 'skins' | 'points'>('boosts');
  const tlm = useGameStore(state => state.tlm);

  const boostItems = items.filter(item => !item.id.startsWith('skin_'));
  const skinItems = items.filter(item => item.id.startsWith('skin_'));

  const pointItems = [
    {
      id: 'points_skin',
      name: 'Point Skin Crate',
      description: 'Use earned points to unlock random miner cosmetic.',
      costPoints: 1000,
    },
    {
      id: 'points_boost',
      name: 'Point Boost Pack',
      description: 'Small temporary production boost purchased with points.',
      costPoints: 750,
    },
  ];

  const renderItemCard = (item: ShopItem) => {
    const Icon = item.icon;
    const isSkin = item.id.startsWith('skin_');
    const skinId = isSkin ? item.id.replace('skin_', '') : null;
    const isSkinOwned = isSkin && skinId ? ownedSkinIds.includes(skinId) : false;
    const isOwned =
      item.id === 'executive_pass'
        ? hasExecutivePass
        : isSkinOwned;

    const canAffordAssets = item.costGameAssets ? tlm >= item.costGameAssets : false;

    return (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-xl border border-[#00F0FF]/20 bg-[#162044] p-3 shadow-[0_0_10px_rgba(0,0,0,0.4)] transition-all duration-200 hover:scale-[1.02] hover:border-[#00F0FF]/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.5)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1026] border border-white/10">
            <Icon className="h-5 w-5 text-[#FFD700]" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">{item.name}</h3>
            <p className="text-[9px] text-gray-400">{item.description}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 items-end">
          {isOwned ? (
              <button
                disabled
                className="flex min-w-[90px] items-center justify-center rounded bg-gray-700 px-3 py-1.5 text-[11px] font-bold text-gray-300"
              >
                Owned
              </button>
          ) : (
            <>
              <button
                onClick={() => onPurchase(item, false)}
                disabled={isPending}
                className={cn(
                  'flex min-w-[90px] flex-col items-center justify-center rounded px-3 py-1.5 text-black transition-all active:scale-95',
                  isPending
                    ? 'bg-[#00F0FF]/80 animate-pulse'
                    : 'bg-[#00F0FF] hover:bg-[#00C0CC]',
                )}
              >
                {isPending ? (
                  <div className="flex flex-col items-center gap-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-[9px] font-semibold">Tx Processing...</span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold">{item.costEth} ETH</span>
                )}
              </button>
              
              {item.costGameAssets && (
                  <button
                    onClick={() => onPurchase(item, true)}
                    disabled={!canAffordAssets}
                    className={cn(
                        "flex min-w-[90px] items-center justify-center rounded border px-3 py-1 text-[9px] font-bold uppercase tracking-wider transition-all",
                        canAffordAssets 
                            ? "border-[#00F0FF] text-[#00F0FF] hover:bg-[#00F0FF]/10 active:scale-95" 
                            : "border-gray-700 text-gray-600 cursor-not-allowed"
                    )}
                  >
                    {item.costGameAssets >= 1_000_000 
                        ? `${(item.costGameAssets / 1_000_000).toFixed(1)}M Assets`
                        : `${item.costGameAssets} Assets`}
                  </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderPointsCard = (item: { id: string; name: string; description: string; costPoints: number }) => {
    return (
      <div
        key={item.id}
        className="flex items-center justify-between rounded-xl border border-white/10 bg-[#111827] p-3 shadow-[0_0_10px_rgba(0,0,0,0.4)]"
      >
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-white text-sm">{item.name}</h3>
          <p className="text-[9px] text-gray-400">{item.description}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] font-orbitron font-bold text-[#00F0FF]">
            {item.costPoints} pts
          </span>
          <button
            disabled={true}
            className="rounded px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-gray-400 border border-gray-600 cursor-default"
          >
            Coming Soon
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex rounded-full bg-black/30 border border-white/10 p-1 text-[10px] font-bold uppercase tracking-wide">
        <button
          onClick={() => setActiveTab('boosts')}
          className={cn(
            'flex-1 rounded-full px-3 py-1 transition-all',
            activeTab === 'boosts'
              ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'bg-transparent text-gray-400 hover:text-white',
          )}
        >
          Boosts
        </button>
        <button
          onClick={() => setActiveTab('skins')}
          className={cn(
            'flex-1 rounded-full px-3 py-1 transition-all',
            activeTab === 'skins'
              ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'bg-transparent text-gray-400 hover:text-white',
          )}
        >
          Miner Skins
        </button>
        <button
          onClick={() => setActiveTab('points')}
          className={cn(
            'flex-1 rounded-full px-3 py-1 transition-all',
            activeTab === 'points'
              ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
              : 'bg-transparent text-gray-400 hover:text-white',
          )}
        >
          Point Shop
        </button>
      </div>

      <div className="grid gap-3">
        {activeTab === 'boosts' &&
          boostItems.map(item => renderItemCard(item))}

        {activeTab === 'skins' &&
          skinItems.map(item => renderItemCard(item))}

        {activeTab === 'points' &&
          pointItems.map(item => renderPointsCard(item))}
      </div>
    </div>
  );
}
