from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
import asyncio
import random
from datetime import datetime, timedelta
from market_data.alpha_vantage import alpha_vantage_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Mock data generators for when API limits are hit
def generate_mock_indices():
    """Generate realistic mock market indices data"""
    base_values = {
        'SPX': 4500,
        'IXIC': 14000, 
        'DJI': 35000,
        'VIX': 18
    }
    
    return {
        'sp500': {
            'value': base_values['SPX'] + random.uniform(-50, 50),
            'change': random.uniform(-30, 30),
            'changePercent': random.uniform(-1.5, 1.5)
        },
        'nasdaq': {
            'value': base_values['IXIC'] + random.uniform(-200, 200),
            'change': random.uniform(-100, 100),
            'changePercent': random.uniform(-2, 2)
        },
        'dow': {
            'value': base_values['DJI'] + random.uniform(-300, 300),
            'change': random.uniform(-200, 200),
            'changePercent': random.uniform(-1, 1)
        },
        'vix': {
            'value': base_values['VIX'] + random.uniform(-3, 3),
            'change': random.uniform(-2, 2),
            'changePercent': random.uniform(-10, 10)
        }
    }

def generate_mock_chart_data():
    """Generate mock intraday chart data"""
    now = datetime.now()
    data = []
    
    for i in range(20):
        timestamp = now - timedelta(minutes=i*5)
        value = 4500 + random.uniform(-100, 100) + (i * random.uniform(-2, 2))
        data.append({
            'time': timestamp.isoformat(),
            'value': value
        })
    
    return list(reversed(data))

def generate_mock_top_movers():
    """Generate mock top movers data"""
    symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 'CRM', 'ADBE']
    movers = []
    
    for symbol in symbols[:6]:
        price = random.uniform(100, 500)
        change_percent = random.uniform(-8, 8)
        change = price * (change_percent / 100)
        
        movers.append({
            'symbol': symbol,
            'name': f'{symbol} Inc.',
            'price': round(price, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 2),
            'volume': random.randint(1000000, 50000000)
        })
    
    return sorted(movers, key=lambda x: abs(x['changePercent']), reverse=True)

@router.get("/market/overview")
async def get_market_overview():
    """Get comprehensive market overview including indices and statistics"""
    try:
        # Try to get real data first
        logger.info("Fetching market overview data")
        
        # For now, use mock data due to API limits
        # In production, you'd implement real API calls here
        indices = generate_mock_indices()
        chart = generate_mock_chart_data()
        
        return {
            'indices': indices,
            'marketCap': 45000000000000,  # $45T
            'volume': 3500000000,  # 3.5B shares
            'chart': chart,
            'timestamp': datetime.now().isoformat(),
            'status': 'open' if 9 <= datetime.now().hour <= 16 else 'closed'
        }
        
    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        # Return mock data as fallback
        return {
            'indices': generate_mock_indices(),
            'marketCap': 45000000000000,
            'volume': 3500000000,
            'chart': generate_mock_chart_data(),
            'timestamp': datetime.now().isoformat(),
            'status': 'open',
            'source': 'mock'
        }

@router.get("/indices")
async def get_market_indices():
    """Get current market indices (S&P 500, NASDAQ, DOW, VIX)"""
    try:
        return generate_mock_indices()
    except Exception as e:
        logger.error(f"Error fetching indices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market indices")

@router.get("/top-movers")
async def get_top_movers():
    """Get top moving stocks for the day"""
    try:
        movers = generate_mock_top_movers()
        
        return {
            'gainers': [m for m in movers if m['changePercent'] > 0][:3],
            'losers': [m for m in movers if m['changePercent'] < 0][:3],
            'most_active': movers[:3],
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching top movers: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch top movers")

@router.get("/sectors")
async def get_sector_performance():
    """Get sector performance data"""
    sectors = [
        'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
        'Communication Services', 'Industrials', 'Energy', 'Consumer Defensive',
        'Real Estate', 'Basic Materials', 'Utilities'
    ]
    
    sector_data = []
    for sector in sectors:
        change_percent = random.uniform(-3, 3)
        sector_data.append({
            'name': sector,
            'changePercent': round(change_percent, 2),
            'marketCap': random.randint(500000000000, 5000000000000),
            'volume': random.randint(100000000, 1000000000)
        })
    
    return {
        'sectors': sorted(sector_data, key=lambda x: x['changePercent'], reverse=True),
        'timestamp': datetime.now().isoformat()
    }

@router.get("/sentiment")
async def get_market_sentiment():
    """Get overall market sentiment analysis"""
    try:
        # Mock sentiment data - in production this would aggregate from multiple sources
        overall_sentiment = random.randint(45, 85)
        
        return {
            'overall': overall_sentiment,
            'social': random.randint(60, 90),
            'news': random.randint(40, 80),
            'trading': random.randint(70, 95),
            'technical': random.randint(30, 70),
            'options': random.randint(50, 85),
            'bullPercent': random.randint(60, 75),
            'neutralPercent': random.randint(15, 25),
            'bearPercent': random.randint(10, 20),
            'timestamp': datetime.now().isoformat(),
            'sources': ['social_media', 'news_analysis', 'options_flow', 'technical_indicators']
        }
        
    except Exception as e:
        logger.error(f"Error fetching sentiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market sentiment")

@router.get("/signals")
async def get_market_signals(symbol: Optional[str] = None):
    """Get technical analysis signals for market or specific symbol"""
    try:
        signals = [
            {
                'indicator': 'RSI',
                'value': random.uniform(30, 70),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(65, 90),
                'description': 'Relative Strength Index indicating momentum'
            },
            {
                'indicator': 'MACD',
                'value': random.uniform(-2, 4),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(70, 85),
                'description': 'MACD crossover signal detected'
            },
            {
                'indicator': 'Moving Average',
                'value': random.uniform(180, 200),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(60, 80),
                'description': 'Price relative to 50-day moving average'
            }
        ]
        
        return {
            'signals': signals,
            'symbol': symbol or 'SPY',
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market signals")

@router.get("/search")
async def search_stocks(q: str, limit: int = 10):
    """Search for stocks by symbol or company name"""
    try:
        # Mock search results - in production this would query a stock database
        all_stocks = [
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'exchange': 'NASDAQ'},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc. Class A', 'exchange': 'NASDAQ'},
            {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ'},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'exchange': 'NASDAQ'},
            {'symbol': 'BRK.B', 'name': 'Berkshire Hathaway Inc. Class B', 'exchange': 'NYSE'},
            {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'exchange': 'NYSE'},
            {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'exchange': 'NYSE'}
        ]
        
        # Filter based on query
        query_lower = q.lower()
        filtered_stocks = [
            stock for stock in all_stocks
            if query_lower in stock['symbol'].lower() or query_lower in stock['name'].lower()
        ]
        
        # Add mock price data
        results = []
        for stock in filtered_stocks[:limit]:
            price = random.uniform(100, 400)
            change_percent = random.uniform(-5, 5)
            results.append({
                'symbol': stock['symbol'],
                'name': stock['name'],
                'price': round(price, 2),
                'change': round(price * (change_percent / 100), 2),
                'changePercent': round(change_percent, 2),
                'volume': random.randint(1000000, 100000000),
                'marketCap': random.randint(100000000000, 3000000000000),
                'high52w': round(price * random.uniform(1.1, 1.5), 2),
                'low52w': round(price * random.uniform(0.6, 0.9), 2),
                'exchange': stock['exchange']
            })
        
        return results
        
    except Exception as e:
        logger.error(f"Error searching stocks: {e}")
        raise HTTPException(status_code=500, detail="Failed to search stocks") 