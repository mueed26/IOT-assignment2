import pymongo
import paho.mqtt.client as mqtt
import json
from datetime import datetime, timezone

# --- MongoDB Configuration ---
# Connect to local MongoDB
mongo_client = pymongo.MongoClient("mongodb://localhost:27017/")

# 1. DATABASE NAME:
db = mongo_client["smart_city_env"] 

# 2. COLLECTION NAME:
collection = db["sensor_readings"] 

# --- MQTT Configuration ---
# 'localhost' works because this script runs on the same VM as the broker
mqtt_broker_address = "localhost" 
mqtt_topic = "iot"

# --- Callbacks ---

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Successfully connected to MQTT Broker")
        client.subscribe(mqtt_topic)
    else:
        print(f"Connection failed with code {rc}")

def on_message(client, userdata, message):
    try:
        # 1. Decode the raw message from the ESP32
        raw_payload = message.payload.decode("utf-8")
        print(f"Received raw: {raw_payload}")
        
        # 2. Parse JSON (The Critical Step)
        # This converts string '{"temp": 31...}' into a Python Dictionary
        sensor_data = json.loads(raw_payload)
        
        # 3. Add Timestamp (Server Time)
        timestamp = datetime.now(timezone.utc)
        sensor_data["timestamp"] = timestamp.strftime("%Y-%m-%dT%H:%M:%S.%fZ")
        
        # 4. Insert into MongoDB
        collection.insert_one(sensor_data)
        print("Data successfully ingested into Smart City Database!")
        print("-" * 30)
        
    except json.JSONDecodeError:
        print("Error: Received data was not valid JSON.")
    except Exception as e:
        print(f"Error processing message: {e}")

# --- Main Execution ---
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# Connect to the broker
client.connect(mqtt_broker_address, 1883, 60)

try:
    print("Smart City Gateway Started. Listening for sensor data...")
    client.loop_forever()
except KeyboardInterrupt:
    print("\nScript interrupted by user. Exiting...")
    client.disconnect()