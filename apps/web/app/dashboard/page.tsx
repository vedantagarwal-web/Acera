'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Widget } from '@/components/ui/widget';
import { WidgetDialog } from '@/components/ui/widget-dialog';
import { useWidgetStore, type WidgetType } from '@/lib/store';
import { Settings, Plus } from 'lucide-react';

// Widget Components
import { MarketOverview } from '@/components/widgets/MarketOverview';
import { PortfolioPerformance } from '@/components/widgets/PortfolioPerformance';
import { AiInsights } from '@/components/widgets/AiInsights';
import { NewsFeed } from '@/components/widgets/NewsFeed';
import { Watchlist } from '@/components/widgets/Watchlist';
import { OrderBook } from '@/components/widgets/OrderBook';
import { SentimentAnalysis } from '@/components/widgets/SentimentAnalysis';
import { MarketSignals } from '@/components/widgets/MarketSignals';

const widgetComponents: Record<WidgetType, React.ComponentType> = {
  'market-overview': MarketOverview,
  'portfolio-performance': PortfolioPerformance,
  'ai-insights': AiInsights,
  'news-feed': NewsFeed,
  'watchlist': Watchlist,
  'order-book': OrderBook,
  'sentiment-analysis': SentimentAnalysis,
  'market-signals': MarketSignals,
};

const widgetTitles: Record<WidgetType, string> = {
  'market-overview': 'Market Overview',
  'portfolio-performance': 'Portfolio Performance',
  'ai-insights': 'AI Insights',
  'news-feed': 'News Feed',
  'watchlist': 'Watchlist',
  'order-book': 'Order Book',
  'sentiment-analysis': 'Sentiment Analysis',
  'market-signals': 'Market Signals',
};

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { activeWidgets, theme, reorderWidgets, removeWidget } = useWidgetStore();

  useEffect(() => {
    document.body.style.background = theme.background;
    return () => {
      document.body.style.background = '';
    };
  }, [theme.background]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = activeWidgets.indexOf(active.id as WidgetType);
      const newIndex = activeWidgets.indexOf(over.id as WidgetType);
      reorderWidgets(arrayMove(activeWidgets, oldIndex, newIndex));
    }
  }

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDialogOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <Plus className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              <Settings className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={activeWidgets}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWidgets.map((widgetId) => {
                const WidgetComponent = widgetComponents[widgetId];
                return (
                  <Widget
                    key={widgetId}
                    id={widgetId}
                    title={widgetTitles[widgetId]}
                    onRemove={() => removeWidget(widgetId)}
                  >
                    <WidgetComponent />
                  </Widget>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <WidgetDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
} 