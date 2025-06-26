from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stocks, screens, content

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stocks.router, prefix="/stocks")
app.include_router(screens.router, prefix="/stocks")
app.include_router(content.router, prefix="/content")

@app.get("/")
def root():
    return {"message": "Acera API running"} 