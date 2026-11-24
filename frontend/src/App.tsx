import React, { useState } from 'react';
import { GreenhouseProvider, useGreenhouse } from './context/GreenhouseContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ControlsPage } from './pages/ControlsPage';
import { AutomationPage } from './pages/AutomationPage';
import { AlertsPage } from './pages/AlertsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { IntegrationConfigModal } from './components/common/IntegrationConfigModal';
import {
  LayoutDashboard,
  ToggleRight,
  Sliders,
  AlertTriangle,
  LineChart,
  Bot,
  ShieldAlert,
  RotateCcw,
  WifiOff,
  X,
} from 'lucide-react';

export const AppContent: React.FC = () => {
  const {
    isEmergencyHalted,
    rearmSystem,
    userRole,
    connectionStatus,
    unreadAlertsCount,
    backendError,
    clearBackendError,
  } = useGreenhouse();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [integrationModalState, setIntegrationModalState] = useState<{
    isOpen: boolean;
    initialTab: 'backend' | 'ai';
  }>({ isOpen: false, initialTab: 'backend' });

  const openIntegrationModal = (tab: 'backend' | 'ai' = 'backend') => {
    setIntegrationModalState({ isOpen: true, initialTab: tab });
  };

  const canControl = userRole === 'admin' || userRole === 'operator';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage onNavigateTab={(tab) => setActiveTab(tab as NavTab)} />;
      case 'controls':
        return <ControlsPage />;
      case 'automation':
        return <AutomationPage />;
      case 'alerts':
        return <AlertsPage />;
      case 'history':
        return <HistoryPage />;
      case 'chatbot':
        return <ChatbotPage onOpenAiConfig={() => openIntegrationModal('ai')} />;
      default:
        return <DashboardPage onNavigateTab={(tab) => setActiveTab(tab as NavTab)} />;
    }
  };

  const mobileNavItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-5 h-5" aria-hidden="true" /> },
    { id: 'controls', label: 'Điều khiển', icon: <ToggleRight className="w-5 h-5" aria-hidden="true" /> },
    { id: 'automation', label: 'Kịch bản', icon: <Sliders className="w-5 h-5" aria-hidden="true" /> },
    {
      id: 'alerts',
      label: 'Cảnh báo',
      icon: <AlertTriangle className="w-5 h-5" aria-hidden="true" />,
      badge: unreadAlertsCount > 0 ? unreadAlertsCount : undefined,
    },
    { id: 'history', label: 'Lịch sử', icon: <LineChart className="w-5 h-5" aria-hidden="true" /> },
    { id: 'chatbot', label: 'AI Chat', icon: <Bot className="w-5 h-5" aria-hidden="true" /> },
  ];

  return (
    <div className="flex h-screen w-full bg-[#F6F4EF] overflow-hidden text-[#1F2933]">
      {/* Desktop & Tablet Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileDrawerOpen}
        onCloseMobile={() => setIsMobileDrawerOpen(false)}
      />

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar
          onNavigateAlerts={() => setActiveTab('alerts')}
          onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
          onOpenConfig={() => openIntegrationModal('backend')}
        />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto px-3.5 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-5 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto space-y-5">
            {/* Global Emergency Halted Strip on non-Controls views */}
            {isEmergencyHalted && activeTab !== 'controls' && (
              <div
                role="alert"
                className="bg-[#9F1239] text-white rounded-[16px] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-white flex-shrink-0" aria-hidden="true" />
                  <div className="text-xs">
                    <span className="font-bold uppercase tracking-wide block">
                      Trạng thái khóa khẩn cấp: EMERGENCY HALTED
                    </span>
                    <span className="text-rose-100">
                      Toàn bộ thiết bị đã bị ngắt điện và khóa liên động trên toàn hệ thống.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('controls')}
                    className="px-3 py-1.5 rounded-[10px] bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Mở Điều khiển
                  </button>
                  {canControl && (
                    <button
                      type="button"
                      onClick={rearmSystem}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-white text-[#9F1239] hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Khôi phục (Re-arm)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Offline Warning Strip */}
            {connectionStatus === 'offline' && (
              <div
                role="status"
                className="bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] rounded-[14px] px-4 py-2.5 text-xs font-medium flex items-center gap-2.5"
              >
                <WifiOff className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
                <span>
                  Mất kết nối với Gateway ESP32 — Dữ liệu đang tạm dừng cập nhật cho tới khi khôi phục kết nối.
                </span>
              </div>
            )}

            {/* Backend Error Strip */}
            {backendError && (
              <div
                role="alert"
                className="bg-[#FEF3C7] border border-[#FCD34D] text-[#92400E] rounded-[14px] px-4 py-2.5 text-xs font-medium flex items-center justify-between gap-2.5"
              >
                <span>{backendError}</span>
                <button
                  type="button"
                  onClick={clearBackendError}
                  className="p-1 rounded hover:bg-[#FDE68A] cursor-pointer"
                  aria-label="Đóng thông báo lỗi"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            )}

            {renderActiveView()}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (< md) */}
        <nav
          aria-label="Điều hướng di động"
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2DDD2] grid grid-cols-6 py-1 px-1 shadow-popover"
        >
          {mobileNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative min-h-[44px] min-w-[44px] px-1 py-1 rounded-[10px] flex flex-col items-center justify-center gap-1 text-[10px] leading-none transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF6EE] text-[#15803D] font-bold'
                    : 'text-[#52606D] hover:text-[#1F2933] font-medium'
                }`}
              >
                <span className="[&>svg]:w-[18px] [&>svg]:h-[18px]">{item.icon}</span>
                <span className="truncate max-w-full">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 right-2.5 w-2 h-2 rounded-full bg-rose-700"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend & AI Integration Modal */}
      <IntegrationConfigModal
        isOpen={integrationModalState.isOpen}
        onClose={() => setIntegrationModalState((prev) => ({ ...prev, isOpen: false }))}
        initialTab={integrationModalState.initialTab}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <GreenhouseProvider>
      <AppContent />
    </GreenhouseProvider>
  );
};

export default App;
