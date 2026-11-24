import React, { useState, useRef, useEffect } from 'react';
import {
  Wifi,
  WifiOff,
  Server,
  Cpu,
  ChevronDown,
  Activity,
  X,
  Radio,
  Settings2,
} from 'lucide-react';
import { useGreenhouse } from '../../context/GreenhouseContext';
import { Badge } from '../common/Badge';

export interface ConnectionBadgeProps {
  onOpenConfig?: () => void;
}

export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({ onOpenConfig }) => {
  const { connectionStatus, setConnectionStatus, gateway, zones, runtimeConfig } = useGreenhouse();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const toggleConnection = () => {
    setConnectionStatus(connectionStatus === 'online' ? 'offline' : 'online');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false);
      }
    };
    if (isPopoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopoverOpen]);

  const isOnline = connectionStatus === 'online';
  const isHttpMode = runtimeConfig.apiMode === 'http';

  const statusPillClass = (active: boolean) =>
    active
      ? 'bg-[#F6F4EF] text-[#3E4C59] border border-[#D8D2C5]'
      : 'bg-[#FFF1F2] text-[#9F1239] border border-[#FECDD3]';

  return (
    <div className="relative inline-flex items-center" ref={popoverRef}>
      <div className="inline-flex items-center rounded-full border border-[#D8D2C5] bg-white shadow-card transition-shadow hover:shadow-card-hover">
        <button
          type="button"
          onClick={toggleConnection}
          title="Bấm để chuyển đổi giả lập Online/Offline hệ thống"
          className="transition-transform active:scale-95 flex items-center rounded-l-full cursor-pointer"
          data-testid="connection-status-btn"
        >
          {isOnline ? (
            <Badge
              variant="neutral"
              dot={true}
              className="cursor-pointer py-1 px-2 sm:px-2.5 border-0 bg-transparent text-[#1F2933]"
            >
              <Wifi className="w-3.5 h-3.5 text-[#52606D] hidden sm:inline" aria-hidden="true" />
              <span className="font-semibold text-[11px] sm:text-xs whitespace-nowrap">
                Hệ thống: Trực tuyến
              </span>
            </Badge>
          ) : (
            <Badge
              variant="danger"
              dot={true}
              className="cursor-pointer py-1 px-2 sm:px-2.5 border-0 bg-[#FFF1F2] text-[#9F1239]"
            >
              <WifiOff className="w-3.5 h-3.5 hidden sm:inline" aria-hidden="true" />
              <span className="font-semibold text-[11px] sm:text-xs whitespace-nowrap">
                Mất kết nối Gateway!
              </span>
            </Badge>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          title="Xem chi tiết kết nối MQTT, Gateway & Nodes"
          className="p-1.5 pr-2 text-[#52606D] hover:text-[#1F2933] hover:bg-[#FAF9F6] rounded-r-full transition-colors border-l border-[#EFECE4] cursor-pointer"
          aria-label="Xem chi tiết kết nối phần cứng"
          aria-expanded={isPopoverOpen}
        >
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isPopoverOpen ? 'rotate-180 text-[#1F2933]' : ''
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      {isPopoverOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-[#E6E1D6] rounded-[18px] shadow-popover z-50 p-4 text-[#1F2933] animate-modal-in">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-[#FAF9F6] border border-[#E6E1D6] text-[#52606D] flex items-center justify-center">
                <Radio className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <h4 className="text-xs font-bold tracking-tight text-[#1F2933] uppercase">
                  Mạng Lưới Phần Cứng IoT
                </h4>
                <p className="text-[11px] text-[#52606D] font-mono">
                  {isHttpMode ? 'Live HTTP + WebSocket' : 'Mock Simulator · MQTT Mesh'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPopoverOpen(false)}
              className="text-[#52606D] hover:text-[#1F2933] hover:bg-[#EFECE4] p-1 rounded-[8px] cursor-pointer"
              aria-label="Đóng chi tiết kết nối"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            {/* 1. MQTT / Backend */}
            <div className="p-2.5 rounded-[12px] bg-[#FAF9F6] border border-[#E6E1D6] flex items-start gap-2.5">
              <Server className="w-4 h-4 text-[#52606D] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1F2933]">
                    {isHttpMode ? 'Backend Orchestrator' : 'MQTT Broker (EMQX)'}
                  </span>
                  <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPillClass(isOnline)}`}>
                    {isOnline ? 'Đã kết nối' : 'Mất kết nối'}
                  </span>
                </div>
                <div className="text-[11px] text-[#52606D] font-mono mt-0.5 truncate">
                  {isHttpMode ? runtimeConfig.apiBaseUrl : 'broker.emqx.io : 8084 (WSS / TLS)'}
                </div>
                <div className="text-[10px] text-[#616E7C] flex items-center gap-2 mt-1">
                  <span>Độ trễ: {isOnline ? '~24ms' : 'Timeout'}</span>
                  <span>•</span>
                  <span>QoS: Level 1</span>
                </div>
              </div>
            </div>

            {/* 2. Gateway ESP32 */}
            <div className="p-2.5 rounded-[12px] bg-[#FAF9F6] border border-[#E6E1D6] flex items-start gap-2.5">
              <Cpu className="w-4 h-4 text-[#B45309] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1F2933]">ESP32 Gateway Trung Tâm</span>
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPillClass(
                      isOnline && gateway.status === 'online'
                    )}`}
                  >
                    {isOnline && gateway.status === 'online' ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="text-[11px] text-[#52606D] mt-0.5">
                  Cảm biến quang LDR:{' '}
                  <span className="font-mono font-semibold text-[#1F2933] tabular-nums">
                    {isOnline ? `${gateway.lightIntensity} Lux` : '-- Lux'}
                  </span>
                </div>
                <div className="text-[10px] text-[#616E7C] mt-0.5">
                  {isOnline ? 'Wi-Fi RSSI: -54 dBm (Ổn định)' : 'Mất tín hiệu Heartbeat'}
                </div>
              </div>
            </div>

            {/* 3. Node 1 */}
            <div className="p-2.5 rounded-[12px] bg-[#FAF9F6] border border-[#E6E1D6] flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-[#52606D] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1F2933]">Node 1 (ESP8266 - Cà chua)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPillClass(isOnline)}`}>
                    {isOnline ? 'Hoạt động' : 'Offline'}
                  </span>
                </div>
                <div className="text-[11px] text-[#52606D] font-mono mt-0.5 tabular-nums">
                  {isOnline
                    ? `${zones[0]?.current.temperature ?? '--'}°C • ${zones[0]?.current.humidity ?? '--'}% RH • Đất ${zones[0]?.current.soilMoisture ?? '--'}%`
                    : 'Không nhận được gói tin'}
                </div>
              </div>
            </div>

            {/* 4. Node 2 */}
            <div className="p-2.5 rounded-[12px] bg-[#FAF9F6] border border-[#E6E1D6] flex items-start gap-2.5">
              <Activity className="w-4 h-4 text-[#0369A1] mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-[#1F2933]">Node 2 (ESP8266 - Xà lách)</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusPillClass(isOnline)}`}>
                    {isOnline ? 'Hoạt động' : 'Offline'}
                  </span>
                </div>
                <div className="text-[11px] text-[#52606D] font-mono mt-0.5 tabular-nums">
                  {isOnline
                    ? `${zones[1]?.current.temperature ?? '--'}°C • ${zones[1]?.current.humidity ?? '--'}% RH • Đất ${zones[1]?.current.soilMoisture ?? '--'}%`
                    : 'Không nhận được gói tin'}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#EFECE4] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            {onOpenConfig && (
              <button
                type="button"
                onClick={() => {
                  setIsPopoverOpen(false);
                  onOpenConfig();
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] font-semibold bg-[#FAF9F6] border border-[#D8D2C5] text-[#1F2933] hover:bg-[#EFECE4] transition-colors cursor-pointer"
              >
                <Settings2 className="w-3.5 h-3.5 text-[#52606D]" aria-hidden="true" />
                <span>Cấu hình Backend &amp; AI</span>
              </button>
            )}
            <button
              type="button"
              onClick={toggleConnection}
              className={`px-2.5 py-1.5 rounded-[8px] font-semibold transition-colors cursor-pointer ml-auto ${
                isOnline
                  ? 'bg-[#FFF1F2] text-[#9F1239] hover:bg-[#FFE4E6]'
                  : 'bg-[#EAF6EE] text-[#14532D] hover:bg-[#D8F0E0]'
              }`}
            >
              {isOnline ? 'Ngắt Gateway ESP32' : 'Kết Nối Lại'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
