'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Settings } from 'lucide-react';
import { useWidgetStore, type WidgetType, type ThemeConfig } from '@/lib/store';

const availableWidgets: Array<{ id: WidgetType; name: string; description: string }> = [
  {
    id: 'market-overview',
    name: 'Market Overview',
    description: 'Real-time market data and key statistics'
  },
  {
    id: 'portfolio-performance',
    name: 'Portfolio Performance',
    description: 'Track your portfolio value and holdings'
  },
  {
    id: 'ai-insights',
    name: 'AI Insights',
    description: 'AI-powered market analysis and predictions'
  },
  {
    id: 'news-feed',
    name: 'News Feed',
    description: 'Latest market news and updates'
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    description: 'Track your favorite stocks'
  },
  {
    id: 'order-book',
    name: 'Order Book',
    description: 'Real-time order book data'
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Market sentiment indicators'
  },
  {
    id: 'market-signals',
    name: 'Market Signals',
    description: 'Technical analysis signals'
  },
];

const themePresets: ThemeConfig[] = [
  {
    background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #090909 100%)',
    primaryGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(37, 99, 235, 0.2))',
    secondaryGradient: 'linear-gradient(135deg, rgba(55, 65, 81, 0.2), rgba(17, 24, 39, 0.2))',
    accentColor: '#6366F1',
  },
  {
    background: 'radial-gradient(circle at 50% 50%, #0C1E13 0%, #090909 100%)',
    primaryGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(37, 99, 235, 0.2))',
    secondaryGradient: 'linear-gradient(135deg, rgba(55, 65, 81, 0.2), rgba(17, 24, 39, 0.2))',
    accentColor: '#10B981',
  },
  {
    background: 'radial-gradient(circle at 50% 50%, #1A1233 0%, #090909 100%)',
    primaryGradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
    secondaryGradient: 'linear-gradient(135deg, rgba(55, 65, 81, 0.2), rgba(17, 24, 39, 0.2))',
    accentColor: '#8B5CF6',
  },
];

interface WidgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WidgetDialog({ isOpen, onClose }: WidgetDialogProps) {
  const [tab, setTab] = useState<'add' | 'customize'>('add');
  const { activeWidgets, addWidget, updateTheme, theme } = useWidgetStore();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[80vh] overflow-auto rounded-xl bg-slate-900 shadow-lg"
      >
        <div className="sticky top-0 flex items-center justify-between p-4 bg-slate-900/95 backdrop-blur border-b border-white/10">
          <div className="flex gap-4">
            <button
              onClick={() => setTab('add')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                tab === 'add'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Widgets
            </button>
            <button
              onClick={() => setTab('customize')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                tab === 'customize'
                  ? 'bg-white/10 text-white'
                  : 'text-white/50 hover:text-white/70'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Customize
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <AnimatePresence mode="wait">
            {tab === 'add' ? (
              <motion.div
                key="add"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-2 gap-4"
              >
                {availableWidgets.map((widget) => {
                  const isActive = activeWidgets.includes(widget.id);
                  return (
                    <button
                      key={widget.id}
                      onClick={() => !isActive && addWidget(widget.id)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        isActive
                          ? 'border-white/20 bg-white/5 cursor-not-allowed'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <h3 className="font-medium text-white mb-1">{widget.name}</h3>
                      <p className="text-sm text-white/50">{widget.description}</p>
                    </button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="customize"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-sm font-medium text-white mb-4">Theme Presets</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {themePresets.map((preset, index) => (
                      <button
                        key={index}
                        onClick={() => updateTheme(preset)}
                        className={`h-24 rounded-lg border transition-colors ${
                          theme === preset
                            ? 'border-white/20'
                            : 'border-white/10 hover:border-white/20'
                        }`}
                        style={{ background: preset.primaryGradient }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-white mb-4">Custom Theme</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-white/70 mb-2">
                        Background
                      </label>
                      <input
                        type="text"
                        value={theme.background}
                        onChange={(e) => updateTheme({ background: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">
                        Primary Gradient
                      </label>
                      <input
                        type="text"
                        value={theme.primaryGradient}
                        onChange={(e) => updateTheme({ primaryGradient: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/70 mb-2">
                        Accent Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.accentColor}
                          onChange={(e) => updateTheme({ accentColor: e.target.value })}
                          className="w-12 h-12 rounded-lg bg-white/5 border border-white/10"
                        />
                        <input
                          type="text"
                          value={theme.accentColor}
                          onChange={(e) => updateTheme({ accentColor: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
} 