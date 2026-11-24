import React from 'react';
import {
  LayoutDashboard,
  ToggleRight,
  Sliders,
  AlertTriangle,
  LineChart,
  Bot,
  Sprout,
  Radio,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useGreenhouse } from '../../context/GreenhouseContext';

export type NavTab = 'dashboard' | 'controls' | 'automation' | 'alerts' | 'history' | 'chatbot';

export interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { unreadAlertsCount, gateway, zones, connectionStatus } = useGreenhouse();
  const isOnline = connectionStatus === 'online';

  const navItems: {
    id: NavTab;
    label: string;
    srSuffix?: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      srSuffix: ' (Dashboard)',
      icon: <LayoutDashboard className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
    },
    {
      id: 'controls',
      label: 'Điều khiển',
      srSuffix: ' (Controls)',
      icon: <ToggleRight className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
    },
    {
      id: 'automation',
      label: 'Tự động hóa',
      srSuffix: ' (Automation)',
      icon: <Sliders className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
    },
    {
      id: 'alerts',
      label: 'Cảnh báo',
      srSuffix: ' (Alerts)',
      icon: <AlertTriangle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    {
      id: 'history',
      label: 'Lịch sử & Biểu đồ',
      icon: <LineChart className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
    },
    {
      id: 'chatbot',
      label: 'Trợ lý AI Gemini',
      icon: <Bot className="w-5 h-5 flex-shrink-0" aria-hidden="true" />,
      badge: 'AI',
    },
  ];

  const handleItemClick = (id: NavTab) => {
    onTabChange(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const renderNavContent = (collapsed: boolean, isMobileMode: boolean = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div
        className={`p-4 border-b border-[#E2DDD2] flex items-center ${
          collapsed
            ? 'justify-center px-2'
            : isMobileMode
            ? 'justify-between px-5'
            : 'justify-center lg:justify-between lg:px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#1F2933] flex items-center justify-center text-[#F6F4EF] shadow-sm flex-shrink-0">
            <Sprout className="w-5 h-5" aria-hidden="true" />
          </div>
          {!collapsed && (
            <div className={`${isMobileMode ? 'block' : 'hidden lg:block'} truncate`}>
              <div className="font-bold text-[15px] tracking-tight text-[#1F2933] leading-tight">
                Greenhouse IoT
              </div>
              <p className="text-[11px] text-[#52606D] mt-0.5 truncate">
                Giám sát &amp; Điều khiển
              </p>
            </div>
          )}
        </div>

        {isMobileMode && onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="p-2 text-[#52606D] hover:text-[#1F2933] rounded-[10px] hover:bg-[#E6E1D6] transition-colors cursor-pointer"
            aria-label="Đóng thanh điều hướng"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation Links (overflow-visible so collapsed tooltips never clip) */}
      <nav
        aria-label="Điều hướng chính"
        className={`flex-1 py-4 space-y-1.5 overflow-visible ${
          collapsed ? 'px-2' : isMobileMode ? 'px-3' : 'px-2 lg:px-3'
        }`}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                type="button"
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center rounded-[12px] font-semibold text-[13px] transition-all duration-150 relative cursor-pointer ${
                  collapsed
                    ? 'justify-center p-3'
                    : isMobileMode
                    ? 'justify-between px-3.5 py-2.5'
                    : 'justify-center p-3 lg:justify-between lg:px-3.5 lg:py-2.5'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#3E4C59] hover:text-[#1F2933] hover:bg-[#E6E1D6]/70'
                }`}
                title={collapsed ? `${item.label}${item.srSuffix || ''}` : undefined}
              >
                <div
                  className={`flex items-center ${
                    collapsed
                      ? 'justify-center'
                      : isMobileMode
                      ? 'gap-3 min-w-0'
                      : 'justify-center lg:justify-start lg:gap-3 min-w-0'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-[#52606D] group-hover:text-[#1F2933]'}>
                    {item.icon}
                  </span>
                  <span
                    className={
                      collapsed
                        ? 'sr-only'
                        : isMobileMode
                        ? 'truncate'
                        : 'sr-only lg:not-sr-only lg:truncate'
                    }
                  >
                    {item.label}
                    {item.srSuffix && <span className="sr-only">{item.srSuffix}</span>}
                  </span>
                </div>

                {/* Expanded Badge */}
                {!collapsed && item.badge !== undefined && (
                  <span
                    className={`${isMobileMode ? 'inline-flex' : 'hidden lg:inline-flex'} px-2 py-0.5 rounded-full text-[11px] font-bold tabular-nums ${
                      item.badge === 'AI'
                        ? isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#E6E1D6] text-[#3E4C59]'
                        : isActive
                        ? 'bg-white text-rose-700'
                        : 'bg-rose-700 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Rail Dot Indicator */}
                {item.badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className={`${
                      collapsed ? 'block' : isMobileMode ? 'hidden' : 'block lg:hidden'
                    } absolute top-2 right-2 w-2 h-2 rounded-full ${
                      item.badge === 'AI' ? 'bg-[#52606D]' : 'bg-rose-700'
                    }`}
                  />
                )}
              </button>

              {/* Hover Tooltip for Rail Mode */}
              <div
                className={`${
                  collapsed ? 'block' : isMobileMode ? 'hidden' : 'block lg:hidden'
                } opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#1F2933] text-white text-xs font-semibold rounded-[8px] shadow-popover whitespace-nowrap z-50`}
              >
                {item.label}
                {item.badge !== undefined && (
                  <span className="ml-1.5 text-[10px] text-[#86CC9F]">({item.badge})</span>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Collapse Rail Toggle Button (Desktop >= lg) */}
      {!isMobileMode && onToggleCollapse && (
        <div className="hidden lg:block px-3 py-2 border-t border-[#E2DDD2]">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-[#52606D] hover:text-[#1F2933] hover:bg-[#E6E1D6]/70 rounded-[10px] transition-colors text-xs font-semibold gap-2 cursor-pointer"
            title={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                <span>Thu gọn thanh bên</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Hardware Node Status Footer */}
      <div className="p-3 border-t border-[#E2DDD2]">
        <div
          className={`${
            collapsed ? 'hidden' : isMobileMode ? 'block' : 'hidden lg:block'
          } p-3 rounded-[14px] bg-white border border-[#E2DDD2] text-xs`}
        >
          <div className="flex items-center justify-between gap-1.5 text-[#1F2933] font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
              <Radio
                className={`w-3.5 h-3.5 flex-shrink-0 ${isOnline ? 'text-[#52606D]' : 'text-[#BE123C]'}`}
                aria-hidden="true"
              />
              Trạm phần cứng
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-semibold border whitespace-nowrap flex-shrink-0 ${
                isOnline
                  ? 'bg-[#F6F4EF] text-[#3E4C59] border-[#D8D2C5]'
                  : 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
              }`}
            >
              {isOnline ? '3/3 Online' : 'Offline'}
            </span>
          </div>
          <div className="space-y-1 text-[#52606D] text-[11px] tabular-nums">
            <div className="flex items-center justify-between">
              <span>Gateway ESP32:</span>
              <span className="text-[#1F2933] font-mono font-semibold">
                {isOnline ? `${gateway.lightIntensity} Lux` : '-- Lux'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Node 1 (Cà chua):</span>
              <span className="text-[#1F2933] font-mono font-semibold">
                {isOnline ? `${zones[0]?.current.temperature ?? '--'}°C` : '--°C'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Node 2 (Xà lách):</span>
              <span className="text-[#1F2933] font-mono font-semibold">
                {isOnline ? `${zones[1]?.current.temperature ?? '--'}°C` : '--°C'}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Rail Dots */}
        <div
          className={`${
            collapsed ? 'flex' : isMobileMode ? 'hidden' : 'flex lg:hidden'
          } py-1 flex-col items-center gap-2`}
          title={isOnline ? '3 Nodes Online (ESP32, Node 1, Node 2)' : 'Mất kết nối phần cứng'}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-[#3E4C59]' : 'bg-[#BE123C]'}`} />
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#616E7C]' : 'bg-[#FDA4AF]'}`} />
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-[#616E7C]' : 'bg-[#FDA4AF]'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Desktop (w-60 / w-[72px]) & Tablet (md:w-[72px]) Sidebar */}
      <aside
        className={`hidden md:flex flex-col flex-shrink-0 min-h-screen bg-[#EFECE4] text-[#1F2933] border-r border-[#E2DDD2] transition-all duration-300 ease-out ${
          isCollapsed ? 'w-[72px]' : 'md:w-[72px] lg:w-60'
        }`}
      >
        {renderNavContent(isCollapsed, false)}
      </aside>

      {/* 2. Mobile Slide-out Drawer (< md) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#1F2933]/50 transition-opacity"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full bg-[#EFECE4] text-[#1F2933] shadow-popover flex flex-col z-10 border-r border-[#E2DDD2] animate-drawer-in">
            {renderNavContent(false, true)}
          </aside>
        </div>
      )}
    </>
  );
};
