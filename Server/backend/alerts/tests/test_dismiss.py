import pytest

@pytest.mark.django_db
def test_dismiss_idempotent(client):
    r1 = client.post("/api/alerts/A1/dismiss")
    assert r1.status_code == 200
    assert r1.json()["status"] == "dismissed"

    r2 = client.post("/api/alerts/A1/dismiss")
    assert r2.status_code == 200
    assert r2.json()["status"] == "dismissed"
