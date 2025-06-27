'use client';

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

      {/* Custom Progress Bars */}
      <div className="space-y-3">
        {mockData.indicators.map((indicator, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex-1 flex items-center gap-3">
              <span className="text-xs text-white/70 w-16 text-left">
                {indicator.name.split(' ')[0]}
              </span>
              <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${indicator.value}%`,
                    backgroundColor: indicator.color,
                  }}
                />
              </div>
            </div>
            <span 
              className="text-xs font-medium ml-2 w-8 text-right"
              style={{ color: indicator.color }}
            >
              {indicator.value}
            </span>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <div className="text-center">
          <div className="text-xs text-white/50">Bulls</div>
          <div className="text-sm font-medium text-green-400">68%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50">Neutral</div>
          <div className="text-sm font-medium text-gray-400">17%</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-white/50">Bears</div>
          <div className="text-sm font-medium text-red-400">15%</div>
        </div>
      </div>
    </div>
  );
} 