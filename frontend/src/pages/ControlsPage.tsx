import React, { useState, useEffect } from 'react';
import { useGreenhouse } from '../context/GreenhouseContext';
import { MasterControlPanel } from '../components/controls/MasterControlPanel';
import { ActuatorToggleCard } from '../components/controls/ActuatorToggleCard';
import { Sliders, ShieldCheck, BatteryCharging, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export const ControlsPage: React.FC = () => {
  const {
    actuators,
    userRole,
    telemetryInterval,
    setTelemetryInterval,
    isEmergencyHalted,
  } = useGreenhouse();
  const isViewer = userRole === 'viewer';
  const isLocked = isViewer || isEmergencyHalted;

  const [intervalInput, setIntervalInput] = useState<number>(telemetryInterval);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSendingInterval, setIsSendingInterval] = useState<boolean>(false);
  const [zoneFilter, setZoneFilter] = useState<'all' | 'zone1' | 'zone2' | 'shared'>('all');

  useEffect(() => {
    setIntervalInput(telemetryInterval);
  }, [telemetryInterval]);

  const handleSendInterval = async () => {
    if (isViewer) return;
    setIsSendingInterval(true);
    try {
      await setTelemetryInterval(intervalInput);
      setSaveSuccessMsg(
        `Đã cập nhật chu kỳ đồng bộ sang ${intervalInput} giây cho Gateway ESP32 và luồng dữ liệu trực tiếp.`
      );
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } finally {
      setIsSendingInterval(false);
    }
  };

  const filteredActuators = actuators.filter((actuator) => {
    if (zoneFilter === 'all') return true;
    if (zoneFilter === 'zone1') return actuator.targetZone === 'zone1';
    if (zoneFilter === 'zone2') return actuator.targetZone === 'zone2';
    if (zoneFilter === 'shared') return actuator.targetZone === 'all';
    return true;
  });

  return (
    <div className="space-y-6">
      <MasterControlPanel />

      {/* Viewer Read-Only Warning */}
      {isViewer && (
        <div
          role="status"
          className="bg-[#FEF3C7] border border-[#FCD34D] rounded-[14px] p-4 text-xs text-[#92400E] flex items-center gap-2.5"
        >
          <ShieldCheck className="w-4 h-4 text-[#B45309] flex-shrink-0" aria-hidden="true" />
          <span>
            Bạn đang đăng nhập với vai trò <strong>Người xem (Viewer)</strong> (Chỉ đọc). Vui lòng
            chuyển sang vai trò <strong>Admin</strong> hoặc <strong>Operator</strong> ở thanh tiêu đề
            để thực hiện bật/tắt thiết bị hoặc chỉnh PWM.
          </span>
        </div>
      )}

      {/* Battery Saving Telemetry Interval Configuration */}
      <section className="bg-white rounded-[18px] border border-[#E6E1D6] p-5 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-[12px] bg-[#FAF9F6] border border-[#E6E1D6] text-[#3E4C59] flex items-center justify-center flex-shrink-0">
              <BatteryCharging className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-bold text-[#1F2933] text-base flex flex-wrap items-center gap-2">
                <span>Cấu hình Tiết Kiệm Pin (Chu kỳ cập nhật dữ liệu)</span>
                <span className="text-[10px] bg-[#FAF9F6] text-[#52606D] border border-[#E2DDD2] px-2 py-0.5 rounded-full font-semibold">
                  MQTT Gateway
                </span>
              </h3>
              <p className="text-xs text-[#52606D] mt-0.5">
                Thiết lập tần suất gửi dữ liệu cảm biến từ trạm ESP32 lên giao diện (1–60 giây). Tăng số giây giúp giảm tiêu thụ năng lượng cho node chạy pin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-center flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#D8D2C5] rounded-[12px] px-3 py-1.5">
              <label htmlFor="telemetry-interval-input" className="text-xs font-semibold text-[#52606D]">
                Chu kỳ:
              </label>
              <input
                id="telemetry-interval-input"
                type="number"
                min="1"
                max="60"
                value={intervalInput}
                disabled={isViewer}
                onChange={(e) =>
                  setIntervalInput(Math.max(1, Math.min(60, Number(e.target.value) || 1)))
                }
                className="w-14 text-center font-mono font-bold text-sm text-[#1F2933] bg-white border border-[#D8D2C5] rounded-[8px] py-0.5 tabular-nums focus:outline-none focus:ring-2 focus:ring-[#15803D] disabled:bg-[#EFECE4] disabled:text-[#616E7C]"
              />
              <span className="text-xs text-[#52606D] font-semibold">giây</span>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<Send className="w-3.5 h-3.5" />}
              disabled={isViewer || isSendingInterval}
              onClick={handleSendInterval}
            >
              {isSendingInterval ? 'Đang gửi...' : 'Gửi'}
            </Button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="flex items-center gap-2 bg-[#EAF6EE] border border-[#B7E1C6] text-[#14532D] text-xs font-medium px-3.5 py-2.5 rounded-[12px] animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#15803D] flex-shrink-0" aria-hidden="true" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
      </section>

      {/* Actuator Cards Grid with Zone Filtering */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-lg text-[#1F2933] flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#52606D]" aria-hidden="true" />
            <span>Bảng Điều Khiển Từng Thiết Bị Phần Cứng (Manual Actuation)</span>
          </h3>

          <div className="flex flex-wrap items-center gap-1 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2] text-xs">
            {[
              { id: 'all', label: `Tất cả (${actuators.length})` },
              { id: 'zone1', label: 'Khu 1 (Cà chua)' },
              { id: 'zone2', label: 'Khu 2 (Xà lách)' },
              { id: 'shared', label: 'Hệ thống chung' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setZoneFilter(item.id as typeof zoneFilter)}
                className={`px-3 py-1.5 rounded-[9px] font-semibold transition-all cursor-pointer ${
                  zoneFilter === item.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#52606D] hover:text-[#1F2933]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {isLocked && !isViewer && (
          <div className="text-xs text-[#9F1239] bg-[#FFF1F2] border border-[#FECDD3] rounded-[12px] px-3.5 py-2 font-medium">
            Các công tắc thiết bị đang bị khóa do trạng thái EMERGENCY HALTED. Nhấn &quot;Khôi phục hệ thống (Re-arm System)&quot; ở trên để mở khóa điều khiển.
          </div>
        )}

        {filteredActuators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredActuators.map((actuator) => (
              <ActuatorToggleCard key={actuator.id} actuator={actuator} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-8 text-center text-sm text-[#52606D]">
            Không có thiết bị riêng nào gắn cố định tại khu vực đã chọn — tất cả 4 thiết bị đang phục vụ ở mục <strong>Hệ thống chung</strong>.
          </div>
        )}
      </div>
    </div>
  );
};
