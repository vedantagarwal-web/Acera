"use client";

import { useState, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useWidgetStore, type WidgetType } from '@/lib/store';

const Skeleton = () => (
  <div className="h-full w-full animate-pulse bg-white/5 rounded-lg" />
);

// Dynamic widget imports (client-only)
const MarketOverview = dynamic(() => import('@/components/widgets/MarketOverview').then(m => m.MarketOverview), { ssr: false, loading: () => <Skeleton /> });
const PortfolioPerformance = dynamic(() => import('@/components/widgets/PortfolioPerformance').then(m => m.PortfolioPerformance), { ssr: false, loading: () => <Skeleton /> });
const AiInsights = dynamic(() => import('@/components/widgets/AiInsights').then(m => m.AiInsights), { ssr: false, loading: () => <Skeleton /> });
const NewsFeed = dynamic(() => import('@/components/widgets/NewsFeed').then(m => m.NewsFeed), { ssr: false, loading: () => <Skeleton /> });
const Watchlist = dynamic(() => import('@/components/widgets/Watchlist').then(m => m.Watchlist), { ssr: false, loading: () => <Skeleton /> });
const OrderBook = dynamic(() => import('@/components/widgets/OrderBook').then(m => m.OrderBook), { ssr: false, loading: () => <Skeleton /> });
const SentimentAnalysis = dynamic(() => import('@/components/widgets/SentimentAnalysis').then(m => m.SentimentAnalysis), { ssr: false, loading: () => <Skeleton /> });
const MarketSignals = dynamic(() => import('@/components/widgets/MarketSignals').then(m => m.MarketSignals), { ssr: false, loading: () => <Skeleton /> });
const TechnicalAnalysis = dynamic(() => import('@/components/widgets/TechnicalAnalysis').then(m => m.TechnicalAnalysis), { ssr: false, loading: () => <Skeleton /> });

const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType> = {
  'market-overview': MarketOverview,
  'portfolio-performance': PortfolioPerformance,
  'ai-insights': AiInsights,
  'news-feed': NewsFeed,
  'watchlist': Watchlist,
  'order-book': OrderBook,
  'sentiment-analysis': SentimentAnalysis,
  'market-signals': MarketSignals,
  'technical-analysis': TechnicalAnalysis,
};

const WIDGET_SIZES: Record<WidgetType, string> = {
  'market-overview': 'col-span-1 md:col-span-2 row-span-2',
  'portfolio-performance': 'col-span-1 md:col-span-2 row-span-2',
  'ai-insights': 'col-span-1 row-span-3',
  'news-feed': 'col-span-full row-span-4',
  'watchlist': 'col-span-1 row-span-3',
  'order-book': 'col-span-1 md:col-span-2 row-span-2',
  'sentiment-analysis': 'col-span-1 row-span-2',
  'market-signals': 'col-span-1 row-span-2',
  'technical-analysis': 'col-span-full md:col-span-2 row-span-4',
};

// Sortable wrapper
const SortableWidget = memo(function SortableWidget({ widgetType }: { widgetType: WidgetType }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: widgetType });
  const style = { transform: CSS.Transform.toString(transform), transition } as React.CSSProperties;
  const WidgetComponent = WIDGET_COMPONENTS[widgetType];
  if (!WidgetComponent) return null;

  return (
    <div ref={setNodeRef} style={style} className={cn(WIDGET_SIZES[widgetType], isDragging && 'opacity-50')} {...attributes}>
      <div className="relative h-full group">
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing" {...listeners}>
          <GripVertical className="w-4 h-4 text-white/40" />
        </div>
        <div className="h-full rounded-xl bg-white/5 backdrop-blur-md border border-white/10 p-4 transition-colors hover:border-white/20">
          <WidgetComponent />
        </div>
      </div>
    </div>
  );
});

export default function LegendDashboard() {
  const { activeWidgets, reorderWidgets } = useWidgetStore();
  const [dragKey, setDragKey] = useState(0); // force rerender grid when list changes

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = activeWidgets.findIndex((w) => w === active.id);
      const newIndex = activeWidgets.findIndex((w) => w === over.id);
      reorderWidgets(arrayMove(activeWidgets, oldIndex, newIndex));
      setDragKey((k) => k + 1);
    }
  }, [activeWidgets, reorderWidgets]);

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext key={dragKey} items={activeWidgets} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-6 w-full">
          {activeWidgets.map((w) => (
            <SortableWidget key={w} widgetType={w} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
} 