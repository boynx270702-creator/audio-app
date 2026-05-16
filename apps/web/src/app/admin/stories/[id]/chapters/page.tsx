'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import { 
  BookOpen, Plus, Trash2, Edit3, X, Search, 
  ChevronLeft, FileText, Lock, Unlock, PlayCircle
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function AdminChaptersPage() {
  const { id: storyId } = useParams() as { id: string };
  const [story, setStory] = React.useState<any>(null);
  const [chapters, setChapters] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [limit, setLimit] = React.useState(50);

  // Modal states
  const [modal, setModal] = React.useState<{ show: boolean, chapter?: any }>({ show: false });
  const [formData, setFormData] = React.useState({
    title: '',
    chapterNumber: 1,
    content: '',
    unlockType: 'FREE',
    unlockPrice: 0,
    publishStatus: 'PUBLISHED'
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [storyRes, chaptersRes] = await Promise.all([
        adminApi.stories.findOne(storyId),
        adminApi.stories.getChapters(storyId, currentPage, limit)
      ]);
      setStory(storyRes);
      setChapters(chaptersRes.data);
      setTotalPages(chaptersRes.meta.totalPages);
      setTotalItems(chaptersRes.meta.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [storyId, currentPage, limit]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setFormData({
      title: '',
      chapterNumber: (chapters[chapters.length - 1]?.chapterNumber || 0) + 1,
      content: '',
      unlockType: 'FREE',
      unlockPrice: 0,
      publishStatus: 'PUBLISHED'
    });
    setModal({ show: true });
  };

  const openEditModal = (chapter: any) => {
    setFormData({
      title: chapter.title,
      chapterNumber: chapter.chapterNumber,
      content: chapter.content || '',
      unlockType: chapter.unlockType,
      unlockPrice: chapter.unlockPrice || 0,
      publishStatus: chapter.publishStatus
    });
    setModal({ show: true, chapter });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modal.chapter) {
        await adminApi.stories.updateChapter(modal.chapter.id, formData);
      } else {
        await adminApi.stories.addChapter(storyId, formData);
      }
      setModal({ show: false });
      fetchData();
    } catch (error) {
      console.error('Failed to save chapter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương này?')) return;
    try {
      await adminApi.stories.deleteChapter(id);
      fetchData();
    } catch (error) {
      console.error('Failed to delete chapter:', error);
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-6">
          <Link 
            href="/admin/stories"
            className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                {story?.title || 'Loading...'}
              </p>
              <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Chương</h1>
            </div>
          </div>
        </div>

        <Button 
          onClick={openCreateModal}
          className="h-10 rounded-xl bg-primary hover:bg-primary-hover px-5 font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Chương Mới
        </Button>
      </div>

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
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 w-24 text-center">STT</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Tiêu Đề Chương</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Khóa / Phí</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Audio</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {chapters.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={FileText}
                      title="Chưa có chương nào"
                      description="Hãy thêm chương đầu tiên cho bộ truyện này."
                    />
                  </td>
                </tr>
              ) : (
                chapters.map((ch) => (
                  <tr key={ch.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-5 text-center">
                      <span className="text-sm font-mono font-black text-neutral-500 group-hover:text-primary transition-colors">
                        #{ch.chapterNumber}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{ch.title}</p>
                      <p className="text-[10px] text-neutral-500">{ch.content?.length || 0} ký tự</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {ch.unlockType === 'FREE' ? (
                          <Unlock className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-amber-400" />
                        )}
                        <span className="text-[10px] font-black uppercase text-neutral-400">
                          {ch.unlockType === 'FREE' ? 'Miễn phí' : `${ch.unlockPrice} Points`}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-black uppercase border",
                        ch.publishStatus === 'PUBLISHED'
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {ch.publishStatus === 'PUBLISHED' ? 'Đã đăng' : 'Bản nháp'}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-neutral-500 group-hover:text-primary transition-colors">
                        <PlayCircle className="h-4 w-4" />
                        <span className="text-[10px] font-bold">Chưa có</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(ch)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(ch.id)} className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
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

      {/* Chapter Modal (Drawer) */}
      {modal.show && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal({ show: false })} />
            <div className="relative w-full max-w-2xl h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
              <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-black text-white">{modal.chapter ? 'Cập Nhật Chương' : 'Thêm Chương Mới'}</h2>
                  <p className="text-xs text-neutral-500 mt-1">Chương #{formData.chapterNumber} cho {story?.title}</p>
                </div>
                <button onClick={() => setModal({ show: false })} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Tiêu Đề Chương</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ví dụ: Tiết 1: Khởi đầu mới"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Số Chương</label>
                      <input
                        type="number"
                        required
                        value={formData.chapterNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: Number(e.target.value) }))}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-mono font-bold text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Nội Dung Chương</label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Dán nội dung truyện vào đây..."
                      className="w-full h-96 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-medium leading-relaxed text-neutral-300 outline-none focus:border-primary transition-all resize-none font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Loại Khóa</label>
                      <AdminSelect
                        value={formData.unlockType}
                        onChange={(val) => setFormData(prev => ({ ...prev, unlockType: val }))}
                        options={[
                          { value: 'FREE', label: 'Miễn Phí' },
                          { value: 'POINT', label: 'Mở bằng Point' },
                          { value: 'COIN', label: 'Mở bằng Coin' },
                          { value: 'VIP', label: 'Chỉ dành cho VIP' },
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Giá Mở Khóa</label>
                      <input
                        type="number"
                        disabled={formData.unlockType === 'FREE' || formData.unlockType === 'VIP'}
                        value={formData.unlockPrice}
                        onChange={(e) => setFormData(prev => ({ ...prev, unlockPrice: Number(e.target.value) }))}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-mono font-bold text-white outline-none focus:border-primary transition-all disabled:opacity-30"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Trạng Thái</label>
                      <AdminSelect
                        value={formData.publishStatus}
                        onChange={(val) => setFormData(prev => ({ ...prev, publishStatus: val }))}
                        options={[
                          { value: 'PUBLISHED', label: 'Công khai ngay' },
                          { value: 'DRAFT', label: 'Lưu bản nháp' },
                        ]}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                  <Button type="button" onClick={() => setModal({ show: false })} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                    {isSubmitting ? 'Đang Lưu...' : 'Lưu Chương'}
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
