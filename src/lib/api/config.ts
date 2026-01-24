// API Configuration
// Use Netlify proxy if we're on Netlify to avoid CORS issues
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const USE_PROXY = isNetlify && import.meta.env.VITE_USE_PROXY !== 'false';

// For drag & drop: use direct API calls (backend must support CORS)
// For Git deployment: use Netlify Functions proxy
export const API_BASE_URL = USE_PROXY 
  ? '' // Use relative path for Netlify proxy
  : (import.meta.env.VITE_API_BASE_URL || 'https://bmc.arimodu.dev');

// Default to real API, set VITE_USE_MOCK_DATA=true to use mock data
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const API_ENDPOINTS = {
  boxes: USE_PROXY ? '/.netlify/functions/api-proxy/api/box' : '/api/box',
  boxesById: (id: string) => USE_PROXY
    ? `/.netlify/functions/api-proxy/api/box/${id}`
    : `/api/box/${id}`,
  boxesHistory: (id: string) => USE_PROXY
    ? `/.netlify/functions/api-proxy/api/box/${id}/history`
    : `/api/box/${id}/history`,
  devices: USE_PROXY ? '/.netlify/functions/api-proxy/api/device' : '/api/device',
  devicesById: (id: string) => USE_PROXY
    ? `/.netlify/functions/api-proxy/api/device/${id}`
    : `/api/device/${id}`,
} as const;

