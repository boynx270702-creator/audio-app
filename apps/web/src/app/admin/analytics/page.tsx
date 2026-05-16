'use client';

import * as React from 'react';
import { 
  BarChart3, TrendingUp, Users, BookOpen, Eye, 
  ArrowUpRight, ArrowDownRight, Calendar
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export default function AdminAnalyticsPage() {
  const stats = [
    { label: 'Doanh Thu Tháng', value: '124.5M', trend: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Người Dùng Mới', value: '1,248', trend: '+8.2%', isUp: true, icon: Users, color: 'text-blue-400' },
    { label: 'Lượt Xem Tổng', value: '45.2k', trend: '-2.4%', isUp: false, icon: Eye, color: 'text-amber-400' },
    { label: 'Truyện Đang Ra', value: '156', trend: '+4', isUp: true, icon: BookOpen, color: 'text-primary-light' },
  ];

  return (
    <div className="w-full min-h-full flex flex-col animate-page-in">
      <div className="flex items-center justify-between py-8 border-b border-white/10 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Data Insights</p>
          <h1 className="text-4xl font-black tracking-tight text-white font-fantasy">Thống Kê Báo Cáo</h1>
        </div>
        <div className="flex items-center gap-3">
           <button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-neutral-400 flex items-center gap-2 hover:bg-white/10 transition-all">
             <Calendar className="h-4 w-4" /> 30 Ngày Qua
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#121212] rounded-2xl border border-white/10 p-6 space-y-4">
             <div className="flex items-center justify-between">
                <div className={cn("p-3 rounded-xl bg-white/5", stat.color)}>
                   <stat.icon className="h-6 w-6" />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-black",
                  stat.isUp ? "text-green-400" : "text-red-400"
                )}>
                   {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                   {stat.trend}
                </div>
             </div>
             <div>
                <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-black text-white mt-1">{stat.value}</p>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-[#121212] rounded-3xl border border-white/10 p-8 min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <BarChart3 className="h-16 w-16 text-neutral-800 animate-pulse" />
            <p className="font-bold text-neutral-500 text-lg">Biểu Đồ Tăng Trưởng</p>
            <p className="text-xs text-neutral-600 max-w-xs text-center">Dữ liệu trực quan đang được đồng bộ từ cơ sở dữ liệu thời gian thực.</p>
         </div>
         <div className="bg-[#121212] rounded-3xl border border-white/10 p-8 min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <Users className="h-16 w-16 text-neutral-800 animate-pulse" />
            <p className="font-bold text-neutral-500 text-lg">Phân Bổ Người Dùng</p>
            <p className="text-xs text-neutral-600 max-w-xs text-center">Phân tích hành vi và phân khúc người dùng dựa trên lịch sử đọc.</p>
         </div>
      </div>
    </div>
  );
}
