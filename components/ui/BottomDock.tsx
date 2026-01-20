"use client";

import type { ComponentType } from 'react';
import { Pickaxe, Map, ShoppingBag, Trophy, User, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Tab = 'mine' | 'map' | 'shop' | 'quests' | 'profile' | 'more';

interface BottomDockProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

interface BottomDockTab {
  id: Tab;
  icon: ComponentType<{ className?: string }>;
}

export function BottomDock({ activeTab, onTabChange }: BottomDockProps) {
  const tabs: BottomDockTab[] = [
    { id: 'mine', icon: Pickaxe },
    { id: 'map', icon: Map },
    { id: 'shop', icon: ShoppingBag },
    { id: 'quests', icon: Trophy },
    { id: 'profile', icon: User },
    { id: 'more', icon: MoreHorizontal },
  ];

  return (
    <div 
      className="absolute bottom-4 left-3 right-3 z-50 rounded-2xl border border-[#00F0FF]/20 bg-[#0B1026]/80 backdrop-blur-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden"
      style={{
        backgroundImage: "url('/assets/tab-bg.svg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="flex items-center justify-around p-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                  isActive
                    ? "bg-[#00F0FF] text-[#0B1026] shadow-[0_0_15px_#00F0FF] scale-110"
                    : "bg-transparent text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
