import pika
import json
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "sweet_user")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "sweet_pass")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "orders_queue")

def publish_order(order_id: str, order_data: dict):
    try:
        credentials = pika.PlainCredentials(RABBITMQ_USER, RABBITMQ_PASS)
        params = pika.ConnectionParameters(host=RABBITMQ_HOST, port=RABBITMQ_PORT, credentials=credentials)
        conn = pika.BlockingConnection(params)
        channel = conn.channel()
        channel.queue_declare(queue=RABBITMQ_QUEUE, durable=True)
        channel.basic_publish(
            exchange="",
            routing_key=RABBITMQ_QUEUE,
            body=json.dumps({"order_id": order_id, **order_data}),
            properties=pika.BasicProperties(delivery_mode=2)
        )
    except Exception as e:
        print(f"Error publishing to RabbitMQ: {e}")
    finally:
        try:
            conn.close()
        except:
            pass
