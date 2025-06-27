'use client';

import { Activity, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchTechnicalSignals, TechnicalSignal } from '../../lib/realTimeData';

export function MarketSignals() {
  const [signals, setSignals] = useState<TechnicalSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchTechnicalSignals();
      setSignals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load signals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every minute
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'sell':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-yellow-500" />;
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy':
        return 'text-emerald-500 bg-emerald-500/10';
      case 'sell':
        return 'text-red-500 bg-red-500/10';
      default:
        return 'text-yellow-500 bg-yellow-500/10';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-emerald-500';
    if (confidence >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading && !signals.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <Activity className="w-3 h-3" />
          <span className="text-xs">Market Signals</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
                <div className="h-3 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !signals.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Activity className="w-3 h-3" />
            <span className="text-xs">Market Signals</span>
          </div>
          <button
            onClick={fetchData}
            className="text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-red-400 text-xs">Failed to load signals</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Activity className="w-3 h-3" />
          <span className="text-xs">Market Signals</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <span className="text-xs text-white/30">{signals.length} signals</span>
      </div>

      {/* Signals */}
      <div className="space-y-2">
        {signals.map((signal, index) => (
          <div
            key={index}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                {getSignalIcon(signal.signal)}
                <span className="text-white text-xs font-medium">{signal.indicator}</span>
              </div>
              <span className={`text-xs px-1.5 py-0.5 rounded ${getSignalColor(signal.signal)}`}>
                {signal.signal.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white/50 text-xs">{signal.value.toFixed(2)}</span>
              <div className="flex items-center gap-2">
                <div className="w-8 bg-white/10 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${getConfidenceColor(signal.confidence)}`}
                    style={{ width: `${signal.confidence}%` }}
                  ></div>
                </div>
                <span className="text-white/40 text-xs">{signal.confidence}%</span>
              </div>
            </div>
            <p className="text-white/40 text-xs mt-1 leading-tight line-clamp-1">
              {signal.description}
            </p>
          </div>
        ))}

        {signals.length === 0 && !loading && (
          <div className="text-center py-4 text-white/30 text-xs">
            No signals available
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>Live Signals</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 