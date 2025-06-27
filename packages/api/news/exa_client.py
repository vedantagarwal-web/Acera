import os
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from functools import lru_cache

class ExaNewsClient:
    """
    High-performance Exa API client for financial news with intelligent filtering.
    Optimized for stock-specific and market news discovery.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('EXA_API_KEY', 'e94aefb6-d625-4a90-aad1-ab9f09b6ee3a')
        self.base_url = 'https://api.exa.ai'
        self.session = None
        
    async def _get_session(self):
        """Get or create aiohttp session"""
        if self.session is None:
            self.session = aiohttp.ClientSession(
                headers={
                    'x-api-key': self.api_key,
                    'Content-Type': 'application/json'
                }
            )
        return self.session
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make async request to Exa API"""
        session = await self._get_session()
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with session.post(url, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise Exception(f"Exa API request failed: {response.status} - {error_text}")
                
                result = await response.json()
                return result
                
        except Exception as e:
            print(f"Exa API request failed: {str(e)}")
            raise
    
    async def get_stock_news(self, symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get news specific to a stock symbol"""
        
        # Create targeted search query for the stock
        query = f"{symbol} stock earnings financial results quarterly report SEC filing"
        
        search_data = {
            "query": query,
            "type": "keyword",
            "useAutoprompt": True,
            "numResults": limit,
            "includeDomains": [
                "sec.gov",
                "investor.gov",
                "marketwatch.com",
                "bloomberg.com",
                "reuters.com",
                "cnbc.com",
                "yahoo.com",
                "fool.com",
                "seekingalpha.com",
                "benzinga.com",
                "businesswire.com",
                "prnewswire.com"
            ],
            "startPublishedDate": (datetime.now() - timedelta(days=30)).isoformat(),
            "endPublishedDate": datetime.now().isoformat(),
            "text": {
                "maxCharacters": 1000,
                "includeHtmlTags": False
            }
        }
        
        try:
            result = await self._make_request('search', search_data)
            
            # Process and filter results
            news_items = []
            for item in result.get('results', []):
                processed_item = self._process_news_item(item, symbol)
                if processed_item:
                    news_items.append(processed_item)
            
            # Sort by relevance and recency
            news_items.sort(key=lambda x: (x['relevance_score'], x['published_date']), reverse=True)
            
            return news_items[:limit]
            
        except Exception as e:
            print(f"Error fetching stock news for {symbol}: {str(e)}")
            return self._get_fallback_stock_news(symbol)
    
    async def get_market_news(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Get general market and economic news"""
        
        query = "stock market Federal Reserve interest rates inflation economic data GDP earnings"
        
        search_data = {
            "query": query,
            "type": "keyword",
            "useAutoprompt": True,
            "numResults": limit,
            "includeDomains": [
                "federalreserve.gov",
                "bloomberg.com",
                "reuters.com",
                "cnbc.com",
                "marketwatch.com",
                "wsj.com",
                "ft.com",
                "economist.com"
            ],
            "startPublishedDate": (datetime.now() - timedelta(days=7)).isoformat(),
            "endPublishedDate": datetime.now().isoformat(),
            "text": {
                "maxCharacters": 800,
                "includeHtmlTags": False
            }
        }
        
        try:
            result = await self._make_request('search', search_data)
            
            news_items = []
            for item in result.get('results', []):
                processed_item = self._process_news_item(item)
                if processed_item:
                    news_items.append(processed_item)
            
            return news_items[:limit]
            
        except Exception as e:
            print(f"Error fetching market news: {str(e)}")
            return self._get_fallback_market_news()
    
    async def get_sector_news(self, sector: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Get news for a specific sector"""
        
        sector_keywords = {
            'Technology': 'technology software AI artificial intelligence cloud computing',
            'Healthcare': 'healthcare biotech pharmaceutical medical devices FDA approval',
            'Financials': 'banking financial services fintech payments insurance',
            'Energy': 'oil gas renewable energy solar wind power utilities',
            'Consumer Discretionary': 'retail consumer spending e-commerce automotive',
            'Consumer Staples': 'food beverage consumer goods FMCG',
            'Industrials': 'manufacturing industrial aerospace defense',
            'Materials': 'materials commodities mining chemicals',
            'Real Estate': 'real estate REIT property commercial residential',
            'Communication Services': 'telecommunications media entertainment streaming'
        }
        
        keywords = sector_keywords.get(sector, sector)
        query = f"{keywords} earnings revenue growth market trends"
        
        search_data = {
            "query": query,
            "type": "keyword",
            "useAutoprompt": True,
            "numResults": limit,
            "startPublishedDate": (datetime.now() - timedelta(days=14)).isoformat(),
            "text": {
                "maxCharacters": 600,
                "includeHtmlTags": False
            }
        }
        
        try:
            result = await self._make_request('search', search_data)
            
            news_items = []
            for item in result.get('results', []):
                processed_item = self._process_news_item(item, sector=sector)
                if processed_item:
                    news_items.append(processed_item)
            
            return news_items[:limit]
            
        except Exception as e:
            print(f"Error fetching sector news for {sector}: {str(e)}")
            return self._get_fallback_sector_news(sector)
    
    async def get_earnings_news(self, symbol: str = None) -> List[Dict[str, Any]]:
        """Get earnings-related news"""
        
        if symbol:
            query = f"{symbol} earnings call quarterly results guidance outlook"
        else:
            query = "earnings season quarterly results earnings call guidance forecast"
        
        search_data = {
            "query": query,
            "type": "keyword",
            "useAutoprompt": True,
            "numResults": 20,
            "includeDomains": [
                "sec.gov",
                "marketwatch.com",
                "bloomberg.com",
                "reuters.com",
                "cnbc.com",
                "seekingalpha.com",
                "benzinga.com"
            ],
            "startPublishedDate": (datetime.now() - timedelta(days=7)).isoformat(),
            "text": {
                "maxCharacters": 1200,
                "includeHtmlTags": False
            }
        }
        
        try:
            result = await self._make_request('search', search_data)
            
            news_items = []
            for item in result.get('results', []):
                processed_item = self._process_news_item(item, symbol, category='earnings')
                if processed_item:
                    news_items.append(processed_item)
            
            return news_items
            
        except Exception as e:
            print(f"Error fetching earnings news: {str(e)}")
            return self._get_fallback_earnings_news(symbol)
    
    def _process_news_item(self, item: Dict[str, Any], symbol: str = None, sector: str = None, category: str = None) -> Dict[str, Any]:
        """Process and enrich news item with additional metadata"""
        
        title = item.get('title', '')
        text = item.get('text', '')
        url = item.get('url', '')
        published_date = item.get('publishedDate', '')
        
        # Calculate relevance score
        relevance_score = self._calculate_relevance_score(title, text, symbol, sector, category)
        
        # Extract key metrics and sentiment
        sentiment = self._analyze_sentiment(title, text)
        key_metrics = self._extract_key_metrics(text)
        
        # Determine news source credibility
        source = self._get_source_info(url)
        
        return {
            'title': title,
            'summary': text[:300] + '...' if len(text) > 300 else text,
            'url': url,
            'published_date': published_date,
            'source': source,
            'sentiment': sentiment,
            'relevance_score': relevance_score,
            'key_metrics': key_metrics,
            'category': category or 'general',
            'symbol': symbol,
            'sector': sector
        }
    
    def _calculate_relevance_score(self, title: str, text: str, symbol: str = None, sector: str = None, category: str = None) -> float:
        """Calculate relevance score based on content analysis"""
        score = 0.5  # Base score
        
        title_lower = title.lower()
        text_lower = text.lower()
        
        # Symbol-specific relevance
        if symbol:
            symbol_lower = symbol.lower()
            if symbol_lower in title_lower:
                score += 0.3
            if symbol_lower in text_lower:
                score += 0.2
        
        # High-value keywords
        high_value_keywords = [
            'earnings', 'quarterly', 'revenue', 'profit', 'guidance', 'outlook',
            'merger', 'acquisition', 'partnership', 'breakthrough', 'approval',
            'launch', 'expansion', 'growth', 'dividend', 'buyback'
        ]
        
        for keyword in high_value_keywords:
            if keyword in title_lower:
                score += 0.1
            if keyword in text_lower:
                score += 0.05
        
        # Recency bonus
        try:
            published_date = datetime.fromisoformat(title.replace('Z', '+00:00'))
            days_ago = (datetime.now() - published_date).days
            if days_ago <= 1:
                score += 0.2
            elif days_ago <= 7:
                score += 0.1
        except:
            pass
        
        return min(1.0, score)
    
    def _analyze_sentiment(self, title: str, text: str) -> str:
        """Simple sentiment analysis"""
        positive_words = [
            'growth', 'increase', 'beat', 'exceed', 'strong', 'positive', 'gain',
            'up', 'rise', 'boost', 'improve', 'success', 'breakthrough', 'launch'
        ]
        
        negative_words = [
            'decline', 'fall', 'loss', 'miss', 'weak', 'negative', 'down',
            'drop', 'concern', 'risk', 'challenge', 'problem', 'issue'
        ]
        
        content = (title + ' ' + text).lower()
        
        positive_count = sum(1 for word in positive_words if word in content)
        negative_count = sum(1 for word in negative_words if word in content)
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'
    
    def _extract_key_metrics(self, text: str) -> List[str]:
        """Extract key financial metrics mentioned in the text"""
        metrics = []
        
        # Simple regex patterns for common metrics
        metric_patterns = [
            r'\$[\d.,]+[BMK]?',  # Dollar amounts
            r'\d+\.?\d*%',       # Percentages
            r'EPS.*?\$?[\d.]+',  # EPS
            r'P/E.*?[\d.]+',     # P/E ratio
            r'revenue.*?\$[\d.,]+[BMK]?',  # Revenue
        ]
        
        import re
        for pattern in metric_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            metrics.extend(matches[:3])  # Limit to 3 matches per pattern
        
        return metrics[:5]  # Return top 5 metrics
    
    def _get_source_info(self, url: str) -> Dict[str, Any]:
        """Get source credibility and information"""
        from urllib.parse import urlparse
        
        domain = urlparse(url).netloc.lower()
        
        # Source credibility mapping
        source_credibility = {
            'sec.gov': {'name': 'SEC', 'credibility': 'official', 'type': 'regulatory'},
            'federalreserve.gov': {'name': 'Federal Reserve', 'credibility': 'official', 'type': 'government'},
            'bloomberg.com': {'name': 'Bloomberg', 'credibility': 'high', 'type': 'financial_media'},
            'reuters.com': {'name': 'Reuters', 'credibility': 'high', 'type': 'news_agency'},
            'wsj.com': {'name': 'Wall Street Journal', 'credibility': 'high', 'type': 'financial_media'},
            'cnbc.com': {'name': 'CNBC', 'credibility': 'high', 'type': 'financial_media'},
            'marketwatch.com': {'name': 'MarketWatch', 'credibility': 'medium', 'type': 'financial_media'},
            'yahoo.com': {'name': 'Yahoo Finance', 'credibility': 'medium', 'type': 'financial_portal'},
            'seekingalpha.com': {'name': 'Seeking Alpha', 'credibility': 'medium', 'type': 'analysis_platform'},
        }
        
        # Remove www. prefix
        domain = domain.replace('www.', '')
        
        return source_credibility.get(domain, {
            'name': domain.title(),
            'credibility': 'unknown',
            'type': 'other'
        })
    
    def _get_fallback_stock_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Fallback news when API fails"""
        return [
            {
                'title': f'{symbol} Trading Update',
                'summary': f'Recent trading activity and market analysis for {symbol}.',
                'url': '#',
                'published_date': datetime.now().isoformat(),
                'source': {'name': 'Market Analysis', 'credibility': 'medium', 'type': 'analysis'},
                'sentiment': 'neutral',
                'relevance_score': 0.7,
                'key_metrics': [],
                'category': 'general',
                'symbol': symbol,
                'sector': None
            }
        ]
    
    def _get_fallback_market_news(self) -> List[Dict[str, Any]]:
        """Fallback market news when API fails"""
        return [
            {
                'title': 'Market Update',
                'summary': 'Daily market analysis and economic indicators.',
                'url': '#',
                'published_date': datetime.now().isoformat(),
                'source': {'name': 'Market Analysis', 'credibility': 'medium', 'type': 'analysis'},
                'sentiment': 'neutral',
                'relevance_score': 0.6,
                'key_metrics': [],
                'category': 'market',
                'symbol': None,
                'sector': None
            }
        ]
    
    def _get_fallback_sector_news(self, sector: str) -> List[Dict[str, Any]]:
        """Fallback sector news when API fails"""
        return [
            {
                'title': f'{sector} Sector Update',
                'summary': f'Recent developments and trends in the {sector} sector.',
                'url': '#',
                'published_date': datetime.now().isoformat(),
                'source': {'name': 'Sector Analysis', 'credibility': 'medium', 'type': 'analysis'},
                'sentiment': 'neutral',
                'relevance_score': 0.6,
                'key_metrics': [],
                'category': 'sector',
                'symbol': None,
                'sector': sector
            }
        ]
    
    def _get_fallback_earnings_news(self, symbol: str = None) -> List[Dict[str, Any]]:
        """Fallback earnings news when API fails"""
        title = f'{symbol} Earnings Update' if symbol else 'Earnings Season Update'
        summary = f'Latest earnings information and analysis for {symbol}.' if symbol else 'Earnings season highlights and analysis.'
        
        return [
            {
                'title': title,
                'summary': summary,
                'url': '#',
                'published_date': datetime.now().isoformat(),
                'source': {'name': 'Earnings Analysis', 'credibility': 'medium', 'type': 'analysis'},
                'sentiment': 'neutral',
                'relevance_score': 0.7,
                'key_metrics': [],
                'category': 'earnings',
                'symbol': symbol,
                'sector': None
            }
        ]
    
    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()

# Global client instance
exa_news_client = ExaNewsClient()

# Convenience functions for backward compatibility
async def get_stock_news(symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get news for a specific stock"""
    return await exa_news_client.get_stock_news(symbol, limit)

async def get_market_news(limit: int = 15) -> List[Dict[str, Any]]:
    """Get general market news"""
    return await exa_news_client.get_market_news(limit) 