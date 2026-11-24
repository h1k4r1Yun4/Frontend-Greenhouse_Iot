import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className,
  dot = false,
}) => {
  const variantStyles = {
    success: 'bg-[#EAF6EE] text-[#14532D] border-[#B7E1C6]',
    warning: 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
    danger: 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]',
    info: 'bg-[#F0F9FF] text-[#075985] border-[#BAE6FD]',
    neutral: 'bg-[#F6F4EF] text-[#3E4C59] border-[#E2DDD2]',
  };

  const dotColors = {
    success: 'bg-[#15803D]',
    warning: 'bg-[#D97706]',
    danger: 'bg-[#BE123C]',
    info: 'bg-[#0369A1]',
    neutral: 'bg-[#616E7C]',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
          variantStyles[variant],
          className
        )
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={clsx('w-1.5 h-1.5 rounded-full inline-block flex-shrink-0', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
};
