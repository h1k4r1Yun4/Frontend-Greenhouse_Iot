import React from 'react';
import { AlertOctagon, Zap, Cpu, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useGreenhouse } from '../../context/GreenhouseContext';

export const MasterControlPanel: React.FC = () => {
  const { actuators, emergencyStop, rearmSystem, isEmergencyHalted, userRole } = useGreenhouse();
  const canControl = userRole === 'admin' || userRole === 'operator';

  const activeCount = actuators.filter((a) => a.isActive).length;

  const totalWatts = actuators.reduce((sum, a) => {
    if (!a.isActive) return sum;
    const base =
      a.id === 'grow_light' ? 80 : a.id === 'ventilation_fan' ? 65 : a.id === 'water_pump' ? 45 : 30;
    return sum + Math.round(base * (a.powerLevel / 100));
  }, 0);

  return (
    <div className="space-y-4">
      {/* Global EMERGENCY HALTED State Latch Banner */}
      {isEmergencyHalted && (
        <div
          role="alert"
          className="bg-[#9F1239] border border-[#BE123C] rounded-[18px] p-5 text-white shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-modal-in"
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-[#881337] border border-rose-400/40 flex items-center justify-center text-white flex-shrink-0">
              <ShieldAlert className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <span className="font-extrabold text-sm uppercase tracking-wider text-rose-100 block">
                Cờ Trạng Thái: EMERGENCY HALTED
              </span>
              <p className="text-xs sm:text-sm text-rose-50 mt-0.5">
                Toàn bộ 4 thiết bị đã bị ngắt điện an toàn để bảo vệ phần cứng và cây trồng.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={rearmSystem}
            disabled={!canControl}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#9F1239] hover:bg-rose-50 rounded-[12px] font-bold text-xs shadow-sm transition-all active:scale-[0.98] flex-shrink-0 cursor-pointer disabled:bg-[#E6E1D6] disabled:text-[#52606D] disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Khôi phục hệ thống (Re-arm System)</span>
          </button>
        </div>
      )}

      {/* Main Mission Control Card */}
      <section className="bg-white rounded-[18px] border border-[#E6E1D6] shadow-card p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Summary */}
          <div className="space-y-3 max-w-2xl">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#1F2933]">
                Bảng điều khiển trung tâm
              </h2>
              <p className="text-xs sm:text-sm text-[#52606D] mt-1 leading-relaxed">
                Quản trị vận hành trực tiếp tới các Relay và Driver PWM trên bo mạch ESP32 Gateway. Mọi thao tác thủ công phải tuân thủ an toàn sinh học cây trồng.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2 bg-[#FAF9F6] px-3.5 py-2 rounded-[12px] border border-[#E6E1D6]">
                <Cpu className="w-4 h-4 text-[#52606D]" aria-hidden="true" />
                <span className="text-[#52606D] font-medium">Thiết bị đang chạy:</span>
                <span className="font-bold text-[#1F2933] font-mono tabular-nums">
                  {activeCount} / 4
                </span>
              </div>
              <div className="flex items-center gap-2 bg-[#FAF9F6] px-3.5 py-2 rounded-[12px] border border-[#E6E1D6]">
                <Zap className="w-4 h-4 text-[#B45309]" aria-hidden="true" />
                <span className="text-[#52606D] font-medium">Tổng tiêu thụ điện:</span>
                <span className="font-bold text-[#1F2933] font-mono tabular-nums">
                  {totalWatts} W
                </span>
              </div>
            </div>
          </div>

          {/* Right Industrial Emergency Stop Housing */}
          <div className="flex flex-col items-start sm:items-end justify-center flex-shrink-0">
            <div
              className={`p-1.5 rounded-[16px] ${
                canControl ? 'hazard-collar shadow-card' : 'bg-[#EFECE4] border border-[#D8D2C5]'
              }`}
            >
              <button
                type="button"
                onClick={emergencyStop}
                disabled={!canControl}
                className="group px-5 py-3.5 rounded-[12px] font-extrabold text-sm tracking-wide text-white uppercase transition-all duration-150 active:translate-y-0.5 bg-[#BE123C] hover:bg-[#9F1239] border border-rose-300/40 shadow-sm disabled:bg-[#D8D2C5] disabled:text-[#52606D] disabled:border-transparent disabled:cursor-not-allowed flex items-center gap-3 cursor-pointer"
                title="Ngắt toàn bộ nguồn cấp thiết bị ngay lập tức"
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center border ${
                    canControl
                      ? 'bg-[#881337] text-white border-rose-300/40'
                      : 'bg-[#E6E1D6] text-[#52606D] border-[#D8D2C5]'
                  }`}
                >
                  <AlertOctagon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <span
                    className={`block text-[10px] font-bold tracking-widest leading-none mb-0.5 ${
                      canControl ? 'text-rose-100' : 'text-[#616E7C]'
                    }`}
                  >
                    KHẨN CẤP • E-STOP
                  </span>
                  <span className="block text-sm sm:text-base tracking-tight leading-tight">
                    DỪNG KHẨN CẤP (EMERGENCY STOP)
                  </span>
                </div>
              </button>
            </div>
            <span className="text-[11px] text-[#52606D] mt-2 flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
              Tiêu chuẩn công nghiệp IEC 60947-5-5
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
