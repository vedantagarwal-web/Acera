'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

const mockData = {
  chart: Array.from({ length: 20 }, (_, i) => ({
    time: i,
    value: Math.random() * 100 + 150
  })),
  stats: [
    { label: 'Market Cap', value: '$2.4T', change: '+2.3%', isPositive: true },
    { label: 'Volume', value: '45.2M', change: '-1.2%', isPositive: false },
    { label: '52W High', value: '$198.23', change: '', isPositive: true },
    { label: '52W Low', value: '$123.45', change: '', isPositive: false },
  ]
};

export function MarketOverview() {
  return (
    <div className="space-y-4">
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
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {mockData.stats.map((stat, index) => (
          <div key={index} className="p-2 rounded-lg bg-white/5">
            <div className="text-sm text-white/70">{stat.label}</div>
            <div className="text-lg font-medium text-white">{stat.value}</div>
            {stat.change && (
              <div className="flex items-center text-sm">
                {stat.isPositive ? (
                  <>
                    <TrendingUp className="w-3 h-3 mr-1 text-emerald-500" />
                    <span className="text-emerald-500">{stat.change}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                    <span className="text-red-500">{stat.change}</span>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 