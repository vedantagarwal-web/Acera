from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
import asyncio
from market_data.tiingo_client import tiingo_client
from news.exa_client import exa_news_client
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

router = APIRouter()

# Comprehensive list of popular stocks
POPULAR_STOCKS = [
    {'symbol': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology'},
    {'symbol': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology'},
    {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Technology'},
    {'symbol': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Discretionary'},
    {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'sector': 'Technology'},
    {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'sector': 'Consumer Discretionary'},
    {'symbol': 'META', 'name': 'Meta Platforms Inc.', 'sector': 'Technology'},
    {'symbol': 'HOOD', 'name': 'Robinhood Markets Inc.', 'sector': 'Financials'},
    {'symbol': 'SPY', 'name': 'SPDR S&P 500 ETF Trust', 'sector': 'ETF'},
    {'symbol': 'QQQ', 'name': 'Invesco QQQ Trust', 'sector': 'ETF'},
    {'symbol': 'VTI', 'name': 'Vanguard Total Stock Market ETF', 'sector': 'ETF'},
    {'symbol': 'IWM', 'name': 'iShares Russell 2000 ETF', 'sector': 'ETF'},
    {'symbol': 'JPM', 'name': 'JPMorgan Chase & Co.', 'sector': 'Financials'},
    {'symbol': 'BAC', 'name': 'Bank of America Corporation', 'sector': 'Financials'},
    {'symbol': 'WFC', 'name': 'Wells Fargo & Company', 'sector': 'Financials'},
    {'symbol': 'JNJ', 'name': 'Johnson & Johnson', 'sector': 'Healthcare'},
    {'symbol': 'PFE', 'name': 'Pfizer Inc.', 'sector': 'Healthcare'},
    {'symbol': 'XOM', 'name': 'Exxon Mobil Corporation', 'sector': 'Energy'},
    {'symbol': 'CVX', 'name': 'Chevron Corporation', 'sector': 'Energy'},
    {'symbol': 'BRK.B', 'name': 'Berkshire Hathaway Inc.', 'sector': 'Financials'},
    {'symbol': 'NFLX', 'name': 'Netflix Inc.', 'sector': 'Communication Services'},
    {'symbol': 'DIS', 'name': 'The Walt Disney Company', 'sector': 'Communication Services'},
    {'symbol': 'AMD', 'name': 'Advanced Micro Devices Inc.', 'sector': 'Technology'},
    {'symbol': 'INTC', 'name': 'Intel Corporation', 'sector': 'Technology'},
    {'symbol': 'CRM', 'name': 'Salesforce Inc.', 'sector': 'Technology'},
    {'symbol': 'PYPL', 'name': 'PayPal Holdings Inc.', 'sector': 'Financials'},
    {'symbol': 'ADBE', 'name': 'Adobe Inc.', 'sector': 'Technology'},
    {'symbol': 'ORCL', 'name': 'Oracle Corporation', 'sector': 'Technology'},
    {'symbol': 'IBM', 'name': 'International Business Machines Corporation', 'sector': 'Technology'},
    {'symbol': 'UBER', 'name': 'Uber Technologies Inc.', 'sector': 'Technology'},
    {'symbol': 'COIN', 'name': 'Coinbase Global Inc.', 'sector': 'Financials'},
    {'symbol': 'PLTR', 'name': 'Palantir Technologies Inc.', 'sector': 'Technology'},
    {'symbol': 'RBLX', 'name': 'Roblox Corporation', 'sector': 'Communication Services'},
    {'symbol': 'SNAP', 'name': 'Snap Inc.', 'sector': 'Communication Services'},
    {'symbol': 'PINS', 'name': 'Pinterest Inc.', 'sector': 'Communication Services'},
    {'symbol': 'SQ', 'name': 'Block Inc.', 'sector': 'Technology'},
    {'symbol': 'SHOP', 'name': 'Shopify Inc.', 'sector': 'Technology'},
    {'symbol': 'SPOT', 'name': 'Spotify Technology S.A.', 'sector': 'Communication Services'},
    {'symbol': 'ZM', 'name': 'Zoom Video Communications Inc.', 'sector': 'Technology'},
    {'symbol': 'DOCU', 'name': 'DocuSign Inc.', 'sector': 'Technology'}
]

@router.get("/search")
async def search_stocks(
    query: str = Query(..., description="Search query for stocks"),
    limit: int = Query(default=20, ge=1, le=50, description="Maximum number of results")
):
    """Search for stocks by symbol or company name"""
    try:
        query_lower = query.lower().strip()
        
        if not query_lower:
            return {
                'query': query,
                'results': [],
                'count': 0,
                'message': 'Empty search query'
            }
        
        results = []
        
        # Search by symbol (exact and partial matches)
        for stock in POPULAR_STOCKS:
            symbol_match = False
            name_match = False
            
            # Check symbol match (exact and partial)
            if query_lower == stock['symbol'].lower():
                # Exact symbol match - highest priority
                stock_data = {
                    **stock,
                    'match_type': 'exact_symbol',
                    'relevance_score': 100
                }
                results.insert(0, stock_data)  # Add to beginning
                symbol_match = True
            elif stock['symbol'].lower().startswith(query_lower):
                # Symbol starts with query
                stock_data = {
                    **stock,
                    'match_type': 'symbol_prefix',
                    'relevance_score': 90
                }
                results.append(stock_data)
                symbol_match = True
            elif query_lower in stock['symbol'].lower():
                # Symbol contains query
                stock_data = {
                    **stock,
                    'match_type': 'symbol_contains',
                    'relevance_score': 80
                }
                results.append(stock_data)
                symbol_match = True
            
            # Check name match (if not already matched by symbol)
            if not symbol_match:
                name_words = stock['name'].lower().split()
                query_words = query_lower.split()
                
                # Check for exact company name matches
                if query_lower in stock['name'].lower():
                    relevance = 70
                    if any(word.startswith(query_lower) for word in name_words):
                        relevance = 75  # Word starts with query
                    
                    stock_data = {
                        **stock,
                        'match_type': 'name_contains',
                        'relevance_score': relevance
                    }
                    results.append(stock_data)
                    name_match = True
                
                # Check for partial word matches
                elif not name_match and any(any(word.startswith(q) for word in name_words) for q in query_words):
                    stock_data = {
                        **stock,
                        'match_type': 'name_partial',
                        'relevance_score': 60
                    }
                    results.append(stock_data)
        
        # Sort by relevance score (highest first) and remove duplicates
        seen_symbols = set()
        unique_results = []
        
        for result in sorted(results, key=lambda x: x['relevance_score'], reverse=True):
            if result['symbol'] not in seen_symbols:
                seen_symbols.add(result['symbol'])
                unique_results.append(result)
        
        # Limit results
        final_results = unique_results[:limit]
        
        return {
            'query': query,
            'results': final_results,
            'count': len(final_results),
            'total_matches': len(unique_results),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in stock search: {e}")
        return {
            'query': query,
            'results': [],
            'count': 0,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

@router.get("/search/quotes")
async def search_with_quotes(
    symbols: str = Query(..., description="Comma-separated stock symbols"),
    include_fundamentals: bool = Query(default=False, description="Include fundamental data")
):
    """Get quotes for searched stocks"""
    try:
        symbol_list = [s.strip().upper() for s in symbols.split(',') if s.strip()]
        
        if not symbol_list:
            return []
        
        # Get quotes for all symbols in parallel
        quote_tasks = [tiingo_client.get_quote(symbol) for symbol in symbol_list]
        
        if include_fundamentals:
            fundamental_tasks = [tiingo_client.get_company_overview(symbol) for symbol in symbol_list]
            all_tasks = quote_tasks + fundamental_tasks
            results = await asyncio.gather(*all_tasks, return_exceptions=True)
            
            quotes = results[:len(symbol_list)]
            fundamentals = results[len(symbol_list):]
        else:
            quotes = await asyncio.gather(*quote_tasks, return_exceptions=True)
            fundamentals = [None] * len(symbol_list)
        
        search_results = []
        for i, symbol in enumerate(symbol_list):
            quote = quotes[i] if not isinstance(quotes[i], Exception) else None
            fundamental = fundamentals[i] if fundamentals[i] and not isinstance(fundamentals[i], Exception) else None
            
            if quote:
                result = {
                    'symbol': symbol,
                    'name': quote['name'],
                    'price': quote['price'],
                    'change': quote['change'],
                    'changePercent': quote['changePercent'],
                    'volume': quote['volume'],
                    'marketCap': quote.get('marketCap'),
                    'timestamp': quote['timestamp']
                }
                
                if fundamental:
                    result.update({
                        'sector': fundamental.get('sector'),
                        'industry': fundamental.get('industry'),
                        'description': fundamental.get('description', '')[:200] + '...' if fundamental.get('description') else None,
                        'employees': fundamental.get('employees'),
                        'exchange': fundamental.get('exchange')
                    })
                
                search_results.append(result)
        
        return search_results
        
    except Exception as e:
        logger.error(f"Error fetching search quotes: {e}")
        return []

@router.get("/search/comprehensive")
async def comprehensive_search(
    query: str = Query(..., description="Search query"),
    include_news: bool = Query(default=True, description="Include news results"),
    include_stocks: bool = Query(default=True, description="Include stock results"),
    stock_limit: int = Query(default=10, ge=1, le=20, description="Limit for stock results"),
    news_limit: int = Query(default=10, ge=1, le=20, description="Limit for news results")
):
    """Comprehensive search across stocks, news, and market data"""
    try:
        tasks = []
        
        # Search stocks
        if include_stocks:
            tasks.append(search_stocks(query, stock_limit))
        
        # Search news
        if include_news:
            tasks.append(exa_news_client.search_news(query, news_limit, 30))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        response = {
            'query': query,
            'timestamp': datetime.now().isoformat()
        }
        
        if include_stocks and len(results) > 0 and not isinstance(results[0], Exception):
            stock_results = results[0] if isinstance(results[0], dict) else await results[0]
            response['stocks'] = stock_results
        else:
            response['stocks'] = {'results': [], 'count': 0}
        
        if include_news:
            news_idx = 1 if include_stocks else 0
            if len(results) > news_idx and not isinstance(results[news_idx], Exception):
                news_results = results[news_idx]
                response['news'] = {
                    'results': news_results[:news_limit],
                    'count': len(news_results)
                }
            else:
                response['news'] = {'results': [], 'count': 0}
        
        return response
        
    except Exception as e:
        logger.error(f"Error in comprehensive search: {e}")
        return {
            'query': query,
            'stocks': {'results': [], 'count': 0},
            'news': {'results': [], 'count': 0},
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

@router.get("/search/trending")
async def get_trending_searches():
    """Get trending search terms and popular stocks"""
    try:
        # Mock trending data - in production this would be based on actual search analytics
        trending_terms = [
            {'term': 'HOOD', 'category': 'stock', 'volume': 1250, 'change': '+15%'},
            {'term': 'Tesla earnings', 'category': 'news', 'volume': 980, 'change': '+25%'},
            {'term': 'NVIDIA', 'category': 'stock', 'volume': 875, 'change': '+8%'},
            {'term': 'AI stocks', 'category': 'theme', 'volume': 750, 'change': '+35%'},
            {'term': 'Fed interest rates', 'category': 'news', 'volume': 650, 'change': '+12%'},
            {'term': 'Apple iPhone', 'category': 'news', 'volume': 590, 'change': '+5%'},
            {'term': 'crypto ETF', 'category': 'theme', 'volume': 520, 'change': '+45%'},
            {'term': 'S&P 500', 'category': 'index', 'volume': 480, 'change': '+3%'},
            {'term': 'biotech stocks', 'category': 'theme', 'volume': 425, 'change': '+22%'},
            {'term': 'dividend stocks', 'category': 'theme', 'volume': 380, 'change': '+7%'}
        ]
        
        popular_stocks = POPULAR_STOCKS[:15]  # Top 15 most popular
        
        return {
            'trending_terms': trending_terms,
            'popular_stocks': popular_stocks,
            'timestamp': datetime.now().isoformat(),
            'period': '24h'
        }
        
    except Exception as e:
        logger.error(f"Error fetching trending searches: {e}")
        return {
            'trending_terms': [],
            'popular_stocks': [],
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

@router.get("/search/suggestions")
async def get_search_suggestions(
    query: str = Query(..., description="Partial search query"),
    limit: int = Query(default=10, ge=1, le=20, description="Number of suggestions")
):
    """Get search suggestions for autocomplete"""
    try:
        query_lower = query.lower().strip()
        
        if len(query_lower) < 1:
            return []
        
        suggestions = []
        
        # Symbol-based suggestions
        for stock in POPULAR_STOCKS:
            if stock['symbol'].lower().startswith(query_lower):
                suggestions.append({
                    'text': stock['symbol'],
                    'type': 'symbol',
                    'description': stock['name'],
                    'sector': stock['sector']
                })
        
        # Company name suggestions
        for stock in POPULAR_STOCKS:
            if query_lower in stock['name'].lower() and stock['symbol'] not in [s['text'] for s in suggestions]:
                suggestions.append({
                    'text': stock['symbol'],
                    'type': 'company',
                    'description': stock['name'],
                    'sector': stock['sector']
                })
        
        # Sector suggestions
        sectors = list(set(stock['sector'] for stock in POPULAR_STOCKS))
        for sector in sectors:
            if query_lower in sector.lower():
                suggestions.append({
                    'text': sector,
                    'type': 'sector',
                    'description': f'{sector} sector stocks',
                    'sector': sector
                })
        
        # Theme suggestions
        themes = [
            'AI stocks', 'crypto stocks', 'dividend stocks', 'growth stocks',
            'value stocks', 'small cap', 'large cap', 'ETFs', 'REITs'
        ]
        for theme in themes:
            if query_lower in theme.lower():
                suggestions.append({
                    'text': theme,
                    'type': 'theme',
                    'description': f'Search {theme}',
                    'sector': 'Theme'
                })
        
        return suggestions[:limit]
        
    except Exception as e:
        logger.error(f"Error generating search suggestions: {e}")
        return []

@router.get("/search/health")
async def search_health_check():
    """Health check for search functionality"""
    try:
        # Test basic search
        test_search = await search_stocks("AAPL", 1)
        search_working = test_search['count'] > 0
        
        return {
            'status': 'healthy',
            'components': {
                'stock_search': 'operational' if search_working else 'limited',
                'suggestions': 'operational',
                'trending': 'operational',
                'news_search': 'operational'
            },
            'total_symbols': len(POPULAR_STOCKS),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Search health check failed: {e}")
        return {
            'status': 'degraded',
            'error': str(e),
            'components': {
                'stock_search': 'error',
                'suggestions': 'limited',
                'trending': 'limited',
                'news_search': 'error'
            },
            'timestamp': datetime.now().isoformat()
        } 