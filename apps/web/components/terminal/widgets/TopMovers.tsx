"use client";
import React, { useEffect, useState } from 'react';
import { apiGET } from '../../../lib/clientApi';
import { cn } from '../../../lib/cn';

interface Mover {
  symbol: string;
  ltp: number;
  percent_change: number;
}

export default React.memo(function TopMovers() {
  const [gainers, setGainers] = useState<Mover[]>([]);
  const [losers, setLosers] = useState<Mover[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await apiGET<{ data: { top_gainers: Mover[]; top_losers: Mover[] } }>(
          '/api/market/top-movers'
        );
        setGainers(response.data.top_gainers.slice(0, 5));
        setLosers(response.data.top_losers.slice(0, 5));
      } catch (_) {}
    })();
  }, []);

  const renderRows = (arr: Mover[]) =>
    arr.map((m) => (
      <div key={m.symbol} className="flex justify-between text-xs py-0.5">
        <span className="text-zinc-400">{m.symbol}</span>
        <span className="font-medium">{m.ltp.toFixed(2)}</span>
        <span
          className={cn(
            m.percent_change >= 0 ? 'text-green-400' : 'text-red-400'
          )}
        >
          {m.percent_change.toFixed(2)}%
        </span>
      </div>
    ));

  return (
    <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm col-span-2">
      <h2 className="text-sm font-semibold text-zinc-300 mb-3">Top Movers</h2>
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <h3 className="mb-1 text-zinc-400">Gainers</h3>
          {renderRows(gainers)}
        </div>
        <div>
          <h3 className="mb-1 text-zinc-400">Losers</h3>
          {renderRows(losers)}
        </div>
      </div>
    </div>
  );
}); 