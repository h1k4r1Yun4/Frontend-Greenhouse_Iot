import React from 'react';
import { Sliders, Trash2, Power, Layers, Pencil } from 'lucide-react';
import { AutomationRule } from '../../types';
import { Badge } from '../common/Badge';
import { useGreenhouse } from '../../context/GreenhouseContext';
import { HysteresisVisualizer } from './HysteresisVisualizer';

export interface RuleItemCardProps {
  rule: AutomationRule;
  onEdit?: (rule: AutomationRule) => void;
}

export const RuleItemCard: React.FC<RuleItemCardProps> = ({ rule, onEdit }) => {
  const { toggleRule, deleteRule, userRole, zones, gateway } = useGreenhouse();
  const canModify = userRole === 'admin' || userRole === 'operator';

  const sensorLabels: Record<string, { label: string; unit: string }> = {
    temperature: { label: 'Nhiệt độ', unit: '°C' },
    humidity: { label: 'Độ ẩm không khí', unit: '% RH' },
    soilMoisture: { label: 'Độ ẩm đất', unit: '%' },
    lightIntensity: { label: 'Ánh sáng LDR', unit: 'Lux' },
  };

  const actuatorNames: Record<string, string> = {
    water_pump: 'Máy bơm nước',
    mist_spray: 'Hệ thống phun sương',
    ventilation_fan: 'Quạt thông gió',
    grow_light: 'Đèn LED quang hợp',
  };

  const sensorInfo = sensorLabels[rule.sensorType] || { label: rule.sensorType, unit: '' };

  let liveVal: number | undefined;
  if (rule.sensorType === 'lightIntensity') {
    liveVal = gateway.lightIntensity;
  } else {
    const targetZoneData = rule.targetZone === 'zone2' ? zones[1] : zones[0];
    if (targetZoneData) {
      if (rule.sensorType === 'temperature') liveVal = targetZoneData.current.temperature;
      else if (rule.sensorType === 'humidity') liveVal = targetZoneData.current.humidity;
      else if (rule.sensorType === 'soilMoisture') liveVal = targetZoneData.current.soilMoisture;
    }
  }

  return (
    <article
      className={`bg-white rounded-[18px] border p-5 transition-shadow shadow-card hover:shadow-card-hover ${
        rule.enabled ? 'border-[#E6E1D6]' : 'border-[#E6E1D6] bg-[#FAF9F6]'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3.5">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-[12px] border flex items-center justify-center flex-shrink-0 ${
              rule.enabled
                ? 'bg-[#EAF6EE] border-[#B7E1C6] text-[#15803D]'
                : 'bg-[#EFECE4] border-[#D8D2C5] text-[#616E7C]'
            }`}
          >
            <Sliders className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h4 className={`font-bold text-base ${rule.enabled ? 'text-[#1F2933]' : 'text-[#52606D]'}`}>
              {rule.name}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant={rule.enabled ? 'success' : 'neutral'} dot={rule.enabled}>
                {rule.enabled ? 'Đang kích hoạt' : 'Tạm dừng'}
              </Badge>
              <span className="text-xs text-[#52606D] font-medium">
                Khu vực:{' '}
                {rule.targetZone === 'all'
                  ? 'Toàn khu'
                  : rule.targetZone === 'zone1'
                  ? 'Khu 1'
                  : 'Khu 2'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {canModify && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(rule)}
              className="p-2 rounded-[10px] border border-[#D8D2C5] bg-white text-[#52606D] hover:text-[#15803D] hover:bg-[#EAF6EE] hover:border-[#B7E1C6] transition-colors cursor-pointer"
              title="Chỉnh sửa quy tắc"
              aria-label={`Chỉnh sửa quy tắc ${rule.name}`}
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleRule(rule.id)}
            disabled={!canModify}
            aria-label={`Bật tắt quy tắc ${rule.name}`}
            className={`p-2 rounded-[10px] transition-colors border cursor-pointer disabled:cursor-not-allowed ${
              !canModify
                ? 'bg-[#EFECE4] border-[#E2DDD2] text-[#7B8794]'
                : rule.enabled
                ? 'bg-[#EAF6EE] border-[#B7E1C6] text-[#15803D] hover:bg-[#D8F0E0]'
                : 'bg-[#FAF9F6] border-[#D8D2C5] text-[#52606D] hover:text-[#1F2933]'
            }`}
            title={rule.enabled ? 'Tắt quy tắc' : 'Bật quy tắc'}
          >
            <Power className="w-4 h-4" aria-hidden="true" />
          </button>

          {canModify && (
            <button
              type="button"
              onClick={() => deleteRule(rule.id)}
              className="p-2 rounded-[10px] border border-[#D8D2C5] bg-white text-[#52606D] hover:text-[#BE123C] hover:bg-[#FFF1F2] hover:border-[#FECDD3] transition-colors cursor-pointer"
              title="Xóa quy tắc"
              aria-label="Xóa quy tắc"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* IF / THEN Logic Readout */}
      <div className="bg-[#FAF9F6] border border-[#ECE7DC] rounded-[12px] p-3.5 my-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-[#52606D] font-medium">Điều kiện kích hoạt (IF):</span>
          <div className="font-bold text-[#1F2933] mt-1 font-mono text-sm tabular-nums">
            {sensorInfo.label} {rule.comparison} {rule.threshold} {sensorInfo.unit}
          </div>
          {rule.hysteresis > 0 && (
            <div className="text-[11px] text-[#52606D] mt-0.5 flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#616E7C]" aria-hidden="true" />
              Dải trễ chống dao động (Hysteresis): ±{rule.hysteresis} {sensorInfo.unit}
            </div>
          )}
        </div>

        <div>
          <span className="text-[#52606D] font-medium">Hành động điều khiển (THEN):</span>
          <div className="font-bold text-[#14532D] mt-1 font-mono text-sm tabular-nums">
            {rule.actuatorAction} {actuatorNames[rule.actuatorId] || rule.actuatorId}
            {rule.powerLevel !== undefined ? ` (${rule.powerLevel}%)` : ''}
          </div>
        </div>
      </div>

      <HysteresisVisualizer
        sensorType={rule.sensorType}
        comparison={rule.comparison}
        threshold={rule.threshold}
        hysteresis={rule.hysteresis}
        currentValue={liveVal}
        actuatorName={actuatorNames[rule.actuatorId] || rule.actuatorId}
        actuatorAction={rule.actuatorAction}
      />
    </article>
  );
};
