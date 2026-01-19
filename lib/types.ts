export type ResourceType = 'ore' | 'tlm' | 'gems';

export interface Manager {
  id: string;
  name: string;
  type: 'Junior' | 'Senior' | 'Executive';
  effect: 'speed' | 'cost' | 'auto';
  multiplier: number;
  cooldown: number; // in seconds
  activeDuration: number; // in seconds
  isAssigned: boolean;
  assignedTo?: string;
  lastUsed: number; // timestamp
}

export interface Shaft {
  id: number;
  level: number;
  miningSpeed: number; // production rate (ore/sec)
  workerCount: number;
  cost: number;
  managerId?: string;
  unlocked: boolean;
  boostMultiplier?: number;
  boostExpiresAt?: number;
}

export interface Elevator {
  level: number;
  loadCapacity: number;
  movementSpeed: number; // movements per minute?
  throughput: number; // calculated ore/sec
  cost: number;
  managerId?: string;
}

export interface Warehouse {
  level: number;
  transporterCount: number;
  loadCapacity: number;
  loadingSpeed: number;
  throughput: number; // calculated ore/sec
  cost: number;
  managerId?: string;
}

export interface Planet {
  id: string;
  name: 'Base World' | 'Farcaster World' | 'X-Miners World' | 'Satoshi World' | 'VoidDrillersX';
  unlockCost: number; // Net Worth needed
  description: string;
  color: string;
  multiplier: number; // Production multiplier for this planet
}

export interface MinerSkin {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
  multiplier: number;
  priceUsd: number;
  priceGameAssets: number;
}

export interface GameState {
  tlm: number;
  netWorth: number;
  gems: number;
  globalMultiplier: number;
  globalBoostExpiresAt: number | null;
  hasExecutivePass: boolean;
  farcasterUser: {
    fid: number;
    username: string;
    pfpUrl: string;
  } | null;
  isVerified: boolean;
  primaryAddress: string | null;
  customName: string | null;
  selectedMiner: string;

  currentRank: number | null;

  minerSkins: MinerSkin[];
  ownedSkinIds: string[];
  equippedSkinId: string | null;

  shafts: Shaft[];
  elevator: Elevator;
  warehouse: Warehouse;

  managers: Manager[];

  currentPlanet: string;
  unlockedPlanets: string[];
  lastSaveTime: number;
  productionRate: number;
  bottleneck: 'shafts' | 'elevator' | 'warehouse' | null;
  socialTasks: {
    followVoidDrillersX: boolean;
    shareGrokTweet: boolean;
    commentVoidDrillersTweet: boolean;
    followFarcasterProfile: boolean;
    castFarcasterGame: boolean;
  };
}
