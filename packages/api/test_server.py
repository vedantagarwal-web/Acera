import uvicorn
import sys
sys.path.append('.')

from fastapi import FastAPI
from routers.stocks import router

app = FastAPI(
    title='Acera Trading API',
    description='NSE/BSE Market Data API using NSEPython',
    version='2.0.0'
)

app.include_router(router, prefix='/api', tags=['stocks'])

@app.get('/')
async def root():
    return {'message': 'Acera Trading API v2.0 - NSE/BSE Market Data', 'status': 'operational'}

if __name__ == '__main__':
    print('Starting Acera Trading API server...')
    print('Available endpoints:')
    print('- GET / (root)')
    print('- GET /api/stocks/{symbol}')
    print('- GET /api/quote/{symbol}') 
    print('- GET /api/indices')
    print('- GET /api/fno-list')
    print('- GET /api/market-status')
    print('- GET /api/top-movers')
    print('- GET /api/bulk-quotes')
    print('\nAPI is ready to serve requests!')
    print('Test with: curl http://localhost:8000/api/stocks/RELIANCE')
