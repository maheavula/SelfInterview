// API configuration for different environments
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001' 
  : 'https://selfinterview.onrender.com'; // Your actual Render URL

export const API_ENDPOINTS = {
  GEMINI: `${API_BASE_URL}/api/gemini`,
  HEALTH: `${API_BASE_URL}/api/health`,
}; 