"use client";

import { useState, useEffect } from 'react';
import sdk, { type Context } from '@farcaster/frame-sdk';

export interface UserIdentity {
  fid: number;
  username: string;
  pfpUrl: string;
  isAuthenticated: boolean;
}

export function useFarcasterIdentity() {
  const [identity, setIdentity] = useState<UserIdentity>({
    fid: 0,
    username: 'Guest',
    pfpUrl: '',
    isAuthenticated: false,
  });

  useEffect(() => {
    const loadContext = async () => {
      try {
        const context = await sdk.context;
        if (context?.user) {
          setIdentity({
            fid: context.user.fid,
            username: context.user.username || `User ${context.user.fid}`,
            pfpUrl: context.user.pfpUrl || '',
            isAuthenticated: true,
          });
        }
      } catch (e) {
        console.warn("Could not load Farcaster context:", e);
      }
    };

    loadContext();
  }, []);

  return identity;
}
