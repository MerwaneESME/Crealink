import React from 'react';
import { cn } from '@/lib/utils';

interface BentoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'highlight';
}

const BentoCard = React.forwardRef<HTMLDivElement, BentoCardProps>(
  ({ children, className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border bg-black/40 backdrop-blur-sm',
          variant === 'default' ? 'border-white/10' : 'border-purple-500/30',
          'p-4 transition-all duration-200 ease-in-out',
          'hover:bg-white/5',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BentoCard.displayName = 'BentoCard';

export { BentoCard }; 