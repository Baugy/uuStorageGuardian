# Script to add more devices and update assignments
# This adds variety to the device list

$containerName = "postgre-postgresql-1"

Write-Host "Adding more devices to the database..." -ForegroundColor Green

# SQL to add more devices
$sql = @"
-- Add more diverse devices
INSERT INTO bmc.t_device (name, description) VALUES 
('Wireless Sensor W1', 'Wireless temperature and humidity sensor with extended range. Wireless connectivity, battery-powered.'),
('IoT Sensor Network Node 1', 'Smart sensor node for IoT network deployment. Supports multiple protocols.'),
('Environmental Monitor E1', 'Comprehensive environmental monitoring device. Tracks temperature, humidity, air quality.'),
('Precision Sensor P1', 'High-precision temperature and humidity sensor. Accuracy: ±0.1°C, ±1% RH.'),
('Remote Sensor R1', 'Remote monitoring sensor for hard-to-reach locations. Long-range communication.'),
('Smart Sensor S1', 'AI-enabled smart sensor with predictive analytics. Machine learning capabilities.'),
('Industrial Sensor I1', 'Rugged industrial-grade sensor. IP67 rated, extreme conditions.'),
('Portable Sensor P2', 'Portable monitoring device for temporary installations. Battery-powered, easy deployment.'),
('Multi-Zone Sensor M1', 'Sensor capable of monitoring multiple zones. 8-channel monitoring.'),
('Cloud Sensor C1', 'Cloud-connected sensor with real-time sync. Direct cloud integration.')
ON CONFLICT DO NOTHING;

-- Update some existing boxes to use new devices
UPDATE bmc.t_box SET device_id = 13 WHERE id = 3 AND device_id IS NULL; -- Ambient Storage 3
UPDATE bmc.t_box SET device_id = 14 WHERE id = 5 AND device_id IS NULL; -- Cool Storage 2
UPDATE bmc.t_box SET device_id = 15 WHERE id = 7 AND device_id IS NULL; -- Cooler B
UPDATE bmc.t_box SET device_id = 16 WHERE id = 8 AND device_id IS NULL; -- Cold Storage C
UPDATE bmc.t_box SET device_id = 17 WHERE id = 10 AND device_id IS NULL; -- Premium Vault 2
UPDATE bmc.t_box SET device_id = 18 WHERE id = 11 AND device_id IS NULL; -- Archive Storage

-- Add a few more boxes for the new devices
INSERT INTO bmc.t_box (name, description, renter_id, device_id, warehouse_id, lower_humidity_limit, upper_humidity_limit, lower_temperature_limit, upper_temperature_limit) VALUES 
('Smart Storage Unit 1', 'AI-monitored storage with predictive maintenance', 'renter_012', 19, 1, 40, 60, 18, 24),
('Industrial Storage I1', 'Heavy-duty storage for industrial materials', 'renter_013', 20, 2, 30, 50, 10, 20),
('Cloud-Connected Vault', 'Cloud-monitored secure storage', 'renter_014', 22, 4, 45, 55, 20, 22)
ON CONFLICT DO NOTHING;
"@

docker exec $containerName psql -U bmc -d bmc -c $sql

Write-Host ""
Write-Host "Done! Added more devices and updated assignments." -ForegroundColor Green
Write-Host "The device list should now show more variety." -ForegroundColor Cyan
