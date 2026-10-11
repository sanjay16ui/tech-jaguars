import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_lookup_cml():
    response = client.post("/api/lookup", json={"query": "CM/L-1234567"})
    assert response.status_code == 200
    data = response.json()
    assert data["query_type"] == "ISI / CM/L Licence"
    assert "CM/L-1234567" in data["message"]
    assert "Could not verify" in data["status"]

def test_lookup_r_number():
    response = client.post("/api/lookup", json={"query": "R-12345678"})
    assert response.status_code == 200
    data = response.json()
    assert data["query_type"] == "CRS R-Number"
    assert "R-12345678" in data["message"]
    assert "Could not verify" in data["status"]

def test_lookup_huid():
    response = client.post("/api/lookup", json={"query": "ABC123"})
    assert response.status_code == 200
    data = response.json()
    assert data["query_type"] == "HUID (Hallmark Unique Identification)"
    assert "ABC123" in data["message"]

def test_lookup_empty():
    response = client.post("/api/lookup", json={"query": ""})
    assert response.status_code == 400

def test_complaint_generate():
    response = client.post("/api/complaint/generate", json={
        "subject": "Fake ISI Mark",
        "details": "Found a product with fake ISI mark.",
        "evidence_urls": ["image1.png"]
    })
    assert response.status_code == 200
    data = response.json()
    assert "draft_report" in data
    assert "Fake ISI Mark" in data["draft_report"]
    assert "image1.png" in data["draft_report"]

