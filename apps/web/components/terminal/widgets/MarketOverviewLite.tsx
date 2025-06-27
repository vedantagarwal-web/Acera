"use client";
import React, { useEffect, useState } from 'react';
import { apiGET } from '../../../lib/clientApi';
import { cn } from '../../../lib/cn';

interface IndexData {
  name: string;
  ltp: number;
  change: number;
  percent_change: number;
}

export default React.memo(function MarketOverviewLite() {
  const [data, setData] = useState<IndexData[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const resp = await apiGET<{ data: Record<string, any> }>('/api/market/index');
        const arr = Object.entries(resp.data || {}).map(([name, v]) => ({
          name,
          ltp: v.value ?? v.ltp ?? v.price ?? 0,
          change: v.change ?? 0,
          percent_change: v.change_percent ?? v.percent_change ?? 0,
        })) as IndexData[];
        setData(arr);
      } catch (_) {}
    })();
  }, []);

  return (
    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
      <h2 className="text-sm mb-3 font-semibold text-zinc-300">Markets</h2>
      <div className="space-y-2">
        {data.map((idx) => (
          <div key={idx.name} className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">{idx.name}</span>
            <span className="text-sm font-medium">{idx.ltp.toFixed(2)}</span>
            <span
              className={cn(
                'text-xs',
                idx.change >= 0 ? 'text-green-400' : 'text-red-400'
              )}
            >
              {idx.change >= 0 ? '+' : ''}
              {idx.percent_change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}); 