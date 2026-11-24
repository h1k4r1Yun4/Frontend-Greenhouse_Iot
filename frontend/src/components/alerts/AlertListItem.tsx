import React from 'react';
import { AlertTriangle, AlertCircle, Info, Check, CheckCheck } from 'lucide-react';
import { AlertItem, AlertSeverity } from '../../types';
import { Badge } from '../common/Badge';
import { useGreenhouse } from '../../context/GreenhouseContext';

export interface AlertListItemProps {
  alert: AlertItem;
}

export const AlertListItem: React.FC<AlertListItemProps> = ({ alert }) => {
  const { acknowledgeAlert, resolveAlert, userRole } = useGreenhouse();
  const canModify = userRole === 'admin' || userRole === 'operator';

  const severityConfigs: Record<
    AlertSeverity,
    {
      badgeVariant: 'danger' | 'warning' | 'info';
      label: string;
      icon: React.ReactNode;
      border: string;
      bg: string;
    }
  > = {
    critical: {
      badgeVariant: 'danger',
      label: 'Nguy hiểm (Critical)',
      icon: <AlertCircle className="w-5 h-5 text-[#BE123C] flex-shrink-0" aria-hidden="true" />,
      border: 'border-[#FECDD3]',
      bg: 'bg-[#FFF5F6]',
    },
    warning: {
      badgeVariant: 'warning',
      label: 'Cảnh báo (Warning)',
      icon: <AlertTriangle className="w-5 h-5 text-[#B45309] flex-shrink-0" aria-hidden="true" />,
      border: 'border-[#FDE68A]',
      bg: 'bg-[#FFFDF5]',
    },
    info: {
      badgeVariant: 'info',
      label: 'Thông tin (Info)',
      icon: <Info className="w-5 h-5 text-[#0369A1] flex-shrink-0" aria-hidden="true" />,
      border: 'border-[#BAE6FD]',
      bg: 'bg-[#F7FBFF]',
    },
  };

  const config = severityConfigs[alert.severity] || severityConfigs.info;
  const formattedTime = new Date(alert.timestamp).toLocaleString('vi-VN');

  return (
    <article
      className={`rounded-[16px] border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 ${
        alert.resolved
          ? 'bg-[#FAF9F6] border-[#E6E1D6]'
          : `${config.bg} ${config.border}`
      }`}
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="mt-0.5 flex-shrink-0">{config.icon}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Badge variant={config.badgeVariant}>{config.label}</Badge>
            <span className="text-xs font-mono text-[#52606D]">Nguồn: {alert.source}</span>
            <span className="text-xs text-[#616E7C] font-mono tabular-nums">
              • {formattedTime}
            </span>
          </div>
          <p
            className={`text-sm font-semibold leading-snug ${
              alert.resolved ? 'text-[#52606D]' : 'text-[#1F2933]'
            }`}
          >
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
        {!alert.acknowledged && (
          <button
            type="button"
            onClick={() => acknowledgeAlert(alert.id)}
            disabled={!canModify}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-white border border-[#D8D2C5] text-[#1F2933] hover:bg-[#EFECE4] transition-colors cursor-pointer disabled:bg-[#EFECE4] disabled:text-[#7B8794] disabled:cursor-not-allowed"
            title="Đánh dấu đã đọc"
          >
            <Check className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đã xem</span>
          </button>
        )}

        {!alert.resolved ? (
          <button
            type="button"
            onClick={() => resolveAlert(alert.id)}
            disabled={!canModify}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[10px] bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:bg-[#E6E1D6] disabled:text-[#616E7C] disabled:cursor-not-allowed"
            title="Đánh dấu sự cố đã xử lý"
          >
            <CheckCheck className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Đã khắc phục</span>
          </button>
        ) : (
          <Badge variant="success" dot={true}>
            Đã xử lý
          </Badge>
        )}
      </div>
    </article>
  );
};
