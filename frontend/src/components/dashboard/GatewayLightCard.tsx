import React from 'react';
import { Sun, Radio, ShieldCheck, Zap } from 'lucide-react';
import { GatewayData } from '../../types';
import { Badge } from '../common/Badge';
import { MiniSparkline } from './MiniSparkline';

export interface GatewayLightCardProps {
  gateway: GatewayData;
}

export const GatewayLightCard: React.FC<GatewayLightCardProps> = ({ gateway }) => {
  const lux = gateway.lightIntensity;

  let lightStatusText = 'Ánh sáng tự nhiên đầy đủ';
  let lightState: 'normal' | 'warning' | 'info' = 'normal';
  if (lux < 350) {
    lightStatusText = 'Thiếu sáng (Cần bổ sung LED)';
    lightState = 'warning';
  } else if (lux > 900) {
    lightStatusText = 'Nắng gắt (Cần thông gió/che lưới)';
    lightState = 'info';
  }

  const percentage = Math.min(100, Math.round((lux / 1200) * 100));
  const ppfd = Math.round(lux * 0.0185);
  const estimatedDli = ((ppfd * 14 * 3600) / 1000000).toFixed(1);

  const solarHistory = gateway.history || [];

  return (
    <section className="bg-white rounded-[18px] border border-[#E6E1D6] shadow-card p-5 transition-shadow hover:shadow-card-hover flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-[#EFECE4]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#EFECE4] border border-[#D8D2C5] text-[#B45309] flex items-center justify-center flex-shrink-0">
            <Radio className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[15px] sm:text-base text-[#1F2933] leading-snug">
                Trạm Gateway ESP32 Trung tâm
              </h3>
              {gateway.status !== 'online' && (
                <Badge variant="danger" dot={true}>
                  Offline
                </Badge>
              )}
            </div>
            <p className="text-xs text-[#52606D] mt-0.5 truncate">
              Cảm biến Quang trở LDR &amp; Khối điều khiển 4 thiết bị chấp hành
            </p>
          </div>
        </div>
      </div>

      {/* Primary Lux Readout (Open Typography — no inner bordered box) */}
      <div className="py-3.5 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#52606D]">
            Cường độ ánh sáng (LDR Sensor)
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl font-bold text-[#1F2933] font-mono tabular-nums">
              {lux}
            </span>
            <span className="text-sm font-bold text-[#B45309]">Lux</span>
          </div>
          <div className="mt-1.5">
            {lightState === 'normal' ? (
              <span className="text-xs font-medium text-[#52606D]">{lightStatusText}</span>
            ) : (
              <Badge variant={lightState}>{lightStatusText}</Badge>
            )}
          </div>
        </div>

        <div className="w-11 h-11 rounded-[12px] bg-[#FEF3C7] text-[#B45309] flex items-center justify-center flex-shrink-0">
          <Sun className="w-5 h-5" aria-hidden="true" />
        </div>
      </div>

      {/* Full-width Diurnal Curve & Light Scale */}
      <div className="space-y-2.5 pt-2 border-t border-[#EFECE4]">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-[#52606D]">
          <span>
            DLI ước tính:{' '}
            <strong className="font-mono text-[#1F2933] tabular-nums">
              {estimatedDli} mol/m²/d
            </strong>
          </span>
          <span className="text-[#616E7C] text-[11px] font-mono tabular-nums">
            {percentage}% thang đo
          </span>
        </div>

        <MiniSparkline data={solarHistory} color="amber" height={30} showBeacon={true} />

        <div className="w-full bg-[#EFECE4] h-1.5 rounded-full overflow-hidden" aria-hidden="true">
          <div
            className="bg-[#D97706] h-full rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Clean Divider-Separated Specs Row (no bordered inner pills) */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#EFECE4] text-xs text-[#52606D]">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-[#52606D] flex-shrink-0" aria-hidden="true" />
            <span>Lọc nhiễu ADC: Bật</span>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Zap className="w-3.5 h-3.5 text-[#B45309] flex-shrink-0" aria-hidden="true" />
            <span>Kênh PWM: 4 Mosfet</span>
          </span>
        </div>
      </div>
    </section>
  );
};
