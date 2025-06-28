from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from market_data.tiingo_client import tiingo_client
from ai.analyst_agents import analyst_team, get_analyst_coverage
from typing import Optional, Dict, Any, List
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Popular stocks for search suggestions
POPULAR_STOCKS = {
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc. Class A',
    'AMZN': 'Amazon.com Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla, Inc.',
    'META': 'Meta Platforms, Inc.',
    'HOOD': 'Robinhood Markets, Inc.',
    'PLTR': 'Palantir Technologies Inc.',
    'COIN': 'Coinbase Global, Inc.',
    'SHOP': 'Shopify Inc.',
    'SQ': 'Square Inc.',
    'PYPL': 'PayPal Holdings, Inc.',
    'CRM': 'Salesforce.com Inc.',
    'ZM': 'Zoom Video Communications, Inc.',
    'NFLX': 'Netflix, Inc.',
    'DIS': 'The Walt Disney Company',
    'BA': 'The Boeing Company',
    'JPM': 'JPMorgan Chase & Co.',
    'JNJ': 'Johnson & Johnson'
}

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """
    Get real-time quote for a stock symbol using Tiingo
    """
    try:
        symbol = symbol.upper()
        quote_data = await tiingo_client.get_quote(symbol)
        
        if quote_data:
            return quote_data
        else:
            raise HTTPException(status_code=404, detail=f"No quote data found for {symbol}")
            
    except Exception as e:
        logger.error(f"Error getting quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get quote: {str(e)}")

@router.get("/overview/{symbol}")
async def get_company_overview(symbol: str):
    """Get comprehensive company overview and fundamentals"""
    try:
        overview_data = await tiingo_client.get_company_overview(symbol)
        if not overview_data:
            raise HTTPException(status_code=404, detail=f"Company data for {symbol} not found")
        return overview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart/{symbol}")
async def get_stock_chart(symbol: str, interval: str = "5min"):
    """Get intraday chart data"""
    try:
        chart_data = await tiingo_client.get_intraday_data(symbol, interval)
        return {"symbol": symbol, "interval": interval, "data": chart_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/earnings/{symbol}")
async def get_earnings_data(symbol: str):
    """Get earnings data"""
    try:
        earnings_data = await tiingo_client.get_earnings(symbol)
        return earnings_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analysis/{symbol}")
async def get_ai_analysis(symbol: str):
    """Get AI-powered analyst coverage report"""
    try:
        analysis = await analyst_team.generate_comprehensive_coverage(symbol)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comprehensive/{symbol}")
async def get_comprehensive_data(symbol: str):
    """
    Get comprehensive stock data including quote, overview, chart, and AI analysis
    This is the main endpoint for the dashboard
    """
    try:
        # Run all data fetching in parallel for maximum performance
        quote_task = tiingo_client.get_quote(symbol)
        overview_task = tiingo_client.get_company_overview(symbol)
        chart_task = tiingo_client.get_intraday_data(symbol)
        earnings_task = tiingo_client.get_earnings(symbol)
        analysis_task = analyst_team.generate_comprehensive_coverage(symbol)
        
        # Wait for all tasks to complete
        quote_data, overview_data, chart_data, earnings_data, analysis_data = await asyncio.gather(
            quote_task, overview_task, chart_task, earnings_task, analysis_task,
            return_exceptions=True
        )
        
        # Handle any exceptions gracefully
        result = {
            "symbol": symbol,
            "quote": quote_data if not isinstance(quote_data, Exception) else None,
            "overview": overview_data if not isinstance(overview_data, Exception) else None,
            "chart": chart_data if not isinstance(chart_data, Exception) else [],
            "earnings": earnings_data if not isinstance(earnings_data, Exception) else None,
            "analysis": analysis_data if not isinstance(analysis_data, Exception) else None,
            "last_updated": tiingo_client.base_url  # timestamp would be added here
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/earnings-summary/{symbol}")
async def generate_earnings_summary(symbol: str, transcript: Optional[str] = None):
    """Generate AI-powered earnings call summary"""
    try:
        # Get the appropriate analyst for the company's sector
        overview_data = await tiingo_client.get_company_overview(symbol)
        sector = overview_data.get('sector', 'Technology')
        analyst = analyst_team.get_analyst_for_sector(sector)
        
        # Generate earnings summary
        summary = await analyst.generate_earnings_summary(symbol, transcript)
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Enhanced endpoint with fallback data for rate limiting
@router.get("/stocks/{symbol}")
async def get_stock_data(symbol: str):
    """
    Main stock data endpoint with intelligent fallback for API rate limits
    """
    try:
        # First, try to get real data
        try:
            quote_data = await tiingo_client.get_quote(symbol)
            overview_data = await tiingo_client.get_company_overview(symbol)
            
            # Validate that we have meaningful data (not just default values)
            if (quote_data and overview_data and 
                quote_data.get('price') and float(quote_data.get('price', 0)) > 0 and
                overview_data.get('Name')):
                
                # Successfully got real data
                result = {
                    "symbol": symbol,
                    "name": overview_data.get('Name', f'{symbol} Inc.'),
                    "price": float(quote_data.get('price', 0)),
                    "change": float(quote_data.get('change', 0) or 0),
                    "changePercent": float(quote_data.get('changePercent', 0) or 0),
                    "volume": int(quote_data.get('volume', 0) or 0),
                    "marketCap": int(overview_data.get('MarketCapitalization', 0) or 0),
                    "high52w": float(overview_data.get('52WeekHigh', 0) or 0),
                    "low52w": float(overview_data.get('52WeekLow', 0) or 0),
                    "lastUpdated": "real-time",
                    "source": "tiingo"
                }
                return result
                
        except Exception as api_error:
            # API failed, use mock data
            pass
        
        # Fallback to realistic mock data
        import random
        base_prices = {
            'AAPL': 182.89,
            'MSFT': 337.20,
            'GOOGL': 131.86,
            'AMZN': 127.12,
            'NVDA': 421.01,
            'TSLA': 248.50,
            'META': 295.89
        }
        
        base_price = base_prices.get(symbol.upper(), random.uniform(50, 400))
        change_percent = random.uniform(-5, 5)
        change = base_price * (change_percent / 100)
        
        company_names = {
            'AAPL': 'Apple Inc.',
            'MSFT': 'Microsoft Corporation',
            'GOOGL': 'Alphabet Inc. Class A',
            'AMZN': 'Amazon.com Inc.',
            'NVDA': 'NVIDIA Corporation',
            'TSLA': 'Tesla Inc.',
            'META': 'Meta Platforms Inc.'
        }
        
        result = {
            "symbol": symbol.upper(),
            "name": company_names.get(symbol.upper(), f'{symbol.upper()} Inc.'),
            "price": round(base_price + random.uniform(-5, 5), 2),
            "change": round(change, 2),
            "changePercent": round(change_percent, 2),
            "volume": random.randint(10000000, 100000000),
            "marketCap": random.randint(100000000000, 3000000000000),
            "high52w": round(base_price * random.uniform(1.2, 1.6), 2),
            "low52w": round(base_price * random.uniform(0.6, 0.8), 2),
            "lastUpdated": "mock-data",
            "source": "fallback"
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Legacy endpoint for backward compatibility
@router.get("/stocks-legacy/{symbol}")
async def get_stock_data_legacy(symbol: str, exchange: Optional[str] = "US", include_options: bool = False):
    """
    Legacy endpoint - redirects to main endpoint
    """
    return await get_stock_data(symbol)

@router.get("/search")
async def search_stocks(
    q: str = Query(..., description="Search query for stock symbols or company names"),
    limit: int = Query(10, description="Maximum number of results to return")
):
    """
    Search for stocks by symbol or company name using Tiingo API
    Returns a list of matching stocks with real-time information
    """
    try:
        results = await tiingo_client.search_stocks(q)
        return results[:limit]
        
    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/stocks/{symbol}")
async def get_stock_details(symbol: str):
    """
    Get detailed information for a specific stock using Tiingo API
    """
    try:
        symbol = symbol.upper()
        
        # Get multiple data sources in parallel from Tiingo
        quote_task = tiingo_client.get_quote(symbol)
        overview_task = tiingo_client.get_company_overview(symbol)
        intraday_task = tiingo_client.get_intraday_data(symbol)
        news_task = tiingo_client.get_news(symbol, limit=5)
        
        quote_data, overview_data, intraday_data, news_data = await asyncio.gather(
            quote_task, overview_task, intraday_task, news_task,
            return_exceptions=True
        )
        
        # Get AI analyst coverage
        analyst_coverage = await get_analyst_coverage(symbol)
        
        # Process quote data
        if isinstance(quote_data, Exception) or not quote_data:
            quote_data = {
                'price': 100 + hash(symbol) % 300,
                'change': (hash(symbol) % 20) - 10,
                'changePercent': ((hash(symbol) % 20) - 10) / 10,
                'volume': (hash(symbol) % 50000000) + 1000000,
                'high': 120 + hash(symbol) % 200,
                'low': 50 + hash(symbol) % 100,
                'open': 100 + hash(symbol) % 250,
                'prevClose': 95 + hash(symbol) % 250,
                'source': 'fallback'
            }
            
        # Process overview data
        if isinstance(overview_data, Exception) or not overview_data:
            overview_data = {
                'name': f'{symbol} Inc.',
                'sector': 'Technology',
                'industry': 'Software',
                'description': f'A leading company in the {symbol} sector.',
                'marketCap': (hash(symbol) % 1000000000000) + 100000000,
                'source': 'fallback'
            }
            
        # Process intraday data
        if isinstance(intraday_data, Exception) or not intraday_data:
            intraday_data = []
            
        # Process news data
        if isinstance(news_data, Exception) or not news_data:
            news_data = []
        
        # Build comprehensive response
        result = {
            'symbol': symbol,
            'name': overview_data.get('name', f'{symbol} Inc.'),
            'sector': overview_data.get('sector', 'Technology'),
            'industry': overview_data.get('industry', 'Software'),
            'description': overview_data.get('description', 'No description available'),
            'exchange': overview_data.get('exchange', 'NASDAQ'),
            'currency': overview_data.get('currency', 'USD'),
            
            # Price data from Tiingo
            'price': float(quote_data.get('price', 0)),
            'change': float(quote_data.get('change', 0)),
            'changePercent': float(quote_data.get('changePercent', 0)),
            'volume': int(quote_data.get('volume', 0)),
            'previousClose': float(quote_data.get('prevClose', 0)),
            'open': float(quote_data.get('open', 0)),
            'dayHigh': float(quote_data.get('high', 0)),
            'dayLow': float(quote_data.get('low', 0)),
            
            # Fundamental data
            'marketCap': int(overview_data.get('marketCap', 0)),
            'employees': int(overview_data.get('employees', 0)),
            'website': overview_data.get('website', ''),
            
            # Additional data (would need separate Tiingo endpoints)
            'peRatio': None,
            'pegRatio': None,
            'eps': None,
            'beta': None,
            'dividendYield': None,
            'high52Week': None,
            'low52Week': None,
            
            # AI analyst coverage
            'analystCoverage': analyst_coverage,
            
            # Chart data
            'chartData': intraday_data if intraday_data else [],
            
            # News data
            'news': news_data,
            
            # Metadata
            'lastUpdated': quote_data.get('timestamp', ''),
            'source': quote_data.get('source', 'tiingo'),
            'dataProvider': 'Tiingo'
        }
        
        return result
        
    except Exception as e:
        logger.error(f"Error getting stock details for {symbol}: {e}")
        
        # Return comprehensive fallback data
        return {
            'symbol': symbol,
            'name': f'{symbol} Inc.',
            'sector': 'Technology',
            'industry': 'Software',
            'description': f'A leading company in the {symbol} sector.',
            'exchange': 'NASDAQ',
            'currency': 'USD',
            'price': 100 + hash(symbol) % 300,
            'change': (hash(symbol) % 20) - 10,
            'changePercent': ((hash(symbol) % 20) - 10) / 10,
            'volume': (hash(symbol) % 50000000) + 1000000,
            'marketCap': (hash(symbol) % 1000000000000) + 100000000,
            'high52Week': 120 + hash(symbol) % 200,
            'low52Week': 50 + hash(symbol) % 100,
            'analystCoverage': None,
            'chartData': [],
            'news': [],
            'lastUpdated': '2024-01-15',
            'source': 'fallback',
            'dataProvider': 'Tiingo',
            'error': str(e)
        }

@router.get("/stocks/{symbol}/chart")
async def get_stock_chart(
    symbol: str,
    interval: str = Query("5min", description="Chart interval: 1min, 5min, 15min, 30min, 60min, daily, weekly"),
    period: str = Query("1day", description="Chart period: 1day, 5days, 1month, 3months, 6months, 1year")
):
    """
    Get chart data for a specific stock with various intervals and periods using Tiingo
    """
    try:
        symbol = symbol.upper()
        
        # Map periods to data retrieval strategy
        if period in ['1day', '5days']:
            chart_data = await tiingo_client.get_intraday_data(symbol, interval)
        else:
            # For longer periods, use daily data
            days_map = {
                '1month': 30,
                '3months': 90,
                '6months': 180,
                '1year': 365,
                '2years': 730,
                '5years': 1825
            }
            days = days_map.get(period, 30)
            chart_data = await tiingo_client.get_daily_data(symbol, days)
            
        return {
            'symbol': symbol,
            'interval': interval,
            'period': period,
            'data': chart_data or [],
            'lastUpdated': '2024-01-15',
            'source': 'tiingo'
        }
        
    except Exception as e:
        logger.error(f"Error getting chart data for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get chart data: {str(e)}")

@router.get("/stocks/{symbol}/news")
async def get_stock_news(
    symbol: str,
    limit: int = Query(20, description="Number of news articles to return")
):
    """
    Get latest news for a specific stock using Tiingo
    """
    try:
        symbol = symbol.upper()
        news_data = await tiingo_client.get_news(symbol, limit)
        
        return {
            'symbol': symbol,
            'news': news_data,
            'count': len(news_data),
            'lastUpdated': '2024-01-15',
            'source': 'tiingo'
        }
        
    except Exception as e:
        logger.error(f"Error getting news for {symbol}: {e}")
        return {
            'symbol': symbol,
            'news': [],
            'count': 0,
            'lastUpdated': '2024-01-15',
            'source': 'tiingo',
            'error': str(e)
        }

@router.get("/stocks/{symbol}/technicals")
async def get_technical_indicators(symbol: str):
    """
    Get technical indicators for a stock
    """
    try:
        symbol = symbol.upper()
        
        # Get technical indicators from Tiingo
        rsi_data = await tiingo_client.get_rsi(symbol)
        macd_data = await tiingo_client.get_macd(symbol)
        bbands_data = await tiingo_client.get_bbands(symbol)
        
        return {
            'symbol': symbol,
            'indicators': {
                'rsi': rsi_data,
                'macd': macd_data,
                'bollinger_bands': bbands_data
            },
            'lastUpdated': '2024-01-15'
        }
        
    except Exception as e:
        logger.error(f"Error getting technical indicators for {symbol}: {e}")
        # Return mock technical data
        return {
            'symbol': symbol,
            'indicators': {
                'rsi': {'value': 65.5, 'signal': 'neutral'},
                'macd': {'value': 2.34, 'signal': 'buy'},
                'bollinger_bands': {'upper': 185.50, 'middle': 180.00, 'lower': 174.50}
            },
            'lastUpdated': '2024-01-15',
            'source': 'fallback'
        }

# Legacy endpoints for backward compatibility
@router.get("/data/{symbol}")
async def get_stock_data(symbol: str):
    """
    Legacy endpoint - redirects to detailed stock data
    """
    return await get_stock_details(symbol) 