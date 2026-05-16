'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import {
  Plus, Trash2, Edit3, X, Users, Search, Shield, ShieldAlert, ShieldCheck, Mail, Gem, ChevronRight
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { EmptyState } from '@/shared/components/ui/molecules/EmptyState';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<any[]>([]);
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
    email: '',
    role: 'USER',
    status: 'ACTIVE',
    profile: {
      displayName: ''
    }
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
      const res = await adminApi.users.findAll(page, l, search);
      setUsers(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalItems(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setForm(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const openEditModal = (user: any) => {
    setEditingId(user.id);
    setForm({
      email: user.email,
      role: user.role,
      status: user.status,
      profile: {
        displayName: user.profile?.displayName || ''
      }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thành viên này? Hành động này không thể hoàn tác.')) return;
    try {
      await adminApi.users.delete(id);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi xóa thành viên.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminApi.users.update(editingId!, form);
      setIsModalOpen(false);
      loadData(currentPage);
    } catch (err) {
      alert('Lỗi khi lưu thông tin thành viên.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Server-side search used instead of client-side filtering
  const filteredUsers = users;

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">System Management</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Thành Viên</h1>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm email, tên..."
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

            <table className="w-full text-left whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Thành Viên</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Vai Trò</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Tài Sản</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length === 0 && !isLoading ? (
                  <tr>
                    <td colSpan={5}>
                      <EmptyState
                        icon={Users}
                        title="Chưa có thành viên"
                        description={search ? `Không tìm thấy kết quả nào cho "${search}"` : "Hệ thống chưa có thành viên nào."}
                      />
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-void-800 border border-white/10 flex items-center justify-center font-black text-xs text-primary-light">
                          {user.profile?.displayName?.[0] || user.email[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{user.profile?.displayName || 'Đạo hữu'}</p>
                          <p className="text-[10px] text-neutral-500 flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {user.role === 'ADMIN' ? <ShieldAlert className="h-4 w-4 text-red-400" /> :
                          user.role === 'MODERATOR' ? <ShieldCheck className="h-4 w-4 text-blue-400" /> :
                            <Shield className="h-4 w-4 text-neutral-500" />}
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          user.role === 'ADMIN' ? "text-red-400" :
                            user.role === 'MODERATOR' ? "text-blue-400" : "text-neutral-500"
                        )}>{user.role}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border",
                        user.status === 'ACTIVE' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                          user.status === 'BANNED' ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-neutral-800 text-neutral-500 border-neutral-700"
                      )}>{user.status}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400">
                          <Gem className="h-3 w-3 text-primary-light" /> {user.wallet?.linhThach || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(user)} className="p-2 rounded-lg text-neutral-500 hover:text-white hover:bg-white/5">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10">
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
                  <h2 className="text-xl font-black text-white">Sửa Thông Tin Thành Viên</h2>
                  <p className="text-xs text-neutral-500 mt-1">Cập nhật vai trò và trạng thái tài khoản</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Tên Hiển Thị</label>
                    <input
                      name="profile.displayName" value={form.profile.displayName} onChange={handleFormChange} required
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Vai Trò</label>
                      <select
                        name="role" value={form.role} onChange={handleFormChange}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                      >
                        <option value="USER">USER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</label>
                      <select
                        name="status" value={form.status} onChange={handleFormChange}
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary/50 transition-all"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="BANNED">BANNED</option>
                        <option value="INACTIVE">INACTIVE</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                  <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                    {isSubmitting ? 'Đang Lưu...' : 'Cập Nhật Thành Viên'}
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
