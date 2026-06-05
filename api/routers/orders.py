from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models.database import get_db
from models.order import Order, OrderItem
from schemas.order import OrderCreate, OrderResponse, OrderStatusResponse
from services.queue_service import publish_order
from .auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=OrderResponse, status_code=201)
def create_order(order_data: OrderCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    total = sum(item.quantity * item.unit_price for item in order_data.items)
    db_order = Order(
        customer_name=order_data.customer_name,
        total=total,
        notes=order_data.notes,
        delivery_type=order_data.delivery_type
    )

    items_dict_list = []
    for item in order_data.items:
        db_item = OrderItem(
            product=item.product,
            quantity=item.quantity,
            unit_price=item.unit_price
        )
        db_order.items.append(db_item)
        items_dict_list.append(item.model_dump() if hasattr(item, "model_dump") else item.dict())
        
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Publish to RabbitMQ
    publish_data = {
        "customer_name": db_order.customer_name,
        "total": db_order.total,
        "items": items_dict_list
    }
    publish_order(db_order.id, publish_data)

    return db_order

@router.get("/{order_id}", response_model=OrderStatusResponse)
def get_order_status(order_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("", response_model=List[OrderResponse])
def list_orders(status: str = None, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    orders = query.offset(skip).limit(limit).all()
    return orders
