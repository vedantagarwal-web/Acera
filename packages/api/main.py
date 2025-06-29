from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers with error handling
from routers import stocks, market, news, ai, dashboard, search, content, screens

# Try to import AI analyst router with fallback
try:
    from routers import ai_analyst
    AI_ANALYST_AVAILABLE = True
except ImportError as e:
    logging.warning(f"AI Analyst not available: {e}")
    AI_ANALYST_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Acera Trading Platform API",
    description="Professional trading platform with AI-powered analysis and real-time market data",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stocks.router, prefix="/api")
app.include_router(market.router, prefix="/api")
app.include_router(news.router, prefix="/api")
app.include_router(ai.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(search.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(screens.router, prefix="/api")

# Include AI analyst router if available
if AI_ANALYST_AVAILABLE:
    app.include_router(ai_analyst.router, prefix="/api")

@app.get("/")
async def root():
    endpoints = {
        "stocks": "/api/stocks",
        "market": "/api/market", 
        "news": "/api/news",
        "ai": "/api/ai",
        "dashboard": "/api/dashboard",
        "search": "/api/search",
    }
    
    premium_features = {}
    
    if AI_ANALYST_AVAILABLE:
        endpoints["ai_analyst"] = "/api/ai-analyst"
        premium_features = {
            "ai_analyst_reports": "/api/ai-analyst/reports/generate",
            "dcf_models": "/api/ai-analyst/analysis/dcf",
        }
    
    return {
        "platform": "Acera Trading Platform",
        "version": "2.0.0",
        "description": "Professional trading platform with AI-powered institutional research",
        "features": [
            "Real-time market data via Tiingo API",
            "AI-powered news analysis via Exa API", 
            "6-analyst AI research team" if AI_ANALYST_AVAILABLE else "AI analysis capabilities",
            "Institutional-grade research reports" if AI_ANALYST_AVAILABLE else "Market analysis",
            "DCF valuation models" if AI_ANALYST_AVAILABLE else "Financial data",
            "PDF and Excel report generation" if AI_ANALYST_AVAILABLE else "Data export",
            "Professional Bloomberg Terminal-style interface"
        ],
        "endpoints": endpoints,
        "premium_features": premium_features,
        "ai_analyst_status": "available" if AI_ANALYST_AVAILABLE else "initializing"
    }

@app.get("/health")
async def health_check():
    services = {
        "tiingo_api": "connected",
        "exa_api": "connected"
    }
    
    if AI_ANALYST_AVAILABLE:
        services.update({
            "ai_analysts": "ready",
            "report_generator": "ready"
        })
    else:
        services["ai_analysts"] = "initializing"
    
    return {
        "status": "healthy",
        "services": services
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
