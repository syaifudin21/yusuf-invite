import { IncomingMessage, ServerResponse } from 'http';

// Helper function to send JSON response
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

// Main handler for Vercel Serverless Function
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    sendJson(res, 200, { message: 'OK' });
    return;
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error('Missing Google Apps Script URL');
      sendJson(res, 500, { error: 'Server configuration error' });
      return;
    }

    // Call Google Apps Script Web App to get wishes
    const response = await fetch(scriptUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Apps Script error:', errorData);
      sendJson(res, 500, { error: 'Failed to fetch wishes' });
      return;
    }

    const data = await response.json();
    sendJson(res, 200, data);
  } catch (error) {
    console.error('Error fetching wishes:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}
