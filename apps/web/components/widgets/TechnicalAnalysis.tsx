'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { formatINR } from '@/lib/store';
import { useIsClient } from '@/hooks/useIsClient';

interface TechnicalIndicator {
  name: string;
  value: number;
  signal: 'BUY' | 'SELL' | 'HOLD';
  change: number;
}

interface TechnicalData {
  symbol: string;
  price: number;
  indicators: TechnicalIndicator[];
  support: number;
  resistance: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
}

const stockOptions = [
  { symbol: 'RELIANCE', name: 'Reliance Industries' },
  { symbol: 'TCS', name: 'Tata Consultancy Services' },
  { symbol: 'INFY', name: 'Infosys Limited' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Limited' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Limited' }
];

// Pre-computed static technical data to prevent expensive calculations
const STATIC_TECHNICAL_DATA: Record<string, TechnicalData> = {
  'RELIANCE': {
    symbol: 'RELIANCE',
    price: 2456.75,
    indicators: [
      { name: 'RSI (14)', value: 58.2, signal: 'HOLD', change: 2.1 },
      { name: 'MACD', value: 12.45, signal: 'BUY', change: 1.8 },
      { name: 'SMA (20)', value: 2398.45, signal: 'BUY', change: 0.5 },
      { name: 'Bollinger Band', value: 0.82, signal: 'HOLD', change: -0.1 }
    ],
    support: 2341.20,
    resistance: 2518.90,
    recommendation: 'BUY'
  },
  'TCS': {
    symbol: 'TCS',
    price: 3542.65,
    indicators: [
      { name: 'RSI (14)', value: 42.8, signal: 'BUY', change: -1.5 },
      { name: 'MACD', value: -8.23, signal: 'SELL', change: -2.1 },
      { name: 'SMA (20)', value: 3598.12, signal: 'SELL', change: -0.8 },
      { name: 'Bollinger Band', value: 0.35, signal: 'BUY', change: 0.15 }
    ],
    support: 3456.80,
    resistance: 3642.30,
    recommendation: 'HOLD'
  },
  'INFY': {
    symbol: 'INFY',
    price: 1456.30,
    indicators: [
      { name: 'RSI (14)', value: 67.5, signal: 'SELL', change: 3.2 },
      { name: 'MACD', value: 15.67, signal: 'BUY', change: 2.8 },
      { name: 'SMA (20)', value: 1432.18, signal: 'BUY', change: 1.2 },
      { name: 'Bollinger Band', value: 0.78, signal: 'HOLD', change: -0.05 }
    ],
    support: 1398.45,
    resistance: 1521.80,
    recommendation: 'BUY'
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    price: 1623.45,
    indicators: [
      { name: 'RSI (14)', value: 51.3, signal: 'HOLD', change: 1.1 },
      { name: 'MACD', value: 5.89, signal: 'BUY', change: 0.9 },
      { name: 'SMA (20)', value: 1608.92, signal: 'BUY', change: 0.3 },
      { name: 'Bollinger Band', value: 0.62, signal: 'HOLD', change: 0.08 }
    ],
    support: 1587.20,
    resistance: 1678.30,
    recommendation: 'BUY'
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    price: 1145.80,
    indicators: [
      { name: 'RSI (14)', value: 38.9, signal: 'BUY', change: -2.3 },
      { name: 'MACD', value: -3.45, signal: 'SELL', change: -1.2 },
      { name: 'SMA (20)', value: 1167.34, signal: 'SELL', change: -0.6 },
      { name: 'Bollinger Band', value: 0.28, signal: 'BUY', change: 0.12 }
    ],
    support: 1098.50,
    resistance: 1189.60,
    recommendation: 'HOLD'
  }
};

export const TechnicalAnalysis = memo(function TechnicalAnalysisComponent() {
  const isClient = useIsClient();
  const [selectedStock, setSelectedStock] = useState('RELIANCE');
  const [data, setData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(true);

  // Memoize the data retrieval to prevent unnecessary computations
  const currentData = useMemo(() => {
    return STATIC_TECHNICAL_DATA[selectedStock];
  }, [selectedStock]);

  useEffect(() => {
    setLoading(true);
    // Fast loading with pre-computed data
    const timer = setTimeout(() => {
      setData(currentData);
      setLoading(false);
    }, 200); // Reduced timeout for better performance

    return () => clearTimeout(timer);
  }, [currentData]);

  if (!isClient) {
    return <div className="h-full w-full animate-pulse bg-white/5 rounded-lg" />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Stock Selector */}
      <div className="space-y-3">
        <select
          id="technical-stock-select"
          name="selectedStock"
          value={selectedStock}
          onChange={(e) => setSelectedStock(e.target.value)}
          className="w-full p-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
        >
          {stockOptions.map(stock => (
            <option key={stock.symbol} value={stock.symbol} className="bg-slate-900">
              {stock.symbol}
            </option>
          ))}
        </select>

        <div className="text-center">
          <div className="text-lg font-bold text-white">{formatINR(data.price)}</div>
          <div className="text-xs text-white/60">{data.symbol}</div>
        </div>
      </div>

      {/* Overall Recommendation */}
      <div className={`p-3 rounded-lg text-center ${
        data.recommendation === 'BUY' ? 'bg-emerald-500/20 border border-emerald-500/30' :
        data.recommendation === 'SELL' ? 'bg-red-500/20 border border-red-500/30' :
        'bg-orange-500/20 border border-orange-500/30'
      }`}>
        <div className="flex items-center justify-center gap-2 mb-1">
          {data.recommendation === 'BUY' ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : data.recommendation === 'SELL' ? (
            <TrendingDown className="w-4 h-4 text-red-400" />
          ) : (
            <Activity className="w-4 h-4 text-orange-400" />
          )}
          <span className={`font-medium ${
            data.recommendation === 'BUY' ? 'text-emerald-400' :
            data.recommendation === 'SELL' ? 'text-red-400' :
            'text-orange-400'
          }`}>
            {data.recommendation}
          </span>
        </div>
        <div className="text-xs text-white/70">Overall Signal</div>
      </div>

      {/* Technical Indicators */}
      <div className="space-y-2">
        <h4 className="text-white/80 text-sm font-medium">Technical Indicators</h4>
        <div className="space-y-2">
          {data.indicators.map((indicator, index) => (
            <div key={index} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">{indicator.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  indicator.signal === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                  indicator.signal === 'SELL' ? 'bg-red-500/20 text-red-400' :
                  'bg-orange-500/20 text-orange-400'
                }`}>
                  {indicator.signal}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/80">
                  {indicator.name === 'SMA (20)' ? formatINR(indicator.value) : indicator.value.toFixed(2)}
                </span>
                <span className={`${indicator.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support & Resistance */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs">Support</span>
          </div>
          <div className="text-white text-sm font-medium">{formatINR(data.support)}</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">Resistance</span>
          </div>
          <div className="text-white text-sm font-medium">{formatINR(data.resistance)}</div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          View detailed analysis →
        </button>
      </div>
    </div>
  );
}); 