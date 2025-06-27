'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  DollarSign, 
  BarChart3, 
  Users, 
  Star,
  Bell,
  Search,
  Plus,
  Settings,
  Eye,
  Activity
} from 'lucide-react';
import Link from 'next/link';

// Mock data - In real app, this would come from APIs
const portfolioData = {
  totalValue: 52847.23,
  dayChange: 1247.89,
  dayChangePercent: 2.42,
  positions: [
    { symbol: 'AAPL', shares: 12, currentPrice: 182.52, dayChange: 2.1, value: 2190.24 },
    { symbol: 'MSFT', shares: 8, currentPrice: 378.85, dayChange: -1.2, value: 3030.80 },
    { symbol: 'GOOGL', shares: 15, currentPrice: 142.87, dayChange: 3.4, value: 2143.05 },
    { symbol: 'TSLA', shares: 5, currentPrice: 248.42, dayChange: -2.8, value: 1242.10 },
    { symbol: 'NVDA', shares: 20, currentPrice: 875.28, dayChange: 4.2, value: 17505.60 },
  ]
};

const marketData = [
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 485.23, change: 1.2, volume: '2.4M' },
  { symbol: 'QQQ', name: 'NASDAQ ETF', price: 412.67, change: 2.1, volume: '1.8M' },
  { symbol: 'IWM', name: 'Russell 2000', price: 201.45, change: -0.8, volume: '890K' },
];

const aiInsights = [
  {
    stock: 'AAPL',
    analyst: 'Sarah Chen',
    recommendation: 'BUY',
    confidence: 85,
    reason: 'Strong iPhone 15 sales and AI integration potential',
    targetPrice: 195.00
  },
  {
    stock: 'MSFT',
    analyst: 'Marcus Rodriguez',
    recommendation: 'HOLD',
    confidence: 72,
    reason: 'Cloud growth slowing but AI investments promising',
    targetPrice: 385.00
  },
  {
    stock: 'GOOGL',
    analyst: 'Sarah Chen',
    recommendation: 'BUY',
    confidence: 91,
    reason: 'AI leadership and search dominance remain strong',
    targetPrice: 155.00
  }
];

const newsItems = [
  {
    title: 'Fed Signals Rate Cuts Ahead as Inflation Cools',
    time: '2 hours ago',
    sentiment: 'positive'
  },
  {
    title: 'Tech Earnings Beat Expectations Across the Board',
    time: '4 hours ago',
    sentiment: 'positive'
  },
  {
    title: 'Oil Prices Surge on Supply Concerns',
    time: '6 hours ago',
    sentiment: 'neutral'
  }
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation */}
      <nav className="glass-nav sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Acera
              </span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-white font-medium">Portfolio</Link>
              <Link href="/terminal" className="text-gray-400 hover:text-white transition-colors">Terminal</Link>
              <Link href="/screener" className="text-gray-400 hover:text-white transition-colors">Screener</Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search stocks..."
                className="pl-10 pr-4 py-2 rounded-lg glass border-none bg-white/10 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:outline-none"
              />
            </div>
            <button className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg glass hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Portfolio Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-card p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Good morning, Trader</h1>
                <p className="text-gray-400">Here's your portfolio performance today</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <button className="btn-robinhood">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Funds
                </button>
                <button className="px-6 py-3 rounded-xl glass hover:bg-white/10 text-white font-medium transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  Watch
                </button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
                <div className="text-3xl font-bold text-white portfolio-value">
                  ${portfolioData.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className={`flex items-center mt-2 ${portfolioData.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolioData.dayChange >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  <span className="stock-price">
                    ${Math.abs(portfolioData.dayChange).toLocaleString('en-US', { minimumFractionDigits: 2 })} ({portfolioData.dayChangePercent >= 0 ? '+' : '-'}{Math.abs(portfolioData.dayChangePercent)}%)
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Today</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Buying Power</div>
                <div className="text-xl font-semibold text-white">$12,847.50</div>
                <div className="text-xs text-gray-500 mt-1">Available</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-400 mb-1">Day's Performance</div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-green-400 mr-1" />
                    <span className="text-sm text-green-400">85% gains</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="w-4 h-4 text-red-400 mr-1" />
                    <span className="text-sm text-red-400">15% losses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Holdings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Holdings</h2>
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View All
                </button>
              </div>
              
              <div className="space-y-4">
                {portfolioData.positions.map((position) => (
                  <div key={position.symbol} className="flex items-center justify-between p-4 rounded-xl glass hover:bg-white/5 transition-colors card-hover">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-bold text-sm">{position.symbol.charAt(0)}</span>
                      </div>
                      <div>
                        <div className="font-medium text-white">{position.symbol}</div>
                        <div className="text-sm text-gray-400">{position.shares} shares</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-white stock-price">
                        ${position.currentPrice.toFixed(2)}
                      </div>
                      <div className={`text-sm ${position.dayChange >= 0 ? 'stock-change-positive' : 'stock-change-negative'}`}>
                        {position.dayChange >= 0 ? '+' : ''}{position.dayChange}%
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-white">
                        ${position.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Market Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Market Overview</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {marketData.map((market) => (
                  <div key={market.symbol} className="p-4 rounded-xl glass-dark">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{market.symbol}</span>
                      <span className={`text-sm ${market.change >= 0 ? 'stock-change-positive' : 'stock-change-negative'}`}>
                        {market.change >= 0 ? '+' : ''}{market.change}%
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-white stock-price">
                      ${market.price.toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Vol: {market.volume}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <div className="flex items-center mb-4">
                <Brain className="w-5 h-5 text-blue-400 mr-2" />
                <h3 className="text-lg font-semibold text-white">AI Insights</h3>
              </div>
              
              <div className="space-y-4">
                {aiInsights.map((insight) => (
                  <div key={insight.stock} className="p-4 rounded-xl glass-dark">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-white">{insight.stock}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        insight.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                        insight.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {insight.recommendation}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{insight.reason}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">by {insight.analyst}</span>
                      <span className="text-blue-400">${insight.targetPrice.toFixed(2)} target</span>
                    </div>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white">{insight.confidence}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full transition-all duration-1000"
                          style={{ width: `${insight.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* News Feed */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-white mb-4">Latest News</h3>
              
              <div className="space-y-4">
                {newsItems.map((item, index) => (
                  <div key={index} className="pb-4 border-b border-gray-700 last:border-b-0">
                    <h4 className="text-sm font-medium text-white mb-1 leading-tight">
                      {item.title}
                    </h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400">{item.time}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        item.sentiment === 'positive' ? 'bg-green-400' :
                        item.sentiment === 'negative' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
} 