'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SimpleChart } from '../charts/SimpleChart';
import { SearchBar } from '../SearchBar';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

interface TradingChartProps {
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  accentColor?: string;
  availableHeight?: number;
}

interface ChartData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function TradingChart({ 
  isExpanded = false, 
  onToggleExpanded, 
  accentColor = 'blue',
  availableHeight = 400 
}: TradingChartProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('HOOD');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState('1D');

  // Fetch chart data for selected symbol
  const fetchChartData = async (symbol: string, interval: string = '1D') => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch stock details
      const stockResponse = await fetch(`http://127.0.0.1:8000/api/stocks/${symbol}`);
      if (!stockResponse.ok) throw new Error('Failed to fetch stock data');
      const stockData = await stockResponse.json();
      setStockInfo(stockData);

      // Generate mock chart data for now (replace with real API)
      const mockChartData = generateMockChartData(stockData.price || 100, 100);
      setChartData(mockChartData);
      
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
      
      // Generate fallback data
      const fallbackData = generateMockChartData(100 + Math.random() * 200, 100);
      setChartData(fallbackData);
      setStockInfo({
        symbol: symbol,
        name: `${symbol} Inc.`,
        price: fallbackData[fallbackData.length - 1].close,
        change: Math.random() * 10 - 5,
        changePercent: (Math.random() - 0.5) * 5
      });
    } finally {
      setLoading(false);
    }
  };

  // Generate realistic mock chart data
  const generateMockChartData = (basePrice: number, points: number): ChartData[] => {
    const data: ChartData[] = [];
    let price = basePrice;
    const now = new Date();
    
    for (let i = points; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5 * 60 * 1000); // 5-minute intervals
      
      // Generate realistic price movement
      const change = (Math.random() - 0.5) * 0.02; // ±1% change
      price = price * (1 + change);
      
      const open = price;
      const volatility = 0.005; // 0.5% volatility
      const high = open * (1 + Math.random() * volatility);
      const low = open * (1 - Math.random() * volatility);
      const close = low + Math.random() * (high - low);
      const volume = Math.floor(Math.random() * 5000000) + 1000000;
      
      data.push({
        time: time.toISOString(),
        open,
        high,
        low,
        close,
        volume
      });
      
      price = close; // Set price for next iteration
    }
    
    return data;
  };

  // Load default symbol on mount
  useEffect(() => {
    fetchChartData(selectedSymbol, timeframe);
  }, [selectedSymbol, timeframe]);

  // Handle symbol selection from search
  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    fetchChartData(selectedSymbol, newTimeframe);
  };

  const chartHeight = isExpanded ? availableHeight - 120 : 300;

  const currentPrice = stockInfo?.price || 0;
  const priceChange = stockInfo?.change || 0;
  const priceChangePercent = stockInfo?.changePercent || 0;

  return (
    <motion.div 
      className={`glass-card border border-white/10 rounded-xl ${
        isExpanded ? 'fixed inset-4 z-50' : 'h-full'
      }`}
      layout
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <BarChart3 className={`w-5 h-5 text-${accentColor}-500`} />
            <h3 className="font-semibold text-white">Trading Chart</h3>
          </div>
          
          {/* Symbol and Price Info */}
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-white">{selectedSymbol}</span>
            {stockInfo && (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <div className={`flex items-center gap-1 ${
                  priceChange >= 0 ? 'text-emerald-500' : 'text-red-500'
                }`}>
                  {priceChange >= 0 ? 
                    <TrendingUp className="w-4 h-4" /> : 
                    <TrendingDown className="w-4 h-4" />
                  }
                  <span className="text-sm">
                    {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="hidden md:block">
            <SearchBar 
              accentColor={accentColor}
              className="w-48"
              onSymbolSelect={handleSymbolSelect}
            />
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => fetchChartData(selectedSymbol, timeframe)}
            disabled={loading}
            className={`p-2 rounded-lg glass border border-white/10 text-gray-400 hover:text-white transition-colors ${
              loading ? 'animate-spin' : ''
            }`}
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Expand/Collapse Button */}
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="p-2 rounded-lg glass border border-white/10 text-gray-400 hover:text-white transition-colors"
              title={isExpanded ? "Minimize" : "Maximize"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden p-4 border-b border-white/10">
        <SearchBar 
          accentColor={accentColor}
          onSymbolSelect={handleSymbolSelect}
        />
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-white text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Loading {selectedSymbol} data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 text-center">
            <div className="text-red-400 text-sm mb-2">{error}</div>
            <button
              onClick={() => fetchChartData(selectedSymbol, timeframe)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Retry
            </button>
          </div>
        )}

        {chartData.length > 0 && (
          <SimpleChart
            symbol={selectedSymbol}
            data={chartData}
            interval={timeframe}
            height={chartHeight}
            showVolume={true}
            showTechnicals={isExpanded}
            className="w-full"
          />
        )}
      </div>

      {/* Footer with additional info */}
      {stockInfo && !isExpanded && (
        <div className="p-4 border-t border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-gray-400">Volume</div>
              <div className="text-white font-medium">
                {(chartData[chartData.length - 1]?.volume / 1000000).toFixed(1)}M
              </div>
            </div>
            <div>
              <div className="text-gray-400">Market Cap</div>
              <div className="text-white font-medium">
                ${(stockInfo.marketCap / 1000000000).toFixed(1)}B
              </div>
            </div>
            <div>
              <div className="text-gray-400">52W High</div>
              <div className="text-white font-medium">
                ${stockInfo.high52Week?.toFixed(2) || '--'}
              </div>
            </div>
            <div>
              <div className="text-gray-400">52W Low</div>
              <div className="text-white font-medium">
                ${stockInfo.low52Week?.toFixed(2) || '--'}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
} 