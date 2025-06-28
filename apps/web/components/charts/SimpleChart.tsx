'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Settings,
  Maximize2,
  Volume2
} from 'lucide-react';

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface SimpleChartProps {
  symbol: string;
  data: ChartData[];
  interval?: string;
  height?: number;
  showVolume?: boolean;
  showTechnicals?: boolean;
  className?: string;
}

export function SimpleChart({ 
  symbol, 
  data, 
  interval = '1D',
  height = 400,
  showVolume = true,
  showTechnicals = false,
  className = '' 
}: SimpleChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState(interval);
  const [currentShowVolume, setShowVolume] = useState(showVolume);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw chart background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Calculate price range
    const prices = data.map(d => d.close);
    const volumes = data.map(d => d.volume);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const maxVolume = Math.max(...volumes);
    
    const priceRange = maxPrice - minPrice;
    const padding = 40;
    const chartWidth = rect.width - padding * 2;
    const chartHeight = (currentShowVolume ? rect.height * 0.7 : rect.height) - padding * 2;
    const volumeHeight = currentShowVolume ? rect.height * 0.25 : 0;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();
      
      // Price labels
      const price = maxPrice - (priceRange / 5) * i;
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(2)}`, padding - 5, y + 4);
    }

    // Vertical grid lines
    const timePoints = Math.min(6, data.length);
    for (let i = 0; i <= timePoints; i++) {
      const x = padding + (chartWidth / timePoints) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, padding + chartHeight);
      ctx.stroke();
      
      // Time labels
      if (i < data.length) {
        const dataIndex = Math.floor((data.length - 1) * (i / timePoints));
        const time = new Date(data[dataIndex].time);
        ctx.fillStyle = '#9ca3af';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
          x, 
          padding + chartHeight + 15
        );
      }
    }

    // Draw price line
    if (chartType === 'line') {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const y = padding + chartHeight - ((point.close - minPrice) / priceRange) * chartHeight;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();

      // Fill area under curve
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#3b82f6';
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Draw candlesticks
    if (chartType === 'candlestick') {
      const candleWidth = chartWidth / data.length * 0.6;
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const openY = padding + chartHeight - ((point.open - minPrice) / priceRange) * chartHeight;
        const closeY = padding + chartHeight - ((point.close - minPrice) / priceRange) * chartHeight;
        const highY = padding + chartHeight - ((point.high - minPrice) / priceRange) * chartHeight;
        const lowY = padding + chartHeight - ((point.low - minPrice) / priceRange) * chartHeight;
        
        const isGreen = point.close >= point.open;
        ctx.strokeStyle = isGreen ? '#22c55e' : '#ef4444';
        ctx.fillStyle = isGreen ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 1;
        
        // Draw high-low line
        ctx.beginPath();
        ctx.moveTo(x, highY);
        ctx.lineTo(x, lowY);
        ctx.stroke();
        
        // Draw body
        const bodyHeight = Math.abs(closeY - openY);
        const bodyY = Math.min(openY, closeY);
        
        if (isGreen) {
          ctx.fillRect(x - candleWidth/2, bodyY, candleWidth, Math.max(bodyHeight, 1));
        } else {
          ctx.strokeRect(x - candleWidth/2, bodyY, candleWidth, Math.max(bodyHeight, 1));
        }
      });
    }

    // Draw volume bars
    if (currentShowVolume) {
      const volumeY = padding + chartHeight + 30;
      const barWidth = chartWidth / data.length * 0.8;
      
      data.forEach((point, index) => {
        const x = padding + (chartWidth / (data.length - 1)) * index;
        const barHeight = (point.volume / maxVolume) * volumeHeight;
        const isGreen = point.close >= point.open;
        
        ctx.fillStyle = isGreen ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
        ctx.fillRect(x - barWidth/2, volumeY + volumeHeight - barHeight, barWidth, barHeight);
      });

      // Volume label
      ctx.fillStyle = '#9ca3af';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Volume', padding, volumeY - 5);
    }

    // Draw current price indicator
    if (data.length > 0) {
      const lastPrice = data[data.length - 1].close;
      const lastY = padding + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight;
      
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, lastY);
      ctx.lineTo(padding + chartWidth, lastY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(padding + chartWidth + 5, lastY - 10, 60, 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`$${lastPrice.toFixed(2)}`, padding + chartWidth + 35, lastY + 3);
    }

  }, [data, chartType, currentShowVolume, showTechnicals]);

  const timeframes = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W', '1M'];

  const currentPrice = data[data.length - 1]?.close || 0;
  const previousPrice = data[data.length - 2]?.close || currentPrice;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = (priceChange / previousPrice) * 100;

  return (
    <div className={`relative ${className}`}>
      {/* Chart Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-white">{symbol}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              ${currentPrice.toFixed(2)}
            </span>
            <div className={`flex items-center gap-1 ${priceChange >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span className="text-sm">
                {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Timeframe Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded transition-colors ${
                chartType === 'line' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Line Chart"
            >
              <Activity className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-2 rounded transition-colors ${
                chartType === 'candlestick' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Candlestick Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <button
            onClick={() => setShowVolume(!currentShowVolume)}
            className={`p-2 rounded transition-colors ${
              currentShowVolume ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Show Volume"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: currentShowVolume ? height + 100 : height }}>
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ height: currentShowVolume ? height + 100 : height }}
        />

        {/* Loading State */}
        {!data.length && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading chart data...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 