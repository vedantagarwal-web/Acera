// Acera Trading Platform - Client API
// Professional Bloomberg Terminal-style client for market data using Tiingo API
// Built for institutional-grade retail investing with real-time data and AI analysis

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: string;
  source: string;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high52w?: number;
  low52w?: number;
  lastUpdated: string;
  source: string;
}

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  tags: string[];
  sentiment?: string;
}

interface StockDetails {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  description: string;
  exchange: string;
  currency: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  marketCap: number;
  employees?: number;
  website?: string;
  peRatio?: number;
  pegRatio?: number;
  eps?: number;
  beta?: number;
  dividendYield?: number;
  high52Week?: number;
  low52Week?: number;
  analystCoverage: any;
  chartData: ChartDataPoint[];
  news: NewsItem[];
  lastUpdated: string;
  source: string;
  dataProvider: string;
}

class AceraAPI {
  private baseURL: string;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
  }

  private async makeRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Search for stocks by symbol or company name
  async searchStocks(query: string, limit: number = 10): Promise<StockSearchResult[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const results = await this.makeRequest<StockSearchResult[]>(
        `/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );
      return results || [];
    } catch (error) {
      console.error('Stock search failed:', error);
      return [];
    }
  }

  // Get real-time quote for a stock
  async getStockQuote(symbol: string): Promise<StockQuote | null> {
    try {
      return await this.makeRequest<StockQuote>(`/quote/${symbol.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to get quote for ${symbol}:`, error);
      return null;
    }
  }

  // Get detailed stock information
  async getStockDetails(symbol: string): Promise<StockDetails | null> {
    try {
      return await this.makeRequest<StockDetails>(`/stocks/${symbol.toUpperCase()}`);
    } catch (error) {
      console.error(`Failed to get details for ${symbol}:`, error);
      return null;
    }
  }

  // Get chart data for a stock
  async getStockChart(
    symbol: string,
    interval: string = '5min',
    period: string = '1day'
  ): Promise<{ symbol: string; interval: string; period: string; data: ChartDataPoint[]; source: string } | null> {
    try {
      return await this.makeRequest(
        `/stocks/${symbol.toUpperCase()}/chart?interval=${interval}&period=${period}`
      );
    } catch (error) {
      console.error(`Failed to get chart data for ${symbol}:`, error);
      return null;
    }
  }

  // Get news for a specific stock
  async getStockNews(symbol: string, limit: number = 20): Promise<{ symbol: string; news: NewsItem[]; count: number; source: string } | null> {
    try {
      return await this.makeRequest(
        `/stocks/${symbol.toUpperCase()}/news?limit=${limit}`
      );
    } catch (error) {
      console.error(`Failed to get news for ${symbol}:`, error);
      return null;
    }
  }

  // Get market overview data
  async getMarketOverview(): Promise<any> {
    try {
      return await this.makeRequest('/market/overview');
    } catch (error) {
      console.error('Failed to get market overview:', error);
      return null;
    }
  }

  // Get top movers (gainers/losers)
  async getTopMovers(): Promise<any> {
    try {
      return await this.makeRequest('/market/top-movers');
    } catch (error) {
      console.error('Failed to get top movers:', error);
      return null;
    }
  }

  // Get general financial news
  async getNews(limit: number = 20): Promise<NewsItem[]> {
    try {
      const response = await this.makeRequest<{ articles: NewsItem[] }>(`/news?limit=${limit}`);
      return response.articles || [];
    } catch (error) {
      console.error('Failed to get news:', error);
      return [];
    }
  }

  // Health check
  async healthCheck(): Promise<any> {
    try {
      return await this.makeRequest('/health');
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }
}

// Create singleton instance
export const aceraAPI = new AceraAPI();

// Export types for use in components
export type {
  StockQuote,
  StockSearchResult,
  StockDetails,
  ChartDataPoint,
  NewsItem
};

// Export the API class for custom instances
export default AceraAPI; 