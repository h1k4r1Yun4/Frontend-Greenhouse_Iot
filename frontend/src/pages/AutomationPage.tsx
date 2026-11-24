import React, { useState } from 'react';
import { useGreenhouse } from '../context/GreenhouseContext';
import { RuleItemCard } from '../components/automation/RuleItemCard';
import { RuleEditorModal } from '../components/automation/RuleEditorModal';
import { Button } from '../components/common/Button';
import { Plus, Sliders, Info } from 'lucide-react';
import { AutomationRule } from '../types';

export const AutomationPage: React.FC = () => {
  const { rules, addRule, updateRule, userRole } = useGreenhouse();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const canModify = userRole === 'admin' || userRole === 'operator';

  const handleOpenAdd = () => {
    setEditingRule(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rule: AutomationRule) => {
    setEditingRule(rule);
    setIsModalOpen(true);
  };

  const handleSaveRule = async (ruleData: any) => {
    if (editingRule) {
      await updateRule(ruleData);
    } else {
      await addRule(ruleData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-6 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#1F2933] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#52606D]" aria-hidden="true" />
            <span>Kịch Bản &amp; Quy Tắc Tự Động Hóa Vi Khí Hậu</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#52606D] mt-1 max-w-2xl">
            Khi cảm biến đạt ngưỡng kích hoạt, hệ thống tự động vận hành thiết bị và duy trì trong dải trễ (Hysteresis) an toàn nhằm bảo vệ relay và động cơ.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          disabled={!canModify}
          onClick={handleOpenAdd}
          className="self-start sm:self-center flex-shrink-0"
        >
          Thêm Quy Tắc Mới
        </Button>
      </div>

      {/* Educational Info Box */}
      <div className="bg-[#FAF9F6] border border-[#E2DDD2] rounded-[16px] p-4 text-xs text-[#52606D] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#0369A1] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <strong className="block font-bold text-[#1F2933] mb-0.5">
            Cơ chế Dải trễ chống dao động (Hysteresis Band):
          </strong>
          Ví dụ: Quy tắc tưới nước bật máy bơm khi độ ẩm đất &lt; 40%. Nhờ dải trễ 15%, máy bơm sẽ tiếp tục hoạt động cho đến khi độ ẩm đạt 55% mới ngắt, triệt tiêu hiện tượng relay bật tắt liên tục (chattering).
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[#1F2933] text-sm">
            Danh sách quy tắc đang áp dụng ({rules.length})
          </h3>
        </div>

        <div className="space-y-4">
          {rules.length > 0 ? (
            rules.map((rule) => (
              <RuleItemCard key={rule.id} rule={rule} onEdit={handleOpenEdit} />
            ))
          ) : (
            <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-10 text-center space-y-2">
              <h4 className="font-bold text-[#1F2933]">Chưa có quy tắc tự động hóa nào</h4>
              <p className="text-xs text-[#52606D]">
                Nhấn &quot;Thêm Quy Tắc Mới&quot; để thiết lập ngưỡng tự động cho máy bơm, quạt hoặc đèn LED.
              </p>
            </div>
          )}
        </div>
      </div>

      <RuleEditorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRule}
        initialRule={editingRule}
      />
    </div>
  );
};
