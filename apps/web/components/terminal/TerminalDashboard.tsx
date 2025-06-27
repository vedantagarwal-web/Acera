"use client";
import dynamic from 'next/dynamic';

const QuoteStrip = dynamic(() => import('./widgets/QuoteStrip'), {
  ssr: false,
  loading: () => <div className="h-16 rounded-lg bg-zinc-800/50 animate-pulse" />,
});
const MarketOverview = dynamic(() => import('./widgets/MarketOverviewLite'), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg bg-zinc-800/50 animate-pulse" />,
});
const TopMovers = dynamic(() => import('./widgets/TopMovers'), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg bg-zinc-800/50 animate-pulse col-span-2" />,
});
const NewsFeed = dynamic(() => import('./widgets/NewsFeed'), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg bg-zinc-800/50 animate-pulse col-span-full" />,
});

export default function TerminalDashboard() {
  return (
    <>
      <QuoteStrip />
      <MarketOverview />
      <TopMovers />
      <NewsFeed />
    </>
  );
} 