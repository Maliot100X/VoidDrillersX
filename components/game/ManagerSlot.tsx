"use client";

import { useGameStore } from '@/lib/store';
import { UserCog, Zap, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { MANAGERS_DATA } from '@/lib/constants';

interface ManagerSlotProps {
  sectorId: string;
  currentManagerId?: string;
}

export function ManagerSlot({ sectorId, currentManagerId }: ManagerSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const assignManager = useGameStore(state => state.assignManager);
  const triggerManager = useGameStore(state => state.triggerManager);
  const managers = useGameStore(state => state.managers);

  // Find the actual assigned manager instance
  const assignedManager = managers.find(m => m.id === currentManagerId);

  // Calculate status
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isActive = assignedManager && (now - assignedManager.lastUsed) < (assignedManager.activeDuration * 1000);
  const isOnCooldown = assignedManager && !isActive && (now < assignedManager.lastUsed + (assignedManager.activeDuration * 1000) + (assignedManager.cooldown * 1000));
  const remainingCooldown = assignedManager && isOnCooldown
    ? Math.ceil(((assignedManager.lastUsed + (assignedManager.activeDuration * 1000) + (assignedManager.cooldown * 1000)) - now) / 1000)
    : 0;

  const handleAssign = (managerTemplate: (typeof MANAGERS_DATA)[number]) => {
      assignManager(managerTemplate, sectorId);
      setIsOpen(false);
  };

  const handleActivate = () => {
      if (assignedManager && !isActive && !isOnCooldown) {
          triggerManager(assignedManager.id);
          setIsOpen(false);
      }
  };

  return (
    <>
      <div className="flex flex-col items-center gap-0.5">
        <button 
          onClick={() => setIsOpen(true)}
          className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded border transition-all overflow-hidden",
              isActive ? "bg-[#00F0FF] border-[#00F0FF] shadow-[0_0_10px_#00F0FF]" :
              isOnCooldown ? "bg-red-900/30 border-gray-600 opacity-60" :
              assignedManager ? "bg-[#162044] border-[#00F0FF]" : 
              "bg-transparent border-gray-600 text-gray-600 hover:border-gray-400"
          )}
        >
          {assignedManager ? (
              <User className={cn("h-4 w-4", isActive ? "text-black" : "text-white")} />
          ) : (
              <UserCog className="h-4 w-4" />
          )}
        </button>
        {isOnCooldown && remainingCooldown > 0 && (
          <div className="text-[8px] text-gray-400">
            {remainingCooldown}s
          </div>
        )}
      </div>

      {/* Manager Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[#00F0FF]/20 bg-[#0B1026] p-4 shadow-2xl">
            <h3 className="mb-4 font-orbitron text-lg font-bold text-white">
                {assignedManager ? "Manager Details" : "Hire Manager"}
            </h3>
            
            {assignedManager ? (
                <div className="flex flex-col gap-4">
                    <div className="rounded bg-[#162044] p-4 border border-[#00F0FF]/30">
                        <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-white text-lg">{assignedManager.name}</span>
                             <span className="text-xs bg-[#00F0FF]/20 text-[#00F0FF] px-2 py-0.5 rounded uppercase">{assignedManager.type}</span>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">
                            Effect: {assignedManager.effect === 'speed' ? 'Speed Boost' : assignedManager.effect === 'cost' ? 'Upgrade Discount' : 'Passive Boost'} (x{assignedManager.multiplier})
                        </p>
                        
                        {assignedManager.type !== 'Junior' && (
                             <button
                                onClick={handleActivate}
                                disabled={isActive || isOnCooldown}
                                className={cn(
                                    "w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2",
                                    isActive ? "bg-green-500 text-black cursor-default" :
                                    isOnCooldown ? "bg-gray-700 text-gray-400 cursor-not-allowed" :
                                    "bg-[#00F0FF] text-black hover:bg-[#00C0CC]"
                                )}
                             >
                                 {isActive ? (
                                     <>Active ({Math.ceil(((assignedManager.lastUsed + (assignedManager.activeDuration * 1000)) - now) / 1000)}s)</>
                                 ) : isOnCooldown ? (
                                     <>Cooldown ({Math.ceil(((assignedManager.lastUsed + (assignedManager.activeDuration * 1000) + (assignedManager.cooldown * 1000)) - now) / 1000)}s)</>
                                 ) : (
                                     <><Zap className="h-4 w-4" /> Activate Ability</>
                                 )}
                             </button>
                        )}
                        {assignedManager.type === 'Junior' && (
                            <div className="text-xs text-center text-gray-400 italic">Passive ability always active</div>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => setIsOpen(false)} // Should be "Unassign" ideally, but simplified
                        className="w-full rounded border border-red-500/50 text-red-400 py-2 text-xs hover:bg-red-900/20"
                    >
                        Close
                    </button>
                </div>
            ) : (
                <div className="space-y-2">
                    {MANAGERS_DATA.map((manager) => (
                        <button
                            key={manager.id}
                            onClick={() => handleAssign(manager)}
                            className="flex w-full items-center justify-between rounded border border-white/10 bg-[#162044] p-3 hover:bg-[#1E2A5E]"
                        >
                            <div className="flex flex-col items-start">
                                <span className="font-bold text-white">{manager.name}</span>
                                <span className="text-[10px] text-gray-400">{manager.type} • {manager.effect === 'speed' ? 'Speed x' : 'Cost -'}{manager.multiplier}</span>
                            </div>
                            <div className="text-xs font-bold text-[#00F0FF]">
                                Hire
                            </div>
                        </button>
                    ))}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="mt-4 w-full rounded bg-gray-800 py-2 text-xs font-bold text-white"
                    >
                        Cancel
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
