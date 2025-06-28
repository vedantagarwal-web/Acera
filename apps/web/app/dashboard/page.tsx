'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Plus,
  Settings,
  Grid,
  Eye,
  Bell,
  Search,
  Maximize2,
  Minimize2,
  Sparkles,
  Expand,
  Shrink,
  X
} from 'lucide-react';
import Link from 'next/link';

// Import all our widgets with named imports
import { SearchBar } from '../../components/SearchBar';
import { MarketOverview } from '../../components/widgets/MarketOverview';
import { AiInsights } from '../../components/widgets/AiInsights';
import { NewsFeed } from '../../components/widgets/NewsFeed';
import { PortfolioPerformance } from '../../components/widgets/PortfolioPerformance';
import { MarketSignals } from '../../components/widgets/MarketSignals';
import { SentimentAnalysis } from '../../components/widgets/SentimentAnalysis';
import { Watchlist } from '../../components/widgets/Watchlist';
import { OrderBook } from '../../components/widgets/OrderBook';
import { TradingChart } from '../../components/widgets/TradingChart';

// Widget configuration for the dashboard
const availableWidgets = [
  { id: 'market-overview', component: MarketOverview, title: 'Market Overview', size: 'large' },
  { id: 'trading-chart', component: TradingChart, title: 'Trading Chart', size: 'large' },
  { id: 'ai-insights', component: AiInsights, title: 'AI Insights', size: 'medium' },
  { id: 'portfolio', component: PortfolioPerformance, title: 'Portfolio', size: 'large' },
  { id: 'watchlist', component: Watchlist, title: 'Watchlist', size: 'medium' },
  { id: 'news-feed', component: NewsFeed, title: 'Market News', size: 'medium' },
  { id: 'signals', component: MarketSignals, title: 'Market Signals', size: 'small' },
  { id: 'sentiment', component: SentimentAnalysis, title: 'Sentiment Analysis', size: 'small' },
  { id: 'orderbook', component: OrderBook, title: 'Order Book', size: 'small' },
];

// Optimized layout for perfect viewport fit - only 6 widgets to ensure no scrolling
const defaultLayout = [
  'trading-chart',
  'portfolio', 
  'ai-insights',
  'watchlist',
  'signals',
  'sentiment'
];

// Dynamic background gradients based on market conditions and time
const getMarketGradient = () => {
  const hour = new Date().getHours();
  const isMarketHours = hour >= 9 && hour <= 16;
  const isAfterHours = hour > 16 || hour < 9;
  const isPreMarket = hour >= 4 && hour < 9;
  const isWeekend = [0, 6].includes(new Date().getDay());
  
  // Mock market data - in real app, this would come from API
  const marketSentiment = Math.random() > 0.5 ? 'bullish' : 'bearish'; // Dynamic for demo
  const volatility = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)];
  
  if (isWeekend) {
    // Weekend: Calm, sophisticated tones
    return 'from-slate-900 via-gray-800 to-slate-900';
  } else if (isPreMarket) {
    // Pre-market: Cool preparation mode
    if (volatility === 'high') {
      return 'from-slate-900 via-blue-900 via-red-900 to-slate-800';
    }
    return 'from-slate-900 via-blue-900 to-slate-800';
  } else if (isMarketHours) {
    // Market hours: Dynamic based on sentiment and volatility
    if (marketSentiment === 'bullish') {
      if (volatility === 'high') {
        return 'from-emerald-900 via-slate-900 via-amber-900 to-blue-900';
      } else if (volatility === 'medium') {
        return 'from-emerald-900 via-slate-900 to-blue-900';
      } else {
        return 'from-emerald-900 via-gray-900 to-slate-900';
      }
    } else if (marketSentiment === 'bearish') {
      if (volatility === 'high') {
        return 'from-red-900 via-slate-900 via-orange-900 to-gray-900';
      } else if (volatility === 'medium') {
        return 'from-red-900 via-slate-900 to-gray-900';
      } else {
        return 'from-red-900 via-gray-900 to-slate-900';
      }
    } else {
      // Neutral market
      return 'from-slate-900 via-gray-800 to-blue-900';
    }
  } else if (isAfterHours) {
    // After hours: Sophisticated wind-down
    if (volatility === 'high') {
      return 'from-gray-900 via-slate-800 via-red-900 to-blue-900';
    }
    return 'from-gray-900 via-slate-800 to-blue-900';
  }
  
  // Default: Professional dark gradient
  return 'from-slate-900 via-gray-900 to-slate-800';
};

// Get accent color based on market mood and time
const getAccentColor = () => {
  const hour = new Date().getHours();
  const isMarketHours = hour >= 9 && hour <= 16;
  const isPreMarket = hour >= 4 && hour < 9;
  
  // Mock market sentiment for demo
  const marketSentiment = Math.random() > 0.5 ? 'bullish' : 'bearish';
  
  if (isPreMarket) {
    return 'blue'; // Pre-market preparation
  } else if (isMarketHours) {
    return marketSentiment === 'bullish' ? 'emerald' : 'red'; // Active trading
  } else {
    return 'slate'; // After hours
  }
};

// Get market status and mood for UI elements
const getMarketStatus = () => {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = [0, 6].includes(day);
  
  if (isWeekend) {
    return { status: 'Weekend', color: 'gray-500', pulse: false };
  } else if (hour >= 4 && hour < 9) {
    return { status: 'Pre-Market', color: 'blue-500', pulse: true };
  } else if (hour >= 9 && hour <= 16) {
    return { status: 'Market Open', color: 'emerald-500', pulse: true };
  } else {
    return { status: 'After Hours', color: 'amber-500', pulse: true };
  }
};

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(defaultLayout);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [backgroundGradient, setBackgroundGradient] = useState('');
  const [accentColor, setAccentColor] = useState('blue');
  const [marketStatus, setMarketStatus] = useState({ status: 'Loading...', color: 'gray-500', pulse: false });
  const [viewportHeight, setViewportHeight] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);

  // Calculate available height dynamically
  const calculateAvailableHeight = () => {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const isMobile = vw < 768;
    const isFullscreenMode = !!document.fullscreenElement;
    
    // Adjust heights based on screen size and mode
    const navHeight = isFullscreenMode ? 50 : (isMobile ? 55 : 60);
    const statusHeight = isFullscreenMode ? 35 : (isMobile ? 40 : 45);
    const customizationHeight = isCustomizing ? (isMobile ? 60 : 70) : 0;
    const padding = isMobile ? 15 : 20;
    const safetyBuffer = isFullscreenMode ? 10 : (isMobile ? 15 : 20);
    
    const totalOverhead = navHeight + statusHeight + customizationHeight + padding + safetyBuffer;
    const available = vh - totalOverhead;
    
    setViewportHeight(vh);
    setAvailableHeight(Math.max(available, isMobile ? 300 : 400)); // Lower minimum for mobile
  };

  useEffect(() => {
    setMounted(true);
    setBackgroundGradient(getMarketGradient());
    setAccentColor(getAccentColor());
    setMarketStatus(getMarketStatus());
    
    // Calculate initial height
    calculateAvailableHeight();
    
    // Update gradient every 30 seconds for more dynamic feel
    const interval = setInterval(() => {
      setBackgroundGradient(getMarketGradient());
      setAccentColor(getAccentColor());
      setMarketStatus(getMarketStatus());
    }, 30000);
    
    // Handle resize events
    const handleResize = () => {
      calculateAvailableHeight();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [isCustomizing]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!mounted) return null;

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  };

  const getWidgetComponent = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (!widget) return null;
    
    const Component = widget.component;
    return (
      <div key={widgetId} className="p-1">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
            {widget.title}
            {widget.id === 'ai-insights' && <Sparkles className="w-3 h-3 text-amber-400" />}
            {widget.id === 'trading-chart' && <TrendingUp className="w-3 h-3 text-blue-400" />}
          </h3>
          <button 
            onClick={() => setExpandedWidget(widgetId)}
            className="p-0.5 rounded glass hover:bg-white/10 transition-all group"
            title="Expand widget"
          >
            <Maximize2 className="w-2.5 h-2.5 text-white/50 group-hover:text-white/70" />
          </button>
        </div>
        <Component />
      </div>
    );
  };

  const handleExpandedWidgetClose = () => {
    setExpandedWidget(null);
  };

  const handleNotificationToggle = () => {
    setNotifications(!notifications);
    // In a real app, this would update user preferences
    console.log('Notifications:', !notifications ? 'enabled' : 'disabled');
  };

  const handleSettings = () => {
    // In a real app, this would open settings modal
    console.log('Opening settings...');
    alert('Settings panel would open here');
  };

  const getGridColSpan = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    switch (widget?.size) {
      case 'large': return 'col-span-2'; // Large widgets take 2 columns
      case 'medium': return 'col-span-1'; // Medium widgets take 1 column
      case 'small': return 'col-span-1'; // Small widgets take 1 column
      default: return 'col-span-1';
    }
  };

  const toggleWidget = (widgetId: string) => {
    if (activeWidgets.includes(widgetId)) {
      setActiveWidgets(activeWidgets.filter(id => id !== widgetId));
    } else if (activeWidgets.length < 6) {
      setActiveWidgets([...activeWidgets, widgetId]);
    }
    // Silently ignore if trying to add more than 6 widgets
  };

  return (
    <div className={`h-screen bg-gradient-to-br ${backgroundGradient} overflow-hidden transition-all duration-1000 relative`}>
      {/* Subtle atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Professional Navigation */}
      <nav className="glass-nav border-b border-white/10">
        <div className="max-w-full px-4 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-xl bg-gradient-to-r from-${accentColor}-600 to-amber-500 flex items-center justify-center shadow-lg`}>
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span className={`text-lg font-heading font-bold bg-gradient-to-r from-${accentColor}-400 to-amber-400 bg-clip-text text-transparent`}>
                  Acera
                </span>
              </Link>
              
              <div className="text-xs text-gray-400 hidden md:block">
                Trading Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <SearchBar accentColor={accentColor} />
              
              <button 
                onClick={toggleFullscreen}
                className="p-2 rounded-lg glass text-gray-400 hover:text-white transition-all hover:scale-105"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
              </button>
              
              <button 
                onClick={() => setIsCustomizing(!isCustomizing)}
                className={`p-2 rounded-lg glass transition-all hover:scale-105 ${
                  isCustomizing ? `bg-${accentColor}-500/20 text-${accentColor}-400` : 'text-gray-400 hover:text-white'
                }`}
                title="Customize Dashboard"
              >
                <Grid className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleNotificationToggle}
                className={`p-2 rounded-lg glass transition-all hover:scale-105 ${
                  notifications ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                }`}
                title={notifications ? "Disable Notifications" : "Enable Notifications"}
              >
                <Bell className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleSettings}
                className="p-2 rounded-lg glass text-gray-400 hover:text-white transition-all hover:scale-105"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Compact Widget Customization Panel */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="glass-card mx-2 mt-0.5 mb-0.5 p-1.5 border-b"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Customize Widgets
              <span className="text-xs text-gray-400 ml-2">(Max 6)</span>
            </h3>
            <button 
              onClick={() => setIsCustomizing(false)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
            {availableWidgets.map((widget) => (
              <button
                key={widget.id}
                onClick={() => toggleWidget(widget.id)}
                className={`p-2 rounded-lg text-xs font-medium transition-all ${
                  activeWidgets.includes(widget.id)
                    ? `bg-gradient-to-r from-${accentColor}-600 to-amber-500 text-white shadow-lg`
                    : 'glass text-gray-300 hover:text-white'
                }`}
              >
                {widget.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Full Height Widget Grid - No Scroll */}
      <div 
        className="flex-1 overflow-hidden px-2 py-1"
        style={{ height: `${availableHeight}px` }}
      >
        <div className="h-full grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5">
          {activeWidgets.slice(0, 6).map((widgetId, index) => (
            <motion.div
              key={widgetId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.02 }}
              className={`${getGridColSpan(widgetId)} group`}
              style={{ 
                height: `${Math.floor(availableHeight / 2) - (mounted && window.innerWidth < 768 ? 6 : 8)}px`,
                maxHeight: `${Math.floor(availableHeight / 2) - (mounted && window.innerWidth < 768 ? 6 : 8)}px`
              }}
            >
              <div className="h-full glass-card overflow-hidden hover:shadow-lg hover:shadow-black/20 transition-all duration-300">
                {getWidgetComponent(widgetId)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Professional Status Bar */}
      <div className="glass-nav border-t border-white/10">
        <div className="max-w-full px-4 py-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full bg-${marketStatus.color} ${
                  marketStatus.pulse ? 'animate-pulse' : ''
                }`}></div>
                <span className="text-gray-400">{marketStatus.status}</span>
              </div>
              <div className="text-gray-400">
                S&P 500: <span className="text-emerald-400">+0.85%</span>
              </div>
              <div className="text-gray-400">
                NASDAQ: <span className="text-emerald-400">+1.23%</span>
              </div>
              <div className="text-gray-400">
                VIX: <span className="text-red-400">18.34</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-gray-400">
                Last updated: <span className="text-white">2 mins ago</span>
              </div>
              <div className="text-gray-400">
                API Status: <span className="text-emerald-400">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Widget Modal */}
      <AnimatePresence>
        {expandedWidget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleExpandedWidgetClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {availableWidgets.find(w => w.id === expandedWidget)?.title}
                </h2>
                <button
                  onClick={handleExpandedWidgetClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="min-h-96">
                {(() => {
                  const widget = availableWidgets.find(w => w.id === expandedWidget);
                  if (!widget) return null;
                  const Component = widget.component;
                  return <Component />;
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 