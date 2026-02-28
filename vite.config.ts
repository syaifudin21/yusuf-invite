import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
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
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        {
          name: 'api-middleware',
          configureServer(server) {
            // Allowed origins untuk development
            const ALLOWED_ORIGINS = [
              'http://localhost:3000',
              'http://localhost:5173',
              env.ALLOWED_ORIGIN
            ].filter(Boolean);

            server.middlewares.use('/api/submit-wish', async (req: IncomingMessage, res: ServerResponse) => {
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

              // Origin Validation (hanya untuk logging di development)
              const origin = req.headers.origin;
              if (origin && !ALLOWED_ORIGINS.includes(origin)) {
                console.warn(`Request dari origin yang tidak terdaftar: ${origin}`);
                // Di development kita tidak block, hanya logging
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
                const scriptUrl = env.GOOGLE_SCRIPT_URL;

                if (!scriptUrl) {
                  console.error('Missing Google Apps Script URL');
                  sendJson(res, 500, { error: 'Server configuration error - Please set GOOGLE_SCRIPT_URL in .env file' });
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
            });

            // GET /api/get-wishes endpoint
            server.middlewares.use('/api/get-wishes', async (req: IncomingMessage, res: ServerResponse) => {
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
                const scriptUrl = env.GOOGLE_SCRIPT_URL;

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
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
