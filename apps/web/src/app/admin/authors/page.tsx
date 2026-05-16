'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import {
  Plus, Trash2, Edit3, X, User, Users, Image as ImageIcon, Search, ChevronRight
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [limit, setLimit] = React.useState(25);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);

  const [form, setForm] = React.useState({
    name: '',
    bio: '',
    avatarUrl: ''
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadData(currentPage, limit);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentPage, limit, search]);

  async function loadData(page = 1, l = 10) {
    setIsLoading(true);
    try {
      const res = await adminApi.authors.findAll(page, l, search);
      setAuthors(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ name: '', bio: '', avatarUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (author: any) => {
    setEditingId(author.id);
    setForm({
      name: author.name,
      bio: author.bio || '',
      avatarUrl: author.avatarUrl || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tác giả này? Tất cả truyện của tác giả này có thể bị ảnh hưởng.')) return;
    try {
      await adminApi.authors.delete(id);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi xóa tác giả.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await adminApi.authors.update(editingId, form);
      } else {
        await adminApi.authors.create(form);
      }
      setIsModalOpen(false);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi lưu thông tin tác giả.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Server-side search used instead of client-side filtering
  const filteredAuthors = authors;

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Content Management</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Tác Giả</h1>
          </div>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-10 rounded-xl bg-primary hover:bg-primary-hover px-5 font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Tác Giả
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6 mb-8 lg:mb-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm tác giả..."
                className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#121212] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative">
              {isLoading && (
                <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] flex items-center justify-center rounded-2xl animate-in fade-in duration-200">
                  <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
                </div>
              )}

              {filteredAuthors.length === 0 && !isLoading ? (
                <div className="col-span-full">
                  <EmptyState
                    icon={User}
                    title="Chưa có tác giả"
                    description={search ? `Không tìm thấy tác giả nào cho "${search}"` : "Hệ thống chưa có tác giả nào."}
                    action={!search && (
                      <Button onClick={openCreateModal} className="h-10 rounded-lg bg-primary/10 text-primary-light border border-primary/20 px-6 font-bold text-xs">
                        Thêm Tác Giả
                      </Button>
                    )}
                  />
                </div>
              ) : filteredAuthors.map((author) => (
                <div key={author.id} className="group relative bg-[#121212] rounded-2xl border border-white/10 p-6 hover:border-primary/40 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-2xl bg-neutral-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                      {author.avatarUrl ? (
                        <img src={author.avatarUrl} className="h-full w-full object-cover" alt={author.name} />
                      ) : (
                        <User className="h-8 w-8 text-neutral-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate group-hover:text-primary-light transition-colors">{author.name}</h3>
                      <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mt-1">
                        {author._count?.stories || 0} Truyện
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <p className="text-xs text-neutral-500 line-clamp-1 italic pr-4">
                      {author.bio || 'Chưa có tiểu sử.'}
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => openEditModal(author)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(author.id)} className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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


      {/* Modal (Drawer) */}
      <Portal>
        <div className={cn(
          "fixed inset-0 z-[1000] flex justify-end transition-all duration-500",
          isModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />

          <div className={cn(
            "relative w-full max-w-xl h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col transition-transform duration-500 ease-out",
            isModalOpen ? "translate-x-0" : "translate-x-full"
          )}>
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div>
                <h2 className="text-xl font-black text-white">{editingId ? 'Chỉnh Sửa Tác Giả' : 'Thêm Tác Giả Mới'}</h2>
                <p className="text-xs text-neutral-500 mt-1">Quản lý hồ sơ tác giả truyện</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên Tác Giả</label>
                  <input
                    name="name" value={form.name} onChange={handleFormChange} required
                    placeholder="Nhập tên tác giả..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Link Ảnh Đại Diện (Avatar URL)</label>
                  <input
                    name="avatarUrl" value={form.avatarUrl} onChange={handleFormChange}
                    placeholder="https://..."
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-medium text-neutral-300 outline-none focus:border-primary/50 transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tiểu Sử (Bio)</label>
                  <textarea
                    name="bio" value={form.bio} onChange={handleFormChange}
                    placeholder="Giới thiệu ngắn về tác giả..."
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-neutral-300 outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                  Hủy
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                  {isSubmitting ? 'Đang Lưu...' : (editingId ? 'Cập Nhật' : 'Lưu Tác Giả')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Portal>
    </div>
  );
}
