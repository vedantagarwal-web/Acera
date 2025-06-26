import { useState, useEffect } from 'react';
import { NewsItem } from '@/lib/exa';

interface StockData {
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prev_close: number;
  market_cap?: string;
  pe_ratio?: number;
  industry?: string;
  face_value?: number;
}

interface OptionData {
  type: 'CE' | 'PE';
  strike: number;
  last_price: number;
  change: number;
  oi: number;
  volume: number;
}

interface StockResponse {
  stock: StockData;
  options?: OptionData[];
}

export function useStock(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE', includeOptions: boolean = false) {
  const [data, setData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/stocks/${symbol}?exchange=${exchange}&include_options=${includeOptions}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch stock data');
        }

        const stockData = await response.json();
        setData(stockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchStockData();
  }, [symbol, exchange, includeOptions]);

  return { data, loading, error };
} 