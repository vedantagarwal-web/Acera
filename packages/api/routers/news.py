from fastapi import APIRouter, HTTPException, Query
from news.exa_client import exa_news_client
from typing import Optional, List
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/news")
async def get_general_news(
    limit: int = Query(default=20, ge=1, le=50, description="Number of news items to return")
):
    """Get general financial news"""
    try:
        news_items = await exa_news_client.get_market_news(limit)
        return {
            "category": "general",
            "count": len(news_items),
            "news": news_items,
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
    except Exception as e:
        logger.error(f"Error fetching general news: {e}")
        return {
            "category": "general",
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/stock/{symbol}")
async def get_stock_news(
    symbol: str,
    limit: int = Query(default=20, ge=1, le=50, description="Number of news items to return")
):
    """Get news specific to a stock symbol"""
    try:
        news_items = await exa_news_client.get_stock_news(symbol, limit)
        return {
            "symbol": symbol.upper(),
            "count": len(news_items),
            "news": news_items,
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
    except Exception as e:
        logger.error(f"Error fetching stock news for {symbol}: {e}")
        return {
            "symbol": symbol.upper(),
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/market")
async def get_market_news(
    limit: int = Query(default=15, ge=1, le=30, description="Number of news items to return")
):
    """Get general market and economic news"""
    try:
        news_items = await exa_news_client.get_market_news(limit)
        return {
            "category": "market",
            "count": len(news_items),
            "news": news_items,
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
    except Exception as e:
        logger.error(f"Error fetching market news: {e}")
        return {
            "category": "market",
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/sector/{sector}")
async def get_sector_news(
    sector: str,
    limit: int = Query(default=15, ge=1, le=30, description="Number of news items to return")
):
    """Get news for a specific sector"""
    try:
        news_items = await exa_news_client.get_sector_news(sector, limit)
        return {
            "sector": sector,
            "count": len(news_items),
            "news": news_items,
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
    except Exception as e:
        logger.error(f"Error fetching sector news for {sector}: {e}")
        return {
            "sector": sector,
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/earnings")
async def get_earnings_news(
    symbol: Optional[str] = Query(default=None, description="Optional stock symbol for specific earnings news"),
    limit: int = Query(default=20, ge=1, le=50, description="Number of news items to return")
):
    """Get earnings-related news"""
    try:
        news_items = await exa_news_client.get_earnings_news(symbol)
        return {
            "category": "earnings",
            "symbol": symbol,
            "count": len(news_items),
            "news": news_items[:limit],
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
    except Exception as e:
        logger.error(f"Error fetching earnings news: {e}")
        return {
            "category": "earnings",
            "symbol": symbol,
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/comprehensive/{symbol}")
async def get_comprehensive_news(
    symbol: str,
    include_sector: bool = Query(default=True, description="Include sector news"),
    include_earnings: bool = Query(default=True, description="Include earnings news")
):
    """Get comprehensive news coverage for a stock including company, sector, and earnings news"""
    try:
        # Get company overview to determine sector
        from market_data.tiingo_client import tiingo_client
        company_data = await tiingo_client.get_company_overview(symbol)
        sector = company_data.get('sector', 'Technology')
        
        # Fetch different types of news in parallel
        tasks = [
            exa_news_client.get_stock_news(symbol, 15)
        ]
        
        if include_sector:
            tasks.append(exa_news_client.get_sector_news(sector, 10))
        
        if include_earnings:
            tasks.append(exa_news_client.get_earnings_news(symbol))
        
        # Wait for all tasks to complete
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        stock_news = results[0] if not isinstance(results[0], Exception) else []
        sector_news = results[1] if len(results) > 1 and not isinstance(results[1], Exception) else []
        earnings_news = results[2] if len(results) > 2 and not isinstance(results[2], Exception) else []
        
        # Combine and categorize news
        all_news = []
        
        # Add stock-specific news
        for item in stock_news:
            item['news_type'] = 'company'
            all_news.append(item)
        
        # Add sector news (limit to top 5 to avoid overwhelming)
        for item in sector_news[:5]:
            item['news_type'] = 'sector'
            all_news.append(item)
        
        # Add earnings news (limit to top 5)
        for item in earnings_news[:5]:
            item['news_type'] = 'earnings'
            all_news.append(item)
        
        # Sort by relevance score and published date
        all_news.sort(key=lambda x: (x.get('relevance_score', 0), x.get('published_date', '')), reverse=True)
        
        return {
            "symbol": symbol.upper(),
            "sector": sector,
            "total_count": len(all_news),
            "company_news_count": len(stock_news),
            "sector_news_count": len(sector_news),
            "earnings_news_count": len(earnings_news),
            "news": all_news[:30],  # Return top 30 most relevant items
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
        
    except Exception as e:
        logger.error(f"Error fetching comprehensive news for {symbol}: {e}")
        return {
            "symbol": symbol.upper(),
            "sector": "Unknown",
            "total_count": 0,
            "company_news_count": 0,
            "sector_news_count": 0,
            "earnings_news_count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/trending")
async def get_trending_news():
    """Get trending financial news across all categories"""
    try:
        # Get news from different categories in parallel
        market_task = exa_news_client.get_market_news(10)
        earnings_task = exa_news_client.get_earnings_news(None)  # General earnings news
        tech_task = exa_news_client.get_sector_news('Technology', 8)
        finance_task = exa_news_client.get_sector_news('Financials', 8)
        
        market_news, earnings_news, tech_news, finance_news = await asyncio.gather(
            market_task, earnings_task, tech_task, finance_task,
            return_exceptions=True
        )
        
        # Combine all news
        trending_news = []
        
        # Add market news
        if not isinstance(market_news, Exception):
            for item in market_news:
                item['category'] = 'market'
                trending_news.append(item)
        
        # Add earnings news
        if not isinstance(earnings_news, Exception):
            for item in earnings_news[:8]:
                item['category'] = 'earnings'
                trending_news.append(item)
        
        # Add tech news
        if not isinstance(tech_news, Exception):
            for item in tech_news:
                item['category'] = 'technology'
                trending_news.append(item)
        
        # Add finance news
        if not isinstance(finance_news, Exception):
            for item in finance_news:
                item['category'] = 'finance'
                trending_news.append(item)
        
        # Sort by relevance score and recency
        trending_news.sort(key=lambda x: (x.get('relevance_score', 0), x.get('published_date', '')), reverse=True)
        
        return {
            "category": "trending",
            "count": len(trending_news),
            "news": trending_news[:25],  # Return top 25 trending items
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
        
    except Exception as e:
        logger.error(f"Error fetching trending news: {e}")
        return {
            "category": "trending",
            "count": 0,
            "news": [],
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/search")
async def search_news(
    query: str = Query(..., description="Search query for news"),
    limit: int = Query(default=20, ge=1, le=50, description="Number of results to return"),
    days_back: int = Query(default=30, ge=1, le=90, description="Number of days to search back")
):
    """Search for news using custom query"""
    try:
        # Use the search functionality of exa_news_client
        news_items = await exa_news_client.search_news(query, limit, days_back)
        
        return {
            "query": query,
            "count": len(news_items),
            "news": news_items,
            "days_back": days_back,
            "timestamp": datetime.now().isoformat(),
            "source": "exa"
        }
        
    except Exception as e:
        logger.error(f"Error searching news with query '{query}': {e}")
        return {
            "query": query,
            "count": 0,
            "news": [],
            "days_back": days_back,
            "timestamp": datetime.now().isoformat(),
            "source": "fallback",
            "error": str(e)
        }

@router.get("/news/health")
async def news_health_check():
    """Health check for news services"""
    try:
        # Test Exa connection with a simple query
        test_news = await exa_news_client.get_market_news(1)
        exa_status = "connected" if test_news and len(test_news) > 0 else "limited"
        
        return {
            "status": "healthy",
            "services": {
                "exa": exa_status,
                "news_aggregation": "operational",
                "search": "operational"
            },
            "last_updated": datetime.now().isoformat(),
            "data_quality": "high" if exa_status == "connected" else "fallback"
        }
        
    except Exception as e:
        logger.error(f"News health check failed: {e}")
        return {
            "status": "degraded",
            "error": str(e),
            "services": {
                "exa": "error",
                "news_aggregation": "fallback",
                "search": "limited"
            },
            "last_updated": datetime.now().isoformat()
        } 