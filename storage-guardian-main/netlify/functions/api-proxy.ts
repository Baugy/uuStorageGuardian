import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://bmc.arimodu.dev';

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      },
      body: '',
    };
  }

  // Get the path from the request
  const path = event.path.replace('/.netlify/functions/api-proxy', '');
  const url = `${API_BASE_URL}${path}${event.rawQuery ? `?${event.rawQuery}` : ''}`;

  try {
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: {
        'Content-Type': 'application/json',
        ...(event.body && { 'Content-Length': event.body.length.toString() }),
      },
      body: event.body || undefined,
    });

    const data = await response.text();
    const contentType = response.headers.get('content-type') || 'application/json';

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': contentType,
      },
      body: data,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };




