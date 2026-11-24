import React from 'react';
import { Layers } from 'lucide-react';
import { SensorMetricType, ComparisonOperator } from '../../types';

export interface HysteresisVisualizerProps {
  sensorType: SensorMetricType;
  comparison: ComparisonOperator;
  threshold: number;
  hysteresis: number;
  currentValue?: number;
  actuatorName?: string;
  actuatorAction?: 'ON' | 'OFF';
  className?: string;
}

export const HysteresisVisualizer: React.FC<HysteresisVisualizerProps> = ({
  sensorType,
  comparison,
  threshold,
  hysteresis,
  currentValue,
  actuatorName = 'Thiết bị',
  actuatorAction = 'ON',
  className = '',
}) => {
  const sensorConfigs: Record<
    SensorMetricType,
    { min: number; max: number; unit: string; label: string }
  > = {
    soilMoisture: { min: 0, max: 100, unit: '%', label: 'Độ ẩm đất' },
    humidity: { min: 20, max: 100, unit: '% RH', label: 'Độ ẩm không khí' },
    temperature: { min: 15, max: 45, unit: '°C', label: 'Nhiệt độ' },
    lightIntensity: { min: 0, max: 1200, unit: 'Lux', label: 'Ánh sáng' },
  };

  const config = sensorConfigs[sensorType] || { min: 0, max: 100, unit: '', label: sensorType };
  const span = config.max - config.min;
  const isLessThan = comparison === '<' || comparison === '<=';

  const triggerPoint = Math.max(config.min, Math.min(config.max, threshold));
  const resetPoint = isLessThan
    ? Math.max(config.min, Math.min(config.max, threshold + hysteresis))
    : Math.max(config.min, Math.min(config.max, threshold - hysteresis));

  const toPct = (val: number) => {
    const clamped = Math.max(config.min, Math.min(config.max, val));
    return ((clamped - config.min) / span) * 100;
  };

  const triggerPct = toPct(triggerPoint);
  const resetPct = toPct(resetPoint);

  let activeBandLeft = 0;
  let activeBandWidth = 0;
  let holdingBandLeft = 0;
  let holdingBandWidth = 0;
  let safeBandLeft = 0;
  let safeBandWidth = 0;

  if (isLessThan) {
    activeBandLeft = 0;
    activeBandWidth = triggerPct;
    holdingBandLeft = triggerPct;
    holdingBandWidth = Math.max(0, resetPct - triggerPct);
    safeBandLeft = resetPct;
    safeBandWidth = Math.max(0, 100 - resetPct);
  } else {
    safeBandLeft = 0;
    safeBandWidth = resetPct;
    holdingBandLeft = resetPct;
    holdingBandWidth = Math.max(0, triggerPct - resetPct);
    activeBandLeft = triggerPct;
    activeBandWidth = Math.max(0, 100 - triggerPct);
  }

  const currentPct = currentValue !== undefined ? toPct(currentValue) : undefined;

  // Smart label collision & edge clamping
  const pinsAreClose = Math.abs(triggerPct - resetPct) < 24;
  const getEdgeTransform = (pct: number) => {
    if (pct < 14) return 'translateX(0%)';
    if (pct > 86) return 'translateX(-100%)';
    return 'translateX(-50%)';
  };

  return (
    <div
      className={`space-y-2.5 p-3.5 bg-[#FAF9F6] rounded-[14px] border border-[#E6E1D6] select-none ${className}`}
    >
      {/* Header labels */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-[#52606D]">
        <span className="flex items-center gap-1.5 text-[#1F2933]">
          <Layers className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
          <span>
            Trực quan hóa Dải trễ (Hysteresis Band): ±{hysteresis} {config.unit}
          </span>
        </span>
        <span className="font-mono text-[#616E7C] text-[10px] tabular-nums">
          {config.min}
          {config.unit} — {config.max}
          {config.unit}
        </span>
      </div>

      {/* 3-Band Track with Non-Overlapping Pin Tiers */}
      <div className="relative pt-11 pb-11">
        {/* Track Bar — strictly 3 direct div children for DOM verification */}
        <div className="h-4 w-full bg-[#EFECE4] rounded-full overflow-hidden flex relative border border-[#D8D2C5]">
          {/* 1. Active Band */}
          <div
            className="h-full bg-[#E11D48]/85 transition-all"
            style={{
              position: 'absolute',
              left: `${activeBandLeft}%`,
              width: `${activeBandWidth}%`,
            }}
            title={`Vùng kích hoạt ${actuatorAction} ${actuatorName}: ${
              isLessThan ? `< ${threshold}` : `> ${threshold}`
            } ${config.unit}`}
          />

          {/* 2. Holding Band */}
          <div
            className="h-full bg-[#F59E0B] transition-all hazard-stripes"
            style={{
              position: 'absolute',
              left: `${holdingBandLeft}%`,
              width: `${holdingBandWidth}%`,
            }}
            title={`Dải trễ giữ trạng thái (Chống rung relay): ${Math.min(
              triggerPoint,
              resetPoint
            )} - ${Math.max(triggerPoint, resetPoint)} ${config.unit}`}
          />

          {/* 3. Safe Band */}
          <div
            className="h-full bg-[#15803D]/85 transition-all"
            style={{
              position: 'absolute',
              left: `${safeBandLeft}%`,
              width: `${safeBandWidth}%`,
            }}
            title={`Vùng an toàn (Ngắt): ${isLessThan ? `> ${resetPoint}` : `< ${resetPoint}`} ${
              config.unit
            }`}
          />
        </div>

        {/* Trigger Point Pin (Upper Tier 1) */}
        <div
          className="absolute top-0 pointer-events-none flex flex-col items-center"
          style={{ left: `${triggerPct}%` }}
        >
          <span
            style={{ transform: getEdgeTransform(triggerPct) }}
            className="text-[10px] font-bold font-mono tabular-nums px-1.5 py-0.5 rounded-[6px] bg-[#9F1239] text-white whitespace-nowrap shadow-sm"
          >
            {triggerPoint}
            {config.unit} (Kích hoạt)
          </span>
          <div className="w-0.5 h-6 bg-[#9F1239] mt-0.5" />
        </div>

        {/* Reset Point Pin (Upper Tier 2 when spaced, or staggered clean upper row when close) */}
        <div
          className={`absolute pointer-events-none flex flex-col items-center ${
            pinsAreClose ? 'top-5' : 'top-0'
          }`}
          style={{ left: `${resetPct}%` }}
        >
          <span
            style={{ transform: getEdgeTransform(resetPct) }}
            className="text-[10px] font-bold font-mono tabular-nums px-1.5 py-0.5 rounded-[6px] bg-[#14532D] text-white whitespace-nowrap shadow-sm"
          >
            {resetPoint}
            {config.unit} (Ngắt)
          </span>
          <div className={`w-0.5 bg-[#14532D] mt-0.5 ${pinsAreClose ? 'h-2.5' : 'h-6'}`} />
        </div>

        {/* Live Reading Marker (Lower Tier) */}
        {currentPct !== undefined && (
          <div
            className="absolute bottom-1 pointer-events-none flex flex-col items-center z-10"
            style={{ left: `${currentPct}%` }}
          >
            <div className="w-0.5 h-5 bg-[#1F2933]" />
            <div
              style={{ transform: getEdgeTransform(currentPct) }}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#1F2933] text-white text-[10px] font-mono font-bold tabular-nums rounded-full shadow-sm whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4BAE72]" aria-hidden="true" />
              <span>
                Đo: {currentValue}
                {config.unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-[#52606D] border-t border-[#E6E1D6]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E11D48]" aria-hidden="true" />
          <span>Vùng kích hoạt {actuatorAction}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B] hazard-stripes" aria-hidden="true" />
          <span>Dải trễ giữ (Chống rung relay)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" aria-hidden="true" />
          <span>Vùng an toàn ({actuatorAction === 'ON' ? 'TẮT' : 'BẬT'})</span>
        </div>
      </div>
    </div>
  );
};
