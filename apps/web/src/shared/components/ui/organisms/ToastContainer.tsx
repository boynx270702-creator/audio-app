'use client';

import * as React from 'react';
import { useToastStore, Toast } from '@/shared/stores/useToastStore';
import { cn } from '@/shared/utils/cn';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-6 z-[100] flex flex-col gap-3 w-full max-w-[320px] pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    error: <AlertCircle className="h-4 w-4 text-red-400" />,
    info: <Info className="h-4 w-4 text-primary-light" />,
    warning: <AlertTriangle className="h-4 w-4 text-amber-400" />,
  };

  return (
    <div className={cn(
      "pointer-events-auto flex items-center gap-3 p-3 rounded-lg border shadow-2xl animate-scale-in",
      "bg-[#181818] border-white/[0.08] text-neutral-100"
    )}>
      <div className="shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-xs font-bold leading-relaxed">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 rounded-md text-neutral-600 hover:text-neutral-300 hover:bg-white/5 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
