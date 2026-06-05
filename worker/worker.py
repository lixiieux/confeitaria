import pika
import json
import time
import random
import os
import logging
from sqlalchemy import create_engine, Column, String, Float, DateTime, Integer
from sqlalchemy.orm import declarative_base, sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "sweet_user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "sweet_pass")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "orders_queue")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dolcevita.db")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from datetime import datetime

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True)
    status = Column(String)
    processed_at = Column(DateTime)

def update_order_status(order_id: str, status: str):
    db = SessionLocal()
    try:
        order = db.query(Order).filter(Order.id == order_id).first()
        if order:
            order.status = status
            order.processed_at = datetime.utcnow()
            db.commit()
            logger.info(f"Order {order_id} status updated to {status}")
        else:
            logger.warning(f"Order {order_id} not found in database")
    finally:
        db.close()

def process_order(ch, method, properties, body):
    data = json.loads(body)
    order_id = data.get("order_id")
    logger.info(f"Processing order: {order_id}")
    time.sleep(5)  # simula aprovação de pagamento
    status = "APROVADO" if random.random() < 0.8 else "REJEITADO"
    update_order_status(order_id, status)
    ch.basic_ack(delivery_tag=method.delivery_tag)

def main():
    credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
    params = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
    
    while True:
        try:
            conn = pika.BlockingConnection(params)
            channel = conn.channel()
            channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
            channel.basic_qos(prefetch_count=1)
            channel.basic_consume(queue=RABBITMQ_QUEUE, on_message_callback=process_order)
            logger.info("Worker started. Waiting for messages...")
            channel.start_consuming()
        except pika.exceptions.AMQPConnectionError:
            logger.error("Connection failed, retrying in 5 seconds...")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    main()
