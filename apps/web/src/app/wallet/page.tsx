'use client';

import * as React from 'react';
import { 
  Gem, Flame, Star, Sparkles, ArrowUpRight, ArrowDownRight,
  TrendingUp, Crown, Zap, BookOpen, Trophy, Clock, Plus
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import Link from 'next/link';
import { Skeleton } from '@/shared/components/ui/atoms/Skeleton';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';

const CURRENCIES = [
  {
    id: 'linhThach',
    name: 'Linh Thạch',
    symbol: '◆',
    desc: 'Tiền tệ cơ bản — Mở khóa chương',
    icon: Gem,
    color: 'text-green-400',
    border: 'border-green-500/20',
    bg: 'bg-green-500/5',
  },
  {
    id: 'tienNgoc',
    name: 'Tiên Ngọc',
    symbol: '◈',
    desc: 'Tiền cao cấp — VIP & Gacha',
    icon: Flame,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/5',
  },
  {
    id: 'thanTinh',
    name: 'Thần Tinh',
    symbol: '✦',
    desc: 'Tinh chất hiếm — Triệu hồi',
    icon: Star,
    color: 'text-indigo-400',
    border: 'border-indigo-500/20',
    bg: 'bg-indigo-500/5',
  },
  {
    id: 'coVat',
    name: 'Cổ Vật',
    symbol: '⬡',
    desc: 'Vật phẩm cổ — Nâng cấp',
    icon: Crown,
    color: 'text-red-400',
    border: 'border-red-500/20',
    bg: 'bg-red-500/5',
  },
];

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'earn', currency: 'Linh Thạch', amount: 150, source: 'Nhiệm vụ: Độc Giả Chuyên Cần', time: '2 giờ trước' },
  { id: '2', type: 'spend', currency: 'Linh Thạch', amount: -50, source: 'Mở khóa Chương 3 — Phàm Nhân Tu Tiên', time: '5 giờ trước' },
  { id: '3', type: 'earn', currency: 'Linh Thạch', amount: 50, source: 'Nhiệm vụ: Tân Thủ Tập Sự', time: 'Hôm qua' },
  { id: '4', type: 'earn', currency: 'Tiên Ngọc', amount: 10, source: 'Sự kiện chào mừng', time: 'Hôm qua' },
];

function CurrencyCard({ currency, balance }: { currency: typeof CURRENCIES[0]; balance: number }) {
  return (
    <div className={cn(
      "relative rounded-lg border p-6 space-y-4 transition-all duration-200 hover:border-white/[0.15] bg-[#101010]",
      currency.border
    )}>
      <div className="flex items-center justify-between">
        <div className={cn("p-2 rounded-lg bg-white/[0.04] border border-white/[0.08]", currency.color)}>
          <currency.icon className="h-5 w-5" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-white font-bold text-[10px] transition-all uppercase tracking-wider">
          <Plus className="h-3 w-3" /> Nạp
        </button>
      </div>

      <div>
        <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-1">{currency.name}</p>
        <p className={cn("text-2xl font-black", currency.color)}>
          {balance.toLocaleString()} <span className="text-sm opacity-50">{currency.symbol}</span>
        </p>
        <p className="text-[11px] text-neutral-500 mt-2 font-medium leading-relaxed">{currency.desc}</p>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const walletData: Record<string, number> = {
    linhThach: (user?.wallet as any)?.linhThach || 1000,
    tienNgoc: (user?.wallet as any)?.tienNgoc || 0,
    thanTinh: (user?.wallet as any)?.thanTinh || 0,
    coVat: (user?.wallet as any)?.coVat || 0,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-page-in">

      {/* Header */}
      <div className="relative rounded-md overflow-hidden border border-primary/20 bg-gradient-to-br from-primary/10 via-[#101010] to-[#080808] p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-3 rounded-md bg-primary/20 border border-primary/30">
                <Sparkles className="h-6 w-6 text-primary-light" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-neutral-100">Linh Khố</h1>
                <p className="text-xs text-neutral-500 font-medium">Quản lý tài sản tu luyện của đạo hữu</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/quests" className="flex items-center gap-2 h-10 px-6 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-300 font-bold text-xs hover:bg-white/[0.08] transition-all">
              <Trophy className="h-4 w-4" /> Làm Nhiệm Vụ
            </Link>
            <button className="flex items-center gap-2 h-10 px-6 rounded-md bg-primary text-white font-black text-xs hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all">
              <Plus className="h-4 w-4" /> Nạp Tiền
            </button>
          </div>
        </div>
      </div>

      {/* Currency Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading 
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-lg" />)
          : CURRENCIES.map(currency => (
              <CurrencyCard key={currency.id} currency={currency} balance={walletData[currency.id] ?? 0} />
            ))
        }
      </div>

      {/* How to Earn */}
      <div className="rounded-lg border border-white/[0.06] bg-[#101010] p-6 space-y-6">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-green-400" />
          Cách Kiếm Linh Thạch
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: BookOpen, label: 'Đọc Truyện', desc: 'Nhận 1 Linh Thạch mỗi 2 phút đọc', reward: '+30/giờ', color: 'text-primary-light' },
            { icon: Trophy, label: 'Nhiệm Vụ Hằng Ngày', desc: 'Hoàn thành 3 nhiệm vụ/ngày', reward: '+700/ngày', color: 'text-amber-400' },
            { icon: Star, label: 'Đăng Nhập', desc: 'Chuỗi đăng nhập liên tiếp', reward: '+500 bonus', color: 'text-green-400' },
          ].map(item => (
            <div key={item.label} className="p-5 rounded-lg border border-white/[0.05] bg-white/[0.02] space-y-3">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-lg bg-white/[0.04]", item.color)}>
                  <item.icon className="h-4 w-4" />
                </div>
                <h4 className="font-bold text-xs text-neutral-200">{item.label}</h4>
              </div>
              <p className="text-[11px] text-neutral-600 font-medium leading-relaxed">{item.desc}</p>
              <span className={cn("inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]", item.color)}>
                {item.reward}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="rounded-lg border border-white/[0.06] bg-[#101010] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Lịch Sử Giao Dịch
          </h2>
        </div>
        <div className="p-5 space-y-1">
          {MOCK_TRANSACTIONS.map(tx => {
            const isEarn = tx.type === 'earn';
            return (
              <div key={tx.id} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-5 px-5 transition-colors">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                  isEarn ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                  {isEarn ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-200 truncate">{tx.source}</p>
                  <p className="text-[10px] text-neutral-600 font-medium mt-0.5">{tx.time}</p>
                </div>
                <div className={cn("text-xs font-black", isEarn ? "text-green-400" : "text-red-400")}>
                  {isEarn ? '+' : ''}{tx.amount} <span className="text-[10px] opacity-50">{tx.currency === 'Linh Thạch' ? '◆' : '◈'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
