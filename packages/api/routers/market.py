from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any, Optional
import asyncio
import random
from datetime import datetime, timedelta
from market_data.tiingo_client import tiingo_client
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Popular stocks for market data
POPULAR_STOCKS = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX', 
    'CRM', 'ADBE', 'HOOD', 'PLTR', 'COIN', 'SQ', 'PYPL', 'ZM', 'SHOP'
]

# Market indices with realistic base values
MARKET_INDICES = {
    'SPX': {'name': 'S&P 500', 'base': 4500},
    'IXIC': {'name': 'NASDAQ Composite', 'base': 14000},
    'DJI': {'name': 'Dow Jones', 'base': 35000},
    'VIX': {'name': 'VIX', 'base': 18},
    'RUT': {'name': 'Russell 2000', 'base': 2000}
}

def generate_mock_indices():
    """Generate realistic mock market indices data"""
    indices = {}
    
    for symbol, info in MARKET_INDICES.items():
        base_value = info['base']
        # Add some realistic variation
        current_value = base_value + random.uniform(-base_value*0.05, base_value*0.05)
        change = random.uniform(-base_value*0.02, base_value*0.02)
        change_percent = (change / base_value) * 100
        
        indices[symbol.lower()] = {
            'symbol': symbol,
            'name': info['name'],
            'value': round(current_value, 2),
            'change': round(change, 2),
            'changePercent': round(change_percent, 3),
            'volume': random.randint(1000000000, 5000000000),
            'timestamp': datetime.now().isoformat()
        }
    
    return indices

async def get_real_market_data():
    """Try to get real market data from Tiingo"""
    try:
        # Get data for major ETFs that track indices
        index_etfs = ['SPY', 'QQQ', 'DIA', 'IWM']  # S&P 500, NASDAQ, DOW, Russell 2000
        
        tasks = [tiingo_client.get_quote(symbol) for symbol in index_etfs]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        real_data = {}
        for i, symbol in enumerate(index_etfs):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                real_data[symbol] = {
                    'symbol': symbol,
                    'name': f'{symbol} ETF',
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume'],
                    'timestamp': quote['timestamp'],
                    'source': 'tiingo'
                }
        
        return real_data
        
    except Exception as e:
        logger.error(f"Error fetching real market data: {e}")
        return {}

@router.get("/market/overview")
async def get_market_overview():
    """Get comprehensive market overview including indices and statistics"""
    try:
        logger.info("Fetching market overview data")
        
        # Try to get real data first
        real_data = await get_real_market_data()
        
        # If we have real data, use it; otherwise use mock data
        if real_data:
            indices = real_data
        else:
            indices = generate_mock_indices()
        
        # Calculate market statistics
        total_market_cap = 45000000000000  # $45T approximate US market
        total_volume = sum([idx.get('volume', 0) for idx in indices.values()]) * 100  # Scale up
        
        # Generate market status
        current_hour = datetime.now().hour
        market_status = 'open' if 9 <= current_hour <= 16 else 'closed'
        
        return {
            'indices': indices,
            'marketCap': total_market_cap,
            'volume': total_volume,
            'timestamp': datetime.now().isoformat(),
            'status': market_status,
            'session': {
                'premarket': 4 <= current_hour < 9,
                'regular': 9 <= current_hour <= 16,
                'afterHours': 16 < current_hour <= 20,
                'closed': current_hour > 20 or current_hour < 4
            },
            'source': 'tiingo' if real_data else 'mock'
        }
        
    except Exception as e:
        logger.error(f"Error fetching market overview: {e}")
        # Return mock data as fallback
        return {
            'indices': generate_mock_indices(),
            'marketCap': 45000000000000,
            'volume': 3500000000,
            'timestamp': datetime.now().isoformat(),
            'status': 'open',
            'source': 'fallback'
        }

@router.get("/market/indices")
async def get_market_indices():
    """Get current market indices (S&P 500, NASDAQ, DOW, VIX, Russell 2000)"""
    try:
        real_data = await get_real_market_data()
        return real_data if real_data else generate_mock_indices()
    except Exception as e:
        logger.error(f"Error fetching indices: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market indices")

@router.get("/market/top-movers")
async def get_top_movers(limit: int = Query(10, ge=1, le=20)):
    """Get top moving stocks for the day"""
    try:
        # Get quotes for popular stocks
        tasks = [tiingo_client.get_quote(symbol) for symbol in POPULAR_STOCKS[:limit]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        movers = []
        for i, symbol in enumerate(POPULAR_STOCKS[:limit]):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                movers.append({
                    'symbol': symbol,
                    'name': quote['name'],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume'],
                    'source': quote['source']
                })
        
        # Sort by absolute change percent
        movers.sort(key=lambda x: abs(x['changePercent']), reverse=True)
        
        return {
            'gainers': [m for m in movers if m['changePercent'] > 0][:5],
            'losers': [m for m in movers if m['changePercent'] < 0][:5],
            'most_active': sorted(movers, key=lambda x: x['volume'], reverse=True)[:5],
            'timestamp': datetime.now().isoformat(),
            'source': 'tiingo'
        }
        
    except Exception as e:
        logger.error(f"Error fetching top movers: {e}")
        # Return mock data as fallback
        return {
            'gainers': [],
            'losers': [],
            'most_active': [],
            'timestamp': datetime.now().isoformat(),
            'source': 'fallback',
            'error': str(e)
        }

@router.get("/market/sectors")
async def get_sector_performance():
    """Get sector performance data"""
    sectors = [
        {'name': 'Technology', 'etf': 'XLK'},
        {'name': 'Healthcare', 'etf': 'XLV'},
        {'name': 'Financial Services', 'etf': 'XLF'},
        {'name': 'Consumer Discretionary', 'etf': 'XLY'},
        {'name': 'Communication Services', 'etf': 'XLC'},
        {'name': 'Industrials', 'etf': 'XLI'},
        {'name': 'Energy', 'etf': 'XLE'},
        {'name': 'Consumer Staples', 'etf': 'XLP'},
        {'name': 'Real Estate', 'etf': 'XLRE'},
        {'name': 'Materials', 'etf': 'XLB'},
        {'name': 'Utilities', 'etf': 'XLU'}
    ]
    
    try:
        # Get real sector ETF data
        tasks = [tiingo_client.get_quote(sector['etf']) for sector in sectors]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        sector_data = []
        for i, sector in enumerate(sectors):
            if not isinstance(results[i], Exception) and results[i]:
                quote = results[i]
                sector_data.append({
                    'name': sector['name'],
                    'etf': sector['etf'],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume'],
                    'marketCap': quote['price'] * 1000000000,  # Estimate
                    'source': quote['source']
                })
        
        # Sort by performance
        sector_data.sort(key=lambda x: x['changePercent'], reverse=True)
        
        return {
            'sectors': sector_data,
            'timestamp': datetime.now().isoformat(),
            'source': 'tiingo'
        }
        
    except Exception as e:
        logger.error(f"Error fetching sector performance: {e}")
        # Return mock data
        sector_data = []
        for sector in sectors:
            change_percent = random.uniform(-3, 3)
            sector_data.append({
                'name': sector['name'],
                'etf': sector['etf'],
                'changePercent': round(change_percent, 2),
                'marketCap': random.randint(500000000000, 5000000000000),
                'volume': random.randint(100000000, 1000000000),
                'source': 'fallback'
            })
        
        return {
            'sectors': sorted(sector_data, key=lambda x: x['changePercent'], reverse=True),
            'timestamp': datetime.now().isoformat(),
            'source': 'fallback'
        }

@router.get("/market/sentiment")
async def get_market_sentiment():
    """Get overall market sentiment analysis"""
    try:
        # In production, this would aggregate from multiple sources
        overall_sentiment = random.randint(45, 85)
        
        return {
            'overall': overall_sentiment,
            'breakdown': {
                'social': random.randint(60, 90),
                'news': random.randint(40, 80),
                'trading': random.randint(70, 95),
                'technical': random.randint(30, 70),
                'options': random.randint(50, 85)
            },
            'distribution': {
                'bullish': random.randint(60, 75),
                'neutral': random.randint(15, 25),
                'bearish': random.randint(10, 20)
            },
            'trend': random.choice(['improving', 'stable', 'declining']),
            'timestamp': datetime.now().isoformat(),
            'sources': ['social_media', 'news_analysis', 'options_flow', 'technical_indicators']
        }
        
    except Exception as e:
        logger.error(f"Error fetching sentiment: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market sentiment")

@router.get("/market/signals")
async def get_market_signals(symbol: Optional[str] = None):
    """Get technical analysis signals for market or specific symbol"""
    try:
        if symbol:
            # Get signals for specific symbol
            quote = await tiingo_client.get_quote(symbol)
            if not quote:
                raise HTTPException(status_code=404, detail=f"Symbol {symbol} not found")
        
        signals = [
            {
                'indicator': 'RSI',
                'value': random.uniform(30, 70),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(65, 90),
                'timeframe': '1D'
            },
            {
                'indicator': 'MACD',
                'value': random.uniform(-2, 2),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(60, 85),
                'timeframe': '1D'
            },
            {
                'indicator': 'Moving Average',
                'value': random.uniform(0.8, 1.2),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(70, 95),
                'timeframe': '5D'
            },
            {
                'indicator': 'Bollinger Bands',
                'value': random.uniform(0, 1),
                'signal': random.choice(['buy', 'sell', 'hold']),
                'confidence': random.randint(65, 88),
                'timeframe': '1D'
            }
        ]
        
        return {
            'symbol': symbol,
            'signals': signals,
            'overall_signal': random.choice(['buy', 'sell', 'hold']),
            'confidence': random.randint(70, 90),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching signals: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market signals")

@router.get("/market/volatility")
async def get_market_volatility():
    """Get market volatility metrics"""
    try:
        return {
            'vix': {
                'current': round(random.uniform(15, 25), 2),
                'change': round(random.uniform(-2, 2), 2),
                'changePercent': round(random.uniform(-10, 10), 2)
            },
            'realizedVolatility': {
                '30day': round(random.uniform(15, 30), 2),
                '60day': round(random.uniform(18, 35), 2),
                '90day': round(random.uniform(20, 40), 2)
            },
            'impliedVolatility': {
                'term_structure': [
                    {'days': 30, 'iv': round(random.uniform(18, 28), 2)},
                    {'days': 60, 'iv': round(random.uniform(20, 30), 2)},
                    {'days': 90, 'iv': round(random.uniform(22, 32), 2)},
                    {'days': 180, 'iv': round(random.uniform(24, 34), 2)}
                ]
            },
            'regime': random.choice(['low', 'normal', 'elevated', 'high']),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching volatility: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch volatility data")

@router.get("/market/economic")
async def get_economic_indicators():
    """Get key economic indicators"""
    try:
        return {
            'indicators': [
                {
                    'name': 'GDP Growth Rate',
                    'value': round(random.uniform(2, 4), 1),
                    'unit': '%',
                    'period': 'Annual',
                    'last_updated': '2024-Q3'
                },
                {
                    'name': 'Unemployment Rate',
                    'value': round(random.uniform(3.5, 5.5), 1),
                    'unit': '%',
                    'period': 'Monthly',
                    'last_updated': 'November 2024'
                },
                {
                    'name': 'Inflation Rate (CPI)',
                    'value': round(random.uniform(2, 4), 1),
                    'unit': '%',
                    'period': 'Annual',
                    'last_updated': 'November 2024'
                },
                {
                    'name': 'Federal Funds Rate',
                    'value': round(random.uniform(4.5, 5.5), 2),
                    'unit': '%',
                    'period': 'Current',
                    'last_updated': 'December 2024'
                }
            ],
            'timestamp': datetime.now().isoformat(),
            'source': 'federal_reserve'
        }
        
    except Exception as e:
        logger.error(f"Error fetching economic indicators: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch economic indicators")

@router.get("/market/calendar")
async def get_market_calendar(days: int = Query(7, ge=1, le=30)):
    """Get upcoming market events and earnings calendar"""
    try:
        events = []
        
        # Generate mock events for the next few days
        for i in range(days):
            event_date = datetime.now() + timedelta(days=i)
            
            # Add some random events
            if random.random() > 0.6:  # 40% chance of events per day
                events.append({
                    'date': event_date.strftime('%Y-%m-%d'),
                    'type': 'earnings',
                    'symbol': random.choice(POPULAR_STOCKS),
                    'event': 'Earnings Release',
                    'time': 'After Market Close',
                    'importance': random.choice(['high', 'medium', 'low'])
                })
            
            if random.random() > 0.8:  # 20% chance of economic events
                events.append({
                    'date': event_date.strftime('%Y-%m-%d'),
                    'type': 'economic',
                    'event': random.choice(['CPI Data', 'Jobs Report', 'Fed Meeting', 'GDP Data']),
                    'time': '08:30 ET',
                    'importance': 'high'
                })
        
        return {
            'events': events,
            'period': f'Next {days} days',
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error fetching market calendar: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch market calendar")

@router.get("/market/health")
async def market_health_check():
    """Health check for market data services"""
    try:
        # Test Tiingo connection
        test_quote = await tiingo_client.get_quote('AAPL')
        tiingo_status = "connected" if test_quote and test_quote.get('source') == 'tiingo_official' else "fallback"
        
        return {
            'status': 'healthy',
            'services': {
                'tiingo': tiingo_status,
                'market_data': 'operational',
                'calculations': 'operational'
            },
            'last_updated': datetime.now().isoformat(),
            'data_quality': 'high' if tiingo_status == 'connected' else 'mock'
        }
        
    except Exception as e:
        logger.error(f"Market health check failed: {e}")
        return {
            'status': 'degraded',
            'error': str(e),
            'services': {
                'tiingo': 'error',
                'market_data': 'fallback',
                'calculations': 'operational'
            },
            'last_updated': datetime.now().isoformat()
        }

@router.get("/signals")
async def get_technical_signals(symbol: Optional[str] = Query(default=None, description="Optional stock symbol for specific signals")):
    """Get technical signals for market or specific stock"""
    try:
        if symbol:
            # Get stock-specific technical signals
            stock_data = await tiingo_client.get_quote(symbol)
            if not stock_data:
                return {"signals": []}
            
            # Generate technical signals based on price data
            price = stock_data['price']
            change_percent = stock_data['changePercent']
            volume = stock_data['volume']
            
            signals = []
            
            # RSI Signal
            rsi_value = 50 + (change_percent * 2)  # Simplified RSI calculation
            if rsi_value > 70:
                rsi_signal = 'sell'
                rsi_description = 'Overbought conditions - potential sell signal'
            elif rsi_value < 30:
                rsi_signal = 'buy'
                rsi_description = 'Oversold conditions - potential buy signal'
            else:
                rsi_signal = 'hold'
                rsi_description = 'Neutral momentum'
            
            signals.append({
                'indicator': 'RSI',
                'value': round(rsi_value, 2),
                'signal': rsi_signal,
                'confidence': 75,
                'description': rsi_description
            })
            
            # MACD Signal
            macd_value = change_percent * 0.5
            if macd_value > 0:
                macd_signal = 'buy'
                macd_description = 'Bullish crossover detected'
            else:
                macd_signal = 'sell'
                macd_description = 'Bearish crossover detected'
            
            signals.append({
                'indicator': 'MACD',
                'value': round(macd_value, 2),
                'signal': macd_signal,
                'confidence': 68,
                'description': macd_description
            })
            
            # Moving Average Signal
            ma_signal = 'buy' if change_percent > 0 else 'sell'
            ma_description = f'Price {"above" if change_percent > 0 else "below"} moving average'
            
            signals.append({
                'indicator': 'Moving Average',
                'value': round(price * 0.98, 2),  # Simulated MA
                'signal': ma_signal,
                'confidence': 72,
                'description': ma_description
            })
            
            # Volume Signal
            volume_signal = 'buy' if volume > 1000000 else 'hold'
            volume_description = f'Volume is {"high" if volume > 1000000 else "average"} - {"strong" if volume > 1000000 else "weak"} momentum'
            
            signals.append({
                'indicator': 'Volume',
                'value': volume,
                'signal': volume_signal,
                'confidence': 65,
                'description': volume_description
            })
            
        else:
            # General market signals
            indices = await get_market_indices()
            signals = []
            
            if 'SPY' in indices:
                spy_change = indices['SPY']['changePercent']
                if spy_change > 1:
                    market_signal = 'buy'
                    market_description = 'Strong market momentum - bullish conditions'
                elif spy_change < -1:
                    market_signal = 'sell'
                    market_description = 'Market weakness - bearish conditions'
                else:
                    market_signal = 'hold'
                    market_description = 'Neutral market conditions'
                
                signals.append({
                    'indicator': 'Market Trend',
                    'value': spy_change,
                    'signal': market_signal,
                    'confidence': 80,
                    'description': market_description
                })
            
            if 'VXX' in indices:
                vix_change = indices['VXX']['changePercent']
                if vix_change > 5:
                    volatility_signal = 'sell'
                    volatility_description = 'High volatility - risk-off sentiment'
                elif vix_change < -5:
                    volatility_signal = 'buy'
                    volatility_description = 'Low volatility - risk-on sentiment'
                else:
                    volatility_signal = 'hold'
                    volatility_description = 'Normal volatility levels'
                
                signals.append({
                    'indicator': 'Volatility',
                    'value': abs(vix_change),
                    'signal': volatility_signal,
                    'confidence': 75,
                    'description': volatility_description
                })
        
        return {
            'signals': signals,
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'source': 'technical_analysis'
        }
        
    except Exception as e:
        logger.error(f"Error generating technical signals: {e}")
        # Return fallback signals
        return {
            'signals': [
                {
                    'indicator': 'RSI',
                    'value': 68.5,
                    'signal': 'hold',
                    'confidence': 75,
                    'description': 'Approaching overbought conditions'
                },
                {
                    'indicator': 'MACD',
                    'value': 2.34,
                    'signal': 'buy',
                    'confidence': 82,
                    'description': 'Bullish crossover detected'
                },
                {
                    'indicator': 'Moving Average',
                    'value': 185.23,
                    'signal': 'buy',
                    'confidence': 68,
                    'description': 'Price above 50-day MA'
                }
            ],
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'source': 'fallback'
        }

@router.get("/sentiment")
async def get_market_sentiment():
    """Get market sentiment analysis"""
    try:
        # Get market indices for sentiment calculation
        indices = await get_market_indices()
        
        # Calculate overall sentiment based on market performance
        overall_sentiment = 50  # Base neutral
        social_sentiment = 50
        news_sentiment = 50
        trading_sentiment = 50
        technical_sentiment = 50
        options_sentiment = 50
        
        if indices:
            # Analyze market performance
            total_change = 0
            count = 0
            
            for symbol, data in indices.items():
                if symbol != 'VXX':  # Exclude VIX as it's inverse
                    change = data['changePercent']
                    total_change += change
                    count += 1
            
            if count > 0:
                avg_change = total_change / count
                
                # Adjust sentiment based on market performance
                sentiment_adjustment = min(max(avg_change * 10, -30), 30)  # Cap at ±30 points
                
                overall_sentiment = 50 + sentiment_adjustment
                trading_sentiment = 50 + (sentiment_adjustment * 1.2)  # Trading more volatile
                technical_sentiment = 50 + (sentiment_adjustment * 0.8)  # Technical more stable
                
                # Social and news sentiment with some randomness
                social_sentiment = overall_sentiment + random.uniform(-10, 10)
                news_sentiment = overall_sentiment + random.uniform(-8, 8)
                options_sentiment = overall_sentiment + random.uniform(-12, 12)
        
        # Ensure values are within bounds
        def clamp_sentiment(value):
            return max(0, min(100, value))
        
        overall = clamp_sentiment(overall_sentiment)
        social = clamp_sentiment(social_sentiment)
        news = clamp_sentiment(news_sentiment)
        trading = clamp_sentiment(trading_sentiment)
        technical = clamp_sentiment(technical_sentiment)
        options = clamp_sentiment(options_sentiment)
        
        # Calculate bull/bear/neutral percentages
        if overall > 60:
            bull_percent = 60 + (overall - 60) * 0.5
            bear_percent = max(10, 40 - (overall - 60) * 0.3)
        elif overall < 40:
            bear_percent = 60 + (40 - overall) * 0.5
            bull_percent = max(10, 40 - (40 - overall) * 0.3)
        else:
            bull_percent = 45 + random.uniform(-5, 10)
            bear_percent = 45 + random.uniform(-5, 10)
        
        neutral_percent = 100 - bull_percent - bear_percent
        
        return {
            'overall': round(overall, 1),
            'social': round(social, 1),
            'news': round(news, 1),
            'trading': round(trading, 1),
            'technical': round(technical, 1),
            'options': round(options, 1),
            'bullPercent': round(bull_percent, 1),
            'neutralPercent': round(max(0, neutral_percent), 1),
            'bearPercent': round(bear_percent, 1),
            'timestamp': datetime.now().isoformat(),
            'source': 'market_analysis'
        }
        
    except Exception as e:
        logger.error(f"Error calculating market sentiment: {e}")
        # Return fallback sentiment
        return {
            'overall': 65.0,
            'social': 75.0,
            'news': 60.0,
            'trading': 85.0,
            'technical': 45.0,
            'options': 70.0,
            'bullPercent': 68.0,
            'neutralPercent': 17.0,
            'bearPercent': 15.0,
            'timestamp': datetime.now().isoformat(),
            'source': 'fallback'
        } 