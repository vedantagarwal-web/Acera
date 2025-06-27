'use client';

import { BookOpen, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';

interface OrderBookEntry {
  price: number;
  size: number;
  total: number;
}

interface OrderBookData {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  spread: number;
  spreadPercent: number;
  lastPrice: number;
  lastSize: number;
}

const generateMockOrderBook = (): OrderBookData => {
  const lastPrice = 180 + Math.random() * 20; // Price around $180-200
  const spread = 0.01 + Math.random() * 0.05; // Spread between 1-6 cents
  
  // Generate bids (buy orders) - below last price
  const bids: OrderBookEntry[] = [];
  let runningTotal = 0;
  for (let i = 0; i < 8; i++) {
    const price = lastPrice - spread/2 - (i * 0.01);
    const size = Math.floor(Math.random() * 500) + 50;
    runningTotal += size;
    bids.push({ price, size, total: runningTotal });
  }
  
  // Generate asks (sell orders) - above last price
  const asks: OrderBookEntry[] = [];
  runningTotal = 0;
  for (let i = 0; i < 8; i++) {
    const price = lastPrice + spread/2 + (i * 0.01);
    const size = Math.floor(Math.random() * 500) + 50;
    runningTotal += size;
    asks.push({ price, size, total: runningTotal });
  }
  
  return {
    symbol: 'AAPL',
    bids: bids.reverse(), // Highest bids first
    asks, // Lowest asks first
    spread,
    spreadPercent: (spread / lastPrice) * 100,
    lastPrice,
    lastSize: Math.floor(Math.random() * 200) + 50
  };
};

export function OrderBook() {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // In a real app, this would fetch from your order book API
      const data = generateMockOrderBook();
      setOrderBook(data);
    } catch (error) {
      console.error('Error fetching order book data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 2 seconds for real-time feel
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatSize = (size: number) => size.toLocaleString();

  const getVolumeBarWidth = (total: number, maxTotal: number) => {
    return Math.max((total / maxTotal) * 100, 5); // Minimum 5% width
  };

  if (loading && !orderBook) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <BookOpen className="w-3 h-3" />
          <span className="text-xs">Order Book</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="h-2 bg-white/10 rounded w-12"></div>
              <div className="h-2 bg-white/10 rounded w-16"></div>
              <div className="h-2 bg-white/10 rounded w-10"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!orderBook) return null;

  const maxBidTotal = Math.max(...orderBook.bids.map(b => b.total));
  const maxAskTotal = Math.max(...orderBook.asks.map(a => a.total));
  const maxTotal = Math.max(maxBidTotal, maxAskTotal);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <BookOpen className="w-3 h-3" />
          <span className="text-xs">Order Book</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <span className="text-xs text-white/30">{orderBook.symbol}</span>
      </div>

      {/* Market Info */}
      <div className="p-2 rounded-lg bg-white/5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/70">Last Price</span>
          <span className="text-white text-xs font-medium">{formatPrice(orderBook.lastPrice)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/70">Spread</span>
          <span className="text-xs text-white/50">
            {formatPrice(orderBook.spread)} ({orderBook.spreadPercent.toFixed(3)}%)
          </span>
        </div>
      </div>

      {/* Order Book */}
      <div className="space-y-1">
        {/* Column Headers */}
        <div className="flex justify-between text-xs text-white/50 px-1">
          <span>Price</span>
          <span>Size</span>
          <span>Total</span>
        </div>

        {/* Asks (Sell Orders) */}
        <div className="space-y-0.5">
          {orderBook.asks.slice(0, 4).map((ask, index) => (
            <div
              key={`ask-${index}`}
              className="relative flex justify-between items-center text-xs p-1 rounded hover:bg-red-500/10 transition-colors"
            >
              {/* Volume Bar */}
              <div
                className="absolute left-0 top-0 h-full bg-red-500/10 rounded"
                style={{ width: `${getVolumeBarWidth(ask.total, maxTotal)}%` }}
              ></div>
              
              {/* Content */}
              <span className="text-red-400 relative z-10">{formatPrice(ask.price)}</span>
              <span className="text-white/70 relative z-10">{formatSize(ask.size)}</span>
              <span className="text-white/50 relative z-10">{formatSize(ask.total)}</span>
            </div>
          ))}
        </div>

        {/* Spread Indicator */}
        <div className="flex items-center justify-center py-1 border-y border-white/10">
          <span className="text-xs text-white/30">
            Spread: {formatPrice(orderBook.spread)}
          </span>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-0.5">
          {orderBook.bids.slice(0, 4).map((bid, index) => (
            <div
              key={`bid-${index}`}
              className="relative flex justify-between items-center text-xs p-1 rounded hover:bg-emerald-500/10 transition-colors"
            >
              {/* Volume Bar */}
              <div
                className="absolute left-0 top-0 h-full bg-emerald-500/10 rounded"
                style={{ width: `${getVolumeBarWidth(bid.total, maxTotal)}%` }}
              ></div>
              
              {/* Content */}
              <span className="text-emerald-400 relative z-10">{formatPrice(bid.price)}</span>
              <span className="text-white/70 relative z-10">{formatSize(bid.size)}</span>
              <span className="text-white/50 relative z-10">{formatSize(bid.total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Depth Summary */}
      <div className="p-2 rounded-lg bg-white/5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
            <span className="text-xs text-white/70">Bid Vol</span>
            <span className="text-xs text-emerald-400">{formatSize(maxBidTotal)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-2.5 h-2.5 text-red-500" />
            <span className="text-xs text-white/70">Ask Vol</span>
            <span className="text-xs text-red-400">{formatSize(maxAskTotal)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>Live Book</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 