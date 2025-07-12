import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Use built-in fetch (available in Node.js 18+)
const fetch = globalThis.fetch;

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced security headers middleware
const securityHeaders = (req, res, next) => {
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Strict Transport Security (HTTPS only)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://www.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://generativelanguage.googleapis.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com",
    "frame-src 'self' https://www.google.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'"
  ].join('; '));
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', [
    'camera=self',
    'microphone=self',
    'geolocation=self',
    'payment=self',
    'usb=self'
  ].join(', '));
  
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  next();
};

// Middleware
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply security headers to all routes
app.use(securityHeaders);

// Rate limiting
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Gemini API proxy endpoint
app.post('/api/gemini', async (req, res) => {
  console.log('Received API request:', { 
    hasPrompt: !!req.body.prompt, 
    hasApiKey: !!req.body.userApiKey,
    origin: req.headers.origin 
  });
  
  try {
    const { prompt, model = 'gemini-2.5-pro', userApiKey } = req.body;
    
    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }
    
    if (prompt.length > 10000) {
      return res.status(400).json({ error: 'Prompt too long (max 10,000 characters)' });
    }

    // Only use user's API key - no server fallback
    if (!userApiKey) {
      console.error('No user API key provided');
      return res.status(400).json({ error: 'User API key is required. Please provide your Gemini API key in the frontend.' });
    }
    
    const apiKey = userApiKey;

    // Call Gemini API with retry logic
    console.log('Making request to Gemini API...'); // Removed API key logging
    
    let response;
    let retries = 3;
    let lastError;
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: prompt }]
                }
              ]
            })
          }
        );

        console.log(`Response status: ${response.status}`);
        
        if (response.ok) {
          break; // Success, exit retry loop
        }
        
        const errorData = await response.json();
        lastError = errorData;
        
        // If it's a 503 (overloaded) and we have retries left, wait and try again
        if (response.status === 503 && attempt < retries) {
          console.log(`Attempt ${attempt} failed with 503, retrying in ${attempt * 2} seconds...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 2000));
          continue;
        }
        
        // For other errors or no retries left, break
        break;
        
      } catch (error) {
        console.error(`Attempt ${attempt} failed with network error:`, error);
        lastError = { error: { message: error.message } };
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
        break;
      }
    }
    
    if (!response || !response.ok) {
      console.error('Gemini API error after retries:', lastError);
      return res.status(response?.status || 500).json({ 
        error: lastError?.error?.message || 'Failed to generate content after multiple attempts' 
      });
    }

    const data = await response.json();
    console.log('Gemini API success');
    res.json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CORS middleware handles preflight requests automatically

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API-only server - no static file serving needed
// Frontend is served by Vercel

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 