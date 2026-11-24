import React from 'react';
import { Thermometer, Droplets, Waves, Cpu, Sprout } from 'lucide-react';
import { ZoneData } from '../../types';
import { CROPS } from '../../constants/crops';
import { Badge } from '../common/Badge';
import { SensorMetricCard } from './SensorMetricCard';

export interface ZoneOverviewCardProps {
  zone: ZoneData;
}

export const ZoneOverviewCard: React.FC<ZoneOverviewCardProps> = ({ zone }) => {
  const crop = CROPS[zone.cropType] || CROPS.tomato;

  const tempHistory = (zone.history || []).map((h) => h.temperature);
  const humidityHistory = (zone.history || []).map((h) => h.humidity);
  const soilHistory = (zone.history || []).map((h) => h.soilMoisture);

  // Accurate 4-level biological health score
  const isTempOptimal =
    zone.current.temperature >= crop.optimalTemp.min &&
    zone.current.temperature <= crop.optimalTemp.max;
  const isHumidOptimal =
    zone.current.humidity >= crop.optimalHumidity.min &&
    zone.current.humidity <= crop.optimalHumidity.max;
  const isSoilOptimal =
    zone.current.soilMoisture >= crop.optimalSoilMoisture.min &&
    zone.current.soilMoisture <= crop.optimalSoilMoisture.max;

  const optimalCount =
    (isTempOptimal ? 1 : 0) + (isHumidOptimal ? 1 : 0) + (isSoilOptimal ? 1 : 0);

  const healthScore =
    optimalCount === 3 ? 98 : optimalCount === 2 ? 78 : optimalCount === 1 ? 45 : 18;
  const healthVariant: 'neutral' | 'warning' | 'danger' =
    optimalCount === 3 ? 'neutral' : optimalCount === 2 ? 'warning' : 'danger';

  const statusBadgeVariant: 'warning' | 'danger' =
    zone.status === 'offline' ? 'danger' : 'warning';
  const statusLabel = zone.status === 'offline' ? 'Mất kết nối' : 'Cần chú ý';

  return (
    <section className="bg-white rounded-[18px] border border-[#E6E1D6] shadow-card p-4 sm:p-5 transition-shadow hover:shadow-card-hover">
      {/* Compact Header (zero orphan bullets, no passive green pills) */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 pb-3.5 mb-3.5 border-b border-[#EFECE4]">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-[12px] bg-[#EFECE4] border border-[#D8D2C5] text-[#1F2933] flex items-center justify-center font-bold text-sm font-mono flex-shrink-0">
            {zone.zoneId === 'zone1' ? 'Z1' : 'Z2'}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-[15px] sm:text-base text-[#1F2933] leading-snug">
                {zone.zoneName}
              </h3>
              {zone.status !== 'online' && (
                <Badge variant={statusBadgeVariant} dot={true}>
                  {statusLabel}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1 text-xs text-[#52606D]">
              <span className="flex items-center gap-1 text-[#1F2933] font-semibold">
                <Sprout className="w-3.5 h-3.5 text-[#52606D]" aria-hidden="true" />
                Cây trồng: {crop.nameVi}
              </span>
              <span className="hidden sm:inline text-[#D8D2C5]" aria-hidden="true">•</span>
              <span className="flex items-center gap-1 font-mono text-[11px] text-[#616E7C]">
                <Cpu className="w-3 h-3" aria-hidden="true" />
                {zone.nodeId}
              </span>
            </div>
          </div>
        </div>

        {/* Health Score Pill (neutral warm stone when optimal; semantic amber/crimson only when degraded) */}
        <div className="flex items-center sm:justify-end flex-shrink-0">
          <Badge variant={healthVariant} className="whitespace-nowrap">
            <span>
              Chỉ số sinh học: <strong className="font-mono tabular-nums">{healthScore}%</strong>
            </span>
          </Badge>
        </div>
      </div>

      {/* 3 Divider-Separated Flat Metric Wells (zero bordered inner boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#EFECE4]">
        <SensorMetricCard
          label="Nhiệt độ"
          value={zone.current.temperature}
          unit="°C"
          icon={Thermometer}
          optimalRange={crop.optimalTemp}
          color="amber"
          history={tempHistory}
        />

        <SensorMetricCard
          label="Độ ẩm KK"
          value={zone.current.humidity}
          unit="%RH"
          icon={Droplets}
          optimalRange={crop.optimalHumidity}
          color="sky"
          history={humidityHistory}
        />

        <SensorMetricCard
          label="Độ ẩm đất"
          value={zone.current.soilMoisture}
          unit="%"
          icon={Waves}
          optimalRange={crop.optimalSoilMoisture}
          color="charcoal"
          history={soilHistory}
        />
      </div>
    </section>
  );
};
