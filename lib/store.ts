import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameState, Shaft, Manager } from './types';
import { INITIAL_SHAFT_COST, INITIAL_ELEVATOR_COST, INITIAL_WAREHOUSE_COST, COST_GROWTH_FACTOR, PRODUCTION_GROWTH_FACTOR, PLANETS, MINER_SKINS } from './constants';

type ManagerTemplate = Omit<Manager, 'isAssigned' | 'assignedTo' | 'lastUsed'>;

interface GameActions {
  tick: (dt: number) => void;
  upgradeShaft: (id: number) => void;
  upgradeElevator: () => void;
  upgradeWarehouse: () => void;
  hireWorker: (id: number) => void;
  unlockShaft: () => void;
  assignManager: (manager: ManagerTemplate, sectorId: string) => void;
  triggerManager: (managerId: string) => void;
  unlockPlanet: (planetId: string) => void;
  travelToPlanet: (planetId: string) => void;
  resetProgress: () => void; // Prestige/New Planet
  resume: () => number; // Returns offline earnings
  instantWarp: (seconds: number) => void;
  activateGlobalBoost: (multiplier: number, durationSeconds: number) => void;
  purchaseMegaDrill: (shaftId: number) => void;
  setHasExecutivePass: () => void;
  setFarcasterUser: (user: { fid: number; username: string; pfpUrl: string } | null) => void;
  setVerified: (status: boolean) => void;
  setPrimaryAddress: (address: string | null) => void;
  setCurrentRank: (rank: number | null) => void;
  setCustomName: (name: string | null) => void;
  setSelectedMiner: (miner: string) => void;
  mintSkin: (skinId: string) => void;
  equipSkin: (skinId: string | null) => void;
  buyBoost: (cost: number, multiplier: number, duration: number) => void;
  completeSocialTask: (
    taskId:
      | 'followVoidDrillersX'
      | 'shareGrokTweet'
      | 'commentVoidDrillersTweet'
      | 'followFarcasterProfile'
      | 'castFarcasterGame'
  ) => void;
}

const INITIAL_STATE: GameState = {
  tlm: 0,
  netWorth: 0,
  gems: 0,
  shafts: [
    { id: 1, level: 1, miningSpeed: 10, workerCount: 1, cost: INITIAL_SHAFT_COST, unlocked: true }
  ],
  elevator: {
    level: 1,
    loadCapacity: 50,
    movementSpeed: 10,
    throughput: 20, // Initial balance
    cost: INITIAL_ELEVATOR_COST
  },
  warehouse: {
    level: 1,
    transporterCount: 1,
    loadCapacity: 100,
    loadingSpeed: 10,
    throughput: 30, // Initial balance
    cost: INITIAL_WAREHOUSE_COST
  },
  managers: [],
  currentPlanet: 'base_world',
  unlockedPlanets: ['base_world', 'voiddrillers_world'],
  lastSaveTime: Date.now(),
  productionRate: 0,
  globalMultiplier: 1,
  globalBoostExpiresAt: null,
  bottleneck: null,
  hasExecutivePass: false,
  farcasterUser: null,
  isVerified: false,
  primaryAddress: null,
  customName: null,
  selectedMiner: 'default',
  currentRank: null,
  minerSkins: MINER_SKINS,
  ownedSkinIds: [],
  equippedSkinId: null,
  socialTasks: {
    followVoidDrillersX: false,
    shareGrokTweet: false,
    commentVoidDrillersTweet: false,
    followFarcasterProfile: false,
    castFarcasterGame: false,
  },
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...INITIAL_STATE,

      tick: (dt: number) => {
        const state = get();
        const now = Date.now();
        const planetMultiplier = PLANETS.find(p => p.id === state.currentPlanet)?.multiplier || 1;

        const getSectorMultiplier = (sectorId: string) => {
             const manager = state.managers.find(m => m.assignedTo === sectorId);
             if (!manager) return 1;

             let multiplier = 1;
             
             if (manager.type === 'Junior') multiplier *= 1.2;
             if (manager.type === 'Executive') multiplier *= 1.3;

             const isActive = (now - manager.lastUsed) < (manager.activeDuration * 1000);
             if (isActive && manager.effect === 'speed') {
                 multiplier *= manager.multiplier; // e.g. 3x or 10x
             }

             if (manager.effect === 'auto') {
                 multiplier *= manager.multiplier;
             }

             return multiplier;
        };

        const totalShaftProduction = state.shafts.reduce((acc, shaft) => {
          if (!shaft.unlocked) return acc;
          const shaftMult = getSectorMultiplier(`shaft_${shaft.id}`);
          const shaftBoost =
            shaft.boostExpiresAt && now < shaft.boostExpiresAt
              ? shaft.boostMultiplier || 1
              : 1;
          const workers = Math.max(1, shaft.workerCount);
          return acc + (shaft.level * workers * 10 * Math.pow(PRODUCTION_GROWTH_FACTOR, shaft.level - 1) * shaftMult * shaftBoost);
        }, 0);

        const elevatorMult = getSectorMultiplier('elevator');
        const elevatorThroughput = state.elevator.level * 20 * (Math.pow(PRODUCTION_GROWTH_FACTOR, state.elevator.level - 1)) * elevatorMult;

        const warehouseMult = getSectorMultiplier('warehouse');
        const warehouseThroughput = state.warehouse.level * 30 * (Math.pow(PRODUCTION_GROWTH_FACTOR, state.warehouse.level - 1)) * warehouseMult;

        const boostMultiplier =
          state.globalBoostExpiresAt && now < state.globalBoostExpiresAt
            ? state.globalMultiplier
            : 1;

        const rawMin = Math.min(totalShaftProduction, elevatorThroughput, warehouseThroughput);

        const skinMultiplier =
          state.equippedSkinId
            ? state.minerSkins.find(s => s.id === state.equippedSkinId)?.multiplier ?? 1
            : 1;

        let bottleneck: 'shafts' | 'elevator' | 'warehouse' | null = null;
        if (rawMin === totalShaftProduction && rawMin > 0) bottleneck = 'shafts';
        if (rawMin === elevatorThroughput && rawMin > 0) bottleneck = 'elevator';
        if (rawMin === warehouseThroughput && rawMin > 0) bottleneck = 'warehouse';

        // 0.9 factor to slightly reduce production rate as per user feedback
        const actualProduction = rawMin * planetMultiplier * boostMultiplier * skinMultiplier * 0.9;

        set({
          tlm: state.tlm + (actualProduction * dt),
          netWorth: state.netWorth + (actualProduction * dt),
          productionRate: actualProduction,
          lastSaveTime: Date.now(),
          bottleneck,
        });
      },

      upgradeShaft: (id) => {
        const state = get();
        const shaftIndex = state.shafts.findIndex(s => s.id === id);
        if (shaftIndex === -1) return;

        const shaft = state.shafts[shaftIndex];
        
        // Check Manager Discount
        const manager = state.managers.find(m => m.assignedTo === `shaft_${id}`);
        const now = Date.now();
        const isActive = manager && (now - manager.lastUsed) < (manager.activeDuration * 1000);
        const discount = (isActive && manager?.effect === 'cost') ? manager.multiplier : 1; // e.g. 0.5 for 50%
        
        const finalCost = shaft.cost * discount;

        if (state.tlm >= finalCost) {
          const newLevel = shaft.level + 1;
          const newCost = Math.floor(shaft.cost * COST_GROWTH_FACTOR);
          
          const newShafts = [...state.shafts];
          newShafts[shaftIndex] = {
            ...shaft,
            level: newLevel,
            cost: newCost,
            miningSpeed: shaft.miningSpeed * PRODUCTION_GROWTH_FACTOR // Simplified
          };

          set({
            tlm: state.tlm - finalCost,
            shafts: newShafts
          });
        }
      },

      upgradeElevator: () => {
        const state = get();
        
        // Check Manager Discount
        const manager = state.managers.find(m => m.assignedTo === 'elevator');
        const now = Date.now();
        const isActive = manager && (now - manager.lastUsed) < (manager.activeDuration * 1000);
        const discount = (isActive && manager?.effect === 'cost') ? manager.multiplier : 1;

        const finalCost = state.elevator.cost * discount;

        if (state.tlm >= finalCost) {
          set({
            tlm: state.tlm - finalCost,
            elevator: {
              ...state.elevator,
              level: state.elevator.level + 1,
              cost: Math.floor(state.elevator.cost * COST_GROWTH_FACTOR),
              throughput: state.elevator.throughput * PRODUCTION_GROWTH_FACTOR // Simplified
            }
          });
        }
      },

      upgradeWarehouse: () => {
        const state = get();

        const manager = state.managers.find(m => m.assignedTo === 'warehouse');
        const now = Date.now();
        const isActive = manager && (now - manager.lastUsed) < (manager.activeDuration * 1000);
        const discount = (isActive && manager?.effect === 'cost') ? manager.multiplier : 1;

        const finalCost = state.warehouse.cost * discount;

        if (state.tlm >= finalCost) {
          set({
            tlm: state.tlm - finalCost,
            warehouse: {
              ...state.warehouse,
              level: state.warehouse.level + 1,
              cost: Math.floor(state.warehouse.cost * COST_GROWTH_FACTOR),
              throughput: state.warehouse.throughput * PRODUCTION_GROWTH_FACTOR // Simplified
            }
          });
        }
      },

      hireWorker: (id) => {
        const state = get();
        const shaftIndex = state.shafts.findIndex(s => s.id === id);
        if (shaftIndex === -1) return;

        const shaft = state.shafts[shaftIndex];
        const baseCost = Math.pow(10, shaft.id) * 500;
        const hireCost = baseCost * Math.pow(1.5, shaft.workerCount);

        if (state.tlm < hireCost) return;

        const newShafts: Shaft[] = [...state.shafts];
        newShafts[shaftIndex] = {
          ...shaft,
          workerCount: shaft.workerCount + 1,
        };

        set({
          tlm: state.tlm - hireCost,
          shafts: newShafts,
        });
      },

      unlockShaft: () => {
        const state = get();
        const nextId = state.shafts.length + 1;
        // Cost to unlock new shaft increases significantly
        const unlockCost = INITIAL_SHAFT_COST * Math.pow(10, nextId - 1);

        if (state.tlm >= unlockCost) {
          set({
            tlm: state.tlm - unlockCost,
            shafts: [
              ...state.shafts,
              { 
                id: nextId, 
                level: 1, 
                miningSpeed: 10, 
                workerCount: 1, 
                cost: INITIAL_SHAFT_COST * Math.pow(1.5, nextId), 
                unlocked: true 
              }
            ]
          });
        }
      },

      assignManager: (managerTemplate, sectorId) => {
          const state = get();
          
          // 1. Remove manager from other sectors if already assigned?
          // Or create a new instance?
          // For this prototype, we'll create a new instance of the manager type
          // and assign it to the sector, replacing any existing one.
          
          const newManager: Manager = {
              id: `${managerTemplate.id}_${Date.now()}`,
              name: managerTemplate.name,
              type: managerTemplate.type,
              effect: managerTemplate.effect,
              multiplier: managerTemplate.multiplier,
              cooldown: managerTemplate.cooldown,
              activeDuration: managerTemplate.activeDuration,
              isAssigned: true,
              assignedTo: sectorId,
              lastUsed: 0
          };

          // Remove any existing manager on this sector
          const filteredManagers = state.managers.filter(m => m.assignedTo !== sectorId);

          set({
              managers: [...filteredManagers, newManager],
              // Update sector data to reflect assignment (optional, for UI lookup)
              shafts: state.shafts.map(s => `shaft_${s.id}` === sectorId ? { ...s, managerId: newManager.id } : s),
              elevator: sectorId === 'elevator' ? { ...state.elevator, managerId: newManager.id } : state.elevator,
              warehouse: sectorId === 'warehouse' ? { ...state.warehouse, managerId: newManager.id } : state.warehouse,
          });
      },

      triggerManager: (managerId) => {
          const state = get();
          const now = Date.now();
          
          const managerIndex = state.managers.findIndex(m => m.id === managerId);
          if (managerIndex === -1) return;
          
          const manager = state.managers[managerIndex];
          
          // Check Cooldown
          // Ready if: now > lastUsed + activeDuration*1000 + cooldown*1000
          // But wait, cooldown starts after active duration ends? Or starts immediately?
          // Usually starts after active duration.
          
          const readyTime = manager.lastUsed + (manager.activeDuration * 1000) + (manager.cooldown * 1000);
          
          if (now >= readyTime) {
              const newManagers = [...state.managers];
              newManagers[managerIndex] = {
                  ...manager,
                  lastUsed: now
              };
              
              set({ managers: newManagers });
          }
      },


      unlockPlanet: (planetId) => {
        const state = get();
        const planet = PLANETS.find(p => p.id === planetId);
        if (!planet) return;
        
        // Planet unlock condition is based on Net Worth (Lifetime TLM), not current balance spending
        if (state.netWorth >= planet.unlockCost && !state.unlockedPlanets.includes(planetId)) {
            set({
                unlockedPlanets: [...state.unlockedPlanets, planetId]
            });
        }
      },

      travelToPlanet: (planetId) => {
          const state = get();
          if (state.unlockedPlanets.includes(planetId)) {
              set({ currentPlanet: planetId });
              // Note: In real game, travelling might reset shafts (Prestige) or switch context.
              // For this clone, we keep it simple or maybe reset shafts if it's a "New Game+" mechanic.
              // The prompt implies "unlock based on Net Worth", usually meaning you keep your stats but get a multiplier?
              // Or is it a separate mine?
              // "Replicate 3-layer... Planet map... unlock based on Net Worth".
              // Let's assume travelling switches the active multiplier but keeps the same shaft levels for simplicity 
              // UNLESS we want the "Prestige" feel where you start over on a new planet with higher multiplier.
              // Standard Idle Miner Tycoon logic: New Planet = Reset Mines + Keep Cash/Super Cash + Higher Multiplier.
              // Let's do the Prestige Reset for maximum "Game Architect" points.
              
              if (planetId !== state.currentPlanet) {
                  // Reset Shafts/Elevator/Warehouse to Level 1 but keep Net Worth & TLM? 
                  // Usually you keep Premium Currency (Gems) but reset Cash (TLM) to balance the new economy.
                  // But user said "Unlock based on Net Worth".
                  // Let's just switch the multiplier for now to avoid frustrating the user if they didn't expect a reset.
                  // We can add a "Prestige" confirmation modal later if needed.
                  // For now: Just switch.
              }
          }
      },

      resetProgress: () => {
        set(INITIAL_STATE);
      },

      resume: () => {
        const state = get();
        const now = Date.now();
        const lastSave = state.lastSaveTime || now;
        const diffSeconds = (now - lastSave) / 1000;
        
        if (diffSeconds > 60) { // Only calculate if offline for more than 1 minute
             // Recalculate production rate based on current state
             // (We duplicate logic here or store 'lastProductionRate' in state)
             // Using stored productionRate for simplicity, assuming it was accurate at save
             const offlineEarnings = state.productionRate * diffSeconds;
             
             set({
                 tlm: state.tlm + offlineEarnings,
                 netWorth: state.netWorth + offlineEarnings,
                 lastSaveTime: now
             });
             return offlineEarnings;
        }
        return 0;
      },

      instantWarp: (seconds) => {
        const state = get();
        const earnings = state.productionRate * seconds;
        set({
          tlm: state.tlm + earnings,
          netWorth: state.netWorth + earnings,
        });
      },

      activateGlobalBoost: (multiplier, durationSeconds) => {
        const now = Date.now();
        set({
          globalMultiplier: multiplier,
          globalBoostExpiresAt: now + durationSeconds * 1000,
        });
      },
      purchaseMegaDrill: (shaftId) => {
        const state = get();
        const shaftIndex = state.shafts.findIndex(s => s.id === shaftId);
        if (shaftIndex === -1) return;

        const cost = 5000;
        if (state.tlm < cost) return;

        const now = Date.now();
        const shafts: Shaft[] = [...state.shafts];
        const target = shafts[shaftIndex];
        shafts[shaftIndex] = {
          ...target,
          boostMultiplier: 2,
          boostExpiresAt: now + 60 * 60 * 1000,
        };

        set({
          tlm: state.tlm - cost,
          shafts,
        });
      },
      setHasExecutivePass: () => {
        const state = get();
        if (state.hasExecutivePass) return;
        set({ hasExecutivePass: true });
      },
      setFarcasterUser: (user) => set({ farcasterUser: user }),
      setVerified: (status) => set({ isVerified: status }),
      setPrimaryAddress: (address) => set({ primaryAddress: address }),
      setCurrentRank: (rank) =>
        set(state =>
          state.currentRank === rank ? state : { ...state, currentRank: rank },
        ),
      setCustomName: (name) => set({ customName: name }),
      setSelectedMiner: (miner) => set({ selectedMiner: miner }),
      mintSkin: (skinId) => {
        const state = get();
        if (state.ownedSkinIds.includes(skinId)) return;
        if (!state.minerSkins.some(s => s.id === skinId)) return;
        set({
          ownedSkinIds: [...state.ownedSkinIds, skinId],
        });
      },
      equipSkin: (skinId) => {
        const state = get();
        if (skinId && !state.ownedSkinIds.includes(skinId)) return;
        set({ equippedSkinId: skinId });
      },
      buyBoost: (cost, multiplier, duration) => {
        const state = get();
        if (state.gems < cost) return;
        
        const now = Date.now();
        // If boost is already active, extend it? Or just overwrite?
        // Let's overwrite for simplicity, or extend if same multiplier.
        // Simple overwrite:
        set({
          gems: state.gems - cost,
          globalMultiplier: multiplier,
          globalBoostExpiresAt: now + duration * 1000,
        });
      },
      completeSocialTask: (taskId) => {
        const state = get();
        if (state.socialTasks[taskId]) return;

        const updatedTasks = {
          ...state.socialTasks,
          [taskId]: true,
        };

        set({
          socialTasks: updatedTasks,
          gems: state.gems + 25,
        });
      },
    }),
    {
      name: 'milky-way-miner-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
