'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useMarketData } from '../../lib/realTimeData';

export function MarketOverview() {
  const { data, loading, error, refetch } = useMarketData(30000); // Refresh every 30 seconds

  if (loading && !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-[180px] bg-white/5 rounded-lg"></div>
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5">
              <div className="h-4 bg-white/10 rounded mb-2"></div>
              <div className="h-6 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <p className="text-red-400 text-sm mb-2">Failed to load market data</p>
          <button
            onClick={refetch}
            className="text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-1 mx-auto"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const formatValue = (value: number, prefix: string = '', suffix: string = '') => {
    if (value >= 1e12) return `${prefix}${(value / 1e12).toFixed(1)}T${suffix}`;
    if (value >= 1e9) return `${prefix}${(value / 1e9).toFixed(1)}B${suffix}`;
    if (value >= 1e6) return `${prefix}${(value / 1e6).toFixed(1)}M${suffix}`;
    if (value >= 1e3) return `${prefix}${(value / 1e3).toFixed(1)}K${suffix}`;
    return `${prefix}${value.toFixed(2)}${suffix}`;
  };

  const formatChange = (change: number, isPercent: boolean = false) => {
    const formatted = isPercent ? `${change.toFixed(2)}%` : change.toFixed(2);
    return change >= 0 ? `+${formatted}` : formatted;
  };

  const stats = [
    { 
      label: 'Market Cap', 
      value: formatValue(data.marketCap, '$'), 
      change: formatChange(data.indices.sp500.changePercent, true), 
      isPositive: data.indices.sp500.changePercent >= 0 
    },
    { 
      label: 'Volume', 
      value: formatValue(data.volume), 
      change: formatChange(-1.2, true), // Mock volume change
      isPositive: false 
    },
    { 
      label: 'S&P 500', 
      value: data.indices.sp500.value.toFixed(2), 
      change: formatChange(data.indices.sp500.changePercent, true), 
      isPositive: data.indices.sp500.changePercent >= 0 
    },
    { 
      label: 'VIX', 
      value: data.indices.vix.value.toFixed(2), 
      change: formatChange(data.indices.vix.changePercent, true), 
      isPositive: data.indices.vix.changePercent <= 0 // VIX is inverse
    },
  ];

  // Format chart data for display
  const chartData = data.chart.map((point, index) => ({
    time: index,
    value: point.value,
    timestamp: point.time
  }));

  return (
    <div className="space-y-3">
      {/* Real-time Chart */}
      <div className="h-[160px] relative">
        {loading && (
          <div className="absolute top-2 right-2 z-10">
            <RefreshCw className="w-3 h-3 text-white/30 animate-spin" />
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              stroke="#4B5563" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#4B5563" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '12px'
              }}
              labelFormatter={(value, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  const timestamp = payload[0].payload.timestamp;
                  return new Date(timestamp).toLocaleTimeString();
                }
                return '';
              }}
              formatter={(value: any) => [value.toFixed(2), 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3, stroke: '#6366F1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {stats.map((stat, index) => (
          <div key={index} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="text-xs text-white/70 mb-1">{stat.label}</div>
            <div className="text-sm font-medium text-white truncate">{stat.value}</div>
            {stat.change && (
              <div className="flex items-center text-xs mt-1">
                {stat.isPositive ? (
                  <>
                    <TrendingUp className="w-2.5 h-2.5 mr-1 text-emerald-500" />
                    <span className="text-emerald-500">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-2.5 h-2.5 mr-1 text-red-500" />
                    <span className="text-red-500">{stat.change}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Last Updated Indicator */}
      <div className="flex justify-between items-center text-xs text-white/30">
        <span>Live Data</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 