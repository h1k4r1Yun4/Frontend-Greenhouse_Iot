import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { clsx } from 'clsx';
import { MiniSparkline } from './MiniSparkline';

export interface SensorMetricCardProps {
  label: string;
  value: number;
  unit: string;
  icon: LucideIcon;
  optimalRange?: { min: number; max: number };
  color?: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'charcoal';
  precision?: number;
  history?: number[];
}

export const SensorMetricCard: React.FC<SensorMetricCardProps> = ({
  label,
  value,
  unit,
  icon: Icon,
  optimalRange,
  color = 'charcoal',
  precision = 1,
  history = [],
}) => {
  let statusTier: 'optimal' | 'warning' | 'critical' = 'optimal';
  let statusText = 'Trong chuẩn';

  if (optimalRange) {
    const { min, max } = optimalRange;
    const rangeSpan = max - min;
    const margin = rangeSpan * 0.15;

    if (value < min - margin || value > max + margin) {
      statusTier = 'critical';
      statusText = 'Vượt chuẩn';
    } else if (value < min || value > max) {
      statusTier = 'warning';
      statusText = 'Cận ngưỡng';
    }
  }

  let delta = 0;
  if (history.length >= 2) {
    const prev = history[Math.max(0, history.length - 4)] ?? history[0];
    delta = value - prev;
  }

  const iconToneMap = {
    emerald: 'text-[#3E4C59]',
    charcoal: 'text-[#3E4C59]',
    sky: 'text-[#0369A1]',
    amber: 'text-[#C2410C]',
    rose: 'text-[#BE123C]',
    indigo: 'text-[#52606D]',
  };

  const sparkColor =
    statusTier === 'critical'
      ? 'rose'
      : color === 'amber'
      ? 'terracotta'
      : color === 'emerald'
      ? 'charcoal'
      : color;

  // Calibrated optimal range track math
  let optLeftPct = 20;
  let optWidthPct = 60;
  let valPinPct = 50;
  if (optimalRange) {
    const span = Math.max(1, optimalRange.max - optimalRange.min);
    const scaleMin = optimalRange.min - span * 0.5;
    const scaleMax = optimalRange.max + span * 0.5;
    const scaleSpan = scaleMax - scaleMin;
    optLeftPct = ((optimalRange.min - scaleMin) / scaleSpan) * 100;
    optWidthPct = ((optimalRange.max - optimalRange.min) / scaleSpan) * 100;
    valPinPct = Math.max(4, Math.min(96, ((value - scaleMin) / scaleSpan) * 100));
  }

  return (
    <div
      className={clsx(
        'py-3 sm:py-1 sm:px-3.5 first:pt-0 sm:first:pl-0 last:pb-0 sm:last:pr-0 flex flex-col justify-between transition-colors rounded-[10px]',
        statusTier === 'critical' && 'bg-[#FFF5F6] sm:p-2.5 sm:first:pl-2.5 sm:last:pr-2.5',
        statusTier === 'warning' && 'bg-[#FFFDF5] sm:p-2.5 sm:first:pl-2.5 sm:last:pr-2.5'
      )}
    >
      {/* Header Row (show semantic badge ONLY when warning or critical) */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5 min-h-[20px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <Icon
            className={clsx(
              'w-3.5 h-3.5 flex-shrink-0',
              statusTier === 'critical' ? 'text-[#BE123C]' : iconToneMap[color]
            )}
            aria-hidden="true"
          />
          <span className="text-[11px] font-semibold text-[#52606D] whitespace-nowrap">
            {label}
          </span>
        </div>

        {optimalRange && statusTier !== 'optimal' && (
          <span
            className={clsx(
              'text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 whitespace-nowrap',
              statusTier === 'warning' && 'bg-[#FEF3C7] text-[#92400E] border-[#FCD34D]',
              statusTier === 'critical' && 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
            )}
          >
            {statusText}
          </span>
        )}
      </div>

      {/* Primary Numeric Value & Delta */}
      <div className="flex items-baseline justify-between gap-1.5">
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="text-[22px] sm:text-2xl font-bold tracking-tight text-[#1F2933] font-mono tabular-nums">
            {value.toFixed(precision)}
          </span>
          <span className="text-[11px] font-semibold text-[#52606D]">{unit}</span>
        </div>

        <div className="flex items-center gap-0.5 text-[11px] font-semibold font-mono tabular-nums flex-shrink-0">
          {delta > 0.05 ? (
            <span className="text-[#C2410C] flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              +{delta.toFixed(precision)}
            </span>
          ) : delta < -0.05 ? (
            <span className="text-[#0369A1] flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" aria-hidden="true" />
              {delta.toFixed(precision)}
            </span>
          ) : (
            <span className="text-[#616E7C] flex items-center gap-0.5">
              <Minus className="w-3 h-3" aria-hidden="true" />
              0.0
            </span>
          )}
        </div>
      </div>

      {/* Sparkline */}
      <div className="my-2">
        <MiniSparkline
          data={history}
          color={sparkColor}
          height={28}
          showGradient={true}
          showBeacon={true}
        />
      </div>

      {/* Calibrated Range Bar & Target Threshold */}
      {optimalRange && (
        <div className="space-y-1.5 pt-1.5">
          <div className="relative h-1.5 w-full bg-[#E6E1D6] rounded-full" aria-hidden="true">
            <div
              className="absolute top-0 h-1.5 rounded-full bg-[#9AC4AE]"
              style={{ left: `${optLeftPct}%`, width: `${optWidthPct}%` }}
            />
            <div
              className={clsx(
                'absolute -top-[3px] w-3 h-3 rounded-full border-2 border-white -translate-x-1/2 shadow-sm',
                statusTier === 'critical'
                  ? 'bg-[#BE123C]'
                  : statusTier === 'warning'
                  ? 'bg-[#D97706]'
                  : 'bg-[#1F2933]'
              )}
              style={{ left: `${valPinPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-1 text-[10px]">
            <span className="text-[#616E7C] whitespace-nowrap">Chuẩn</span>
            <span
              className={clsx(
                'font-mono font-semibold tabular-nums whitespace-nowrap',
                statusTier === 'critical' ? 'text-[#9F1239]' : 'text-[#1F2933]'
              )}
            >
              {optimalRange.min}–{optimalRange.max} {unit}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
