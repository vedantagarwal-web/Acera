'use client';

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Gauge } from 'lucide-react';

const mockData = {
  sentiment: 65, // 0-100 scale
  indicators: [
    { name: 'Social Media', value: 75, color: '#10B981' },
    { name: 'News Articles', value: 60, color: '#6366F1' },
    { name: 'Trading Volume', value: 85, color: '#8B5CF6' },
    { name: 'Technical', value: 45, color: '#EC4899' },
    { name: 'Options Flow', value: 70, color: '#F59E0B' },
  ],
  summary: 'Moderately Bullish'
};

export function SentimentAnalysis() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Gauge className="w-4 h-4" />
          <span className="text-sm">Market Sentiment</span>
        </div>
        <div className="text-sm font-medium text-white">
          {mockData.summary}
        </div>
      </div>

      {/* Main Sentiment Gauge */}
      <div className="flex items-center justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#1F2937"
              strokeWidth="10"
            />
            {/* Sentiment indicator */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#6366F1"
              strokeWidth="10"
              strokeDasharray={`${mockData.sentiment * 2.83} 283`}
              transform="rotate(-90 50 50)"
              strokeLinecap="round"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize="20"
              fontWeight="bold"
            >
              {mockData.sentiment}%
            </text>
          </svg>
        </div>
      </div>

      {/* Sentiment Indicators */}
      <div className="h-[100px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockData.indicators} layout="vertical">
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              width={100}
            />
            <Bar
              dataKey="value"
              radius={[0, 4, 4, 0]}
              label={{ position: 'right', fill: '#fff' }}
            >
              {mockData.indicators.map((entry, index) => (
                <rect key={index} fill={entry.color} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 