from fastapi import APIRouter, HTTPException, Query
from news.exa_client import exa_news_client
from typing import Optional, List
import asyncio

router = APIRouter(prefix="/news", tags=["News"])

@router.get("/stock/{symbol}")
async def get_stock_news(
    symbol: str,
    limit: int = Query(default=20, ge=1, le=50, description="Number of news items to return")
):
    """Get news specific to a stock symbol"""
    try:
        news_items = await exa_news_client.get_stock_news(symbol, limit)
        return {
            "symbol": symbol,
            "count": len(news_items),
            "news": news_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock news: {str(e)}")

@router.get("/market")
async def get_market_news(
    limit: int = Query(default=15, ge=1, le=30, description="Number of news items to return")
):
    """Get general market and economic news"""
    try:
        news_items = await exa_news_client.get_market_news(limit)
        return {
            "category": "market",
            "count": len(news_items),
            "news": news_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching market news: {str(e)}")

@router.get("/sector/{sector}")
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
            "news": news_items
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching sector news: {str(e)}")

@router.get("/earnings")
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
            "news": news_items[:limit]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching earnings news: {str(e)}")

@router.get("/comprehensive/{symbol}")
async def get_comprehensive_news(
    symbol: str,
    include_sector: bool = Query(default=True, description="Include sector news"),
    include_earnings: bool = Query(default=True, description="Include earnings news")
):
    """Get comprehensive news coverage for a stock including company, sector, and earnings news"""
    try:
        # Get company overview to determine sector
        from market_data.alpha_vantage import alpha_vantage_client
        company_data = await alpha_vantage_client.get_company_overview(symbol)
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
        all_news.sort(key=lambda x: (x['relevance_score'], x['published_date']), reverse=True)
        
        return {
            "symbol": symbol,
            "sector": sector,
            "total_count": len(all_news),
            "company_news_count": len(stock_news),
            "sector_news_count": len(sector_news),
            "earnings_news_count": len(earnings_news),
            "news": all_news[:30]  # Return top 30 most relevant items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching comprehensive news: {str(e)}")

@router.get("/trending")
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
        trending_news.sort(key=lambda x: (x['relevance_score'], x['published_date']), reverse=True)
        
        return {
            "category": "trending",
            "count": len(trending_news),
            "news": trending_news[:25]  # Return top 25 trending items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching trending news: {str(e)}")

@router.get("/search")
async def search_news(
    query: str = Query(..., description="Search query for news"),
    limit: int = Query(default=20, ge=1, le=50, description="Number of results to return"),
    days_back: int = Query(default=30, ge=1, le=90, description="Number of days to search back")
):
    """Search for news using custom query"""
    try:
        from datetime import datetime, timedelta
        
        search_data = {
            "query": query,
            "type": "keyword",
            "useAutoprompt": True,
            "numResults": limit,
            "includeDomains": [
                "sec.gov",
                "bloomberg.com",
                "reuters.com",
                "cnbc.com",
                "marketwatch.com",
                "wsj.com",
                "yahoo.com",
                "seekingalpha.com",
                "benzinga.com"
            ],
            "startPublishedDate": (datetime.now() - timedelta(days=days_back)).isoformat(),
            "endPublishedDate": datetime.now().isoformat(),
            "text": {
                "maxCharacters": 800,
                "includeHtmlTags": False
            }
        }
        
        result = await exa_news_client._make_request('search', search_data)
        
        # Process search results
        news_items = []
        for item in result.get('results', []):
            processed_item = exa_news_client._process_news_item(item, category='search')
            if processed_item:
                news_items.append(processed_item)
        
        return {
            "query": query,
            "count": len(news_items),
            "news": news_items
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching news: {str(e)}")

@router.get("/health")
async def news_health_check():
    """Health check for news service"""
    try:
        # Test with a simple query
        test_news = await exa_news_client.get_market_news(1)
        return {
            "status": "healthy",
            "service": "news",
            "api_status": "operational",
            "test_result": len(test_news) > 0
        }
    except Exception as e:
        return {
            "status": "degraded",
            "service": "news", 
            "api_status": "error",
            "error": str(e)
        } 