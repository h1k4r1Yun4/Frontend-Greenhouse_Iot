import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  action,
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white rounded-[18px] border border-[#E6E1D6] shadow-card overflow-hidden transition-shadow duration-200',
          className
        )
      )}
    >
      {(title || subtitle || action) && (
        <div className="px-5 py-4 border-b border-[#EFECE4] flex items-center justify-between gap-4">
          <div className="min-w-0">
            {title && (
              <h3 className="text-base font-bold text-[#1F2933] leading-snug">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-[#52606D] mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
