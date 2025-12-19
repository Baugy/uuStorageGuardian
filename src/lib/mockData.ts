export type BoxStatus = "OK" | "Warning" | "Alarm";
export type DeviceStatus = "online" | "offline" | "no_data";

export interface Box {
  id: string;
  name: string;
  warehouse: string;
  tenant: string;
  currentTemp: number;
  currentHumidity: number;
  minTemp: number;
  maxTemp: number;
  minHumidity: number;
  maxHumidity: number;
  status: BoxStatus;
  lastMeasurement: Date;
  description?: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  assignedBox?: string;
  warehouse: string;
  status: DeviceStatus;
  batteryLevel: number;
  lastSignal: Date;
}

export interface Measurement {
  timestamp: Date;
  temperature: number;
  humidity: number;
  status: BoxStatus;
  deviceId: string;
}

export const mockWarehouses = [
  "Warehouse A",
  "Warehouse B",
  "Warehouse C",
];

export const mockBoxes: Box[] = [
  {
    id: "BOX-001",
    name: "Cold Storage 1",
    warehouse: "Warehouse A",
    tenant: "FreshFood Corp",
    currentTemp: 4.2,
    currentHumidity: 65,
    minTemp: 2,
    maxTemp: 8,
    minHumidity: 60,
    maxHumidity: 80,
    status: "OK",
    lastMeasurement: new Date(Date.now() - 5 * 60 * 1000),
    description: "Primary cold storage unit for perishables",
  },
  {
    id: "BOX-002",
    name: "Dry Storage 2",
    warehouse: "Warehouse A",
    tenant: "DryCo Ltd",
    currentTemp: 22.5,
    currentHumidity: 45,
    minTemp: 18,
    maxTemp: 25,
    minHumidity: 40,
    maxHumidity: 60,
    status: "Warning",
    lastMeasurement: new Date(Date.now() - 15 * 60 * 1000),
    description: "Dry goods storage",
  },
  {
    id: "BOX-003",
    name: "Freezer Unit 1",
    warehouse: "Warehouse B",
    tenant: "IceCream Inc",
    currentTemp: -22.1,
    currentHumidity: 30,
    minTemp: -25,
    maxTemp: -18,
    minHumidity: 20,
    maxHumidity: 40,
    status: "Alarm",
    lastMeasurement: new Date(Date.now() - 2 * 60 * 1000),
    description: "Frozen goods storage",
  },
  {
    id: "BOX-004",
    name: "Ambient Storage 1",
    warehouse: "Warehouse B",
    tenant: "General Storage",
    currentTemp: 20.1,
    currentHumidity: 55,
    minTemp: 15,
    maxTemp: 25,
    minHumidity: 45,
    maxHumidity: 65,
    status: "OK",
    lastMeasurement: new Date(Date.now() - 10 * 60 * 1000),
    description: "Ambient temperature storage",
  },
  {
    id: "BOX-005",
    name: "Cold Storage 2",
    warehouse: "Warehouse C",
    tenant: "FreshFood Corp",
    currentTemp: 5.8,
    currentHumidity: 70,
    minTemp: 2,
    maxTemp: 8,
    minHumidity: 60,
    maxHumidity: 80,
    status: "OK",
    lastMeasurement: new Date(Date.now() - 3 * 60 * 1000),
    description: "Secondary cold storage",
  },
];

export const mockDevices: Device[] = [
  {
    id: "DEV-TH-001",
    name: "Temp & Humidity Sensor A1",
    type: "Temperature + Humidity",
    assignedBox: "BOX-001",
    warehouse: "Warehouse A",
    status: "online",
    batteryLevel: 85,
    lastSignal: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "DEV-TH-002",
    name: "Temp & Humidity Sensor A2",
    type: "Temperature + Humidity",
    assignedBox: "BOX-002",
    warehouse: "Warehouse A",
    status: "online",
    batteryLevel: 62,
    lastSignal: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "DEV-TH-003",
    name: "Freezer Sensor B1",
    type: "Temperature + Humidity",
    assignedBox: "BOX-003",
    warehouse: "Warehouse B",
    status: "online",
    batteryLevel: 45,
    lastSignal: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: "DEV-T-004",
    name: "Temperature Sensor B2",
    type: "Temperature",
    assignedBox: "BOX-004",
    warehouse: "Warehouse B",
    status: "online",
    batteryLevel: 92,
    lastSignal: new Date(Date.now() - 10 * 60 * 1000),
  },
  {
    id: "DEV-TH-005",
    name: "Sensor C1",
    type: "Temperature + Humidity",
    assignedBox: "BOX-005",
    warehouse: "Warehouse C",
    status: "online",
    batteryLevel: 78,
    lastSignal: new Date(Date.now() - 3 * 60 * 1000),
  },
  {
    id: "DEV-TH-006",
    name: "Backup Sensor A",
    type: "Temperature + Humidity",
    warehouse: "Warehouse A",
    status: "offline",
    batteryLevel: 15,
    lastSignal: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

export const generateMeasurements = (boxId: string, hours: number = 24): Measurement[] => {
  const measurements: Measurement[] = [];
  const box = mockBoxes.find(b => b.id === boxId);
  if (!box) return measurements;

  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 50; // 50 measurements

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now - (50 - i) * interval);
    const temp = box.currentTemp + (Math.random() - 0.5) * 4;
    const humidity = box.currentHumidity + (Math.random() - 0.5) * 10;
    
    let status: BoxStatus = "OK";
    if (temp < box.minTemp || temp > box.maxTemp || humidity < box.minHumidity || humidity > box.maxHumidity) {
      status = Math.random() > 0.5 ? "Warning" : "Alarm";
    }

    measurements.push({
      timestamp,
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      status,
      deviceId: mockDevices.find(d => d.assignedBox === boxId)?.id || "UNKNOWN",
    });
  }

  return measurements;
};
