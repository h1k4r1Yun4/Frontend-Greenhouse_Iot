import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Shield,
  User,
  Eye,
  Clock,
  Menu,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useGreenhouse } from '../../context/GreenhouseContext';
import { ConnectionBadge } from './ConnectionBadge';
import { UserRole } from '../../types';

export interface NavbarProps {
  onNavigateAlerts?: () => void;
  onOpenMobileMenu?: () => void;
  onOpenConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateAlerts,
  onOpenMobileMenu,
  onOpenConfig,
}) => {
  const {
    userRole,
    setUserRole,
    unreadAlertsCount,
    lastSyncTime,
    telemetryInterval,
  } = useGreenhouse();

  const [isMobileRoleMenuOpen, setIsMobileRoleMenuOpen] = useState(false);
  const mobileRoleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileRoleRef.current && !mobileRoleRef.current.contains(event.target as Node)) {
        setIsMobileRoleMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileRoleMenuOpen(false);
      }
    };
    if (isMobileRoleMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileRoleMenuOpen]);

  const roleLabels: Record<UserRole, { label: string; desc: string; icon: React.ReactNode }> = {
    admin: {
      label: 'Admin',
      desc: 'Toàn quyền điều hành',
      icon: <Shield className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    operator: {
      label: 'Operator',
      desc: 'Vận hành thiết bị',
      icon: <User className="w-3.5 h-3.5" aria-hidden="true" />,
    },
    viewer: {
      label: 'Viewer',
      desc: 'Chỉ xem (khóa lệnh)',
      icon: <Eye className="w-3.5 h-3.5" aria-hidden="true" />,
    },
  };

  const formattedTime = new Date(lastSyncTime).toLocaleTimeString('vi-VN');

  return (
    <header className="sticky top-0 z-30 bg-[#F6F4EF] border-b border-[#E2DDD2] px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Hamburger menu (Mobile) + Single-source Live Sync Timestamp */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 -ml-1 min-h-[40px] min-w-[40px] flex items-center justify-center text-[#52606D] hover:text-[#1F2933] hover:bg-[#EFECE4] rounded-[10px] transition-colors cursor-pointer flex-shrink-0"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        {/* Desktop / Tablet Live Sync Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[#52606D]">
          <span className="flex items-center gap-1.5 font-mono tabular-nums">
            <Clock className="w-3.5 h-3.5 text-[#616E7C]" aria-hidden="true" />
            <span>Cập nhật: {formattedTime}</span>
          </span>
          <span className="text-[#D8D2C5]" aria-hidden="true">•</span>
          <span className="inline-flex items-center gap-1.5 bg-white text-[#3E4C59] px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[#E2DDD2] tabular-nums">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B8794]" aria-hidden="true" />
            Chu kỳ {telemetryInterval}s
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
        <ConnectionBadge onOpenConfig={onOpenConfig} />

        {/* Segmented Role Switcher (>= sm) */}
        <div className="hidden sm:flex items-center bg-[#EFECE4] p-0.5 rounded-[12px] border border-[#E2DDD2] text-xs">
          {(['admin', 'operator', 'viewer'] as UserRole[]).map((role) => {
            const isSelected = userRole === role;
            const activeStyle =
              role === 'viewer'
                ? 'bg-[#FEF3C7] text-[#92400E] font-bold shadow-card'
                : 'bg-white text-[#1F2933] font-semibold shadow-card';
            return (
              <button
                key={role}
                type="button"
                onClick={() => setUserRole(role)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[9px] transition-all cursor-pointer ${
                  isSelected
                    ? activeStyle
                    : 'text-[#52606D] hover:text-[#1F2933]'
                }`}
                title={`Chuyển sang vai trò ${roleLabels[role].label}`}
              >
                <span className={isSelected && role !== 'viewer' ? 'text-[#1F2933]' : ''}>
                  {roleLabels[role].icon}
                </span>
                <span className="capitalize">{role}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile warm pill role selector (< sm) */}
        <div className="relative sm:hidden" ref={mobileRoleRef}>
          <button
            type="button"
            onClick={() => setIsMobileRoleMenuOpen((prev) => !prev)}
            aria-label="Chọn vai trò người dùng"
            aria-expanded={isMobileRoleMenuOpen}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold shadow-card cursor-pointer whitespace-nowrap transition-colors ${
              userRole === 'viewer'
                ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]'
                : 'bg-white border-[#D8D2C5] text-[#1F2933] hover:bg-[#FAF9F6]'
            }`}
          >
            {roleLabels[userRole].icon}
            <span>{roleLabels[userRole].label}</span>
            <ChevronDown
              className={`w-3 h-3 text-[#52606D] transition-transform duration-150 ${
                isMobileRoleMenuOpen ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>

          {isMobileRoleMenuOpen && (
            <div
              role="menu"
              aria-label="Danh sách vai trò"
              className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E6E1D6] rounded-[14px] shadow-popover p-1.5 z-50 animate-modal-in"
            >
              {(['admin', 'operator', 'viewer'] as UserRole[]).map((role) => {
                const isSelected = userRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    role="menuitemradio"
                    aria-checked={isSelected}
                    onClick={() => {
                      setUserRole(role);
                      setIsMobileRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-[10px] text-left text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? role === 'viewer'
                          ? 'bg-[#FEF3C7] text-[#92400E] font-bold'
                          : 'bg-[#FAF9F6] text-[#1F2933] font-bold'
                        : 'text-[#3E4C59] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      {roleLabels[role].icon}
                      <span className="truncate">
                        {roleLabels[role].label}
                        <span className="block text-[10px] font-normal text-[#616E7C]">
                          {roleLabels[role].desc}
                        </span>
                      </span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#1F2933] flex-shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notification bell */}
        <button
          type="button"
          onClick={onNavigateAlerts}
          className="relative p-2 min-h-[38px] min-w-[38px] rounded-[10px] text-[#52606D] hover:text-[#1F2933] hover:bg-[#EFECE4] transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Xem cảnh báo"
        >
          <Bell className="w-5 h-5" aria-hidden="true" />
          {unreadAlertsCount > 0 && (
            <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-700 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-[#F6F4EF] tabular-nums">
              {unreadAlertsCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
