from fastapi import APIRouter

router = APIRouter()

@router.post("/screen")
def screen_stocks(filters: dict):
    return {"tickers": ["TCS", "INFY", "HDFCBANK"]} 