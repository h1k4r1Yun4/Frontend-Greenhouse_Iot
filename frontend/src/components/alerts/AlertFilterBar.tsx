import React from 'react';
import { Filter } from 'lucide-react';
import { AlertSeverity } from '../../types';

export interface AlertFilterBarProps {
  selectedSeverity: AlertSeverity | 'all';
  onSelectSeverity: (s: AlertSeverity | 'all') => void;
  selectedZone: string;
  onSelectZone: (z: string) => void;
  showResolved: boolean;
  onToggleShowResolved: () => void;
  counts?: { all: number; critical: number; warning: number; info: number };
}

export const AlertFilterBar: React.FC<AlertFilterBarProps> = ({
  selectedSeverity,
  onSelectSeverity,
  selectedZone,
  onSelectZone,
  showResolved,
  onToggleShowResolved,
  counts,
}) => {
  const tabs: { id: AlertSeverity | 'all'; label: string; count?: number }[] = [
    { id: 'all', label: 'Tất cả', count: counts?.all },
    { id: 'critical', label: 'Nguy hiểm', count: counts?.critical },
    { id: 'warning', label: 'Cảnh báo', count: counts?.warning },
    { id: 'info', label: 'Thông tin', count: counts?.info },
  ];

  return (
    <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-3.5 shadow-card flex flex-wrap items-center justify-between gap-3">
      {/* Severity Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2]">
        {tabs.map((tab) => {
          const isSelected = selectedSeverity === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectSeverity(tab.id)}
              aria-label={tab.label}
              className={`px-3 py-1.5 text-xs font-semibold rounded-[9px] transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono tabular-nums ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-[#E2DDD2] text-[#3E4C59]'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Zone Filter & Resolved Toggle */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-[#52606D]" aria-hidden="true" />
          <select
            value={selectedZone}
            onChange={(e) => onSelectZone(e.target.value)}
            aria-label="Lọc theo khu vực phát sinh"
            className="px-3 py-1.5 bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#15803D] font-medium"
          >
            <option value="all">Mọi nguồn phát sinh</option>
            <option value="zone1">Khu vực 1 (Node 1 - Cà chua)</option>
            <option value="zone2">Khu vực 2 (Node 2 - Xà lách)</option>
            <option value="gateway">Gateway ESP32 Trung tâm</option>
            <option value="system">Hệ thống &amp; Mạng</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-[#1F2933] cursor-pointer select-none font-medium">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={onToggleShowResolved}
            className="rounded border-[#D8D2C5] accent-[#15803D] w-4 h-4 cursor-pointer"
          />
          <span>Hiện cả sự cố đã xử lý</span>
        </label>
      </div>
    </div>
  );
};
