'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, children, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label className="text-[11px] font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              "w-full h-12 bg-secondary/30 border border-transparent rounded-xl px-4 text-sm font-bold outline-none transition-all appearance-none cursor-pointer hover:bg-secondary/50 focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/5",
              className
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-foreground pointer-events-none transition-colors" />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
