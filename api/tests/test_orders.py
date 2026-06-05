from unittest.mock import patch
from fastapi.testclient import TestClient
from main import app
from models.order import Order
import pytest

client = TestClient(app)


@pytest.fixture
def auth_headers(db_session):
    # Create a user and get a token
    client.post(
        "/auth/register",
        json={"username": "orderuser", "password": "password123"}
    )
    response = client.post(
        "/auth/token",
        data={"username": "orderuser", "password": "password123"}
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_order_unauthorized(db_session):
    response = client.post(
        "/orders",
        json={
            "customer_name": "Maria Silva",
            "items": [
                {"product": "Bolo Red Velvet", "quantity": 1, "unit_price": 89.90}
            ],
            "delivery_type": "ENTREGA"
        }
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"


def test_create_order_success(db_session, auth_headers):
    with patch("routers.orders.publish_order") as mock_publish:
        response = client.post(
            "/orders",
            headers=auth_headers,
            json={
                "customer_name": "Maria Silva",
                "items": [
                    {"product": "Bolo Red Velvet", "quantity": 1, "unit_price": 89.90},
                    {"product": "Brigadeiro Gourmet", "quantity": 12, "unit_price": 4.50}
                ],
                "notes": "Sem glúten na cobertura",
                "delivery_type": "ENTREGA"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["customer_name"] == "Maria Silva"
        assert data["total"] == 143.90  # 1 * 89.90 + 12 * 4.50 = 89.90 + 54.00 = 143.90
        assert data["status"] == "PENDENTE"
        assert len(data["items"]) == 2

        # Verify db persistence
        order = db_session.query(Order).filter(Order.id == data["id"]).first()
        assert order is not None
        assert order.total == 143.90

        # Verify RabbitMQ publish mock was called
        mock_publish.assert_called_once()
        args, kwargs = mock_publish.call_args
        assert args[0] == data["id"]
        assert args[1]["customer_name"] == "Maria Silva"
        assert args[1]["total"] == 143.90
        assert len(args[1]["items"]) == 2


def test_get_order_status_success(db_session, auth_headers):
    # First create an order
    response = client.post(
        "/orders",
        headers=auth_headers,
        json={
            "customer_name": "Maria Silva",
            "items": [
                {"product": "Bolo Red Velvet", "quantity": 1, "unit_price": 89.90}
            ]
        }
    )
    order_id = response.json()["id"]

    # Retrieve order status
    status_response = client.get(
        f"/orders/{order_id}",
        headers=auth_headers
    )
    assert status_response.status_code == 200
    data = status_response.json()
    assert data["id"] == order_id
    assert data["status"] == "PENDENTE"
    assert data["total"] == 89.90


def test_get_order_status_not_found(db_session, auth_headers):
    response = client.get(
        "/orders/non-existent-id-12345",
        headers=auth_headers
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Order not found"


def test_list_orders(db_session, auth_headers):
    # Create two orders
    client.post(
        "/orders",
        headers=auth_headers,
        json={
            "customer_name": "Maria Silva",
            "items": [{"product": "Bolo Red Velvet", "quantity": 1, "unit_price": 89.90}]
        }
    )
    client.post(
        "/orders",
        headers=auth_headers,
        json={
            "customer_name": "João Souza",
            "items": [{"product": "Brigadeiro Gourmet", "quantity": 10, "unit_price": 4.50}]
        }
    )

    # List orders
    list_response = client.get(
        "/orders",
        headers=auth_headers
    )
    assert list_response.status_code == 200
    orders = list_response.json()
    # At least two orders should be returned (plus any seeded/created ones)
    assert len(orders) >= 2
    assert any(o["customer_name"] == "Maria Silva" for o in orders)
    assert any(o["customer_name"] == "João Souza" for o in orders)

    # Filter by status
    list_filtered = client.get(
        "/orders?status=PENDENTE",
        headers=auth_headers
    )
    assert list_filtered.status_code == 200
    filtered_orders = list_filtered.json()
    assert all(o["status"] == "PENDENTE" for o in filtered_orders)
