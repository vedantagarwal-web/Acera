from pydantic import BaseModel
from typing import List, Optional

class Stock(BaseModel):
    symbol: str
    quote: dict
    fundamentals: dict
    peers: List[str]
    latest_earnings: dict
    presentations: List[dict] 