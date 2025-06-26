from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert r.json()["message"] == "Acera API running"

def test_stock():
    r = client.get("/stocks/TCS")
    assert r.status_code == 200
    assert r.json()["symbol"] == "TCS" 