import { IncomingMessage, ServerResponse } from 'http';

// Helper function to parse JSON body
function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

// Helper function to send JSON response
function sendJson(res: ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

  // Only accept POST requests
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await parseBody(req);
    const { name, message, status, timestamp } = body;

    // Validate input
    if (!name || !message) {
      sendJson(res, 400, { error: 'Name and message are required' });
      return;
    }

    // Google Apps Script URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error('Missing Google Apps Script URL');
      sendJson(res, 500, { error: 'Server configuration error' });
      return;
    }

    // Call Google Apps Script Web App
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, message, status, timestamp }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google Apps Script error:', errorData);
      sendJson(res, 500, { error: 'Failed to save wish' });
      return;
    }

    sendJson(res, 200, { success: true, message: 'Wish saved successfully' });
  } catch (error) {
    console.error('Error saving wish:', error);
    sendJson(res, 500, { error: 'Internal server error' });
  }
}
