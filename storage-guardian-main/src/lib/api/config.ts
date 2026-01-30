// API Configuration
// Use Netlify proxy if we're on Netlify to avoid CORS issues
const isNetlify = typeof window !== 'undefined' && window.location.hostname.includes('netlify.app');
const USE_PROXY = isNetlify && import.meta.env.VITE_USE_PROXY !== 'false';

// For drag & drop: use direct API calls (backend must support CORS)
// For Git deployment: use Netlify Functions proxy
// FIX: Force localhost if running on localhost (even if .env isn't loaded)
const envApiUrl = import.meta.env.VITE_API_BASE_URL;
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// If running on localhost and no env var is set, force localhost backend
export const API_BASE_URL = USE_PROXY
  ? '' // Use relative path for Netlify proxy
  : (isLocalhost ? (envApiUrl || 'http://localhost:8082') : (envApiUrl || 'https://bmc.arimodu.dev'));

// Default to real API, set VITE_USE_MOCK_DATA=true to use mock data
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Debug: Log the API configuration (always log to help debug)
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:', {
    'VITE_API_BASE_URL (env)': import.meta.env.VITE_API_BASE_URL,
    'API_BASE_URL (resolved)': API_BASE_URL,
    'USE_PROXY': USE_PROXY,
    'isNetlify': isNetlify,
    'USE_MOCK_DATA': import.meta.env.VITE_USE_MOCK_DATA,
    'All VITE_ env vars': Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')),
  });
  
  // Warn if using fallback URL
  if (API_BASE_URL === 'https://bmc.arimodu.dev' && !USE_PROXY) {
    console.error('❌ ERROR: Using fallback API URL! VITE_API_BASE_URL is not set!');
    console.error('❌ The dev server needs to be restarted after creating/updating .env file');
    console.error('❌ Steps:');
    console.error('   1. Stop the dev server (Ctrl+C)');
    console.error('   2. Make sure .env file exists with: VITE_API_BASE_URL=http://localhost:8082');
    console.error('   3. Restart: npm run dev');
  } else if (API_BASE_URL === 'http://localhost:8082') {
    console.log('✅ Using local backend:', API_BASE_URL);
  }
}

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
