import * as React from 'react';
import { cn } from '@/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-2xl border border-white/10 bg-slate-950/40 backdrop-blur-md px-4 py-2 text-base sm:text-sm text-white placeholder:text-slate-400/60 shadow-[inset_0_1px_2px_rgba(255,255,255,0.08),inset_0_-1px_2px_rgba(0,0,0,0.5),0_4px_12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-white/20 hover:bg-slate-950/50 focus-visible:outline-none focus-visible:border-indigo-400/60 focus-visible:ring-2 focus-visible:ring-indigo-500/25 focus-visible:shadow-[0_0_16px_rgba(99,102,241,0.25),inset_0_1px_2px_rgba(255,255,255,0.12)] disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };

