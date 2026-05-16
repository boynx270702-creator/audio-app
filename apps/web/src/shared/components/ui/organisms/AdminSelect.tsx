'use client';

import * as React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Option {
  value: string | number;
  label: string;
}

interface AdminSelectProps {
  value: string | number;
  onChange: (value: any) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
  direction?: 'up' | 'down';
}

export function AdminSelect({ value, onChange, options, placeholder, className, direction = 'down' }: AdminSelectProps) {
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

  const selected = options.find(opt => opt.value === value);

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between bg-black/50 border border-white/10 h-11 px-4 text-sm rounded-xl hover:border-primary/50 transition-all focus:outline-none group"
      >
        <span className={cn("font-bold truncate", selected ? "text-white" : "text-neutral-500")}>
          {selected ? selected.label : placeholder || 'Chọn...'}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-neutral-500 transition-transform duration-200 shrink-0 ml-2", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn(
          "absolute z-[1001] w-full rounded-xl border border-white/10 bg-[#181818] shadow-2xl shadow-black/50 animate-scale-in overflow-hidden",
          direction === 'up' ? "bottom-full mb-2 origin-bottom" : "mt-1 origin-top"
        )}>
          <div className="p-1 max-h-60 overflow-y-auto">
            {options.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all",
                  value === opt.value ? "bg-primary text-white" : "text-neutral-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span className={cn("font-medium", value === opt.value && "font-bold")}>{opt.label}</span>
                {value === opt.value && <Check className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
