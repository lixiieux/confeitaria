from fastapi.testclient import TestClient
from main import app
from models.user import User

client = TestClient(app)


def test_register_user_success(db_session):
    response = client.post(
        "/auth/register",
        json={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert "id" in data
    assert data["is_active"] is True

    # Verify user in database
    user = db_session.query(User).filter(User.username == "testuser").first()
    assert user is not None
    assert user.username == "testuser"


def test_register_user_duplicate(db_session):
    # Register first user
    client.post(
        "/auth/register",
        json={"username": "duplicateuser", "password": "password123"}
    )

    # Try registering again with same username
    response = client.post(
        "/auth/register",
        json={"username": "duplicateuser", "password": "password456"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Usuário já existe"


def test_login_success(db_session):
    # Register a user
    client.post(
        "/auth/register",
        json={"username": "loginuser", "password": "correctpassword"}
    )

    # Login
    response = client.post(
        "/auth/token",
        data={"username": "loginuser", "password": "correctpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_credentials(db_session):
    # Register a user
    client.post(
        "/auth/register",
        json={"username": "loginuser2", "password": "correctpassword"}
    )

    # Login with wrong password
    response = client.post(
        "/auth/token",
        data={"username": "loginuser2", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais inválidas"

    # Login with non-existing user
    response = client.post(
        "/auth/token",
        data={"username": "nonexistent", "password": "somepassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Credenciais inválidas"
