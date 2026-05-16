import * as React from "react"
import { cn } from "@/shared/utils/cn"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-border/60 bg-secondary/20 px-4 py-2 text-sm font-bold text-foreground placeholder:text-muted-foreground/50 transition-all outline-none focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus:ring-destructive/5",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
