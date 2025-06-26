from bsedata.bse import BSE
from typing import Dict, Any

b = BSE()

def get_bse_data(symbol: str) -> Dict[str, Any]:
    """
    Get real-time stock data from BSE
    
    Args:
        symbol: BSE stock symbol/code
        
    Returns:
        Dictionary containing stock data
    """
    try:
        quote = b.getQuote(symbol)
        return {
            "symbol": symbol,
            "current_price": quote.get("currentValue"),
            "change": quote.get("change"),
            "change_percent": quote.get("pChange"),
            "high": quote.get("dayHigh"), 
            "low": quote.get("dayLow"),
            "open": quote.get("open"),
            "close": quote.get("previousClose"),
            "volume": quote.get("totalTradedVolume"),
            "market_cap": quote.get("marketCapFull"),
            "timestamp": quote.get("updatedOn")
        }
    except Exception as e:
        raise Exception(f"Error fetching BSE data for {symbol}: {str(e)}") 