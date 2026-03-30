/**
 * SpeedGuard — ESP32 → your PC backend (same WiFi as the PC)
 *
 * 1) Open this file and edit ONLY the "EDIT ONLY THIS BLOCK" section below.
 * 2) Upload to your ESP32.
 * 3) On your PC: Backend folder → npm start (port 5000).
 * 4) Run scripts\allow-port-5000.ps1 once (as Administrator) if uploads still fail.
 */

#include <WiFi.h>
#include <WiFiClient.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>

// ===================== EDIT ONLY THIS BLOCK =====================
const char* WIFI_SSID = "JD";
const char* WIFI_PASSWORD = "";

// Your PC IPv4 from ipconfig (this machine: same Wi‑Fi as ESP32).
// Do NOT use "localhost" or "127.0.0.1".
const char* PC_IP = "10.74.172.215";

// Must match the IoT device ID you entered in the SpeedGuard app for this vehicle.
const char* DEVICE_ID = "ESP32_MN42TKYH";

const uint16_t SERVER_PORT = 5000;
// ===================== END EDIT =====================

TinyGPSPlus gps;
HardwareSerial SerialGPS(2);

double lastLat = 0, lastLng = 0;
double totalDistance = 0.0;

const int blueLED = 26;
const int greenLED = 25;
const int yellowLED = 27;

unsigned long lastHeartbeatMs = 0;
const unsigned long HEARTBEAT_INTERVAL_MS = 30000;

static String apiUrl(const char* path) {
  return String("http://") + PC_IP + ":" + SERVER_PORT + path;
}

double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
  const double R = 6371.0;
  lat1 = radians(lat1);
  lat2 = radians(lat2);
  lng1 = radians(lng1);
  lng2 = radians(lng2);
  double dlat = lat2 - lat1;
  double dlng = lng2 - lng1;
  double a =
      sin(dlat / 2) * sin(dlat / 2) +
      cos(lat1) * cos(lat2) * sin(dlng / 2) * sin(dlng / 2);
  double c = 2 * atan2(sqrt(a), sqrt(1 - a));
  return R * c;
}

String getTimestamp() {
  if (gps.date.isValid() && gps.time.isValid()) {
    char buf[32];
    sprintf(buf, "%04d-%02d-%02dT%02d:%02d:%02dZ",
            gps.date.year(), gps.date.month(), gps.date.day(),
            gps.time.hour(), gps.time.minute(), gps.time.second());
    return String(buf);
  }
  return String("1970-01-01T00:00:00Z");
}

bool postJson(const char* path, const String& json) {
  HTTPClient http;
  String url = apiUrl(path);
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json);
  if (code > 0) {
    Serial.printf("POST %s -> HTTP %d\n", path, code);
    if (code < 400) Serial.println(http.getString());
    else Serial.println(http.getString());
  } else {
    Serial.printf("POST %s FAILED: %s\n", path, http.errorToString(code).c_str());
  }
  http.end();
  return code >= 200 && code < 300;
}

void sendHeartbeat() {
  String json = String("{\"deviceId\":\"") + DEVICE_ID + "\"}";
  if (postJson("/api/iot/heartbeat", json)) {
    digitalWrite(yellowLED, HIGH);
    delay(100);
    digitalWrite(yellowLED, LOW);
  }
}

void sendTelemetry(double lat, double lng, double speedKmh) {
  String ts = getTimestamp();
  String json = "{";
  json += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  json += "\"speed\":" + String(speedKmh, 2) + ",";
  json += "\"latitude\":" + String(lat, 6) + ",";
  json += "\"longitude\":" + String(lng, 6) + ",";
  json += "\"timestamp\":\"" + ts + "\"";
  json += "}";
  if (postJson("/api/iot/data", json)) {
    digitalWrite(yellowLED, HIGH);
    delay(150);
    digitalWrite(yellowLED, LOW);
  }
}

void setup() {
  Serial.begin(115200);
  delay(800);
  Serial.println();
  Serial.println("=== SpeedGuard ESP32 (LAN -> PC) ===");
  Serial.print("Target API: http://");
  Serial.print(PC_IP);
  Serial.print(":");
  Serial.println(SERVER_PORT);

  SerialGPS.begin(9600, SERIAL_8N1, 16, 17);

  pinMode(blueLED, OUTPUT);
  pinMode(greenLED, OUTPUT);
  pinMode(yellowLED, OUTPUT);
  digitalWrite(blueLED, HIGH);
  digitalWrite(greenLED, LOW);
  digitalWrite(yellowLED, LOW);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("WiFi connecting");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 60000) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("WiFi OK. ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("WiFi FAILED — check SSID/password.");
  }
}

void loop() {
  while (SerialGPS.available() > 0) {
    gps.encode(SerialGPS.read());
  }

  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(greenLED, HIGH);
  } else {
    digitalWrite(greenLED, LOW);
  }

  if (WiFi.status() == WL_CONNECTED &&
      millis() - lastHeartbeatMs >= HEARTBEAT_INTERVAL_MS) {
    lastHeartbeatMs = millis();
    sendHeartbeat();
  }

  if (gps.location.isUpdated() && gps.location.isValid()) {
    double lat = gps.location.lat();
    double lng = gps.location.lng();
    double speed = gps.speed.isValid() ? gps.speed.kmph() : 0.0;
    if (speed < 3) speed = 0;

    if (lastLat != 0 && lastLng != 0 && speed > 0) {
      double dist = calculateDistance(lastLat, lastLng, lat, lng);
      if (dist > 0.005) totalDistance += dist;
    }
    lastLat = lat;
    lastLng = lng;

    Serial.printf("Lat:%.6f Lon:%.6f Spd:%.2f km/h Dist:%.2f km Sats:%d\n",
                  lat, lng, speed, totalDistance, gps.satellites.value());

    if (WiFi.status() == WL_CONNECTED) {
      sendTelemetry(lat, lng, speed);
    }
    delay(1000);
  }
}
