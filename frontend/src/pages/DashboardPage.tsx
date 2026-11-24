import React from 'react';
import { useGreenhouse } from '../context/GreenhouseContext';
import { ZoneOverviewCard } from '../components/dashboard/ZoneOverviewCard';
import { GatewayLightCard } from '../components/dashboard/GatewayLightCard';
import { ActuatorToggleCard } from '../components/controls/ActuatorToggleCard';
import { AlertListItem } from '../components/alerts/AlertListItem';
import { Bell, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';

export interface DashboardPageProps {
  onNavigateTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const { zones, gateway, actuators, alerts } = useGreenhouse();

  const recentAlerts = alerts.slice(0, 3);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Clean Page Header Row (Single-source timestamp stays in Navbar; no duplicate timestamps) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[19px] sm:text-[26px] font-extrabold tracking-tight text-[#1F2933] leading-snug sm:leading-tight">
            Trung Tâm Giám Sát &amp; Điều Hành Nhà Kính IoT
          </h1>
          <p className="text-xs sm:text-sm text-[#52606D] mt-0.5 max-w-2xl">
            Theo dõi vi khí hậu 2 trạm Node ESP8266 (Cà chua &amp; Xà lách) và Gateway ESP32 LDR.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Button
            variant="primary"
            icon={<Sparkles className="w-4 h-4" />}
            onClick={() => onNavigateTab?.('chatbot')}
          >
            Hỏi Trợ lý AI Gemini
          </Button>
        </div>
      </div>

      {/* Upper Row: 2 Zones Real-time Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {zones.map((zone) => (
          <ZoneOverviewCard key={zone.zoneId} zone={zone} />
        ))}
      </div>

      {/* Lower Above-the-Fold Operational Band (1fr Gateway + 1.6fr 2x2 Quick Actuator Switches) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_1.6fr] gap-4 sm:gap-5 items-stretch">
        <GatewayLightCard gateway={gateway} />

        <section className="bg-white rounded-[18px] border border-[#E6E1D6] shadow-card p-5 flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#EFECE4]">
            <div>
              <h2 className="font-bold text-[15px] sm:text-base text-[#1F2933] leading-snug">
                Trạng Thái Nhanh 4 Thiết Bị Chấp Hành
              </h2>
              <p className="text-xs text-[#52606D] mt-0.5">
                Bật tắt nhanh máy bơm, phun sương, quạt và đèn chiếu sáng
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab?.('controls')}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#15803D] hover:text-[#166534] hover:underline cursor-pointer"
            >
              <span>Quản trị điều khiển chi tiết</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 flex-1 auto-rows-fr">
            {actuators.map((actuator) => (
              <ActuatorToggleCard key={actuator.id} actuator={actuator} compact={true} />
            ))}
          </div>
        </section>
      </div>

      {/* Below-the-Fold Recent Alerts Widget */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-bold text-base sm:text-lg text-[#1F2933] flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
            <span>Cảnh Báo Vi Khí Hậu Gần Nhất</span>
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab?.('alerts')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#15803D] hover:text-[#166534] hover:underline cursor-pointer"
          >
            <span>Xem toàn bộ nhật ký</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-2.5">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => <AlertListItem key={alert.id} alert={alert} />)
          ) : (
            <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-6 text-center text-[#52606D] text-sm">
              Không có sự cố vi khí hậu nào cần xử lý. Hệ thống vận hành ổn định.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
