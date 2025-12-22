/*
 * SpeedGuard IoT Device - ESP32 with GPS Module
 * Smart Traffic Violation Monitoring System
 * 
 * Hardware Requirements:
 * - ESP32 Development Board
 * - GPS Module (NEO-6M or NEO-8M)
 * - Optional: SD Card Module for local logging
 * 
 * Connections:
 * GPS Module:
 * - VCC -> 3.3V
 * - GND -> GND
 * - TX -> GPIO 16 (RX2)
 * - RX -> GPIO 17 (TX2)
 * 
 * Author: SpeedGuard Research Team
 * Version: 1.0
 * Date: 2024
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <SoftwareSerial.h>
#include <TinyGPS++.h>
#include <time.h>

// Device Configuration
const char* DEVICE_ID = "ESP32_SG001"; // Unique device identifier
const char* FIRMWARE_VERSION = "1.0.0";

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server Configuration
const char* SERVER_URL = "https://speedguard-gz70.onrender.com";
const char* IOT_ENDPOINT = "/api/iot/data";
const char* HEARTBEAT_ENDPOINT = "/api/iot/heartbeat";

// GPS Configuration
#define GPS_RX_PIN 16
#define GPS_TX_PIN 17
#define GPS_BAUD 9600

// Timing Configuration
const unsigned long DATA_SEND_INTERVAL = 5000;  // 5 seconds
const unsigned long HEARTBEAT_INTERVAL = 30000; // 30 seconds
const unsigned long GPS_TIMEOUT = 10000;        // 10 seconds

// Status LED
#define STATUS_LED 2

// Global Objects
SoftwareSerial gpsSerial(GPS_RX_PIN, GPS_TX_PIN);
TinyGPSPlus gps;
WiFiClient wifiClient;

// Global Variables
unsigned long lastDataSend = 0;
unsigned long lastHeartbeat = 0;
bool wifiConnected = false;
bool gpsConnected = false;
int dataTransmissionErrors = 0;

// GPS Data Structure
struct GPSData {
  double latitude;
  double longitude;
  double speed;
  double altitude;
  int satellites;
  bool isValid;
  String timestamp;
};

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== SpeedGuard IoT Device Starting ===");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("Firmware: " + String(FIRMWARE_VERSION));
  
  // Initialize LED
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(STATUS_LED, LOW);
  
  // Initialize GPS
  gpsSerial.begin(GPS_BAUD);
  Serial.println("GPS Module initialized");
  
  // Connect to WiFi
  connectToWiFi();
  
  // Configure time
  configTime(19800, 0, "pool.ntp.org"); // UTC+5:30 for Sri Lanka
  
  Serial.println("=== Setup Complete ===\n");
}

void loop() {
  // Update GPS data
  updateGPS();
  
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    wifiConnected = false;
    digitalWrite(STATUS_LED, LOW);
    connectToWiFi();
  } else {
    wifiConnected = true;
    digitalWrite(STATUS_LED, HIGH);
  }
  
  // Send data at regular intervals
  if (millis() - lastDataSend >= DATA_SEND_INTERVAL) {
    if (wifiConnected && gpsConnected) {
      GPSData gpsData = getCurrentGPSData();
      if (gpsData.isValid) {
        sendIoTData(gpsData);
      }
    }
    lastDataSend = millis();
  }
  
  // Send heartbeat
  if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL) {
    if (wifiConnected) {
      sendHeartbeat();
    }
    lastHeartbeat = millis();
  }
  
  // Status reporting
  static unsigned long lastStatusReport = 0;
  if (millis() - lastStatusReport >= 10000) { // Every 10 seconds
    printStatus();
    lastStatusReport = millis();
  }
  
  delay(100);
}

void connectToWiFi() {
  Serial.print("Connecting to WiFi: " + String(WIFI_SSID));
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    wifiConnected = true;
    Serial.println("\nWiFi Connected!");
    Serial.println("IP Address: " + WiFi.localIP().toString());
    Serial.println("Signal Strength: " + String(WiFi.RSSI()) + " dBm");
  } else {
    wifiConnected = false;
    Serial.println("\nWiFi Connection Failed!");
  }
}

void updateGPS() {
  while (gpsSerial.available() > 0) {
    if (gps.encode(gpsSerial.read())) {
      if (gps.location.isValid() && gps.speed.isValid()) {
        gpsConnected = true;
      }
    }
  }
  
  // Check GPS timeout
  if (millis() > 5000 && gps.charsProcessed() < 10) {
    gpsConnected = false;
  }
}

GPSData getCurrentGPSData() {
  GPSData data;
  
  if (gps.location.isValid() && gps.speed.isValid()) {
    data.latitude = gps.location.lat();
    data.longitude = gps.location.lng();
    data.speed = gps.speed.kmph(); // Speed in km/h
    data.altitude = gps.altitude.meters();
    data.satellites = gps.satellites.value();
    data.isValid = true;
    data.timestamp = getCurrentTimestamp();
  } else {
    data.isValid = false;
  }
  
  return data;
}

String getCurrentTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    return "1970-01-01T00:00:00Z"; // Fallback timestamp
  }
  
  char timestamp[30];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  return String(timestamp);
}

void sendIoTData(GPSData gpsData) {
  if (!wifiConnected) {
    Serial.println("❌ Cannot send data - WiFi not connected");
    return;
  }
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + String(IOT_ENDPOINT));
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  DynamicJsonDocument doc(1024);
  doc["deviceId"] = DEVICE_ID;
  doc["speed"] = gpsData.speed;
  doc["latitude"] = gpsData.latitude;
  doc["longitude"] = gpsData.longitude;
  doc["timestamp"] = gpsData.timestamp;
  doc["altitude"] = gpsData.altitude;
  doc["satellites"] = gpsData.satellites;
  doc["batteryLevel"] = getBatteryLevel();
  doc["temperature"] = getTemperature();
  doc["signalStrength"] = WiFi.RSSI();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("📡 Sending IoT Data:");
  Serial.println("   Speed: " + String(gpsData.speed) + " km/h");
  Serial.println("   Location: " + String(gpsData.latitude, 6) + ", " + String(gpsData.longitude, 6));
  Serial.println("   Satellites: " + String(gpsData.satellites));
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Server Response (" + String(httpResponseCode) + "):");
    
    // Parse response
    DynamicJsonDocument responseDoc(2048);
    deserializeJson(responseDoc, response);
    
    if (responseDoc["success"]) {
      Serial.println("   Status: SUCCESS");
      if (responseDoc["data"]["isViolation"]) {
        Serial.println("   🚨 VIOLATION DETECTED!");
        Serial.println("   Vehicle: " + String(responseDoc["data"]["vehicleNumber"].as<String>()));
        Serial.println("   Speed Limit: " + String(responseDoc["data"]["speedLimit"].as<int>()) + " km/h");
        Serial.println("   Severity: " + String(responseDoc["data"]["severity"].as<String>()));
        
        // Flash LED for violation
        flashLED(5, 200);
      }
      dataTransmissionErrors = 0; // Reset error counter
    } else {
      Serial.println("   Status: ERROR");
      Serial.println("   Message: " + String(responseDoc["message"].as<String>()));
      dataTransmissionErrors++;
    }
  } else {
    Serial.println("❌ HTTP Error: " + String(httpResponseCode));
    dataTransmissionErrors++;
  }
  
  http.end();
}

void sendHeartbeat() {
  if (!wifiConnected) return;
  
  HTTPClient http;
  http.begin(String(SERVER_URL) + String(HEARTBEAT_ENDPOINT));
  http.addHeader("Content-Type", "application/json");
  
  DynamicJsonDocument doc(512);
  doc["deviceId"] = DEVICE_ID;
  doc["timestamp"] = getCurrentTimestamp();
  doc["status"] = "online";
  doc["firmwareVersion"] = FIRMWARE_VERSION;
  doc["batteryLevel"] = getBatteryLevel();
  doc["temperature"] = getTemperature();
  doc["signalStrength"] = WiFi.RSSI();
  doc["freeHeap"] = ESP.getFreeHeap();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode == 200) {
    Serial.println("💓 Heartbeat sent successfully");
  } else {
    Serial.println("❌ Heartbeat failed: " + String(httpResponseCode));
  }
  
  http.end();
}

void printStatus() {
  Serial.println("\n=== Device Status ===");
  Serial.println("Device ID: " + String(DEVICE_ID));
  Serial.println("WiFi: " + String(wifiConnected ? "Connected" : "Disconnected"));
  if (wifiConnected) {
    Serial.println("Signal: " + String(WiFi.RSSI()) + " dBm");
    Serial.println("IP: " + WiFi.localIP().toString());
  }
  Serial.println("GPS: " + String(gpsConnected ? "Connected" : "Disconnected"));
  if (gpsConnected) {
    Serial.println("Satellites: " + String(gps.satellites.value()));
    Serial.println("Location: " + String(gps.location.lat(), 6) + ", " + String(gps.location.lng(), 6));
    Serial.println("Speed: " + String(gps.speed.kmph()) + " km/h");
  }
  Serial.println("Uptime: " + String(millis() / 1000) + " seconds");
  Serial.println("Free Heap: " + String(ESP.getFreeHeap()) + " bytes");
  Serial.println("Transmission Errors: " + String(dataTransmissionErrors));
  Serial.println("====================\n");
}

float getBatteryLevel() {
  // Read battery voltage (if connected to analog pin)
  // This is a placeholder - implement based on your hardware
  int analogValue = analogRead(A0);
  float voltage = (analogValue / 4095.0) * 3.3;
  float batteryPercentage = ((voltage - 3.0) / (4.2 - 3.0)) * 100;
  return constrain(batteryPercentage, 0, 100);
}

float getTemperature() {
  // Read internal temperature sensor
  // This is a placeholder - ESP32 internal temp sensor is not very accurate
  return 25.0 + (random(-5, 5)); // Simulated temperature
}

void flashLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(delayMs);
    digitalWrite(STATUS_LED, LOW);
    delay(delayMs);
  }
}

/*
 * Installation Instructions:
 * 
 * 1. Install Required Libraries:
 *    - ArduinoJson (by Benoit Blanchon)
 *    - TinyGPS++ (by Mikal Hart)
 *    - ESP32 Board Package
 * 
 * 2. Hardware Setup:
 *    - Connect GPS module as per pin configuration above
 *    - Ensure stable power supply (3.3V/5V)
 *    - Mount securely in vehicle
 * 
 * 3. Configuration:
 *    - Update DEVICE_ID with unique identifier
 *    - Set WiFi credentials
 *    - Verify server URL
 * 
 * 4. Testing:
 *    - Upload code to ESP32
 *    - Monitor serial output for GPS lock
 *    - Verify data transmission to server
 *    - Test violation detection
 * 
 * 5. Deployment:
 *    - Install in vehicle dashboard
 *    - Ensure GPS antenna has clear sky view
 *    - Configure mobile hotspot or vehicle WiFi
 *    - Register device in admin panel
 *    - Assign to vehicle in system
 */