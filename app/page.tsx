"use client";

import { GameLoop } from '@/components/game/GameLoop';
import { FlyingRocket } from '@/components/game/FlyingRocket';
import { Shaft } from '@/components/game/Shaft';
import { Elevator } from '@/components/game/Elevator';
import { Warehouse } from '@/components/game/Warehouse';
import { Map } from '@/components/game/Map';
import { Shop } from '@/components/game/Shop';
import { Profile } from '@/components/game/Profile';
import { Quests } from '@/components/game/Quests';
import { WelcomeBackModal } from '@/components/game/WelcomeBackModal';
import { TopBar } from '@/components/ui/TopBar';
import { BottomDock, type Tab } from '@/components/ui/BottomDock';
import { useGameStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';
import { useState } from 'react';
import { useLeaderboardSync } from '@/hooks/useLeaderboardSync';
import { useAccount, useConnect, useDisconnect, useSendTransaction } from 'wagmi';
import { parseEther } from 'viem';

export default function Home() {
  useLeaderboardSync();
  const [activeTab, setActiveTab] = useState<Tab>('mine');
  const [mineSubTab, setMineSubTab] = useState<'control' | 'staff'>('control');
  const [lastHiredId, setLastHiredId] = useState<number | null>(null);
  const [showEquipPanel, setShowEquipPanel] = useState(false);
  const [moreSubTab, setMoreSubTab] = useState<'main' | 'verifiedSocial' | 'roadmap'>('main');
  const [socialSubTab, setSocialSubTab] = useState<'twitter' | 'farcaster' | 'base'>('twitter');
  const [verifyingTask, setVerifyingTask] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();

  const shafts = useGameStore(state => state.shafts);
  const unlockShaft = useGameStore(state => state.unlockShaft);
  const hireWorker = useGameStore(state => state.hireWorker);
  const purchaseMegaDrill = useGameStore(state => state.purchaseMegaDrill);
  const tlm = useGameStore(state => state.tlm);
  const netWorth = useGameStore(state => state.netWorth);
  const gems = useGameStore(state => state.gems);
  const currentPlanetId = useGameStore(state => state.currentPlanet);
  const currentRank = useGameStore(state => state.currentRank);
  const minerSkins = useGameStore(state => state.minerSkins);
  const ownedSkinIds = useGameStore(state => state.ownedSkinIds);
  const equippedSkinId = useGameStore(state => state.equippedSkinId);
  const equipSkin = useGameStore(state => state.equipSkin);
  const socialTasks = useGameStore(state => state.socialTasks);
  const completeSocialTask = useGameStore(state => state.completeSocialTask);
  const buyBoost = useGameStore(state => state.buyBoost);

  const handleVerifyTask = async (
    taskId:
      | 'followVoidDrillersX'
      | 'shareGrokTweet'
      | 'commentVoidDrillersTweet'
      | 'followFarcasterProfile'
      | 'castFarcasterGame',
  ) => {
    if (!isConnected) {
      const connector = connectors.find(c => c.id === 'coinbaseWalletSDK') || connectors[0];
      if (connector) connect({ connector });
      return;
    }
    
    setVerifyingTask(taskId);
    try {
      if (!address) {
        alert('Wallet not ready, please reconnect and try again.');
        return;
      }

      await sendTransactionAsync({
        to: address,
        value: 0n,
      });
      
      completeSocialTask(taskId);
    } catch (e) {
      console.error(e);
      alert('Verification transaction failed or cancelled.');
    } finally {
      setVerifyingTask(null);
    }
  };

  const equippedSkin = minerSkins.find(s => s.id === equippedSkinId) || null;

  const nextShaftId = shafts.length + 1;
  const nextShaftCost = 100 * Math.pow(10, nextShaftId - 1);
  const canUnlock = tlm >= nextShaftCost;

  const formatScore = (value: number) => {
    if (!Number.isFinite(value)) return '0';
    const abs = Math.abs(value);
    if (abs >= 1e15) return `${(value / 1e15).toFixed(1)}q`;
    if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}t`;
    if (abs >= 1e9) return `${(value / 1e9).toFixed(1)}b`;
    if (abs >= 1e6) return `${(value / 1e6).toFixed(1)}m`;
    if (abs >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
    return Math.floor(value).toString();
  };

  const formattedScore = formatScore(netWorth);
  const worldLabel =
    currentPlanetId === 'satoshi_world' ? 'Satoshi World' : 'Base World';
  const rankPart = currentRank ? ` Global rank: #${currentRank}.` : '';

  const shareScoreText = `Playing VoidDrillersX – free earning mini app on Base + Farcaster! My score: (${formattedScore} TLM) on ${worldLabel}.${rankPart} Hey @grok, create a cool image for @VoidDrillersX that clearly shows the game name VoidDrillersX and my score. #VoidDrillersX #VDR #Base #Farcaster`;
  const shareScoreUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareScoreText)}`;

  const handleHireWorker = (shaftId: number, workerCount: number) => {
    const baseCost = Math.pow(10, shaftId) * 500;
    const hireCost = baseCost * Math.pow(1.5, workerCount);
    if (tlm < hireCost) return;
    hireWorker(shaftId);
    setLastHiredId(shaftId);
    setTimeout(() => {
      setLastHiredId(current => (current === shaftId ? null : current));
    }, 400);
  };

  const worldBackground = `url('/assets/game-open-banner.svg')`;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-black overflow-hidden relative font-sans text-white">
      {/* Blurred Cosmic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-80"
        style={{
          backgroundImage: worldBackground,
        }}
      >
        <div className="absolute inset-0 backdrop-blur-md bg-black/40" />
      </div>

      <GameLoop />
      <FlyingRocket />
      <WelcomeBackModal />

      {/* App Container - Responsive Mobile-First Design */}
      <div className="relative z-10 flex h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-[#0B1026] shadow-[0_0_50px_rgba(0,240,255,0.15)] ring-1 ring-[#00F0FF]/50 sm:h-[90vh] sm:rounded-3xl sm:border-4 sm:border-[#00F0FF]/30">
        
        {/* Top Bar (HUD) */}
        <div className="shrink-0 z-20 bg-[#0B1026]/90 backdrop-blur-md border-b border-[#00F0FF]/10">
           <TopBar />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-hide relative">
          {activeTab === 'mine' && (
            <>
              <Warehouse />

              <div className="sticky top-0 z-30 border-b border-[#00F0FF]/20 bg-[#0B1026]/95 backdrop-blur px-4 py-2">
                <div className="mx-auto flex max-w-md items-center justify-between gap-2">
                  <div className="flex flex-1 justify-center">
                    <div className="flex w-full max-w-xs rounded-full border border-[#00F0FF]/20 bg-black/40 p-1">
                      <button
                        onClick={() => setMineSubTab('control')}
                        style={mineSubTab === 'control' ? { backgroundImage: "url('/assets/ui-button.svg')", backgroundSize: '100% 100%' } : undefined}
                        className={cn(
                          'flex-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all',
                          mineSubTab === 'control'
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)] bg-cover bg-center bg-no-repeat'
                            : 'bg-transparent text-gray-400 hover:text-white',
                        )}
                      >
                        Mine Control
                      </button>
                      <button
                        onClick={() => setMineSubTab('staff')}
                        style={mineSubTab === 'staff' ? { backgroundImage: "url('/assets/ui-button.svg')", backgroundSize: '100% 100%' } : undefined}
                        className={cn(
                          'flex-1 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all',
                          mineSubTab === 'staff'
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)] bg-cover bg-center bg-no-repeat'
                            : 'bg-transparent text-gray-400 hover:text-white',
                        )}
                      >
                        Staff & Mechs
                      </button>
                    </div>
                  </div>
                  <button
                    disabled
                    className="rounded-full border border-[#00F0FF]/30 bg-black/40 px-3 py-1 text-[9px] font-bold uppercase tracking-wide text-[#00F0FF] opacity-80"
                  >
                    Equip NFT · Layer 2 Soon
                  </button>
                </div>
              </div>

              {mineSubTab === 'control' && (
                <div className="flex min-h-full flex-col">
                  <div className="sticky top-[54px] z-20 h-auto bg-[#0B1026]/90 backdrop-blur-sm border-b border-[#00F0FF]/10">
                    <Elevator />
                  </div>

                  <div className="flex flex-1 flex-col bg-[#0B1026] pb-24">
                    {shafts.map(shaft => (
                      <Shaft key={shaft.id} id={shaft.id} />
                    ))}

                    <div className="flex h-32 items-center justify-center border-t border-[#00F0FF]/20 bg-gradient-to-b from-[#0B1026] to-black p-6">
                      <button
                        onClick={unlockShaft}
                        disabled={!canUnlock}
                        className={cn(
                          'flex w-full max-w-[280px] items-center justify-center gap-3 rounded-xl border-2 border-dashed py-4 text-sm font-bold uppercase transition-all shadow-lg',
                          canUnlock
                            ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                            : 'border-gray-700 bg-black/40 text-gray-600',
                        )}
                      >
                        <ArrowDown className="h-5 w-5 animate-bounce" />
                        <div className="flex flex-col items-start">
                          <span>Unlock Shaft {nextShaftId}</span>
                          <span className="font-orbitron text-xs tracking-wider">
                            {nextShaftCost >= 1000
                              ? `${(nextShaftCost / 1000).toFixed(0)}k`
                              : nextShaftCost}{' '}
                            TLM
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {mineSubTab === 'staff' && (
                <div className="flex min-h-full flex-col">
                  <div className="sticky top-[54px] z-20 h-auto bg-[#0B1026]/90 backdrop-blur-sm border-b border-[#00F0FF]/10">
                    <Elevator />
                  </div>

                  <div className="flex flex-1 flex-col bg-[#0B1026] pb-24">
                    <div className="px-4 pt-3 pb-2 border-b border-[#00F0FF]/15 bg-[#050814]/40">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#00F0FF]">
                            Miner Skin Effects
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {equippedSkin
                              ? `${equippedSkin.name} · x${equippedSkin.multiplier.toFixed(
                                  0,
                                )} earnings`
                              : 'No effect equipped · base earnings'}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowEquipPanel(prev => !prev)}
                          className={cn(
                            'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide border transition-all',
                            showEquipPanel
                              ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF]'
                              : 'border-[#00F0FF]/40 bg-black/40 text-[#00F0FF] hover:bg-[#00F0FF]/10',
                          )}
                        >
                          {showEquipPanel ? 'Close' : 'Equip Effects'}
                        </button>
                      </div>
                      {showEquipPanel && (
                        <div className="mt-3 grid grid-cols-1 gap-2 text-[11px]">
                          {minerSkins.map(skin => {
                            const owned = ownedSkinIds.includes(skin.id);
                            const isEquipped = equippedSkinId === skin.id;
                            return (
                              <div
                                key={skin.id}
                                className={cn(
                                  'flex items-center justify-between rounded-xl border px-3 py-2 bg-black/40',
                                  isEquipped && 'border-[#00F0FF] shadow-[0_0_12px_rgba(0,240,255,0.4)]',
                                  !owned && !isEquipped && 'border-gray-700 bg-black/30',
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="font-semibold text-white">
                                    {skin.name}
                                  </span>
                                  <span className="text-[10px] text-gray-400">
                                    x{skin.multiplier.toFixed(0)} earnings ·{' '}
                                    {skin.rarity.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-gray-500">
                                    {skin.priceUsd.toFixed(2)} USD ·{' '}
                                    {(skin.priceGameAssets / 1_000_000).toFixed(1)}m game assets
                                  </span>
                                </div>
                                <button
                                  onClick={() => {
                                    if (!owned) {
                                      setShowEquipPanel(false);
                                      setActiveTab('shop');
                                      return;
                                    }
                                    equipSkin(skin.id);
                                  }}
                                  disabled={isEquipped}
                                  className={cn(
                                    'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wide border transition-all min-w-[90px] text-center',
                                    isEquipped
                                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
                                      : owned
                                      ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 active:scale-95'
                                      : 'border-[#00F0FF]/40 text-[#00F0FF] bg-black/40 hover:bg-[#00F0FF]/10 active:scale-95',
                                  )}
                                >
                                  {!owned
                                    ? 'Buy in Shop tab'
                                    : isEquipped
                                    ? 'Equipped'
                                    : `Equip x${skin.multiplier.toFixed(0)}`}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {shafts.map(shaft => {
                      const baseCost = Math.pow(10, shaft.id) * 500;
                      const hireCost = baseCost * Math.pow(1.5, shaft.workerCount);
                      const canHire = tlm >= hireCost;
                      const workerDisplayCount = Math.max(
                        1,
                        Math.min(6, shaft.workerCount),
                      );

                      return (
                        <div
                          key={shaft.id}
                          className={cn(
                            'flex items-center justify-between border-b border-[#00F0FF]/10 bg-[#0B1026] px-4 py-3 transition-all',
                            lastHiredId === shaft.id &&
                              'bg-[#00F0FF]/10 shadow-[inset_0_0_20px_rgba(0,240,255,0.2)]',
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#00F0FF]/30 bg-black/60 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
                              <span className="font-orbitron text-xl font-bold text-[#00F0FF]">
                                {shaft.id}
                              </span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-bold text-white tracking-wide font-chakra">
                                SHAFT TEAM
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase text-gray-400">
                                  Workers
                                </span>
                                <span className="font-orbitron text-sm font-bold text-[#00F0FF]">
                                  {shaft.workerCount}
                                </span>
                              </div>
                              <div className="flex gap-1.5 mt-1">
                                {Array.from({ length: workerDisplayCount }).map(
                                  (_, index) => (
                                    <div
                                      key={index}
                                      className="h-2 w-2 rounded-full bg-[#00F0FF] shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                                    />
                                  ),
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <button
                              onClick={() =>
                                handleHireWorker(shaft.id, shaft.workerCount)
                              }
                              disabled={!canHire}
                              className={cn(
                                'flex flex-col items-center min-w-[100px] rounded-lg border px-3 py-2 text-[10px] font-bold transition-all uppercase tracking-wider',
                                canHire
                                  ? 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 active:scale-95 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                                  : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed',
                              )}
                            >
                              <span>Hire +1</span>
                              <span className="font-orbitron text-[10px]">
                                {hireCost >= 1000
                                  ? `${(hireCost / 1000).toFixed(0)}k`
                                  : hireCost}{' '}
                                TLM
                              </span>
                            </button>
                            
                            {shaft.id === 1 && (
                              <button
                                onClick={() => purchaseMegaDrill(1)}
                                disabled={tlm < 5000}
                                className={cn(
                                  'flex flex-col items-center min-w-[100px] rounded-lg border px-2 py-1.5 text-[9px] font-bold transition-all uppercase tracking-wider',
                                  tlm >= 5000
                                    ? 'border-yellow-400 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 active:scale-95 shadow-[0_0_10px_rgba(250,204,21,0.2)]'
                                    : 'border-gray-800 bg-gray-900/50 text-gray-600 cursor-not-allowed',
                                )}
                              >
                                <span>Mega Drill x2</span>
                                <span className="font-orbitron text-[9px]">5000 TLM</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'map' && <Map />}
          {activeTab === 'shop' && <Shop />}
          {activeTab === 'quests' && <Quests />}
          {activeTab === 'profile' && <Profile />}
          {activeTab === 'more' && (
            <div className="flex h-full flex-col p-4 pb-24 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <h2 className="font-orbitron text-xl font-bold text-white">
                    More
                  </h2>
                  <p className="text-xs text-gray-400">
                    Wallet, Rewards & Verification
                  </p>
                </div>
                {!isConnected ? (
                  <button
                    onClick={() => {
                      const connector =
                        connectors.find(c => c.id === 'coinbaseWalletSDK') ||
                        connectors[0];
                      if (connector) connect({ connector });
                    }}
                    className="rounded-full border border-[#00F0FF] bg-[#00F0FF]/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[#00F0FF] hover:bg-[#00F0FF]/20"
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#00F0FF] font-mono">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                    <button
                      onClick={() => disconnect()}
                      className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-[10px] font-bold text-red-400 hover:bg-red-500/20"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 rounded-2xl border border-[#00F0FF]/20 bg-[#0B1026]/80 p-3 overflow-y-auto scrollbar-hide">
                {moreSubTab === 'main' && (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex w-full flex-col rounded-2xl border border-[#00F0FF]/40 bg-black/60 p-4 shadow-[0_0_16px_rgba(0,240,255,0.1)]">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-orbitron text-sm text-white">
                          Gem Rewards Shop
                        </span>
                        <div className="flex items-center gap-1.5 rounded-full bg-[#00F0FF]/10 px-2 py-0.5 border border-[#00F0FF]/20">
                          <div className="h-2 w-2 rounded-full bg-[#00F0FF] animate-pulse" />
                          <span className="text-[10px] font-bold text-[#00F0FF]">
                            {gems} Gems
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-white">
                            2x Production Boost
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Lasts 1 hour. Stacks with skins.
                          </span>
                        </div>
                        <button
                          onClick={() => buyBoost(50, 2, 3600)}
                          disabled={gems < 50}
                          className={cn(
                            'min-w-[80px] rounded-lg px-3 py-2 text-[10px] font-bold uppercase border transition-all',
                            gems >= 50
                              ? 'border-[#00F0FF] bg-[#00F0FF]/20 text-[#00F0FF] hover:bg-[#00F0FF]/30 active:scale-95'
                              : 'border-gray-700 bg-gray-800/50 text-gray-500 cursor-not-allowed',
                          )}
                        >
                          {gems >= 50 ? 'Buy (50)' : 'Need 50'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setMoreSubTab('verifiedSocial')}
                      className="flex w-full flex-col items-start justify-center rounded-2xl border border-[#00F0FF]/30 bg-black/60 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-[#00F0FF] hover:bg-[#00F0FF]/5 active:scale-[0.99]"
                    >
                      <span className="font-orbitron text-sm text-white">
                        Verified Social Tasks
                      </span>
                      <span className="mt-1 text-[10px] text-gray-300 normal-case">
                        Twitter, Farcaster and Base Mini tasks with on-chain verification.
                      </span>
                      <span className="mt-1 text-[9px] text-gray-400">
                        Tap to open full task view
                      </span>
                    </button>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setMoreSubTab('roadmap')}
                        className="flex w-full flex-col items-start rounded-xl border border-gray-800 bg-black/40 p-3 text-left hover:bg-[#00F0FF]/5 active:scale-[0.99] transition-all"
                      >
                        <span className="block font-orbitron text-xs text-gray-400 mb-1">
                          Roadmap: Future Coin
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Future VoidDrillersX coin for top miners and social grinders. Tap to
                          open a short in-game whitepaper.
                        </p>
                        <span className="mt-1 text-[9px] text-[#00F0FF]">
                          Join @VoidDrillersX + our X Community to stay early.
                        </span>
                      </button>
                      <div className="rounded-xl border border-gray-800 bg-black/40 p-3">
                        <span className="block font-orbitron text-xs text-gray-400 mb-1">
                          Roadmap: NFT Collection
                        </span>
                        <p className="text-[10px] text-gray-500">
                          Layer 2 miner NFTs coming soon. Will provide permanent in-game
                          boosts.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {moreSubTab === 'verifiedSocial' && (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setMoreSubTab('main')}
                        className="rounded-full border border-[#00F0FF]/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00F0FF] hover:bg-[#00F0FF]/10 active:scale-95"
                      >
                        Back
                      </button>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="uppercase tracking-wide">Verified Tasks</span>
                        <span className="h-1 w-1 rounded-full bg-[#00F0FF]" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-full border border-[#00F0FF]/20 bg-black/40 p-1 text-[10px] font-bold uppercase tracking-wide">
                      <button
                        onClick={() => setSocialSubTab('twitter')}
                        className={cn(
                          'flex-1 rounded-full px-2 py-1 transition-all',
                          socialSubTab === 'twitter'
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                            : 'text-gray-400',
                        )}
                      >
                        Twitter
                      </button>
                      <button
                        onClick={() => setSocialSubTab('farcaster')}
                        className={cn(
                          'flex-1 rounded-full px-2 py-1 transition-all',
                          socialSubTab === 'farcaster'
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                            : 'text-gray-400',
                        )}
                      >
                        Farcaster
                      </button>
                      <button
                        onClick={() => setSocialSubTab('base')}
                        className={cn(
                          'flex-1 rounded-full px-2 py-1 transition-all',
                          socialSubTab === 'base'
                            ? 'bg-[#00F0FF] text-black shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                            : 'text-gray-400',
                        )}
                      >
                        Base Mini
                      </button>
                    </div>

                    {socialSubTab === 'twitter' && (
                      <div className="flex flex-col gap-4 rounded-2xl border border-[#00F0FF]/30 bg-black/70 px-4 py-3 text-[11px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">
                                1. Follow @VoidDrillersX
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-[220px]">
                                Open our X profile and follow VoidDrillersX to stay updated.
                              </span>
                            </div>
                            <a
                              href="https://x.com/VoidDrillersX"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00F0FF] hover:underline"
                            >
                              Open Profile ↗
                            </a>
                          </div>
                          <button
                            onClick={() => handleVerifyTask('followVoidDrillersX')}
                            disabled={
                              socialTasks.followVoidDrillersX ||
                              verifyingTask === 'followVoidDrillersX'
                            }
                            className={cn(
                              'w-full rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition-all',
                              socialTasks.followVoidDrillersX
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20',
                            )}
                          >
                            {socialTasks.followVoidDrillersX
                              ? 'Completed'
                              : verifyingTask === 'followVoidDrillersX'
                              ? 'Verifying...'
                              : 'Verify & Claim (+25 Gems)'}
                          </button>
                        </div>

                        <div className="h-px w-full bg-[#00F0FF]/10" />

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">
                                2. Share Grok Tweet
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-[220px]">
                                Opens X with your score and rank in the text, tagging @grok and @VoidDrillersX.
                              </span>
                            </div>
                            <a
                              href={shareScoreUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00F0FF] hover:underline"
                            >
                              Open Share Tweet ↗
                            </a>
                          </div>
                          <button
                            onClick={() => handleVerifyTask('shareGrokTweet')}
                            disabled={
                              socialTasks.shareGrokTweet ||
                              verifyingTask === 'shareGrokTweet'
                            }
                            className={cn(
                              'w-full rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition-all',
                              socialTasks.shareGrokTweet
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20',
                            )}
                          >
                            {socialTasks.shareGrokTweet
                              ? 'Completed'
                              : verifyingTask === 'shareGrokTweet'
                              ? 'Verifying...'
                              : 'Verify & Claim (+25 Gems)'}
                          </button>
                        </div>

                        <div className="h-px w-full bg-[#00F0FF]/10" />

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">
                                3. Repost + Comment Pinned Post
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-[220px]">
                                Repost our pinned airdrop tweet and comment with your score and Solana wallet.
                              </span>
                            </div>
                            <a
                              href="https://x.com/VoidDrillersX/status/2012975181933769162"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00F0FF] hover:underline"
                            >
                              Open Pinned Post ↗
                            </a>
                          </div>
                          <button
                            onClick={() => handleVerifyTask('commentVoidDrillersTweet')}
                            disabled={
                              socialTasks.commentVoidDrillersTweet ||
                              verifyingTask === 'commentVoidDrillersTweet'
                            }
                            className={cn(
                              'w-full rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition-all',
                              socialTasks.commentVoidDrillersTweet
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20',
                            )}
                          >
                            {socialTasks.commentVoidDrillersTweet
                              ? 'Completed'
                              : verifyingTask === 'commentVoidDrillersTweet'
                              ? 'Verifying...'
                              : 'Verify & Claim (+25 Gems)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {socialSubTab === 'farcaster' && (
                      <div className="flex flex-col gap-4 rounded-2xl border border-[#00F0FF]/30 bg-black/70 px-4 py-3 text-[11px]">
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">
                                1. Follow maliotsol on Farcaster
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-[220px]">
                                Open our Farcaster profile and follow to support VoidDrillersX content.
                              </span>
                            </div>
                            <a
                              href="https://farcaster.xyz/maliotsol"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00F0FF] hover:underline"
                            >
                              Open Profile ↗
                            </a>
                          </div>
                          <button
                            onClick={() => handleVerifyTask('followFarcasterProfile')}
                            disabled={
                              socialTasks.followFarcasterProfile ||
                              verifyingTask === 'followFarcasterProfile'
                            }
                            className={cn(
                              'w-full rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition-all',
                              socialTasks.followFarcasterProfile
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20',
                            )}
                          >
                            {socialTasks.followFarcasterProfile
                              ? 'Completed'
                              : verifyingTask === 'followFarcasterProfile'
                              ? 'Verifying...'
                              : 'Verify & Claim (+25 Gems)'}
                          </button>
                        </div>

                        <div className="h-px w-full bg-[#00F0FF]/10" />

                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[11px] font-bold text-white">
                                2. Cast about VoidDrillersX
                              </span>
                              <span className="text-[10px] text-gray-400 max-w-[220px]">
                                Share a cast with your score and VoidDrillersX tags from your Farcaster account.
                              </span>
                            </div>
                            <a
                              href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
                                shareScoreText,
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#00F0FF] hover:underline"
                            >
                              Open Cast Composer ↗
                            </a>
                          </div>
                          <button
                            onClick={() => handleVerifyTask('castFarcasterGame')}
                            disabled={
                              socialTasks.castFarcasterGame ||
                              verifyingTask === 'castFarcasterGame'
                            }
                            className={cn(
                              'w-full rounded-lg border py-2 text-[10px] font-bold uppercase tracking-wide transition-all',
                              socialTasks.castFarcasterGame
                                ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                                : 'border-[#00F0FF] bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20',
                            )}
                          >
                            {socialTasks.castFarcasterGame
                              ? 'Completed'
                              : verifyingTask === 'castFarcasterGame'
                              ? 'Verifying...'
                              : 'Verify & Claim (+25 Gems)'}
                          </button>
                        </div>
                      </div>
                    )}

                    {socialSubTab === 'base' && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-[#00F0FF]/30 bg-black/70 px-4 py-3 text-[11px]">
                        <span className="font-orbitron text-sm text-white">
                          Base Mini App Tasks
                        </span>
                        <p className="text-[10px] text-gray-400">
                          Required actions for Base mini app (open, pin, complete first
                          run). All will be verified with the same tiny Base transaction
                          flow.
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Design matches Twitter tasks so everything feels like one clean
                          quest system.
                        </p>
                      </div>
                    )}

                    {socialSubTab === 'base' && (
                      <div className="flex flex-col gap-3 rounded-2xl border border-[#00F0FF]/30 bg-black/70 px-4 py-3 text-[11px]">
                        <span className="font-orbitron text-sm text-white">
                          Base Mini App Tasks
                        </span>
                        <p className="text-[10px] text-gray-400">
                          Required actions for Base mini app (open, pin, complete first
                          run). All will be verified with the same tiny Base transaction
                          flow.
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Design matches Twitter tasks so everything feels like one clean
                          quest system.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {moreSubTab === 'roadmap' && (
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => setMoreSubTab('main')}
                        className="rounded-full border border-[#00F0FF]/40 bg-black/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#00F0FF] hover:bg-[#00F0FF]/10 active:scale-95"
                      >
                        Back
                      </button>
                      <div className="flex flex-col items-end text-[10px] text-gray-400">
                        <span className="uppercase tracking-wide">Future Coin</span>
                        <span className="text-[9px] text-gray-500">
                          Mini whitepaper · work-in-progress
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 rounded-2xl border border-[#00F0FF]/25 bg-black/70 px-4 py-3 text-[11px]">
                      <div>
                        <span className="font-orbitron text-sm text-white">
                          What is the Future Coin?
                        </span>
                        <p className="mt-1 text-[10px] text-gray-400">
                          VoidDrillersX will later launch a token aligned with the miner game. The
                          goal is to reward real players who mine, complete quests and support the
                          project on Base and Farcaster.
                        </p>
                      </div>

                      <div className="h-px w-full bg-[#00F0FF]/10" />

                      <div>
                        <span className="font-orbitron text-sm text-white">
                          How your score matters
                        </span>
                        <p className="mt-1 text-[10px] text-gray-400">
                          Your total net worth, unlocked planets and verified social tasks will act
                          as core signals for future $VDR-style allocations, boosts and allowlists.
                          Top miners and early social supporters should expect the best spots.
                        </p>
                      </div>

                      <div className="h-px w-full bg-[#00F0FF]/10" />

                      <div>
                        <span className="font-orbitron text-sm text-white">
                          Join the X community
                        </span>
                        <p className="mt-1 text-[10px] text-gray-400">
                          All official announcements will go through our X profile and community.
                          Follow and join to stay ahead of drops and governance polls.
                        </p>
                        <div className="mt-2 flex flex-col gap-1 text-[10px]">
                          <a
                            href="https://x.com/VoidDrillersX"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00F0FF] hover:underline"
                          >
                            Follow @VoidDrillersX on X ↗
                          </a>
                          <a
                            href="https://x.com/i/communities/2012696088206008673"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00F0FF] hover:underline"
                          >
                            Join VoidDrillersX X Community ↗
                          </a>
                        </div>
                      </div>

                      <div className="h-px w-full bg-[#00F0FF]/10" />

                      <div>
                        <span className="font-orbitron text-sm text-white">
                          Not a promise, but a direction
                        </span>
                        <p className="mt-1 text-[10px] text-gray-500">
                          This is a roadmap, not financial advice. The exact tokenomics and
                          launch details can change. Grinding the game and being active in the
                          community just puts you in the strongest position for whatever comes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Dock */}
        <BottomDock activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </main>
  );
}
