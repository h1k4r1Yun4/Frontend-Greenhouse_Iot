import React from 'react';
import { Sprout, MapPin, Activity } from 'lucide-react';
import { CROPS } from '../../constants/crops';
import { useGreenhouse } from '../../context/GreenhouseContext';

export interface CropZoneSelectorProps {
  selectedCrop: string;
  onSelectCrop: (crop: string) => void;
  selectedZone: string;
  onSelectZone: (zone: string) => void;
}

export const CropZoneSelector: React.FC<CropZoneSelectorProps> = ({
  selectedCrop,
  onSelectCrop,
  selectedZone,
  onSelectZone,
}) => {
  const { zones, runtimeConfig } = useGreenhouse();
  const currentCrop = CROPS[selectedCrop] || CROPS.tomato;

  const isAllZones = selectedZone === 'all';
  const targetZoneData = selectedZone === 'zone2' ? zones[1] : zones[0];

  const aiLabel =
    runtimeConfig.aiMode === 'backend-proxy'
      ? 'Backend AI Proxy'
      : runtimeConfig.aiMode === 'gemini-direct'
      ? 'Google Gemini API'
      : 'Mock Agro-AI (Offline)';

  return (
    <div className="bg-[#FAF9F6] border border-[#E6E1D6] rounded-[14px] p-3.5 sm:p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Crop Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="crop-select"
              className="flex items-center gap-1 text-xs font-bold text-[#1F2933]"
            >
              <Sprout className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
              <span>Loại cây trồng:</span>
            </label>
            <select
              id="crop-select"
              value={selectedCrop}
              onChange={(e) => onSelectCrop(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#D8D2C5] rounded-[10px] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#15803D] cursor-pointer"
            >
              <option value="tomato">Cà chua (Tomato)</option>
              <option value="lettuce">Rau xà lách (Lettuce)</option>
              <option value="strawberry">Dâu tây (Strawberry)</option>
              <option value="melon">Dưa lưới (Melon)</option>
            </select>
          </div>

          {/* Zone Selector */}
          <div className="flex items-center gap-1.5">
            <label
              htmlFor="zone-select"
              className="flex items-center gap-1 text-xs font-bold text-[#1F2933]"
            >
              <MapPin className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
              <span>Khu vực:</span>
            </label>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => onSelectZone(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#D8D2C5] rounded-[10px] text-[#1F2933] focus:outline-none focus:ring-2 focus:ring-[#15803D] cursor-pointer"
            >
              <option value="all">Toàn bộ nhà kính</option>
              <option value="zone1">Khu vực 1 (Node 1 - ESP8266)</option>
              <option value="zone2">Khu vực 2 (Node 2 - ESP8266)</option>
            </select>
          </div>
        </div>

        {/* Live Telemetry Summary Chip */}
        {isAllZones ? (
          <div className="inline-flex flex-wrap items-center gap-2 text-[11px] text-[#1F2933] font-mono tabular-nums bg-white px-3 py-1.5 rounded-[10px] border border-[#E2DDD2]">
            <Activity className="w-3.5 h-3.5 text-[#52606D] flex-shrink-0" aria-hidden="true" />
            <span>
              Khu 1: {zones[0]?.current.temperature ?? '--'}°C · Đất {zones[0]?.current.soilMoisture ?? '--'}%
            </span>
            <span className="text-[#D8D2C5]" aria-hidden="true">|</span>
            <span>
              Khu 2: {zones[1]?.current.temperature ?? '--'}°C · Đất {zones[1]?.current.soilMoisture ?? '--'}%
            </span>
          </div>
        ) : (
          targetZoneData && (
            <div className="inline-flex items-center gap-2 text-[11px] text-[#1F2933] font-mono tabular-nums bg-white px-3 py-1.5 rounded-[10px] border border-[#E2DDD2]">
              <Activity className="w-3.5 h-3.5 text-[#52606D]" aria-hidden="true" />
              <span>
                {targetZoneData.zoneName.includes('1') ? 'Khu 1' : 'Khu 2'}:{' '}
                {targetZoneData.current.temperature}°C • {targetZoneData.current.humidity}% RH • Đất{' '}
                {targetZoneData.current.soilMoisture}%
              </span>
            </div>
          )
        )}
      </div>

      {/* Biological Guidelines Row */}
      <div className="text-[11px] text-[#52606D] font-medium flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6E1D6]">
        <span className="flex flex-wrap items-center gap-1.5">
          <span>Khung tối ưu cho {currentCrop.nameVi}:</span>
          <strong className="font-mono text-[#1F2933] tabular-nums">
            {currentCrop.optimalTemp.min}–{currentCrop.optimalTemp.max}°C
          </strong>
          <span aria-hidden="true">•</span>
          <span>Độ ẩm đất:</span>
          <strong className="font-mono text-[#1F2933] tabular-nums">
            {currentCrop.optimalSoilMoisture.min}–{currentCrop.optimalSoilMoisture.max}%
          </strong>
        </span>
        <span className="text-[#52606D] font-semibold text-[11px] font-mono">
          {aiLabel}
        </span>
      </div>
    </div>
  );
};
