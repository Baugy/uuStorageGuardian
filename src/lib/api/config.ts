// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://bmc.arimodu.dev';

// Default to real API, set VITE_USE_MOCK_DATA=true to use mock data
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Auto-login configuration (disabled by default)
export const AUTO_LOGIN = {
  enabled: import.meta.env.VITE_AUTO_LOGIN === 'true',
  username: import.meta.env.VITE_AUTO_LOGIN_USER || '',
  password: import.meta.env.VITE_AUTO_LOGIN_PASS || '',
};

export const API_ENDPOINTS = {
  boxes: '/api/box',
  boxesById: (id: string) => `/api/box/${id}`,
  boxesHistory: (id: string) => `/api/box/${id}/history`,
  devices: '/api/device',
  devicesById: (id: string) => `/api/device/${id}`,
} as const;

