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
  private userTokens: AuthTokens | null = null;
  private operatorTokens: AuthTokens | null = null;
  private currentUserType: 'user' | 'operator' | null = null;
  private readonly USER_TOKEN_KEY = 'bmc_user_tokens';
  private readonly OPERATOR_TOKEN_KEY = 'bmc_operator_tokens';
  private readonly CURRENT_USER_KEY = 'bmc_current_user';

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
      // Load user tokens
      const userStored = localStorage.getItem(this.USER_TOKEN_KEY);
      if (userStored) {
        this.userTokens = JSON.parse(userStored);
      }

      // Load operator tokens
      const operatorStored = localStorage.getItem(this.OPERATOR_TOKEN_KEY);
      if (operatorStored) {
        this.operatorTokens = JSON.parse(operatorStored);
      }

      // Load current user type
      const currentUserStored = localStorage.getItem(this.CURRENT_USER_KEY);
      if (currentUserStored) {
        this.currentUserType = JSON.parse(currentUserStored);
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error);
      // Don't clear tokens on load error - keep them in memory
    }
  }

  private saveTokens(userType: 'user' | 'operator', tokens: AuthTokens): void {
    if (userType === 'user') {
      this.userTokens = tokens;
      localStorage.setItem(this.USER_TOKEN_KEY, JSON.stringify(tokens));
    } else {
      this.operatorTokens = tokens;
      localStorage.setItem(this.OPERATOR_TOKEN_KEY, JSON.stringify(tokens));
    }
  }

  setTokens(tokens: AuthTokens, userType?: 'user' | 'operator'): void {
    // Determine user type from parameter or default to 'user'
    const detectedUserType = userType || 'user';
    this.currentUserType = detectedUserType;
    this.saveTokens(detectedUserType, tokens);
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(detectedUserType));
  }

  getAccessToken(): string | null {
    if (!this.currentUserType) return null;
    return this.currentUserType === 'user'
      ? this.userTokens?.access_token || null
      : this.operatorTokens?.access_token || null;
  }

  getTokens(userType: 'user' | 'operator'): AuthTokens | null {
    return userType === 'user' ? this.userTokens : this.operatorTokens;
  }

  // Logout doesn't clear tokens anymore - just changes authentication status
  logout(): void {
    this.currentUserType = null;
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Clear all stored tokens (for complete reset)
  clearAllTokens(): void {
    this.userTokens = null;
    this.operatorTokens = null;
    this.currentUserType = null;
    localStorage.removeItem(this.USER_TOKEN_KEY);
    localStorage.removeItem(this.OPERATOR_TOKEN_KEY);
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUserType;
  }

  getCurrentUserType(): 'user' | 'operator' | null {
    return this.currentUserType;
  }

  // Switch between user types without losing tokens
  switchUserType(userType: 'user' | 'operator'): void {
    if ((userType === 'user' && this.userTokens) || (userType === 'operator' && this.operatorTokens)) {
      this.currentUserType = userType;
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userType));
    }
  }
}

export const authManager = AuthManager.getInstance();

// Permission checking utilities
export const checkPermission = (requiredPermission: 'user' | 'operator'): boolean => {
  const currentUserType = authManager.getCurrentUserType();
  if (!currentUserType) return false;

  if (requiredPermission === 'user') {
    // Any authenticated user can access user-level permissions
    return currentUserType === 'user' || currentUserType === 'operator';
  }

  if (requiredPermission === 'operator') {
    // Only operators can access operator-level permissions
    return currentUserType === 'operator';
  }

  return false;
};

export const requirePermission = (requiredPermission: 'user' | 'operator'): void => {
  if (!checkPermission(requiredPermission)) {
    const currentUserType = authManager.getCurrentUserType();
    const userTypeText = currentUserType ? currentUserType : 'unauthenticated user';
    throw new ApiError(
      `Access denied. This operation requires ${requiredPermission} permissions. Current user type: ${userTypeText}`,
      403
    );
  }
};

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
  
  // Debug: Log the actual URL being used
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    console.log(`🌐 API Request: ${url}`);
  }

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require user-level permission for box operations
    requirePermission('user');

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
    // Require operator-level permission for device operations
    requirePermission('operator');

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
    // Require operator-level permission for device operations
    requirePermission('operator');

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
    // Require operator-level permission for device operations (unless auth is explicitly disabled)
    if (options?.requiresAuth !== false) {
      requirePermission('operator');
    }

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
    // Require operator-level permission for device operations
    requirePermission('operator');

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
    // Require operator-level permission for device operations
    requirePermission('operator');

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
  async login(credentials: LoginCredentials, userType?: 'user' | 'operator'): Promise<AuthTokens> {
    // For local development, use mock tokens if Keycloak is unavailable
    // Check if we're running on localhost (frontend origin) or if API is localhost
    const isLocalDev = (typeof window !== 'undefined' && 
                        (window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1')) ||
                       API_BASE_URL.includes('localhost') || 
                       API_BASE_URL.includes('127.0.0.1');
    
    if (isLocalDev) {
      // Generate a mock token for local development
      const mockToken = btoa(JSON.stringify({
        sub: credentials.username,
        userType: userType || (credentials.username === 'operator' ? 'operator' : 'user'),
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
        iat: Math.floor(Date.now() / 1000),
      }));
      
      const tokens: AuthTokens = {
        access_token: `mock.${mockToken}.local`,
        token_type: 'Bearer',
        expires_in: 3600,
      };
      
      authManager.setTokens(tokens, userType);
      return tokens;
    }

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
      authManager.setTokens(tokens, userType);
      return tokens;
    } catch (error) {
      // Fallback to mock tokens for local development if Keycloak fails
      // Re-check isLocalDev in case API_BASE_URL wasn't set correctly
      const isLocalDevFallback = (typeof window !== 'undefined' && 
                                  (window.location.hostname === 'localhost' || 
                                   window.location.hostname === '127.0.0.1')) ||
                                 API_BASE_URL.includes('localhost') || 
                                 API_BASE_URL.includes('127.0.0.1');
      
      if (isLocalDevFallback) {
        console.warn('Keycloak unavailable, using mock authentication for local development');
        const mockToken = btoa(JSON.stringify({
          sub: credentials.username,
          userType: userType || (credentials.username === 'operator' ? 'operator' : 'user'),
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
        }));
        
        const tokens: AuthTokens = {
          access_token: `mock.${mockToken}.local`,
          token_type: 'Bearer',
          expires_in: 3600,
        };
        
        authManager.setTokens(tokens, userType);
        return tokens;
      }
      
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error during login', 0, error);
    }
  },

  async autoLogin(): Promise<AuthTokens> {
    // Automatically login with test credentials
    return this.login({
      username: 'test',
      password: 'test',
    });
  },

  async switchToOperator(): Promise<AuthTokens> {
    // Check if operator tokens already exist
    const existingOperatorTokens = authManager.getTokens('operator');
    if (existingOperatorTokens) {
      // Just switch to operator account
      authManager.switchUserType('operator');
      return existingOperatorTokens;
    }
    
    // Login as operator if tokens don't exist
    return this.login({
      username: 'operator',
      password: 'operator',
    }, 'operator');
  },

  async switchToUser(): Promise<AuthTokens> {
    // Check if user tokens already exist
    const existingUserTokens = authManager.getTokens('user');
    if (existingUserTokens) {
      // Just switch to user account
      authManager.switchUserType('user');
      return existingUserTokens;
    }
    
    // Login as user if tokens don't exist
    return this.login({
      username: 'test',
      password: 'test',
    }, 'user');
  },

  logout(): void {
    authManager.logout();
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

