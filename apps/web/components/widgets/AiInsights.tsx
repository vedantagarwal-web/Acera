'use client';

import { Brain, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const mockData = {
  insights: [
    {
      type: 'bullish',
      title: 'Strong Buy Signal',
      description: 'Technical indicators suggest a potential upward trend in the next 24-48 hours.',
      confidence: 85,
    },
    {
      type: 'bearish',
      title: 'Volatility Alert',
      description: 'Increased market volatility detected. Consider adjusting stop losses.',
      confidence: 75,
    },
    {
      type: 'warning',
      title: 'Sector Rotation',
      description: 'Capital flowing from tech to healthcare sector. Watch for opportunities.',
      confidence: 65,
    },
  ]
};

export function AiInsights() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Brain className="w-4 h-4" />
        <span className="text-sm">AI-powered market analysis</span>
      </div>

      <div className="space-y-3">
        {mockData.insights.map((insight, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {insight.type === 'bullish' && (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                )}
                {insight.type === 'bearish' && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                {insight.type === 'warning' && (
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                )}
                <span className="font-medium text-white">{insight.title}</span>
              </div>
              <div
                className={`text-sm ${
                  insight.confidence >= 80
                    ? 'text-emerald-500'
                    : insight.confidence >= 70
                    ? 'text-yellow-500'
                    : 'text-white/70'
                }`}
              >
                {insight.confidence}% confidence
              </div>
            </div>
            <p className="text-sm text-white/70">{insight.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          View all insights →
        </button>
      </div>
    </div>
  );
} 