"use client";

import { useState, useEffect, useMemo } from 'react';
import { useGameStore } from '@/lib/store';
import { Trophy, RefreshCw, ShieldCheck, Medal, Crown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';

type LeaderboardRow = {
  fid: number | null;
  address: string | null;
  username: string | null;
  pfp_url: string | null;
  net_worth: number;
};

export function Leaderboard() {
  const netWorth = useGameStore(state => state.netWorth);
  const farcasterUser = useGameStore(state => state.farcasterUser);
  const primaryAddress = useGameStore(state => state.primaryAddress);
  const isVerified = useGameStore(state => state.isVerified);
  const hasExecutivePass = useGameStore(state => state.hasExecutivePass);
  const currentRank = useGameStore(state => state.currentRank);
  const setCurrentRank = useGameStore(state => state.setCurrentRank);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    const getNextReset = () => {
      const now = new Date();
      const year = now.getUTCFullYear();
      const month = now.getUTCMonth();
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      return new Date(Date.UTC(nextYear, nextMonth, 1, 0, 0, 0));
    };

    const updateCountdown = () => {
      const now = new Date();
      const target = getNextReset();
      const diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        setCountdown('0d 0h 0m');
        return;
      }
      const totalMinutes = Math.floor(diffMs / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
      const minutes = totalMinutes % 60;
      setCountdown(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    const client = supabase;

    const fetchData = async () => {
      setIsRefreshing(true);
      const { data, error } = await client
        .from('player_rankings')
        .select('*')
        .not('address', 'is', null)
        .order('net_worth', { ascending: false })
        .limit(100);
      
      if (!error && data) {
        setLeaderboardData(data as LeaderboardRow[]);
      }

      // If verified but not in top 100, fetch specific rank
      if (isVerified && (farcasterUser || primaryAddress) && data) {
        const inTop100 = data.some(entry => 
          (farcasterUser && entry.fid === farcasterUser.fid) ||
          (primaryAddress &&
            entry.address &&
            entry.address.toLowerCase() === primaryAddress.toLowerCase())
        );

        if (!inTop100) {
           const { count, error: countError } = await client
             .from('player_rankings')
             .select('*', { count: 'exact', head: true })
             .gt('net_worth', netWorth);
           
           if (!countError && count !== null) {
              setCurrentRank(count + 1);
           }
        }
      }

      setIsRefreshing(false);
    };

    fetchData();

    const channel = client
      .channel('player_rankings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'player_rankings' }, () => {
        fetchData();
      })
      .subscribe();

    const interval = setInterval(fetchData, 600_000);

    return () => {
      client.removeChannel(channel);
      clearInterval(interval);
    };
  }, [isVerified, farcasterUser, primaryAddress, netWorth, setCurrentRank]);

  const handleRefresh = () => {
    if (!supabase) return;
    const client = supabase;
    setIsRefreshing(true);
    client
      .from('player_rankings')
      .select('*')
      .not('address', 'is', null)
      .order('net_worth', { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) {
          setLeaderboardData(data as LeaderboardRow[]);
        }
        setIsRefreshing(false);
      });
  };

  const combinedData = useMemo(() => {
    let base = [...leaderboardData];

    if (isVerified && (farcasterUser || primaryAddress)) {
      const existsIndex = base.findIndex(entry => {
        const byFid =
          farcasterUser && entry.fid && entry.fid === farcasterUser.fid;
        const byAddress =
          primaryAddress &&
          entry.address &&
          entry.address.toLowerCase() === primaryAddress.toLowerCase();
        return byFid || byAddress;
      });

      if (existsIndex === -1) {
        base.push({
          fid: farcasterUser?.fid ?? null,
          address: primaryAddress ?? null,
          username:
            farcasterUser?.username ||
            (primaryAddress
              ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
              : 'Guest'),
          pfp_url: farcasterUser?.pfpUrl ?? null,
          net_worth: netWorth,
        });
      }

      base = base.sort((a, b) => b.net_worth - a.net_worth);
    }

    return base;
  }, [leaderboardData, isVerified, farcasterUser, primaryAddress, netWorth]);

  const currentUserEntry = useMemo(() => {
    const index = combinedData.findIndex(entry => {
      const byFid =
        farcasterUser && entry.fid && entry.fid === farcasterUser.fid;
      const byAddress =
        primaryAddress &&
        entry.address &&
        entry.address.toLowerCase() === primaryAddress.toLowerCase();
      return byFid || byAddress;
    });
    
    // If found in combined data, use that index. Otherwise fallback to currentRank fetched separately
    const rank = index >= 0 ? index + 1 : currentRank;
    
    const username =
      farcasterUser?.username ||
      (primaryAddress
        ? `${primaryAddress.slice(0, 6)}...${primaryAddress.slice(-4)}`
        : 'Guest');
    return {
      rank,
      username,
      netWorth,
      isVerified,
      hasPass: hasExecutivePass,
      pfp: farcasterUser?.pfpUrl || null,
    };
  }, [combinedData, farcasterUser, primaryAddress, netWorth, isVerified, hasExecutivePass, currentRank]);

  useEffect(() => {
    if (currentRank !== currentUserEntry.rank) {
      setCurrentRank(currentUserEntry.rank ?? null);
    }
  }, [currentUserEntry.rank, currentRank, setCurrentRank]);

  const Row = ({ entry, index }: { entry: LeaderboardRow; index: number }) => {
    const rank = index + 1;
    const username =
      entry.username ||
      (entry.address
        ? `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`
        : 'Unknown');
    const isCurrent =
      currentUserEntry.rank != null && currentUserEntry.rank === rank;
    const showCrown = isCurrent && hasExecutivePass;

    return (
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border px-3 py-2 mr-1",
          rank <= 3 ? "border-[#FFD700]/30 bg-[#FFD700]/5" : "border-white/5 bg-white/5"
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded font-orbitron text-xs font-bold",
              rank === 1
                ? "bg-[#FFD700] text-black"
                : rank === 2
                ? "bg-[#C0C0C0] text-black"
                : rank === 3
                ? "bg-[#CD7F32] text-black"
                : "bg-white/10 text-gray-400"
            )}
          >
            {rank}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-black">
              {entry.pfp_url ? (
                <img src={entry.pfp_url} alt="PFP" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-gray-700 to-gray-900" />
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white flex items-center gap-1">
                {username}
                <ShieldCheck className="h-3 w-3 text-[#00F0FF]" />
                {showCrown && (
                  <Crown className="h-3 w-3 text-[#FFD700] fill-[#FFD700]" />
                )}
              </span>
              <span className="text-[10px] text-gray-400">Net Worth</span>
            </div>
          </div>
        </div>
        <span className="font-orbitron text-sm font-bold text-[#00F0FF]">
          ${formatNumber(entry.net_worth)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col p-4 pb-24 space-y-4 overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="font-orbitron text-xl font-bold text-white">Leaderboard</h2>
            {countdown && (
              <button
                type="button"
                className="rounded-full border border-[#00F0FF]/40 px-2 py-0.5 text-[10px] font-semibold text-[#00F0FF] hover:bg-[#00F0FF]/10"
              >
                Previous phase winners
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400">Monthly Airdrop Rank</p>
          {countdown && (
            <p className="text-[10px] text-[#00F0FF]">Resets in {countdown}</p>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className={cn(
            "rounded-full bg-white/5 p-2 hover:bg-white/10 transition-colors",
            isRefreshing && "animate-spin"
          )}
        >
          <RefreshCw className="h-4 w-4 text-[#00F0FF]" />
        </button>
      </div>

      {/* Prize Pool Banner */}
      <div className="relative overflow-hidden rounded-xl border border-[#FFD700]/30 bg-[linear-gradient(135deg,#1a1100_0%,#332200_100%)] p-4">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="relative z-10 flex justify-between items-center">
          <div className="flex flex-col gap-1">
            <span className="font-orbitron text-xs font-bold text-[#FFD700]">MONTHLY PRIZE POOL</span>
            <div className="flex items-end gap-1">
              <span className="text-2xl font-bold text-white">$50</span>
              <span className="mb-1 text-xs text-gray-300">USDC</span>
            </div>
          </div>
          <div className="flex gap-2">
             <div className="flex flex-col items-center">
                <Medal className="h-5 w-5 text-[#C0C0C0]" />
                <span className="text-[10px] font-bold text-white">$15</span>
             </div>
             <div className="flex flex-col items-center scale-110">
                <Trophy className="h-6 w-6 text-[#FFD700] drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
                <span className="text-xs font-bold text-white">$25</span>
             </div>
             <div className="flex flex-col items-center">
                <Medal className="h-5 w-5 text-[#CD7F32]" />
                <span className="text-[10px] font-bold text-white">$8</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2 pr-1">
        {combinedData.map((entry, index) => (
          <Row key={`${entry.fid ?? entry.address ?? index}`} entry={entry} index={index} />
        ))}
      </div>

      {/* User Rank (Sticky Bottom) */}
      <div className="sticky bottom-0 rounded-lg border border-[#00F0FF] bg-[#0B1026] p-3 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#00F0FF] font-orbitron text-xs font-bold text-black">
                {isVerified && currentUserEntry.rank ? currentUserEntry.rank : "-"}
              </div>
              <div className="flex items-center gap-2">
                 <div className="h-8 w-8 overflow-hidden rounded-full border border-[#00F0FF]">
                    {currentUserEntry.pfp ? (
                        <img src={currentUserEntry.pfp} alt="PFP" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-gray-800" />
                    )}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-sm font-bold text-white flex items-center gap-1">
                       {currentUserEntry.username} (You)
                       {isVerified && <ShieldCheck className="h-3 w-3 text-[#00F0FF]" />}
                       {currentUserEntry.hasPass && <Crown className="h-3 w-3 text-[#FFD700] fill-[#FFD700]" />}
                    </span>
                    {!isVerified && <span className="text-[10px] text-[#FF4444]">Not Verified</span>}
                 </div>
              </div>
           </div>
           <span className="font-orbitron text-sm font-bold text-[#00F0FF]">
              ${formatNumber(netWorth)}
           </span>
        </div>
      </div>

    </div>
  );
}
