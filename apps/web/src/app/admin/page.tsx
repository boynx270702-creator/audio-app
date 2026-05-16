'use client';

import * as React from 'react';
import { 
  Users, BookOpen, TrendingUp, Zap, ArrowUpRight,
  Activity, Eye, DollarSign, AlertTriangle, Crown,
  BookMarked, MessageSquare, BarChart3, Settings,
  Plus, Search, Filter, Download, RefreshCw, Flame
} from 'lucide-react';
import { Button } from '@/shared/components/ui/atoms/Button';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';

const STATS = [
  { label: 'Người Dùng', value: '1,284', change: '+12.5%', trend: 'up', icon: <Users className="h-5 w-5" />, color: 'text-celestial', bg: 'bg-celestial/10', border: 'border-celestial/20' },
  { label: 'Truyện', value: '42', change: '+4', trend: 'up', icon: <BookOpen className="h-5 w-5" />, color: 'text-jade', bg: 'bg-jade/10', border: 'border-jade/20' },
  { label: 'Lượt Đọc / Ngày', value: '5.2k', change: '-2%', trend: 'down', icon: <Eye className="h-5 w-5" />, color: 'text-primary-light', bg: 'bg-primary/10', border: 'border-primary/20' },
  { label: 'Linh Thạch Phát Hành', value: '842.5k', change: '+18%', trend: 'up', icon: <Zap className="h-5 w-5" />, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  { label: 'Phiên / Người Dùng', value: '24.3 phút', change: '+3%', trend: 'up', icon: <Activity className="h-5 w-5" />, color: 'text-jade', bg: 'bg-jade/10', border: 'border-jade/20' },
  { label: 'Retention D7', value: '34%', change: '+2%', trend: 'up', icon: <TrendingUp className="h-5 w-5" />, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
  { label: 'ARPU', value: '$2.4', change: '+8%', trend: 'up', icon: <DollarSign className="h-5 w-5" />, color: 'text-crimson-light', bg: 'bg-crimson/10', border: 'border-crimson/20' },
  { label: 'Báo Cáo Vi Phạm', value: '12', change: '-3', trend: 'up', icon: <AlertTriangle className="h-5 w-5" />, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
];

const QUICK_ACTIONS = [
  { label: 'Thêm Truyện', href: '/admin/stories/new', icon: <Plus className="h-5 w-5" />, color: 'from-primary to-primary-dark', shadow: 'shadow-primary/20' },
  { label: 'Quản Lý Users', href: '/admin/users', icon: <Users className="h-5 w-5" />, color: 'from-celestial to-blue-700', shadow: 'shadow-blue-500/20' },
  { label: 'Economy', href: '/admin/economy', icon: <Zap className="h-5 w-5" />, color: 'from-gold to-amber-700', shadow: 'shadow-gold/20' },
  { label: 'Moderation', href: '/admin/moderation', icon: <AlertTriangle className="h-5 w-5" />, color: 'from-crimson to-red-800', shadow: 'shadow-crimson/20' },
];

const ADMIN_MODULES = [
  { label: 'Users', href: '/admin/users', icon: Users, count: 1284, color: 'text-celestial' },
  { label: 'Stories', href: '/admin/stories', icon: BookOpen, count: 42, color: 'text-jade' },
  { label: 'Chapters', href: '/admin/chapters', icon: BookMarked, count: 584, color: 'text-primary-light' },
  { label: 'Comments', href: '/admin/comments', icon: MessageSquare, count: 482, color: 'text-gold' },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, count: null, color: 'text-crimson-light' },
  { label: 'Settings', href: '/admin/settings', icon: Settings, count: null, color: 'text-muted-foreground' },
];

const RECENT_ACTIVITIES = [
  { action: 'Người dùng mới đăng ký', target: 'Kiếm Thánh #2841', time: '2 phút trước', type: 'user' },
  { action: 'Chương mới được thêm', target: 'Phàm Nhân Tu Tiên — Chương 4', time: '15 phút trước', type: 'content' },
  { action: 'Top-up thành công', target: '500 Tiên Ngọc × 3 users', time: '32 phút trước', type: 'economy' },
  { action: 'Báo cáo vi phạm mới', target: 'Bình luận #9482', time: '1 giờ trước', type: 'report' },
  { action: 'Nhiệm vụ đã được claim', target: '142 lần trong 1 giờ', time: '1 giờ trước', type: 'quest' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-10 animate-page-in">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-crimson/20 bg-gradient-to-br from-crimson/10 via-void-850 to-void-800 p-8">
        <div className="absolute top-0 right-0 w-72 h-72 bg-crimson/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-crimson/20 border border-crimson/30">
                <Flame className="h-7 w-7 text-crimson-light" />
              </div>
              <div>
                <h1 className="font-fantasy text-3xl font-bold gradient-crimson-text">Admin Console</h1>
                <p className="text-sm font-medium text-muted-foreground">Bảng điều khiển vận hành hệ thống StoryVerse</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-jade/10 border border-jade/20">
              <div className="h-2 w-2 rounded-full bg-jade animate-pulse" />
              <span className="text-xs font-black text-jade">API Online · 24ms</span>
            </div>
            <Button className="h-10 rounded-xl px-5 bg-void-800 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-void-700 text-sm font-bold gap-2">
              <RefreshCw className="h-4 w-4" /> Làm Mới
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map(action => (
          <Link key={action.label} href={action.href}
            className={cn(
              "group flex items-center gap-3 p-5 rounded-2xl bg-gradient-to-br text-white font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95",
              action.color,
              action.shadow
            )}>
            {action.icon}
            {action.label}
            <ArrowUpRight className="h-4 w-4 ml-auto opacity-50 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="font-fantasy text-xl font-bold mb-5 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Tổng Quan Hệ Thống
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map(stat => (
            <div key={stat.label} className={cn(
              "group rounded-2xl border p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]",
              "bg-void-800",
              stat.border
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2.5 rounded-xl border transition-all group-hover:scale-110", stat.bg, stat.border, stat.color)}>
                  {stat.icon}
                </div>
                <span className={cn(
                  "text-[11px] font-black px-2.5 py-1 rounded-xl",
                  stat.trend === 'up' ? "bg-jade/10 text-jade border border-jade/20" : "bg-crimson/10 text-crimson-light border border-crimson/20"
                )}>
                  {stat.change}
                </span>
              </div>
              <p className="text-xs font-bold text-muted-foreground mb-1">{stat.label}</p>
              <p className={cn("font-fantasy text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-column bottom grid */}
      <div className="grid lg:grid-cols-[1fr_340px] gap-8">
        {/* Recent Activity */}
        <div className="rounded-3xl border border-border/40 bg-void-800 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/40">
            <h2 className="font-fantasy text-lg font-bold flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary-light" />
              Hoạt Động Gần Đây
            </h2>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground">
                <Filter className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="divide-y divide-border/30">
            {RECENT_ACTIVITIES.map((act, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-void-750 transition-colors">
                <div className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 border",
                  act.type === 'user' ? "bg-celestial/10 border-celestial/20 text-celestial" :
                  act.type === 'content' ? "bg-jade/10 border-jade/20 text-jade" :
                  act.type === 'economy' ? "bg-gold/10 border-gold/20 text-gold" :
                  act.type === 'report' ? "bg-crimson/10 border-crimson/20 text-crimson-light" :
                  "bg-primary/10 border-primary/20 text-primary-light"
                )}>
                  {act.type === 'user' ? <Users className="h-4 w-4" /> :
                   act.type === 'content' ? <BookOpen className="h-4 w-4" /> :
                   act.type === 'economy' ? <Zap className="h-4 w-4" /> :
                   act.type === 'report' ? <AlertTriangle className="h-4 w-4" /> :
                   <Crown className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">{act.action}</p>
                  <p className="text-xs text-muted-foreground font-medium truncate">{act.target}</p>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/40 flex-shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Module Nav */}
        <div className="space-y-4">
          <h2 className="font-fantasy text-lg font-bold flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Modules Quản Trị
          </h2>
          <div className="space-y-2">
            {ADMIN_MODULES.map(mod => (
              <Link key={mod.label} href={mod.href}
                className="group flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-void-800 hover:bg-void-750 hover:border-border transition-all">
                <div className={cn("p-2.5 rounded-xl bg-void-700 border border-border/40 transition-all group-hover:scale-105", mod.color)}>
                  <mod.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 font-bold text-sm text-foreground group-hover:text-foreground">{mod.label}</span>
                {mod.count !== null && (
                  <span className="text-xs font-black text-muted-foreground/50 bg-void-700 px-2.5 py-1 rounded-xl">
                    {mod.count.toLocaleString()}
                  </span>
                )}
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary-light transition-colors" />
              </Link>
            ))}
          </div>

          {/* Economy Health */}
          <div className="rounded-2xl border border-gold/20 bg-gradient-to-br from-gold/5 to-void-800 p-5 mt-4">
            <h3 className="font-fantasy text-sm font-bold text-gold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Economy Health
            </h3>
            {[
              { label: 'Linh Thạch phát hành', val: 842500, max: 1000000, color: 'bg-jade' },
              { label: 'Tiên Ngọc bán ra', val: 2840, max: 5000, color: 'bg-gold' },
              { label: 'Tỉ lệ chi tiêu', val: 68, max: 100, color: 'bg-primary' },
            ].map(bar => (
              <div key={bar.label} className="mb-3">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground mb-1.5">
                  <span>{bar.label}</span>
                  <span className="text-foreground">{Math.round((bar.val / bar.max) * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-void-700 overflow-hidden">
                  <div className={cn("h-full rounded-full transition-all", bar.color)}
                    style={{ width: `${(bar.val / bar.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
