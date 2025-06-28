from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import asyncio
from datetime import datetime, timedelta
from market_data.tiingo_client import tiingo_client
from news.exa_client import exa_news_client
from ai.analyst_agents import get_analyst_coverage
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Popular stocks for dashboard
DASHBOARD_STOCKS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'HOOD']

@router.get("/dashboard/overview")
async def get_dashboard_overview():
    """Get comprehensive dashboard overview with all key metrics"""
    try:
        # Fetch data in parallel for better performance
        tasks = [
            get_market_indices(),
            get_portfolio_summary(),
            get_trending_stocks(),
            get_ai_insights(),
            exa_news_client.get_market_news(5)
        ]
        
        indices, portfolio, trending, insights, news = await asyncio.gather(
            *tasks, return_exceptions=True
        )
        
        return {
            'market_indices': indices if not isinstance(indices, Exception) else {},
            'portfolio_summary': portfolio if not isinstance(portfolio, Exception) else {},
            'trending_stocks': trending if not isinstance(trending, Exception) else [],
            'ai_insights': insights if not isinstance(insights, Exception) else [],
            'latest_news': news if not isinstance(news, Exception) else [],
            'timestamp': datetime.now().isoformat(),
            'session_status': get_market_session_status(),
            'source': 'dashboard_aggregated'
        }
        
    except Exception as e:
        logger.error(f"Error fetching dashboard overview: {e}")
        return {
            'market_indices': {},
            'portfolio_summary': {},
            'trending_stocks': [],
            'ai_insights': [],
            'latest_news': [],
            'timestamp': datetime.now().isoformat(),
            'error': str(e)
        }

@router.get("/dashboard/market")
async def get_market_indices():
    """Get key market indices for dashboard"""
    try:
        # Get major index ETFs
        index_symbols = ['SPY', 'QQQ', 'DIA', 'IWM', 'VXX']  # S&P, NASDAQ, DOW, Russell, VIX
        
        tasks = [tiingo_client.get_quote(symbol) for symbol in index_symbols]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        indices = {}
        index_names = {
            'SPY': 'S&P 500',
            'QQQ': 'NASDAQ',
            'DIA': 'Dow Jones',
            'IWM': 'Russell 2000',
            'VXX': 'VIX'
        }
        
        for i, symbol in enumerate(index_symbols):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                indices[symbol] = {
                    'symbol': symbol,
                    'name': index_names[symbol],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'source': quote['source']
                }
        
        return indices
        
    except Exception as e:
        logger.error(f"Error fetching market indices: {e}")
        return {}

@router.get("/dashboard/portfolio")
async def get_portfolio_summary():
    """Get portfolio summary (mock data for now)"""
    try:
        # Mock portfolio data - in production this would come from user's actual portfolio
        return {
            'total_value': 125750.50,
            'daily_change': 2850.75,
            'daily_change_percent': 2.32,
            'positions': [
                {
                    'symbol': 'AAPL',
                    'quantity': 100,
                    'avg_cost': 150.00,
                    'current_price': 185.25,
                    'value': 18525.00,
                    'unrealized_pnl': 3525.00,
                    'weight': 14.7
                },
                {
                    'symbol': 'TSLA',
                    'quantity': 50,
                    'avg_cost': 200.00,
                    'current_price': 245.80,
                    'value': 12290.00,
                    'unrealized_pnl': 2290.00,
                    'weight': 9.8
                },
                {
                    'symbol': 'NVDA',
                    'quantity': 25,
                    'avg_cost': 400.00,
                    'current_price': 485.60,
                    'value': 12140.00,
                    'unrealized_pnl': 2140.00,
                    'weight': 9.7
                }
            ],
            'performance': {
                '1D': 2.32,
                '1W': 5.67,
                '1M': 12.45,
                '3M': 18.92,
                'YTD': 24.78
            },
            'allocation': {
                'Technology': 65.2,
                'Healthcare': 15.8,
                'Finance': 12.3,
                'Energy': 6.7
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching portfolio summary: {e}")
        return {}

@router.get("/dashboard/trending")
async def get_trending_stocks(limit: int = Query(8, ge=1, le=20)):
    """Get trending stocks for dashboard"""
    try:
        # Get quotes for popular stocks
        tasks = [tiingo_client.get_quote(symbol) for symbol in DASHBOARD_STOCKS[:limit]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        trending = []
        for i, symbol in enumerate(DASHBOARD_STOCKS[:limit]):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                trending.append({
                    'symbol': symbol,
                    'name': quote['name'],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume']
                })
        
        # Sort by volume (most active)
        trending.sort(key=lambda x: x['volume'], reverse=True)
        return trending
        
    except Exception as e:
        logger.error(f"Error fetching trending stocks: {e}")
        return []

@router.get("/dashboard/ai-insights")
async def get_ai_insights():
    """Get AI-powered insights for dashboard"""
    try:
        # Generate mock AI insights
        insights = [
            {
                'type': 'opportunity',
                'title': 'Tech Sector Rotation',
                'description': 'Large cap tech showing institutional accumulation',
                'confidence': 82,
                'timeframe': '2-3 weeks',
                'symbols': ['AAPL', 'MSFT', 'GOOGL']
            },
            {
                'type': 'alert',
                'title': 'Market Volatility Spike',
                'description': 'VIX elevated, consider position sizing',
                'confidence': 75,
                'timeframe': 'Next few days',
                'symbols': ['VXX', 'SPY']
            },
            {
                'type': 'signal',
                'title': 'Earnings Momentum',
                'description': 'Strong earnings beats creating upward momentum',
                'confidence': 88,
                'timeframe': '1-2 weeks',
                'symbols': ['HOOD', 'TSLA']
            }
        ]
        
        return insights
        
    except Exception as e:
        logger.error(f"Error generating AI insights: {e}")
        return []

@router.get("/dashboard/watchlist")
async def get_watchlist(symbols: str = Query(..., description="Comma-separated list of symbols")):
    """Get real-time data for watchlist symbols"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
        
        if not symbol_list:
            return []
        
        # Get quotes for all symbols
        tasks = [tiingo_client.get_quote(symbol) for symbol in symbol_list]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        watchlist = []
        for i, symbol in enumerate(symbol_list):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                watchlist.append({
                    'symbol': symbol,
                    'name': quote['name'],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume'],
                    'high': quote['high'],
                    'low': quote['low'],
                    'timestamp': quote['timestamp']
                })
        
        return watchlist
        
    except Exception as e:
        logger.error(f"Error fetching watchlist: {e}")
        return []

@router.get("/dashboard/performance")
async def get_performance_metrics():
    """Get performance metrics for dashboard"""
    try:
        return {
            'market_performance': {
                'SPY': {'1D': 0.85, '1W': 2.34, '1M': 5.67, 'YTD': 18.92},
                'QQQ': {'1D': 1.23, '1W': 3.45, '1M': 7.89, 'YTD': 22.15},
                'DIA': {'1D': 0.67, '1W': 1.78, '1M': 4.23, 'YTD': 15.67}
            },
            'sector_performance': {
                'Technology': {'1D': 1.45, '1W': 3.78, '1M': 8.92},
                'Healthcare': {'1D': 0.34, '1W': 1.23, '1M': 3.45},
                'Financials': {'1D': 0.89, '1W': 2.67, '1M': 6.78},
                'Energy': {'1D': 2.34, '1W': 5.67, '1M': 12.34}
            },
            'volatility': {
                'VIX': 18.45,
                'realized_30d': 22.67,
                'implied_30d': 24.89
            },
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching performance metrics: {e}")
        return {}

@router.get("/dashboard/alerts")
async def get_alerts():
    """Get active alerts and notifications"""
    try:
        # Mock alerts - in production these would be user-specific
        alerts = [
            {
                'id': 'alert_001',
                'type': 'price',
                'symbol': 'AAPL',
                'message': 'AAPL hit price target of $180',
                'severity': 'info',
                'timestamp': datetime.now().isoformat(),
                'active': True
            },
            {
                'id': 'alert_002',
                'type': 'volume',
                'symbol': 'TSLA',
                'message': 'TSLA volume 3x above average',
                'severity': 'warning',
                'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                'active': True
            },
            {
                'id': 'alert_003',
                'type': 'news',
                'symbol': 'HOOD',
                'message': 'Breaking news: Earnings report released',
                'severity': 'high',
                'timestamp': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'active': True
            }
        ]
        
        return alerts
        
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return []

@router.get("/dashboard/calendar")
async def get_calendar_events(days: int = Query(7, ge=1, le=30)):
    """Get upcoming calendar events for dashboard"""
    try:
        events = []
        
        # Generate mock events for the next few days
        for i in range(days):
            event_date = datetime.now() + timedelta(days=i)
            
            # Add earnings events
            if i < 5:  # Next 5 days
                events.append({
                    'date': event_date.strftime('%Y-%m-%d'),
                    'type': 'earnings',
                    'symbol': DASHBOARD_STOCKS[i % len(DASHBOARD_STOCKS)],
                    'event': 'Earnings Release',
                    'time': 'After Market Close',
                    'importance': 'high'
                })
            
            # Add economic events
            if i in [2, 4]:  # Specific days
                events.append({
                    'date': event_date.strftime('%Y-%m-%d'),
                    'type': 'economic',
                    'event': 'CPI Data Release' if i == 2 else 'Fed Meeting',
                    'time': '08:30 ET' if i == 2 else '14:00 ET',
                    'importance': 'high'
                })
        
        return events
        
    except Exception as e:
        logger.error(f"Error fetching calendar events: {e}")
        return []

def get_market_session_status():
    """Get current market session status"""
    current_hour = datetime.now().hour
    
    if 4 <= current_hour < 9:
        return {'status': 'premarket', 'next_open': '09:30 ET'}
    elif 9 <= current_hour <= 16:
        return {'status': 'open', 'next_close': '16:00 ET'}
    elif 16 < current_hour <= 20:
        return {'status': 'afterhours', 'next_open': '09:30 ET (next day)'}
    else:
        return {'status': 'closed', 'next_open': '09:30 ET (next day)'}

@router.get("/dashboard/health")
async def dashboard_health_check():
    """Health check for dashboard services"""
    try:
        # Test all data sources
        tiingo_test = await tiingo_client.get_quote('AAPL')
        news_test = await exa_news_client.get_market_news(1)
        
        return {
            'status': 'healthy',
            'services': {
                'tiingo': 'connected' if tiingo_test else 'fallback',
                'news': 'connected' if news_test else 'fallback',
                'ai_insights': 'operational',
                'dashboard_aggregation': 'operational'
            },
            'last_updated': datetime.now().isoformat(),
            'data_sources': ['tiingo', 'exa', 'ai_agents']
        }
        
    except Exception as e:
        logger.error(f"Dashboard health check failed: {e}")
        return {
            'status': 'degraded',
            'error': str(e),
            'services': {
                'tiingo': 'error',
                'news': 'error',
                'ai_insights': 'fallback',
                'dashboard_aggregation': 'limited'
            },
            'last_updated': datetime.now().isoformat()
        } 