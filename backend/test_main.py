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

def test_lookup_standard_match():
    # Test standard number match
    response = client.post("/api/lookup", json={"query": "IS 14543"})
    assert response.status_code == 200
    data = response.json()
    assert data["query_type"] == "Standard Search"
    assert data["standard"] == "IS 14543"
    assert data["status"] == "Inconclusive"

def test_lookup_standard_keyword_match():
    # Test product title / keyword match
    response = client.post("/api/lookup", json={"query": "Packaged Drinking Water"})
    assert response.status_code == 200
    data = response.json()
    assert data["query_type"] == "Standard Search"
    assert data["status"] == "Inconclusive"
    assert "14543" in data["standard"] or "WATER" in data["product"].upper()

def test_lookup_suspicious_unknown():
    # Test unrecognized format / unknown standard
    response = client.post("/api/lookup", json={"query": "XYZ-NONEXISTENT-PRODUCT-99999"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Suspicious"
    assert "No matching IS standard" in data["message"]

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

def test_get_standards():
    response = client.get("/api/standards?page=1&limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "total" in data
    assert len(data["data"]) <= 5
