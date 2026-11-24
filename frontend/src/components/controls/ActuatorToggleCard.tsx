import React from 'react';
import {
  Droplets,
  CloudRain,
  Fan,
  Lightbulb,
  Power,
  Zap,
  Gauge,
} from 'lucide-react';
import { ActuatorState, ActuatorType } from '../../types';
import { Badge } from '../common/Badge';
import { useGreenhouse } from '../../context/GreenhouseContext';

export interface ActuatorToggleCardProps {
  actuator: ActuatorState;
  compact?: boolean;
}

export const ActuatorToggleCard: React.FC<ActuatorToggleCardProps> = ({
  actuator,
  compact = false,
}) => {
  const { toggleActuator, setActuatorPower, userRole, isEmergencyHalted } = useGreenhouse();
  const canControl = userRole === 'admin' || userRole === 'operator';
  const isLocked = !canControl || isEmergencyHalted;

  const fanSpinDuration =
    actuator.isActive && actuator.powerLevel > 0
      ? `${Math.max(0.3, (100 / actuator.powerLevel) * 0.45)}s`
      : '0s';

  const icons: Record<ActuatorType, React.ReactNode> = {
    water_pump: (
      <Droplets
        className={`w-5 h-5 ${actuator.isActive ? 'text-[#0369A1]' : 'text-[#52606D]'}`}
        aria-hidden="true"
      />
    ),
    mist_spray: (
      <CloudRain
        className={`w-5 h-5 ${actuator.isActive ? 'text-[#0369A1]' : 'text-[#52606D]'}`}
        aria-hidden="true"
      />
    ),
    ventilation_fan: (
      <Fan
        className={`w-5 h-5 ${
          actuator.isActive && actuator.powerLevel > 0 ? 'animate-spin text-[#1F2933]' : 'text-[#52606D]'
        }`}
        style={{ animationDuration: fanSpinDuration }}
        aria-hidden="true"
      />
    ),
    grow_light: (
      <Lightbulb
        className={`w-5 h-5 ${actuator.isActive ? 'text-[#B45309]' : 'text-[#52606D]'}`}
        aria-hidden="true"
      />
    ),
  };

  const powerWattages: Record<ActuatorType, number> = {
    water_pump: 45,
    mist_spray: 30,
    ventilation_fan: 65,
    grow_light: 80,
  };

  const currentPowerWatts = actuator.isActive
    ? Math.round(powerWattages[actuator.id] * (actuator.powerLevel / 100))
    : 0;

  const handleToggle = () => {
    if (isLocked) return;
    toggleActuator(actuator.id, actuator.isActive ? 'OFF' : 'ON');
  };

  const handlePwmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLocked) return;
    setActuatorPower(actuator.id, Number(e.target.value));
  };

  const setPresetPower = (preset: number) => {
    if (isLocked) return;
    setActuatorPower(actuator.id, preset);
  };

  const zoneShortLabel =
    actuator.targetZone === 'all'
      ? 'Toàn nhà kính'
      : actuator.targetZone === 'zone1'
      ? 'Khu vực 1'
      : 'Khu vực 2';

  if (compact) {
    return (
      <div
        className={`rounded-[14px] p-4 flex items-center justify-between gap-3 h-full transition-colors ${
          actuator.isActive && !isEmergencyHalted ? 'bg-[#EEF5F0]' : 'bg-[#FAF9F6]'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center flex-shrink-0 shadow-card">
            {icons[actuator.id]}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-[#1F2933] text-[13px] leading-snug">
              {actuator.name}
            </h4>
            <p className="text-[11px] text-[#52606D] font-mono tabular-nums mt-0.5">
              {zoneShortLabel} ·{' '}
              {actuator.isActive && !isEmergencyHalted
                ? actuator.driverType === 'pwm'
                  ? `Đang bật (${actuator.powerLevel}%)`
                  : 'Đang bật'
                : 'Đang tắt'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isLocked}
          aria-label={`Bật tắt ${actuator.name}`}
          aria-pressed={actuator.isActive}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 ${
            isLocked
              ? 'bg-[#D8D2C5] opacity-60 cursor-not-allowed'
              : actuator.isActive
              ? 'bg-emerald-600'
              : 'bg-[#CBD2D9]'
          }`}
        >
          <span
            className={`pointer-events-none h-6 w-6 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out flex items-center justify-center ${
              actuator.isActive ? 'translate-x-5' : 'translate-x-0'
            }`}
          >
            <Power
              className={`w-3.5 h-3.5 ${
                isLocked
                  ? 'text-[#7B8794]'
                  : actuator.isActive
                  ? 'text-[#15803D]'
                  : 'text-[#616E7C]'
              }`}
              aria-hidden="true"
            />
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-[18px] border transition-all duration-200 p-5 shadow-card hover:shadow-card-hover flex flex-col justify-between ${
        actuator.isActive && !isEmergencyHalted
          ? 'border-[#15803D]'
          : 'border-[#E6E1D6]'
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-11 h-11 rounded-[12px] border flex items-center justify-center flex-shrink-0 transition-colors ${
                actuator.isActive
                  ? 'bg-[#EAF6EE] border-[#B7E1C6]'
                  : 'bg-[#FAF9F6] border-[#E6E1D6]'
              }`}
            >
              {icons[actuator.id]}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-[#1F2933] text-sm sm:text-base leading-snug">
                {actuator.name}
              </h4>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="neutral">
                  {actuator.targetZone === 'all'
                    ? 'Toàn bộ nhà kính'
                    : actuator.targetZone === 'zone1'
                    ? 'Khu vực 1'
                    : 'Khu vực 2'}
                </Badge>
                <Badge variant={actuator.driverType === 'pwm' ? 'info' : 'neutral'}>
                  {actuator.driverType === 'pwm' ? 'Điều xung PWM' : 'Relay On/Off'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action-First Tactile Rocker Switch (loses action green completely when disabled) */}
          <button
            type="button"
            onClick={handleToggle}
            disabled={isLocked}
            aria-label={`Bật tắt ${actuator.name}`}
            aria-pressed={actuator.isActive}
            className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] focus-visible:ring-offset-2 ${
              isLocked
                ? 'bg-[#D8D2C5] opacity-60 cursor-not-allowed'
                : actuator.isActive
                ? 'bg-emerald-600'
                : 'bg-[#CBD2D9]'
            }`}
          >
            <span
              className={`pointer-events-none h-7 w-7 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out flex items-center justify-center ${
                actuator.isActive ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              <Power
                className={`w-4 h-4 ${
                  isLocked
                    ? 'text-[#7B8794]'
                    : actuator.isActive
                    ? 'text-[#15803D]'
                    : 'text-[#616E7C]'
                }`}
                aria-hidden="true"
              />
            </span>
          </button>
        </div>

        {/* PWM Controls */}
        {actuator.driverType === 'pwm' && (
          <div className="my-3.5 pt-3 border-t border-[#EFECE4]">
            <div className="flex items-center justify-between text-xs font-semibold text-[#52606D] mb-2">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-[#52606D]" aria-hidden="true" />
                Công suất điều khiển PWM
              </span>
              <span className="font-mono text-[#1F2933] font-bold text-sm tabular-nums">
                {actuator.powerLevel}%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              step="5"
              disabled={isLocked}
              value={actuator.powerLevel}
              onChange={handlePwmChange}
              aria-label={`Công suất PWM ${actuator.name}`}
              className="w-full warm-slider"
            />

            <div className="flex items-center justify-between gap-1.5 mt-2.5">
              {[25, 50, 75, 100].map((preset) => {
                const isSelected = actuator.powerLevel === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setPresetPower(preset)}
                    disabled={isLocked}
                    className={`flex-1 py-1.5 px-1 text-[11px] font-bold font-mono tabular-nums rounded-[8px] transition-all border cursor-pointer disabled:cursor-not-allowed ${
                      isLocked
                        ? 'bg-[#F6F4EF] text-[#7B8794] border-[#E6E1D6]'
                        : isSelected
                        ? 'bg-emerald-600 text-white border-[#15803D]'
                        : 'bg-[#FAF9F6] text-[#52606D] border-[#E2DDD2] hover:bg-[#EFECE4] hover:text-[#1F2933]'
                    }`}
                  >
                    {preset}%
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer Specs */}
      <div className="pt-3 mt-2 border-t border-[#EFECE4] flex items-center justify-between text-xs text-[#52606D]">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
          <span>Điện năng:</span>
          <span className="font-mono font-bold text-[#1F2933] tabular-nums">
            {currentPowerWatts} W
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`w-2 h-2 rounded-full ${
              actuator.isActive && !isEmergencyHalted ? 'bg-[#1F2933]' : 'bg-[#CBD2D9]'
            }`}
          />
          <span
            className={`font-bold tracking-tight ${
              actuator.isActive && !isEmergencyHalted ? 'text-[#1F2933]' : 'text-[#52606D]'
            }`}
          >
            {actuator.isActive ? 'ĐANG BẬT' : 'ĐANG TẮT'}
          </span>
        </div>
      </div>
    </div>
  );
};
