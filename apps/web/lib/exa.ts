const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_API_URL = 'https://api.exa.ai/search';

export interface NewsItem {
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  summary: string;
}

export async function getMarketNews(query: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(EXA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${EXA_API_KEY}`
      },
      body: JSON.stringify({
        query,
        numResults: 10,
        source: 'news',
        useAutoprompt: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      publishedAt: result.publishedAt,
      source: result.source,
      summary: result.summary
    }));
  } catch (error) {
    console.error('Error fetching market news:', error);
    return [];
  }
} 