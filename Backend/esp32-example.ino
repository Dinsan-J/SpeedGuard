/*
 * SpeedGuard IoT Device - ESP32 Example
 * 
 * This code reads GPS data and sends it to the SpeedGuard backend
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - GPS Module (NEO-6M or similar)
 * - Connecting wires
 * 
 * Wiring:
 * GPS TX  -> ESP32 GPIO 16 (RX)
 * GPS RX  -> ESP32 GPIO 17 (TX)
 * GPS VCC -> ESP32 3.3V
 * GPS GND -> ESP32 GND
 * 
 * Libraries Required:
 * - TinyGPS++ (Install via Arduino Library Manager)
 * - WiFi (Built-in)
 * - HTTPClient (Built-in)
 * - ArduinoJson (Install via Arduino Library Manager)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>
#include <ArduinoJson.h>

// ========== CONFIGURATION ==========
// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// SpeedGuard API Configuration
const char* API_URL = "https://speedguard-gz70.onrender.com/api/iot/data";
const char* IOT_DEVICE_ID = "IOT-DEVICE-12345"; // Change this to your unique device ID

// Update interval (milliseconds)
const unsigned long UPDATE_INTERVAL = 5000; // Send data every 5 seconds

// ========== GLOBAL OBJECTS ==========
TinyGPSPlus gps;
HardwareSerial GPS_Serial(1); // Use UART1
unsigned long lastUpdate = 0;

// ========== SETUP ==========
void setup() {
  // Initialize Serial for debugging
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("SpeedGuard IoT Device Starting...");
  Serial.println("=================================\n");
  
  // Initialize GPS Serial
  GPS_Serial.begin(9600, SERIAL_8N1, 16, 17); // RX=16, TX=17
  Serial.println("GPS Module initialized");
  
  // Connect to WiFi
  connectWiFi();
  
  Serial.println("\n✅ Setup complete!");
  Serial.println("Waiting for GPS fix...\n");
}

// ========== MAIN LOOP ==========
void loop() {
  // Read GPS data
  while (GPS_Serial.available() > 0) {
    gps.encode(GPS_Serial.read());
  }
  
  // Check if it's time to send data
  if (millis() - lastUpdate >= UPDATE_INTERVAL) {
    lastUpdate = millis();
    
    // Check if we have valid GPS data
    if (gps.location.isValid() && gps.speed.isValid()) {
      sendDataToServer();
    } else {
      Serial.println("⏳ Waiting for GPS fix...");
      Serial.print("   Satellites: ");
      Serial.println(gps.satellites.value());
    }
  }
  
  // Display GPS info every second
  static unsigned long lastDisplay = 0;
  if (millis() - lastDisplay >= 1000) {
    lastDisplay = millis();
    displayGPSInfo();
  }
}

// ========== WIFI CONNECTION ==========
void connectWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.print("   IP Address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ WiFi Connection Failed!");
    Serial.println("   Please check your credentials and try again");
  }
}

// ========== SEND DATA TO SERVER ==========
void sendDataToServer() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected. Reconnecting...");
    connectWiFi();
    return;
  }
  
  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<256> doc;
  doc["iotDeviceId"] = IOT_DEVICE_ID;
  doc["speed"] = gps.speed.kmph();
  
  JsonObject location = doc.createNestedObject("location");
  location["lat"] = gps.location.lat();
  location["lng"] = gps.location.lng();
  
  doc["timestamp"] = getISOTimestamp();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  // Send POST request
  Serial.println("\n📡 Sending data to server...");
  Serial.println("   Data: " + jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Server Response:");
    Serial.println("   Code: " + String(httpResponseCode));
    Serial.println("   Body: " + response);
    
    // Parse response to check for violations
    StaticJsonDocument<512> responseDoc;
    DeserializationError error = deserializeJson(responseDoc, response);
    
    if (!error) {
      if (responseDoc.containsKey("violation")) {
        Serial.println("\n⚠️  SPEED VIOLATION DETECTED!");
        Serial.print("   Speed: ");
        Serial.print(gps.speed.kmph());
        Serial.println(" km/h");
      }
    }
  } else {
    Serial.println("❌ Error sending data:");
    Serial.println("   Code: " + String(httpResponseCode));
    Serial.println("   Error: " + http.errorToString(httpResponseCode));
  }
  
  http.end();
}

// ========== DISPLAY GPS INFO ==========
void displayGPSInfo() {
  Serial.println("\n--- GPS Status ---");
  
  if (gps.location.isValid()) {
    Serial.print("📍 Location: ");
    Serial.print(gps.location.lat(), 6);
    Serial.print(", ");
    Serial.println(gps.location.lng(), 6);
  } else {
    Serial.println("📍 Location: Invalid");
  }
  
  if (gps.speed.isValid()) {
    Serial.print("🚗 Speed: ");
    Serial.print(gps.speed.kmph());
    Serial.println(" km/h");
  } else {
    Serial.println("🚗 Speed: Invalid");
  }
  
  if (gps.satellites.isValid()) {
    Serial.print("🛰️  Satellites: ");
    Serial.println(gps.satellites.value());
  }
  
  if (gps.hdop.isValid()) {
    Serial.print("📊 HDOP: ");
    Serial.println(gps.hdop.hdop());
  }
  
  Serial.println("------------------");
}

// ========== GET ISO TIMESTAMP ==========
String getISOTimestamp() {
  // For production, use NTP time synchronization
  // This is a simplified version
  
  if (gps.date.isValid() && gps.time.isValid()) {
    char timestamp[25];
    sprintf(timestamp, "%04d-%02d-%02dT%02d:%02d:%02dZ",
            gps.date.year(),
            gps.date.month(),
            gps.date.day(),
            gps.time.hour(),
            gps.time.minute(),
            gps.time.second());
    return String(timestamp);
  }
  
  // Fallback: return current millis (not accurate, but works for testing)
  return "2025-11-17T10:30:00Z";
}

// ========== HELPER FUNCTIONS ==========

// Check WiFi connection and reconnect if needed
void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi connection lost. Reconnecting...");
    connectWiFi();
  }
}
