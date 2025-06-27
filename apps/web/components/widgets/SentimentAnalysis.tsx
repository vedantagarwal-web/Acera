'use client';

import { Heart, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchSentimentData, SentimentData } from '../../lib/realTimeData';

export function SentimentAnalysis() {
  const [sentiment, setSentiment] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchSentimentData();
      setSentiment(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sentiment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const getSentimentColor = (value: number) => {
    if (value >= 70) return 'bg-emerald-500';
    if (value >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSentimentLabel = (value: number) => {
    if (value >= 70) return 'Bullish';
    if (value >= 50) return 'Neutral';
    return 'Bearish';
  };

  const getOverallTrend = () => {
    if (!sentiment) return { icon: null, color: '', label: '' };
    
    if (sentiment.overall >= 70) {
      return { 
        icon: <TrendingUp className="w-3 h-3 text-emerald-500" />, 
        color: 'text-emerald-500', 
        label: 'Very Bullish' 
      };
    } else if (sentiment.overall >= 50) {
      return { 
        icon: <Heart className="w-3 h-3 text-yellow-500" />, 
        color: 'text-yellow-500', 
        label: 'Neutral' 
      };
    } else {
      return { 
        icon: <TrendingDown className="w-3 h-3 text-red-500" />, 
        color: 'text-red-500', 
        label: 'Very Bearish' 
      };
    }
  };

  if (loading && !sentiment) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <Heart className="w-3 h-3" />
          <span className="text-xs">Sentiment Analysis</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <div className="h-3 bg-white/10 rounded w-16"></div>
                <div className="h-3 bg-white/10 rounded w-8"></div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="h-2 bg-white/20 rounded-full w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !sentiment) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Heart className="w-3 h-3" />
            <span className="text-xs">Sentiment Analysis</span>
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
          <p className="text-red-400 text-xs">Failed to load sentiment</p>
        </div>
      </div>
    );
  }

  if (!sentiment) return null;

  const trend = getOverallTrend();
  
  const sentimentMetrics = [
    { label: 'Overall', value: sentiment.overall },
    { label: 'Social', value: sentiment.social },
    { label: 'News', value: sentiment.news },
    { label: 'Trading', value: sentiment.trading },
  ];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Heart className="w-3 h-3" />
          <span className="text-xs">Sentiment Analysis</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <div className="flex items-center gap-1">
          {trend.icon}
          <span className={`text-xs ${trend.color}`}>{trend.label}</span>
        </div>
      </div>

      {/* Overall Sentiment Score */}
      <div className="p-2 rounded-lg bg-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white text-xs font-medium">Market Sentiment</span>
          <span className={`text-xs font-medium ${getSentimentColor(sentiment.overall) === 'bg-emerald-500' ? 'text-emerald-500' : getSentimentColor(sentiment.overall) === 'bg-yellow-500' ? 'text-yellow-500' : 'text-red-500'}`}>
            {sentiment.overall}%
          </span>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getSentimentColor(sentiment.overall)}`}
            style={{ width: `${sentiment.overall}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>Bearish</span>
          <span>Bullish</span>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="space-y-2">
        {sentimentMetrics.map((metric, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/70 text-xs">{metric.label}</span>
              <span className="text-white text-xs">{metric.value}%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${getSentimentColor(metric.value)}`}
                style={{ width: `${metric.value}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Bull/Bear Distribution */}
      <div className="p-2 rounded-lg bg-white/5">
        <div className="text-xs text-white/70 mb-2">Distribution</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded"></div>
            <span className="text-white/60">Bull {sentiment.bullPercent}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded"></div>
            <span className="text-white/60">Neutral {sentiment.neutralPercent}%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded"></div>
            <span className="text-white/60">Bear {sentiment.bearPercent}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>Live Sentiment</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 