'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

const STATUS_OPTIONS = [
  { value: 'ONGOING', label: 'Đang Ra', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { value: 'COMPLETED', label: 'Hoàn Thành', color: 'text-green-400', bg: 'bg-green-400/10' },
  { value: 'DROPPED', label: 'Tạm Ngưng', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
];

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function StatusSelect({ value, onChange }: StatusSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selected = STATUS_OPTIONS.find(opt => opt.value === value) || STATUS_OPTIONS[0];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-black/50 border border-white/10 h-11 px-3 text-sm rounded-lg hover:border-primary/50 transition-all focus:outline-none group"
      >
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", selected.value === 'ONGOING' ? 'bg-blue-400' : selected.value === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400')} />
          <span className="font-bold text-neutral-200">{selected.label}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-[1001] mt-1 w-full rounded-lg border border-white/10 bg-[#181818] shadow-xl shadow-black/50 animate-scale-in origin-top overflow-hidden">
          <div className="p-1">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all",
                  value === opt.value ? "bg-white/10 text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <div className={cn("h-1.5 w-1.5 rounded-full", opt.value === 'ONGOING' ? 'bg-blue-400' : opt.value === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400')} />
                  <span className={cn("font-medium", value === opt.value && "font-bold")}>{opt.label}</span>
                </div>
                {value === opt.value && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
