"use client";
import React, { useEffect, useState } from 'react';
import { apiGET } from '../../../lib/clientApi';
import { cn } from '../../../lib/cn';

interface NewsItem {
  title: string;
  url: string;
  publishedDate?: string;
  source?: string;
  snippet?: string;
}

export default function NewsFeed() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGET<{ data: NewsItem[] }>(
          '/api/news?q=indian%20stock%20market%20latest'
        );
        setItems(resp.data);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="col-span-full h-40 rounded-lg bg-zinc-800/50 animate-pulse" />
    );
  }

  return (
    <div className="col-span-full p-4 rounded-lg bg-white/10 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">News Feed</h2>
      <div className="space-y-3 text-xs">
        {items.map((n, index) => (
          <a
            key={`${index}-${n.url}`}
            href={n.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:text-blue-400 transition-colors"
          >
            <p className="font-medium mb-0.5 line-clamp-2">{n.title}</p>
            <span className="text-zinc-400">
              {n.source}
              {n.publishedDate ? ` • ${new Date(n.publishedDate).toLocaleDateString()}` : ''}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
} 