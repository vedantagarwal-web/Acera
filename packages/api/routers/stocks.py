from fastapi import APIRouter, HTTPException, BackgroundTasks
from market_data.alpha_vantage import alpha_vantage_client, get_us_stock_quote, get_company_fundamentals, get_stock_chart_data
from ai.analyst_agents import analyst_team
from typing import Optional, Dict, Any
import asyncio

router = APIRouter()

@router.get("/quote/{symbol}")
async def get_stock_quote(symbol: str):
    """Get real-time stock quote from Alpha Vantage"""
    try:
        quote_data = await alpha_vantage_client.get_quote(symbol)
        if not quote_data:
            raise HTTPException(status_code=404, detail=f"Stock {symbol} not found")
        return quote_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overview/{symbol}")
async def get_company_overview(symbol: str):
    """Get comprehensive company overview and fundamentals"""
    try:
        overview_data = await alpha_vantage_client.get_company_overview(symbol)
        if not overview_data:
            raise HTTPException(status_code=404, detail=f"Company data for {symbol} not found")
        return overview_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chart/{symbol}")
async def get_stock_chart(symbol: str, interval: str = "5min"):
    """Get intraday chart data"""
    try:
        chart_data = await alpha_vantage_client.get_intraday_data(symbol, interval)
        return {"symbol": symbol, "interval": interval, "data": chart_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/earnings/{symbol}")
async def get_earnings_data(symbol: str):
    """Get earnings data"""
    try:
        earnings_data = await alpha_vantage_client.get_earnings(symbol)
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
        quote_task = alpha_vantage_client.get_quote(symbol)
        overview_task = alpha_vantage_client.get_company_overview(symbol)
        chart_task = alpha_vantage_client.get_intraday_data(symbol)
        earnings_task = alpha_vantage_client.get_earnings(symbol)
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
            "last_updated": alpha_vantage_client.base_url  # timestamp would be added here
        }
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/earnings-summary/{symbol}")
async def generate_earnings_summary(symbol: str, transcript: Optional[str] = None):
    """Generate AI-powered earnings call summary"""
    try:
        # Get the appropriate analyst for the company's sector
        overview_data = await alpha_vantage_client.get_company_overview(symbol)
        sector = overview_data.get('sector', 'Technology')
        analyst = analyst_team.get_analyst_for_sector(sector)
        
        # Generate earnings summary
        summary = await analyst.generate_earnings_summary(symbol, transcript)
        return summary
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Legacy endpoint for backward compatibility
@router.get("/stocks/{symbol}")
async def get_stock_data_legacy(symbol: str, exchange: Optional[str] = "US", include_options: bool = False):
    """
    Legacy endpoint - now uses Alpha Vantage for US market data
    """
    try:
        return await get_comprehensive_data(symbol)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 