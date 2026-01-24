/**
 * Local Development Server for Vercel Function
 * 
 * This server wraps the Vercel serverless function handler
 * so it can be tested locally in Docker with the same code
 * 
 * IMPORTANT: This file is ONLY used in Docker for local development.
 * The source of truth is /api/cron-notifications.ts which is deployed to Vercel.
 * 
 * Start: npm run dev
 * Test: curl -X POST http://localhost:3001/api/cron-notifications -H "Authorization: Bearer YOUR_SECRET"
 */

import express, { Request, Response } from 'express';
import type { VercelRequest, VercelResponse } from '@vercel/node';
// Import the actual Vercel function from /api folder
import handler from '../api/cron-notifications';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

/**
 * Adapter to convert Express req/res to Vercel req/res format
 */
function createVercelRequest(req: Request): VercelRequest {
  return {
    query: req.query,
    body: req.body,
    headers: req.headers,
    method: req.method,
    url: req.url,
  } as VercelRequest;
}

function createVercelResponse(res: Response): VercelResponse {
  const vercelRes: any = {
    status: (code: number) => {
      res.status(code);
      return vercelRes;
    },
    json: (data: any) => {
      res.json(data);
      return vercelRes;
    },
    send: (data: any) => {
      res.send(data);
      return vercelRes;
    },
    redirect: (statusOrUrl: number | string, url?: string) => {
      if (typeof statusOrUrl === 'number') {
        res.redirect(statusOrUrl, url!);
      } else {
        res.redirect(statusOrUrl);
      }
      return vercelRes;
    },
    setHeader: (key: string, value: string | string[]) => {
      res.setHeader(key, value);
      return vercelRes;
    },
  };
  
  return vercelRes as VercelResponse;
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'notification-api-dev',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

/**
 * Main cron endpoint - mirrors Vercel function route
 */
app.all('/api/cron-notifications', async (req, res) => {
  try {
    const vercelReq = createVercelRequest(req);
    const vercelRes = createVercelResponse(res);
    
    await handler(vercelReq, vercelRes);
  } catch (error: any) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('🚀 Notification API server running (DEV MODE)');
  console.log(`📍 Port: ${PORT}`);
  console.log(`🔗 Endpoint: http://localhost:${PORT}/api/cron-notifications`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📂 Source: /api/cron-notifications.ts (shared with Vercel)`);
});
