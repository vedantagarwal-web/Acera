'use client';

import { BookOpen } from 'lucide-react';

const mockData = {
  bids: [
    { price: '182.45', size: '100', total: '18,245' },
    { price: '182.44', size: '250', total: '45,610' },
    { price: '182.43', size: '500', total: '91,215' },
  ],
  asks: [
    { price: '182.46', size: '150', total: '27,369' },
    { price: '182.47', size: '300', total: '54,741' },
    { price: '182.48', size: '450', total: '82,116' },
  ],
  spread: '0.01'
};

export function OrderBook() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm">Order Book</span>
        </div>
        <div className="text-sm text-white/50">
          Spread: ${mockData.spread}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <div className="grid grid-cols-3 text-xs text-white/50 mb-2">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>
          <div className="space-y-1">
            {mockData.bids.map((bid, index) => (
              <div
                key={index}
                className="grid grid-cols-3 text-sm py-1 px-2 rounded bg-emerald-500/10"
              >
                <div className="text-emerald-500">${bid.price}</div>
                <div className="text-right text-white">{bid.size}</div>
                <div className="text-right text-white/70">${bid.total}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <div className="grid grid-cols-3 text-xs text-white/50 mb-2">
            <div>Price</div>
            <div className="text-right">Size</div>
            <div className="text-right">Total</div>
          </div>
          <div className="space-y-1">
            {mockData.asks.map((ask, index) => (
              <div
                key={index}
                className="grid grid-cols-3 text-sm py-1 px-2 rounded bg-red-500/10"
              >
                <div className="text-red-500">${ask.price}</div>
                <div className="text-right text-white">{ask.size}</div>
                <div className="text-right text-white/70">${ask.total}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 