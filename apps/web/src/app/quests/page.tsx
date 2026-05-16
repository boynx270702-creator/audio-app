'use client';

import * as React from 'react';
import { 
  Trophy, Zap, Target, Flame, CheckCircle2,
  Star, Sparkles, BookOpen, Headphones, CalendarDays, Crown,
  ChevronRight, ArrowUpRight, Clock, Gift, Shield, Sword, Map,
  MousePointer2, MessageSquare, Share2, Ticket, Search, Filter
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { apiClient } from '@/shared/services/api-client';
import { Skeleton } from '@/shared/components/ui/atoms/Skeleton';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { useNotificationStore } from '@/shared/stores/useNotificationStore';
import { useToastStore } from '@/shared/stores/useToastStore';

type QuestTab = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// Floating Particle Component
function ParticleBackground() {
  const [mounted, setMounted] = React.useState(false);
  
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="particle bg-primary/20"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 3 + 3}s`
          }}
        />
      ))}
    </div>
  );
}

function QuestCard({ quest, onClaim }: { quest: any; onClaim: (id: string) => void }) {
  const [claiming, setClaiming] = React.useState(false);
  
  let progress = 0;
  let currentLabel = '';
  let targetLabel = '';

  if (quest.type === 'READING') {
    progress = Math.min(100, (quest.currentProgress / quest.targetSeconds) * 100);
    currentLabel = `${Math.floor(quest.currentProgress / 60)}m`;
    targetLabel = `${Math.floor(quest.targetSeconds / 60)}m`;
  } else {
    progress = Math.min(100, (quest.currentProgress / (quest.targetCount || 1)) * 100);
    currentLabel = `${quest.currentProgress}`;
    targetLabel = `${quest.targetCount}`;
  }

  const isDone = quest.isCompleted;
  const isClaimed = quest.isClaimed;

  const handleClaim = async () => {
    setClaiming(true);
    try {
      await onClaim(quest.id);
    } finally {
      setClaiming(false);
    }
  };

  const getIcon = () => {
    switch (quest.type) {
      case 'READING': return <BookOpen className="h-5 w-5" />;
      case 'COMMENTING': return <MessageSquare className="h-5 w-5" />;
      case 'SHARING': return <Share2 className="h-5 w-5" />;
      case 'UNLOCKING': return <Shield className="h-5 w-5" />;
      case 'STREAK': return <Flame className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className={cn(
      "group relative rounded-xl border p-6 transition-all duration-300",
      "bg-surface-1 border-white/[0.06] hover:border-primary/20 hover:bg-surface-2",
      isDone && !isClaimed && "animate-mystic-glow border-gold/30 bg-gold/5",
      isClaimed && "opacity-60 grayscale-[0.5]"
    )}>
      <div className="flex items-start gap-5">
        <div className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-500 shadow-lg",
          isClaimed ? "bg-green-500/10 border-green-500/20" : 
          isDone ? "bg-gold/20 border-gold/30 rotate-3 scale-110" : 
          "bg-white/[0.03] border-white/[0.08] group-hover:bg-primary/10 group-hover:border-primary/20"
        )}>
          {isClaimed ? <CheckCircle2 className="h-6 w-6 text-green-400" /> : 
           React.cloneElement(getIcon() as React.ReactElement, { 
             className: cn("h-6 w-6 transition-colors", isDone ? "text-gold" : "text-t2 group-hover:text-primary") 
           })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-t3 px-2 py-0.5 rounded bg-white/5">
                  Mốc #{quest.milestone}
                </span>
                {isDone && !isClaimed && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-gold animate-pulse">Sẵn sàng</span>
                )}
              </div>
              <h3 className={cn("text-base font-black tracking-tight", isDone ? "text-white" : "text-t1")}>
                {quest.name}
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-[11px] font-black text-green-400 shadow-sm">
                <Zap className="h-3 w-3" />
                +{quest.rewardAmount.toLocaleString()}
              </div>
              <span className="text-[9px] font-black text-t3 mt-1 uppercase tracking-tighter">
                {quest.rewardCurrency.replace('_', ' ')}
              </span>
            </div>
          </div>
          <p className="text-sm text-t2 mt-3 line-clamp-2 leading-relaxed font-medium">
            {quest.description}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex justify-between items-end">
          <p className="text-[10px] font-black text-t3 uppercase tracking-widest">Tiến độ tu luyện</p>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-sm font-mono font-black", isDone ? "text-gold" : "text-t1")}>{currentLabel}</span>
            <span className="text-[10px] font-bold text-t3">/ {targetLabel}</span>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/5">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 relative",
              isDone ? "bg-gradient-to-r from-gold to-amber-400" : "bg-gradient-to-r from-primary to-purple-soft"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isDone && !isClaimed && (
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="mt-6 w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-gold hover:bg-gold/90 text-black text-xs font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold/20 uppercase tracking-widest"
        >
          {claiming ? 'Đang nhận...' : 'Nhận phần thưởng'}
          <ArrowUpRight className="h-4 w-4" />
        </button>
      )}

      {isClaimed && (
        <div className="mt-6 w-full flex items-center justify-center gap-2 h-11 rounded-lg bg-white/5 border border-white/10 text-t3 text-[10px] font-black pointer-events-none uppercase tracking-[0.2em]">
          <CheckCircle2 className="h-4 w-4" />
          Đã hoàn thành
        </div>
      )}
    </div>
  );
}

export default function QuestsPage() {
  const [quests, setQuests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [tab, setTab] = React.useState<QuestTab>('DAILY');
  const { addNotification } = useNotificationStore();
  const { addToast } = useToastStore();

  const fetchQuests = async () => {
    try {
      const res = await apiClient.get('/quests');
      setQuests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (questId: string) => {
    try {
      const q = quests.find(i => i.id === questId);
      await apiClient.post(`/quests/${questId}/claim`);
      addNotification('Nhận thưởng thành công!', `+${q?.rewardAmount} ${q?.rewardCurrency} đã được thêm vào túi đồ.`, 'reward');
      addToast('Tuyệt vời! Bạn đã nhận được quà.', 'success');
      await fetchQuests();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Không thể nhận thưởng', 'error');
    }
  };

  React.useEffect(() => { fetchQuests(); }, []);

  const filteredQuests = quests.filter(q => q.period === tab);
  const completedCount = filteredQuests.filter(q => q.isClaimed).length;
  const totalReward = filteredQuests.reduce((acc, q) => acc + (q.isClaimed ? q.rewardAmount : 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-page-in pb-24">
      
      {/* Hero Section - Synchronized with v3.0 Design */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-surface-1 p-8 lg:p-12 shadow-2xl">
        <ParticleBackground />
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              <Flame className="h-3.5 w-3.5" />
              Sảnh Tu Luyện
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter text-white leading-none whitespace-nowrap">
                TU LUYỆN <span className="text-gradient-gold">QUÁN</span>
              </h1>
              <p className="text-xs text-t2 font-medium max-w-sm mx-auto lg:mx-0 leading-relaxed">
                Vượt qua thử thách mỗi ngày để tích lũy tài nguyên và thăng cấp vị thế trong giới tu chân.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
               <button className="h-10 px-6 rounded-lg bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary-hover transition-all shadow-lg shadow-primary/20">
                Khám phá ngay
               </button>
               <button className="h-10 px-6 rounded-lg bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">
                Xếp hạng
               </button>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 lg:p-8 shadow-2xl relative">
            <div className="absolute -top-4 -right-4 h-12 w-12 bg-gold/10 rounded-full blur-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-t3 uppercase tracking-widest">Đã Hoàn Thành</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{completedCount}</span>
                  <span className="text-base font-bold text-t3">/ {filteredQuests.length}</span>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-t3 uppercase tracking-widest">Tích Lũy</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gold">+{totalReward.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-t3">
                <span>Tiến độ chu kỳ</span>
                <span className="text-primary">{filteredQuests.length ? Math.round((completedCount / filteredQuests.length) * 100) : 0}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-purple-soft to-primary transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                  style={{ width: `${filteredQuests.length ? (completedCount / filteredQuests.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation & Filters */}
      <div className="space-y-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sticky top-20 z-20 py-4 bg-background/80 backdrop-blur-md">
          <div className="flex gap-2 p-1 rounded-xl bg-surface-1 border border-white/10 w-full md:w-auto">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as QuestTab[]).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-8 py-3 rounded-lg font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300",
                  tab === t
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "text-t3 hover:text-t2 hover:bg-white/5"
                )}
              >
                {t === 'DAILY' ? 'Hàng Ngày' : t === 'WEEKLY' ? 'Hàng Tuần' : 'Hàng Tháng'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-t3 text-[10px] font-black uppercase tracking-widest">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Làm mới sau: <span className="text-white font-mono text-xs">08:24:55</span>
            </div>
            <div className="h-4 w-px bg-white/10" />
            <button className="p-2 rounded-lg bg-surface-1 border border-white/10 text-t3 hover:text-white transition-all">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quest Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-48 rounded-xl bg-surface-1 border border-white/10 animate-pulse" />
            ))
          ) : filteredQuests.length > 0 ? (
            filteredQuests.map(q => (
              <QuestCard key={q.id} quest={q} onClaim={claimReward} />
            ))
          ) : (
            <div className="col-span-full py-24 bg-surface-1/50 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center">
              <EmptyState
                icon={Sword}
                title="Yên lặng quá..."
                description={`Chưa có thử thách ${tab.toLowerCase()} nào dành cho bạn. Hãy tiếp tục tu luyện để kích hoạt nhé!`}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bonus Milestone Footer */}
      <div className="rounded-2xl bg-gradient-to-br from-surface-1 to-surface-0 border border-white/10 p-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[80px] translate-x-1/2 -translate-y-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 rotate-6 group-hover:rotate-12 transition-transform duration-500 shadow-2xl">
              <Crown className="h-10 w-10 text-gold animate-float" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-2xl font-black text-white tracking-tighter uppercase italic">Đặc quyền Vip</h4>
              <p className="text-sm text-t2 font-medium">Hoàn thành chuỗi nhiệm vụ tháng để nhận 500 Tiên Ngọc và danh hiệu <span className="text-gold font-black">"Độc Giả Thượng Thừa"</span>.</p>
            </div>
          </div>
          <button className="h-14 px-10 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95 whitespace-nowrap">
            Xem thành tích
          </button>
        </div>
      </div>

    </div>
  );
}
