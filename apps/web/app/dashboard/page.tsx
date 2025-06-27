'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Plus,
  Settings,
  Grid,
  Eye,
  Bell,
  Search,
  Maximize2,
  Minimize2
} from 'lucide-react';
import Link from 'next/link';

// Import all our widgets with named imports
import { MarketOverview } from '../../components/widgets/MarketOverview';
import { AiInsights } from '../../components/widgets/AiInsights';
import { NewsFeed } from '../../components/widgets/NewsFeed';
import { PortfolioPerformance } from '../../components/widgets/PortfolioPerformance';
import { MarketSignals } from '../../components/widgets/MarketSignals';
import { SentimentAnalysis } from '../../components/widgets/SentimentAnalysis';
import { Watchlist } from '../../components/widgets/Watchlist';
import { OrderBook } from '../../components/widgets/OrderBook';

// Widget configuration for the dashboard
const availableWidgets = [
  { id: 'market-overview', component: MarketOverview, title: 'Market Overview', size: 'large' },
  { id: 'ai-insights', component: AiInsights, title: 'AI Insights', size: 'medium' },
  { id: 'news-feed', component: NewsFeed, title: 'Market News', size: 'medium' },
  { id: 'portfolio', component: PortfolioPerformance, title: 'Portfolio', size: 'large' },
  { id: 'signals', component: MarketSignals, title: 'Market Signals', size: 'small' },
  { id: 'sentiment', component: SentimentAnalysis, title: 'Sentiment Analysis', size: 'small' },
  { id: 'watchlist', component: Watchlist, title: 'Watchlist', size: 'medium' },
  { id: 'orderbook', component: OrderBook, title: 'Order Book', size: 'small' },
];

const defaultLayout = [
  'market-overview',
  'portfolio', 
  'ai-insights',
  'news-feed',
  'watchlist',
  'signals',
  'sentiment',
  'orderbook'
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(defaultLayout);
  const [isCustomizing, setIsCustomizing] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getWidgetComponent = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget) return null;
    
    const Component = widget.component;
    return (
      <div key={widgetId} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{widget.title}</h3>
          <button className="text-white/50 hover:text-white/70 transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
        <Component />
      </div>
    );
  };

  const getGridColSpan = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    switch (widget?.size) {
      case 'large': return 'col-span-2';
      case 'medium': return 'col-span-1';
      case 'small': return 'col-span-1';
      default: return 'col-span-1';
    }
  };

  const toggleWidget = (widgetId: string) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    } else {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Robinhood Legend Style Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
                  Acera
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  className="pl-10 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:outline-none transition-all"
                />
              </div>
              
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`p-2 rounded-xl backdrop-blur border border-white/20 transition-all ${
                  isCustomizing ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              
              <button className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-gray-400 hover:text-white transition-all">
                <Bell className="w-5 h-5" />
              </button>
              
              <button className="p-2 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-gray-400 hover:text-white transition-all">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                Trading Dashboard
              </h1>
              <p className="text-gray-400">AI-powered insights for smart trading decisions</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold hover:from-indigo-600 hover:to-emerald-600 transition-all shadow-lg shadow-indigo-500/25">
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </button>
            </div>
          </div>
        </motion.div>

        {/* Widget Customization Panel */}
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8 p-6 rounded-2xl bg-white/5 backdrop-blur border border-white/10"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Customize Your Dashboard</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    activeWidgets.includes(widget.id)
                      ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {widget.title}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Widgets Grid - Robinhood Legend Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {activeWidgets.map((widgetId, index) => (
            <motion.div
              key={widgetId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`${getGridColSpan(widgetId)} widget-container`}
            >
              <div className="h-full rounded-2xl bg-white/5 backdrop-blur border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-300 shadow-xl shadow-black/20">
                {getWidgetComponent(widgetId)}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {activeWidgets.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 rounded-full bg-white/5 backdrop-blur border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Grid className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Widgets Selected</h3>
            <p className="text-gray-400 mb-6">Add some widgets to personalize your dashboard</p>
            <button 
              onClick={() => setIsCustomizing(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-emerald-500 text-white font-semibold hover:from-indigo-600 hover:to-emerald-600 transition-all"
            >
              Customize Dashboard
            </button>
          </motion.div>
        )}
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .widget-container {
          min-height: 300px;
        }
        
        .widget-container:hover {
          transform: translateY(-2px);
        }
        
        @media (max-width: 1024px) {
          .col-span-2 {
            grid-column: span 1;
          }
        }
      `}</style>
    </div>
  );
} 