'use client';

import { Activity, ArrowUp, ArrowDown } from 'lucide-react';

const mockData = {
  signals: [
    {
      name: 'RSI',
      value: 68.5,
      signal: 'neutral',
      description: 'Approaching overbought conditions'
    },
    {
      name: 'MACD',
      value: 2.34,
      signal: 'buy',
      description: 'Bullish crossover detected'
    },
    {
      name: 'Moving Avg',
      value: 182.45,
      signal: 'sell',
      description: 'Price below 50-day MA'
    },
    {
      name: 'Volume',
      value: '45.2M',
      signal: 'buy',
      description: 'Above average volume'
    }
  ]
};

export function MarketSignals() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Activity className="w-4 h-4" />
        <span className="text-sm">Technical Signals</span>
      </div>

      <div className="space-y-2">
        {mockData.signals.map((signal, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium text-white">{signal.name}</div>
              <div className="flex items-center gap-2">
                <span className="text-white/70">{signal.value}</span>
                {signal.signal === 'buy' && (
                  <div className="flex items-center gap-1 text-emerald-500">
                    <ArrowUp className="w-4 h-4" />
                    <span className="text-sm">Buy</span>
                  </div>
                )}
                {signal.signal === 'sell' && (
                  <div className="flex items-center gap-1 text-red-500">
                    <ArrowDown className="w-4 h-4" />
                    <span className="text-sm">Sell</span>
                  </div>
                )}
                {signal.signal === 'neutral' && (
                  <div className="text-sm text-white/50">Hold</div>
                )}
              </div>
            </div>
            <p className="text-sm text-white/50">{signal.description}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          View all signals →
        </button>
      </div>
    </div>
  );
} 