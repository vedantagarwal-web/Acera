'use client';

import { TrendingUp, TrendingDown, DollarSign, RefreshCw, PieChart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface PortfolioData {
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  positions: Array<{
    symbol: string;
    shares: number;
    currentPrice: number;
    dayChange: number;
    dayChangePercent: number;
    totalValue: number;
    weight: number;
  }>;
  chart: Array<{ time: string; value: number }>;
}

const generateMockPortfolioData = (): PortfolioData => {
  const positions = [
    { symbol: 'AAPL', shares: 50, currentPrice: 182.89 },
    { symbol: 'MSFT', shares: 25, currentPrice: 337.20 },
    { symbol: 'GOOGL', shares: 30, currentPrice: 131.86 },
    { symbol: 'NVDA', shares: 15, currentPrice: 421.01 },
    { symbol: 'AMZN', shares: 20, currentPrice: 127.12 }
  ].map(pos => {
    const dayChange = (Math.random() - 0.5) * 10;
    const dayChangePercent = (Math.random() - 0.5) * 5;
    const totalValue = pos.shares * pos.currentPrice;
    return {
      ...pos,
      dayChange: dayChange,
      dayChangePercent: dayChangePercent,
      totalValue,
      weight: 0 // Will be calculated below
    };
  });

  const totalValue = positions.reduce((sum, pos) => sum + pos.totalValue, 0);
  
  // Calculate weights
  positions.forEach(pos => {
    pos.weight = (pos.totalValue / totalValue) * 100;
  });

  const totalDayChange = positions.reduce((sum, pos) => sum + pos.dayChange * pos.shares, 0);
  const dayChangePercent = (totalDayChange / totalValue) * 100;

  const chart = Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 3600000).toISOString(),
    value: totalValue * (1 + (Math.random() - 0.5) * 0.02) // ±2% variation
  }));

  return {
    totalValue,
    dayChange: totalDayChange,
    dayChangePercent,
    positions,
    chart
  };
};

export function PortfolioPerformance() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      // In a real app, this would fetch from your portfolio API
      const data = generateMockPortfolioData();
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  const formatChange = (change: number, isPercent: boolean = false) => {
    const formatted = isPercent ? `${change.toFixed(2)}%` : formatCurrency(Math.abs(change));
    return change >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  if (loading && !portfolio) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <DollarSign className="w-3 h-3" />
          <span className="text-xs">Portfolio Performance</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-3">
          <div className="h-20 bg-white/5 rounded-lg animate-pulse"></div>
          <div className="h-32 bg-white/5 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!portfolio) return null;

  const chartData = portfolio.chart.map((point, index) => ({
    time: index,
    value: point.value,
    timestamp: point.time
  }));

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <DollarSign className="w-3 h-3" />
          <span className="text-xs">Portfolio Performance</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <div className="flex items-center gap-1">
          <PieChart className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-xs text-white/30">Live</span>
        </div>
      </div>

      {/* Total Value & Performance */}
      <div className="p-3 rounded-lg bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-lg font-bold text-white">
              {formatCurrency(portfolio.totalValue)}
            </div>
            <div className="text-xs text-white/50">Total Value</div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              {portfolio.dayChangePercent >= 0 ? (
                <TrendingUp className="w-3 h-3 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  portfolio.dayChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}
              >
                {formatChange(portfolio.dayChangePercent, true)}
              </span>
            </div>
            <div
              className={`text-xs ${
                portfolio.dayChange >= 0 ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {formatChange(portfolio.dayChange)}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="h-24 relative">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="time" 
              stroke="#4B5563" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              hide
            />
            <YAxis 
              stroke="#4B5563" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              hide
              domain={['dataMin - 1000', 'dataMax + 1000']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'white',
                fontSize: '10px'
              }}
              labelFormatter={(value, payload) => {
                if (payload && payload[0] && payload[0].payload) {
                  const timestamp = payload[0].payload.timestamp;
                  return new Date(timestamp).toLocaleTimeString();
                }
                return '';
              }}
              formatter={(value: any) => [formatCurrency(value), 'Portfolio Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={portfolio.dayChangePercent >= 0 ? "#10B981" : "#EF4444"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 2, stroke: portfolio.dayChangePercent >= 0 ? "#10B981" : "#EF4444", strokeWidth: 1 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Holdings */}
      <div className="space-y-1.5">
        <div className="text-xs text-white/70 mb-2">Top Holdings</div>
        {portfolio.positions.slice(0, 4).map((position, index) => (
          <div
            key={position.symbol}
            onClick={() => router.push(`/stocks/${position.symbol}`)}
            className="flex items-center justify-between p-2 rounded bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-2">
              <span className="text-white text-xs font-medium w-10 group-hover:text-blue-400 transition-colors">{position.symbol}</span>
              <div className="text-xs text-white/50">
                {position.shares} shares • {position.weight.toFixed(1)}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white">{formatCurrency(position.totalValue)}</div>
              <div className="flex items-center gap-1">
                {position.dayChangePercent >= 0 ? (
                  <TrendingUp className="w-2 h-2 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-2 h-2 text-red-500" />
                )}
                <span
                  className={`text-xs ${
                    position.dayChangePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {formatChange(position.dayChangePercent, true)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>Live Portfolio</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 