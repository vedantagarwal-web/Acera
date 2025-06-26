'use client';

import { Eye, TrendingUp, TrendingDown } from 'lucide-react';

const mockData = {
  stocks: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: '$182.89', change: '+1.23%', isPositive: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: '$337.20', change: '-0.45%', isPositive: false },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$131.86', change: '+2.15%', isPositive: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$127.12', change: '+0.78%', isPositive: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: '$421.01', change: '-1.32%', isPositive: false },
  ]
};

export function Watchlist() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Eye className="w-4 h-4" />
        <span className="text-sm">Watchlist</span>
      </div>

      <div className="space-y-2">
        {mockData.stocks.map((stock, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <div>
              <div className="font-medium text-white">{stock.symbol}</div>
              <div className="text-sm text-white/50">{stock.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-white">{stock.price}</div>
              <div className="flex items-center gap-1">
                {stock.isPositive ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    stock.isPositive ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {stock.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          Add to watchlist +
        </button>
      </div>
    </div>
  );
} 