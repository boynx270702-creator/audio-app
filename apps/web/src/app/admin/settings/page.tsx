'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/atoms/Button';
import { 
  Settings, Save, Globe, Lock, Bell, Database, Zap, ShieldCheck
} from 'lucide-react';
import { cn } from '@/shared/utils/cn';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState('general');

  const tabs = [
    { id: 'general', label: 'Tổng Quan', icon: Globe },
    { id: 'security', label: 'Bảo Mật', icon: ShieldCheck },
    { id: 'notifications', label: 'Thông Báo', icon: Bell },
    { id: 'system', label: 'Hệ Thống', icon: Database },
  ];

  return (
    <div className="w-full min-h-full flex flex-col animate-page-in">
      <div className="flex items-center justify-between py-8 border-b border-white/10 mb-8">
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">System Configuration</p>
          <h1 className="text-4xl font-black tracking-tight text-white font-fantasy">Cấu Hình Hệ Thống</h1>
        </div>
        <Button className="h-12 rounded-xl bg-primary hover:bg-primary-hover px-6 font-bold shadow-xl shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-all text-white">
          <Save className="h-5 w-5" /> Lưu Thay Đổi
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs Sidebar */}
        <aside className="w-full lg:w-64 flex flex-row lg:flex-col gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 lg:flex-none flex items-center gap-3 px-4 h-12 rounded-xl font-bold text-sm transition-all",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary-light border border-primary/20" 
                  : "text-neutral-500 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <tab.icon className="h-5 w-5" />
              <span className="hidden lg:inline">{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Content Pane */}
        <div className="flex-1 bg-[#121212] rounded-3xl border border-white/10 p-8 space-y-8">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-page-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên Website</label>
                  <input defaultValue="StoryVerse" className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Email Hỗ Trợ</label>
                  <input defaultValue="support@storyverse.vn" className="w-full h-12 bg-black/50 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Mô Tả SEO</label>
                <textarea rows={4} defaultValue="Nền tảng đọc truyện và nghe audio hàng đầu Việt Nam." className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-sm font-medium text-neutral-300 outline-none focus:border-primary/50 transition-all resize-none" />
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" /> Chế Độ Hoạt Động
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   {['Bình Thường', 'Bảo Trì', 'Chỉ Đọc'].map((mode, i) => (
                     <div key={mode} className={cn("p-4 rounded-xl border cursor-pointer transition-all", i === 0 ? "border-primary bg-primary/5" : "border-white/10 bg-white/5 hover:border-white/20")}>
                        <p className="text-sm font-bold text-white">{mode}</p>
                        <p className="text-[10px] text-neutral-500 mt-1">Lựa chọn chế độ vận hành cho toàn hệ thống.</p>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'general' && (
             <div className="flex flex-col items-center justify-center py-24 text-neutral-500 space-y-4">
                <Settings className="h-16 w-16 opacity-10 animate-spin-slow" />
                <p className="font-bold">Đang cập nhật module này...</p>
                <p className="text-xs">Module {tabs.find(t => t.id === activeTab)?.label} sẽ sớm được ra mắt.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
