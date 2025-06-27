"use client";
import React, { useEffect, useState } from 'react';
import { apiGET } from '../../../lib/clientApi';
import { cn } from '../../../lib/cn';

interface Quote {
  symbol: string;
  ltp: number;
  change: number;
  percent_change: number;
}

export default function QuoteStrip() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGET<{ data: Record<string, any> }>('/api/market/index');
        const arr = Object.entries(resp.data || {}).map(([name, v]) => ({
          symbol: name,
          ltp: v.value ?? v.ltp ?? v.price ?? 0,
          change: v.change ?? 0,
          percent_change: v.change_percent ?? v.percent_change ?? 0,
        })) as Quote[];
        setQuotes(arr.slice(0, 6));
      } catch (_) {
        // ignore errors for now
      }
    })();
  }, []);

  return (
    <div
      className={cn(
        'col-span-full flex overflow-x-auto space-x-6 p-3',
        'rounded-lg bg-white/10 backdrop-blur-sm'
      )}
    >
      {quotes.map((q) => (
        <div key={q.symbol} className="shrink-0 min-w-24 text-center">
          <p className="text-sm text-zinc-400">{q.symbol}</p>
          <p className="font-medium">{q.ltp.toFixed(2)}</p>
          <p
            className={cn(
              'text-xs',
              q.change >= 0 ? 'text-green-400' : 'text-red-400'
            )}
          >
            {q.change >= 0 ? '+' : ''}
            {q.percent_change.toFixed(2)}%
          </p>
        </div>
      ))}
    </div>
  );
} 