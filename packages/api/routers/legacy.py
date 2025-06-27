from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from nsepy import get_history  # type: ignore
from bsedata.bse import BSE  # type: ignore
import pandas as pd
from market_data.bse import BSE_SYMBOL_MAP  # type: ignore
from market_data.nse import get_nse_stock_quote  # type: ignore

router = APIRouter(prefix="/legacy", tags=["Legacy Market Data"])

bse = BSE(update_codes=True)


@router.get("/historical")
async def historical(
    symbol: str,
    exchange: str = Query("NSE", pattern="^(NSE|BSE)$"),
    from_date: str = Query(..., description="YYYY-MM-DD"),
    to_date: str = Query(..., description="YYYY-MM-DD"),
):
    """Historical OHLCV for a symbol via NSEpy (NSE) or placeholder for BSE."""
    try:
        start = datetime.strptime(from_date, "%Y-%m-%d")
        end = datetime.strptime(to_date, "%Y-%m-%d")

        if exchange.upper() == "NSE":
            data = get_history(symbol=symbol.upper(), start=start, end=end)
            if data.empty:
                return {
                    "symbol": symbol.upper(),
                    "exchange": "NSE",
                    "data": [],
                    "error": "No data found",
                }
            df = data.reset_index()
            result = df.to_dict(orient="records")
        else:
            # TODO: implement BSE historical fetch; return empty for now
            result = []

        return {"symbol": symbol.upper(), "exchange": exchange.upper(), "data": result}
    except Exception as e:
        return {"error": str(e)}


@router.get("/quote")
async def quote(symbol: str, exchange: str = Query("BSE", pattern="^(NSE|BSE)$")):
    """Simple real-time quote via BSEData; NSEpy can't do live quotes."""
    try:
        if exchange.upper() == "BSE":
            scrip = bse.getQuote(symbol)

            # If API fails (all fields None) fall back to NSE price
            if not scrip or all(v in (None, "", {}) for v in scrip.values()):
                # quick hack reverse-map common BSE codes
                reverse = {v: k for k, v in BSE_SYMBOL_MAP.items()}
                nse_symbol = reverse.get(symbol)
                if nse_symbol:
                    nse_quote = get_nse_stock_quote(nse_symbol)
                    if nse_quote:
                        return {
                            **nse_quote,
                            "exchange": "NSE-via-fallback",
                            "original_bse_code": symbol,
                        }

            return {
                "symbol": symbol,
                "exchange": "BSE",
                "price": scrip.get("currentValue"),
                "change": scrip.get("change"),
                "percentChange": scrip.get("pChange"),
                "volume": scrip.get("quantityTraded"),
                "companyName": scrip.get("companyName"),
                "lastUpdate": scrip.get("updatedOn"),
                "raw": scrip,
            }
        else:
            # Allow either NSE symbol or BSE numeric code (convert if possible)
            if symbol.isdigit():
                reverse = {v: k for k, v in BSE_SYMBOL_MAP.items()}
                symbol_nse = reverse.get(symbol)
                if not symbol_nse:
                    return {"error": "Unknown BSE code for NSE lookup"}
            else:
                symbol_nse = symbol.upper()

            nse_quote = get_nse_stock_quote(symbol_nse)
            if not nse_quote:
                return {"error": f"Quote for {symbol_nse} not found on NSE"}

            return nse_quote
    except Exception as e:
        return {"error": str(e)}


@router.get("/fundamentals")
async def fundamentals(symbol: str):
    """Basic fundamentals via BSEData."""
    try:
        scrip = bse.getQuote(symbol)
        return {
            "symbol": symbol,
            "companyName": scrip.get("companyName"),
            "industry": scrip.get("industry"),
            "pe": scrip.get("pE"),
            "marketCap": scrip.get("marketCap"),
            "bookValue": scrip.get("bookValue"),
            "dividendYield": scrip.get("dividendYield"),
            "faceValue": scrip.get("faceValue"),
            "raw": scrip,
        }
    except Exception as e:
        return {"error": str(e)} 