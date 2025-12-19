// API Configuration
// Use Netlify proxy if we're on Netlify to avoid CORS issues
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const USE_PROXY = isNetlify && import.meta.env.VITE_USE_PROXY !== 'false';

// For drag & drop: use direct API calls (backend must support CORS)
// For Git deployment: use Netlify Functions proxy
export const API_BASE_URL = USE_PROXY 
  ? '' // Use relative path for Netlify proxy
  : (import.meta.env.VITE_API_BASE_URL || 'https://bmc.arimodu.dev');

// Default to mock data for easier deployment
// Set VITE_USE_MOCK_DATA=false to use real API
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';

export const API_ENDPOINTS = {
  boxes: USE_PROXY ? '/.netlify/functions/api-proxy/api/boxes' : '/api/boxes',
  boxesById: (id: string) => USE_PROXY 
    ? `/.netlify/functions/api-proxy/api/boxes/${id}` 
    : `/api/boxes/${id}`,
  boxesHistory: (id: string) => USE_PROXY
    ? `/.netlify/functions/api-proxy/api/boxes/${id}/history`
    : `/api/boxes/${id}/history`,
  devices: USE_PROXY ? '/.netlify/functions/api-proxy/api/devices' : '/api/devices',
  devicesById: (id: string) => USE_PROXY
    ? `/.netlify/functions/api-proxy/api/devices/${id}`
    : `/api/devices/${id}`,
  warehouses: USE_PROXY ? '/.netlify/functions/api-proxy/api/warehouses' : '/api/warehouses',
} as const;

