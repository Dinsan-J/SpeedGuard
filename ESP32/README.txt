SpeedGuard ESP32 — what YOU do (3 steps)
========================================

1) PC IP
   Open Command Prompt and run:  ipconfig
   Find "Wireless LAN adapter Wi-Fi" (or Ethernet) → IPv4 Address
   Example: 192.168.1.105

2) Edit the sketch
   File: ESP32\esp32_speedguard\esp32_speedguard.ino
   Set PC_IP to that IPv4 (step 1).
   Set WIFI_SSID and WIFI_PASSWORD.
   Set DEVICE_ID to match the IoT ID in the SpeedGuard app for your vehicle.

3) PC: allow port 5000 + run backend
   Right-click PowerShell → Run as administrator, then:
     cd path\to\SGuard\scripts
     .\allow-port-5000.ps1

   In another terminal:
     cd path\to\SGuard\Backend
     npm start

4) Arduino IDE
   File → Open → esp32_speedguard.ino
   Select your board & port → Upload.

If Serial Monitor shows "POST ... -> HTTP 200", it works.
