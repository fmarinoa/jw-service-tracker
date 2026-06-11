import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 cursor-pointer',
          variant === 'default' && 'bg-primary text-primary-foreground hover:brightness-95 shadow-sm',
          variant === 'outline' && 'border border-border bg-card hover:bg-background text-foreground',
          variant === 'ghost' && 'hover:bg-background text-muted-foreground hover:text-foreground',
          variant === 'destructive' && 'bg-red-50 text-red-600 hover:bg-red-100',
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
