'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import { 
  Trophy, Search, Plus, Trash2, Edit3, X, 
  Zap, Clock, Gift, Target, CheckCircle2
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';

export default function AdminQuestsPage() {
  const [quests, setQuests] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [limit, setLimit] = React.useState(10);

  // Modal states
  const [modal, setModal] = React.useState<{ show: boolean, quest?: any }>({ show: false });
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    targetSeconds: 300,
    rewardAmount: 10,
    rewardCurrency: 'LINH_THACH',
    period: 'DAILY',
    type: 'READING',
    targetCount: 0,
    milestone: 1,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchQuests = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.quests.findAll(currentPage, limit, search);
      setQuests(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, search]);

  React.useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      targetSeconds: 300,
      rewardAmount: 10,
      rewardCurrency: 'LINH_THACH',
      period: 'DAILY',
      type: 'READING',
      targetCount: 0,
      milestone: 1,
      isActive: true
    });
    setModal({ show: true });
  };

  const openEditModal = (quest: any) => {
    setFormData({
      name: quest.name,
      description: quest.description || '',
      targetSeconds: quest.targetSeconds,
      rewardAmount: quest.rewardAmount,
      rewardCurrency: quest.rewardCurrency,
      period: quest.period || 'DAILY',
      type: quest.type || 'READING',
      targetCount: quest.targetCount || 0,
      milestone: quest.milestone || 1,
      isActive: quest.isActive
    });
    setModal({ show: true, quest });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modal.quest) {
        await adminApi.quests.update(modal.quest.id, formData);
      } else {
        await adminApi.quests.create(formData);
      }
      setModal({ show: false });
      fetchQuests();
    } catch (error) {
      console.error('Failed to save quest:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
    try {
      await adminApi.quests.delete(id);
      fetchQuests();
    } catch (error) {
      console.error('Failed to delete quest:', error);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Gamification</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Nhiệm Vụ</h1>
          </div>
        </div>

        <Button 
          onClick={openCreateModal}
          className="h-10 rounded-xl bg-primary hover:bg-primary-hover px-5 font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Nhiệm Vụ
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm nhiệm vụ..."
                className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        {/* Quests Table */}
        <div className="flex-1 bg-[#121212] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
              </div>
            )}

            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Nhiệm Vụ</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Mục Tiêu</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Phần Thưởng</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Chu Kỳ / Mốc</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quests.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={Trophy}
                        title="Chưa có nhiệm vụ nào"
                        description={search ? `Không tìm thấy nhiệm vụ nào cho "${search}"` : "Hệ thống chưa có nhiệm vụ nào. Hãy thêm ngay!"}
                      />
                    </td>
                  </tr>
                ) : (
                  quests.map((quest) => (
                    <tr key={quest.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                            <Target className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{quest.name}</p>
                            <p className="text-[10px] text-neutral-500 max-w-[300px] truncate">{quest.description || 'Nhiệm vụ hàng ngày'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          {quest.type === 'READING' ? (
                            <>
                              <Clock className="h-3.5 w-3.5 text-neutral-500" />
                              <span className="text-sm font-mono font-bold text-neutral-300">{(quest.targetSeconds / 60).toFixed(0)} phút</span>
                            </>
                          ) : (
                            <>
                              <Target className="h-3.5 w-3.5 text-neutral-500" />
                              <span className="text-sm font-mono font-bold text-neutral-300">{quest.targetCount} lượt</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <Zap className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-sm font-mono font-bold text-emerald-400">{quest.rewardAmount.toLocaleString()}</span>
                          <span className="text-[10px] font-black text-neutral-500 uppercase">{quest.rewardCurrency}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border text-center",
                            quest.period === 'DAILY' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                            quest.period === 'WEEKLY' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                            quest.period === 'MONTHLY' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                            "bg-neutral-500/10 text-neutral-400 border-neutral-500/20"
                          )}>
                            {quest.period === 'DAILY' ? 'Hàng Ngày' :
                             quest.period === 'WEEKLY' ? 'Hàng Tuần' :
                             quest.period === 'MONTHLY' ? 'Hàng Tháng' : 'Một Lần'}
                          </span>
                          <span className="text-[10px] text-center font-bold text-neutral-500">Mốc #{quest.milestone}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={cn(
                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase border",
                          quest.isActive 
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          {quest.isActive ? 'Đang bật' : 'Đang tắt'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(quest)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete(quest.id)} className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            limit={limit}
            onPageChange={setCurrentPage}
            onLimitChange={setLimit}
          />
        </div>
      </div>

      {/* Quest Modal (Drawer) */}
      {modal.show && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ show: false })} />
            <div className="relative w-full max-w-2xl h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
              <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-black text-white">{modal.quest ? 'Cập Nhật Nhiệm Vụ' : 'Thêm Nhiệm Vụ Mới'}</h2>
                  <p className="text-xs text-neutral-500 mt-1">Cấu hình nhiệm vụ hàng ngày cho người dùng</p>
                </div>
                <button onClick={() => setModal({ show: false })} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Loại Nhiệm Vụ</label>
                      <AdminSelect
                        value={formData.type}
                        onChange={(val) => setFormData(prev => ({ ...prev, type: val }))}
                        options={[
                          { value: 'READING', label: 'Đọc Truyện' },
                          { value: 'COMMENTING', label: 'Bình Luận' },
                          { value: 'SHARING', label: 'Chia Sẻ' },
                          { value: 'VOTING', label: 'Bình Chọn' },
                          { value: 'UNLOCKING', label: 'Mở Chương' },
                          { value: 'STREAK', label: 'Điểm Danh' },
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Chu Kỳ</label>
                      <AdminSelect
                        value={formData.period}
                        onChange={(val) => setFormData(prev => ({ ...prev, period: val }))}
                        options={[
                          { value: 'DAILY', label: 'Hàng Ngày' },
                          { value: 'WEEKLY', label: 'Hàng Tuần' },
                          { value: 'MONTHLY', label: 'Hàng Tháng' },
                          { value: 'ONCE', label: 'Làm 1 Lần' },
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Mốc Thứ (Milestone)</label>
                      <input
                        type="number"
                        value={formData.milestone}
                        onChange={(e) => setFormData(prev => ({ ...prev, milestone: Number(e.target.value) }))}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Tên Nhiệm Vụ</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ví dụ: Đọc sách 5 phút"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Mô Tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả chi tiết yêu cầu nhiệm vụ..."
                      className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-sm font-medium text-white outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">
                        {formData.type === 'READING' ? 'Yêu Cầu (Giây)' : 'Yêu Cầu (Số Lượt)'}
                      </label>
                      <div className="relative">
                        {formData.type === 'READING' ? (
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        ) : (
                          <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-600" />
                        )}
                        <input
                          type="number"
                          required
                          value={formData.type === 'READING' ? formData.targetSeconds : formData.targetCount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (formData.type === 'READING') {
                              setFormData(prev => ({ ...prev, targetSeconds: val }));
                            } else {
                              setFormData(prev => ({ ...prev, targetCount: val }));
                            }
                          }}
                          className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-mono font-bold text-white outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <p className="text-[10px] text-neutral-600 px-1 italic">
                        {formData.type === 'READING' ? 'Gợi ý: 300s = 5p | 1800s = 30p' : `Nhập số lượt ${formData.type.toLowerCase()} cần thực hiện`}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Phần Thưởng</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <Zap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50" />
                          <input
                            type="number"
                            required
                            value={formData.rewardAmount}
                            onChange={(e) => setFormData(prev => ({ ...prev, rewardAmount: Number(e.target.value) }))}
                            className="w-full h-12 bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 text-sm font-mono font-bold text-white outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <AdminSelect
                          value={formData.rewardCurrency}
                          onChange={(val) => setFormData(prev => ({ ...prev, rewardCurrency: val }))}
                          options={[
                            { value: 'LINH_THACH', label: 'Linh Thạch' },
                            { value: 'TIEN_NGOC', label: 'Tiên Ngọc' },
                          ]}
                          className="w-40"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">Kích hoạt nhiệm vụ</p>
                      <p className="text-[10px] text-neutral-500">Nhiệm vụ sẽ hiển thị cho người dùng nếu được bật</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={cn(
                        "w-12 h-6 rounded-full transition-all relative",
                        formData.isActive ? "bg-primary" : "bg-neutral-800"
                      )}
                    >
                      <div className={cn(
                        "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                        formData.isActive ? "left-7" : "left-1"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                  <Button type="button" onClick={() => setModal({ show: false })} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                    {isSubmitting ? 'Đang Lưu...' : 'Lưu Nhiệm Vụ'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
