from dotenv import load_dotenv
import os

# Load environment variables first
load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from routers import stocks, screens, content, news, market, ai, dashboard, search
import os
from contextlib import asynccontextmanager
import uvloop
import asyncio
import uvicorn
import logging

# Set uvloop as the default event loop for better performance
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())

# Import market data clients
from market_data.tiingo_client import tiingo_client

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager to handle startup and shutdown
    """
    # Startup
    logger.info("🚀 Starting Acera API server...")
    logger.info("✅ Tiingo API client initialized")
    
    yield
    
    # Shutdown
    logger.info("🔄 Shutting down Acera API server...")
    await tiingo_client.close()
    logger.info("✅ Cleanup completed")

app = FastAPI(
    title="Acera Trading Platform API",
    description="Bloomberg Terminal-style API for retail investors",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add middleware for performance and security
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(stocks.router, prefix="/api", tags=["Stocks"])
app.include_router(market.router, prefix="/api", tags=["Market"])
app.include_router(news.router, prefix="/api", tags=["News"])
app.include_router(ai.router, prefix="/api", tags=["AI"])
app.include_router(content.router, prefix="/api", tags=["Content"])
app.include_router(screens.router, prefix="/api", tags=["Screens"])
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(search.router, prefix="/api", tags=["Search"])

@app.get("/")
async def root():
    return {
        "message": "Acera Trading Platform API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": {
            "stocks": "/api/stocks",
            "market": "/api/market",
            "news": "/api/news",
            "ai": "/api/ai",
            "content": "/api/content",
            "screens": "/api/screens",
            "dashboard": "/api/dashboard",
            "search": "/api/search",
            "docs": "/docs",
            "health": "/api/health"
        }
    }

@app.get("/api/health")
async def health_check():
    """Main health check endpoint"""
    return {
        "status": "healthy",
        "service": "acera-api",
        "version": "1.0.0",
        "components": {
            "fastapi": "operational",
            "tiingo": "operational",
            "exa": "operational",
            "ai_agents": "operational"
        }
    }

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Global HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": "2024-01-15T12:00:00Z"
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler for unexpected errors"""
    logger.error(f"Unexpected error: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "details": str(exc),
            "timestamp": "2024-01-15T12:00:00Z"
        }
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 