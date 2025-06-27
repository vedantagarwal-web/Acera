import { NextResponse } from 'next/server';
import { getAiInsights } from '@/lib/openai';
import { getMarketNews } from '@/lib/exa';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    // Fetch stock data (mock for now)
    const stockData = {
      price: 182.45,
      change: 2.34,
      volume: '45.2M',
      marketCap: '$2.4T',
      pe: 28.5,
      dividend: '0.88%',
      high52: 198.23,
      low52: 123.45,
    };

    // Get AI insights
    const insights = await getAiInsights(symbol, stockData);

    // Get market news
    const news = await getMarketNews(`${symbol} stock market news`);

    return NextResponse.json({
      symbol,
      data: stockData,
      insights,
      news
    });
  } catch (error) {
    console.error('Error in stock API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
} 