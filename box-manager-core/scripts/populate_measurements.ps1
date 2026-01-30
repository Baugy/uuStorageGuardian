# Script to populate InfluxDB with sample measurements via the backend API
# This adds temperature and humidity data for boxes that have devices assigned

$apiUrl = "http://localhost:8082/api/measurement"
$auth = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes("Iot_Device:fnwbL1uv0SAj"))

# Boxes with devices and their expected temperature/humidity ranges
$boxes = @(
    @{ BoxId = 1; DeviceId = 1; Name = "Cold Storage 1"; Temp = 4.2; Humidity = 65 },
    @{ BoxId = 2; DeviceId = 2; Name = "Dry Storage 2"; Temp = 22.5; Humidity = 45 },
    @{ BoxId = 4; DeviceId = 3; Name = "Freezer Unit 1"; Temp = -22.1; Humidity = 30 },
    @{ BoxId = 6; DeviceId = 4; Name = "Freezer A"; Temp = -20.5; Humidity = 28 },
    @{ BoxId = 9; DeviceId = 5; Name = "Premium Vault 1"; Temp = 20.1; Humidity = 50 }
)

Write-Host "Adding sample measurements for boxes with devices..." -ForegroundColor Green

foreach ($box in $boxes) {
    $timestamp = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    
    $body = @{
        temperature = $box.Temp
        humidity = $box.Humidity
        deviceId = $box.DeviceId
        timestamp = $timestamp
    } | ConvertTo-Json

    try {
        $response = Invoke-WebRequest -Uri $apiUrl -Method POST `
            -Headers @{
                "Authorization" = "Basic $auth"
                "Content-Type" = "application/json"
            } `
            -Body $body `
            -ErrorAction Stop

        Write-Host "Added measurement for $($box.Name) (Box ID: $($box.BoxId), Device ID: $($box.DeviceId))" -ForegroundColor Green
    } catch {
        Write-Host "Failed to add measurement for $($box.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done! Measurements have been added to InfluxDB." -ForegroundColor Green
Write-Host "The boxes should now show temperature and humidity data in the frontend." -ForegroundColor Cyan
