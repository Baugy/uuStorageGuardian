-- Seed data for development
-- This script populates the database with sample warehouses, devices, and boxes

-- Clear existing data (optional - comment out if you want to keep existing data)
-- TRUNCATE TABLE bmc.t_box CASCADE;
-- TRUNCATE TABLE bmc.t_device CASCADE;
-- TRUNCATE TABLE bmc.c_warehouse CASCADE;

-- Insert Warehouses
INSERT INTO bmc.c_warehouse (name, description, location) VALUES 
('Warehouse A', 'Main warehouse facility for general storage', 'Building A, Floor 1'),
('Warehouse B', 'Secondary warehouse for overflow storage', 'Building B, Floor 2'),
('Cold Storage Facility', 'Temperature-controlled storage for perishables', 'Building C, Basement'),
('Premium Storage', 'Climate-controlled storage for valuable items', 'Building D, Floor 3')
ON CONFLICT DO NOTHING;

-- Insert Devices
INSERT INTO bmc.t_device (name, description) VALUES 
('Temp & Humidity Sensor A1', 'Primary sensor for Warehouse A, Zone 1'),
('Temp & Humidity Sensor A2', 'Secondary sensor for Warehouse A, Zone 2'),
('Temp & Humidity Sensor B1', 'Primary sensor for Warehouse B'),
('Freezer Sensor C1', 'Temperature sensor for cold storage'),
('Ambient Sensor D1', 'Climate sensor for premium storage'),
('Backup Sensor A', 'Backup sensor for Warehouse A')
ON CONFLICT DO NOTHING;

-- Get warehouse IDs (assuming they exist or were just created)
-- Insert Boxes with proper relationships
INSERT INTO bmc.t_box (name, description, renter_id, device_id, warehouse_id, lower_humidity_limit, upper_humidity_limit, lower_temperature_limit, upper_temperature_limit) VALUES 
-- Warehouse A boxes
('Cold Storage 1', 'Refrigerated storage unit for food products', 'renter_001', 1, 1, 30, 70, 2, 8),
('Dry Storage 2', 'Dry storage for non-perishable goods', 'renter_002', 2, 1, 40, 60, 15, 25),
('Ambient Storage 3', 'Room temperature storage', 'renter_003', NULL, 1, 45, 55, 18, 22),

-- Warehouse B boxes
('Freezer Unit 1', 'Deep freeze storage unit', 'renter_004', 3, 2, 20, 40, -25, -18),
('Cool Storage 2', 'Cool storage for beverages', 'renter_005', NULL, 2, 50, 70, 4, 10),

-- Cold Storage Facility boxes
('Freezer A', 'Commercial freezer unit A', 'renter_006', 4, 3, 25, 35, -22, -15),
('Cooler B', 'Commercial cooler unit B', 'renter_007', NULL, 3, 60, 80, 0, 5),
('Cold Storage C', 'Temperature-controlled storage C', 'renter_008', NULL, 3, 55, 75, 2, 8),

-- Premium Storage boxes
('Premium Vault 1', 'Climate-controlled vault for valuable items', 'renter_009', 5, 4, 45, 55, 20, 22),
('Premium Vault 2', 'Secure storage with environmental controls', 'renter_010', NULL, 4, 40, 50, 18, 20),
('Archive Storage', 'Long-term archival storage', 'renter_011', NULL, 4, 35, 45, 15, 18)
ON CONFLICT DO NOTHING;
