# IoT Device Integration Guide

## Overview
This guide explains how to integrate IoT devices with the SpeedGuard system to track real-time vehicle speed and location data.

## Architecture

### System Flow
1. IoT Device (GPS + Speed Sensor) → Sends data via HTTP/MQTT
2. Backend API receives and processes data
3. System checks for speed violations
4. Dashboard displays real-time data and violations

## IoT Device Setup

### Required Hardware
- GPS Module (e.g., NEO-6M, NEO-7M)
- Speed Sensor or OBD-II Interface
- Microcontroller (ESP32, Arduino with WiFi/GSM)
- Power Supply

### Device Registration
Each vehicle needs a unique IoT Device ID:
- Format: `IOT-DEVICE-XXXXX` (e.g., `IOT-DEVICE-12345`)
- Register the device ID when adding a vehicle in the system
- One device per vehicle

## API Endpoints

### 1. Send Real-Time Data
**Endpoint:** `POST /api/iot/data`

**Request Body:**
```json
{
  "iotDeviceId": "IOT-DEVICE-12345",
  "speed": 85.5,
  "location": {
    "lat": 6.9271,
    "lng": 79.8612
  },
  "timestamp": "2025-11-17T10:30:00Z"
}
```

**Response (Normal):**
```json
{
  "success": true,
  "message": "IoT data received successfully",
  "vehicle": {
    "_id": "...",
    "plateNumber": "ABC123",
    "currentSpeed": 85.5,
    "currentLocation": { "lat": 6.9271, "lng": 79.8612 }
  }
}
```

**Response (Violation Detected):**
```json
{
  "success": true,
  "message": "Speed violation detected",
  "violation": {
    "_id": "...",
    "speed": 85.5,
    "location": { "lat": 6.9271, "lng": 79.8612 },
    "timestamp": "2025-11-17T10:30:00Z"
  }
}
```

### 2. Get Real-Time Vehicle Data
**Endpoint:** `GET /api/iot/vehicle/:vehicleId`

**Response:**
```json
{
  "success": true,
  "data": {
    "currentSpeed": 65.0,
    "currentLocation": { "lat": 6.9271, "lng": 79.8612 },
    "lastUpdated": "2025-11-17T10:30:00Z",
    "iotDeviceId": "IOT-DEVICE-12345"
  }
}
```

## Sample IoT Device Code (ESP32)

### Arduino/ESP32 Example
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPS++.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://speedguard-gz70.onrender.com/api/iot/data";
const char* iotDeviceId = "IOT-DEVICE-12345";

TinyGPSPlus gps;
HardwareSerial GPS_Serial(1);

void setup() {
  Serial.begin(115200);
  GPS_Serial.begin(9600, SERIAL_8N1, 16, 17); // RX, TX pins
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("WiFi connected");
}

void loop() {
  while (GPS_Serial.available() > 0) {
    if (gps.encode(GPS_Serial.read())) {
      if (gps.location.isValid() && gps.speed.isValid()) {
        sendDataToServer(
          gps.speed.kmph(),
          gps.location.lat(),
          gps.location.lng()
        );
      }
    }
  }
  delay(5000); // Send data every 5 seconds
}

void sendDataToServer(float speed, double lat, double lng) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    String jsonData = "{";
    jsonData += "\"iotDeviceId\":\"" + String(iotDeviceId) + "\",";
    jsonData += "\"speed\":" + String(speed) + ",";
    jsonData += "\"location\":{";
    jsonData += "\"lat\":" + String(lat, 6) + ",";
    jsonData += "\"lng\":" + String(lng, 6);
    jsonData += "},";
    jsonData += "\"timestamp\":\"" + getISOTimestamp() + "\"";
    jsonData += "}";
    
    int httpResponseCode = http.POST(jsonData);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println("Response: " + response);
    } else {
      Serial.println("Error: " + String(httpResponseCode));
    }
    
    http.end();
  }
}

String getISOTimestamp() {
  // Implement timestamp generation
  return "2025-11-17T10:30:00Z";
}
```

## Testing with cURL

### Send Test Data
```bash
curl -X POST https://speedguard-gz70.onrender.com/api/iot/data \
  -H "Content-Type: application/json" \
  -d '{
    "iotDeviceId": "IOT-DEVICE-12345",
    "speed": 85.5,
    "location": {
      "lat": 6.9271,
      "lng": 79.8612
    },
    "timestamp": "2025-11-17T10:30:00Z"
  }'
```

### Get Vehicle Data
```bash
curl https://speedguard-gz70.onrender.com/api/iot/vehicle/VEHICLE_ID_HERE
```

## Security Considerations

1. **Device Authentication:** Consider adding API keys for IoT devices
2. **Data Encryption:** Use HTTPS for all communications
3. **Rate Limiting:** Implement rate limiting to prevent abuse
4. **Device Validation:** Verify device ownership before accepting data

## Troubleshooting

### Device Not Found Error
- Verify the IoT Device ID is correctly registered in the vehicle
- Check that the device ID matches exactly (case-sensitive)

### Data Not Updating
- Check WiFi/network connectivity
- Verify GPS has a valid fix
- Check server logs for errors

### Violation Not Detected
- Ensure speed limit is set correctly (default: 70 km/h)
- Verify speed data is being sent in km/h
- Check that location data is valid

## Future Enhancements

1. **MQTT Support:** Add MQTT protocol for more efficient communication
2. **Batch Updates:** Support sending multiple data points at once
3. **Device Management:** Add device status monitoring and alerts
4. **OBD-II Integration:** Direct integration with vehicle OBD-II port
5. **Offline Mode:** Queue data when offline and sync when connected
