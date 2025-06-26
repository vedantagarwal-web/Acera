'use client';

import { Newspaper, ExternalLink } from 'lucide-react';

const mockData = {
  news: [
    {
      title: 'Market Rally Continues as Tech Stocks Surge',
      source: 'Bloomberg',
      time: '2h ago',
      sentiment: 'positive',
      url: '#'
    },
    {
      title: 'Fed Signals Potential Rate Cut in Coming Months',
      source: 'Reuters',
      time: '4h ago',
      sentiment: 'neutral',
      url: '#'
    },
    {
      title: 'Global Markets Face Headwinds Amid Economic Data',
      source: 'Financial Times',
      time: '6h ago',
      sentiment: 'negative',
      url: '#'
    }
  ]
};

export function NewsFeed() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-white/70">
        <Newspaper className="w-4 h-4" />
        <span className="text-sm">Latest market news</span>
      </div>

      <div className="space-y-3">
        {mockData.news.map((item, index) => (
          <a
            key={index}
            href={item.url}
            className="block p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium text-white group-hover:text-white/90">
                {item.title}
              </div>
              <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-white/50" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/50">{item.source}</span>
              <span className="text-white/50">{item.time}</span>
            </div>
            <div className={`h-1 mt-3 rounded-full ${
              item.sentiment === 'positive'
                ? 'bg-emerald-500/50'
                : item.sentiment === 'negative'
                ? 'bg-red-500/50'
                : 'bg-white/20'
            }`} />
          </a>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="text-sm text-white/50 hover:text-white/70 transition-colors">
          View all news →
        </button>
      </div>
    </div>
  );
} 