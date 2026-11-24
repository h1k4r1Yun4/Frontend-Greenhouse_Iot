import React, { useState } from 'react';
import { useGreenhouse } from '../context/GreenhouseContext';
import { AlertFilterBar } from '../components/alerts/AlertFilterBar';
import { AlertListItem } from '../components/alerts/AlertListItem';
import { AlertSeverity } from '../types';
import { Bell, ShieldCheck, AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { alerts } = useGreenhouse();
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity | 'all'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showResolved, setShowResolved] = useState<boolean>(true);

  const criticalCount = alerts.filter((a) => a.severity === 'critical' && !a.resolved).length;
  const warningCount = alerts.filter((a) => a.severity === 'warning' && !a.resolved).length;
  const infoCount = alerts.filter((a) => a.severity === 'info' && !a.resolved).length;
  const resolvedCount = alerts.filter((a) => a.resolved).length;
  const totalCount = alerts.length;
  const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;

  const counts = {
    all: alerts.length,
    critical: alerts.filter((a) => a.severity === 'critical').length,
    warning: alerts.filter((a) => a.severity === 'warning').length,
    info: alerts.filter((a) => a.severity === 'info').length,
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (selectedSeverity !== 'all' && alert.severity !== selectedSeverity) return false;
    if (selectedZone !== 'all' && alert.zoneId !== selectedZone) return false;
    if (!showResolved && alert.resolved) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & KPI Card */}
      <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-6 shadow-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#1F2933] flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#B45309]" aria-hidden="true" />
              <span>Trung Tâm Cảnh Báo &amp; Nhật Ký Sự Cố Hệ Thống</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#52606D] mt-1 max-w-2xl">
              Theo dõi sự cố vi khí hậu theo thời gian thực: vượt ngưỡng nhiệt độ, thiếu ẩm đất, bất thường ánh sáng hoặc mất tín hiệu kết nối thiết bị.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            {criticalCount > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF1F2] text-[#9F1239] text-xs font-bold border border-[#FECDD3]">
                <AlertCircle className="w-4 h-4 text-[#BE123C]" aria-hidden="true" />
                <span>{criticalCount} sự cố khẩn cấp cần xử lý</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F6F4EF] text-[#3E4C59] text-xs font-bold border border-[#D8D2C5]">
                <CheckCircle2 className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
                <span>Hệ thống vi khí hậu an toàn</span>
              </span>
            )}
          </div>
        </div>

        {/* 4 KPI Wells */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-[#EFECE4]">
          <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#52606D]">Khẩn cấp (Critical)</span>
              <p className="text-xl font-bold text-[#9F1239] font-mono tabular-nums mt-0.5">
                {criticalCount}
              </p>
            </div>
            <div className="w-9 h-9 rounded-[10px] bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] flex items-center justify-center">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#52606D]">Cảnh báo (Warning)</span>
              <p className="text-xl font-bold text-[#92400E] font-mono tabular-nums mt-0.5">
                {warningCount}
              </p>
            </div>
            <div className="w-9 h-9 rounded-[10px] bg-[#FEF3C7] border border-[#FCD34D] text-[#B45309] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#52606D]">Thông tin (Info)</span>
              <p className="text-xl font-bold text-[#075985] font-mono tabular-nums mt-0.5">
                {infoCount}
              </p>
            </div>
            <div className="w-9 h-9 rounded-[10px] bg-[#F0F9FF] border border-[#BAE6FD] text-[#0369A1] flex items-center justify-center">
              <Info className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>

          <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-[#52606D]">Tỷ lệ đã xử lý</span>
              <p className="text-xl font-bold text-[#1F2933] font-mono tabular-nums mt-0.5">
                {resolutionRate}%
              </p>
            </div>
            <div className="w-9 h-9 rounded-[10px] bg-white border border-[#D8D2C5] text-[#52606D] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <AlertFilterBar
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        selectedZone={selectedZone}
        onSelectZone={setSelectedZone}
        showResolved={showResolved}
        onToggleShowResolved={() => setShowResolved((prev) => !prev)}
        counts={counts}
      />

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => <AlertListItem key={alert.id} alert={alert} />)
        ) : (
          <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-12 text-center space-y-3">
            <ShieldCheck className="w-11 h-11 text-[#52606D] mx-auto" aria-hidden="true" />
            <h4 className="font-bold text-[#1F2933] text-base">Không có cảnh báo phù hợp</h4>
            <p className="text-xs text-[#52606D] max-w-md mx-auto">
              Không có sự cố nào khớp với bộ lọc hiện tại. Mọi thông số vi khí hậu đang vận hành trong giới hạn an toàn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
