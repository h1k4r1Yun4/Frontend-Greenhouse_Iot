import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import {
  AutomationRule,
  ActuatorType,
  SensorMetricType,
  ComparisonOperator,
} from '../../types';
import { HysteresisVisualizer } from './HysteresisVisualizer';

export interface RuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rule: any) => Promise<void>;
  initialRule?: AutomationRule | null;
}

export const RuleEditorModal: React.FC<RuleEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialRule = null,
}) => {
  const [name, setName] = useState('');
  const [targetZone, setTargetZone] = useState<'zone1' | 'zone2' | 'all'>('all');
  const [sensorType, setSensorType] = useState<SensorMetricType>('soilMoisture');
  const [comparison, setComparison] = useState<ComparisonOperator>('<');
  const [threshold, setThreshold] = useState<number>(40);
  const [hysteresis, setHysteresis] = useState<number>(10);
  const [actuatorId, setActuatorId] = useState<ActuatorType>('water_pump');
  const [actuatorAction, setActuatorAction] = useState<'ON' | 'OFF'>('ON');
  const [powerLevel, setPowerLevel] = useState<number>(80);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialRule) {
      setName(initialRule.name);
      setTargetZone(initialRule.targetZone);
      setSensorType(initialRule.sensorType);
      setComparison(initialRule.comparison);
      setThreshold(initialRule.threshold);
      setHysteresis(initialRule.hysteresis);
      setActuatorId(initialRule.actuatorId);
      setActuatorAction(initialRule.actuatorAction);
      setPowerLevel(initialRule.powerLevel ?? 80);
    } else {
      setName('');
      setTargetZone('all');
      setSensorType('soilMoisture');
      setComparison('<');
      setThreshold(40);
      setHysteresis(10);
      setActuatorId('water_pump');
      setActuatorAction('ON');
      setPowerLevel(80);
    }
  }, [initialRule, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        enabled: initialRule ? initialRule.enabled : true,
        targetZone,
        sensorType,
        comparison,
        threshold,
        hysteresis,
        actuatorId,
        actuatorAction,
        powerLevel:
          actuatorId === 'ventilation_fan' || actuatorId === 'grow_light'
            ? powerLevel
            : undefined,
      };

      if (initialRule) {
        payload.id = initialRule.id;
      }

      await onSave(payload);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEditMode = Boolean(initialRule);
  const inputClass =
    'w-full px-3.5 py-2 text-sm bg-[#FAF9F6] border border-[#D8D2C5] rounded-[10px] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#15803D] focus:bg-white';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Chỉnh Sửa Quy Tắc Tự Động Hóa' : 'Thêm Quy Tắc Tự Động Hóa Mới'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#1F2933] mb-1">
            Tên quy tắc kịch bản
          </label>
          <input
            type="text"
            required
            placeholder="Ví dụ: Tưới nước tự động khi đất khô"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Khu vực áp dụng
            </label>
            <select
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value as any)}
              className={inputClass}
            >
              <option value="all">Toàn bộ nhà kính</option>
              <option value="zone1">Khu vực 1 (Node 1 - Cà chua)</option>
              <option value="zone2">Khu vực 2 (Node 2 - Xà lách)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Loại cảm biến đo
            </label>
            <select
              value={sensorType}
              onChange={(e) => setSensorType(e.target.value as any)}
              className={inputClass}
            >
              <option value="soilMoisture">Độ ẩm đất (%)</option>
              <option value="humidity">Độ ẩm không khí (% RH)</option>
              <option value="temperature">Nhiệt độ không khí (°C)</option>
              <option value="lightIntensity">Cường độ ánh sáng (Lux)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Toán tử so sánh
            </label>
            <select
              value={comparison}
              onChange={(e) => setComparison(e.target.value as any)}
              className={`${inputClass} font-mono`}
            >
              <option value="<">Nhỏ hơn (&lt;)</option>
              <option value="<=">Nhỏ hơn hoặc bằng (&lt;=)</option>
              <option value=">">Lớn hơn (&gt;)</option>
              <option value=">=">Lớn hơn hoặc bằng (&gt;=)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Giá trị ngưỡng kích hoạt
            </label>
            <input
              type="number"
              step="0.5"
              required
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Dải trễ (Hysteresis)
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              required
              value={hysteresis}
              onChange={(e) => setHysteresis(Number(e.target.value))}
              className={`${inputClass} font-mono tabular-nums`}
            />
          </div>
        </div>

        <div className="pt-1">
          <label className="block text-xs font-semibold text-[#52606D] mb-1.5">
            Xem trước mô phỏng dải trễ (Live Hysteresis Preview)
          </label>
          <HysteresisVisualizer
            sensorType={sensorType}
            comparison={comparison}
            threshold={threshold}
            hysteresis={hysteresis}
            actuatorAction={actuatorAction}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#EFECE4]">
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Thiết bị chấp hành kích hoạt
            </label>
            <select
              value={actuatorId}
              onChange={(e) => setActuatorId(e.target.value as any)}
              className={inputClass}
            >
              <option value="water_pump">Máy bơm nước tưới gốc</option>
              <option value="mist_spray">Hệ thống phun sương tạo ẩm</option>
              <option value="ventilation_fan">Quạt thông gió làm mát</option>
              <option value="grow_light">Đèn LED chiếu sáng quang hợp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1">
              Lệnh điều khiển
            </label>
            <select
              value={actuatorAction}
              onChange={(e) => setActuatorAction(e.target.value as any)}
              className={`${inputClass} font-semibold`}
            >
              <option value="ON">KÍCH HOẠT (BẬT)</option>
              <option value="OFF">NGẮT ĐIỆN (TẮT)</option>
            </select>
          </div>
        </div>

        {(actuatorId === 'ventilation_fan' || actuatorId === 'grow_light') && (
          <div>
            <label className="block text-xs font-semibold text-[#1F2933] mb-1.5 font-mono tabular-nums">
              Công suất xung PWM: {powerLevel}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={powerLevel}
              onChange={(e) => setPowerLevel(Number(e.target.value))}
              className="w-full warm-slider"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE4]">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy bỏ
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Đang lưu...' : isEditMode ? 'Cập Nhật Quy Tắc' : 'Lưu Quy Tắc'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
