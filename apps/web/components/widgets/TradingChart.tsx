'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Settings, RefreshCw, Target } from 'lucide-react';
import { CandlestickChart } from '../charts/CandlestickChart';
import { useStockData } from '../../lib/realTimeData';

interface TradingChartProps {
  symbol?: string;
  height?: number;
}

// Generate mock OHLC data for demonstration
const generateOHLCData = (basePrice: number, days: number = 100) => {
  const data = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < days; i++) {
    const timestamp = Date.now() - (days - i) * 24 * 60 * 60 * 1000;
    
    // Generate realistic OHLC data
    const volatility = 0.02; // 2% daily volatility
    const trend = (Math.random() - 0.5) * 0.01; // Small random trend
    
    const open = currentPrice;
    const change = (Math.random() - 0.5) * volatility * currentPrice;
    const close = Math.max(open + change + (trend * currentPrice), 1);
    
    const dailyRange = Math.abs(close - open) * 2;
    const high = Math.max(open, close) + (Math.random() * dailyRange * 0.3);
    const low = Math.min(open, close) - (Math.random() * dailyRange * 0.3);
    
    const volume = Math.floor(Math.random() * 10000000) + 1000000; // 1M to 11M volume
    
    data.push({
      time: new Date(timestamp).toISOString(),
      timestamp,
      open: Math.max(open, 0.01),
      high: Math.max(high, Math.max(open, close)),
      low: Math.max(low, 0.01),
      close: Math.max(close, 0.01),
      volume
    });
    
    currentPrice = close;
  }
  
  return data;
};

export function TradingChart({ symbol = 'AAPL', height = 350 }: TradingChartProps) {
  const [ohlcData, setOhlcData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState('1D');
  const [showIndicators, setShowIndicators] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [loading, setLoading] = useState(true);
  
  const { data: stockData, loading: stockLoading } = useStockData(symbol, 30000);

  useEffect(() => {
    const fetchOHLCData = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from your OHLC API endpoint
        // For now, generate mock data based on current stock price
        const basePrice = stockData?.price || 150;
        const mockData = generateOHLCData(basePrice, getDaysForTimeRange(timeRange));
        setOhlcData(mockData);
      } catch (error) {
        console.error('Error fetching OHLC data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOHLCData();
  }, [symbol, timeRange, stockData]);

  const getDaysForTimeRange = (range: string) => {
    switch (range) {
      case '1D': return 24; // 24 hours of data
      case '5D': return 120; // 5 days * 24 hours
      case '1M': return 30;
      case '3M': return 90;
      case '1Y': return 365;
      default: return 30;
    }
  };

  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
  };

  if (loading || stockLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{symbol} Chart</span>
            <RefreshCw className="w-3 h-3 text-white/30 animate-spin" />
          </div>
        </div>
        <div className="h-80 bg-white/5 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const currentPrice = stockData?.price || ohlcData[ohlcData.length - 1]?.close || 0;
  const previousClose = ohlcData[ohlcData.length - 2]?.close || currentPrice;
  const change = currentPrice - previousClose;
  const changePercent = (change / previousClose) * 100;

  return (
    <div className="space-y-4">
      {/* Header with Stock Info */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{symbol}</span>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-white">
              ${currentPrice.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {changePercent >= 0 ? (
                <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-2.5 h-2.5 text-red-500" />
              )}
              <span className={`${changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Chart Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowIndicators(!showIndicators)}
            className={`p-1.5 rounded transition-all text-xs ${
              showIndicators ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white/80'
            }`}
          >
            MA
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`p-1.5 rounded transition-all text-xs ${
              showVolume ? 'bg-blue-500/20 text-blue-400' : 'text-white/60 hover:text-white/80'
            }`}
          >
            VOL
          </button>
          <button className="p-1.5 rounded glass text-white/60 hover:text-white/80 transition-all">
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Candlestick Chart */}
      <div className="bg-white/5 rounded-lg p-3">
        <CandlestickChart
          data={ohlcData}
          height={height}
          showVolume={showVolume}
          showMovingAverage={showIndicators}
          timeRange={timeRange as any}
          onTimeRangeChange={handleTimeRangeChange}
        />
      </div>

      {/* Trading Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-xs text-white/70 mb-1">24h High</div>
          <div className="text-sm font-medium text-emerald-400">
            ${Math.max(...ohlcData.slice(-24).map(d => d.high)).toFixed(2)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-xs text-white/70 mb-1">24h Low</div>
          <div className="text-sm font-medium text-red-400">
            ${Math.min(...ohlcData.slice(-24).map(d => d.low)).toFixed(2)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-xs text-white/70 mb-1">Volume</div>
          <div className="text-sm font-medium text-blue-400">
            {((ohlcData[ohlcData.length - 1]?.volume || 0) / 1e6).toFixed(1)}M
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/5">
          <div className="text-xs text-white/70 mb-1">Avg Volume</div>
          <div className="text-sm font-medium text-white/80">
            {(ohlcData.slice(-10).reduce((sum, d) => sum + d.volume, 0) / 10 / 1e6).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Technical Levels */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">Support</span>
          </div>
          <div className="text-white text-sm font-medium">
            ${Math.min(...ohlcData.slice(-20).map(d => d.low)).toFixed(2)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs">Resistance</span>
          </div>
          <div className="text-white text-sm font-medium">
            ${Math.max(...ohlcData.slice(-20).map(d => d.high)).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
} 