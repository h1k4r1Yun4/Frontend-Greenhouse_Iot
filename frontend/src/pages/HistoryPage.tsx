import React from 'react';
import { SensorHistoryChart } from '../components/history/SensorHistoryChart';
import { LineChart } from 'lucide-react';

export const HistoryPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[18px] border border-[#E6E1D6] p-6 shadow-card">
        <h2 className="text-xl font-extrabold text-[#1F2933] flex items-center gap-2">
          <LineChart className="w-5 h-5 text-[#52606D]" aria-hidden="true" />
          <span>Lịch Sử Đo Đạc &amp; Phân Tích Biểu Đồ Chuỗi Thời Gian</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#52606D] mt-1 max-w-2xl">
          Trực quan hóa diễn biến vi khí hậu theo chu kỳ 1 giờ, 24 giờ và 7 ngày với các trục tọa độ độc lập (Nhiệt độ °C, Độ ẩm % và Quang thông Lux), kèm bảng số liệu và xuất CSV.
        </p>
      </div>

      <SensorHistoryChart initialZone="zone1" />
    </div>
  );
};
