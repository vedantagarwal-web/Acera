'use client';

import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Bar,
  Line,
  ReferenceLine,
  Brush,
  BarChart
} from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, LineChart, ZoomIn, ZoomOut } from 'lucide-react';

interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CandlestickChartProps {
  data: CandleData[];
  height?: number;
  showVolume?: boolean;
  showMovingAverage?: boolean;
  timeRange?: '1D' | '5D' | '1M' | '3M' | '1Y';
  onTimeRangeChange?: (range: string) => void;
}

// Custom Candlestick component for Recharts
const CandlestickBar = (props: any) => {
  const { payload, x, y, width, height } = props;
  if (!payload) return null;

  const { open, close, high, low } = payload;
  const isRising = close >= open;
  
  const candleWidth = Math.max(width * 0.6, 2);
  const centerX = x + width / 2;
  
  // Calculate positions
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  const bodyHeight = Math.abs(close - open);
  
  // Scale values relative to the chart
  const scaleY = (value: number) => {
    const range = payload.high - payload.low;
    const offset = (payload.high - value) / range;
    return y + offset * height;
  };

  const highY = scaleY(high);
  const lowY = scaleY(low);
  const bodyTopY = scaleY(bodyTop);
  const bodyBottomY = scaleY(bodyBottom);

  return (
    <g>
      {/* Wick line */}
      <line
        x1={centerX}
        y1={highY}
        x2={centerX}
        y2={lowY}
        stroke={isRising ? '#10B981' : '#EF4444'}
        strokeWidth={1}
      />
      {/* Candle body */}
      <rect
        x={centerX - candleWidth / 2}
        y={bodyTopY}
        width={candleWidth}
        height={Math.max(bodyBottomY - bodyTopY, 1)}
        fill={isRising ? '#10B981' : '#EF4444'}
        fillOpacity={isRising ? 0.8 : 1}
        stroke={isRising ? '#10B981' : '#EF4444'}
        strokeWidth={1}
      />
    </g>
  );
};

export function CandlestickChart({ 
  data, 
  height = 400, 
  showVolume = true, 
  showMovingAverage = true,
  timeRange = '1D',
  onTimeRangeChange 
}: CandlestickChartProps) {
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [zoomLevel, setZoomLevel] = useState(1);

  // Calculate moving averages
  const chartData = useMemo(() => {
    return data.map((item, index) => {
      let sma20 = null;
      let sma50 = null;
      
      if (showMovingAverage && index >= 19) {
        const last20 = data.slice(index - 19, index + 1);
        sma20 = last20.reduce((sum, d) => sum + d.close, 0) / 20;
      }
      
      if (showMovingAverage && index >= 49) {
        const last50 = data.slice(index - 49, index + 1);
        sma50 = last50.reduce((sum, d) => sum + d.close, 0) / 50;
      }

      return {
        ...item,
        sma20,
        sma50,
        // For candlestick rendering
        wickLow: item.low,
        wickHigh: item.high,
        body: item.close >= item.open ? item.close - item.open : item.open - item.close,
        isRising: item.close >= item.open,
        displayTime: new Date(item.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
      };
    });
  }, [data, showMovingAverage]);

  const timeRanges = ['1D', '5D', '1M', '3M', '1Y'];

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatVolume = (value: number) => {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    
    return (
      <div className="bg-black/90 backdrop-blur-md border border-white/20 rounded-lg p-3 shadow-xl">
        <div className="text-white/70 text-xs mb-2">{data.displayTime}</div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="text-white/70 text-xs">Open:</span>
            <span className="text-white text-xs font-medium">{formatPrice(data.open)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/70 text-xs">High:</span>
            <span className="text-emerald-400 text-xs font-medium">{formatPrice(data.high)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/70 text-xs">Low:</span>
            <span className="text-red-400 text-xs font-medium">{formatPrice(data.low)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-white/70 text-xs">Close:</span>
            <span className={`text-xs font-medium ${data.isRising ? 'text-emerald-400' : 'text-red-400'}`}>
              {formatPrice(data.close)}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-white/10 pt-1">
            <span className="text-white/70 text-xs">Volume:</span>
            <span className="text-blue-400 text-xs font-medium">{formatVolume(data.volume)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Chart Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange?.(range)}
                className={`px-2 py-1 text-xs rounded transition-all ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/5">
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-1.5 rounded transition-all ${
                chartType === 'candlestick'
                  ? 'bg-blue-500 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-1.5 rounded transition-all ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <LineChart className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 3))}
            className="p-1.5 rounded glass text-white/60 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoomLevel(prev => Math.max(prev / 1.2, 0.5))}
            className="p-1.5 rounded glass text-white/60 hover:text-white/80 hover:bg-white/10 transition-all"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Chart */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={chartData}>
            <XAxis
              dataKey="displayTime"
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={Math.floor(chartData.length / 8)}
            />
            <YAxis
              stroke="#6B7280"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 1', 'dataMax + 1']}
              width={50}
              tickFormatter={formatPrice}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {chartType === 'candlestick' ? (
              <Bar
                dataKey="close"
                shape={<CandlestickBar />}
                isAnimationActive={false}
              />
            ) : (
              <Line
                type="monotone"
                dataKey="close"
                stroke="#6366F1"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 3, stroke: '#6366F1', strokeWidth: 2 }}
              />
            )}

            {/* Moving Averages */}
            {showMovingAverage && (
              <>
                <Line
                  type="monotone"
                  dataKey="sma20"
                  stroke="#F59E0B"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="2 2"
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="sma50"
                  stroke="#8B5CF6"
                  strokeWidth={1}
                  dot={false}
                  strokeDasharray="4 4"
                  connectNulls={false}
                />
              </>
            )}

            <Brush
              dataKey="displayTime"
              height={20}
              stroke="#6366F1"
              fill="rgba(99, 102, 241, 0.1)"
              y={height - 25}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Chart Legend */}
        {showMovingAverage && (
          <div className="absolute top-2 right-2 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-0.5 bg-amber-500 opacity-60"></div>
              <span className="text-white/60">SMA 20</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-0.5 bg-purple-500 opacity-60" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-white/60">SMA 50</span>
            </div>
          </div>
        )}
      </div>

      {/* Volume Chart */}
      {showVolume && (
        <div className="h-20">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="displayTime" hide />
              <YAxis hide />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [formatVolume(value), 'Volume']}
              />
              <Bar
                dataKey="volume"
                fill="#6366F1"
                fillOpacity={0.6}
                radius={[1, 1, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
} 