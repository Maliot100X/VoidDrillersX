import { Planet, MinerSkin } from './types';

export const INITIAL_SHAFT_COST = 100;
export const INITIAL_ELEVATOR_COST = 500;
export const INITIAL_WAREHOUSE_COST = 1000;

export const COST_GROWTH_FACTOR = 1.7;
export const PRODUCTION_GROWTH_FACTOR = 1.3;

export const PLANETS: Planet[] = [
  {
    id: 'base_world',
    name: 'Base World',
    unlockCost: 0,
    description: 'Starter mine on a neon-blue industrial hub.',
    color: '#00BFFF',
    multiplier: 1,
  },
  {
    id: 'farcaster_world',
    name: 'Farcaster World',
    unlockCost: 1_000_000,
    description: 'Purple signal beacons and white data towers shimmer in orbit.',
    color: '#A855F7',
    multiplier: 2,
  },
  {
    id: 'x_miners_world',
    name: 'X-Miners World',
    unlockCost: 50_000_000,
    description: 'Black steel caverns filled with silver mechs and drones.',
    color: '#9CA3AF',
    multiplier: 4,
  },
  {
    id: 'satoshi_world',
    name: 'Satoshi World',
    unlockCost: 500_000_000,
    description: 'Golden BTC citadels and orange plasma vents light the mines.',
    color: '#F59E0B',
    multiplier: 8,
  },
  {
    id: 'voiddrillers_world',
    name: 'VoidDrillersX',
    unlockCost: 0,
    description: '🚀 Coming Soon: VoidDrillersX | $VDR – free-earning Base + Farcaster mini app.',
    color: '#38BDF8',
    multiplier: 1,
  },
];

export const MANAGERS_DATA = [
  {
    id: 'junior_1',
    name: 'Junior Miner',
    type: 'Junior',
    effect: 'speed',
    multiplier: 2,
    cooldown: 300,
    activeDuration: 30,
  },
  {
    id: 'senior_1',
    name: 'Senior Executive',
    type: 'Senior',
    effect: 'cost',
    multiplier: 0.1,
    cooldown: 600,
    activeDuration: 60,
  },
  {
    id: 'executive_1',
    name: 'Executive Overlord',
    type: 'Executive',
    effect: 'auto',
    multiplier: 1.5,
    cooldown: 900,
    activeDuration: 120,
  },
] as const;

export const MINER_SKINS: MinerSkin[] = [
  {
    id: 'skin_neon_driller',
    name: 'Neon Driller',
    rarity: 'common',
    multiplier: 3,
    priceUsd: 0.2,
    priceGameAssets: 2_000_000,
  },
  {
    id: 'skin_cyber_rig',
    name: 'Cyber Rig',
    rarity: 'rare',
    multiplier: 4,
    priceUsd: 0.4,
    priceGameAssets: 4_000_000,
  },
  {
    id: 'skin_quantum_extractor',
    name: 'Quantum Extractor',
    rarity: 'rare',
    multiplier: 6,
    priceUsd: 0.6,
    priceGameAssets: 6_000_000,
  },
  {
    id: 'skin_mech_overlord',
    name: 'Mech Overlord',
    rarity: 'epic',
    multiplier: 8,
    priceUsd: 0.8,
    priceGameAssets: 8_000_000,
  },
  {
    id: 'skin_astro_forge',
    name: 'Astro Forge',
    rarity: 'epic',
    multiplier: 10,
    priceUsd: 1.0,
    priceGameAssets: 10_000_000,
  },
  {
    id: 'skin_dark_matter_rig',
    name: 'Dark Matter Rig',
    rarity: 'legendary',
    multiplier: 12,
    priceUsd: 1.2,
    priceGameAssets: 12_000_000,
  },
  {
    id: 'skin_cyberpunk_slicer',
    name: 'Cyberpunk Slicer',
    rarity: 'legendary',
    multiplier: 14,
    priceUsd: 1.4,
    priceGameAssets: 14_000_000,
  },
  {
    id: 'skin_plasma_core',
    name: 'Plasma Core Drill',
    rarity: 'legendary',
    multiplier: 18,
    priceUsd: 1.6,
    priceGameAssets: 16_000_000,
  },
  {
    id: 'skin_satoshi_comet',
    name: 'Satoshi Comet',
    rarity: 'mythic',
    multiplier: 22,
    priceUsd: 1.8,
    priceGameAssets: 18_000_000,
  },
  {
    id: 'skin_satoshi_rocket',
    name: 'Satoshi Rocket',
    rarity: 'mythic',
    multiplier: 28,
    priceUsd: 2.0,
    priceGameAssets: 20_000_000,
  },
];
