# Backward compatibility module - imports Perplexity client as Exa replacement
from .perplexity_client import (
    PerplexityFinancialClient,
    perplexity_client
)
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta

# Legacy compatibility - maintain the same interface
class ExaNewsClient(PerplexityFinancialClient):
    """
    Legacy wrapper for ExaNewsClient that now uses Perplexity API for superior performance.
    Maintains backward compatibility while providing enhanced financial analysis capabilities.
    """
    
    def __init__(self, api_key: str = None):
        super().__init__(api_key)
    
    async def get_market_news(self, limit: int = 15) -> List[Dict[str, Any]]:
        """Get general market news using Perplexity"""
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a financial markets analyst providing current market news and analysis."
                },
                {
                    "role": "user", 
                    "content": f"Provide the latest {limit} significant market news items from today, focusing on:\n- Federal Reserve policy\n- Economic indicators\n- Sector rotations\n- Geopolitical events affecting markets\n- Major earnings or corporate news\n\nFrom sources like Bloomberg, Reuters, CNBC, MarketWatch."
                }
            ]
            
            response = await self._make_perplexity_request(messages, model='llama-3.1-sonar-large-128k-online')
            content = response['choices'][0]['message']['content']
            
            return self._parse_news_response(content, 'MARKET')
            
        except Exception as e:
            print(f"❌ Error fetching market news: {e}")
            return [{'title': 'Market news unavailable', 'source': 'system', 'published_date': datetime.now().isoformat()}]

    async def get_sector_news(self, sector: str, limit: int = 15) -> List[Dict[str, Any]]:
        """Get sector-specific news using Perplexity"""
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a sector analyst providing comprehensive news and trends for specific market sectors."
                },
                {
                    "role": "user",
                    "content": f"""Find the latest {limit} news articles and developments in the {sector} sector from the past 2 weeks.
                    
                    Focus on:
                    - Industry trends and disruptions
                    - Regulatory changes
                    - Major company earnings and announcements
                    - Merger and acquisition activity
                    - Technology advances
                    - Market share shifts
                    
                    For each item, provide title, source, summary, and impact on the sector."""
                }
            ]
            
            response = await self._make_perplexity_request(messages, model='llama-3.1-sonar-large-128k-online')
            content = response['choices'][0]['message']['content']
            
            return self._parse_news_response(content, sector)
            
        except Exception as e:
            print(f"❌ Error fetching sector news for {sector}: {e}")
            return self._get_fallback_sector_news(sector)

    async def get_earnings_news(self, symbol: str = None) -> List[Dict[str, Any]]:
        """Get earnings-related news using Perplexity"""
        
        try:
            if symbol:
                query = f"Find recent earnings-related news for {symbol} including quarterly results, guidance, and analyst reactions."
            else:
                query = "Find the latest earnings season news, major earnings beats/misses, and guidance updates from various companies."
            
            messages = [
                {
                    "role": "system",
                    "content": "You are an earnings analyst tracking quarterly results and earnings-related developments."
                },
                {
                    "role": "user",
                    "content": query
                }
            ]
            
            response = await self._make_perplexity_request(messages, model='llama-3.1-sonar-large-128k-online')
            content = response['choices'][0]['message']['content']
            
            return self._parse_news_response(content, symbol or 'EARNINGS')
            
        except Exception as e:
            print(f"❌ Error fetching earnings news: {e}")
            return self._get_fallback_earnings_news(symbol)

    async def get_stock_news(self, symbol: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Get comprehensive stock news using Perplexity's superior search"""
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": """You are a financial news analyst. Provide recent, relevant news about the requested stock 
                    from credible financial sources. Focus on earnings, analyst upgrades/downgrades, product launches, 
                    regulatory news, and market-moving events."""
                },
                {
                    "role": "user",
                    "content": f"""Find the latest {limit} news articles about {symbol} stock from the past 30 days. 
                    Focus on earnings reports, analyst ratings, product news, partnerships, and market developments.
                    
                    For each article, provide:
                    - title
                    - source 
                    - published_date
                    - summary (2-3 sentences)
                    - sentiment (positive/negative/neutral)
                    - url (if available)
                    
                    Search credible sources like Bloomberg, Reuters, MarketWatch, CNBC, Yahoo Finance, SEC filings."""
                }
            ]
            
            response = await self._make_perplexity_request(messages, model='llama-3.1-sonar-large-128k-online')
            content = response['choices'][0]['message']['content']
            
            # Process the news response into structured format
            news_items = self._parse_news_response(content, symbol)
            
            return news_items[:limit]
            
        except Exception as e:
            print(f"❌ Error fetching news for {symbol}: {e}")
            return self._get_fallback_stock_news(symbol)

    def _parse_news_response(self, content: str, symbol: str) -> List[Dict[str, Any]]:
        """Parse Perplexity news response into structured format"""
        news_items = []
        
        try:
            # Simple parsing - in production, this would be more sophisticated
            lines = content.split('\n')
            current_item = {}
            
            for line in lines:
                line = line.strip()
                if line.startswith('Title:') or line.startswith('**') and len(line) > 10:
                    if current_item:
                        news_items.append(current_item)
                    current_item = {
                        'title': line.replace('Title:', '').replace('**', '').strip(),
                        'symbol': symbol,
                        'published_date': datetime.now().isoformat(),
                        'source': 'perplexity_search',
                        'relevance_score': 85,
                        'sentiment': 'neutral'
                    }
                elif line.startswith('Source:'):
                    current_item['source'] = line.replace('Source:', '').strip()
                elif line.startswith('Summary:'):
                    current_item['summary'] = line.replace('Summary:', '').strip()
                elif line.startswith('Sentiment:'):
                    current_item['sentiment'] = line.replace('Sentiment:', '').strip().lower()
            
            if current_item:
                news_items.append(current_item)
                
            # If parsing didn't work well, create a general news item
            if not news_items:
                news_items.append({
                    'title': f'Latest market analysis for {symbol}',
                    'summary': content[:300] + '...' if len(content) > 300 else content,
                    'symbol': symbol,
                    'published_date': datetime.now().isoformat(),
                    'source': 'perplexity_analysis',
                    'relevance_score': 80,
                    'sentiment': 'neutral'
                })
                
        except Exception as e:
            print(f"❌ Error parsing news response: {e}")
        
        return news_items

    def _get_fallback_stock_news(self, symbol: str) -> List[Dict[str, Any]]:
        """Fallback news when Perplexity is unavailable"""
        return [
            {
                'title': f'{symbol} stock analysis pending - Perplexity API integration',
                'source': 'acera_system',
                'published_date': datetime.now().isoformat(),
                'summary': f'Real-time news analysis for {symbol} will be available when Perplexity API is accessible.',
                'sentiment': 'neutral',
                'relevance_score': 70,
                'symbol': symbol
            }
        ]

    def _get_fallback_sector_news(self, sector: str) -> List[Dict[str, Any]]:
        """Fallback sector news"""
        return [
            {
                'title': f'{sector} sector analysis pending',
                'source': 'acera_system',
                'published_date': datetime.now().isoformat(),
                'summary': f'Sector analysis for {sector} will be available when Perplexity API is accessible.',
                'sentiment': 'neutral',
                'relevance_score': 70,
                'symbol': sector
            }
        ]

    def _get_fallback_earnings_news(self, symbol: str = None) -> List[Dict[str, Any]]:
        """Fallback earnings news"""
        target = symbol or 'earnings season'
        return [
            {
                'title': f'{target} earnings analysis pending',
                'source': 'acera_system',
                'published_date': datetime.now().isoformat(),
                'summary': f'Earnings analysis for {target} will be available when Perplexity API is accessible.',
                'sentiment': 'neutral',
                'relevance_score': 70,
                'symbol': symbol or 'EARNINGS'
            }
        ]

# Global client instances for backward compatibility
exa_news_client = ExaNewsClient()

# Convenience functions that maintain the original API
async def get_stock_news(symbol: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Get stock news using Perplexity (replaces Exa)"""
    return await exa_news_client.get_stock_news(symbol, limit)

async def get_market_news(limit: int = 15) -> List[Dict[str, Any]]:
    """Get general market news using Perplexity"""
    return await exa_news_client.get_market_news(limit)

async def get_sector_news(sector: str, limit: int = 15) -> List[Dict[str, Any]]:
    """Get sector news using Perplexity"""
    return await exa_news_client.get_sector_news(sector, limit)

async def get_earnings_news(symbol: str = None) -> List[Dict[str, Any]]:
    """Get earnings news using Perplexity"""
    return await exa_news_client.get_earnings_news(symbol) 