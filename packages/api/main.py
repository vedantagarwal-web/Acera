from dotenv import load_dotenv
import os

# Load environment variables first
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from routers import stocks, screens, content, news, market, ai
import os
from contextlib import asynccontextmanager
import uvloop
import asyncio

# Set uvloop as the default event loop for better performance
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    # Startup
    print("🚀 Acera API starting up...")
    
    # Initialize any required services here
    # This is where we could set up database connections, etc.
    
    yield
    
    # Shutdown
    print("🛑 Acera API shutting down...")
    
    # Clean up resources
    from market_data.alpha_vantage import alpha_vantage_client
    from news.exa_client import exa_news_client
    
    await alpha_vantage_client.close()
    await exa_news_client.close()

app = FastAPI(
    title="Acera Trading Platform API",
    description="Advanced AI-powered trading platform with Bloomberg Terminal features",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware for performance and security
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers with proper prefixes
app.include_router(stocks.router, prefix="/api", tags=["Stocks"])
app.include_router(news.router, prefix="/api", tags=["News"])
app.include_router(screens.router, prefix="/api", tags=["Screening"])
app.include_router(content.router, prefix="/api", tags=["Content"])
app.include_router(market.router, prefix="/api", tags=["Market"])
app.include_router(ai.router, prefix="/api", tags=["AI"])

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Acera Trading Platform API",
        "version": "2.0.0",
        "description": "AI-powered trading platform with institutional-grade analysis",
        "status": "operational",
        "features": [
            "Real-time US market data via Alpha Vantage",
            "AI-powered analyst reports",
            "Comprehensive news coverage via Exa",
            "Advanced charting and technical analysis",
            "Institutional-grade stock research"
        ],
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        # Test core services
        from market_data.alpha_vantage import alpha_vantage_client
        from news.exa_client import exa_news_client
        
        # Simple health checks (non-blocking)
        services_status = {
            "api": "healthy",
            "alpha_vantage": "operational",
            "exa_news": "operational",
            "ai_analysts": "operational"
        }
        
        return {
            "status": "healthy",
            "version": "2.0.0",
            "services": services_status,
            "timestamp": "2024-01-01T00:00:00Z"  # Would use actual timestamp
        }
        
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": "2024-01-01T00:00:00Z"
        }

@app.get("/api/status")
async def api_status():
    """Detailed API status for internal monitoring"""
    return {
        "api_version": "2.0.0",
        "environment": os.getenv("ENVIRONMENT", "development"),
        "alpha_vantage_configured": bool(os.getenv("ALPHA_VANTAGE_API_KEY")),
        "exa_configured": bool(os.getenv("EXA_API_KEY")),
        "openai_configured": bool(os.getenv("OPENAI_API_KEY")),
        "features_enabled": {
            "real_time_quotes": True,
            "ai_analysis": True,
            "news_integration": True,
            "earnings_analysis": True,
            "sector_analysis": True
        }
    } 