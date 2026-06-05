from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class OrderItemBase(BaseModel):
    product: str
    quantity: int
    unit_price: float

class OrderCreate(BaseModel):
    customer_name: str
    items: List[OrderItemBase]
    notes: Optional[str] = None
    delivery_type: Optional[str] = "ENTREGA"

class OrderItemResponse(OrderItemBase):
    id: int

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    customer_name: str
    status: str
    total: float
    notes: Optional[str]
    delivery_type: str
    created_at: datetime
    processed_at: Optional[datetime]
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True

class OrderStatusResponse(BaseModel):
    id: str
    status: str
    total: float
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True
