import React, { useState } from 'react';
import { BarChart2, ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface DataPoint {
  day: string;
  dayEn: string;
  sales: number; // in thousands (ribu IDR)
  usage: number; // in kg
}

const weeklyData: DataPoint[] = [
  { day: 'Sen', dayEn: 'Mon', sales: 4200, usage: 120 },
  { day: 'Sel', dayEn: 'Tue', sales: 3800, usage: 110 },
  { day: 'Rab', dayEn: 'Wed', sales: 5100, usage: 145 },
  { day: 'Kam', dayEn: 'Thu', sales: 4900, usage: 135 },
  { day: 'Jum', dayEn: 'Fri', sales: 7400, usage: 190 },
  { day: 'Sab', dayEn: 'Sat', sales: 9800, usage: 250 },
  { day: 'Min', dayEn: 'Sun', sales: 8900, usage: 230 },
];

export const SalesTrendChart: React.FC = () => {
  const { t, currentLanguage } = useTranslation();
  const [activeMetric, setActiveMetric] = useState<'sales' | 'usage'>('sales');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxVal = activeMetric === 'sales' ? 11000 : 300;

  // Chart coordinates
  const width = 600;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  const points = weeklyData.map((d, i) => {
    const val = activeMetric === 'sales' ? d.sales : d.usage;
    const x = paddingX + (i * (width - 2 * paddingX)) / (weeklyData.length - 1);
    const y = height - paddingY - (val / maxVal) * (height - 2 * paddingY);
    return { x, y, data: d, val };
  });

  // Construct SVG path for smooth line
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 md:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              {t.dashboard.salesTrend}
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> +18.4%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t.dashboard.salesTrendDesc}
          </p>
        </div>

        {/* Metric Selector Pills */}
        <div className="flex items-center p-1 rounded-xl bg-muted/50 border border-border/50 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric('sales')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'sales'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Penjualan (Rp)' : 'Revenue (IDR)'}
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('usage')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeMetric === 'usage'
                ? 'bg-card text-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentLanguage === 'id' ? 'Bahan (kg)' : 'Ingredients (kg)'}
          </button>
        </div>
      </div>

      {/* SVG Chart Graphic */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48 md:h-56 overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={activeMetric === 'sales' ? '#f59e0b' : '#3b82f6'}
                stopOpacity="0.3"
              />
              <stop
                offset="100%"
                stopColor={activeMetric === 'sales' ? '#f59e0b' : '#3b82f6'}
                stopOpacity="0.0"
              />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.33, 0.66, 1].map((pct, idx) => {
            const y = height - paddingY - pct * (height - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-border/40"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Stroke line */}
          <path
            d={pathD}
            fill="none"
            stroke={activeMetric === 'sales' ? '#f59e0b' : '#3b82f6'}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points & Interaction */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx}>
                {/* Invisible hover trigger */}
                <rect
                  x={p.x - 25}
                  y={0}
                  width={50}
                  height={height}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* Point circle */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="var(--background)"
                  stroke={activeMetric === 'sales' ? '#f59e0b' : '#3b82f6'}
                  strokeWidth={isHovered ? '3' : '2'}
                  className="transition-all duration-150 pointer-events-none"
                />

                {/* X axis labels */}
                <text
                  x={p.x}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-mono transition-colors pointer-events-none ${
                    isHovered
                      ? 'fill-foreground font-bold'
                      : 'fill-muted-foreground'
                  }`}
                >
                  {currentLanguage === 'id' ? p.data.day : p.data.dayEn}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border/70 bg-popover/90 backdrop-blur-md shadow-lg pointer-events-none text-xs"
          >
            <span className="font-semibold text-foreground">
              {currentLanguage === 'id'
                ? weeklyData[hoveredIdx].day
                : weeklyData[hoveredIdx].dayEn}
              :
            </span>
            <span className="font-mono font-bold text-primary">
              {activeMetric === 'sales'
                ? `Rp ${(weeklyData[hoveredIdx].sales * 1000).toLocaleString('id-ID')}`
                : `${weeklyData[hoveredIdx].usage} kg`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
