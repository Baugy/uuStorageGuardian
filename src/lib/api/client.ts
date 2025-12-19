import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';
import type { Box, Device, Measurement } from '../mockData';
import { mockBoxes, mockDevices, mockWarehouses, generateMeasurements } from '../mockData';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Simulate network delay for mock data
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  // If mock data is enabled, skip API call
  if (USE_MOCK_DATA) {
    await delay(300); // Simulate network delay
    throw new ApiError('Using mock data', 0, { useMock: true });
  }

  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }
      throw new ApiError(
        errorData.message || `API Error: ${response.statusText}`,
        response.status,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    }
    
    return response.json();
  } catch (error) {
    if (error instanceof ApiError && error.response?.useMock) {
      throw error; // Re-throw mock data flag
    }
    if (error instanceof ApiError) {
      throw error;
    }
    // Network error - will be handled by fallback in API functions
    throw new ApiError(
      error instanceof Error ? error.message : 'Network error',
      0,
      error
    );
  }
}

// Helper to transform date strings to Date objects
function transformBox(box: any): Box {
  return {
    ...box,
    lastMeasurement: typeof box.lastMeasurement === 'string' 
      ? new Date(box.lastMeasurement) 
      : box.lastMeasurement,
  };
}

// Boxes API
export const boxesApi = {
  getAll: async (): Promise<Box[]> => {
    try {
      const data = await fetchApi<Box[]>(API_ENDPOINTS.boxes);
      return data.map(transformBox);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for boxes');
        return [...mockBoxes];
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Box> => {
    try {
      const data = await fetchApi<Box>(API_ENDPOINTS.boxesById(id));
      return transformBox(data);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box:', id);
        const box = mockBoxes.find(b => b.id === id);
        if (!box) {
          throw new ApiError(`Box ${id} not found`, 404);
        }
        return { ...box };
      }
      throw error;
    }
  },

  update: async (id: string, data: Partial<Box>): Promise<Box> => {
    try {
      const result = await fetchApi<Box>(API_ENDPOINTS.boxesById(id), {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return transformBox(result);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box update:', id);
        const box = mockBoxes.find(b => b.id === id);
        if (!box) {
          throw new ApiError(`Box ${id} not found`, 404);
        }
        const updated = { ...box, ...data };
        return updated;
      }
      throw error;
    }
  },

  getHistory: async (
    id: string,
    hours?: number
  ): Promise<Measurement[]> => {
    try {
      const params = hours ? `?hours=${hours}` : '';
      const data = await fetchApi<Measurement[]>(
        `${API_ENDPOINTS.boxesHistory(id)}${params}`
      );
      // Transform dates from strings to Date objects if needed
      return data.map((m) => ({
        ...m,
        timestamp: typeof m.timestamp === 'string' ? new Date(m.timestamp) : m.timestamp,
      }));
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box history:', id);
        return generateMeasurements(id, hours || 24);
      }
      throw error;
    }
  },
};

// Helper to transform device dates
function transformDevice(device: any): Device {
  return {
    ...device,
    lastSignal: typeof device.lastSignal === 'string' 
      ? new Date(device.lastSignal) 
      : device.lastSignal,
  };
}

// Devices API
export const devicesApi = {
  getAll: async (): Promise<Device[]> => {
    try {
      const data = await fetchApi<Device[]>(API_ENDPOINTS.devices);
      return data.map(transformDevice);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for devices');
        return [...mockDevices];
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Device> => {
    try {
      const data = await fetchApi<Device>(API_ENDPOINTS.devicesById(id));
      return transformDevice(data);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for device:', id);
        const device = mockDevices.find(d => d.id === id);
        if (!device) {
          throw new ApiError(`Device ${id} not found`, 404);
        }
        return { ...device };
      }
      throw error;
    }
  },

  create: async (data: Partial<Device>): Promise<Device> => {
    try {
      const result = await fetchApi<Device>(API_ENDPOINTS.devices, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return transformDevice(result);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for device creation');
        const newDevice: Device = {
          id: data.id || `DEV-${Date.now()}`,
          name: data.name || 'New Device',
          type: data.type || 'Temperature',
          assignedBox: data.assignedBox,
          warehouse: data.warehouse || 'Warehouse A',
          status: 'online',
          batteryLevel: 100,
          lastSignal: new Date(),
        };
        mockDevices.push(newDevice);
        return newDevice;
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      return await fetchApi<void>(API_ENDPOINTS.devicesById(id), {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for device deletion:', id);
        const index = mockDevices.findIndex(d => d.id === id);
        if (index !== -1) {
          mockDevices.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  },
};

// Warehouses API
export const warehousesApi = {
  getAll: async (): Promise<string[]> => {
    try {
      return await fetchApi<string[]>(API_ENDPOINTS.warehouses);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for warehouses');
        return [...mockWarehouses];
      }
      throw error;
    }
  },
};

export { ApiError };

