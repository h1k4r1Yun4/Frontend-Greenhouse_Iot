import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Radio } from 'lucide-react';
import { ProposedActuatorAction } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface SafeConfirmModalProps {
  isOpen: boolean;
  proposal: ProposedActuatorAction | null;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  canExecute?: boolean;
}

export const SafeConfirmModal: React.FC<SafeConfirmModalProps> = ({
  isOpen,
  proposal,
  onConfirm,
  onCancel,
  canExecute = true,
}) => {
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen || !proposal) return null;

  const handleExecute = async () => {
    if (!canExecute) return;
    setIsExecuting(true);
    try {
      await onConfirm();
    } finally {
      setIsExecuting(false);
    }
  };

  const actionText = proposal.action === 'ON' ? 'KÍCH HOẠT (BẬT)' : 'NGẮT ĐIỆN (TẮT)';
  const zoneName =
    proposal.targetZone === 'all'
      ? 'Toàn bộ nhà kính'
      : proposal.targetZone === 'zone1'
      ? 'Khu vực 1 (Cà chua)'
      : 'Khu vực 2 (Xà lách)';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={
        <div className="flex items-center gap-2 text-[#9F1239]">
          <AlertTriangle className="w-5 h-5 text-[#BE123C] flex-shrink-0" aria-hidden="true" />
          <span className="font-extrabold text-base sm:text-lg">
            Xác Nhận An Toàn Điều Khiển Phần Cứng (2-Step Safety)
          </span>
        </div>
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-sm text-[#1F2933]">
        {/* 3-Stage Safety Pipeline */}
        <div className="bg-[#FAF9F6] p-3 rounded-[14px] border border-[#E6E1D6]">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#52606D]">
            <span className="flex items-center gap-1.5 text-[#1F2933]">
              <span className="w-5 h-5 rounded-full bg-[#EFECE4] border border-[#D8D2C5] text-[#1F2933] flex items-center justify-center text-[10px]">
                1
              </span>
              AI Đề xuất
            </span>
            <span className="text-[#9AA5B1]" aria-hidden="true">→</span>
            <span className="flex items-center gap-1.5 text-[#14532D] bg-[#EAF6EE] px-2.5 py-0.5 rounded-full border border-[#B7E1C6]">
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                2
              </span>
              Con người Phê duyệt
            </span>
            <span className="text-[#9AA5B1]" aria-hidden="true">→</span>
            <span className="flex items-center gap-1.5 text-[#52606D]">
              <span className="w-5 h-5 rounded-full bg-[#EFECE4] border border-[#D8D2C5] text-[#52606D] flex items-center justify-center text-[10px]">
                3
              </span>
              Phát lệnh MQTT
            </span>
          </div>
        </div>

        {/* Hazard Warning */}
        <div className="bg-[#FFF5F6] border border-[#FECDD3] rounded-[14px] p-4">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-[#BE123C] mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="font-bold text-[#9F1239] mb-1">
                Thao tác điều khiển thiết bị cơ điện thực tế
              </p>
              <p className="text-xs text-[#881337] leading-relaxed">
                Hệ thống AI không tự động kích hoạt phần cứng. Lệnh này sẽ được phát tới Relay hoặc Driver PWM của ESP32 Gateway để điều khiển thiết bị trong nhà kính.
              </p>
            </div>
          </div>
        </div>

        {/* Action Details */}
        <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-4 space-y-2.5 font-mono text-xs">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[#52606D] font-sans flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#616E7C]" aria-hidden="true" />
              Thiết bị chấp hành:
            </span>
            <span className="font-bold text-[#1F2933] font-sans">{proposal.actuatorName}</span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[#52606D] font-sans flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#616E7C]" aria-hidden="true" />
              Lệnh điều khiển:
            </span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-[8px] text-xs border ${
                proposal.action === 'ON'
                  ? 'bg-[#EAF6EE] text-[#14532D] border-[#B7E1C6]'
                  : 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
              }`}
            >
              {actionText}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <span className="text-[#52606D] font-sans">Khu vực tác động:</span>
            <span className="font-semibold text-[#1F2933] font-sans">{zoneName}</span>
          </div>

          {proposal.powerLevel !== undefined && (
            <div className="flex justify-between items-center gap-2">
              <span className="text-[#52606D] font-sans">Công suất xung PWM:</span>
              <span className="font-bold text-[#1F2933] bg-white px-2 py-0.5 rounded-[6px] border border-[#D8D2C5] tabular-nums">
                {proposal.powerLevel}%
              </span>
            </div>
          )}

          <div className="pt-2.5 border-t border-[#E6E1D6]">
            <span className="text-[#52606D] font-sans font-semibold block mb-1">
              Lý do nông nghiệp:
            </span>
            <p className="font-sans text-xs text-[#1F2933] italic bg-white p-3 rounded-[10px] border border-[#E6E1D6] leading-relaxed">
              &quot;{proposal.reason}&quot;
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFECE4]">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isExecuting}>
            Hủy bỏ (Bỏ qua)
          </Button>

          <Button
            type="button"
            variant="primary"
            onClick={handleExecute}
            disabled={isExecuting || !canExecute}
            icon={<CheckCircle2 className="w-4 h-4" />}
          >
            {isExecuting ? 'Đang gửi lệnh...' : 'ĐỒNG Ý THỰC THI'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
