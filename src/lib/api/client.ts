import { API_BASE_URL, API_ENDPOINTS, USE_MOCK_DATA } from './config';
import type {
  BoxDto,
  BoxListDto,
  BoxHistoryDto,
  DeviceDto,
  DeviceListDto,
  BoxCreateDto,
  BoxUpdateDto,
  DeviceRegisterDto,
  DeviceUpdateDto,
  Measurement
} from '../mockData';
import { mockBoxes, mockDevices, generateMeasurements } from '../mockData';

// Authentication types and utilities
export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

class AuthManager {
  private static instance: AuthManager;
  private tokens: AuthTokens | null = null;
  private readonly TOKEN_KEY = 'bmc_auth_tokens';

  private constructor() {
    // Load tokens from localStorage on initialization
    this.loadTokens();
  }

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  private loadTokens(): void {
    try {
      const stored = localStorage.getItem(this.TOKEN_KEY);
      if (stored) {
        this.tokens = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
      this.clearTokens();
    }
  }

  private saveTokens(tokens: AuthTokens): void {
    this.tokens = tokens;
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify(tokens));
  }

  setTokens(tokens: AuthTokens): void {
    this.saveTokens(tokens);
  }

  getAccessToken(): string | null {
    return this.tokens?.access_token || null;
  }

  clearTokens(): void {
    this.tokens = null;
    localStorage.removeItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authManager = AuthManager.getInstance();

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
  options?: RequestInit & { requiresAuth?: boolean; useBasicAuth?: boolean }
): Promise<T> {
  // If mock data is enabled, skip API call
  if (USE_MOCK_DATA) {
    await delay(300); // Simulate network delay
    throw new ApiError('Using mock data', 0, { useMock: true });
  }

  const url = `${API_BASE_URL}${endpoint}`;

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add authentication headers based on endpoint requirements
  if (options?.requiresAuth !== false) { // Default to requiring auth
    if (endpoint.includes('/measurement')) {
      // Measurement endpoint uses Basic auth
      headers['Authorization'] = 'Basic ' + btoa('Iot_Device:fnwbL1uv0SAj');
    } else {
      // Other endpoints use Bearer auth
      const token = authManager.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
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
function transformBox(box: BoxDto): BoxDto {
  return {
    ...box,
    lastMeasurementDate: typeof box.lastMeasurementDate === 'string'
      ? box.lastMeasurementDate
      : box.lastMeasurementDate,
  };
}

// Boxes API
export const boxesApi = {
  getAll: async (filters?: {
    name?: string;
    status?: string;
    warehouseId?: string;
  }): Promise<BoxListDto[]> => {
    try {
      const params = new URLSearchParams();
      if (filters?.name) params.append('name', filters.name);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.warehouseId) params.append('warehouseId', filters.warehouseId);

      const query = params.toString();
      const endpoint = query ? `${API_ENDPOINTS.boxes}?${query}` : API_ENDPOINTS.boxes;

      const data = await fetchApi<BoxListDto[]>(endpoint);
      return data;
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for boxes');
        return [...mockBoxes];
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<BoxDto> => {
    try {
      const data = await fetchApi<BoxDto>(API_ENDPOINTS.boxesById(id.toString()));
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

  create: async (data: BoxCreateDto): Promise<BoxDto> => {
    try {
      const result = await fetchApi<BoxDto>(API_ENDPOINTS.boxes, {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return transformBox(result);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box creation');
        const newBox: BoxDto = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          warehouse: { id: data.warehouseId, name: 'Mock Warehouse', description: '', location: '' },
          renterId: data.renterId,
          deviceId: 0,
          temperature: 20,
          humidity: 50,
          status: 'OK',
          lastMeasurementDate: new Date().toISOString(),
          lowerHumidityLimit: data.lowerHumidityLimit,
          upperHumidityLimit: data.upperHumidityLimit,
          lowerTemperatureLimit: data.lowerTemperatureLimit,
          upperTemperatureLimit: data.upperTemperatureLimit,
        };
        mockBoxes.push(newBox);
        return newBox;
      }
      throw error;
    }
  },

  update: async (id: number, data: BoxUpdateDto): Promise<BoxDto> => {
    try {
      const result = await fetchApi<BoxDto>(API_ENDPOINTS.boxesById(id.toString()), {
        method: 'PATCH',
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

  delete: async (id: number): Promise<void> => {
    try {
      return await fetchApi<void>(API_ENDPOINTS.boxesById(id.toString()), {
        method: 'DELETE',
      });
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box deletion:', id);
        const index = mockBoxes.findIndex(b => b.id === id);
        if (index !== -1) {
          mockBoxes.splice(index, 1);
        }
        return;
      }
      throw error;
    }
  },

  getHistory: async (
    id: number,
    dateFrom: Date,
    dateTo: Date
  ): Promise<BoxHistoryDto[]> => {
    try {
      const params = `?dateFrom=${dateFrom.toISOString()}&dateTo=${dateTo.toISOString()}`;
      const data = await fetchApi<BoxHistoryDto[]>(
        `${API_ENDPOINTS.boxesHistory(id.toString())}${params}`
      );
      return data;
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for box history:', id);
        return generateMeasurements(id.toString(), 24);
      }
      throw error;
    }
  },
};

// Helper to transform device dates
function transformDevice(device: DeviceDto): DeviceDto {
  return {
    ...device,
    lastMeasurementDate: typeof device.lastMeasurementDate === 'string'
      ? device.lastMeasurementDate
      : device.lastMeasurementDate,
  };
}

// Devices API
export const devicesApi = {
  getAll: async (): Promise<DeviceListDto[]> => {
    try {
      const data = await fetchApi<DeviceListDto[]>(API_ENDPOINTS.devices);
      return data;
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for devices');
        return [...mockDevices];
      }
      throw error;
    }
  },

  getById: async (id: number): Promise<DeviceDto> => {
    try {
      const data = await fetchApi<DeviceDto>(API_ENDPOINTS.devicesById(id.toString()));
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

  create: async (data: DeviceRegisterDto, options?: { requiresAuth?: boolean }): Promise<DeviceDto> => {
    try {
      const result = await fetchApi<DeviceDto>(API_ENDPOINTS.devices, {
        method: 'POST',
        body: JSON.stringify(data),
        ...options,
      });
      return transformDevice(result);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for device creation');
        const newDevice: DeviceDto = {
          id: Date.now(),
          name: data.name,
          description: data.description,
          boxId: 0,
          lastMeasurementDate: new Date().toISOString(),
        };
        mockDevices.push(newDevice);
        return newDevice;
      }
      throw error;
    }
  },

  update: async (id: number, data: DeviceUpdateDto): Promise<DeviceDto> => {
    try {
      const result = await fetchApi<DeviceDto>(API_ENDPOINTS.devicesById(id.toString()), {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return transformDevice(result);
    } catch (error) {
      // Fallback to mock data if API fails or mock is enabled
      if (USE_MOCK_DATA || (error instanceof ApiError && error.status === 0)) {
        console.log('Using mock data for device update:', id);
        const device = mockDevices.find(d => d.id === id);
        if (!device) {
          throw new ApiError(`Device ${id} not found`, 404);
        }
        const updated = { ...device, ...data };
        return updated;
      }
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      return await fetchApi<void>(API_ENDPOINTS.devicesById(id.toString()), {
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

// Warehouses are included in box data, no separate API needed

// Authentication API
export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    try {
      const response = await fetch('https://keycloak.arimodu.dev/realms/box-manager/protocol/openid-connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'bmc',
          client_secret: 'Vdz7mFsKamCiHfPpHEX5rBYV97FJy0At',
          username: credentials.username,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        throw new ApiError('Login failed', response.status);
      }

      const tokens: AuthTokens = await response.json();
      authManager.setTokens(tokens);
      return tokens;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error during login', 0, error);
    }
  },

  logout(): void {
    authManager.clearTokens();
  },

  isAuthenticated(): boolean {
    return authManager.isAuthenticated();
  },
};

// Update device registration to not require auth
const devicesApi_create = devicesApi.create;
devicesApi.create = async (data: DeviceRegisterDto): Promise<DeviceDto> => {
  return devicesApi_create(data, { requiresAuth: false });
};

export { ApiError };

