"use client";

import { useState, useEffect } from 'react';
import { useFarcasterIdentity } from '@/hooks/useFarcasterIdentity';
import { useGameStore } from '@/lib/store';
import { vibrate, HAPTIC_PATTERNS } from '@/lib/haptics';
import { SignInGate } from './SignInGate';
import { Leaderboard } from './Leaderboard';
import { Trophy, Medal, User, Zap, Wallet, Loader2, CheckCircle2, ShieldCheck, Shirt, Pickaxe } from 'lucide-react';
import { useAccount, useConnect, useSendTransaction, useDisconnect, useWaitForTransactionReceipt } from 'wagmi';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { parseEther } from 'ethers';

const REGISTRATION_ADDRESS = "0x980E5F15E788Cb653C77781099Fb739d7A1aEEd0";

import { supabase } from '@/lib/supabase';

function getVerificationAmountWei() {
  return parseEther("0.00012");
}

function getSignInFeeAmountWei() {
  return parseEther("0.00003");
}

export function Profile() {
  const identity = useFarcasterIdentity();
  const {
    netWorth,
    hasExecutivePass,
    farcasterUser,
    isVerified,
    primaryAddress,
    currentRank,
    setFarcasterUser,
    setVerified,
    setPrimaryAddress,
    setCurrentRank,
    setCustomName: setStoreCustomName,
    setSelectedMiner: setStoreSelectedMiner,
    customName: storeCustomName,
    selectedMiner: storeSelectedMiner,
  } = useGameStore();

  useEffect(() => {
    if (storeCustomName) setCustomName(storeCustomName);
    if (storeSelectedMiner) setSelectedMiner(storeSelectedMiner);
  }, [storeCustomName, storeSelectedMiner]);

  useEffect(() => {
    if (!supabase || !isVerified) return;
  }, [isVerified]);
  
  const { address, isConnected } = useAccount();
  const { connectors, connectAsync } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: verificationTxHash, sendTransactionAsync } = useSendTransaction();
  const { isLoading: isWaitingForTx, isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({
    hash: verificationTxHash,
  });

  const [activeTab, setActiveTab] = useState<'identity' | 'collection' | 'leaderboard'>('identity');
  const [customName, setCustomName] = useState('');
  const [selectedMiner, setSelectedMiner] = useState('default');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [isPayingSignIn, setIsPayingSignIn] = useState(false);

  useEffect(() => {
    if (isTxConfirmed && verificationTxHash) {
      const finalizeVerification = async () => {
        setIsVerifying(false);
        setVerified(true);
        vibrate(HAPTIC_PATTERNS.SUCCESS);

        if (supabase && (farcasterUser || primaryAddress)) {
          try {
            const normalizedAddress =
              primaryAddress != null ? primaryAddress.toLowerCase() : null;

            const payload = {
              fid: farcasterUser?.fid ?? null,
              address: normalizedAddress,
              username:
                customName ||
                farcasterUser?.username ||
                (primaryAddress ? `Miner ${primaryAddress.slice(0, 6)}` : null),
              pfp_url: farcasterUser?.pfpUrl ?? null,
              net_worth: netWorth,
              last_updated: new Date().toISOString(),
            };

            const identityFilter =
              normalizedAddress != null
                ? { address: normalizedAddress }
                : farcasterUser?.fid != null
                ? { fid: farcasterUser.fid }
                : null;

            if (identityFilter) {
              const { data: existing, error: fetchError } = await supabase
                .from('player_rankings')
                .select('fid, address')
                .match(identityFilter)
                .maybeSingle();

              if (fetchError) {
                console.error('Error checking existing leaderboard row during verification:', fetchError);
              }

              if (existing) {
                await supabase
                  .from('player_rankings')
                  .update(payload)
                  .match(identityFilter);
              } else {
                await supabase.from('player_rankings').insert(payload);
              }
            }

            const { count, error } = await supabase
              .from('player_rankings')
              .select('*', { count: 'exact', head: true })
              .gt('net_worth', netWorth);

            if (!error && count !== null) {
              setCurrentRank(count + 1);
            }
          } catch (e) {
            console.error('Failed to sync verification or compute rank', e);
          }
        }
      };
      finalizeVerification();
    }
  }, [
    isTxConfirmed,
    verificationTxHash,
    setVerified,
    setCurrentRank,
    farcasterUser,
    primaryAddress,
    customName,
    netWorth,
  ]);

  const currentStyle = selectedMiner || storeSelectedMiner || 'default';

  const avatarBorderClass =
    currentStyle === 'cyberpunk'
      ? 'border-[#FF00F0]'
      : currentStyle === 'mech'
      ? 'border-[#FFD700]'
      : 'border-[#00F0FF]';

  useEffect(() => {
    if (identity.isAuthenticated && !farcasterUser) {
      setFarcasterUser({
        fid: identity.fid,
        username: identity.username,
        pfpUrl: identity.pfpUrl,
      });
    }
  }, [identity, farcasterUser, setFarcasterUser]);

  useEffect(() => {
    if (address && address !== primaryAddress) {
      setPrimaryAddress(address);
    }
    if (!address && primaryAddress) {
      setPrimaryAddress(null);
    }
  }, [address, primaryAddress, setPrimaryAddress]);

  const connectWith = async (matcher: (id: string, name: string) => boolean, label: string) => {
    setWalletError(null);
    const connector = connectors.find(c => matcher(c.id, c.name));
    if (!connector) {
      setWalletError(`${label} not available in this environment`);
      return;
    }
    try {
      await connectAsync({ connector });
    } catch (e) {
      setWalletError(`${label} connection failed`);
    }
  };

  const paySignInFee = async (label: string) => {
    try {
      setIsPayingSignIn(true);
      await sendTransactionAsync({
        to: REGISTRATION_ADDRESS,
        value: getSignInFeeAmountWei(),
      });
    } catch (e) {
      console.error(e);
      setWalletError(`${label} sign-in fee failed`);
    } finally {
      setIsPayingSignIn(false);
    }
  };

  const handleConnectBaseWallet = async () => {
    setWalletError(null);
    // STRICT: Base Wallet only uses Coinbase Wallet connector
    const coinbase = connectors.find(c => c.id.toLowerCase().includes('coinbase') || c.name.toLowerCase().includes('coinbase'));
    
    if (coinbase) {
        await connectAsync({ connector: coinbase }).catch((e) => {
             console.error("Coinbase connection failed", e);
             setWalletError("Base Wallet connection failed");
        });
    } else {
        setWalletError("Base Wallet not available");
    }
    
    if (!walletError) {
      await paySignInFee('Base wallet');
    }
  };

  const handleSyncWarpcast = async () => {
    // Disconnect wallet first to prevent auto-connect loops (e.g. MetaMask popping up on reload)
    // This ensures we start fresh with just Farcaster identity
    if (isConnected) {
      try {
        await disconnect();
      } catch (e) {
        console.error("Failed to disconnect before sync:", e);
      }
    }
    // Just reload to sync Farcaster context/UI
    window.location.reload();
  };

  const handleConnectMetaMask = async () => {
    setWalletError(null);
    await connectWith(
      (id, name) =>
        id.toLowerCase().includes('injected') ||
        name.toLowerCase().includes('metamask'),
      'MetaMask',
    );
    if (!walletError) {
      await paySignInFee('MetaMask');
    }
  };

  const handleConnectWalletConnect = async () => {
    setWalletError(null);
    await connectWith(
      (id, name) =>
        id.toLowerCase().includes('walletconnect') ||
        name.toLowerCase().includes('walletconnect'),
      'WalletConnect',
    );
    if (!walletError) {
      await paySignInFee('WalletConnect');
    }
  };

  const handleVerifyProfile = async () => {
    if (isVerifying || isWaitingForTx) return;
    setWalletError(null);
    setIsVerifying(true);
    try {
      await sendTransactionAsync({
        to: REGISTRATION_ADDRESS,
        value: getVerificationAmountWei(),
      });
    } catch (e) {
      console.error(e);
      setWalletError('Verification transaction failed');
      vibrate(HAPTIC_PATTERNS.ERROR);
      setIsVerifying(false);
    }
  };

  const handleSaveCustomization = async () => {
    if (!isVerified) return;
    setIsSaving(true);
    try {
      setStoreCustomName(customName);
      setStoreSelectedMiner(selectedMiner);
      vibrate(HAPTIC_PATTERNS.SUCCESS);
      if (supabase && (farcasterUser || primaryAddress)) {
        try {
          const normalizedAddress =
            primaryAddress != null ? primaryAddress.toLowerCase() : null;

          const payload = {
            fid: farcasterUser?.fid ?? null,
            address: normalizedAddress,
            username:
              customName ||
              farcasterUser?.username ||
              (primaryAddress ? `Miner ${primaryAddress.slice(0, 6)}` : null),
            pfp_url: farcasterUser?.pfpUrl ?? null,
            net_worth: netWorth,
            last_updated: new Date().toISOString(),
          };

          const identityFilter =
            normalizedAddress != null
              ? { address: normalizedAddress }
              : farcasterUser?.fid != null
              ? { fid: farcasterUser.fid }
              : null;

          if (identityFilter) {
            const { data: existing, error: fetchError } = await supabase
              .from('player_rankings')
              .select('fid, address')
              .match(identityFilter)
              .maybeSingle();

            if (fetchError) {
              console.error('Error checking existing leaderboard row during customization save:', fetchError);
            }

            if (existing) {
              await supabase
                .from('player_rankings')
                .update(payload)
                .match(identityFilter);
            } else {
              await supabase.from('player_rankings').insert(payload);
            }
          }
        } catch {}
      }
    } catch (e) {
      vibrate(HAPTIC_PATTERNS.ERROR);
    } finally {
      setIsSaving(false);
    }
  };

  const displayName = customName || farcasterUser?.username || 'Guest Pilot';
  const displayPfp = farcasterUser?.pfpUrl;

  return (
    <SignInGate>
      <div className="flex h-full flex-col p-4 pb-24 space-y-4 overflow-y-auto scrollbar-hide">
        
        {/* Tabs */}
        <div className="flex gap-2 rounded-lg bg-black/20 p-1 shrink-0">
          <button
            onClick={() => setActiveTab('identity')}
            className={cn(
              "flex-1 rounded py-2 text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'identity' 
                ? "bg-[#00F0FF]/20 text-[#00F0FF]" 
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Identity
          </button>
          <button
            onClick={() => setActiveTab('collection')}
            className={cn(
              "flex-1 rounded py-2 text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'collection' 
                ? "bg-[#00F0FF]/20 text-[#00F0FF]" 
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Collection
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "flex-1 rounded py-2 text-xs font-bold uppercase tracking-wider transition-all",
              activeTab === 'leaderboard' 
                ? "bg-[#00F0FF]/20 text-[#00F0FF]" 
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            Rank
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeTab === 'leaderboard' ? (
             <Leaderboard />
          ) : (
            <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
              {/* Profile Card - Only show in Identity/Collection to save space in Leaderboard */}
              <div className="relative flex flex-col items-center justify-center rounded-xl border border-[#00F0FF]/20 bg-[#162044] p-6 overflow-hidden shrink-0">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                {/* Avatar */}
                <div className="relative mb-4">
                  <div className={cn("h-24 w-24 overflow-hidden rounded-full border-2 bg-black shadow-[0_0_20px_rgba(0,240,255,0.3)]", avatarBorderClass)}>
                    {displayPfp ? (
                      <img src={displayPfp} alt="PFP" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-800">
                        <User className="h-10 w-10 text-gray-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Status Badges */}
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                    {isVerified && (
                      <div className="rounded-full border-2 border-[#162044] bg-[#00F0FF] p-1.5 text-black" title="Verified Legend">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                    )}
                    {hasExecutivePass && (
                      <div className="rounded-full border-2 border-[#162044] bg-[#FFD700] p-1.5 text-black shadow-[0_0_15px_rgba(255,215,0,0.6)] animate-pulse" title="Executive Pass">
                        <Trophy className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <h2 className="font-orbitron text-xl font-bold text-white">{displayName}</h2>
                    {isVerified && <CheckCircle2 className="h-4 w-4 text-[#00F0FF]" />}
                  </div>
                  <span className="text-xs text-[#00F0FF]/60 font-mono">
                    {isVerified 
                      ? (farcasterUser ? `Verified • FID: ${farcasterUser.fid}` : 'Verified ID')
                      : (farcasterUser ? `FID: ${farcasterUser.fid}` : 'UNREGISTERED ID')
                    }
                  </span>
                </div>

                <div className="mt-4 w-full space-y-3">
                  <div className="flex flex-col gap-2">
                    <div className="text-[10px] font-semibold text-gray-300 uppercase tracking-wide">
                      Connect Identity
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleConnectBaseWallet}
                        disabled={isPayingSignIn}
                        className="flex-1 min-w-[90px] rounded bg-[#0052FF] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#1D4ED8]"
                      >
                        Base Wallet
                      </button>
                      <button
                        onClick={handleConnectMetaMask}
                        disabled={isPayingSignIn}
                        className="flex-1 min-w-[90px] rounded bg-[#F6851B] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#E2761B]"
                      >
                        MetaMask
                      </button>
                      <button
                        onClick={handleConnectWalletConnect}
                        disabled={isPayingSignIn}
                        className="flex-1 min-w-[90px] rounded bg-[#3B82F6] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#2563EB]"
                      >
                        WalletConnect
                      </button>
                      <button
                        onClick={handleSyncWarpcast}
                        className="flex-1 min-w-[90px] rounded bg-[#7C65C1] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#6952A3]"
                      >
                        Sync Warpcast
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span>
                        {isConnected && primaryAddress
                          ? `Connected: ${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
                          : isConnected
                          ? 'Wallet connected'
                          : 'No wallet connected'}
                      </span>
                      {isConnected && (
                        <button
                          onClick={() => disconnect()}
                          className="ml-2 text-[10px] text-red-500 hover:text-red-400"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>
                    {walletError && (
                      <div className="text-[10px] text-[#FF4444]">
                        {walletError}
                      </div>
                    )}
                  </div>
                  {!isVerified ? (
                    <button
                      onClick={handleVerifyProfile}
                      disabled={isVerifying || isWaitingForTx || (!isConnected && !farcasterUser)}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 rounded bg-[#00F0FF] py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#00F0FF]/80 disabled:opacity-50"
                      )}
                    >
                      {isVerifying || isWaitingForTx ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> {isWaitingForTx ? "Confirming..." : "Verifying"}
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="h-4 w-4" /> Verify & Join Leaderboard (~$0.35)
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="w-full rounded bg-[#00F0FF]/10 py-2 text-center text-[11px] font-bold text-[#00F0FF]">
                      Verified for Global Rank
                    </div>
                  )}
                </div>
              </div>

              {activeTab === 'identity' ? (
                <div className="space-y-4">
                  {/* Custom Identity Settings - Only for Verified */}
                  <div className={cn(
                    "rounded-lg border border-white/10 bg-white/5 p-4",
                    !isVerified && "opacity-50 pointer-events-none grayscale"
                  )}>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="font-orbitron text-sm font-bold text-white">Custom Miner Identity</h3>
                      {!isVerified && <span className="text-[10px] text-[#FF4444] font-bold">VERIFICATION REQUIRED</span>}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-gray-500">Display Name</label>
                        <input 
                          type="text" 
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          placeholder={displayName}
                          className="w-full rounded border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-[#00F0FF] focus:outline-none"
                        />
                      </div>
                      
                      <div>
                        <label className="mb-1 block text-[10px] uppercase text-gray-500">Avatar Style</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['default', 'cyberpunk', 'mech'].map((style) => (
                            <button
                              key={style}
                              onClick={() => setSelectedMiner(style)}
                              className={cn(
                                "flex flex-col items-center gap-1 rounded border p-2 transition-all",
                                selectedMiner === style 
                                  ? "border-[#00F0FF] bg-[#00F0FF]/10" 
                                  : "border-white/10 bg-black/20 hover:bg-white/5"
                              )}
                            >
                              <div
                                className={cn(
                                  "h-8 w-8 rounded",
                                  style === 'default' && "bg-gray-700",
                                  style === 'cyberpunk' && "bg-gradient-to-br from-pink-500 to-cyan-400",
                                  style === 'mech' && "bg-gradient-to-br from-yellow-400 to-gray-700",
                                )}
                              />
                              <span className="text-[10px] capitalize text-gray-400">{style}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={handleSaveCustomization}
                        disabled={!isVerified || isSaving}
                        className={cn(
                          "w-full flex items-center justify-center gap-2 rounded bg-[#00F0FF] py-2 text-sm font-bold text-black shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#00F0FF]/80 disabled:opacity-50 mt-4"
                        )}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> Save Customization
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-4">
                      <span className="mb-1 text-xs text-gray-400">Net Worth</span>
                      <div className="flex items-center gap-1 text-[#00F0FF]">
                        <Wallet className="h-4 w-4" />
                        <span className="font-orbitron text-sm font-bold">
                          ${formatNumber(netWorth)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 p-4">
                      <span className="mb-1 text-xs text-gray-400">Global Rank</span>
                      <div className="flex items-center gap-1 text-[#FFD700]">
                        <Trophy className="h-4 w-4" />
                        <span className="font-orbitron text-sm font-bold">
                          {currentRank ? `#${currentRank}` : 'Unranked'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {/* Collection Grid Mockup */}
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded border border-white/10 bg-white/5 p-2 flex items-center justify-center relative group">
                      {i === 0 ? (
                        <div className="text-center">
                          <Pickaxe className="mx-auto mb-1 h-6 w-6 text-[#00F0FF]" />
                          <span className="text-[10px] text-gray-400">Starter</span>
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded bg-white/5" />
                      )}
                      {i > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px]">
                          <span className="text-[10px] text-gray-500">LOCKED</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </SignInGate>
  );
}
