from confluent_kafka import Producer, Consumer
from .config import KAFKA_BOOTSTRAP_SERVERS

def get_kafka_producer():
    return Producer({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})

def get_kafka_consumer(group_id, topics):
    consumer = Consumer({
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'group.id': group_id,
        'auto.offset.reset': 'earliest',
    })
    consumer.subscribe(topics)
    return consumer
