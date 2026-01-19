
import { useEffect } from 'react';
import { useGameStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';

export function useLeaderboardSync() {
  const { netWorth, farcasterUser, isVerified, primaryAddress, customName } = useGameStore();

  useEffect(() => {
    if (!supabase || !isVerified || (!farcasterUser && !primaryAddress)) return;

    const syncData = async () => {
      try {
        if (!supabase) return;

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

        if (!identityFilter) return;

        const { data: existing, error: fetchError } = await supabase
          .from('player_rankings')
          .select('fid, address')
          .match(identityFilter)
          .maybeSingle();

        if (fetchError) {
          console.error('Error checking existing leaderboard row:', fetchError);
        }

        if (existing) {
          await supabase
            .from('player_rankings')
            .update(payload)
            .match(identityFilter);
        } else {
          await supabase.from('player_rankings').insert(payload);
        }
      } catch (e) {
        console.error('Error syncing leaderboard:', e);
      }
    };

    syncData();

    const interval = setInterval(syncData, 60 * 1000);

    return () => clearInterval(interval);
  }, [netWorth, farcasterUser, isVerified, primaryAddress, customName]);
}
