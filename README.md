# Smart City Environmental & Safety Monitoring System

![Platform](https://img.shields.io/badge/Platform-Google_Cloud-blue)
![Hardware](https://img.shields.io/badge/Hardware-ESP32-green)
![Frontend](https://img.shields.io/badge/Frontend-Next.js-black)
![Database](https://img.shields.io/badge/Database-MongoDB-leaf)

A cloud-native IoT solution for real-time urban environmental monitoring and safety hazard detection for humidity,temprature and gas/co2. This project demonstrates a scalable **Edge-to-Cloud architecture** deployed on **Google Cloud Platform (GCP)** with a live **Real-time Dashboard**.

## 📋 Table of Contents
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Step 1: Hardware (Edge) Setup](#step-1-hardware-edge-setup)
- [Step 2: Cloud Backend Setup](#step-2-cloud-backend-setup)
- [Step 3: Frontend Dashboard Setup](#step-3-frontend-dashboard-setup)
- [Team](#-team)

## 🏙️ Overview

The Smart City Environmental & Safety Monitoring System aggregates sensor data from distributed nodes to a centralized cloud server for storage and analysis.

### Key Features
- **Environmental Tracking**: Monitor ambient Temperature and Humidity (DHT11).
- **Safety Alerting**: Detect hazardous gases and smoke (MQ-2).
- **Cloud Integration**: Reliable data transmission to Google Cloud via lightweight MQTT protocol.
- **Live Visualization**: A Next.js dashboard for real-time monitoring and historical trend analysis.

## 🏗️ System Architecture

1. **Edge Layer:** ESP32 collects sensor data and publishes JSON payloads via MQTT.
2. **Cloud Layer:** A Python Gateway script on GCP receives MQTT messages, adds timestamps, and stores them in MongoDB.
3. **Application Layer:** A Next.js Dashboard fetches data via a secure SSH Tunnel for visualization.

## 📁 Project Structure

```bash
smart-city-iot-project/
├── smart_city_node/           # ESP32 Firmware (C++)
│   └── smart_city_node.ino
├── src/                       # Dashboard Source Code (Next.js)
│   ├── app/
│   ├── components/
│   └── lib/
├── assignment_gateway.py      # Cloud Middleware Script (Python)
├── public/                    # Static Assets
├── package.json               # Frontend Dependencies
└── README.md                  # Project Documentation
```

## 📋 Prerequisites

* **Hardware**: ESP32 Dev Module, DHT11 Sensor, MQ-2 Gas Sensor.
* **Cloud**: Google Cloud Platform (Compute Engine VM).
* **Software**: Arduino IDE, Node.js (v18+), Python 3.8+.

## Step 1: Hardware (Edge) Setup

1. **Open Firmware**: Open the `smart_city_node/smart_city_node.ino` file in Arduino IDE.

2. **Install Libraries**: Use the Library Manager to install:
   * `PubSubClient` (Nick O'Leary)
   * `DHT sensor library` (Adafruit)

3. **Configure Credentials**: Update the top section of the code:

```cpp
const char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASSWORD = "Your_WiFi_Password";
const char* MQTT_SERVER = "34.58.44.26"; // Replace with your GCP VM External IP
```

4. **Upload**: Connect your ESP32 via USB and upload the code.

5. **Verify**: Open Serial Monitor (115200 baud) to confirm it connects to WiFi and MQTT.

## Step 2: Cloud Backend Setup

These steps configure the Google Cloud VM to receive and store data.

1. **SSH into your GCP VM**:

```bash
ssh username@<VM_EXTERNAL_IP>
```

2. **Install Dependencies**:

```bash
sudo apt update
sudo apt install mosquitto mosquitto-clients mongodb-org python3-pip -y
pip3 install paho-mqtt pymongo
```

3. **Deploy Gateway Script**:
   * Create the file: `nano assignment_gateway.py`
   * Copy the content from `assignment_gateway.py` in this repo.
   * Save and Exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

4. **Start the Gateway**:

```bash
python3 assignment_gateway.py
```

The server is now listening for incoming IoT data and saving it to MongoDB.

## Step 3: Frontend Dashboard Setup

Since the MongoDB database is hosted securely on the Cloud (bound to localhost), we must use an SSH Tunnel to bridge the connection to your local machine.

### 1. Configure SSH Keys (One-time Setup)

If you haven't already, generate an SSH key on your local machine and add the public key to your GCP VM Metadata.

```powershell
# Generate Key
ssh-keygen -t rsa -f C:\Users\YourUser\.ssh\gcp_key -C "your_gcp_username"
```

### 2. Establish the Secure Tunnel

Run this command in a separate terminal window (PowerShell or Terminal) and keep it open. This creates the bridge between your laptop and the cloud database.

```powershell ( keep it open once you run the below command)
# Syntax: ssh -i <key_path> -L <local_port>:localhost:<remote_port> <user>@<vm_ip>
example: ssh -i C:\Users\mirmu\.ssh\gcp_key -L 27017:localhost:27017 mirmueed000@34.58.44.26
```

### 3. Run the Dashboard

Open a new terminal in the root directory of this repository:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open http://localhost:3000  or other port that is available in your browser. You will see the live environmental metrics!

## 👥 Team

**Group Assignment 2 - CPC357 IoT Project**

* **Azam Tamheed** (Metric No: 160610) - Hardware Integration & Circuit Design
* **Mueed Hyder Mir** (Metric No: 160796) - Cloud Architecture & Software Development

**Institution**: Universiti Sains Malaysia (USM)  
**Course**: CPC357: IoT Architecture & Smart Applications  
**Session**: 2025/2026
