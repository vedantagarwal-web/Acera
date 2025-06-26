import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 
  | 'market-overview'
  | 'portfolio-performance'
  | 'ai-insights'
  | 'news-feed'
  | 'watchlist'
  | 'order-book'
  | 'sentiment-analysis'
  | 'market-signals';

export type ThemeConfig = {
  background: string;
  primaryGradient: string;
  secondaryGradient: string;
  accentColor: string;
};

interface WidgetStore {
  activeWidgets: WidgetType[];
  theme: ThemeConfig;
  addWidget: (widget: WidgetType) => void;
  removeWidget: (widget: WidgetType) => void;
  reorderWidgets: (widgets: WidgetType[]) => void;
  updateTheme: (theme: Partial<ThemeConfig>) => void;
}

const defaultTheme: ThemeConfig = {
  background: 'radial-gradient(circle at 50% 50%, #0B1120 0%, #090909 100%)',
  primaryGradient: 'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(37, 99, 235, 0.2))',
  secondaryGradient: 'linear-gradient(135deg, rgba(55, 65, 81, 0.2), rgba(17, 24, 39, 0.2))',
  accentColor: '#6366F1',
};

export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set) => ({
      activeWidgets: ['market-overview', 'portfolio-performance', 'ai-insights', 'news-feed'],
      theme: defaultTheme,
      addWidget: (widget) =>
        set((state) => ({
          activeWidgets: [...state.activeWidgets, widget],
        })),
      removeWidget: (widget) =>
        set((state) => ({
          activeWidgets: state.activeWidgets.filter((w) => w !== widget),
        })),
      reorderWidgets: (widgets) =>
        set(() => ({
          activeWidgets: widgets,
        })),
      updateTheme: (theme) =>
        set((state) => ({
          theme: { ...state.theme, ...theme },
        })),
    }),
    {
      name: 'widget-store',
    }
  )
); 