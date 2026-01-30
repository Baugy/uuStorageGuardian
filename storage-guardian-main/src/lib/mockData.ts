export type BoxStatus = "OK" | "WARNING" | "CRITICAL";

export interface WarehouseDto {
  id: string;
  name: string;
  description: string;
  location: string;
}

export interface BoxDto {
  id: number;
  name: string;
  description: string;
  warehouse: WarehouseDto;
  renterId: string;
  deviceId: number;
  temperature: number;
  humidity: number;
  status: BoxStatus;
  lastMeasurementDate: string; // ISO date string
  lowerHumidityLimit: number;
  upperHumidityLimit: number;
  lowerTemperatureLimit: number;
  upperTemperatureLimit: number;
}

export interface BoxListDto {
  id: number;
  name: string;
  warehouse: WarehouseDto;
  temperature: number;
  humidity: number;
  status: string;
  lastMeasurementDate: string; // ISO date string
}

export interface BoxHistoryDto {
  temperature: number;
  humidity: number;
  status: string;
  measurementDate: string; // ISO date string
}

export interface DeviceDto {
  id: number;
  name: string;
  description: string;
  boxId: number;
  lastMeasurementDate: string; // ISO date string
}

export interface DeviceListDto {
  id: number;
  name: string;
  boxId: number;
  lastMeasurementDate: string; // ISO date string
}

export interface BoxCreateDto {
  name: string;
  description: string;
  warehouseId: string;
  renterId: string;
  lowerHumidityLimit: number;
  upperHumidityLimit: number;
  lowerTemperatureLimit: number;
  upperTemperatureLimit: number;
}

export interface BoxUpdateDto {
  name?: string;
  description?: string;
  renterId?: string;
  lowerHumidityLimit?: number;
  upperHumidityLimit?: number;
  lowerTemperatureLimit?: number;
  upperTemperatureLimit?: number;
}

export interface DeviceRegisterDto {
  name: string;
  description: string;
}

export interface DeviceUpdateDto {
  name?: string;
  description?: string;
  boxId?: number;
}

export interface MeasurementDto {
  temperature: number;
  humidity: number;
  deviceId: number;
  timestamp: string; // ISO date string
}

export interface Measurement {
  timestamp: Date;
  temperature: number;
  humidity: number;
  status: BoxStatus;
  deviceId: string;
}

const mockWarehouses: WarehouseDto[] = [
  { id: "WH-A", name: "Warehouse A", description: "Main warehouse facility", location: "Building A" },
  { id: "WH-B", name: "Warehouse B", description: "Secondary warehouse", location: "Building B" },
  { id: "WH-C", name: "Warehouse C", description: "Cold storage facility", location: "Building C" },
];

export const mockBoxes: BoxListDto[] = [
  {
    id: 1,
    name: "Cold Storage 1",
    warehouse: mockWarehouses[0],
    temperature: 4.2,
    humidity: 65,
    status: "OK",
    lastMeasurementDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Dry Storage 2",
    warehouse: mockWarehouses[0],
    temperature: 22.5,
    humidity: 45,
    status: "WARNING",
    lastMeasurementDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Freezer Unit 1",
    warehouse: mockWarehouses[1],
    temperature: -22.1,
    humidity: 30,
    status: "CRITICAL",
    lastMeasurementDate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "Ambient Storage 1",
    warehouse: mockWarehouses[1],
    temperature: 20.1,
    humidity: 55,
    status: "OK",
    lastMeasurementDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "Cold Storage 2",
    warehouse: mockWarehouses[2],
    temperature: 5.8,
    humidity: 70,
    status: "OK",
    lastMeasurementDate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
];

export const mockDevices: DeviceListDto[] = [
  {
    id: 1,
    name: "Temp & Humidity Sensor A1",
    boxId: 1,
    lastMeasurementDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: "Temp & Humidity Sensor A2",
    boxId: 2,
    lastMeasurementDate: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: "Freezer Sensor B1",
    boxId: 3,
    lastMeasurementDate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  {
    id: 4,
    name: "Temperature Sensor B2",
    boxId: 4,
    lastMeasurementDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 5,
    name: "Sensor C1",
    boxId: 5,
    lastMeasurementDate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  },
  {
    id: 6,
    name: "Backup Sensor A",
    boxId: 0, // Not assigned to any box
    lastMeasurementDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const generateMeasurements = (boxId: string, hours: number = 24): BoxHistoryDto[] => {
  const measurements: BoxHistoryDto[] = [];
  const box = mockBoxes.find(b => b.id === parseInt(boxId));
  if (!box) return measurements;

  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 50; // 50 measurements

  // Use a seeded random function for consistent results
  const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < 50; i++) {
    const timestamp = new Date(now - (50 - i) * interval);
    // Use timestamp as seed for consistent random values
    const seed = timestamp.getTime() + parseInt(boxId);
    const tempVariation = (seededRandom(seed) - 0.5) * 4;
    const humidityVariation = (seededRandom(seed + 1000) - 0.5) * 10;

    const temp = box.temperature + tempVariation;
    const humidity = box.humidity + humidityVariation;

    let status: BoxStatus = "OK";
    // Simple logic to determine status based on current values
    if (Math.abs(temp - box.temperature) > 2 || Math.abs(humidity - box.humidity) > 10) {
      status = seededRandom(seed + 2000) > 0.5 ? "WARNING" : "CRITICAL";
    }

    measurements.push({
      temperature: parseFloat(temp.toFixed(1)),
      humidity: parseFloat(humidity.toFixed(1)),
      status,
      measurementDate: timestamp.toISOString(),
    });
  }

  return measurements;
};
