from fastapi import APIRouter, HTTPException
from market_data import get_nse_data, get_bse_data
from typing import Optional

router = APIRouter()

@router.get("/stocks/{symbol}")
async def get_stock_data(symbol: str, exchange: Optional[str] = "NSE", include_options: bool = False):
    """
    Get stock data from Indian exchanges.
    
    Args:
        symbol: Stock symbol
        exchange: Exchange (NSE or BSE)
        include_options: Whether to include options data (NSE only)
    """
    try:
        if exchange.upper() == "NSE":
            data = get_nse_data(symbol, include_options)
            if data is None:
                raise HTTPException(status_code=404, detail=f"Stock {symbol} not found on NSE")
            return data
        
        elif exchange.upper() == "BSE":
            data = get_bse_data(symbol)
            if data is None:
                raise HTTPException(status_code=404, detail=f"Stock {symbol} not found on BSE")
            return data
        
        else:
            raise HTTPException(status_code=400, detail="Invalid exchange. Use 'NSE' or 'BSE'")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 