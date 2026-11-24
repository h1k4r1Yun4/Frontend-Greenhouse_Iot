import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1F2933]/45 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        data-testid="modal-backdrop"
      />

      {/* Dialog box */}
      <div
        className={twMerge(
          clsx(
            'relative bg-white rounded-[20px] shadow-popover border border-[#E6E1D6] w-full max-h-[90vh] flex flex-col overflow-hidden z-10 animate-modal-in',
            maxWidthStyles[maxWidth]
          )
        )}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#EFECE4] flex-shrink-0">
          <div className="font-bold text-lg text-[#1F2933] leading-snug">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-[10px] text-[#52606D] hover:text-[#1F2933] hover:bg-[#EFECE4] transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 text-[#1F2933] overflow-y-auto flex-1">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#FAF9F6] border-t border-[#EFECE4] flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
