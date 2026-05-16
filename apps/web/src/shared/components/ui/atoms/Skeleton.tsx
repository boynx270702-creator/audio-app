import { cn } from "@/shared/utils/cn";

interface SkeletonProps {
  className?: string;
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'rect' }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-white/[0.04] rounded-md",
        variant === 'circle' && "rounded-full",
        variant === 'text' && "h-3 w-full",
        className
      )}
    />
  );
}
