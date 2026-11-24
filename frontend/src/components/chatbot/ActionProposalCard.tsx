import React from 'react';
import { Check, X, ShieldAlert, Cpu, Radio, Lock } from 'lucide-react';
import { ProposedActuatorAction } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export interface ActionProposalCardProps {
  proposal: ProposedActuatorAction;
  onRequestConfirm: (proposal: ProposedActuatorAction) => void;
  onReject: (proposalId: string) => void;
  canExecute?: boolean;
  blockedReason?: string;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({
  proposal,
  onRequestConfirm,
  onReject,
  canExecute = true,
  blockedReason,
}) => {
  const isPending = proposal.status === 'PENDING_CONFIRMATION';
  const isConfirmed = proposal.status === 'CONFIRMED';
  const isRejected = proposal.status === 'REJECTED';

  const zoneText =
    proposal.targetZone === 'all'
      ? 'Toàn bộ nhà kính'
      : proposal.targetZone === 'zone1'
      ? 'Khu vực 1 (Node 1 - Cà chua)'
      : 'Khu vực 2 (Node 2 - Xà lách)';

  return (
    <div className="mt-3.5 bg-[#FAF9F6] border border-[#D8D2C5] rounded-[16px] p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#E6E1D6]">
        <div className="flex items-center gap-2 text-xs font-extrabold text-[#1F2933] uppercase tracking-tight">
          <div className="w-6 h-6 rounded-[8px] bg-[#EAF6EE] border border-[#B7E1C6] text-[#15803D] flex items-center justify-center">
            <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span>ĐỀ XUẤT ĐIỀU KHIỂN THIẾT BỊ TỪ AI</span>
        </div>
        <Badge variant={isConfirmed ? 'success' : isRejected ? 'neutral' : 'warning'}>
          {isConfirmed ? 'Đã thực thi' : isRejected ? 'Đã từ chối' : 'Chờ xác nhận'}
        </Badge>
      </div>

      {/* Parameter Breakdown */}
      <div className="text-xs space-y-2 text-[#1F2933] bg-white p-3 rounded-[12px] border border-[#E6E1D6]">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[#52606D] font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#616E7C]" aria-hidden="true" />
            Thiết bị mục tiêu:
          </span>
          <span className="font-bold text-[#1F2933]">{proposal.actuatorName}</span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-[#52606D] font-medium flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#616E7C]" aria-hidden="true" />
            Lệnh đề xuất:
          </span>
          <span
            className={`font-bold font-mono px-2 py-0.5 rounded-[6px] border ${
              proposal.action === 'OFF'
                ? 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
                : 'bg-[#EAF6EE] text-[#14532D] border-[#B7E1C6]'
            }`}
          >
            {proposal.action === 'ON' ? 'BẬT THIẾT BỊ' : 'TẮT THIẾT BỊ'}
            {proposal.powerLevel !== undefined ? ` (${proposal.powerLevel}%)` : ''}
          </span>
        </div>

        <div className="flex justify-between items-center gap-2">
          <span className="text-[#52606D] font-medium">Khu vực tác động:</span>
          <span className="font-semibold text-[#1F2933]">{zoneText}</span>
        </div>

        <div className="pt-2 border-t border-[#EFECE4] text-[#52606D]">
          <span className="text-[11px] font-semibold text-[#52606D] block mb-1">
            Căn cứ nông nghiệp &amp; sinh học:
          </span>
          <p className="italic bg-[#FAF9F6] p-2.5 rounded-[8px] border border-[#E6E1D6] leading-relaxed text-[11px] text-[#1F2933]">
            &quot;{proposal.reason}&quot;
          </p>
        </div>
      </div>

      {/* Blocked Notice (Viewer RBAC or E-Stop Interlock) */}
      {isPending && !canExecute && blockedReason && (
        <div className="text-[11px] text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] rounded-[10px] px-3 py-2 flex items-center gap-2 font-medium">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
          <span>{blockedReason}</span>
        </div>
      )}

      {/* Pending Action Buttons */}
      {isPending && (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button size="sm" variant="outline" onClick={() => onReject(proposal.id)}>
            Từ chối
          </Button>
          <Button
            size="sm"
            variant="primary"
            disabled={!canExecute}
            onClick={() => canExecute && onRequestConfirm(proposal)}
            icon={<Check className="w-3.5 h-3.5" />}
          >
            Xác nhận Điều khiển
          </Button>
        </div>
      )}

      {isConfirmed && (
        <div className="text-xs text-[#14532D] font-medium flex items-center gap-2 bg-[#EAF6EE] p-2.5 rounded-[10px] border border-[#B7E1C6]">
          <Check className="w-4 h-4 text-[#15803D] flex-shrink-0" aria-hidden="true" />
          <span>Lệnh đã được con người phê duyệt và gửi xuống phần cứng thành công.</span>
        </div>
      )}

      {isRejected && (
        <div className="text-xs text-[#52606D] italic flex items-center gap-1.5 bg-[#EFECE4] p-2.5 rounded-[10px]">
          <X className="w-4 h-4 text-[#616E7C] flex-shrink-0" aria-hidden="true" />
          <span>Người dùng đã hủy bỏ đề xuất này. Thiết bị giữ nguyên trạng thái.</span>
        </div>
      )}
    </div>
  );
};
