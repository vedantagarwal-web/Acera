import type { NextRequest } from 'next/server';

const EXA_ENDPOINT = 'https://api.exa.ai/search';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query =
    searchParams.get('q') ||
    'Indian stock market latest news site:moneycontrol.com OR site:economictimes.com';

  if (!process.env.EXA_API_KEY) {
    return new Response(JSON.stringify({ error: 'EXA_API_KEY not configured' }), {
      status: 500,
    });
  }

  const exaRes = await fetch(EXA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXA_API_KEY,
    },
    body: JSON.stringify({ query, type: 'keyword', num_results: 10, text: false }),
    // don't cache because news should be fresh
    cache: 'no-store',
  });

  const json = await exaRes.json();

  const simplified = (json.results || []).map((r: any) => ({
    title: r.title,
    url: r.url,
    publishedDate: r.publishedDate,
    snippet: r.text || r.summary,
    source: new URL(r.url).hostname.replace('www.', ''),
  }));

  return new Response(JSON.stringify({ data: simplified }), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
} 