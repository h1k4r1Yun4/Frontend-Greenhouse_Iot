import React, { useId } from 'react';

export interface MiniSparklineProps {
  data?: number[];
  color?: 'emerald' | 'sky' | 'amber' | 'rose' | 'indigo' | 'terracotta' | 'charcoal';
  height?: number;
  strokeWidth?: number;
  showGradient?: boolean;
  showBeacon?: boolean;
  className?: string;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  data = [],
  color = 'charcoal',
  height = 36,
  strokeWidth = 2,
  showGradient = true,
  showBeacon = true,
  className = '',
}) => {
  const gradientId = useId();

  const colorMap = {
    emerald: { stroke: '#15803D', fill: '#15803D' },
    sky: { stroke: '#0369A1', fill: '#0369A1' },
    amber: { stroke: '#B45309', fill: '#B45309' },
    terracotta: { stroke: '#C2410C', fill: '#C2410C' },
    rose: { stroke: '#BE123C', fill: '#BE123C' },
    indigo: { stroke: '#52606D', fill: '#52606D' },
    charcoal: { stroke: '#3E4C59', fill: '#3E4C59' },
  };

  const { stroke, fill } = colorMap[color] || colorMap.charcoal;

  // Honest insufficient-data fallback: never fabricate synthetic history curves
  if (!data || data.length < 2) {
    return (
      <div
        className={`relative w-full flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="w-full border-t border-dashed border-[#D8D2C5]" aria-hidden="true" />
        <span className="absolute px-2 bg-white text-[10px] text-[#616E7C] font-medium">
          Chờ dữ liệu...
        </span>
      </div>
    );
  }

  const points = data.slice(-24);

  const svgWidth = 240;
  const svgHeight = height;
  const paddingX = 6;
  const paddingY = 6;

  const minVal = Math.min(...points);
  const maxVal = Math.max(...points);
  const valRange = maxVal - minVal === 0 ? 1 : maxVal - minVal;

  const coordinates = points.map((val, idx) => {
    const x = paddingX + (idx / (points.length - 1)) * (svgWidth - paddingX * 2);
    const normalized = (val - minVal) / valRange;
    const y = svgHeight - paddingY - normalized * (svgHeight - paddingY * 2);
    return { x, y };
  });

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  };

  const linePath = buildSmoothPath(coordinates);
  const firstPt = coordinates[0];
  const lastPt = coordinates[coordinates.length - 1];
  const areaPath = `${linePath} L ${lastPt.x.toFixed(1)} ${svgHeight} L ${firstPt.x.toFixed(1)} ${svgHeight} Z`;

  const beaconLeftPct = (lastPt.x / svgWidth) * 100;
  const beaconTopPct = (lastPt.y / svgHeight) * 100;

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height }}>
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full block"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={fill} stopOpacity="0.18" />
            <stop offset="100%" stopColor={fill} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {showGradient && <path d={areaPath} fill={`url(#${gradientId})`} />}

        <path
          d={linePath}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showBeacon && lastPt && (
        <span
          aria-hidden="true"
          className="absolute w-2 h-2 rounded-full border-[1.5px] border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: `${beaconLeftPct}%`,
            top: `${beaconTopPct}%`,
            backgroundColor: stroke,
          }}
        />
      )}
    </div>
  );
};
