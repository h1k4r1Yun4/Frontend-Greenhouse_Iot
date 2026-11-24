import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-[12px] transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D] active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100';

  const sizeStyles = {
    sm: 'min-h-[36px] text-xs px-3 py-1.5 gap-1.5',
    md: 'min-h-[40px] text-sm px-4 py-2 gap-2',
    lg: 'min-h-[44px] text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:bg-[#E6E1D6] disabled:text-[#52606D] disabled:shadow-none',
    secondary:
      'bg-[#EFECE4] text-[#1F2933] border border-[#D8D2C5] hover:bg-[#E6E1D6] disabled:bg-[#F6F4EF] disabled:text-[#616E7C] disabled:border-[#E6E1D6]',
    danger:
      'bg-rose-700 text-white hover:bg-rose-800 shadow-sm disabled:bg-[#E6E1D6] disabled:text-[#52606D] disabled:shadow-none',
    outline:
      'border border-[#D8D2C5] text-[#1F2933] bg-white hover:bg-[#FAF9F6] hover:border-[#BDB5A5] disabled:bg-[#F6F4EF] disabled:text-[#616E7C] disabled:border-[#E6E1D6]',
    ghost:
      'text-[#52606D] hover:text-[#1F2933] hover:bg-[#EFECE4] disabled:text-[#9AA5B1] disabled:hover:bg-transparent',
  };

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)
      )}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
};
