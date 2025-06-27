'use client';

import { Eye, TrendingUp, TrendingDown, Plus, X, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStockData, StockData } from '../../lib/realTimeData';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA'];

function WatchlistItem({ symbol, onRemove }: { symbol: string; onRemove: (symbol: string) => void }) {
  const { data, loading, error } = useStockData(symbol, 30000);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 animate-pulse">
        <div>
          <div className="h-4 w-12 bg-white/10 rounded mb-1"></div>
          <div className="h-3 w-20 bg-white/10 rounded"></div>
        </div>
        <div className="text-right">
          <div className="h-4 w-16 bg-white/10 rounded mb-1"></div>
          <div className="h-3 w-12 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
        <div>
          <div className="font-medium text-white">{symbol}</div>
          <div className="text-xs text-red-400">Error loading</div>
        </div>
        <button
          onClick={() => onRemove(symbol)}
          className="text-red-400 hover:text-red-300"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (!data) return null;

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatChange = (change: number, changePercent: number) => {
    const sign = changePercent >= 0 ? '+' : '';
    return `${sign}${changePercent.toFixed(2)}%`;
  };

  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white">{data.symbol}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(symbol);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-white/30 hover:text-white/50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="text-xs text-white/50 truncate">{data.name}</div>
      </div>
      <div className="text-right">
        <div className="font-medium text-white">{formatPrice(data.price)}</div>
        <div className="flex items-center gap-1 justify-end">
          {data.changePercent >= 0 ? (
            <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />
          ) : (
            <TrendingDown className="w-2.5 h-2.5 text-red-500" />
          )}
          <span
            className={`text-xs ${
              data.changePercent >= 0 ? 'text-emerald-500' : 'text-red-500'
            }`}
          >
            {formatChange(data.change, data.changePercent)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function Watchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('acera-watchlist');
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch {
        setWatchlist(DEFAULT_WATCHLIST);
      }
    } else {
      setWatchlist(DEFAULT_WATCHLIST);
    }
  }, []);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (watchlist.length > 0) {
      localStorage.setItem('acera-watchlist', JSON.stringify(watchlist));
    }
  }, [watchlist]);

  const addSymbol = () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (symbol && !watchlist.includes(symbol) && watchlist.length < 10) {
      setWatchlist([...watchlist, symbol]);
      setNewSymbol('');
      setIsAdding(false);
    }
  };

  const removeSymbol = (symbol: string) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addSymbol();
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setNewSymbol('');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Eye className="w-3 h-3" />
          <span className="text-xs">Watchlist</span>
        </div>
        <span className="text-xs text-white/30">{watchlist.length}/10</span>
      </div>

      {/* Watchlist Items */}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {watchlist.map((symbol) => (
          <WatchlistItem
            key={symbol}
            symbol={symbol}
            onRemove={removeSymbol}
          />
        ))}
        
        {watchlist.length === 0 && (
          <div className="text-center py-4 text-white/30 text-xs">
            No stocks in watchlist
          </div>
        )}
      </div>

      {/* Add Symbol */}
      <div className="border-t border-white/10 pt-2">
        {isAdding ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Enter symbol"
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
              autoFocus
              maxLength={10}
            />
            <button
              onClick={addSymbol}
              disabled={!newSymbol.trim() || watchlist.includes(newSymbol.trim().toUpperCase())}
              className="px-2 py-1 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSymbol('');
              }}
              className="px-2 py-1 bg-white/10 text-white text-xs rounded hover:bg-white/20"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            disabled={watchlist.length >= 10}
            className="w-full flex items-center justify-center gap-1 text-xs text-white/50 hover:text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Plus className="w-3 h-3" />
            Add Symbol
          </button>
        )}
      </div>
    </div>
  );
} 