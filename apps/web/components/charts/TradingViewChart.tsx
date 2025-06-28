'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Chart, 
  ChartConfiguration, 
  CategoryScale, 
  LinearScale, 
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3, 
  CandlestickChart,
  Settings,
  Maximize2,
  Volume2
} from 'lucide-react';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController
);

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TradingViewChartProps {
  symbol: string;
  data: ChartData[];
  interval?: string;
  height?: number;
  showVolume?: boolean;
  showTechnicals?: boolean;
  className?: string;
}

export function TradingViewChart({ 
  symbol, 
  data, 
  interval = '1D',
  height = 400,
  showVolume = true,
  showTechnicals = false,
  className = '' 
}: TradingViewChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const volumeChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const volumeChartInstance = useRef<Chart | null>(null);
  
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'bar'>('line');
  const [timeframe, setTimeframe] = useState(interval);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Process data for charts
  const processedData = data.map(item => ({
    x: new Date(item.time).getTime(),
    y: item.close,
    open: item.open,
    high: item.high,
    low: item.low,
    close: item.close,
    volume: item.volume
  }));

  // Calculate technical indicators
  const calculateSMA = (data: number[], period: number) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const priceData = processedData.map(d => d.y);
  const sma20 = calculateSMA(priceData, 20);
  const sma50 = calculateSMA(priceData, 50);

  useEffect(() => {
    if (!chartRef.current || !data.length) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create price chart
    const config: ChartConfiguration = {
      type: chartType === 'candlestick' ? 'bar' : 'line',
      data: {
        datasets: [
          {
            label: `${symbol} Price`,
            data: processedData.map(d => ({ x: d.x, y: d.y })),
            borderColor: '#3b82f6',
            backgroundColor: chartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : '#3b82f6',
            borderWidth: 2,
            fill: chartType === 'line',
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4
          },
          ...(showTechnicals ? [
            {
              label: 'SMA 20',
              data: sma20.map((value, index) => ({ 
                x: processedData[index + 19]?.x || 0, 
                y: value 
              })),
              borderColor: '#f59e0b',
              backgroundColor: 'transparent',
              borderWidth: 1,
              fill: false,
              pointRadius: 0
            },
            {
              label: 'SMA 50',
              data: sma50.map((value, index) => ({ 
                x: processedData[index + 49]?.x || 0, 
                y: value 
              })),
              borderColor: '#ef4444',
              backgroundColor: 'transparent',
              borderWidth: 1,
              fill: false,
              pointRadius: 0
            }
          ] : [])
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        backgroundColor: 'transparent',
        scales: {
          x: {
            type: 'time',
            time: {
              displayFormats: {
                hour: 'HH:mm',
                day: 'MMM dd',
                week: 'MMM dd',
                month: 'MMM yyyy'
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              maxTicksLimit: 8
            }
          },
          y: {
            position: 'right',
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            ticks: {
              color: '#9ca3af',
              callback: function(value) {
                return '$' + Number(value).toFixed(2);
              }
            }
          }
        },
        plugins: {
          legend: {
            display: showTechnicals,
            position: 'top',
            labels: {
              color: '#9ca3af',
              usePointStyle: true,
              pointStyle: 'line'
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const dataPoint = processedData[context.dataIndex];
                if (chartType === 'candlestick' && dataPoint) {
                  return [
                    `Open: $${dataPoint.open.toFixed(2)}`,
                    `High: $${dataPoint.high.toFixed(2)}`,
                    `Low: $${dataPoint.low.toFixed(2)}`,
                    `Close: $${dataPoint.close.toFixed(2)}`,
                    `Volume: ${(dataPoint.volume / 1000000).toFixed(1)}M`
                  ];
                }
                return `${context.dataset.label}: $${Number(context.parsed.y).toFixed(2)}`;
              }
            }
          }
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        onHover: (event, activeElements) => {
          if (chartRef.current) {
            chartRef.current.style.cursor = activeElements.length > 0 ? 'pointer' : 'default';
          }
        }
      }
    };

    chartInstance.current = new Chart(ctx, config);

    // Create volume chart if enabled
    if (showVolume && volumeChartRef.current) {
      if (volumeChartInstance.current) {
        volumeChartInstance.current.destroy();
      }

      const volumeCtx = volumeChartRef.current.getContext('2d');
      if (volumeCtx) {
        const volumeConfig: ChartConfiguration = {
          type: 'bar',
          data: {
            datasets: [{
              label: 'Volume',
              data: processedData.map(d => ({ x: d.x, y: d.volume })),
              backgroundColor: processedData.map(d => 
                d.close >= d.open ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
              ),
              borderColor: processedData.map(d => 
                d.close >= d.open ? '#22c55e' : '#ef4444'
              ),
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            backgroundColor: 'transparent',
            scales: {
              x: {
                type: 'time',
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                  drawBorder: false
                },
                ticks: {
                  color: '#9ca3af',
                  display: false
                }
              },
              y: {
                position: 'right',
                grid: {
                  color: 'rgba(255, 255, 255, 0.1)',
                  drawBorder: false
                },
                ticks: {
                  color: '#9ca3af',
                  callback: function(value) {
                    return (Number(value) / 1000000).toFixed(1) + 'M';
                  }
                }
              }
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#ffffff',
                bodyColor: '#ffffff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    return `Volume: ${(Number(context.parsed.y) / 1000000).toFixed(1)}M`;
                  }
                }
              }
            }
          }
        };

        volumeChartInstance.current = new Chart(volumeCtx, volumeConfig);
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (volumeChartInstance.current) {
        volumeChartInstance.current.destroy();
      }
    };
  }, [data, chartType, showTechnicals, showVolume, symbol]);

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
              <CandlestickChart className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded transition-colors ${
                chartType === 'bar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
              title="Bar Chart"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>

          {/* Controls */}
          <button
            onClick={() => setShowTechnicals(!showTechnicals)}
            className={`p-2 rounded transition-colors ${
              showTechnicals ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Technical Indicators"
          >
            <Activity className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-2 rounded transition-colors ${
              showVolume ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
            title="Show Volume"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Chart Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: showVolume ? height + 100 : height }}>
        {/* Price Chart */}
        <div style={{ height: showVolume ? height * 0.7 : height }}>
          <canvas ref={chartRef} />
        </div>

        {/* Volume Chart */}
        {showVolume && (
          <div style={{ height: height * 0.3 }} className="border-t border-white/10">
            <canvas ref={volumeChartRef} />
          </div>
        )}

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

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg p-4 z-50 min-w-64">
          <h4 className="text-white font-medium mb-3">Chart Settings</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Chart Type</label>
              <select 
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm"
              >
                <option value="line">Line Chart</option>
                <option value="candlestick">Candlestick</option>
                <option value="bar">Bar Chart</option>
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showTechnicals}
                  onChange={(e) => setShowTechnicals(e.target.checked)}
                  className="rounded border-gray-600"
                />
                Technical Indicators
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={showVolume}
                  onChange={(e) => setShowVolume(e.target.checked)}
                  className="rounded border-gray-600"
                />
                Show Volume
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 