'use client';

import * as React from 'react';
import { adminApi } from '@/shared/services/api.service';
import { Button } from '@/shared/components/ui/atoms/Button';
import { 
  Wallet, Search, ArrowUpRight, ArrowDownLeft, 
  History, CreditCard, Gem, Zap, Coins,
  Plus, Minus, Filter, X
} from 'lucide-react';
import { Portal } from '@/shared/components/ui/atoms/Portal';
import { AdminPagination } from '@/shared/components/ui/organisms/AdminPagination';
import { AdminSelect } from '@/shared/components/ui/organisms/AdminSelect';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminWalletPage() {
  const [activeTab, setActiveTab] = React.useState<'wallets' | 'transactions'>('wallets');
  const [data, setData] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const [limit, setLimit] = React.useState(10);

  // Filters for transactions
  const [typeFilter, setTypeFilter] = React.useState('');
  const [currencyFilter, setCurrencyFilter] = React.useState('');

  // Modal states
  const [adjustModal, setAdjustModal] = React.useState<{ show: boolean, wallet?: any }>({ show: false });
  const [adjustData, setAdjustData] = React.useState({
    amount: 0,
    currency: 'LINH_THACH',
    type: 'ADMIN_ADJUST',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      let res;
      if (activeTab === 'wallets') {
        res = await adminApi.wallets.findAll(currentPage, limit, search);
      } else {
        res = await adminApi.transactions.findAll(currentPage, limit, search, typeFilter, currencyFilter);
      }
      setData(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentPage, limit, search, typeFilter, currencyFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModal.wallet) return;

    setIsSubmitting(true);
    try {
      await adminApi.wallets.adjust({
        userId: adjustModal.wallet.userId,
        ...adjustData
      });
      setAdjustModal({ show: false });
      fetchData();
    } catch (error) {
      console.error('Adjustment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'LINH_THACH': return <Zap className="h-3 w-3 text-emerald-400" />;
      case 'TIEN_NGOC': return <Gem className="h-3 w-3 text-blue-400" />;
      case 'THAN_TINH': return <ArrowUpRight className="h-3 w-3 text-purple-400" />;
      case 'CO_VAT': return <Coins className="h-3 w-3 text-amber-400" />;
      default: return null;
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case 'LINH_THACH': return 'Linh Thạch';
      case 'TIEN_NGOC': return 'Tiên Ngọc';
      case 'THAN_TINH': return 'Thần Tinh';
      case 'CO_VAT': return 'Cổ Vật';
      default: return currency;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-page-in relative overflow-hidden min-h-0">
      {/* Page Header */}
      <div className="flex items-center justify-between py-6 border-b border-white/10 mb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Economy Management</p>
            <h1 className="text-2xl font-black tracking-tight text-white">Quản Lý Kinh Tế</h1>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => { setActiveTab('wallets'); setCurrentPage(1); }}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'wallets' ? "bg-primary text-white shadow-lg" : "text-neutral-400 hover:text-white"
            )}
          >
            <CreditCard className="h-3.5 w-3.5" /> Ví Người Dùng
          </button>
          <button
            onClick={() => { setActiveTab('transactions'); setCurrentPage(1); }}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
              activeTab === 'transactions' ? "bg-primary text-white shadow-lg" : "text-neutral-400 hover:text-white"
            )}
          >
            <History className="h-3.5 w-3.5" /> Lịch Sử Giao Dịch
          </button>
        </div>
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
                placeholder="Tìm kiếm user, email..."
                className="w-full h-12 pl-12 pr-4 bg-black/50 border border-white/10 rounded-xl text-sm font-medium text-white outline-none focus:border-primary/50 transition-all placeholder:text-neutral-600"
              />
            </div>

            {activeTab === 'transactions' && (
              <>
                <AdminSelect
                  value={currencyFilter}
                  onChange={setCurrencyFilter}
                  options={[
                    { value: '', label: 'Tất cả loại tiền' },
                    { value: 'LINH_THACH', label: 'Linh Thạch' },
                    { value: 'TIEN_NGOC', label: 'Tiên Ngọc' },
                    { value: 'THAN_TINH', label: 'Thần Tinh' },
                  ]}
                  className="w-48"
                />
                <AdminSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: '', label: 'Tất cả loại GD' },
                    { value: 'TOPUP', label: 'Nạp tiền' },
                    { value: 'SPEND', label: 'Tiêu phí' },
                    { value: 'REWARD', label: 'Thưởng' },
                    { value: 'ADMIN_ADJUST', label: 'Admin điều chỉnh' },
                  ]}
                  className="w-48"
                />
              </>
            )}
          </div>
        </div>

        {/* Data Table */}
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
                  {activeTab === 'wallets' ? (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Người Dùng</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Linh Thạch</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Tiên Ngọc</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Thần Tinh</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500 text-right">Thao Tác</th>
                    </>
                  ) : (
                    <>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Thời Gian</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Người Dùng</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Số Tiền</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Loại / Nội Dung</th>
                      <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-neutral-500">Trạng Thái</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.map((item) => (
                  <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                    {activeTab === 'wallets' ? (
                      <>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-primary">
                              {item.user.profile?.displayName?.[0] || 'U'}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">{item.user.profile?.displayName || 'Thành viên'}</p>
                              <p className="text-[10px] text-neutral-500">{item.user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Zap className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-sm font-mono font-bold text-emerald-400">{item.linhThach.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <Gem className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-sm font-mono font-bold text-blue-400">{item.tienNgoc.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <ArrowUpRight className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-sm font-mono font-bold text-purple-400">{item.thanTinh.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Button 
                            onClick={() => setAdjustModal({ show: true, wallet: item })}
                            className="h-9 px-4 rounded-lg bg-white/5 hover:bg-primary hover:text-white text-xs font-bold border border-white/10 transition-all"
                          >
                            Điều Chỉnh
                          </Button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-8 py-5">
                          <p className="text-xs text-neutral-400 font-medium">
                            {format(new Date(item.createdAt), 'HH:mm - dd/MM', { locale: vi })}
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-sm font-bold text-white">{item.wallet?.user?.profile?.displayName || 'User'}</p>
                          <p className="text-[10px] text-neutral-500">{item.wallet?.user?.email}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm font-mono font-bold",
                              item.amount > 0 ? "text-emerald-400" : "text-red-400"
                            )}>
                              {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                            </span>
                            {getCurrencyIcon(item.currency)}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/5 text-neutral-400 border border-white/10">
                              {item.type}
                            </span>
                            <p className="text-xs text-neutral-500 truncate max-w-[200px]">{item.description || 'Không có mô tả'}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {item.status}
                          </span>
                        </td>
                      </>
                    )}
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
      </div>

      {/* Adjust Modal (Drawer) */}
      {adjustModal.show && (
        <Portal>
          <div className="fixed inset-0 z-[1000] flex justify-end">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAdjustModal({ show: false })} />
            <div className="relative w-full max-w-xl h-full bg-[#121212] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
              <div className="p-8 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-black text-white">Điều Chỉnh Số Dư</h2>
                  <p className="text-xs text-neutral-500 mt-1">Cập nhật tài sản cho {adjustModal.wallet?.user?.profile?.displayName}</p>
                </div>
                <button onClick={() => setAdjustModal({ show: false })} className="p-2 rounded-xl text-neutral-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleAdjust} className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Loại Tiền</label>
                      <AdminSelect
                        value={adjustData.currency}
                        onChange={(val) => setAdjustData(prev => ({ ...prev, currency: val }))}
                        options={[
                          { value: 'LINH_THACH', label: 'Linh Thạch' },
                          { value: 'TIEN_NGOC', label: 'Tiên Ngọc' },
                          { value: 'THAN_TINH', label: 'Thần Tinh' },
                        ]}
                        className="w-full"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Số Lượng</label>
                      <input
                        type="number"
                        required
                        value={adjustData.amount}
                        onChange={(e) => setAdjustData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-sm font-bold text-white outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-neutral-500 px-1">Lý Do / Mô Tả</label>
                    <textarea
                      required
                      value={adjustData.description}
                      onChange={(e) => setAdjustData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Nhập lý do điều chỉnh..."
                      className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-white outline-none focus:border-primary transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="p-8 border-t border-white/10 bg-white/[0.01] flex items-center gap-3 shrink-0">
                  <Button type="button" onClick={() => setAdjustModal({ show: false })} className="flex-1 h-12 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-neutral-400">
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-[2] h-12 rounded-xl bg-primary hover:bg-primary-hover font-bold text-white shadow-xl shadow-primary/20">
                    {isSubmitting ? 'Đang Xử Lý...' : 'Xác Nhận'}
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
