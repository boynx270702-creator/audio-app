'use client';

import * as React from 'react';
import { Sparkles, Shield, Trophy } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export type RankTier = 
  | 'PHAM_NHAN'
  | 'LUYEN_KHI'
  | 'TRUC_CO'
  | 'KIM_DAN'
  | 'NGUYEN_ANH'
  | 'HOA_THAN'
  | 'DO_KIEP'
  | 'PHI_THANG'
  | 'CHAN_TIEN'
  | 'TIEN_DE';

const RANK_CONFIG: Record<RankTier, { label: string; color: string; bg: string; icon: any }> = {
  PHAM_NHAN: { label: 'Phàm Nhân', color: 'text-slate-400', bg: 'bg-slate-400/10', icon: Shield },
  LUYEN_KHI: { label: 'Luyện Khí', color: 'text-green-400', bg: 'bg-green-400/10', icon: Shield },
  TRUC_CO: { label: 'Trúc Cơ', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Shield },
  KIM_DAN: { label: 'Kim Đan', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Shield },
  NGUYEN_ANH: { label: 'Nguyên Anh', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: Trophy },
  HOA_THAN: { label: 'Hóa Thần', color: 'text-red-400', bg: 'bg-red-400/10', icon: Trophy },
  DO_KIEP: { label: 'Độ Kiếp', color: 'text-primary-light', bg: 'bg-primary/10', icon: Sparkles },
  PHI_THANG: { label: 'Phi Thăng', color: 'text-cyan-400', bg: 'bg-cyan-400/10', icon: Sparkles },
  CHAN_TIEN: { label: 'Chân Tiên', color: 'text-white', bg: 'bg-white/10', icon: Sparkles },
  TIEN_DE: { label: 'Tiên Đế', color: 'text-primary', bg: 'bg-primary/10', icon: Sparkles },
};

interface RankBadgeProps {
  rank: RankTier;
  level?: number;
  xpProgress?: number; // 0 to 100
  className?: string;
}

export function RankBadge({ rank, level = 1, xpProgress = 0, className }: RankBadgeProps) {
  const config = RANK_CONFIG[rank];
  const Icon = config.icon;

  return (
    <div className={cn("group relative flex items-center gap-4 p-4 rounded-2xl bg-secondary/20 border border-white/5 shadow-2xl hover:bg-secondary/30 transition-all cursor-default", className)}>
      {/* Rank Icon with Glow Effect */}
      <div className={cn(
        "relative h-12 w-12 rounded-xl flex items-center justify-center shadow-inner overflow-hidden",
        config.bg
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <Icon className={cn("h-6 w-6 relative z-10", config.color)} />
      </div>

      {/* Info & Progress */}
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className={cn("text-[10px] font-black uppercase tracking-[0.2em] opacity-40")}>Level {level}</span>
            <span className={cn("text-sm font-black tracking-tight", config.color)}>{config.label}</span>
          </div>
          <div className="h-6 w-10 rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-[10px] font-bold text-white/40">
             XP
          </div>
        </div>

        {/* XP Bar */}
        <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
           <div 
             className={cn("absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full", 
               rank === 'TIEN_DE' ? 'bg-primary shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-primary/60'
             )}
             style={{ width: `${xpProgress}%` }}
           />
        </div>
      </div>

      {/* Subtle Animation on Hover */}
      <div className="absolute -inset-1 rounded-[1.75rem] border border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
    </div>
  );
}
