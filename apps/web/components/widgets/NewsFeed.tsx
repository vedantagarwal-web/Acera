'use client';

import { useState } from 'react';
import { Newspaper, ExternalLink, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNews } from '../../lib/realTimeData';

export function NewsFeed() {
  const { data: news, loading, error, refetch } = useNews(10, 300000); // Refresh every 5 minutes
  const [clickedArticle, setClickedArticle] = useState<string | null>(null);

  const handleArticleClick = (url: string, index: number) => {
    setClickedArticle(`${index}-${url}`);
    window.open(url, '_blank');
    
    // Reset clicked state after animation
    setTimeout(() => {
      setClickedArticle(null);
    }, 200);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-2.5 h-2.5 text-emerald-500" />;
      case 'negative':
        return <TrendingDown className="w-2.5 h-2.5 text-red-500" />;
      default:
        return <Minus className="w-2.5 h-2.5 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-emerald-500 bg-emerald-500/5';
      case 'negative':
        return 'border-l-red-500 bg-red-500/5';
      default:
        return 'border-l-yellow-500 bg-yellow-500/5';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours > 24) {
      return date.toLocaleDateString();
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  if (loading && !news.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-white/70">
          <Newspaper className="w-3 h-3" />
          <span className="text-xs">Market News</span>
          <RefreshCw className="w-3 h-3 animate-spin" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="p-2 rounded-lg bg-white/5 animate-pulse">
              <div className="h-3 bg-white/10 rounded mb-2"></div>
              <div className="h-2 bg-white/10 rounded w-3/4 mb-1"></div>
              <div className="h-2 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !news.length) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white/70">
            <Newspaper className="w-3 h-3" />
            <span className="text-xs">Market News</span>
          </div>
          <button
            onClick={refetch}
            className="text-xs text-white/50 hover:text-white/70 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
        <div className="text-center py-4">
          <p className="text-red-400 text-xs">Failed to load news</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-white/70">
          <Newspaper className="w-3 h-3" />
          <span className="text-xs">Market News</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin opacity-50" />}
        </div>
        <span className="text-xs text-white/30">{news.length} articles</span>
      </div>

      {/* News Items */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto">
        {news.map((article, index) => {
          const articleKey = `${index}-${article.url}`;
          const isClicked = clickedArticle === articleKey;
          
          return (
            <div
              key={articleKey}
              className={`p-2 rounded-lg border-l-2 hover:bg-white/10 hover:border-l-white/30 transition-all duration-200 cursor-pointer group transform hover:scale-[1.01] ${isClicked ? 'scale-95 bg-white/20' : ''} ${getSentimentColor(article.sentiment)}`}
              onClick={() => handleArticleClick(article.url, index)}
              title="Click to read full article"
            >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                  {typeof article.title === 'string' ? article.title : 'News Article'}
                </h4>
                {article.summary && (
                  <p className="text-white/50 text-xs mt-1 line-clamp-2 leading-tight group-hover:text-white/70 transition-colors">
                    {typeof article.summary === 'string' ? article.summary : 'News summary'}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white/40 text-xs group-hover:text-white/60 transition-colors">
                      {typeof article.source === 'string' ? article.source : 'Unknown Source'}
                    </span>
                    <div className="flex items-center gap-1">
                      {getSentimentIcon(article.sentiment)}
                      <span className="text-xs text-white/40 capitalize group-hover:text-white/60 transition-colors">
                        {typeof article.sentiment === 'string' ? article.sentiment : 'neutral'}
                      </span>
                    </div>
                  </div>
                  <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">
                    {formatTime(article.publishedAt)}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-white/30 flex-shrink-0 mt-0.5 group-hover:text-blue-400 group-hover:scale-110 transition-all" />
            </div>
          </div>
        );
        })}
      </div>

      {/* Last Updated */}
      <div className="flex justify-between items-center text-xs text-white/30 border-t border-white/10 pt-2">
        <span>Live News Feed</span>
        <span>Updated {new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
} 