'use client';

import * as React from 'react';
import { cn } from '@/shared/utils/cn';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
}

export function Slider({ value, min, max, onChange, className }: SliderProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const calculateValue = (clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return min + pct * (max - min);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    onChange(calculateValue(e.clientX));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    onChange(calculateValue(e.touches[0].clientX));
  };

  React.useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calculateValue(e.clientX));
    };

    const handleTouchMove = (e: TouchEvent) => {
      onChange(calculateValue(e.touches[0].clientX));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, onChange, min, max]);

  const percentage = max > min ? ((value - min) / (max - min)) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-6 w-full cursor-pointer flex items-center group',
        className
      )}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Track Background */}
      <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden transition-all group-hover:h-2">
         <div 
           className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
           style={{ width: `${percentage}%` }}
         />
      </div>
      
      {/* Thumb */}
      <div 
        className={cn(
          "absolute h-4 w-4 rounded-full bg-white shadow-xl border-2 border-indigo-500 transition-transform",
          "left-0 -ml-2",
          isDragging ? "scale-125" : "scale-0 group-hover:scale-100"
        )}
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
