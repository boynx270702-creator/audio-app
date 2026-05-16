'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import {
  Plus, Trash2, Edit3, X, Zap, Tag, Search, ChevronRight
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = React.useState<any[]>([]);
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
    description: ''
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
      const res = await adminApi.categories.findAll(page, l, search);
      setCategories(res.data || []);
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
    setForm({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thể loại này?')) return;
    try {
      await adminApi.categories.delete(id);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi xóa thể loại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await adminApi.categories.update(editingId, form);
      } else {
        await adminApi.categories.create(form);
      }
      setIsModalOpen(false);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi lưu thông tin thể loại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Server-side search used instead of client-side filtering
  const filteredCategories = categories;

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Tag className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Content Management</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Thể Loại</h1>
          </div>
        </div>
        <Button
          onClick={openCreateModal}
          className="h-10 rounded-xl bg-primary hover:bg-primary-hover px-5 font-bold text-xs shadow-lg shadow-primary/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 text-white"
        >
          <Plus className="h-4 w-4" /> Thêm Thể Loại
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm thể loại..."
                className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>
        </div>

        <div className="flex-1 bg-[#121212] rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
                <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
              </div>
            )}

            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên Thể Loại</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Mô Tả</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Số Truyện</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCategories.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={4}>
                      <EmptyState
                        icon={Zap}
                        title="Chưa có thể loại"
                        description={search ? `Không tìm thấy kết quả nào cho "${search}"` : "Hệ thống chưa có thể loại nào. Hãy thêm ngay!"}
                        action={!search && (
                          <Button onClick={openCreateModal} className="h-10 rounded-lg bg-primary/10 text-primary-light border border-primary/20 px-6 font-bold text-xs">
                            Thêm Thể Loại
                          </Button>
                        )}
                      />
                    </td>
                  </tr>
                ) : filteredCategories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary-light">
                          <Zap className="h-4 w-4 fill-current" />
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm text-neutral-500 line-clamp-1 max-w-md">{cat.description || 'Chưa có mô tả.'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-neutral-400 bg-white/5 px-2 py-1 rounded-md border border-white/10">
                        {cat._count?.stories || 0}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(cat)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
                  <h2 className="text-xl font-black text-white">{editingId ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại'}</h2>
                  <p className="text-xs text-neutral-500 mt-1">Quản lý phân loại nội dung truyện</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên Thể Loại</label>
                    <input
                      name="name" value={form.name} onChange={handleFormChange} required
                      placeholder="Tiên Hiệp, Kiếm Hiệp..."
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Mô Tả</label>
                    <textarea
                      name="description" value={form.description} onChange={handleFormChange}
                      placeholder="Mô tả về thể loại này..."
                      className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-neutral-300 outline-none focus:border-primary/50 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                  <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                    {isSubmitting ? 'Đang Lưu...' : (editingId ? 'Cập Nhật' : 'Lưu Thể Loại')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </Portal>
      </div>
    </div>
  );
}
