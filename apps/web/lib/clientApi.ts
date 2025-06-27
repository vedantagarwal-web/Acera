// Simple fetch helper with 30-second in-memory cache
// Usage: const data = await apiGET('/api/market/quote?symbol=TCS');

const CACHE: Record<string, { data: any; ts: number }> = {};
const TTL = 30_000; // 30 seconds

export async function apiGET<T>(url: string): Promise<T> {
  const now = Date.now();
  if (CACHE[url] && now - CACHE[url].ts < TTL) {
    return CACHE[url].data as T;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as T;
  CACHE[url] = { data: json, ts: now };
  return json;
} 