import type { NextRequest } from 'next/server';

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const exchange = searchParams.get('exchange') || 'NSE';

  if (!symbol) {
    return new Response(JSON.stringify({ error: 'symbol required' }), {
      status: 400,
    });
  }

  const backendURL = `${BACKEND}/api/quote/${symbol}?exchange=${exchange}`;
  const res = await fetch(backendURL, { cache: 'no-store' });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: res.status,
  });
} 