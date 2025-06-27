'use client';

import { Brain, TrendingUp, TrendingDown, AlertTriangle, RotateCcw, Sparkles, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAIInsights, AIInsight } from '../../lib/realTimeData';

export function AiInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const data = await fetchAIInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights');
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'buy':
        return <TrendingUp className="w-3 h-3 text-emerald-500" />;
      case 'sell':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      case 'alert':
        return <AlertTriangle className="w-3 h-3 text-yellow-500" />;
      case 'rotation':
        return <RotateCcw className="w-3 h-3 text-blue-500" />;
      default:
        return <Sparkles className="w-3 h-3 text-purple-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'buy':
        return 'border-l-emerald-500 bg-emerald-500/5';
      case 'sell':
        return 'border-l-red-500 bg-red-500/5';
      case 'alert':
        return 'border-l-yellow-500 bg-yellow-500/5';
      case 'rotation':
        return 'border-l-blue-500 bg-blue-500/5';
      default:
        return 'border-l-purple-500 bg-purple-500/5';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-emerald-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High';
    if (confidence >= 60) return 'Medium';
    return 'Low';
  };

  if (loading && !insights.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <Brain className="w-3 h-3" />
          <span className="text-xs">AI Insights</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 animate-pulse">
              <div className="h-3 bg-white/10 rounded mb-2"></div>
              <div className="h-2 bg-white/10 rounded w-4/5 mb-1"></div>
              <div className="flex justify-between">
                <div className="h-2 bg-white/10 rounded w-1/3"></div>
                <div className="h-2 bg-white/10 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !insights.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Brain className="w-3 h-3" />
            <span className="text-xs">AI Insights</span>
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
          <p className="text-red-400 text-xs">Failed to load AI insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Brain className="w-3 h-3" />
          <span className="text-xs">AI Insights</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <div className="flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-purple-400" />
          <span className="text-xs text-white/30">Live AI</span>
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg border-l-2 hover:bg-white/5 transition-colors ${getInsightColor(insight.type)}`}
          >
            <div className="flex items-start gap-2">
              {getInsightIcon(insight.type)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white text-xs font-medium truncate">{insight.title}</h4>
                  <span className={`text-xs font-medium ${getConfidenceColor(insight.confidence)}`}>
                    {insight.confidence}%
                  </span>
                </div>
                <p className="text-white/60 text-xs leading-tight line-clamp-2 mb-2">
                  {insight.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/40 text-xs">{insight.timeframe}</span>
                  <div className="flex items-center gap-1">
                    <div className={`w-1 h-1 rounded-full ${getConfidenceColor(insight.confidence)}`}></div>
                    <span className={`text-xs ${getConfidenceColor(insight.confidence)}`}>
                      {getConfidenceLabel(insight.confidence)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {insights.length === 0 && !loading && (
          <div className="text-center py-4 text-white/30 text-xs">
            No AI insights available
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>AI Analysis</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 