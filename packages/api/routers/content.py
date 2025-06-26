from fastapi import APIRouter

router = APIRouter()

@router.post("/earnings/{symbol}/{qtr}")
def ingest_earnings(symbol: str, qtr: str):
    return {"summary": "Earnings summary for {} {}".format(symbol, qtr)}

@router.get("/presentations/{symbol}")
def get_presentations(symbol: str):
    return {"presentations": [
        {"title": "Q4 FY24 Results", "url": "#"},
        {"title": "Investor Day", "url": "#"}
    ]} 