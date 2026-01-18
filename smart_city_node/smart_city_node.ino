/*
 * Smart City IoT Node - ESP32 Firmware
 * * Description:
 * This firmware reads environmental data from a DHT11 sensor (Temperature/Humidity)
 * and safety data from an MQ-2 sensor (Gas/Smoke). The data is serialized into a
 * JSON payload and published to a Google Cloud Platform (GCP) MQTT broker.
 * * Hardware:
 * - ESP32 Dev Module
 * - DHT11 Sensor (GPIO 41)
 * - MQ-2 Gas Sensor (GPIO 4 - Analog)
 * * Libraries Required:
 * - PubSubClient (Nick O'Leary)
 * - DHT sensor library (Adafruit)
 * - WiFi (Built-in)
 * * Author: Group 48 (CPC357)
 * Date: January 2026
 */

#include <PubSubClient.h>
#include <WiFi.h>
#include "DHT.h"

// ==========================================
// CONFIGURATION SECTION
// ==========================================

// --- WiFi Settings ---
const char* WIFI_SSID = "irvingprop";       // Wi-Fi Network Name
const char* WIFI_PASSWORD = "0124308939irving"; // Wi-Fi Password

// --- MQTT Broker Settings (GCP) ---
const char* MQTT_SERVER = "34.58.44.26"; // GCP VM External IP
const int MQTT_PORT = 1883;
const char* MQTT_TOPIC = "iot";

// --- Pin Definitions ---
#define DHTPIN 41       // Digital Pin for DHT11
#define DHTTYPE DHT11   // Sensor Type
const int mq2Pin = 4;   // Analog Pin for MQ-2 Gas Sensor

// ==========================================
// GLOBAL OBJECTS & VARIABLES
// ==========================================

DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient client(espClient);

char buffer[256]; // Buffer to store the JSON payload

// ==========================================
// SETUP FUNCTIONS
// ==========================================

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected successfully!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    // Create a random client ID to avoid conflicts
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);
    
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

// ==========================================
// MAIN EXECUTION
// ==========================================

void setup() {
  Serial.begin(115200);
  
  // Initialize Sensors
  dht.begin();
  pinMode(mq2Pin, INPUT);

  // Initialize Network
  setup_wifi();
  client.setServer(MQTT_SERVER, MQTT_PORT);
}

void loop() {
  // Ensure MQTT connection is active
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // 1. Read Sensor Data
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int gasLevel = analogRead(mq2Pin); // Reads analog value (0-4095)

  // 2. Error Check
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // 3. Format Payload as JSON
  // Example: {"temp": 25.50, "humid": 60.00, "gas": 1200}
  sprintf(buffer, "{\"temp\": %.2f, \"humid\": %.2f, \"gas\": %d}", temperature, humidity, gasLevel);

  // 4. Publish to Cloud
  Serial.print("Publishing payload: ");
  Serial.println(buffer);
  client.publish(MQTT_TOPIC, buffer);

  // 5. Wait before next reading
  delay(5000); 
}