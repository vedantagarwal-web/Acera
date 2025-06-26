'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign } from 'lucide-react';

const mockData = {
  chart: Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: Math.random() * 1000 + 5000
  })),
  holdings: [
    { symbol: 'AAPL', shares: 10, value: '$1,820.50', change: '+2.3%' },
    { symbol: 'MSFT', shares: 5, value: '$1,750.25', change: '+1.8%' },
    { symbol: 'GOOGL', shares: 3, value: '$1,230.75', change: '-0.5%' },
  ],
  totalValue: '$6,959.94',
  totalChange: '+$163.45 (2.3%)'
};

export function PortfolioPerformance() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-white/70">Total Value</div>
          <div className="text-2xl font-medium text-white">{mockData.totalValue}</div>
        </div>
        <div className="text-sm text-emerald-500">{mockData.totalChange}</div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData.chart}>
            <XAxis dataKey="time" stroke="#4B5563" />
            <YAxis stroke="#4B5563" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-medium text-white/90">Top Holdings</div>
        {mockData.holdings.map((holding, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-white/50" />
              <div>
                <div className="font-medium text-white">{holding.symbol}</div>
                <div className="text-sm text-white/70">{holding.shares} shares</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">{holding.value}</div>
              <div className={`text-sm ${holding.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                {holding.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 