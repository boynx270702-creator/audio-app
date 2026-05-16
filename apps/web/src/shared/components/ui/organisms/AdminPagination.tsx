'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { AdminSelect } from './AdminSelect';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  limit,
  onPageChange,
  onLimitChange,
  className
}: AdminPaginationProps) {
  
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  const limitOptions = [
    { value: 10, label: '10 bản ghi' },
    { value: 25, label: '25 bản ghi' },
    { value: 50, label: '50 bản ghi' },
    { value: 100, label: '100 bản ghi' },
  ];

  return (
    <div className={cn(
      "flex items-center justify-between border-t border-white/10 px-8 py-4 bg-white/[0.02] transition-all",
      className
    )}>
      {/* Left: Limit Selection */}
      <div className="flex items-center gap-3">
        <AdminSelect 
          value={limit}
          onChange={onLimitChange}
          options={limitOptions}
          className="w-40"
          direction="up"
        />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 hidden sm:inline">
          Tổng {totalItems.toLocaleString('vi-VN')}
        </span>
      </div>

      {/* Center: Page Numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, idx) => (
          <React.Fragment key={idx}>
            {page === '...' ? (
              <span className="w-8 h-8 flex items-center justify-center text-neutral-600 text-xs font-bold">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-black transition-all",
                  currentPage === page
                    ? "bg-white/[0.08] text-white border border-white/10"
                    : "text-neutral-500 hover:text-white hover:bg-white/5"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right: Next/Prev Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-bold transition-all",
            currentPage === 1 
              ? "opacity-20 cursor-not-allowed" 
              : "text-neutral-300 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 hover:text-white"
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 text-xs font-bold transition-all",
            currentPage === totalPages 
              ? "opacity-20 cursor-not-allowed" 
              : "text-neutral-300 bg-white/[0.02] hover:bg-white/5 hover:border-white/20 hover:text-white"
          )}
        >
          <span className="hidden sm:inline">Tiếp</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
