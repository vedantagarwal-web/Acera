import { NextRequest } from 'next/server';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000';
export async function GET(req: NextRequest) {
  const backendURL = `${BACKEND}/api/top-movers`;
  const res = await fetch(backendURL, { cache: 'no-store' });
  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: res.status,
  });
} 