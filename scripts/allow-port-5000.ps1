# Run PowerShell AS ADMINISTRATOR (right-click → Run as administrator)
# Allows the ESP32 on your WiFi to connect to Node on port 5000.

Write-Host "Your PC IPv4 addresses (use the Wi-Fi one in esp32_speedguard.ino as PC_IP):" -ForegroundColor Cyan
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
  Select-Object IPAddress, InterfaceAlias |
  Format-Table -AutoSize

$ruleName = "SGuard Node backend port 5000"
$existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
if ($existing) {
  Write-Host "Firewall rule already exists: $ruleName" -ForegroundColor Yellow
} else {
  try {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5000 -Profile Private
    Write-Host "Created firewall rule: $ruleName" -ForegroundColor Green
  } catch {
    Write-Host "Could not create rule (need Administrator): $($_.Exception.Message)" -ForegroundColor Red
    exit 1
  }
}

Write-Host ""
Write-Host "Test from this PC (replace IP):" -ForegroundColor Cyan
Write-Host '  Invoke-WebRequest "http://YOUR_PC_IP:5000/api/iot/devices-public" -UseBasicParsing'
Write-Host ""
