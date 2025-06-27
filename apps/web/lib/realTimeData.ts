import { useState, useEffect, useCallback } from 'react';

// Types for our data structures
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  lastUpdated: string;
}

export interface MarketData {
  indices: {
    sp500: { value: number; change: number; changePercent: number };
    nasdaq: { value: number; change: number; changePercent: number };
    dow: { value: number; change: number; changePercent: number };
    vix: { value: number; change: number; changePercent: number };
  };
  marketCap: number;
  volume: number;
  chart: Array<{ time: string; value: number }>;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface TechnicalSignal {
  indicator: string;
  value: number;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  description: string;
}

export interface SentimentData {
  overall: number;
  social: number;
  news: number;
  trading: number;
  technical: number;
  options: number;
  bullPercent: number;
  neutralPercent: number;
  bearPercent: number;
}

export interface AIInsight {
  type: 'buy' | 'sell' | 'hold' | 'alert' | 'rotation';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
}

// API Base URL
const API_BASE = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8000/api' 
  : '/api';

// Real-time data fetching functions
export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    const response = await fetch(`${API_BASE}/stocks/${symbol}`);
    if (!response.ok) throw new Error('Failed to fetch stock data');
    const data = await response.json();
    
    return {
      symbol: data.symbol || symbol,
      name: data.name || 'Unknown Company',
      price: parseFloat(data.price || data.close || 0),
      change: parseFloat(data.change || 0),
      changePercent: parseFloat(data.changePercent || data.percent_change || 0),
      volume: parseInt(data.volume || 0),
      marketCap: parseInt(data.marketCap || 0),
      high52w: parseFloat(data.high52w || data.yearHigh || 0),
      low52w: parseFloat(data.low52w || data.yearLow || 0),
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    // Return mock data as fallback
    return {
      symbol,
      name: 'Mock Company',
      price: 100 + Math.random() * 200,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 1000000),
      marketCap: Math.floor(Math.random() * 1000000000),
      high52w: 150 + Math.random() * 100,
      low52w: 50 + Math.random() * 50,
      lastUpdated: new Date().toISOString()
    };
  }
};

export const fetchMarketData = async (): Promise<MarketData> => {
  try {
    const response = await fetch(`${API_BASE}/market/overview`);
    if (!response.ok) throw new Error('Failed to fetch market data');
    const data = await response.json();
    
    return {
      indices: {
        sp500: {
          value: parseFloat(data.indices?.sp500?.value || 4500),
          change: parseFloat(data.indices?.sp500?.change || 0),
          changePercent: parseFloat(data.indices?.sp500?.changePercent || 0)
        },
        nasdaq: {
          value: parseFloat(data.indices?.nasdaq?.value || 14000),
          change: parseFloat(data.indices?.nasdaq?.change || 0),
          changePercent: parseFloat(data.indices?.nasdaq?.changePercent || 0)
        },
        dow: {
          value: parseFloat(data.indices?.dow?.value || 35000),
          change: parseFloat(data.indices?.dow?.change || 0),
          changePercent: parseFloat(data.indices?.dow?.changePercent || 0)
        },
        vix: {
          value: parseFloat(data.indices?.vix?.value || 18),
          change: parseFloat(data.indices?.vix?.change || 0),
          changePercent: parseFloat(data.indices?.vix?.changePercent || 0)
        }
      },
      marketCap: parseFloat(data.marketCap || 0),
      volume: parseFloat(data.volume || 0),
      chart: data.chart || generateMockChart()
    };
  } catch (error) {
    console.error('Error fetching market data:', error);
    return generateMockMarketData();
  }
};

export const fetchNews = async (limit: number = 10): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${API_BASE}/news?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch news');
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id || Math.random().toString(),
      title: item.title || 'Market Update',
      summary: item.summary || item.description || 'Market news update',
      url: item.url || '#',
      source: item.source || 'Market News',
      publishedAt: item.publishedAt || item.published_at || new Date().toISOString(),
      sentiment: item.sentiment || 'neutral'
    }));
  } catch (error) {
    console.error('Error fetching news:', error);
    return generateMockNews(limit);
  }
};

export const fetchTechnicalSignals = async (symbol?: string): Promise<TechnicalSignal[]> => {
  try {
    const url = symbol ? `${API_BASE}/signals?symbol=${symbol}` : `${API_BASE}/signals`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch signals');
    const data = await response.json();
    
    const signals = data.signals || data;
    if (Array.isArray(signals)) {
      return signals.map((signal: any) => ({
        indicator: signal.indicator || 'RSI',
        value: parseFloat(signal.value || 50),
        signal: signal.signal || 'hold',
        confidence: parseFloat(signal.confidence || 70),
        description: signal.description || 'Technical analysis signal'
      }));
    }
    
    return generateMockSignals();
  } catch (error) {
    console.error('Error fetching technical signals:', error);
    return generateMockSignals();
  }
};

export const fetchSentimentData = async (): Promise<SentimentData> => {
  try {
    const response = await fetch(`${API_BASE}/sentiment`);
    if (!response.ok) throw new Error('Failed to fetch sentiment');
    const data = await response.json();
    
    return {
      overall: parseFloat(data.overall || 65),
      social: parseFloat(data.social || 75),
      news: parseFloat(data.news || 60),
      trading: parseFloat(data.trading || 85),
      technical: parseFloat(data.technical || 45),
      options: parseFloat(data.options || 70),
      bullPercent: parseFloat(data.bullPercent || 68),
      neutralPercent: parseFloat(data.neutralPercent || 17),
      bearPercent: parseFloat(data.bearPercent || 15)
    };
  } catch (error) {
    console.error('Error fetching sentiment data:', error);
    return generateMockSentiment();
  }
};

export const fetchAIInsights = async (): Promise<AIInsight[]> => {
  try {
    const response = await fetch(`${API_BASE}/ai/insights`);
    if (!response.ok) throw new Error('Failed to fetch AI insights');
    const data = await response.json();
    
    const insights = data.insights || data;
    if (Array.isArray(insights)) {
      return insights.map((insight: any) => ({
        type: insight.type || 'hold',
        title: insight.title || 'Market Analysis',
        description: insight.description || 'AI-powered market insight',
        confidence: parseFloat(insight.confidence || 75),
        timeframe: insight.timeframe || '24-48 hours'
      }));
    }
    
    return generateMockInsights();
  } catch (error) {
    console.error('Error fetching AI insights:', error);
    return generateMockInsights();
  }
};

// Mock data generators for fallback
const generateMockChart = () => {
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(Date.now() - (19 - i) * 60000).toISOString(),
    value: 150 + Math.random() * 100 + Math.sin(i * 0.5) * 20
  }));
};

const generateMockMarketData = (): MarketData => ({
  indices: {
    sp500: { value: 4500 + Math.random() * 100, change: (Math.random() - 0.5) * 50, changePercent: (Math.random() - 0.5) * 2 },
    nasdaq: { value: 14000 + Math.random() * 500, change: (Math.random() - 0.5) * 100, changePercent: (Math.random() - 0.5) * 3 },
    dow: { value: 35000 + Math.random() * 1000, change: (Math.random() - 0.5) * 200, changePercent: (Math.random() - 0.5) * 1.5 },
    vix: { value: 15 + Math.random() * 10, change: (Math.random() - 0.5) * 2, changePercent: (Math.random() - 0.5) * 10 }
  },
  marketCap: 2400000000000,
  volume: 45200000,
  chart: generateMockChart()
});

const generateMockNews = (limit: number): NewsItem[] => {
  const headlines = [
    'Market Rally Continues as Tech Stocks Surge',
    'Fed Signals Potential Rate Cuts Ahead',
    'Earnings Season Beats Expectations',
    'Oil Prices Rise on Supply Concerns',
    'AI Stocks Lead Market Gains'
  ];
  
  return Array.from({ length: limit }, (_, i) => ({
    id: `news-${i}`,
    title: headlines[i % headlines.length],
    summary: 'Market analysis and financial news update covering recent developments.',
    url: '#',
    source: 'Market News',
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any
  }));
};

const generateMockSignals = (): TechnicalSignal[] => [
  { indicator: 'RSI', value: 68.5, signal: 'hold', confidence: 75, description: 'Approaching overbought conditions' },
  { indicator: 'MACD', value: 2.34, signal: 'buy', confidence: 82, description: 'Bullish crossover detected' },
  { indicator: 'Moving Average', value: 185.23, signal: 'buy', confidence: 68, description: 'Price above 50-day MA' }
];

const generateMockSentiment = (): SentimentData => ({
  overall: 65,
  social: 75,
  news: 60,
  trading: 85,
  technical: 45,
  options: 70,
  bullPercent: 68,
  neutralPercent: 17,
  bearPercent: 15
});

const generateMockInsights = (): AIInsight[] => [
  {
    type: 'buy',
    title: 'Strong Buy Signal',
    description: 'Technical indicators suggest a potential upward trend in the next 24-48 hours.',
    confidence: 85,
    timeframe: '24-48 hours'
  },
  {
    type: 'alert',
    title: 'Volatility Alert',
    description: 'Increased market volatility detected. Consider adjusting stop losses.',
    confidence: 75,
    timeframe: 'Current'
  },
  {
    type: 'rotation',
    title: 'Sector Rotation',
    description: 'Capital flowing from tech to healthcare sector. Watch for opportunities.',
    confidence: 65,
    timeframe: 'Next week'
  }
];

// Custom hooks for real-time data
export const useStockData = (symbol: string, refreshInterval: number = 30000) => {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const stockData = await fetchStockData(symbol);
      setData(stockData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

export const useMarketData = (refreshInterval: number = 30000) => {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const marketData = await fetchMarketData();
      setData(marketData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

export const useNews = (limit: number = 10, refreshInterval: number = 300000) => {
  const [data, setData] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const newsData = await fetchNews(limit);
      setData(newsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
};

// Search functionality
export const searchStocks = async (query: string): Promise<StockData[]> => {
  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&limit=10`);
    if (!response.ok) throw new Error('Search failed');
    const data = await response.json();
    
    if (Array.isArray(data)) {
      return data.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        price: parseFloat(item.price || 0),
        change: parseFloat(item.change || 0),
        changePercent: parseFloat(item.changePercent || 0),
        volume: parseInt(item.volume || 0),
        marketCap: parseInt(item.marketCap || 0),
        high52w: parseFloat(item.high52w || 0),
        low52w: parseFloat(item.low52w || 0),
        lastUpdated: new Date().toISOString()
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Search error:', error);
    // Return mock search results
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 182.89, change: 2.15, changePercent: 1.23, volume: 45000000, marketCap: 2800000000000, high52w: 198.23, low52w: 123.45, lastUpdated: new Date().toISOString() },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 337.20, change: -1.52, changePercent: -0.45, volume: 25000000, marketCap: 2500000000000, high52w: 384.30, low52w: 245.18, lastUpdated: new Date().toISOString() },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', price: 131.86, change: 0.75, changePercent: 0.57, volume: 18000000, marketCap: 1600000000000, high52w: 151.55, low52w: 83.34, lastUpdated: new Date().toISOString() },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 127.12, change: -0.89, changePercent: -0.69, volume: 35000000, marketCap: 1300000000000, high52w: 170.00, low52w: 101.26, lastUpdated: new Date().toISOString() },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 421.01, change: 8.45, changePercent: 2.05, volume: 55000000, marketCap: 1000000000000, high52w: 502.66, low52w: 180.96, lastUpdated: new Date().toISOString() },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.21, changePercent: -1.27, volume: 42000000, marketCap: 800000000000, high52w: 299.29, low52w: 138.80, lastUpdated: new Date().toISOString() },
      { symbol: 'META', name: 'Meta Platforms Inc.', price: 295.89, change: 1.23, changePercent: 0.42, volume: 28000000, marketCap: 750000000000, high52w: 384.33, low52w: 224.91, lastUpdated: new Date().toISOString() }
    ];
    
    return mockResults.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
  }
}; 