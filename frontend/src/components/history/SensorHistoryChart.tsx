import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Download,
  Sun,
  Thermometer,
  Droplets,
  Waves,
  CheckSquare,
  Square,
  BarChart2,
  Table as TableIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { getApiClient, HistoryDataPoint } from '../../services/api';
import { loadRuntimeConfig } from '../../config/runtimeConfig';
import { Button } from '../common/Button';
import { CROPS } from '../../constants/crops';

export interface SensorHistoryChartProps {
  initialZone?: string;
}

export const SensorHistoryChart: React.FC<SensorHistoryChartProps> = ({
  initialZone = 'zone1',
}) => {
  const [zoneId, setZoneId] = useState<string>(initialZone);
  const [range, setRange] = useState<'1h' | '24h' | '7d'>('24h');
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');
  const [data, setData] = useState<HistoryDataPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [visibleMetrics, setVisibleMetrics] = useState<{
    temperature: boolean;
    humidity: boolean;
    soilMoisture: boolean;
    lightIntensity: boolean;
  }>({
    temperature: true,
    humidity: true,
    soilMoisture: true,
    lightIntensity: true,
  });

  const crop = zoneId === 'zone2' ? CROPS.lettuce : CROPS.tomato;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErrorMsg(null);
    const client = getApiClient(loadRuntimeConfig());

    client
      .getHistory(zoneId, range)
      .then((res) => {
        if (mounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setErrorMsg((err as Error)?.message || 'Không thể tải dữ liệu lịch sử.');
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [zoneId, range]);

  const toggleMetric = (key: keyof typeof visibleMetrics) => {
    setVisibleMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportCsv = () => {
    if (!data.length) return;
    const headers = 'Timestamp,TimeLabel,Temperature(C),AirHumidity(%),SoilMoisture(%),Light(Lux)\n';
    const rows = data
      .map(
        (d) =>
          `"${d.timestamp}","${d.timeLabel}",${d.temperature},${d.humidity},${d.soilMoisture},${d.lightIntensity}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `greenhouse_telemetry_${zoneId}_${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => {
      URL.revokeObjectURL?.(url);
    }, 1000);
  };

  const temps = data.map((d) => d.temperature);
  const hums = data.map((d) => d.humidity);
  const soils = data.map((d) => d.soilMoisture);
  const luxs = data.map((d) => d.lightIntensity);

  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '--';
  const minTemp = temps.length ? Math.min(...temps).toFixed(1) : '--';
  const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : '--';

  const avgSoil = soils.length ? (soils.reduce((a, b) => a + b, 0) / soils.length).toFixed(1) : '--';
  const avgHum = hums.length ? (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1) : '--';
  const avgLux = luxs.length ? Math.round(luxs.reduce((a, b) => a + b, 0) / luxs.length) : '--';
  const maxLux = luxs.length ? Math.max(...luxs) : '--';

  const anyMetricVisible =
    visibleMetrics.temperature ||
    visibleMetrics.humidity ||
    visibleMetrics.soilMoisture ||
    visibleMetrics.lightIntensity;

  const formatUnit = (dataKey: string) => {
    if (dataKey === 'temperature') return '°C';
    if (dataKey === 'lightIntensity') return ' Lux';
    return '%';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3.5 rounded-[14px] border border-[#D8D2C5] shadow-popover text-xs space-y-1.5 min-w-[210px]">
          <div className="font-bold text-[#1F2933] pb-1.5 border-b border-[#EFECE4] flex items-center justify-between gap-2">
            <span className="font-mono tabular-nums">Thời điểm: {label}</span>
            <span className="text-[10px] text-[#14532D] bg-[#EAF6EE] px-2 py-0.5 rounded-full font-semibold">
              {crop.nameVi}
            </span>
          </div>
          {payload.map((entry: any) => (
            <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 font-semibold" style={{ color: entry.color }}>
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-[#1F2933] tabular-nums">
                {entry.value}
                {formatUnit(entry.dataKey)}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[18px] border border-[#E6E1D6] shadow-card p-5 sm:p-6 space-y-6">
      {/* Chart Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFECE4]">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Zone Selector */}
          <div className="flex items-center gap-1 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2]">
            <button
              type="button"
              onClick={() => setZoneId('zone1')}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${
                zoneId === 'zone1'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              Khu 1 (Cà chua)
            </button>
            <button
              type="button"
              onClick={() => setZoneId('zone2')}
              className={`px-3 py-1.5 rounded-[9px] text-xs font-semibold transition-all cursor-pointer ${
                zoneId === 'zone2'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              Khu 2 (Xà lách)
            </button>
          </div>

          {/* Time Range Selector: preserves exact text & bg-emerald-600 when active */}
          <div className="flex items-center gap-1 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2] text-xs">
            {(['1h', '24h', '7d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-[9px] font-semibold transition-all cursor-pointer ${
                  range === r
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-[#52606D] hover:text-[#1F2933]'
                }`}
              >
                {r === '1h' ? '1 Giờ' : r === '24h' ? '24 Giờ' : '7 Ngày'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#EFECE4] p-1 rounded-[12px] border border-[#E2DDD2] text-xs">
            <button
              type="button"
              onClick={() => setActiveView('chart')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] font-semibold transition-all cursor-pointer ${
                activeView === 'chart'
                  ? 'bg-white text-[#1F2933] shadow-sm'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
              <span>Biểu đồ</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] font-semibold transition-all cursor-pointer ${
                activeView === 'table'
                  ? 'bg-white text-[#1F2933] shadow-sm'
                  : 'text-[#52606D] hover:text-[#1F2933]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
              <span>Bảng số liệu</span>
            </button>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={<Download className="w-4 h-4 text-[#15803D]" />}
          onClick={handleExportCsv}
          disabled={!data.length}
        >
          Xuất dữ liệu CSV
        </Button>
      </div>

      {errorMsg && (
        <div className="bg-[#FFF1F2] border border-[#FECDD3] text-[#9F1239] text-xs rounded-[12px] p-3 font-medium">
          {errorMsg}
        </div>
      )}

      {activeView === 'chart' ? (
        <>
          {/* Metric Visibility Toggles (Color + Line Style Indicators) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#52606D] font-semibold mr-1">Hiển thị đường đo:</span>

            <button
              type="button"
              onClick={() => toggleMetric('temperature')}
              aria-pressed={visibleMetrics.temperature}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-colors cursor-pointer ${
                visibleMetrics.temperature
                  ? 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]'
                  : 'bg-[#FAF9F6] text-[#616E7C] border-[#E6E1D6]'
              }`}
            >
              {visibleMetrics.temperature ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
              ) : (
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <Thermometer className="w-3.5 h-3.5 text-[#C2410C]" aria-hidden="true" />
              <span>Nhiệt độ (°C)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleMetric('humidity')}
              aria-pressed={visibleMetrics.humidity}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-colors cursor-pointer ${
                visibleMetrics.humidity
                  ? 'bg-[#F0F9FF] text-[#075985] border-[#BAE6FD]'
                  : 'bg-[#FAF9F6] text-[#616E7C] border-[#E6E1D6]'
              }`}
            >
              {visibleMetrics.humidity ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#0369A1]" aria-hidden="true" />
              ) : (
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <Droplets className="w-3.5 h-3.5 text-[#0369A1]" aria-hidden="true" />
              <span>Độ ẩm không khí (%)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleMetric('soilMoisture')}
              aria-pressed={visibleMetrics.soilMoisture}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-colors cursor-pointer ${
                visibleMetrics.soilMoisture
                  ? 'bg-[#EAF6EE] text-[#14532D] border-[#B7E1C6]'
                  : 'bg-[#FAF9F6] text-[#616E7C] border-[#E6E1D6]'
              }`}
            >
              {visibleMetrics.soilMoisture ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
              ) : (
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <Waves className="w-3.5 h-3.5 text-[#15803D]" aria-hidden="true" />
              <span>Độ ẩm đất (%)</span>
            </button>

            <button
              type="button"
              onClick={() => toggleMetric('lightIntensity')}
              aria-pressed={visibleMetrics.lightIntensity}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] border text-xs font-semibold transition-colors cursor-pointer ${
                visibleMetrics.lightIntensity
                  ? 'bg-[#FEFCE8] text-[#854D0E] border-[#FDE047]'
                  : 'bg-[#FAF9F6] text-[#616E7C] border-[#E6E1D6]'
              }`}
            >
              {visibleMetrics.lightIntensity ? (
                <CheckSquare className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
              ) : (
                <Square className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <Sun className="w-3.5 h-3.5 text-[#B45309]" aria-hidden="true" />
              <span>Ánh sáng (Lux)</span>
            </button>
          </div>

          {/* Recharts Multi-Axis Container */}
          <div className="w-full h-80 sm:h-96" data-testid="history-chart-container">
            {loading ? (
              <div className="h-full flex items-center justify-center bg-[#FAF9F6] rounded-[14px] border border-[#ECE7DC] text-[#52606D] text-sm font-medium">
                Đang tải dữ liệu biểu đồ vi khí hậu...
              </div>
            ) : !anyMetricVisible ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 bg-[#FAF9F6] rounded-[14px] border border-[#ECE7DC] text-[#52606D] text-sm p-6 text-center">
                <p className="font-semibold text-[#1F2933]">Chưa có đường dữ liệu nào được chọn</p>
                <p className="text-xs">Hãy bật ít nhất một chỉ số ở phía trên để hiển thị biểu đồ.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EFECE4" />
                  <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: '#52606D' }} />

                  <YAxis
                    yAxisId="temp"
                    domain={[10, 45]}
                    width={46}
                    tick={{ fontSize: 11, fill: '#C2410C' }}
                    unit="°C"
                    orientation="left"
                  />

                  <YAxis
                    yAxisId="percent"
                    domain={[0, 100]}
                    width={44}
                    tick={{ fontSize: 11, fill: '#0369A1' }}
                    unit="%"
                    orientation="right"
                  />

                  {visibleMetrics.lightIntensity && (
                    <YAxis
                      yAxisId="lux"
                      domain={[0, 1200]}
                      width={60}
                      tick={{ fontSize: 10, fill: '#B45309' }}
                      unit=" Lux"
                      orientation="right"
                    />
                  )}

                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                  {visibleMetrics.temperature && (
                    <ReferenceLine
                      yAxisId="temp"
                      y={crop.optimalTemp.max}
                      label={{
                        value: `Ngưỡng max ${crop.optimalTemp.max}°C`,
                        position: 'insideTopRight',
                        fill: '#BE123C',
                        fontSize: 10,
                      }}
                      stroke="#BE123C"
                      strokeDasharray="4 4"
                    />
                  )}

                  {visibleMetrics.temperature && (
                    <Line
                      yAxisId="temp"
                      type="monotone"
                      dataKey="temperature"
                      name="Nhiệt độ (°C)"
                      stroke="#C2410C"
                      strokeWidth={2.5}
                      dot={{ r: 2 }}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  )}

                  {visibleMetrics.humidity && (
                    <Line
                      yAxisId="percent"
                      type="monotone"
                      dataKey="humidity"
                      name="Độ ẩm không khí (%)"
                      stroke="#0369A1"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {visibleMetrics.soilMoisture && (
                    <Line
                      yAxisId="percent"
                      type="monotone"
                      dataKey="soilMoisture"
                      name="Độ ẩm đất (%)"
                      stroke="#15803D"
                      strokeWidth={2.2}
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}

                  {visibleMetrics.lightIntensity && (
                    <Line
                      yAxisId="lux"
                      type="monotone"
                      dataKey="lightIntensity"
                      name="Cường độ ánh sáng (Lux)"
                      stroke="#B45309"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="2 3"
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </>
      ) : (
        /* Data Table View */
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#52606D]">
            <span className="font-semibold text-[#1F2933]">
              Bảng dữ liệu cảm biến ghi nhận theo thời gian (
              {zoneId === 'zone2' ? 'Khu 2 - Xà lách' : 'Khu 1 - Cà chua'}):
            </span>
            <span className="font-mono tabular-nums">Tổng cộng: {data.length} bản ghi</span>
          </div>

          <div className="border border-[#E6E1D6] rounded-[14px] overflow-hidden">
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#EFECE4] text-[#1F2933] font-bold uppercase tracking-wider sticky top-0 z-10 border-b border-[#D8D2C5]">
                  <tr>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Nhiệt độ (°C)</th>
                    <th className="py-3 px-4">Độ ẩm KK (%)</th>
                    <th className="py-3 px-4">Độ ẩm đất (%)</th>
                    <th className="py-3 px-4">Ánh sáng (Lux)</th>
                    <th className="py-3 px-4 text-center">Trạng thái sinh trưởng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE4] bg-white font-mono tabular-nums">
                  {data
                    .slice()
                    .reverse()
                    .map((row, idx) => {
                      const isTempGood =
                        row.temperature >= crop.optimalTemp.min &&
                        row.temperature <= crop.optimalTemp.max;
                      const isSoilGood =
                        row.soilMoisture >= crop.optimalSoilMoisture.min &&
                        row.soilMoisture <= crop.optimalSoilMoisture.max;
                      const isHumGood =
                        row.humidity >= crop.optimalHumidity.min &&
                        row.humidity <= crop.optimalHumidity.max;
                      const isAllOptimal = isTempGood && isSoilGood && isHumGood;

                      return (
                        <tr key={idx} className="hover:bg-[#FAF9F6] transition-colors">
                          <td className="py-2.5 px-4 font-semibold text-[#1F2933]">
                            {row.timeLabel}
                          </td>
                          <td
                            className={`py-2.5 px-4 font-bold ${
                              isTempGood ? 'text-[#C2410C]' : 'text-[#BE123C]'
                            }`}
                          >
                            {row.temperature}°C
                          </td>
                          <td
                            className={`py-2.5 px-4 font-bold ${
                              isHumGood ? 'text-[#0369A1]' : 'text-[#B45309]'
                            }`}
                          >
                            {row.humidity}%
                          </td>
                          <td
                            className={`py-2.5 px-4 font-bold ${
                              isSoilGood ? 'text-[#15803D]' : 'text-[#BE123C]'
                            }`}
                          >
                            {row.soilMoisture}%
                          </td>
                          <td className="py-2.5 px-4 font-bold text-[#B45309]">
                            {row.lightIntensity} Lux
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            {isAllOptimal ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-[#EAF6EE] text-[#14532D] border border-[#B7E1C6]">
                                <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                Tối ưu
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]">
                                <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                                Cần lưu ý
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-[#EFECE4] text-xs">
        <div className="bg-[#FAF9F6] p-3.5 rounded-[14px] border border-[#E6E1D6]">
          <span className="text-[#52606D] font-semibold">Nhiệt độ TB / Min / Max</span>
          <p className="text-sm sm:text-base font-bold text-[#C2410C] mt-1 font-mono tabular-nums">
            {avgTemp}°C / {minTemp}° / {maxTemp}°
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-3.5 rounded-[14px] border border-[#E6E1D6]">
          <span className="text-[#52606D] font-semibold">Độ ẩm đất TB</span>
          <p className="text-sm sm:text-base font-bold text-[#15803D] mt-1 font-mono tabular-nums">
            {avgSoil}%
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-3.5 rounded-[14px] border border-[#E6E1D6]">
          <span className="text-[#52606D] font-semibold">Độ ẩm không khí TB</span>
          <p className="text-sm sm:text-base font-bold text-[#0369A1] mt-1 font-mono tabular-nums">
            {avgHum}%
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-3.5 rounded-[14px] border border-[#E6E1D6]">
          <span className="text-[#52606D] font-semibold">Ánh sáng TB / Đỉnh</span>
          <p className="text-sm sm:text-base font-bold text-[#B45309] mt-1 font-mono tabular-nums">
            {avgLux} / {maxLux} Lux
          </p>
        </div>

        <div className="bg-[#FAF9F6] p-3.5 rounded-[14px] border border-[#E6E1D6] col-span-2 sm:col-span-1">
          <span className="text-[#52606D] font-semibold">Cây trồng mục tiêu</span>
          <p className="text-sm sm:text-base font-bold text-[#1F2933] mt-1 truncate">
            {crop.nameVi}
          </p>
        </div>
      </div>
    </div>
  );
};
