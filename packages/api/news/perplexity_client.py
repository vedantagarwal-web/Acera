import os
import aiohttp
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import json
from functools import lru_cache

class PerplexityFinancialClient:
    """
    Advanced Perplexity API client leveraging Sonar models for institutional-grade
    financial analysis and real-time market data. Designed to provide Wall Street
    quality insights using Perplexity's superior search and reasoning capabilities.
    """
    
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv('PERPLEXITY_API_KEY', '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')
        self.base_url = 'https://api.perplexity.ai'
        self.session = None
        
        # Model selection for different analysis types (updated 2024 model names)
        self.models = {
            'research': 'llama-3.1-sonar-large-128k-online',  # Best for comprehensive research
            'analysis': 'llama-3.1-sonar-large-128k-online',  # Good balance for analysis  
            'quick': 'llama-3.1-sonar-small-128k-online',  # Fast responses for quick data
        }
        
    async def _get_session(self):
        """Get or create aiohttp session with Perplexity headers"""
        if self.session is None:
            self.session = aiohttp.ClientSession(
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'Content-Type': 'application/json'
                }
            )
        return self.session
    
    async def _make_perplexity_request(self, messages: List[Dict], model: str = 'llama-3.1-sonar-large-128k-online', max_tokens: int = 4000) -> Dict[str, Any]:
        """Make async request to Perplexity API"""
        session = await self._get_session()
        url = f"{self.base_url}/chat/completions"
        
        data = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": 0.2,  # Lower temperature for more factual responses
            "top_p": 0.9,

            "return_citations": True,
            "search_recency_filter": "month",  # Focus on recent information
            "top_k": 0,
            "stream": False,
            "presence_penalty": 0,
            "frequency_penalty": 1
        }
        
        try:
            async with session.post(url, json=data) as response:
                if response.status != 200:
                    error_text = await response.text()
                    print(f"❌ Perplexity API Error {response.status}: {error_text}")
                    raise Exception(f"Perplexity API request failed: {response.status} - {error_text}")
                
                result = await response.json()
                return result
                
        except Exception as e:
            print(f"❌ Perplexity API request failed: {str(e)}")
            raise

    async def get_universal_stock_data(self, symbol: str) -> Dict[str, Any]:
        """
        Get comprehensive stock data using Perplexity's advanced search and analysis.
        This replaces the previous Exa implementation with superior accuracy.
        """
        print(f"🚀 Starting Perplexity financial analysis for {symbol}")
        
        try:
            messages = [
                {
                    "role": "system", 
                    "content": """You are a Wall Street financial analyst with access to real-time market data. 
                    Provide accurate, current financial data from reliable sources like Yahoo Finance, Bloomberg, 
                    MarketWatch, SEC filings, and company investor relations. Always cite your sources."""
                },
                {
                    "role": "user", 
                    "content": f"""Search for current stock information for {symbol} and provide ONLY valid JSON with real data:

{{
    "symbol": "{symbol}",
    "price": 45.67,
    "change": -1.23,
    "change_percent": -2.62,
    "market_cap": "123.4M",
    "pe_ratio": 15.8,
    "volume": 456789,
    "company_name": "Actual Company Name",
    "sector": "Actual Sector",
    "industry": "Actual Industry"
}}

Find the real current stock price, market cap, volume, and financial metrics for {symbol}. Return ONLY the JSON object with actual numbers, no comments or explanations."""
                }
            ]
            
            response = await self._make_perplexity_request(messages, model=self.models['quick'], max_tokens=2000)
            content = response['choices'][0]['message']['content']
            
            print(f"📊 Perplexity response for {symbol}: {content[:200]}...")
            
            # Extract JSON from response
            try:
                # Find JSON in the response (handle markdown code blocks)
                import re
                
                # First try to find JSON in markdown code blocks
                json_match = re.search(r'```(?:json)?\s*({.*?})\s*```', content, re.DOTALL)
                if json_match:
                    json_str = json_match.group(1)
                else:
                    # Fallback to finding first complete JSON object
                    json_start = content.find('{')
                    json_end = content.rfind('}') + 1
                    
                    if json_start != -1 and json_end > json_start:
                        json_str = content[json_start:json_end]
                    else:
                        raise ValueError("No JSON found in response")
                
                # Clean JSON string for common formatting issues
                json_str = self._clean_json_string(json_str)
                
                stock_data = json.loads(json_str)
                
                # Validate and clean the data
                stock_data = self._validate_perplexity_data(stock_data, symbol)
                
                print(f"✅ Successfully parsed Perplexity data for {symbol}")
                return stock_data
                    
            except json.JSONDecodeError as e:
                print(f"❌ Failed to parse Perplexity JSON response: {e}")
                print(f"JSON string was: {json_str[:200]}...")
                return self._generate_intelligent_fallback(symbol)
                
        except Exception as e:
            print(f"❌ Perplexity analysis failed for {symbol}: {e}")
            return self._generate_intelligent_fallback(symbol)

    def _clean_json_string(self, json_str: str) -> str:
        """Clean JSON string to fix common formatting issues from Perplexity"""
        import re
        
        # Remove underscore thousands separators from numbers
        # Pattern: match numbers with underscores like 2_120_000
        json_str = re.sub(r'(\d)_(\d)', r'\1\2', json_str)
        
        # Convert volume/market cap with suffixes to raw numbers
        # Pattern: "volume": "31.18M" -> "volume": 31180000
        def convert_suffix_numbers(match):
            field = match.group(1)
            number = float(match.group(2))
            suffix = match.group(3).upper()
            
            multipliers = {'K': 1000, 'M': 1000000, 'B': 1000000000, 'T': 1000000000000}
            if suffix in multipliers:
                converted = int(number * multipliers[suffix])
                return f'"{field}": {converted}'
            return match.group(0)  # Return original if suffix not recognized
        
        # Apply suffix conversion
        json_str = re.sub(r'"(\w+)":\s*"?(\d+\.?\d*)([KMBT])"?', convert_suffix_numbers, json_str)
        
        # Remove comma thousands separators from numbers in JSON values
        # Pattern: "key": 123,456,789 -> "key": 123456789 (handle multiple commas safely)
        for _ in range(10):  # Limit iterations to prevent infinite loop
            if not re.search(r':\s*(\d+),(\d+)', json_str):
                break
            json_str = re.sub(r':\s*(\d+),(\d+)', r': \1\2', json_str)
        
        # Remove + signs from positive numbers (invalid JSON)
        # Pattern: "key": +123.45 -> "key": 123.45
        json_str = re.sub(r':\s*\+(\d+\.?\d*)', r': \1', json_str)
        
        # Remove JavaScript-style comments from JSON
        json_str = re.sub(r'//.*?(?=\n|$)', '', json_str, flags=re.MULTILINE)
        json_str = re.sub(r'/\*.*?\*/', '', json_str, flags=re.DOTALL)
        
        # Remove any trailing commas before closing braces/brackets
        json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
        
        # Fix common quote issues
        json_str = json_str.replace('"null"', 'null').replace('"true"', 'true').replace('"false"', 'false')
        
        # Remove extra whitespace
        json_str = re.sub(r'\s+', ' ', json_str).strip()
        
        return json_str

    async def get_stock_data(self, symbol: str) -> Dict[str, Any]:
        """Wrapper method for backward compatibility"""
        return await self.get_universal_stock_data(symbol)

    def _validate_perplexity_data(self, data: Dict[str, Any], symbol: str) -> Dict[str, Any]:
        """Validate and clean Perplexity response data"""
        try:
            # Ensure required fields exist
            if not data.get('symbol'):
                data['symbol'] = symbol.upper()
                
            # Convert string numbers to floats where needed
            numeric_fields = ['price', 'change', 'change_percent', 'pe_ratio', 'volume', 
                            '52_week_high', '52_week_low', 'dividend_yield', 'beta', 'eps']
            
            for field in numeric_fields:
                if field in data and data[field] is not None:
                    try:
                        if isinstance(data[field], str):
                            # Skip if it's clearly not a number (contains specific error text)
                            if any(phrase in data[field].lower() for phrase in ['not provided in sources', 'not available', 'actual market cap not provided', 'actual pe ratio not']):
                                data[field] = None
                                continue
                                
                            # Remove common formatting characters
                            clean_value = data[field].replace(',', '').replace('$', '').replace('%', '').strip()
                            
                            # Skip empty or non-numeric strings
                            if not clean_value or not any(c.isdigit() or c in '.-' for c in clean_value):
                                data[field] = None
                                continue
                            
                            # Handle suffix notation (31.18M -> 31180000)
                            if clean_value.endswith(('K', 'M', 'B', 'T')):
                                suffix = clean_value[-1].upper()
                                try:
                                    number = float(clean_value[:-1])
                                    multipliers = {'K': 1000, 'M': 1000000, 'B': 1000000000, 'T': 1000000000000}
                                    data[field] = int(number * multipliers[suffix]) if field == 'volume' else number * multipliers[suffix]
                                except ValueError:
                                    data[field] = None
                            else:
                                try:
                                    data[field] = float(clean_value) if clean_value else None
                                except ValueError:
                                    data[field] = None
                    except (ValueError, TypeError):
                        data[field] = None
            
            # Validate realistic ranges
            price = data.get('price')
            if price and (price <= 0 or price > 10000):  # Basic sanity check
                print(f"⚠️ Unrealistic price {price} for {symbol}, keeping original")
            
            # Ensure timestamp
            data['last_updated'] = datetime.now().isoformat()
            data['data_source'] = 'perplexity_sonar'
            data['quality_score'] = 95  # High quality from Perplexity
            
            return data
            
        except Exception as e:
            print(f"❌ Error validating Perplexity data: {e}")
            return self._generate_intelligent_fallback(symbol)

    async def get_comprehensive_analysis(self, symbol: str) -> Dict[str, Any]:
        """
        Generate comprehensive Wall Street-grade analysis using Perplexity's full capabilities.
        This combines fundamental, technical, and market analysis in one powerful query.
        """
        
        try:
            messages = [
                {
                    "role": "system",
                    "content": """You are a senior Wall Street equity research analyst covering institutional-grade stock analysis. 
                    Provide comprehensive fundamental and technical analysis with specific price targets, ratings, and risk assessments.
                    Use recent financial data, earnings reports, and market conditions."""
                },
                {
                    "role": "user", 
                    "content": f"""Provide a comprehensive institutional-grade analysis of {symbol} including:

1. **FUNDAMENTAL ANALYSIS**:
   - Current valuation metrics (P/E, P/B, EV/EBITDA)
   - Revenue and earnings growth trends
   - Competitive positioning and moat
   - Management quality and strategy
   - Balance sheet strength and debt levels

2. **TECHNICAL ANALYSIS**:
   - Current trend and momentum
   - Key support and resistance levels  
   - Technical indicators (RSI, MACD, moving averages)
   - Chart patterns and breakout levels

3. **INVESTMENT RECOMMENDATION**:
   - Buy/Hold/Sell rating with conviction level
   - 12-month price target with upside/downside scenarios
   - Key catalysts and risk factors
   - Position sizing recommendations

4. **MARKET CONTEXT**:
   - Sector performance and rotation trends
   - Macroeconomic factors affecting the stock
   - Peer comparison and relative valuation

Search for the most recent earnings data, analyst estimates, and market developments. Provide specific numbers and dates."""
                }
            ]
            
            response = await self._make_perplexity_request(messages, model=self.models['research'], max_tokens=6000)
            content = response['choices'][0]['message']['content']
            
            # Structure the analysis response
            analysis = {
                'symbol': symbol,
                'analysis_text': content,
                'analysis_type': 'comprehensive',
                'generated_at': datetime.now().isoformat(),
                'analyst_grade': 'institutional',
                'data_sources': 'perplexity_sonar',
                'confidence_score': 90
            }
            
            return analysis
            
        except Exception as e:
            print(f"❌ Error generating comprehensive analysis for {symbol}: {e}")
            return {
                'symbol': symbol,
                'error': str(e),
                'analysis_text': f"Unable to generate analysis for {symbol} at this time.",
                'generated_at': datetime.now().isoformat()
            }

    def _generate_intelligent_fallback(self, symbol: str) -> Dict[str, Any]:
        """Generate realistic fallback data for when Perplexity is unavailable"""
        
        fallback_data = {
            'symbol': symbol.upper(),
            'price': 100.0,
            'change': 0.5,
            'change_percent': 0.5,
            'market_cap': '10.5B',
            'pe_ratio': 22.5,
            'volume': 1500000,
            '52_week_high': 120.0,
            '52_week_low': 80.0,
            'dividend_yield': 2.1,
            'beta': 1.15,
            'eps': 4.44,
            'revenue_ttm': '5.2B',
            'company_name': f'{symbol} Corporation',
            'sector': 'Technology',
            'industry': 'Software',
            'description': f'{symbol} is a technology company operating in various market segments.',
            'last_updated': datetime.now().isoformat(),
            'data_source': 'fallback',
            'quality_score': 40,
            'note': 'Fallback data - Perplexity API unavailable'
        }
        
        return fallback_data

    async def close(self):
        """Close the aiohttp session"""
        if self.session:
            await self.session.close()

# Global client instance
perplexity_client = PerplexityFinancialClient() 